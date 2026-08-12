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
  UserCheck
} from 'lucide-react';
import { AdminTab, SiteSettings, AdminTask } from '../../types';
import { AdminTaskSuggestionDrawer } from './AdminTaskSuggestionDrawer';
import { AdminAiAssistantDrawer } from './AdminAiAssistantDrawer';
import { AutomationTaskService } from '../../services/automationTaskService';
import { storageService } from '../../services/storageService';

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
  const [tasks, setTasks] = useState<AdminTask[]>(() => {
    return AutomationTaskService.generateTasks({
      leads: storageService.getLeads(),
      knowledgeGaps: storageService.getKnowledgeGaps(),
      conversations: storageService.getAIConversations(),
      caseStudies: storageService.getCaseStudies(true),
      benchmarks: storageService.getBenchmarks(true),
      priceRanges: storageService.getProductPriceRanges(),
      siteSettings: settings,
      isFirebaseWorking: false,
      firebaseErrorDetails: 'Firestore database (default) is not yet provisioned in project gen-lang-client-0372508566.'
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
        isFirebaseWorking: false,
        firebaseErrorDetails: 'Firestore database (default) is not yet provisioned in project gen-lang-client-0372508566.'
      });
      setTasks(refreshed);
      setIsScanning(false);
    }, 400);
  };

  useEffect(() => {
    handleRefreshTasks();
  }, [activeTab, unreadLeadsCount, unresolvedGapsCount]);

  const navItems: Array<{ id: AdminTab; label: string; icon: React.ComponentType<any>; badge?: number }> = [
    { id: 'DASHBOARD', label: 'ওভারভিউ ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'ONLINE_DATABASE', label: 'অনলাইন ক্লাউড ডাটাবেজ (Cloud DB)', icon: Database },
    { id: 'USERS', label: 'ইউজার ম্যানেজমেন্ট ও এক্সেস (Users & Security)', icon: Shield },
    { id: 'THEME_COLORS', label: 'থিম ও কালার ইঞ্জিন (Colors & Theme)', icon: Palette },
    { id: 'MEDIA', label: 'মিডিয়া হাব (ইমেজ, ইউটিউব ও টিকটক)', icon: Film },
    { id: 'PAGES', label: 'পেজ ও কনটেন্ট রুলস (Custom Pages)', icon: Layers },
    { id: 'PROFILE', label: 'প্রোফাইল ও ব্র্যান্ডিং (Profile Edit)', icon: User },
    { id: 'LEADS', label: 'লিড ও ক্লায়েন্ট CRM', icon: Users, badge: unreadLeadsCount },
    { id: 'WORKSPACE_SYNC', label: 'ক্লাউড ও ওয়ার্কস্পেস (Drive & Sheets)', icon: Cloud },
    { id: 'CASE_STUDIES', label: 'কেস স্টাডি ও প্রুফ', icon: FileText },
    { id: 'CALCULATOR_BENCHMARKS', label: 'ক্যালকুলেটর বেঞ্চমার্ক', icon: Calculator },
    { id: 'KNOWLEDGE_BASE', label: 'নলেজ বেস (AI গ্রাউন্ডিং)', icon: HelpCircle },
    { id: 'KNOWLEDGE_GAPS', label: 'অজানা প্রশ্ন (Knowledge Gaps)', icon: AlertCircle, badge: unresolvedGapsCount },
    { id: 'AI_CONVERSATIONS', label: 'এআই চ্যাট হিস্ট্রি ও ট্রেন্ড', icon: MessageSquare },
    { id: 'ANALYTICS', label: 'ভিজিটর ও ফানেল অ্যানালিটিক্স', icon: BarChart3 },
    { id: 'GTM_TRACKING', label: 'GTM ও পিক্সেল ট্র্যাকিং (GTM & Pixels)', icon: Tag },
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

          {/* Quick Action Hub (Live Site + AI Assistant + Tasks) */}
          <div className="py-4 space-y-2">
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

      {/* FLOATING ACTION BUTTONS (ONLY FOR ADMIN PANEL) */}
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
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
          <span className="text-xs font-bold tracking-wide font-sans">
            টাস্ক সাজেশন
          </span>
          <span className="hidden group-hover:inline-block px-1.5 py-0.5 rounded-md bg-[#2C3327]/60 text-[10px]">
            {tasks.length} কাজ
          </span>
        </button>
      </div>

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
