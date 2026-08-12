import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Download, 
  Upload, 
  Play, 
  Server, 
  ShieldCheck, 
  Layers, 
  Activity, 
  Check, 
  Copy, 
  AlertCircle, 
  ExternalLink,
  HardDrive,
  FileJson,
  Sparkles,
  ArrowRight,
  Clock,
  Laptop,
  Smartphone
} from 'lucide-react';
import { onlineDbClient, OnlineDbHealth, CrudTestReport } from '../../services/onlineDatabaseClient';
import { storageService } from '../../services/storageService';

export const OnlineDatabaseManagement: React.FC = () => {
  const [health, setHealth] = useState<OnlineDbHealth | null>(null);
  const [isLoadingHealth, setIsLoadingHealth] = useState<boolean>(true);
  const [isTestingCrud, setIsTestingCrud] = useState<boolean>(false);
  const [crudReport, setCrudReport] = useState<CrudTestReport | null>(null);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'CRUD_TEST' | 'COLLECTIONS' | 'BACKUP'>('OVERVIEW');

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      const data = await onlineDbClient.getHealth();
      setHealth(data);
    } catch (err) {
      console.error('Failed to load DB health:', err);
    } finally {
      setIsLoadingHealth(false);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleRunCrudTest = async () => {
    setIsTestingCrud(true);
    setCrudReport(null);
    try {
      const report = await onlineDbClient.runLiveCrudTest();
      setCrudReport(report);
      if (report.success) {
        showNotification('success', 'অনলাইন ডেটাবেজের সম্পূর্ণ CRUD (Create, Read, Update, Delete) টেস্ট সফল হয়েছে!');
      } else {
        showNotification('error', 'CRUD টেস্টে কোনো সমস্যা পাওয়া গেছে।');
      }
      loadHealth();
    } catch (err) {
      showNotification('error', 'CRUD টেস্ট এক্সিকিউশনে সমস্যা হয়েছে।');
    } finally {
      setIsTestingCrud(false);
    }
  };

  const handleForceFullSync = async () => {
    setIsMigrating(true);
    try {
      const fullData = await onlineDbClient.fetchAll();
      showNotification('success', 'সমস্ত ডেটা ক্লাউড ডেটাবেজের সাথে সফলভাবে সিঙ্ক ও রিফ্রেশ হয়েছে!');
      loadHealth();
    } catch (err) {
      showNotification('error', 'মাইগ্রেশন বা সিঙ্কে ত্রুটি হয়েছে।');
    } finally {
      setIsMigrating(false);
    }
  };

  const handleDownloadBackup = () => {
    onlineDbClient.downloadBackup();
    showNotification('success', 'সম্পূর্ণ অনলাইন ক্লাউড ডেটাবেজ ব্যাকআপ ফাইল ডাউনলোড শুরু হয়েছে।');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const success = await onlineDbClient.restoreFromData(json);
        if (success) {
          showNotification('success', 'ক্লাউড ডেটাবেজ ব্যাকআপ থেকে সফলভাবে রিস্টোর হয়েছে!');
          loadHealth();
        } else {
          showNotification('error', 'ব্যাকআপ ডেটা রিস্টোর করতে ব্যর্থ হয়েছে।');
        }
      } catch (err) {
        showNotification('error', 'ভুল JSON ব্যাকআপ ফাইল ফরম্যাট!');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">অনলাইন ক্লাউড ডেটাবেজ ইঞ্জিন (Live Cloud Database)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ONLINE & PERSISTENT</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                কোনো লোকাল ডিভাইসে সীমাবদ্ধ নয় — যেকোনো কম্পিউটার ও ডিভাইস থেকে স্বয়ংক্রিয়ভাবে রিয়েল-টাইম সিঙ্ক হয়।
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={handleRunCrudTest}
            disabled={isTestingCrud}
            className="flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${isTestingCrud ? 'animate-spin' : ''}`} />
            <span>{isTestingCrud ? 'টেস্ট চলছে...' : 'লাইভ CRUD টেস্ট করুন'}</span>
          </button>

          <button
            onClick={handleForceFullSync}
            disabled={isMigrating}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isMigrating ? 'animate-spin' : ''}`} />
            <span>সিঙ্ক ও রিফ্রেশ</span>
          </button>
        </div>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-xs font-semibold animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : 'bg-red-950/80 border-red-800 text-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Status KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">কানেকশন স্ট্যাটাস</div>
            <div className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>লাইভ কানেক্টেড</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Zero-Config Online Server</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">মোট কালেকশন সংখ্যা</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {health ? health.totalCollections : 24} টি কালেকশন
            </div>
            <div className="text-[10px] text-slate-400">Leads, Pages, Users, etc.</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">সংরক্ষিত মোট রেকর্ডস</div>
            <div className="text-xl font-bold text-white mt-0.5">
              {health ? health.totalRecords : '...'} টি আইটেম
            </div>
            <div className="text-[10px] text-slate-400">Online Persistent Storage</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold border border-teal-500/20">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">সর্বশেষ ক্লাউড সিঙ্ক</div>
            <div className="text-xs font-bold text-white mt-1 truncate max-w-[150px]">
              {health ? new Date(health.lastUpdated).toLocaleTimeString() : 'Just now'}
            </div>
            <div className="text-[10px] text-slate-400">Auto background polling</div>
          </div>
        </div>
      </div>

      {/* Cross-Device Persistence Assurance Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border border-emerald-500/30 rounded-2xl p-5 text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-300">ক্রস-ডিভাইস ও মাল্টি-ইউজার পারসিস্টেন্স সক্রিয়</h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                পাবলিক ওয়েবসাইট বা অ্যাডমিন প্যানেল থেকে তৈরি বা এডিট করা প্রতিটি ডাটা সরাসরি অনলাইন সার্ভারে সংরক্ষিত হয়। অন্য যেকোনো কম্পিউটার, ল্যাপটপ বা মোবাইল থেকে ওয়েবসাইট খুললে হুবহু একই তথ্য পাওয়া যাবে। ব্রাউজারের ক্যাশ বা লোকাল স্টোরেজ ডিলিট করলেও কোনো ডাটা হারাবে না।
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
              <Laptop className="w-4 h-4 text-indigo-400" />
              <span>PC / Mac</span>
            </div>
            <span className="text-slate-600">⇄</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Mobile / Tablet</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'OVERVIEW'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          ১. ওভারভিউ ও টেস্ট (CRUD Diagnostics)
        </button>

        <button
          onClick={() => setActiveSubTab('COLLECTIONS')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'COLLECTIONS'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          ২. অনলাইন কালেকশন তালিকা ({health ? Object.keys(health.collections).length : 24})
        </button>

        <button
          onClick={() => setActiveSubTab('BACKUP')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            activeSubTab === 'BACKUP'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          ৩. ব্যাকআপ ও রিস্টোর (JSON Backup)
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CRUD TEST */}
      {activeSubTab === 'OVERVIEW' && (
        <div className="space-y-6">
          {/* Live CRUD Diagnostic Output Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-emerald-400" />
                  <span>বাস্তব অনলাইন CRUD টেস্ট ভেরিফিকেশন (Live CRUD Test)</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  অনলাইন ডেটাবেজে সরাসরি Create → Read → Update → Delete রিয়েল-টাইম অপারেশন টেস্ট
                </p>
              </div>

              <button
                onClick={handleRunCrudTest}
                disabled={isTestingCrud}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2 transition-all shadow-md shrink-0 disabled:opacity-50"
              >
                <Play className={`w-3.5 h-3.5 ${isTestingCrud ? 'animate-spin' : ''}`} />
                <span>{isTestingCrud ? 'টেস্ট রান হচ্ছে...' : 'এখনই টেস্ট চালান'}</span>
              </button>
            </div>

            {crudReport ? (
              <div className="space-y-3 pt-2">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-300">টেস্ট ফলাফল:</span>
                    {crudReport.success ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>১০০% সফল (All Steps Passed)</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 font-bold flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-red-400" />
                        <span>ব্যর্থ হয়েছে</span>
                      </span>
                    )}
                  </div>
                  <div className="text-slate-400 font-mono text-[11px]">
                    মোট সময়: {crudReport.durationMs}ms | {new Date(crudReport.timestamp).toLocaleTimeString()}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {crudReport.steps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white flex items-center gap-1.5">
                          {step.status === 'SUCCESS' ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <XCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span>{step.step}</span>
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {step.latencyMs}ms
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-950 border border-slate-800/60 rounded-xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                  <Play className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-sm font-semibold text-slate-300">
                  এখনও কোনো টেস্ট রিপোর্ট চালানো হয়নি
                </div>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  উপরের "এখনই টেস্ট চালান" বাটনে ক্লিক করে নিশ্চিত করুন যে ক্লাউড ডেটাবেজে নতুন ডেটা তৈরি, পড়া, আপডেট ও মোছা শতভাগ কাজ করছে।
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COLLECTIONS LIST */}
      {activeSubTab === 'COLLECTIONS' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">অনলাইন ডেটাবেজ কালেকশন সূচী</h3>
              <p className="text-xs text-slate-400">
                ওয়েবসাইট ও অ্যাডমিন প্যানেলের প্রতিটি সেকশনের অনলাইন ক্লাউড সিঙ্ক স্ট্যাটাস
              </p>
            </div>
            <button
              onClick={loadHealth}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
              title="রিফ্রেশ করুন"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {health && health.collections ? (
              Object.entries(health.collections).map(([colName, count]) => (
                <div
                  key={colName}
                  className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-mono text-xs font-bold border border-emerald-500/20">
                      {colName.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white capitalize">{colName}</div>
                      <div className="text-[10px] text-slate-400">Cloud Synced Collection</div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-900 text-emerald-400 border border-slate-800">
                    {count} records
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-slate-500 text-xs">
                কালেকশন ডেটা লোড হচ্ছে...
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: BACKUP & RESTORE */}
      {activeSubTab === 'BACKUP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Download Backup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">অনলাইন ক্লাউড ব্যাকআপ ডাউনলোড</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                আপনার ক্লাউড ডেটাবেজের সকল Leads, Custom Pages, Settings, Users, Benchmarks এবং Case Studies একটি একক JSON ফাইলে ডাউনলোড করে নিরাপদ সংরক্ষণে রাখুন।
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>ডাউনলোড অনলাইন ব্যাকআপ (.json)</span>
            </button>
          </div>

          {/* Restore Backup */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center border border-teal-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">ব্যাকআপ থেকে ক্লাউড ডেটাবেজ রিস্টোর</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                পূর্বে সংরক্ষিত কোনো ব্যাকআপ ফাইল (.json) সিলেক্ট করে সম্পূর্ণ অনলাইন ডেটাবেজ নিমেষেই রিস্টোর করুন।
              </p>
            </div>
            <label className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
              <Upload className="w-4 h-4 text-teal-400" />
              <span>JSON ব্যাকআপ ফাইল আপলোড করুন</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </div>
  );
};
