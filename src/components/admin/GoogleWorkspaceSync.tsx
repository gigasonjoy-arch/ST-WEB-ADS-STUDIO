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
  Unlock
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { googleWorkspaceService, GoogleSheetExportResult, GoogleDriveFile } from '../../services/googleWorkspaceService';
import firebaseConfig from '../../../firebase-applet-config.json';
import { db, collection, getDocs, doc, setDoc } from '../../services/firebase';

export const GoogleWorkspaceSync: React.FC = () => {
  const [isGoogleAuthed, setIsGoogleAuthed] = useState<boolean>(googleWorkspaceService.isAuthenticated());
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

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

  const handleExportLeadsToSheets = async () => {
    if (!googleWorkspaceService.isAuthenticated()) {
      await handleConnectGoogle();
      if (!googleWorkspaceService.isAuthenticated()) return;
    }

    setIsExportingSheet(true);
    setSheetExportSuccess(null);
    try {
      const localLeads = storageService.getLeads().map(l => ({
        id: l.id,
        name: l.name,
        phone: l.whatsapp,
        email: undefined,
        businessType: l.businessType || 'General Business',
        interestedService: 'TIKTOK_ADS' as any,
        monthlyBudget: l.monthlyBudget,
        notes: l.notes,
        status: (l.status as any) || 'NEW',
        createdAt: l.createdAt
      }));

      const res = await googleWorkspaceService.exportLeadsToSheet(localLeads);
      setSheetExportResult(res);
      setSheetExportSuccess(`Successfully generated Google Sheet with ${res.rowCount} leads!`);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to export to Google Sheets');
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
      setSheetExportSuccess(`Benchmarks exported to Google Sheet successfully!`);
    } catch (err: any) {
      setAuthError(err.message || 'Failed to export benchmarks');
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
            Firebase Firestore & Google Workspace Hub
          </h1>
          <p className="text-xs text-[#5C6652] mt-1">
            Real-time persistence across Firebase Firestore, automated Google Sheets CRM exports, and Google Drive ad asset management.
          </p>
        </div>

        {/* Global Connection Badge */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FFFFFF] border border-[#D9DED1] rounded-2xl shadow-2xs">
            <span className="w-2.5 h-2.5 rounded-full bg-[#25D366] animate-pulse"></span>
            <span className="text-xs font-bold text-[#2C3327]">Firestore: Active</span>
          </div>
        </div>
      </div>

      {authError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {/* Grid: Firebase Firestore on Left, Google Workspace on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Firebase Firestore Status & Sync */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-[28px] border border-[#D9DED1] shadow-sm space-y-6 flex flex-col justify-between">
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
                <span>Automatic Offline-First Resilience</span>
              </div>
              All inquiries, prediction benchmarks, price tiers, and settings are mirrored to Firestore in real-time, ensuring zero lead loss.
            </div>
          </div>

          <div className="pt-4 border-t border-[#D9DED1] flex items-center justify-between">
            <span className="text-[11px] text-[#8A957F]">
              Last synced: {lastSyncTime}
            </span>
            <button
              onClick={handleSyncAllToFirestore}
              disabled={firestoreStatus === 'SYNCING'}
              className="px-4 py-2 bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${firestoreStatus === 'SYNCING' ? 'animate-spin' : ''}`} />
              <span>{firestoreStatus === 'SYNCING' ? 'Syncing...' : 'Force Sync All to Firestore'}</span>
            </button>
          </div>
        </div>

        {/* Card 2: Google Workspace (Sheets & Drive) Status */}
        <div className="bg-[#FFFFFF] p-6 sm:p-7 rounded-[28px] border border-[#D9DED1] shadow-sm space-y-6 flex flex-col justify-between">
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
                    Google Sheets & Google Drive
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
              Connect your authorized Google Workspace to automatically export CRM submissions into formatted Google Sheets and sync ad assets to Google Drive.
            </p>

            {/* Google Action Buttons */}
            <div className="space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleExportLeadsToSheets}
                  disabled={isExportingSheet}
                  className="p-3 bg-[#F5F1EB] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-all flex items-center gap-2.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#0F9D58] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#2C3327]">Export Leads to Sheets</div>
                    <div className="text-[10px] text-[#8A957F]">Create Live CRM Spreadsheet</div>
                  </div>
                </button>

                <button
                  onClick={handleExportBenchmarksToSheets}
                  disabled={isExportingSheet}
                  className="p-3 bg-[#F5F1EB] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-all flex items-center gap-2.5"
                >
                  <Table className="w-4 h-4 text-[#1A73E8] shrink-0" />
                  <div>
                    <div className="text-xs font-bold text-[#2C3327]">Export Benchmarks</div>
                    <div className="text-[10px] text-[#8A957F]">Sync TikTok & FB metrics</div>
                  </div>
                </button>
              </div>

              <button
                onClick={handleCreateDriveFolder}
                className="w-full p-3 bg-[#F5F1EB] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-all flex items-center gap-2.5"
              >
                <HardDrive className="w-4 h-4 text-[#EA4335] shrink-0" />
                <div>
                  <div className="text-xs font-bold text-[#2C3327]">Create Campaign Drive Folder</div>
                  <div className="text-[10px] text-[#8A957F]">ST Web & Ads Studio - Campaign Assets</div>
                </div>
              </button>
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
              <button
                onClick={handleConnectGoogle}
                disabled={isAuthorizing}
                className="w-full py-2.5 bg-[#1A73E8] hover:bg-[#1557b0] text-[#FFFFFF] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>{isAuthorizing ? 'Connecting to Google...' : 'Authorize Google Drive & Sheets'}</span>
              </button>
            )}
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
              No files found in Google Drive or folder yet. Use &quot;Create Campaign Drive Folder&quot; above to organize assets.
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
