import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Calculator, 
  HelpCircle, 
  AlertCircle, 
  MessageSquare, 
  BarChart3, 
  Settings, 
  LogOut, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Database, 
  Layers, 
  Cloud, 
  ArrowRight, 
  Tag, 
  User, 
  Bot,
  Palette,
  Globe,
  Film,
  Network,
  Shield,
  UserCheck,
  CloudLightning,
  CheckCircle2,
  Check,
  Share2,
  FileCode
} from 'lucide-react';
import { AdminTab, SiteSettings, AdminTask } from '../../types';
import { AdminTaskSuggestionDrawer } from './AdminTaskSuggestionDrawer';
import { AdminAiAssistantDrawer } from './AdminAiAssistantDrawer';
import { AutomationTaskService } from '../../services/automationTaskService';
import { storageService } from '../../services/storageService';
import { onlineDbClient } from '../../services/onlineDatabaseClient';
import { db } from '../../services/firebase';

interface AdminLayoutProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab, params?: any) => void;
  onLogout: () => void;
  onReturnToSite: () => void;
  settings: SiteSettings;
  unreadLeadsCount: number;
  unresolvedGapsCount: number;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  onSelectTab,
  onLogout,
  onReturnToSite,
  settings,
  unreadLeadsCount,
  unresolvedGapsCount,
  children
}) => {
  const [isTaskDrawerOpen, setIsTaskDrawerOpen] = useState<boolean>(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isCloudSaving, setIsCloudSaving] = useState<boolean>(false);
  const [cloudSaveSuccess, setCloudSaveSuccess] = useState<boolean>(false);
  const [cloudToastMessage, setCloudToastMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('এখনই সিঙ্কড');

  const isDbActive = Boolean(db);

  const [tasks, setTasks] = useState<AdminTask[]>(() => {
    return AutomationTaskService.generateTasks({
      leads: storageService.getLeads(),
      knowledgeGaps: storageService.getKnowledgeGaps(),
      conversations: storageService.getAIConversations(),
      caseStudies: storageService.getCaseStudies(true),
      benchmarks: storageService.getBenchmarks(true),
      priceRanges: storageService.getProductPriceRanges(),
      siteSettings: settings,
      isFirebaseWorking: isDbActive,
      firebaseErrorDetails: isDbActive ? undefined : 'Firestore database is connecting...'
    });
  });

  const handleRefreshTasks = () => {
    setIsScanning(true);
    setTimeout(() => {
      const refreshed = AutomationTaskService.generateTasks({
        leads: storageService.getLeads(),
        knowledgeGaps: storageService.getKnowledgeGaps(),
        conversations: storageService.getAIConversations(),
        caseStudies: storageService.getCaseStudies(true),
        benchmarks: storageService.getBenchmarks(true),
        priceRanges: storageService.getProductPriceRanges(),
        siteSettings: storageService.getSiteSettings(),
        isFirebaseWorking: isDbActive,
        firebaseErrorDetails: isDbActive ? undefined : 'Firestore database is connecting...'
      });
      setTasks(refreshed);
      setIsScanning(false);
    }, 400);
  };

  useEffect(() => {
    handleRefreshTasks();
  }, [activeTab, unreadLeadsCount, unresolvedGapsCount]);

  const handleFloatingCloudSave = async () => {
    if (isCloudSaving) return;
    setIsCloudSaving(true);
    try {
      // 1. Flush queued changes immediately
      await onlineDbClient.flushPendingSync();
      // 2. Full synchronization of all collections to Firestore and online database
      const success = await storageService.syncAllDataToCloud();

      if (success) {
        setCloudSaveSuccess(true);
        const timeStr = new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        setLastSyncTime(timeStr);
        setCloudToastMessage('আপনার সকল পেজ, সেটিংস, মিডিয়া ও ডেটা সফলভাবে অনলাইন ক্লাউড ডেটাবেজে সংরক্ষিত হয়েছে!');
        setTimeout(() => setCloudSaveSuccess(false), 3500);
        setTimeout(() => setCloudToastMessage(null), 4500);
      } else {
        setCloudToastMessage('ক্লাউড ডেটাবেজে সেভ করতে সাময়িক সমস্যা হয়েছে। ইন্টারনেট কানেকশন চেক করুন।');
        setTimeout(() => setCloudToastMessage(null), 4500);
      }
    } catch (err) {
      setCloudToastMessage('ক্লাউড সিঙ্ক ব্যর্থ হয়েছে।');
      setTimeout(() => setCloudToastMessage(null), 4500);
    } finally {
      setIsCloudSaving(false);
    }
  };

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ComponentType<any>; badge?: number }> = [
    { id: 'DASHBOARD', label: 'ওভারভিউ ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'ONLINE_DATABASE', label: 'অনলাইন ক্লাউড ডাটাবেজ (Cloud DB)', icon: Database },
    { id: 'USERS', label: 'ইউজার ম্যানেজমেন্ট ও এক্সেস (Users & Security)', icon: Shield },
    { id: 'THEME_COLORS', label: 'থিম ও কালার ইঞ্জিন (Colors & Theme)', icon: Palette },
    { id: 'MEDIA', label: 'মিডিয়া হাব (ইমেজ, ইউটিউব ও টিকটক)', icon: Film },
    { id: 'PAGES', label: 'পেজ ও কনটেন্ট রুলস (Custom Pages)', icon: Layers },
    { id: 'PROFILE', label: 'প্রোফাইল ও ব্র্যান্ডিং (Profile Edit)', icon: User },
    { id: 'SOCIAL_MEDIA', label: 'সোশ্যাল মিডিয়া লিঙ্ক (Social Links)', icon: Share2 },
    { id: 'LEADS', label: 'লিড ও ক্লায়েন্ট CRM', icon: Users, badge: unreadLeadsCount },
    { id: 'WORKSPACE_SYNC', label: 'ক্লাউড ও ওয়ার্কস্পেস (Drive & Sheets)', icon: Cloud },
    { id: 'CASE_STUDIES', label: 'কেস স্টাডি ও প্রুফ', icon: FileText },
    { id: 'CALCULATOR_BENCHMARKS', label: 'ক্যালকুলেটর বেঞ্চমার্ক', icon: Calculator },
    { id: 'KNOWLEDGE_BASE', label: 'নলেজ বেস (AI গ্রাউন্ডিং)', icon: HelpCircle },
    { id: 'KNOWLEDGE_GAPS', label: 'অজানা প্রশ্ন (Knowledge Gaps)', icon: AlertCircle, badge: unresolvedGapsCount },
    { id: 'AI_CONVERSATIONS', label: 'এআই চ্যাট হিস্ট্রি ও ট্রেন্ড', icon: MessageSquare },
    { id: 'ANALYTICS', label: 'ভিজিটর ও ফানেল অ্যানালিটিক্স', icon: BarChart3 },
    { id: 'GTM_TRACKING', label: 'GTM ও পিক্সেল ট্র্যাকিং (GTM & Pixels)', icon: Tag },
    { id: 'SCHEMA_MARKUP', label: 'স্কিমা মার্কআপ (Schema JSON-LD)', icon: FileCode },
    { id: 'FIREBASE_STATUS', label: 'ডাটাবেস কানেকশন (Firebase Cloud)', icon: Database },
    { id: 'ROBOTS_TXT', label: 'রোবটস টেক্সট (Robots.txt SEO)', icon: Bot },
    { id: 'SITEMAP', label: 'এক্সএমএল সাইটম্যাপ (Sitemap.xml)', icon: Network },
    { id: 'SETTINGS', label: 'সাইট ও সিস্টেম সেটিংস', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F5F1EB] flex flex-col md:flex-row text-[#2C3327] relative">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-[#E8EAE2] border-r border-[#D9DED1] flex flex-col justify-between shrink-0 p-5">
        <div>
          
          {/* Top Admin Branding */}
          <div className="flex items-center gap-3 pb-6 border-b border-[#D9DED1]">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center font-serif text-lg font-bold shadow-xs">
              ST
            </div>
            <div>
              <div className="font-serif text-base font-bold text-[#2C3327]">
                Admin Studio
              </div>
              <div className="text-[11px] text-[#5C6652] flex items-center gap-1 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-[#25D366]"></span>
                <span>{settings.personalName} (Super Admin)</span>
              </div>
            </div>
          </div>

          {/* Quick Action Hub (Live Site + Cloud Save + AI Assistant + Tasks) */}
          <div className="py-4 space-y-2">
            {/* Direct Instant Cloud Save in Sidebar */}
            <button
              onClick={handleFloatingCloudSave}
              disabled={isCloudSaving}
              className={`w-full ${
                cloudSaveSuccess 
                  ? 'bg-emerald-700 text-white' 
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              } px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-all shadow-sm group disabled:opacity-75`}
              title="বর্তমান সকল পরিবর্তন সরাসরি গুগল ক্লাউড ডেটাবেজে সেভ করুন"
            >
              <span className="flex items-center gap-2">
                <CloudLightning className={`w-4 h-4 text-emerald-200 ${isCloudSaving ? 'animate-spin' : 'group-hover:scale-110 transition-transform'}`} />
                <span>
                  {isCloudSaving ? 'ক্লাউডে সেভ হচ্ছে...' : cloudSaveSuccess ? '✓ ক্লাউডে সেভ হয়েছে' : 'এখনই ক্লাউডে সেভ করুন'}
                </span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                <span className="text-[9px] font-semibold opacity-90">LIVE</span>
              </span>
            </button>

            <button
              onClick={onReturnToSite}
              className="w-full bg-[#FFFFFF] hover:bg-[#FDFCF8] text-[#4A5D3B] border border-[#D9DED1] px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5" />
                <span>লাইভ ওয়েবসাইট দেখুন</span>
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-[#8A957F]" />
            </button>

            {/* Admin AI Assistant Trigger */}
            <button
              onClick={() => setIsAiAssistantOpen(true)}
              className="w-full bg-[#2C3327] hover:bg-[#1f241b] text-[#FDFCF8] px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs group"
            >
              <span className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-12 transition-transform" />
                <span>Admin AI Assistant</span>
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-[#4A5D3B] text-white">
                AI Help
              </span>
            </button>

            {/* Smart Task Suggestion Trigger Button */}
            <button
              onClick={() => setIsTaskDrawerOpen(true)}
              className="w-full bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors shadow-2xs"
            >
              <span className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>টাস্ক সাজেশন প্যানেল</span>
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E2725B] text-white">
                {tasks.length}
              </span>
            </button>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive
                      ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs'
                      : 'text-[#5C6652] hover:bg-[#D9DED1]/60 hover:text-[#2C3327]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#FDFCF8]' : 'text-[#8A957F]'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && item.badge > 0 ? (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-[#E2725B] text-[#FDFCF8]' : 'bg-[#E2725B] text-white'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Logout */}
        <div className="pt-6 border-t border-[#D9DED1] space-y-3">
          <div className="flex items-center gap-3 bg-[#FFFFFF] p-3 rounded-2xl border border-[#D9DED1]">
            <img
              src={settings.sonjoyImage}
              alt={settings.personalName}
              className="w-9 h-9 rounded-xl object-cover border border-[#D9DED1]"
            />
            <div className="overflow-hidden">
              <div className="text-xs font-bold text-[#2C3327] truncate">
                {settings.personalName}
              </div>
              <div className="text-[10px] text-[#8A957F] truncate">
                {settings.email || 'giga.sonjoy@gmail.com'}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="w-full text-left px-3.5 py-2 rounded-xl text-xs font-semibold text-[#E2725B] hover:bg-red-50 flex items-center gap-2.5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>লগআউট করুন</span>
          </button>
        </div>

      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 max-h-screen overflow-y-auto bg-[#FDFCF8] relative">
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              onOpenAiAssistant: () => setIsAiAssistantOpen(true),
              onOpenTaskDrawer: () => setIsTaskDrawerOpen(true),
              ...(child.props as any)
            });
          }
          return child;
        })}
      </main>

      {/* FLOATING ACTION BUTTONS (ONLY FOR ADMIN PANEL - ACCESSIBLE ON EVERY PAGE) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-wrap items-center gap-2.5 sm:gap-3">
        {/* Floating Cloud Save Button */}
        <button
          onClick={handleFloatingCloudSave}
          disabled={isCloudSaving}
          className={`group relative flex items-center gap-2.5 px-4 py-3 ${
            cloudSaveSuccess 
              ? 'bg-emerald-700 text-white ring-4 ring-emerald-400/40' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          } rounded-2xl shadow-xl hover:shadow-2xl border-2 border-white/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-75`}
          title={`সকল পেজ ও তথ্য সরাসরি ক্লাউড ডাটাবেজে সেভ করুন (সর্বশেষ: ${lastSyncTime})`}
        >
          <div className="relative">
            <CloudLightning className={`w-5 h-5 text-emerald-100 ${isCloudSaving ? 'animate-spin' : cloudSaveSuccess ? 'scale-110' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-300 border border-emerald-700 animate-pulse"></span>
          </div>
          <span className="text-xs font-bold tracking-wide font-sans">
            {isCloudSaving ? 'ক্লাউডে সেভ হচ্ছে...' : cloudSaveSuccess ? '✓ সেভ সম্পন্ন' : 'এখনই ক্লাউডে সেভ করুন'}
          </span>
          <span className="hidden group-hover:inline-block px-1.5 py-0.5 rounded-md bg-emerald-800/80 text-[10px] text-emerald-100">
            ক্লাউড সিঙ্ক
          </span>
        </button>

        {/* Admin AI Assistant Float */}
        <button
          onClick={() => setIsAiAssistantOpen(true)}
          className="group relative flex items-center gap-2 px-3.5 py-3 bg-[#2C3327] hover:bg-[#1f241b] text-[#FDFCF8] rounded-2xl shadow-xl hover:shadow-2xl border-2 border-white/20 transition-all hover:scale-105"
          title="Admin AI Assistant খুলুন"
        >
          <Bot className="w-5 h-5 text-emerald-400 group-hover:rotate-12 transition-transform" />
          <span className="text-xs font-bold tracking-wide font-sans hidden sm:inline-block">
            AI Assistant
          </span>
        </button>

        {/* Task Suggestion Float */}
        <button
          onClick={() => setIsTaskDrawerOpen(true)}
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] rounded-2xl shadow-xl hover:shadow-2xl border-2 border-[#FFFFFF]/20 transition-all hover:scale-105"
          title="অটোমেশন ও টাস্ক সাজেশন প্যানেল ওপেন করুন"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            {tasks.length > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-[#E2725B] text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow-xs">
                {tasks.length}
              </span>
            )}
          </div>
          <span className="text-xs font-bold tracking-wide font-sans hidden sm:inline-block">
            টাস্ক সাজেশন
          </span>
          <span className="hidden group-hover:inline-block px-1.5 py-0.5 rounded-md bg-[#2C3327]/60 text-[10px]">
            {tasks.length} কাজ
          </span>
        </button>
      </div>

      {/* FLOATING CLOUD SYNC TOAST BANNER */}
      {cloudToastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-bounce duration-500 max-w-md w-full px-4">
          <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <span>অনলাইন ক্লাউড ডাটাবেজ আপডেট</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                {cloudToastMessage}
              </p>
            </div>
            <button
              onClick={() => setCloudToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-slate-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Interactive Task Suggestion Drawer */}
      <AdminTaskSuggestionDrawer
        tasks={tasks}
        isOpen={isTaskDrawerOpen}
        onClose={() => setIsTaskDrawerOpen(false)}
        onNavigateTab={(tab, params) => {
          onSelectTab(tab, params);
          setIsTaskDrawerOpen(false);
        }}
        onRefreshScan={handleRefreshTasks}
        isScanning={isScanning}
      />

      {/* Interactive Admin AI Assistant Drawer */}
      <AdminAiAssistantDrawer
        isOpen={isAiAssistantOpen}
        onClose={() => setIsAiAssistantOpen(false)}
        onNavigateTab={(tab, params) => {
          onSelectTab(tab, params);
          setIsAiAssistantOpen(false);
        }}
        settings={settings}
      />

    </div>
  );
};
