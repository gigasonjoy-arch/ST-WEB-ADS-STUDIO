import firebaseConfig from '../../firebase-applet-config.json';
import { LeadSubmission, CalculatorBenchmark, MediaItem } from '../types';

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
  private oAuthClientId: string = firebaseConfig.oAuthClientId || '';
  private tokenClient: any = null;

  constructor() {
    // Load stored token if valid
    const savedToken = localStorage.getItem('st_gsuite_access_token');
    const savedExpiry = localStorage.getItem('st_gsuite_token_expiry');
    if (savedToken && savedExpiry && Date.now() < Number(savedExpiry)) {
      this.accessToken = savedToken;
      this.tokenExpiry = Number(savedExpiry);
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

  public setAccessToken(token: string, expiresInSeconds: number = 3600): void {
    this.accessToken = token;
    this.tokenExpiry = Date.now() + (expiresInSeconds * 1000);
    localStorage.setItem('st_gsuite_access_token', token);
    localStorage.setItem('st_gsuite_token_expiry', String(this.tokenExpiry));
  }

  public clearToken(): void {
    this.accessToken = null;
    this.tokenExpiry = 0;
    localStorage.removeItem('st_gsuite_access_token');
    localStorage.removeItem('st_gsuite_token_expiry');
  }

  /**
   * Request OAuth Token using Google Identity Services (GIS)
   */
  public async authorizeWithGoogle(scopes: string[] = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
  ]): Promise<string> {
    return new Promise((resolve, reject) => {
      // Check if GIS script loaded
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        // Dynamically load GIS if not present
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => {
          this.initAndRequestToken(scopes, resolve, reject);
        };
        script.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.body.appendChild(script);
      } else {
        this.initAndRequestToken(scopes, resolve, reject);
      }
    });
  }

  private initAndRequestToken(scopes: string[], resolve: (token: string) => void, reject: (err: any) => void) {
    try {
      const google = (window as any).google;
      const client = google.accounts.oauth2.initTokenClient({
        client_id: this.oAuthClientId,
        scope: scopes.join(' '),
        callback: (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error));
            return;
          }
          if (response.access_token) {
            this.setAccessToken(response.access_token, response.expires_in || 3600);
            resolve(response.access_token);
          }
        }
      });
      client.requestAccessToken();
    } catch (e) {
      reject(e);
    }
  }

  /**
   * Export Leads directly to a new Google Sheet
   */
  public async exportLeadsToSheet(leads: LeadSubmission[], sheetTitle: string = 'ST Web & Ads Studio - Leads Export'): Promise<GoogleSheetExportResult> {
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
      'Interested Service',
      'Monthly Budget',
      'Lead Status',
      'Estimated Purchases / Leads',
      'Estimated ROAS',
      'Notes & Assessment',
      'Submitted Date'
    ];

    const rows = leads.map(l => [
      l.id,
      l.name,
      l.phone,
      l.email || 'N/A',
      l.businessType || 'N/A',
      l.interestedService || 'N/A',
      l.monthlyBudget || 'N/A',
      l.status,
      l.calculatorSnapshot?.estimatedActions ? String(l.calculatorSnapshot.estimatedActions) : 'N/A',
      l.calculatorSnapshot?.estimatedROAS ? `${l.calculatorSnapshot.estimatedROAS}x` : 'N/A',
      l.notes || '',
      new Date(l.createdAt).toLocaleString('en-US')
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
