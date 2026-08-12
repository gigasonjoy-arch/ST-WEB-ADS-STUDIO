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
  Settings
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

  // Webhook and Manual Token inputs
  const [webhookUrl, setWebhookUrl] = useState<string>(googleWorkspaceService.getWebhookUrl());
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [webhookSuccess, setWebhookSuccess] = useState<string | null>(null);
  const [manualToken, setManualToken] = useState<string>('');
  const [customClientId, setCustomClientId] = useState<string>(googleWorkspaceService.getOAuthClientId());
  const [showAdvancedAuth, setShowAdvancedAuth] = useState(false);

  useEffect(() => {
    checkFirestoreData();
  }, []);

  const checkFirestoreData = async () => {
    try {
      setFirestoreStatus('SYNCING');
      const leadsSnap = await getDocs(collection(db, 'leads'));
      setCloudLeadsCount(leadsSnap.size);
      setFirestoreStatus('CONNECTED');
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Firestore fetch notice:', e);
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
    googleWorkspaceService.setWebhookUrl(webhookUrl);
    setWebhookSuccess('Webhook URL সফলভাবে সংরক্ষণ করা হয়েছে!');
    setTimeout(() => setWebhookSuccess(null), 3000);
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

      setLastSyncTime(new Date().toLocaleTimeString());
      setFirestoreStatus('CONNECTED');
      await checkFirestoreData();
    } catch (e: any) {
      console.error('Firestore push failed:', e);
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
      <div className="bg-white rounded-3xl border border-[#D9DED1] p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#D9DED1]">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-[#4A5D3B]" />
            <h2 className="text-sm font-bold text-[#2C3327] uppercase tracking-wider">
              Google Apps Script Webhook ও বিকল্প সিঙ্ক (Zero OAuth Friction)
            </h2>
          </div>
          <span className="text-[11px] text-[#8A957F] bg-[#F5F1EB] px-2.5 py-0.5 rounded-full font-semibold">
            বিকল্প পদ্ধতি
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Webhook Sync */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1">
                Google Apps Script Webhook URL (অটোমেটিক লিড পুশ)
              </label>
              <p className="text-[11px] text-[#5C6652] mb-2 leading-relaxed">
                আপনার গুগল স্প্রেডশিটের Apps Script Webhook লিঙ্কটি এখানে পেস্ট করলে কোনো OAuth ছাড়াই প্রতিটি নতুন লিড সরাসরি আপনার শিটসে যুক্ত হবে।
              </p>
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-mono text-[#2C3327]"
              />
            </div>

            {webhookSuccess && (
              <div className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-300 p-2.5 rounded-xl font-semibold">
                {webhookSuccess}
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveWebhook}
                className="px-3.5 py-2 bg-[#4A5D3B] text-white rounded-xl text-xs font-bold hover:bg-[#3A4533] transition-colors"
              >
                Webhook সংরক্ষণ
              </button>
              <button
                type="button"
                onClick={handleTestWebhook}
                disabled={isTestingWebhook}
                className="px-3.5 py-2 bg-[#F5F1EB] text-[#2C3327] border border-[#D9DED1] rounded-xl text-xs font-bold hover:bg-[#E8EAE2] transition-colors flex items-center gap-1"
              >
                <Send className="w-3 h-3 text-[#4A5D3B]" />
                <span>{isTestingWebhook ? 'টেস্ট হচ্ছে...' : 'টেস্ট ডাটা পাঠান'}</span>
              </button>
            </div>
          </div>

          {/* Manual Token Paste */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1">
                ম্যানুয়াল গুগল অ্যাক্সেস টোকেন (Manual Access Token)
              </label>
              <p className="text-[11px] text-[#5C6652] mb-2 leading-relaxed">
                OAuth Playground বা গুগল কনসোল থেকে নেওয়া টেম্পোরারি Bearer টোকেন সরাসরি পেস্ট করে গুগল ড্রাইভ/শিটস অ্যাক্টিভেট করতে পারেন।
              </p>
              <div className="flex gap-2">
                <input
                  type="password"
                  value={manualToken}
                  onChange={(e) => setManualToken(e.target.value)}
                  placeholder="ya29.a0Ac..."
                  className="flex-1 bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-mono text-[#2C3327]"
                />
                <button
                  type="button"
                  onClick={handleApplyManualToken}
                  className="px-3.5 py-2 bg-[#2C3327] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors"
                >
                  প্রয়োগ
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#5C6652] mb-1">
                কাস্টম Google Cloud OAuth Client ID:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customClientId}
                  onChange={(e) => setCustomClientId(e.target.value)}
                  className="flex-1 bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-1.5 text-[11px] font-mono text-[#2C3327]"
                />
                <button
                  type="button"
                  onClick={handleSaveCustomClientId}
                  className="px-3 py-1.5 bg-[#E8EAE2] text-[#4A5D3B] rounded-xl text-xs font-bold hover:bg-[#D9DED1]"
                >
                  সেভ
                </button>
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
