import firebaseConfig from '../../firebase-applet-config.json';
import { LeadSubmission, CalculatorBenchmark, MediaItem, Lead } from '../types';

export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  size?: string;
  createdTime?: string;
}

export interface GoogleSheetExportResult {
  spreadsheetId: string;
  spreadsheetUrl: string;
  rowCount: number;
}

class GoogleWorkspaceService {
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private oAuthClientId: string = (firebaseConfig as any)?.oAuthClientId || '';
  private customWebhookUrl: string = '';

  constructor() {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return;
    }
    try {
      // Load stored token if valid
      const savedToken = localStorage.getItem('st_gsuite_access_token');
      const savedExpiry = localStorage.getItem('st_gsuite_token_expiry');
      const savedWebhook = localStorage.getItem('st_gsheet_webhook_url');
      const customClientId = localStorage.getItem('st_custom_google_client_id');

      if (customClientId) {
        this.oAuthClientId = customClientId;
      }

      if (savedWebhook) {
        this.customWebhookUrl = savedWebhook;
      }

      if (savedToken && savedExpiry && Date.now() < Number(savedExpiry)) {
        this.accessToken = savedToken;
        this.tokenExpiry = Number(savedExpiry);
      }
    } catch {
      // ignore
    }
  }

  public isAuthenticated(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiry;
  }

  public getAccessToken(): string | null {
    if (this.isAuthenticated()) {
      return this.accessToken;
    }
    return null;
  }

  public getOAuthClientId(): string {
    return this.oAuthClientId;
  }

  public setOAuthClientId(clientId: string): void {
    this.oAuthClientId = clientId.trim();
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('st_custom_google_client_id', clientId.trim());
      } catch {}
    }
  }

  public getWebhookUrl(): string {
    if (this.customWebhookUrl) return this.customWebhookUrl;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        return localStorage.getItem('st_gsheet_webhook_url') || '';
      } catch {}
    }
    return '';
  }

  public setWebhookUrl(url: string): void {
    this.customWebhookUrl = url.trim();
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('st_gsheet_webhook_url', url.trim());
      } catch {}
    }
  }

  public setAccessToken(token: string, expiresInSeconds: number = 3600): void {
    this.accessToken = token.trim();
    this.tokenExpiry = Date.now() + (expiresInSeconds * 1000);
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('st_gsuite_access_token', token.trim());
        localStorage.setItem('st_gsuite_token_expiry', String(this.tokenExpiry));
      } catch {}
    }
  }

  public clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('st_gsuite_access_token');
        localStorage.removeItem('st_gsuite_token_expiry');
      } catch {}
    }
  }

  /**
   * Request OAuth Token using Google Identity Services (GIS)
   */
  public async authorizeWithGoogle(scopes: string[] = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
  ]): Promise<string> {
    return new Promise((resolve, reject) => {
      // If client is embedded in an iframe that blocks popups, provide advice
      const isInIframe = window.self !== window.top;
      
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        // Dynamically load GIS if not present
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.initAndRequestToken(scopes, resolve, reject, isInIframe);
        };
        script.onerror = () => reject(new Error('Google Identity Services (GSI) স্ক্রিপ্ট লোড করা যায়নি। অনুগ্রহ করে ইন্টারনেট সংযোগ চেক করুন।'));
        document.body.appendChild(script);
      } else {
        this.initAndRequestToken(scopes, resolve, reject, isInIframe);
      }
    });
  }

  private initAndRequestToken(
    scopes: string[], 
    resolve: (token: string) => void, 
    reject: (err: any) => void,
    isInIframe: boolean
  ) {
    try {
      const google = (window as any).google;
      const targetClientId = this.oAuthClientId || firebaseConfig.oAuthClientId;

      if (!targetClientId) {
        reject(new Error('Google OAuth Client ID পাওয়া যায়নি। অনুগ্রহ করে Settings থেকে ক্লায়েন্ট আইডি সেট করুন।'));
        return;
      }

      const client = google.accounts.oauth2.initTokenClient({
        client_id: targetClientId,
        scope: scopes.join(' '),
        callback: (response: any) => {
          if (response.error) {
            let errorMsg = response.error_description || response.error;
            if (response.error === 'popup_closed_by_user') {
              errorMsg = 'লগইন উইন্ডো বন্ধ করা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।';
            } else if (response.error === 'access_denied') {
              errorMsg = 'গুগল অ্যাকাউন্টের পারমিশন দেওয়া হয়নি।';
            } else if (response.error === 'origin_mismatch') {
              errorMsg = 'Google Cloud Console-এ বর্তমান ওয়েবসাইটের ডোমেইনটি Authorized JavaScript Origins-এ যুক্ত করতে হবে অথবা নতুন উইন্ডোতে অ্যাপ খুলুন।';
            }
            reject(new Error(errorMsg));
            return;
          }
          if (response.access_token) {
            this.setAccessToken(response.access_token, response.expires_in || 3600);
            resolve(response.access_token);
          }
        },
        error_callback: (nonOAuthErr: any) => {
          if (isInIframe) {
            reject(new Error('ব্রাউজার প্রিভিউ আইফ্রেম থেকে গুগল পপআপ ব্লক হতে পারে। দয়া করে "নতুন ট্যাবে অ্যাপ খুলুন" বাটনে ক্লিক করে চেষ্টা করুন।'));
          } else {
            reject(new Error(nonOAuthErr?.message || 'Google Auth Error'));
          }
        }
      });

      client.requestAccessToken({ prompt: 'consent' });
    } catch (e: any) {
      reject(new Error(e?.message || 'OAuth ইনিশিয়ালাইজ করতে ব্যর্থ হয়েছে।'));
    }
  }

  /**
   * Export Leads directly to a new Google Sheet
   */
  public async exportLeadsToSheet(leads: LeadSubmission[] | Lead[], sheetTitle: string = 'ST Web & Ads Studio - Leads Export'): Promise<GoogleSheetExportResult> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Google Workspace authorization required. Please connect your Google account.');
    }

    // 1. Create Spreadsheet
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `${sheetTitle} (${new Date().toLocaleDateString()})`
        },
        sheets: [
          {
            properties: {
              title: 'Leads & Inquiries',
              gridProperties: {
                frozenRowCount: 1
              }
            }
          }
        ]
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Failed to create Google Sheet');
    }

    const sheetData = await createRes.json();
    const spreadsheetId = sheetData.spreadsheetId;
    const spreadsheetUrl = sheetData.spreadsheetUrl;

    // 2. Prepare headers and rows
    const headers = [
      'Lead ID',
      'Client Name',
      'Phone / WhatsApp',
      'Email',
      'Business Category',
      'Monthly Budget',
      'Lead Status',
      'Estimated Purchases / Leads',
      'Estimated ROAS',
      'Notes & Assessment',
      'Submitted Date'
    ];

    const rows = leads.map((l: any) => [
      l.id,
      l.name,
      l.phone || l.whatsapp || 'N/A',
      l.email || 'N/A',
      l.businessType || 'N/A',
      l.monthlyBudget || 'N/A',
      l.status || 'NEW',
      l.calculatorSnapshot?.estimatedActions ? String(l.calculatorSnapshot.estimatedActions) : 'N/A',
      l.calculatorSnapshot?.estimatedROAS ? `${l.calculatorSnapshot.estimatedROAS}x` : 'N/A',
      l.notes || '',
      new Date(l.createdAt || Date.now()).toLocaleString('bn-BD')
    ]);

    const values = [headers, ...rows];

    // 3. Append Data
    const appendRes = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        values
      })
    });

    if (!appendRes.ok) {
      const err = await appendRes.json();
      throw new Error(err.error?.message || 'Failed to populate Google Sheet rows');
    }

    return {
      spreadsheetId,
      spreadsheetUrl,
      rowCount: rows.length
    };
  }

  /**
   * Export Calculator Benchmarks to Google Sheet
   */
  public async exportBenchmarksToSheet(benchmarks: CalculatorBenchmark[]): Promise<GoogleSheetExportResult> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Google Workspace authorization required.');
    }

    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: `ST Web & Ads - TikTok & FB Benchmarks (${new Date().toLocaleDateString()})`
        }
      })
    });

    if (!createRes.ok) {
      const err = await createRes.json();
      throw new Error(err.error?.message || 'Failed to create spreadsheet');
    }

    const data = await createRes.json();
    const headers = [
      'Category',
      'Platform',
      'Location',
      'Creative Format',
      'Conversion Goal',
      'Avg CPM (BDT)',
      'Avg CTR (%)',
      'Avg CVR (%)',
      'Est ROAS Range',
      'Model Confidence',
      'Active Status'
    ];

    const rows = benchmarks.map(b => [
      b.productCategory,
      b.platform,
      b.location,
      b.creativeType,
      b.conversionGoal,
      b.cpmBDT,
      `${b.ctrPercent}%`,
      `${b.cvrPercent}%`,
      `${b.estimatedRoasMin}x - ${b.estimatedRoasMax}x`,
      b.confidence,
      b.active ? 'YES' : 'NO'
    ]);

    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${data.spreadsheetId}/values/A1:append?valueInputOption=USER_ENTERED`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [headers, ...rows] })
    });

    return {
      spreadsheetId: data.spreadsheetId,
      spreadsheetUrl: data.spreadsheetUrl,
      rowCount: rows.length
    };
  }

  /**
   * Push Lead directly via Google Apps Script Webhook (Zero OAuth Setup required!)
   */
  public async pushLeadViaWebhook(webhookUrl: string, lead: any): Promise<boolean> {
    if (!webhookUrl) throw new Error('Webhook URL প্রদান করা হয়নি।');
    
    // Google Apps script webhooks accept POST with JSON
    await fetch(webhookUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        timestamp: new Date().toISOString(),
        id: lead.id,
        name: lead.name,
        phone: lead.phone || lead.whatsapp,
        email: lead.email || '',
        businessType: lead.businessType || '',
        monthlyBudget: lead.monthlyBudget || '',
        status: lead.status || 'NEW',
        notes: lead.notes || '',
        source: 'ST Web & Ads Studio'
      })
    });

    return true;
  }

  /**
   * Generate UTF-8 CSV with BOM for direct Google Sheets / Microsoft Excel Import
   */
  public generateLeadsCsv(leads: any[]): string {
    const headers = [
      'Lead ID',
      'Client Name',
      'Phone / WhatsApp',
      'Business Type',
      'Monthly Budget',
      'Status',
      'Notes',
      'Created Date'
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const lines = [
      headers.map(escapeCsv).join(','),
      ...leads.map(l => [
        escapeCsv(l.id),
        escapeCsv(l.name),
        escapeCsv(l.phone || l.whatsapp),
        escapeCsv(l.businessType),
        escapeCsv(l.monthlyBudget),
        escapeCsv(l.status),
        escapeCsv(l.notes),
        escapeCsv(new Date(l.createdAt || Date.now()).toLocaleString('en-US'))
      ].join(','))
    ];

    // Prepend UTF-8 BOM for Excel / Google Sheets Unicode compatibility
    return '\uFEFF' + lines.join('\r\n');
  }

  /**
   * Download CSV directly to client computer
   */
  public downloadCsvFile(content: string, filename: string = 'st_leads_export.csv'): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * List files from Google Drive
   */
  public async listDriveFiles(pageSize: number = 20): Promise<GoogleDriveFile[]> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Google Drive authorization required.');
    }

    const fields = 'files(id,name,mimeType,webViewLink,thumbnailLink,size,createdTime)';
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?pageSize=${pageSize}&fields=${encodeURIComponent(fields)}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to fetch files from Google Drive');
    }

    const data = await res.json();
    return data.files || [];
  }

  /**
   * Create Campaign Assets Folder on Google Drive
   */
  public async createDriveFolder(folderName: string = 'ST Web & Ads Studio - Campaign Assets'): Promise<{ id: string; name: string; webViewLink?: string }> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Google Drive authorization required.');
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        description: 'Folder for Sonjoy Sarkar marketing assets, TikTok video hooks, and client screenshots'
      })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error?.message || 'Failed to create folder on Google Drive');
    }

    return await res.json();
  }
}

export const googleWorkspaceService = new GoogleWorkspaceService();
