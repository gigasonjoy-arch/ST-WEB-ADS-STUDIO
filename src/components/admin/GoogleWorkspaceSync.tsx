import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Database, 
  FileSpreadsheet, 
  FolderSync, 
  ExternalLink, 
  CheckCircle2, 
  RefreshCw, 
  UploadCloud, 
  Download, 
  Share2, 
  Layers, 
  ShieldCheck, 
  AlertCircle,
  HardDrive,
  Table,
  Sparkles,
  Lock,
  Unlock,
  KeyRound,
  Link as LinkIcon,
  Send,
  HelpCircle,
  Settings,
  Copy,
  Check
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { googleWorkspaceService, GoogleSheetExportResult, GoogleDriveFile } from '../../services/googleWorkspaceService';
import firebaseConfig from '../../../firebase-applet-config.json';
import { db, collection, getDocs, doc, setDoc } from '../../services/firebase';

interface GoogleWorkspaceSyncProps {
  initialSubTab?: string;
  targetElementId?: string;
}

export const GoogleWorkspaceSync: React.FC<GoogleWorkspaceSyncProps> = ({
  initialSubTab,
  targetElementId
}) => {
  const [isGoogleAuthed, setIsGoogleAuthed] = useState<boolean>(googleWorkspaceService.isAuthenticated());
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Deep-linking scroll support
  useEffect(() => {
    if (targetElementId) {
      setTimeout(() => {
        const el = document.getElementById(targetElementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-[#4A5D3B]', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-[#4A5D3B]', 'ring-offset-2');
          }, 3000);
        }
      }, 250);
    }
  }, [targetElementId]);

  // Firestore sync states
  const [firestoreStatus, setFirestoreStatus] = useState<'CONNECTED' | 'SYNCING' | 'IDLE'>('CONNECTED');
  const [cloudLeadsCount, setCloudLeadsCount] = useState<number>(0);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());

  // Google Sheets Export states
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [sheetExportResult, setSheetExportResult] = useState<GoogleSheetExportResult | null>(null);
  const [sheetExportSuccess, setSheetExportSuccess] = useState<string | null>(null);

  // Google Drive states
  const [driveFiles, setDriveFiles] = useState<GoogleDriveFile[]>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [driveFolderCreated, setDriveFolderCreated] = useState<string | null>(null);

  // Webhook and Fallback Alert inputs
  const siteSettings = storageService.getSiteSettings();
  const [webhookUrl, setWebhookUrl] = useState<string>(siteSettings.googleSheetsWebhookUrl || googleWorkspaceService.getWebhookUrl() || '');
  const [telegramToken, setTelegramToken] = useState<string>(siteSettings.fallbackTelegramToken || '');
  const [telegramChatId, setTelegramChatId] = useState<string>(siteSettings.fallbackTelegramChatId || '');
  const [fallbackEmail, setFallbackEmail] = useState<string>(siteSettings.fallbackNotificationEmail || 'sanjoybhootfm@gmail.com');
  const [fallbackEnabled, setFallbackEnabled] = useState<boolean>(siteSettings.fallbackNotificationEnabled !== false);
  
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState<string>('');
  const [customClientId, setCustomClientId] = useState<string>(googleWorkspaceService.getOAuthClientId());
  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    checkFirestoreData();
  }, []);

  const checkFirestoreData = async () => {
    try {
      setFirestoreStatus('SYNCING');
      if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('firestore_quota_exceeded') === 'true') {
        setCloudLeadsCount(storageService.getLeads().length);
        setFirestoreStatus('CONNECTED');
        return;
      }
      if (db) {
        const leadsSnap = await getDocs(collection(db, 'leads'));
        setCloudLeadsCount(leadsSnap.size);
      } else {
        setCloudLeadsCount(storageService.getLeads().length);
      }
      setFirestoreStatus('CONNECTED');
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Firestore fetch notice:', e);
      setCloudLeadsCount(storageService.getLeads().length);
      setFirestoreStatus('CONNECTED');
    }
  };

  const handleOpenInNewTab = () => {
    const directUrl = `${window.location.origin}${window.location.pathname}#admin`;
    window.open(directUrl, '_blank');
  };

  const handleConnectGoogle = async () => {
    setIsAuthorizing(true);
    setAuthError(null);
    try {
      await googleWorkspaceService.authorizeWithGoogle();
      setIsGoogleAuthed(true);
      if (googleWorkspaceService.isAuthenticated()) {
        loadDriveFiles();
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google authorization failed');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleDisconnectGoogle = () => {
    googleWorkspaceService.clearToken();
    setIsGoogleAuthed(false);
    setDriveFiles([]);
  };

  const handleApplyManualToken = () => {
    if (!manualToken.trim()) return;
    googleWorkspaceService.setAccessToken(manualToken.trim(), 3600);
    setIsGoogleAuthed(true);
    setAuthError(null);
    alert('গুগল অ্যাক্সেস টোকেন সফলভাবে সংরক্ষণ করা হয়েছে!');
    loadDriveFiles();
  };

  const handleSaveCustomClientId = () => {
    if (!customClientId.trim()) return;
    googleWorkspaceService.setOAuthClientId(customClientId.trim());
    alert('কাস্টম OAuth Client ID সফলভাবে সংরক্ষণ করা হয়েছে!');
  };

  const handleSaveWebhook = async () => {
    try {
      googleWorkspaceService.setWebhookUrl(webhookUrl);
      
      const updatedSettings = {
        ...siteSettings,
        googleSheetsWebhookUrl: webhookUrl.trim(),
        fallbackTelegramToken: telegramToken.trim(),
        fallbackTelegramChatId: telegramChatId.trim(),
        fallbackNotificationEmail: fallbackEmail.trim(),
        fallbackNotificationEnabled: fallbackEnabled
      };
      
      storageService.updateSiteSettings(updatedSettings);
      
      // Instantly sync settings to the server so the backend uses the latest configuration
      await storageService.syncAllData();
      
      setWebhookSuccess('বিকল্প লিড সিস্টেম ও নোটিফিকেশন কনফিগারেশন সফলভাবে সংরক্ষিত হয়েছে!');
      setTimeout(() => setWebhookSuccess(null), 3000);
    } catch (err: any) {
      alert('সংরক্ষণ ব্যর্থ হয়েছে: ' + err.message);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      alert('অনুগ্রহ করে আগে Webhook URL লিখুন।');
      return;
    }
    setIsTestingWebhook(true);
    setWebhookSuccess(null);
    try {
      googleWorkspaceService.setWebhookUrl(webhookUrl);
      const testLead = {
        id: 'test_' + Date.now(),
        name: 'সঞ্জয় সরকার (টেস্ট লিড)',
        whatsapp: '+8801815124970',
        businessType: 'E-commerce (TikTok Ads Testing)',
        monthlyBudget: '৫০,০০০ টাকা',
        notes: 'Google Apps Script Webhook সংযোগ পরীক্ষা সফল হয়েছে।'
      };
      await googleWorkspaceService.pushLeadViaWebhook(webhookUrl, testLead);
      setWebhookSuccess('টেস্ট ডেটা সফলভাবে Webhook-এ পাঠানো হয়েছে! আপনার Google Sheet চেক করুন।');
    } catch (e: any) {
      alert('Webhook প্রেরণে সমস্যা: ' + e.message);
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleDownloadCsv = () => {
    const leads = storageService.getLeads();
    const csvContent = googleWorkspaceService.generateLeadsCsv(leads);
    googleWorkspaceService.downloadCsvFile(csvContent, `Sonjoy_Sarkar_Leads_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportLeadsToSheets = async () => {
    if (!googleWorkspaceService.isAuthenticated()) {
      await handleConnectGoogle();
      if (!googleWorkspaceService.isAuthenticated()) return;
    }

    setIsExportingSheet(true);
    setSheetExportSuccess(null);
    try {
      const localLeads = storageService.getLeads();
      const res = await googleWorkspaceService.exportLeadsToSheet(localLeads);
      setSheetExportResult(res);
      setSheetExportSuccess(`সফলভাবে ${res.rowCount}টি লিড নিয়ে নতুন Google Sheet তৈরি হয়েছে!`);
    } catch (err: any) {
      setAuthError(err.message || 'Google Sheets-এ এক্সপোর্ট করতে সমস্যা হয়েছে।');
    } finally {
      setIsExportingSheet(false);
    }
  };

  const handleExportBenchmarksToSheets = async () => {
    if (!googleWorkspaceService.isAuthenticated()) {
      await handleConnectGoogle();
      if (!googleWorkspaceService.isAuthenticated()) return;
    }

    setIsExportingSheet(true);
    try {
      const benchmarks = storageService.getCalculatorBenchmarks();
      const res = await googleWorkspaceService.exportBenchmarksToSheet(benchmarks);
      setSheetExportResult(res);
      setSheetExportSuccess(`বেঞ্চমার্কসমূহ Google Sheet-এ সফলভাবে সংরক্ষিত হয়েছে!`);
    } catch (err: any) {
      setAuthError(err.message || 'বেঞ্চমার্ক এক্সপোর্টে সমস্যা হয়েছে।');
    } finally {
      setIsExportingSheet(false);
    }
  };

  const loadDriveFiles = async () => {
    if (!googleWorkspaceService.isAuthenticated()) return;
    setIsLoadingDrive(true);
    try {
      const files = await googleWorkspaceService.listDriveFiles(12);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleCreateDriveFolder = async () => {
    if (!googleWorkspaceService.isAuthenticated()) {
      await handleConnectGoogle();
    }
    try {
      const folder = await googleWorkspaceService.createDriveFolder();
      setDriveFolderCreated(folder.name);
      loadDriveFiles();
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleSyncAllToFirestore = async () => {
    setFirestoreStatus('SYNCING');
    try {
      if (db) {
        // 1. Sync Site Settings
        const settings = storageService.getSiteSettings();
        await setDoc(doc(db, 'siteSettings', 'global'), {
          ...settings,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // 2. Sync Benchmarks
        const benchmarks = storageService.getCalculatorBenchmarks();
        for (const b of benchmarks) {
          await setDoc(doc(db, 'benchmarks', b.id), b, { merge: true });
        }

        // 3. Sync Price Ranges
        const priceRanges = storageService.getProductPriceRanges(false);
        for (const p of priceRanges) {
          await setDoc(doc(db, 'productPriceRanges', p.id), p, { merge: true });
        }

        // 4. Sync Leads
        const localLeads = storageService.getLeads();
        for (const l of localLeads) {
          await setDoc(doc(db, 'leads', l.id), {
            id: l.id,
            name: l.name,
            phone: l.whatsapp,
            businessType: l.businessType,
            monthlyBudget: l.monthlyBudget,
            status: l.status,
            notes: l.notes,
            createdAt: l.createdAt
          }, { merge: true });
        }
      } else {
        // Safe server online DB sync
        await storageService.syncAllData();
      }

      setLastSyncTime(new Date().toLocaleTimeString());
      setFirestoreStatus('CONNECTED');
      await checkFirestoreData();
    } catch (e: any) {
      console.error('Database push notice:', e);
      setFirestoreStatus('CONNECTED');
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#E8EAE2] rounded-full text-[10px] font-bold uppercase tracking-wider text-[#4A5D3B] mb-2">
            <Cloud className="w-3.5 h-3.5" />
            <span>Cloud & Workspace Sync Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327]">
            Firebase Firestore ও Google Workspace হাব
          </h1>
          <p className="text-xs text-[#5C6652] mt-1">
            ফায়ারবেস ক্লাউড ডাটাবেস পারসিস্টেন্স, স্বয়ংক্রিয় গুগল শিটস সিঙ্ক ও গুগল ড্রাইভ ক্যাম্পেইন সম্পদ ব্যবস্থাপনা।
          </p>
        </div>

        {/* Global Connection Badge & New Tab Button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="px-3.5 py-1.5 bg-white border border-[#D9DED1] hover:bg-[#F5F1EB] rounded-2xl text-xs font-bold text-[#2C3327] flex items-center gap-1.5 transition-all shadow-2xs"
            title="গুগল অথরাইজেশন পপআপ সহজ করার জন্য নতুন ট্যাবে খুলুন"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#4A5D3B]" />
            <span>নতুন ট্যাবে খুলুন (OAuth Fix)</span>
          </button>
          
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFFFF] border border-[#D9DED1] rounded-2xl shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
            <span className="text-xs font-bold text-[#2C3327]">Firestore: Active</span>
          </div>
        </div>
      </div>

      {authError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <div>
              <span className="font-bold">অথরাইজেশন সমস্যা:</span> {authError}
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenInNewTab}
            className="px-3 py-1.5 bg-red-700 text-white rounded-xl text-[11px] font-bold shrink-0 self-start sm:self-auto"
          >
            নতুন উইন্ডোতে খুলুন
          </button>
        </div>
      )}

      {/* Grid: Firebase Firestore on Left, Google Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Firebase Firestore Status & Sync */}
        <div id="firebase-cloud-sync-card" className="bg-[#FFFFFF] p-6 sm:p-7 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#FFF8E7] border border-[#FDE3A7] flex items-center justify-center text-[#F59E0B]">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-[#2C3327]">
                    Firebase Cloud Firestore
                  </h2>
                  <div className="text-[11px] text-[#8A957F]">
                    Project: <span className="font-mono text-[#4A5D3B]">{firebaseConfig.projectId}</span>
                  </div>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E8EAE2] text-[#4A5D3B] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-[#25D366]" />
                <span>asia-southeast1</span>
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-2">
              <div className="bg-[#F5F1EB] p-3.5 rounded-2xl border border-[#D9DED1]/70">
                <div className="text-[10px] uppercase font-bold text-[#8A957F]">Database Status</div>
                <div className="text-sm font-bold text-[#2C3327] mt-0.5 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                  <span>Provisioned & Secure</span>
                </div>
              </div>

              <div className="bg-[#F5F1EB] p-3.5 rounded-2xl border border-[#D9DED1]/70">
                <div className="text-[10px] uppercase font-bold text-[#8A957F]">Leads in Firestore</div>
                <div className="text-sm font-bold text-[#4A5D3B] mt-0.5">
                  {cloudLeadsCount} Live Documents
                </div>
              </div>
            </div>

            <div className="text-xs text-[#5C6652] leading-relaxed bg-[#FDFCF8] p-3.5 rounded-2xl border border-[#D9DED1]">
              <div className="font-bold text-[#2C3327] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E2725B]" />
                <span>Offline-First Resilience & Security</span>
              </div>
              সকল লিড, বেঞ্চমার্ক, প্রাইসিং টায়ার এবং সেটিংস রিয়েল-টাইমে ফায়ারবেস ফায়ারস্টোরে সংরক্ষিত থাকে।
            </div>
          </div>

          <div className="pt-4 border-t border-[#D9DED1] flex items-center justify-between">
            <span className="text-[11px] text-[#8A957F]">
              সর্বশেষ সিঙ্ক: {lastSyncTime}
            </span>
            <button
              onClick={handleSyncAllToFirestore}
              disabled={firestoreStatus === 'SYNCING'}
              className="px-4 py-2 bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${firestoreStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              <span>{firestoreStatus === 'SYNCING' ? 'সিঙ্ক হচ্ছে...' : 'সব তথ্য Firestore-এ সিঙ্ক করুন'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Google Workspace (Sheets & Drive) Status */}
        <div id="google-sheets-sync-card" className="bg-[#FFFFFF] p-6 sm:p-7 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8F0FE] border border-[#D2E3FC] flex items-center justify-center text-[#1A73E8]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-serif font-bold text-[#2C3327]">
                    Google Workspace Integration
                  </h2>
                  <div className="text-[11px] text-[#8A957F]">
                    Google Sheets ও Google Drive সংযোগ
                  </div>
                </div>
              </div>

              {isGoogleAuthed ? (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E6F4EA] text-[#137333] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Authorized</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#FEF7E0] text-[#B06000] flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>Ready to Authorize</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#5C6652] leading-relaxed">
              গুগল শিটসে লিড এক্সপোর্ট করুন অথবা কোনো অথরাইজেশন ছাড়াই সরাসরি ১-ক্লিক CSV ডাউনলোড করুন।
            </p>

            {/* Quick Action Buttons */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadCsv}
                  className="p-3 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 rounded-2xl text-left transition-all flex items-center gap-2.5"
                >
                  <Download className="w-4 h-4 text-emerald-700 shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-emerald-900">১-ক্লিক CSV ডাউনলোড</div>
                    <div className="text-[10px] text-emerald-700">Google Sheets ও Excel ফরম্যাট</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleExportLeadsToSheets}
                  disabled={isExportingSheet}
                  className="p-3 bg-[#F5F1EB] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-all flex items-center gap-2.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#0F9D58] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#2C3327]">Create Google Sheet</div>
                    <div className="text-[10px] text-[#8A957F]">সরাসরি শিটসে এক্সপোর্ট</div>
                  </div>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleExportBenchmarksToSheets}
                  disabled={isExportingSheet}
                  className="p-3 bg-[#F5F1EB] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-all flex items-center gap-2.5"
                >
                  <Table className="w-4 h-4 text-[#1A73E8] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#2C3327]">Export Benchmarks</div>
                    <div className="text-[10px] text-[#8A957F]">TikTok & FB মেট্রিক্স শিট</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={handleCreateDriveFolder}
                  className="p-3 bg-[#F5F1EB] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-all flex items-center gap-2.5"
                >
                  <HardDrive className="w-4 h-4 text-[#EA4335] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#2C3327]">Drive Folder</div>
                    <div className="text-[10px] text-[#8A957F]">অ্যাড এসেট ফোল্ডার</div>
                  </div>
                </button>
              </div>
            </div>

            {sheetExportSuccess && (
              <div className="p-3.5 bg-[#E6F4EA] border border-[#CEEAD6] rounded-2xl text-[11px] text-[#137333] flex items-center justify-between">
                <span className="font-semibold">{sheetExportSuccess}</span>
                {sheetExportResult && (
                  <a
                    href={sheetExportResult.spreadsheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-2.5 py-1 bg-[#137333] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:bg-[#0d5926]"
                  >
                    <span>Open Sheet</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#D9DED1] flex items-center justify-between">
            {isGoogleAuthed ? (
              <>
                <span className="text-[11px] text-[#137333] font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Google Account Linked</span>
                </span>
                <button
                  onClick={handleDisconnectGoogle}
                  className="text-xs font-semibold text-[#E2725B] hover:underline"
                >
                  Disconnect Account
                </button>
              </>
            ) : (
              <div className="w-full flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={isAuthorizing}
                  className="flex-1 py-2.5 bg-[#1A73E8] hover:bg-[#1557b0] text-[#FFFFFF] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isAuthorizing ? 'Connecting to Google...' : 'Authorize Google Account'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAdvancedAuth(!showAdvancedAuth)}
                  className="p-2.5 bg-[#F5F1EB] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-xl text-[#5C6652]"
                  title="উন্নত অথরাইজেশন ও টোকেন অপশন"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Advanced Auth & Webhook Section */}
      <div className="bg-[#FFFFFF] rounded-[32px] border border-[#D9DED1] p-6 sm:p-8 shadow-xs space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D9DED1] gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <LinkIcon className="w-5 h-5 text-[#4A5D3B]" />
              <h2 className="text-base font-serif font-bold text-[#2C3327]">
                বিকল্প লিড সংগ্রহ ও রিয়েল-টাইম ফলব্যাক সিস্টেম (Zero-Friction Fallback)
              </h2>
            </div>
            <p className="text-xs text-[#5C6652]">
              ফায়ারবেস কোটা বা লিমিট শেষ হলেও ভিজিটরদের লিড যাতে মিস না হয় এবং সাথে সাথে টেলিগ্রাম ও ইমেইল নোটিফিকেশন পাওয়া যায়।
            </p>
          </div>
          <span className="self-start sm:self-auto text-[11px] text-[#4A5D3B] bg-[#E8EAE2] px-3 py-1 rounded-full font-bold">
            অ্যাক্টিভ ফলব্যাক মোড
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Fallback Configurations (8 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Part A: Google Sheets Webhook */}
            <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-[#D9DED1] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#4A5D3B] rounded-full"></span>
                  গুগল শিট Webhook URL (Google Apps Script Webhook)
                </label>
                <span className="text-[10px] text-[#8A957F] font-mono">Status: Enabled</span>
              </div>
              <p className="text-[11px] text-[#5C6652] leading-relaxed">
                আপনার গুগল স্প্রেডশিটের Apps Script Webhook লিঙ্কটি এখানে যুক্ত করুন। এটিতে কোনো জটিল OAuth ছাড়াই সরাসরি লিড ডেটা ব্যাকআপ ও রিয়েল-টাইম শিট রাইট হয়।
              </p>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-white border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-mono text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
              />
            </div>

            {/* Part B: Telegram Alerts */}
            <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-[#D9DED1] space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#1A73E8] rounded-full"></span>
                  টেলিগ্রাম নোটিফিকেশন এলার্ট (Telegram Bot Integration)
                </label>
                <div className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    id="fallback_tg_toggle"
                    checked={fallbackEnabled}
                    onChange={(e) => setFallbackEnabled(e.target.checked)}
                    className="w-3.5 h-3.5 text-[#4A5D3B] border-[#D9DED1] rounded-xs focus:ring-[#4A5D3B]"
                  />
                  <label htmlFor="fallback_tg_toggle" className="text-[10px] text-[#5C6652] font-semibold select-none cursor-pointer">
                    চালু করুন
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-[#5C6652] leading-relaxed">
                ফায়ারবেস ডাউন থাকলে বা সাধারণ অবস্থাতেও নতুন ভিজিটর লিড সাবমিট করলে সরাসরি আপনার টেলিগ্রামে ইনস্ট্যান্ট মেসেজ চলে যাবে।
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-[#5C6652] mb-1">Telegram Bot Token:</span>
                  <input
                    type="password"
                    value={telegramToken}
                    onChange={(e) => setTelegramToken(e.target.value)}
                    placeholder="5834292109:AAH_..."
                    className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-mono text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-[#5C6652] mb-1">Telegram Chat ID:</span>
                  <input
                    type="text"
                    value={telegramChatId}
                    onChange={(e) => setTelegramChatId(e.target.value)}
                    placeholder="123456789"
                    className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-mono text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                </div>
              </div>
            </div>

            {/* Part C: Fallback Email Notification */}
            <div className="bg-[#FDFCF8] p-5 rounded-2xl border border-[#D9DED1] space-y-3">
              <label className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-[#EA4335] rounded-full"></span>
                ফলব্যাক ইমেইল নোটিফিকেশন (Real-time Email Alerts)
              </label>
              <p className="text-[11px] text-[#5C6652] leading-relaxed">
                নতুন লিড এলে আপনার জিমেইলে স্বয়ংক্রিয়ভাবে এলার্ট পাঠানোর জন্য ইমেইল সেট করুন।
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="block text-[10px] font-bold text-[#5C6652] mb-1">প্রাপক ইমেইল (Notification Email):</span>
                  <input
                    type="email"
                    value={fallbackEmail}
                    onChange={(e) => setFallbackEmail(e.target.value)}
                    placeholder="sanjoybhootfm@gmail.com"
                    className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-mono text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                </div>
                <div className="flex items-end pb-1.5">
                  <span className="text-[10px] text-[#8A957F] font-semibold italic">
                    *ডিফল্ট প্রাপক: sanjoybhootfm@gmail.com
                  </span>
                </div>
              </div>
            </div>

            {/* Save & Action Buttons */}
            {webhookSuccess && (
              <div className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-300 p-3 rounded-xl font-bold animate-pulse">
                {webhookSuccess}
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleSaveWebhook}
                className="px-4 py-2.5 bg-[#4A5D3B] text-white rounded-xl text-xs font-bold hover:bg-[#3A4533] transition-colors shadow-xs"
              >
                ফলব্যাক সিস্টেম সংরক্ষণ করুন
              </button>
              
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={isTestingWebhook}
                className="px-4 py-2.5 bg-white text-[#2C3327] border border-[#D9DED1] rounded-xl text-xs font-bold hover:bg-[#F5F1EB] transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5 text-[#4A5D3B]" />
                <span>{isTestingWebhook ? 'পরীক্ষা করা হচ্ছে...' : 'টেস্ট নোটিফিকেশন পাঠান'}</span>
              </button>
            </div>

            {/* Manual Token Paste for Developers */}
            <div className="pt-4 border-t border-[#D9DED1]">
              <button
                type="button"
                onClick={() => setShowAdvancedAuth(!showAdvancedAuth)}
                className="text-xs text-[#5C6652] hover:text-[#2C3327] flex items-center gap-1 font-semibold transition-colors"
              >
                <span>{showAdvancedAuth ? '▲ কাস্টম ও ম্যানুয়াল টোকেন সেটিংস লুকান' : '▼ কাস্টম ও ম্যানুয়াল টোকেন সেটিংস দেখুন (Advanced)'}</span>
              </button>
              
              {showAdvancedAuth && (
                <div className="mt-4 p-4 bg-[#F5F1EB] rounded-2xl border border-[#D9DED1] space-y-4 animate-fadeIn">
                  <div>
                    <label className="block text-[11px] font-bold text-[#2C3327] mb-1">
                      ম্যানুয়াল গুগল অ্যাক্সেস টোকেন (Manual Access Token)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="password"
                        value={manualToken}
                        onChange={(e) => setManualToken(e.target.value)}
                        placeholder="ya29.a0Ac..."
                        className="flex-1 bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-mono text-[#2C3327]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyManualToken}
                        className="px-3.5 py-1.5 bg-[#2C3327] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                      >
                        প্রয়োগ
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#5C6652] mb-1">
                      কাস্টম Google Cloud OAuth Client ID:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customClientId}
                        onChange={(e) => setCustomClientId(e.target.value)}
                        className="flex-1 bg-white border border-[#D9DED1] rounded-xl px-3 py-1 text-[11px] font-mono text-[#2C3327]"
                      />
                      <button
                        type="button"
                        onClick={handleSaveCustomClientId}
                        className="px-3 py-1 bg-[#D9DED1] text-[#2C3327] rounded-xl text-[11px] font-bold hover:bg-[#C9CEBF]"
                      >
                        সেভ
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Google Apps Script Deploy Instruction (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-[#F5F1EB] p-5 rounded-2xl border border-[#D9DED1] space-y-4">
              <h3 className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#4A5D3B]" />
                Google Apps Script সেটাপ গাইড
              </h3>
              
              <ol className="text-[11px] text-[#5C6652] space-y-2 list-decimal pl-4 leading-relaxed">
                <li>আপনার গুগল স্প্রেডশিট খুলুন।</li>
                <li>উপরের মেনু থেকে <b>Extensions &gt; Apps Script</b>-এ যান।</li>
                <li>সেখানকার আগের সব কোড মুছে নিচের কোডটি পেস্ট করুন।</li>
                <li>ডান পাশে উপরের <b>Deploy &gt; New Deployment</b>-এ ক্লিক করুন।</li>
                <li>Select Type-এ <b>Web App</b> সিলেক্ট করুন।</li>
                <li>Who has access-এ <b>Anyone</b> সিলেক্ট করে <b>Deploy</b> করুন।</li>
                <li>প্রাপ্ত <b>Web App URL</b>-টি কপি করে বাম পাশের Webhook URL বক্সে পেস্ট করুন।</li>
              </ol>

              {/* Code Box */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#2C3327] uppercase tracking-wider">Apps Script কোড:</span>
                  <button
                    type="button"
                    onClick={() => {
                      const codeText = `/**
 * ST Web & Ads Studio - Universal Fallback Webhook
 * Paste this script into Extensions > Apps Script of your Google Sheet.
 * This handles saving leads, sending real-time Email alerts!
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Append lead to Google Sheet
    sheet.appendRow([
      new Date().toLocaleString(),
      data.name || "N/A",
      data.whatsapp || data.phone || "N/A",
      data.email || "N/A",
      data.businessType || "N/A",
      data.monthlyBudget || "N/A",
      data.notes || "N/A",
      data.calculatorSummary || "N/A",
      data.source || "Website Form"
    ]);

    // Send Free Email Alert to sanjoybhootfm@gmail.com
    var emailRecipient = "sanjoybhootfm@gmail.com";
    var subject = "🔔 New Lead Fallback Alert: " + (data.name || "Anonymous");
    var body = "Hi Sonjoy,\\n\\nA new lead has been submitted via the Fallback System (Firebase limits reached):\\n\\n" +
               "👤 Name: " + (data.name || "N/A") + "\\n" +
               "📞 WhatsApp/Phone: " + (data.whatsapp || data.phone || "N/A") + "\\n" +
               "✉️ Email: " + (data.email || "N/A") + "\\n" +
               "💼 Business Type: " + (data.businessType || "N/A") + "\\n" +
               "💰 Monthly Budget: " + (data.monthlyBudget || "N/A") + "\\n" +
               "📝 Notes: " + (data.notes || "N/A") + "\\n" +
               "📊 Details: " + (data.calculatorSummary || "N/A") + "\\n\\n" +
               "This lead has been saved in your Google Sheet: " + SpreadsheetApp.getActiveSpreadsheet().getUrl();
               
    MailApp.sendEmail(emailRecipient, subject, body);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: "Lead saved in Sheet & Email notification sent!"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
                      navigator.clipboard.writeText(codeText);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="text-[10px] text-[#4A5D3B] hover:text-[#2C3327] font-bold flex items-center gap-1 bg-white border border-[#D9DED1] px-2 py-0.5 rounded-md transition-colors"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
                
                <pre className="w-full h-36 bg-[#2C3327] text-[#D9DED1] rounded-xl p-3 text-[10px] font-mono overflow-auto leading-relaxed border border-[#2C3327]">
{`/**
 * ST Web & Ads Studio - Universal Webhook
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date().toLocaleString(),
      data.name || "N/A",
      data.whatsapp || data.phone || "N/A",
      data.email || "N/A",
      data.businessType || "N/A",
      data.monthlyBudget || "N/A",
      data.notes || "N/A",
      data.calculatorSummary || "N/A",
      data.source || "Website Form"
    ]);

    // Send Free Email Alert to sanjoybhootfm@gmail.com
    var emailRecipient = "sanjoybhootfm@gmail.com";
    var subject = "🔔 New Lead Fallback Alert: " + (data.name || "Anonymous");
    var body = "Hi Sonjoy,\\n\\nA new lead has been submitted via the Fallback System...\\n\\n";
    MailApp.sendEmail(emailRecipient, subject, body);

    return ContentService.createTextOutput(JSON.stringify({success:true})).setMimeType(ContentService.MimeType.JSON);
  } catch(e) {
    return ContentService.createTextOutput(JSON.stringify({success:false, error:e.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`}
                </pre>
              </div>

            </div>
          </div>

        </div>

      </div>

      {/* Google Drive Asset Explorer (When authorized) */}
      {isGoogleAuthed && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-[32px] border border-[#D9DED1] shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#D9DED1]">
            <div className="flex items-center gap-2.5">
              <HardDrive className="w-5 h-5 text-[#EA4335]" />
              <h2 className="text-lg font-serif font-bold text-[#2C3327]">
                Google Drive Campaign Asset Explorer
              </h2>
            </div>
            <button
              onClick={loadDriveFiles}
              disabled={isLoadingDrive}
              className="text-xs text-[#4A5D3B] font-semibold flex items-center gap-1 hover:underline"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingDrive ? 'animate-spin' : ''}`} />
              <span>Refresh Files</span>
            </button>
          </div>

          {driveFiles.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#8A957F]">
              গুগল ড্রাইভে কোনো ফাইল পাওয়া যায়নি। নতুন এসেট আপলোড বা ফোল্ডার তৈরি করতে পারেন।
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {driveFiles.map((f) => (
                <div key={f.id} className="p-3 bg-[#FDFCF8] border border-[#D9DED1] rounded-2xl space-y-2 hover:shadow-sm transition-all">
                  <div className="w-full h-24 bg-[#E8EAE2] rounded-xl flex items-center justify-center overflow-hidden">
                    {f.thumbnailLink ? (
                      <img src={f.thumbnailLink} alt={f.name} className="w-full h-full object-cover" />
                    ) : (
                      <HardDrive className="w-8 h-8 text-[#8A957F]" />
                    )}
                  </div>
                  <div className="text-xs font-bold text-[#2C3327] truncate" title={f.name}>
                    {f.name}
                  </div>
                  {f.webViewLink && (
                    <a
                      href={f.webViewLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-[#1A73E8] font-semibold flex items-center gap-1 hover:underline"
                    >
                      <span>View in Drive</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
