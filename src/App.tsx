import React, { useState, useEffect } from 'react';
import { SiteSettings, AdminTab, Lead, LeadSubmission, KnowledgeGapItem, CaseStudy } from './types';
import { storageService } from './services/storageService';
import { trackingService } from './services/trackingService';

// Public Components
import { Header } from './components/public/Header';
import { Hero } from './components/public/Hero';
import { ServicesSection } from './components/public/ServicesSection';
import { CaseStudiesSection } from './components/public/CaseStudiesSection';
import { FeaturedMediaPreview } from './components/public/FeaturedMediaPreview';
import { TikTokEducation } from './components/public/TikTokEducation';
import { AdsCalculator } from './components/public/AdsCalculator';
import { AudienceAndProcess } from './components/public/AudienceAndProcess';
import { FaqSection } from './components/public/FaqSection';
import { LeadFormModal } from './components/public/LeadFormModal';
import { AiChatWidget } from './components/public/AiChatWidget';
import { WhatsAppFloating } from './components/public/WhatsAppFloating';
import { Footer } from './components/public/Footer';

// Admin Components
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { LeadManagement } from './components/admin/LeadManagement';
import { CaseStudyManagement } from './components/admin/CaseStudyManagement';
import { BenchmarkManagement } from './components/admin/BenchmarkManagement';
import { KnowledgeBaseManagement } from './components/admin/KnowledgeBaseManagement';
import { KnowledgeGapManagement } from './components/admin/KnowledgeGapManagement';
import { AiConversationViewer } from './components/admin/AiConversationViewer';
import { AnalyticsViewer } from './components/admin/AnalyticsViewer';
import { AdminSettings } from './components/admin/AdminSettings';
import { GtmTrackingSettings } from './components/admin/GtmTrackingSettings';
import { GoogleWorkspaceSync } from './components/admin/GoogleWorkspaceSync';
import { ProfileManagement } from './components/admin/ProfileManagement';
import { ThemeColorManagement } from './components/admin/ThemeColorManagement';
import { MediaManagement } from './components/admin/MediaManagement';
import { PageManagement } from './components/admin/PageManagement';
import { FirebaseConnectionTester } from './components/admin/FirebaseConnectionTester';
import { OnlineDatabaseManagement } from './components/admin/OnlineDatabaseManagement';
import { UserManagement } from './components/admin/UserManagement';
import { RobotsManagement } from './components/admin/RobotsManagement';
import { SitemapManagement } from './components/admin/SitemapManagement';
import { SchemaMarkupManagement } from './components/admin/SchemaMarkupManagement';
import { SocialMediaManagement } from './components/admin/SocialMediaManagement';
import { CustomPageView } from './components/public/CustomPageView';
import { MediaGalleryPage } from './components/public/MediaGalleryPage';
import { RobotsTxtView } from './components/public/RobotsTxtView';
import { SitemapXmlView } from './components/public/SitemapXmlView';
import { initialCustomPages } from './data/initialData';
import { themeService } from './services/themeService';
import { schemaService } from './services/schemaService';
import { CustomPage, AdminUser } from './types';

import { Lock, ShieldCheck, ArrowLeft, KeyRound, CheckCircle2, Eye, EyeOff, Mail, Smartphone, Users, Bot, Network, Sparkles } from 'lucide-react';

export default function App() {
  // App view state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(() => {
    try {
      return (
        window.location.hash.toLowerCase().includes('admin') ||
        window.location.search.toLowerCase().includes('admin') ||
        window.location.pathname.toLowerCase().endsWith('/admin')
      );
    } catch {
      return false;
    }
  });

  const [activePageSlug, setActivePageSlug] = useState<string | null>(() => {
    try {
      const path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      const hash = window.location.hash;
      
      if (path.startsWith('page/')) {
        return path.replace(/^page\//, '');
      }
      if (path && path !== 'index.html' && path !== 'admin') {
        return path;
      }
      if (hash.startsWith('#page/')) {
        return hash.replace('#page/', '');
      }
      if (hash.startsWith('#/') && !hash.startsWith('#/admin')) {
        return hash.replace('#/', '');
      }
    } catch {}
    return null;
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('st_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminEmail, setAdminEmail] = useState<string>('giga.sonjoy@gmail.com');
  const [adminMobile, setAdminMobile] = useState<string>('01723516793');
  const [adminPasscode, setAdminPasscode] = useState<string>('stweb2025');
  const [currentAdminUser, setCurrentAdminUser] = useState<AdminUser>(() => storageService.getCurrentAdminUser());
  const [showPasscode, setShowPasscode] = useState<boolean>(false);
  const [adminLoginError, setAdminLoginError] = useState<string>('');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('DASHBOARD');

  // Core dynamic site settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => storageService.getSiteSettings());

  // Lead modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [leadModalInitialData, setLeadModalInitialData] = useState<Partial<LeadSubmission> | undefined>(undefined);

  // Dynamic Data Lists for live synchronization
  const [leads, setLeads] = useState<Lead[]>(() => storageService.getLeads());
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(() => storageService.getCaseStudies(true));
  const [faqs, setFaqs] = useState(() => storageService.getFAQs(true));
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGapItem[]>(() => storageService.getKnowledgeGaps());
  const [conversations, setConversations] = useState(() => storageService.getAIConversations());

  // Listen to URL changes for direct admin access & custom page routing
  useEffect(() => {
    const handleUrlChange = () => {
      const isHashAdmin = window.location.hash.toLowerCase().includes('admin');
      const isSearchAdmin = window.location.search.toLowerCase().includes('admin');
      const isPathAdmin = window.location.pathname.toLowerCase().endsWith('/admin');
      
      if (isHashAdmin || isSearchAdmin || isPathAdmin) {
        setIsAdminMode(true);
        setActivePageSlug(null);
        return;
      }

      // Check path and hash for page slugs
      const path = window.location.pathname.replace(/^\/+/, '').replace(/\/+$/, '');
      const hash = window.location.hash;

      if (path.startsWith('page/')) {
        const slug = path.replace(/^page\//, '').trim();
        setActivePageSlug(slug || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (path && path !== 'index.html' && path !== 'admin') {
        setActivePageSlug(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#page/')) {
        const slug = hash.replace('#page/', '').trim();
        setActivePageSlug(slug || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash.startsWith('#/') && !hash.startsWith('#/admin')) {
        const slug = hash.replace('#/', '').trim();
        setActivePageSlug(slug || null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setActivePageSlug(null);
        if (hash && hash !== '#') {
          const sectionId = hash.replace(/^#/, '');
          setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) {
              el.scrollIntoView({ behavior: 'smooth' });
            }
          }, 100);
        }
      }
    };

    // Apply active theme immediately on load
    const currentTheme = storageService.getThemeSettings();
    themeService.applyTheme(currentTheme);
    themeService.updateFavicon(storageService.getFaviconSettings(), currentTheme);

    // Apply active schema markup immediately on load
    const liveSettings = storageService.getSiteSettings();
    const liveFaqs = storageService.getFAQs(true);
    schemaService.injectSchemaToHead(liveSettings.schemaMarkup, liveSettings, liveFaqs);

    handleUrlChange();
    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);
    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, []);

  const navigateToPage = (slug: string) => {
    const cleanSlug = slug.replace(/^\/+/, '').replace(/^page\//, '').replace(/^#page\//, '');
    setActivePageSlug(cleanSlug);
    setIsAdminMode(false);
    
    // Update browser URL nicely
    try {
      window.history.pushState(null, '', `/${cleanSlug}`);
    } catch {
      window.location.hash = `#page/${cleanSlug}`;
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });

    storageService.recordEvent('PAGE_VIEW', {
      path: `/${cleanSlug}`,
      title: cleanSlug
    });
    trackingService.pushEvent('page_view', {
      page_path: `/${cleanSlug}`,
      page_title: cleanSlug
    });
  };

  const navigateBackToHome = () => {
    setActivePageSlug(null);
    setIsAdminMode(false);
    try {
      window.history.pushState(null, '', '/');
    } catch {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Update hash when switching admin mode
  useEffect(() => {
    if (isAdminMode) {
      if (!window.location.hash.includes('admin')) {
        window.location.hash = 'admin';
      }
    } else {
      if (window.location.hash.includes('admin')) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [isAdminMode]);

  // Initialize GTM and Tracking Scripts
  useEffect(() => {
    if (siteSettings?.gtm) {
      trackingService.initialize(siteSettings.gtm);
    }
  }, [siteSettings?.gtm]);

  // Track visitor journey on first load
  useEffect(() => {
    storageService.recordEvent('PAGE_VIEW', {
      path: window.location.pathname,
      title: siteSettings.brandName
    });
    trackingService.pushEvent('page_view', {
      page_path: window.location.pathname,
      page_title: siteSettings.brandName
    });

    const unsubscribe = storageService.subscribe(() => {
      refreshAllData();
    });

    return () => {
      unsubscribe();
    };
  }, [siteSettings.brandName]);

  const refreshAllData = () => {
    setSiteSettings(storageService.getSiteSettings());
    setLeads(storageService.getLeads());
    setCaseStudies(storageService.getCaseStudies(true));
    setFaqs(storageService.getFAQs(true));
    setKnowledgeGaps(storageService.getKnowledgeGaps());
    setConversations(storageService.getAIConversations());
  };

  // Scroll to anchor sections or navigate smoothly to standalone pages
  const scrollToSection = (target: string) => {
    if (!target) return;

    // If target is an admin toggle
    if (target === 'admin' || target === '/admin' || target === '#admin') {
      setIsAdminMode(true);
      return;
    }

    const cleanTarget = target.trim();
    const cleanSlug = cleanTarget
      .replace(/^\/+/, '')
      .replace(/^#\/?/, '')
      .replace(/^page\//, '')
      .replace(/^nav-/, '');

    // Check if target is a custom page or a known standalone route
    const customPageMatch = storageService.getCustomPageBySlug(cleanSlug, true);
    const isKnownStandalone = [
      'media-gallery',
      'case-studies',
      'services',
      'tiktok-ads',
      'facebook-ads',
      'contact',
      'about'
    ].includes(cleanSlug.toLowerCase());

    if (customPageMatch || isKnownStandalone || cleanTarget.startsWith('/page/') || (cleanTarget.startsWith('/') && !cleanTarget.startsWith('/#') && !cleanTarget.startsWith('#'))) {
      navigateToPage(cleanSlug);
      return;
    }

    // Otherwise, treat as an in-page section anchor (e.g. calculator, results, hero, faq)
    const cleanSectionId = cleanSlug;

    if (isAdminMode || activePageSlug) {
      navigateBackToHome();
      setTimeout(() => {
        const el = document.getElementById(cleanSectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    } else {
      const el = document.getElementById(cleanSectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Handle opening lead form with context
  const handleOpenLeadForm = (contextData?: Partial<LeadSubmission>) => {
    setLeadModalInitialData(contextData);
    setIsLeadModalOpen(true);
    storageService.recordEvent('LEAD_FORM_OPENED', { context: contextData ? 'calculator' : 'direct' });
    trackingService.pushEvent('lead_form_open', { context: contextData ? 'calculator' : 'direct' });
  };

  // Handle Admin login with Triple Credential Verification (Email, Mobile, Password/Passcode)
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const verifiedUser = storageService.verifyAdminCredentials(adminEmail, adminMobile, adminPasscode);
    
    if (verifiedUser) {
      setCurrentAdminUser(verifiedUser);
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('st_admin_auth', 'true');
        sessionStorage.setItem('st_admin_user', JSON.stringify(verifiedUser));
      } catch (err) {
        console.warn('Could not set session storage', err);
      }
      setAdminLoginError('');
    } else {
      setAdminLoginError('ভুল ইমেইল, মোবাইল নম্বর বা পাসওয়ার্ড! সঠিক তথ্য দিয়ে আবার চেষ্টা করুন।');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    try {
      sessionStorage.removeItem('st_admin_auth');
    } catch (err) {
      console.warn('Could not clear session storage', err);
    }
  };

  const handleLeadStatusChange = (leadId: string, status: any) => {
    storageService.updateLeadStatus(leadId, status);
    refreshAllData();
  };

  const unreadLeadsCount = leads.filter(l => l.status === 'NEW').length;
  const unresolvedGapsCount = knowledgeGaps.filter(g => !g.resolved).length;

  // ================= ADMIN VIEW =================
  if (isAdminMode) {
    if (!isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-[#F5F1EB] flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#D9DED1] rounded-3xl p-8 max-w-md w-full shadow-lg space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#4A5D3B] text-white flex items-center justify-center mx-auto font-serif font-bold text-xl">
                ST
              </div>
              <h2 className="text-2xl font-serif font-bold text-[#2C3327]">
                অ্যাডমিন স্টুডিও লগইন
              </h2>
              <p className="text-xs text-[#5C6652]">
                {siteSettings.personalName} - TikTok & Facebook Ads Specialist
              </p>
            </div>

            <form onSubmit={handleAdminLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#2C3327] mb-1">
                  অ্যাডমিন ইমেইল (Email) *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-[#8A957F] absolute left-3 top-2.5" />
                  <input
                    type="email"
                    placeholder="giga.sonjoy@gmail.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    required
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] pl-9 pr-3 py-2 rounded-xl text-xs font-medium text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2C3327] mb-1">
                  ভেরিফাইড মোবাইল নম্বর (Mobile Number) *
                </label>
                <div className="relative">
                  <Smartphone className="w-3.5 h-3.5 text-[#8A957F] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="01723516793"
                    value={adminMobile}
                    onChange={(e) => setAdminMobile(e.target.value)}
                    required
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] pl-9 pr-3 py-2 rounded-xl text-xs font-medium text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2C3327] mb-1">
                  অ্যাডমিন সিকিউরিটি পাসওয়ার্ড / পাসকোড *
                </label>
                <div className="relative">
                  <KeyRound className="w-3.5 h-3.5 text-[#8A957F] absolute left-3 top-2.5" />
                  <input
                    type={showPasscode ? 'text' : 'password'}
                    placeholder="পাসওয়ার্ড লিখুন (যেমন: stweb2025)"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    required
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] pl-9 pr-9 py-2 rounded-xl text-xs font-medium text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasscode(!showPasscode)}
                    className="absolute right-2.5 top-2 text-[#8A957F] hover:text-[#2C3327] transition-colors p-0.5"
                    title={showPasscode ? "পাসকোড লুকান" : "পাসকোড দেখুন"}
                  >
                    {showPasscode ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-2.5 bg-[#F4F6F0] rounded-xl border border-[#E1E5DC] flex items-center justify-between text-[11px]">
                <span className="text-[#5C6652] font-medium">ডিফল্ট সুপার অ্যাডমিন:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAdminEmail('giga.sonjoy@gmail.com');
                    setAdminMobile('01723516793');
                    setAdminPasscode('stweb2025');
                    setAdminLoginError('');
                  }}
                  className="text-[#4A5D3B] hover:underline font-bold flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>অটো ফিল করুন</span>
                </button>
              </div>

              {adminLoginError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-medium border border-red-200">
                  {adminLoginError}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-[#4A5D3B] hover:bg-[#3D4D30] text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>অ্যাডমিন প্যানেলে প্রবেশ করুন</span>
              </button>
            </form>

            <div className="pt-4 border-t border-[#D9DED1] text-center">
              <button
                onClick={() => setIsAdminMode(false)}
                className="text-xs text-[#5C6652] hover:text-[#2C3327] flex items-center justify-center gap-1.5 mx-auto font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>লাইভ ওয়েবসাইটে ফিরে যান</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <AdminLayout
        activeTab={activeAdminTab}
        onSelectTab={(tab) => setActiveAdminTab(tab)}
        onLogout={handleAdminLogout}
        onReturnToSite={() => setIsAdminMode(false)}
        settings={siteSettings}
        unreadLeadsCount={unreadLeadsCount}
        unresolvedGapsCount={unresolvedGapsCount}
      >
        {activeAdminTab === 'DASHBOARD' && (
          <AdminDashboard
            leads={leads}
            knowledgeGaps={knowledgeGaps}
            conversations={conversations}
            onNavigateTab={(tab) => setActiveAdminTab(tab)}
            onUpdateLeadStatus={handleLeadStatusChange}
          />
        )}

        {activeAdminTab === 'ONLINE_DATABASE' && (
          <OnlineDatabaseManagement />
        )}

        {activeAdminTab === 'PROFILE' && (
          <ProfileManagement
            settings={siteSettings}
            onUpdateSettings={(updated) => {
              setSiteSettings(updated);
              refreshAllData();
            }}
            onNavigateTab={(tab) => setActiveAdminTab(tab)}
          />
        )}

        {activeAdminTab === 'LEADS' && (
          <LeadManagement
            leads={leads}
            onRefresh={refreshAllData}
          />
        )}

        {activeAdminTab === 'WORKSPACE_SYNC' && (
          <GoogleWorkspaceSync />
        )}

        {activeAdminTab === 'CASE_STUDIES' && (
          <CaseStudyManagement
            onRefresh={refreshAllData}
          />
        )}

        {activeAdminTab === 'CALCULATOR_BENCHMARKS' && (
          <BenchmarkManagement
            onRefresh={refreshAllData}
          />
        )}

        {activeAdminTab === 'KNOWLEDGE_BASE' && (
          <KnowledgeBaseManagement
            onRefresh={refreshAllData}
          />
        )}

        {activeAdminTab === 'KNOWLEDGE_GAPS' && (
          <KnowledgeGapManagement
            onRefresh={refreshAllData}
          />
        )}

        {activeAdminTab === 'AI_CONVERSATIONS' && (
          <AiConversationViewer
            conversations={conversations}
            onRefresh={refreshAllData}
            onNavigateTab={(tab) => setActiveAdminTab(tab)}
          />
        )}

        {activeAdminTab === 'ANALYTICS' && (
          <AnalyticsViewer
            settings={siteSettings}
            onRefresh={refreshAllData}
            onNavigateTab={(tab) => setActiveAdminTab(tab)}
          />
        )}

        {activeAdminTab === 'GTM_TRACKING' && (
          <div className="space-y-6 max-w-6xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327]">
                  Google Tag Manager ও পিক্সেল ট্র্যাকিং
                </h1>
                <p className="text-xs text-[#5C6652] mt-1">
                  GTM Container ID, Meta Pixel, TikTok Pixel, GA4 ও কাস্টম স্ক্রিপ্ট পরিচালনা করুন।
                </p>
              </div>
              <button
                onClick={() => {
                  storageService.updateSiteSettings(siteSettings);
                  refreshAllData();
                }}
                className="px-5 py-2.5 bg-[#4A5D3B] hover:bg-[#3A4533] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-2xs self-start sm:self-auto"
              >
                <span>সেটিংস সেভ করুন</span>
              </button>
            </div>

            <GtmTrackingSettings
              gtm={siteSettings.gtm}
              onChange={(updatedGtm) => {
                const updated = { ...siteSettings, gtm: updatedGtm };
                setSiteSettings(updated);
                storageService.updateSiteSettings(updated);
              }}
            />
          </div>
        )}

        {activeAdminTab === 'THEME_COLORS' && (
          <ThemeColorManagement
            onThemeUpdated={() => {
              refreshAllData();
              const updatedTheme = storageService.getThemeSettings();
              themeService.applyTheme(updatedTheme);
              themeService.updateFavicon(storageService.getFaviconSettings(), updatedTheme);
            }}
          />
        )}

        {activeAdminTab === 'MEDIA' && (
          <MediaManagement
            onNavigateToTab={(tab) => setActiveAdminTab(tab as any)}
          />
        )}

        {activeAdminTab === 'PAGES' && (
          <PageManagement
            onPreviewPage={(page) => {
              setIsAdminMode(false);
              navigateToPage(page.slug);
            }}
          />
        )}

        {activeAdminTab === 'FIREBASE_STATUS' && (
          <FirebaseConnectionTester />
        )}

        {activeAdminTab === 'USERS' && (
          <UserManagement
            currentUser={currentAdminUser}
          />
        )}

        {activeAdminTab === 'SOCIAL_MEDIA' && (
          <SocialMediaManagement />
        )}

        {activeAdminTab === 'SCHEMA_MARKUP' && (
          <SchemaMarkupManagement />
        )}

        {activeAdminTab === 'ROBOTS_TXT' && (
          <RobotsManagement />
        )}

        {activeAdminTab === 'SITEMAP' && (
          <SitemapManagement />
        )}

        {activeAdminTab === 'SETTINGS' && (
          <AdminSettings
            settings={siteSettings}
            onUpdateSettings={(updated) => {
              setSiteSettings(updated);
              refreshAllData();
            }}
          />
        )}
      </AdminLayout>
    );
  }

  // ================= CUSTOM PAGE / ARCHIVE VIEW =================
  if (activePageSlug) {
    const cleanActiveSlug = activePageSlug.toLowerCase().replace(/^\/+/, '').replace(/^page\//, '').replace(/^#page\//, '');
    
    // Dedicated SEO endpoints in SPA mode
    if (cleanActiveSlug === 'robots.txt') {
      return <RobotsTxtView onBackToHome={navigateBackToHome} />;
    }
    if (cleanActiveSlug === 'sitemap.xml') {
      return <SitemapXmlView onBackToHome={navigateBackToHome} />;
    }

    let customPage = storageService.getCustomPageBySlug(cleanActiveSlug, true);
    if (!customPage) {
      customPage = initialCustomPages.find(p => p.slug.toLowerCase() === cleanActiveSlug) || null;
    }

    const isMediaGallery = cleanActiveSlug === 'media-gallery' || customPage?.pageType === 'MEDIA_GALLERY' || customPage?.slug === 'media-gallery';

    return (
      <div className="min-h-screen bg-[#FDFCF8] text-[#2C3327] selection:bg-[#4A5D3B] selection:text-white flex flex-col font-sans">
        <Header
          settings={siteSettings}
          onOpenLeadForm={() => handleOpenLeadForm()}
          onNavigateSection={scrollToSection}
          onOpenAdmin={() => setIsAdminMode(true)}
        />

        <main className="flex-grow">
          {isMediaGallery ? (
            <MediaGalleryPage
              onBackToHome={navigateBackToHome}
              onOpenLeadForm={(context) => handleOpenLeadForm({ interestedService: 'BOTH', notes: context ? `Media inquiry: ${context}` : 'Media Gallery Inquiry' })}
              onNavigateToPage={navigateToPage}
            />
          ) : customPage ? (
            <CustomPageView
              page={customPage}
              onBackToHome={navigateBackToHome}
              onOpenLeadForm={() => handleOpenLeadForm()}
              onOpenLeadFormWithContext={handleOpenLeadForm}
              onNavigateToPage={navigateToPage}
              onOpenCalculator={() => scrollToSection('calculator')}
            />
          ) : (
            <div className="max-w-4xl mx-auto px-4 py-20 text-center">
              <div className="bg-white border border-[#D9DED1] rounded-3xl p-12 shadow-sm space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto text-2xl font-bold font-serif">
                  404
                </div>
                <h1 className="text-2xl font-serif font-bold text-[#2C3327]">পৃষ্ঠাটি পাওয়া যায়নি (Page Not Found)</h1>
                <p className="text-xs text-[#5C6652] max-w-md mx-auto">
                  অনুরোধকৃত পেজটি হয়তো সরানো হয়েছে বা লিংকটি সঠিক নয়। হোমপেজে ফিরে গিয়ে ব্রাউজ করুন।
                </p>
                <button
                  onClick={navigateBackToHome}
                  className="px-6 py-2.5 bg-[#4A5D3B] text-white rounded-xl text-xs font-bold hover:bg-[#3A4533] transition-colors inline-flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>হোমপেজে ফিরে যান</span>
                </button>
              </div>
            </div>
          )}
        </main>

        <Footer
          settings={siteSettings}
          onOpenLeadForm={() => handleOpenLeadForm()}
          onNavigateSection={scrollToSection}
          onOpenAdmin={() => setIsAdminMode(true)}
        />

        <WhatsAppFloating settings={siteSettings} />
        
        <AiChatWidget
          onOpenLeadForm={() => handleOpenLeadForm()}
          onScrollToCalculator={() => {
            navigateBackToHome();
            setTimeout(() => scrollToSection('calculator'), 100);
          }}
          onScrollToResults={() => {
            navigateBackToHome();
            setTimeout(() => scrollToSection('results'), 100);
          }}
        />

        <LeadFormModal
          isOpen={isLeadModalOpen}
          onClose={() => {
            setIsLeadModalOpen(false);
            refreshAllData();
          }}
          initialData={leadModalInitialData}
        />
      </div>
    );
  }

  // ================= PUBLIC LANDING PAGE VIEW =================
  return (
    <div className="min-h-screen bg-[#FDFCF8] text-[#2C3327] selection:bg-[#4A5D3B] selection:text-white flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        settings={siteSettings}
        onOpenLeadForm={() => handleOpenLeadForm()}
        onNavigateSection={scrollToSection}
        onOpenAdmin={() => setIsAdminMode(true)}
      />

      {/* Main Sections */}
      <main className="flex-grow">
        
        {/* 1. Hero Section */}
        {siteSettings.sectionVisibility.hero && (
          <Hero
            settings={siteSettings}
            onOpenLeadForm={() => handleOpenLeadForm()}
            onScrollToCalculator={() => scrollToSection('calculator')}
          />
        )}

        {/* 2. Services Section */}
        {siteSettings.sectionVisibility.services && (
          <ServicesSection
            onOpenLeadForm={() => handleOpenLeadForm()}
          />
        )}

        {/* 3. Case Studies & Verified Results */}
        {siteSettings.sectionVisibility.caseStudies && (
          <CaseStudiesSection
            caseStudies={caseStudies}
            onOpenLeadForm={() => handleOpenLeadForm()}
            onOpenLeadFormWithContext={handleOpenLeadForm}
            onNavigateToPage={navigateToPage}
          />
        )}

        {/* 3.1 Featured Media & Video Vault Showcase Preview */}
        <FeaturedMediaPreview
          onNavigateToGallery={() => navigateToPage('media-gallery')}
        />

        {/* 4. TikTok Strategy & Education Guide */}
        {(siteSettings.sectionVisibility.tiktokEducation || siteSettings.sectionVisibility.tiktokGuide) && (
          <TikTokEducation />
        )}

        {/* 5. Interactive Ads Prediction & Feasibility Calculator */}
        {siteSettings.sectionVisibility.calculator && (
          <AdsCalculator
            onOpenLeadFormWithContext={handleOpenLeadForm}
          />
        )}

        {/* 6. Target Audience & Execution Process */}
        {siteSettings.sectionVisibility.process && (
          <AudienceAndProcess
            onOpenLeadForm={() => handleOpenLeadForm()}
          />
        )}

        {/* 7. FAQ Section */}
        {siteSettings.sectionVisibility.faq && (
          <FaqSection
            faqs={faqs}
            onOpenLeadForm={() => handleOpenLeadForm()}
          />
        )}

      </main>

      {/* Footer */}
      <Footer
        settings={siteSettings}
        onOpenLeadForm={() => handleOpenLeadForm()}
        onNavigateSection={scrollToSection}
        onOpenAdmin={() => setIsAdminMode(true)}
      />

      {/* Floating Interactive Elements */}
      <WhatsAppFloating settings={siteSettings} />
      
      <AiChatWidget
        onOpenLeadForm={() => handleOpenLeadForm()}
        onScrollToCalculator={() => scrollToSection('calculator')}
        onScrollToResults={() => scrollToSection('results')}
      />

      {/* Lead Modal */}
      <LeadFormModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          refreshAllData();
        }}
        initialData={leadModalInitialData}
      />

    </div>
  );
}
