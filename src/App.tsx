import React, { useState, useEffect } from 'react';
import { SiteSettings, AdminTab, LeadSubmission, KnowledgeGapItem, CaseStudy } from './types';
import { storageService } from './services/storageService';
import { trackingService } from './services/trackingService';

// Public Components
import { Header } from './components/public/Header';
import { Hero } from './components/public/Hero';
import { ServicesSection } from './components/public/ServicesSection';
import { CaseStudiesSection } from './components/public/CaseStudiesSection';
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

import { Lock, ShieldCheck, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';

export default function App() {
  // App view state
  const [isAdminMode, setIsAdminMode] = useState<boolean>(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('st_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [adminPasscode, setAdminPasscode] = useState<string>('');
  const [adminLoginError, setAdminLoginError] = useState<string>('');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('DASHBOARD');

  // Core dynamic site settings
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => storageService.getSiteSettings());

  // Lead modal state
  const [isLeadModalOpen, setIsLeadModalOpen] = useState<boolean>(false);
  const [leadModalInitialData, setLeadModalInitialData] = useState<Partial<LeadSubmission> | undefined>(undefined);

  // Dynamic Data Lists for live synchronization
  const [leads, setLeads] = useState<LeadSubmission[]>(() => storageService.getLeads());
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>(() => storageService.getCaseStudies(true));
  const [faqs, setFaqs] = useState(() => storageService.getFAQs(true));
  const [knowledgeGaps, setKnowledgeGaps] = useState<KnowledgeGapItem[]>(() => storageService.getKnowledgeGaps());
  const [conversations, setConversations] = useState(() => storageService.getAIConversations());

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

  // Scroll to anchor sections smoothly
  const scrollToSection = (sectionId: string) => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
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

  // Handle Admin login
  const handleAdminLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode === 'stweb2025' || adminPasscode === 'admin123' || adminPasscode === 'sonjoy') {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('st_admin_auth', 'true');
      setAdminLoginError('');
      setAdminPasscode('');
    } else {
      setAdminLoginError('পাসকোডটি সঠিক নয়। ডিফল্ট অ্যাক্সেস পাসকোড: stweb2025');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminMode(false);
    sessionStorage.removeItem('st_admin_auth');
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

            <form onSubmit={handleAdminLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                  অ্যাডমিন সিকিউরিটি পাসকোড
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#8A957F] absolute left-3.5 top-3" />
                  <input
                    type="password"
                    placeholder="পাসকোড লিখুন (যেমন: stweb2025)"
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] pl-10 pr-4 py-2.5 rounded-xl text-xs font-medium text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                    autoFocus
                  />
                </div>
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
          />
        )}

        {/* 4. TikTok Strategy & Education Guide */}
        {siteSettings.sectionVisibility.tiktokGuide && (
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
