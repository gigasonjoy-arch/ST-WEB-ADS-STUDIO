import React, { useState } from 'react';
import { CustomPage, CaseStudy, ServicePackage } from '../../types';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { 
  ArrowLeft, 
  Calendar, 
  Share2, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  ExternalLink, 
  TrendingUp, 
  Sparkles, 
  Filter, 
  Search,
  MessageCircle,
  Play,
  Layers,
  Award,
  BookOpen,
  PhoneCall,
  X
} from 'lucide-react';
import { VideoEmbedPlayer } from '../common/VideoEmbedPlayer';
import { MediaGalleryPage } from './MediaGalleryPage';

interface CustomPageViewProps {
  page: CustomPage;
  onBackToHome: () => void;
  onOpenLeadForm?: () => void;
  onOpenLeadFormWithContext?: (data: any) => void;
  onNavigateToPage?: (slug: string) => void;
  onOpenCalculator?: () => void;
}

export const CustomPageView: React.FC<CustomPageViewProps> = ({
  page,
  onBackToHome,
  onOpenLeadForm,
  onOpenLeadFormWithContext,
  onNavigateToPage,
  onOpenCalculator
}) => {
  const { language, t } = useLanguage();
  const [selectedPlatform, setSelectedPlatform] = useState<string>('ALL');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeProofModal, setActiveProofModal] = useState<CaseStudy | null>(null);

  // Load all case studies and services from storage
  const allCaseStudies = storageService.getCaseStudies(true);
  const allServices = storageService.getServices();

  const handleOpenLead = (context?: string) => {
    if (onOpenLeadFormWithContext) {
      onOpenLeadFormWithContext({ interestedService: context || page.titleEn });
    } else if (onOpenLeadForm) {
      onOpenLeadForm();
    }
  };

  const handleOpenWhatsApp = () => {
    const settings = storageService.getSiteSettings();
    const phone = (settings?.whatsapp?.number || '+8801815124970').replace(/[^0-9+]/g, '');
    const msg = encodeURIComponent(`Hello Sonjoy, I am interested in discussing "${page.titleEn}".`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  // Filtered case studies for Archive view
  const filteredCaseStudies = allCaseStudies.filter((cs) => {
    const matchesPlatform = selectedPlatform === 'ALL' || cs.platform.toUpperCase() === selectedPlatform;
    const matchesIndustry = selectedIndustry === 'ALL' || cs.industry === selectedIndustry;
    const matchesSearch = 
      (cs.titleEn || cs.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cs.titleBn || cs.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cs.industryEn || cs.industry || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cs.resultSummaryEn || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesPlatform && matchesIndustry && matchesSearch;
  });

  const availableIndustries = ['ALL', ...Array.from(new Set(allCaseStudies.map(c => c.industry).filter(Boolean)))];

  const isDraftOrDisabled = page.status !== 'PUBLISHED';

  if (page.pageType === 'MEDIA_GALLERY') {
    return (
      <MediaGalleryPage
        onBackToHome={onBackToHome}
        onOpenLeadForm={handleOpenLead}
        onNavigateToPage={onNavigateToPage}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[var(--theme-bg,#FDFCF8)] text-[var(--theme-text,#2C3327)] py-8 sm:py-12 animate-fadeIn">
      
      {/* Top Breadcrumb & Back Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        
        {/* Draft Banner if applicable */}
        {isDraftOrDisabled && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <span>PREVIEW MODE: This page is currently set to "{page.status}". (Only visible in preview)</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 bg-amber-200 rounded">
              Slug: /page/{page.slug}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pb-6 border-b border-[var(--theme-border,#D9DED1)]">
          <button
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-[#4A5D3B] hover:text-[#2C3327] transition-colors py-2 px-3 rounded-xl hover:bg-[var(--theme-section-bg,#F5F1EB)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'en' ? 'Back to Home' : 'মূল পেজে ফিরে যান'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp Strategy</span>
            </button>
            <button
              onClick={() => handleOpenLead(page.titleEn)}
              className="px-5 py-2 rounded-full bg-[var(--theme-btn-bg,#4A5D3B)] text-[var(--theme-btn-text,#FFFFFF)] text-xs font-bold hover:bg-[var(--theme-btn-hover,#3A4533)] transition-all shadow-xs"
            >
              {language === 'en' ? 'Book Strategy Call' : 'স্ট্র্যাটেজি সেশন বুক করুন'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Page Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Page Hero Header */}
        <div className="max-w-4xl space-y-4">
          <div className="inline-block px-3.5 py-1 rounded-full bg-[var(--theme-badge-bg,#E8EAE2)] text-[var(--theme-badge-text,#4A5D3B)] text-xs font-bold uppercase tracking-wider">
            {page.pageType === 'CASE_STUDIES_ARCHIVE' ? (language === 'en' ? 'Verified ROAS Archive' : 'ভেরিফায়েড কেস স্টাডি আর্কাইভ') :
             page.pageType === 'SERVICES_ARCHIVE' ? (language === 'en' ? 'Growth Solutions' : 'সার্ভিস প্যাকেজসমূহ') :
             page.pageType === 'TIKTOK_PLAYBOOK' ? 'TikTok Master Playbook' :
             page.pageType === 'FACEBOOK_ADS' ? 'Meta Full-Funnel' :
             page.pageType === 'CONTACT_STANDALONE' ? 'Direct Consultation' :
             page.pageType === 'ABOUT_SONJOY' ? 'Practitioner Bio' : 'Specialized Resource'}
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[var(--theme-heading,#2C3327)] leading-tight">
            {language === 'en' ? (page.titleEn || page.titleBn) : (page.titleBn || page.titleEn)}
          </h1>

          {(page.excerptEn || page.excerptBn) && (
            <p className="text-base sm:text-lg text-[#5C6652] leading-relaxed">
              {language === 'en' ? (page.excerptEn || page.excerptBn) : (page.excerptBn || page.excerptEn)}
            </p>
          )}
        </div>

        {/* Featured Image if exists */}
        {page.featuredImage && (
          <div className="rounded-3xl overflow-hidden border border-[var(--theme-border,#D9DED1)] max-h-96 w-full shadow-xs bg-[#E8EAE2]">
            <img
              src={page.featuredImage}
              alt={page.titleEn}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* ==================================================================== */}
        {/* TEMPLATE A: CASE STUDIES ARCHIVE (Full Search, Filter, Proofs) */}
        {/* ==================================================================== */}
        {page.pageType === 'CASE_STUDIES_ARCHIVE' && (
          <div className="space-y-8">
            
            {/* Filter Bar */}
            <div className="bg-[#FFFFFF] p-6 rounded-3xl border border-[var(--theme-border,#D9DED1)] shadow-2xs space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search */}
                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-[#8A957F] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={language === 'en' ? 'Search industry, brand, metric...' : 'ইন্ডাস্ট্রি বা রেজাল্ট দিয়ে খুঁজুন...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-[var(--theme-border,#D9DED1)] text-xs bg-[#FDFCF8] outline-hidden focus:ring-2 focus:ring-[#4A5D3B]"
                  />
                </div>

                {/* Platform Filter Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-[#8A957F] mr-1">
                    {language === 'en' ? 'Platform:' : 'প্ল্যাটফর্ম:'}
                  </span>
                  {(['ALL', 'TIKTOK', 'FACEBOOK', 'GOOGLE'] as const).map((plat) => (
                    <button
                      key={plat}
                      onClick={() => setSelectedPlatform(plat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                        selectedPlatform === plat
                          ? 'bg-[#4A5D3B] text-white shadow-xs'
                          : 'bg-[#F4F6F0] text-[#5C6652] hover:bg-[#E8EAE2]'
                      }`}
                    >
                      {plat === 'ALL' ? (language === 'en' ? 'All Platforms' : 'সকল প্ল্যাটফর্ম') : plat}
                    </button>
                  ))}
                </div>

              </div>

              {/* Industry Filter Pills */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-[#D9DED1]/60 items-center">
                <span className="text-xs font-bold text-[#8A957F] mr-1">
                  {language === 'en' ? 'Industry:' : 'ক্যাটাগরি:'}
                </span>
                {availableIndustries.map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(ind)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                      selectedIndustry === ind
                        ? 'bg-[#4A5D3B] text-white'
                        : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F4F6F0]'
                    }`}
                  >
                    {ind === 'ALL' ? (language === 'en' ? 'All Industries' : 'সব ইন্ডাস্ট্রি') : ind}
                  </button>
                ))}
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCaseStudies.map((cs) => (
                <div
                  key={cs.id}
                  className="bg-[#FFFFFF] rounded-3xl border border-[var(--theme-border,#D9DED1)] overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-all group"
                >
                  {/* Proof Image / Media */}
                  {cs.proofImage ? (
                    <div 
                      onClick={() => setActiveProofModal(cs)}
                      className="relative h-48 w-full bg-[#E8EAE2] overflow-hidden border-b border-[#D9DED1] cursor-pointer group/img"
                    >
                      <img
                        src={cs.proofImage}
                        alt={cs.title}
                        className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover/img:bg-black/40 transition-colors flex items-center justify-center">
                        <span className="px-3 py-1.5 bg-black/60 backdrop-blur-xs text-white rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Inspect Campaign Proof' : 'প্রমাণ ও অডিট দেখুন'}</span>
                        </span>
                      </div>
                    </div>
                  ) : null}

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-2.5 py-0.5 bg-[var(--theme-section-bg,#F5F1EB)] rounded-full text-[10px] font-bold text-[#A69076] uppercase">
                          {language === 'en' ? (cs.industryEn || cs.industry) : (cs.industryBn || cs.industry)}
                        </span>
                        <span className="px-2 py-0.5 bg-[#E8EAE2] rounded-full text-[10px] font-bold text-[#4A5D3B]">
                          {cs.platform} Ads
                        </span>
                      </div>

                      <h3 className="font-serif text-lg font-bold text-[#2C3327] mb-2 leading-snug group-hover:text-[#4A5D3B] transition-colors">
                        {language === 'en' ? (cs.titleEn || cs.title) : (cs.titleBn || cs.title)}
                      </h3>

                      <p className="text-xs text-[#5C6652] leading-relaxed line-clamp-3">
                        {language === 'en' ? (cs.resultSummaryEn || cs.resultSummary) : (cs.resultSummaryBn || cs.resultSummary)}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-2 p-3 bg-[#FDFCF8] rounded-xl border border-[#D9DED1]/60 text-xs">
                      {cs.adSpendBDT !== undefined && (
                        <div>
                          <div className="text-[9px] uppercase font-bold text-[#8A957F]">Ad Spend</div>
                          <div className="font-serif font-bold text-[#2C3327]">৳{cs.adSpendBDT.toLocaleString('en-IN')}</div>
                        </div>
                      )}
                      {cs.roas !== undefined && (
                        <div>
                          <div className="text-[9px] uppercase font-bold text-[#8A957F]">Average ROAS</div>
                          <div className="font-serif font-bold text-[#4A5D3B]">{cs.roas}x</div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setActiveProofModal(cs)}
                      className="w-full py-2.5 rounded-xl bg-[#F4F6F0] hover:bg-[#E8EAE2] text-[#4A5D3B] text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'View Full Strategy & Proof' : 'সম্পূর্ণ স্ট্র্যাটেজি ও অডিট ডাটা'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {filteredCaseStudies.length === 0 && (
              <div className="p-12 rounded-3xl bg-[#FFFFFF] border border-[#D9DED1] text-center space-y-3">
                <p className="text-sm font-bold text-[#2C3327]">কোনো কেস স্টাডি পাওয়া যায়নি।</p>
                <p className="text-xs text-[#5C6652]">ফিল্টার পরিবর্তন করুন বা সার্চ শব্দ বদলিয়ে চেষ্টা করুন।</p>
              </div>
            )}

          </div>
        )}

        {/* ==================================================================== */}
        {/* TEMPLATE B: SERVICES ARCHIVE (Full Catalog) */}
        {/* ==================================================================== */}
        {page.pageType === 'SERVICES_ARCHIVE' && (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {allServices.map((srv) => (
                <div 
                  key={srv.id}
                  className="bg-[#FFFFFF] rounded-3xl border border-[var(--theme-border,#D9DED1)] p-8 shadow-2xs space-y-6 flex flex-col justify-between hover:border-[#4A5D3B] transition-all"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 rounded-full bg-[#E8EAE2] text-[#4A5D3B] font-bold text-xs uppercase">
                        {srv.platform} Solution
                      </span>
                      <span className="font-serif text-sm font-bold text-[#8A957F]">
                        {srv.pricingModel}
                      </span>
                    </div>

                    <h3 className="font-serif text-2xl font-bold text-[#2C3327]">
                      {language === 'en' ? (srv.titleEn || srv.title) : (srv.titleBn || srv.title)}
                    </h3>

                    <p className="text-xs sm:text-sm text-[#5C6652] leading-relaxed">
                      {language === 'en' ? (srv.descriptionEn || srv.descriptionBn) : (srv.descriptionBn || srv.descriptionEn)}
                    </p>

                    {/* Features checklist */}
                    {srv.features && srv.features.length > 0 && (
                      <div className="space-y-2 pt-3 border-t border-[#D9DED1]/60">
                        <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F]">
                          {language === 'en' ? 'Core Execution Scope:' : 'কোর কার্যপরিধি:'}
                        </div>
                        <ul className="space-y-2 text-xs text-[#2C3327]">
                          {srv.features.map((feat, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#4A5D3B] shrink-0 mt-0.5" />
                              <span>{feat}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenLead(srv.titleEn || srv.title)}
                    className="w-full py-3 rounded-2xl bg-[var(--theme-btn-bg,#4A5D3B)] text-[var(--theme-btn-text,#FFFFFF)] font-bold text-xs hover:bg-[var(--theme-btn-hover,#3A4533)] transition-all shadow-xs"
                  >
                    {language === 'en' ? `Book ${srv.titleEn || srv.title}` : `এই প্যাকেজ নিয়ে আলোচনা করুন`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TEMPLATE C: TIKTOK PLAYBOOK / FACEBOOK GUIDE / CUSTOM CONTENT */}
        {/* ==================================================================== */}
        {(page.pageType === 'TIKTOK_PLAYBOOK' || page.pageType === 'FACEBOOK_ADS' || page.pageType === 'CUSTOM_CONTENT' || page.pageType === 'ABOUT_SONJOY' || page.pageType === 'CONTACT_STANDALONE') && (
          <div className="bg-[#FFFFFF] p-8 sm:p-12 rounded-3xl border border-[var(--theme-border,#D9DED1)] shadow-2xs space-y-8">
            
            {/* Content Body */}
            <div className="prose max-w-none text-[#2C3327] text-sm sm:text-base leading-relaxed space-y-6">
              <div className="whitespace-pre-line">
                {language === 'en' ? (page.contentEn || page.contentBn) : (page.contentBn || page.contentEn)}
              </div>
            </div>

            {/* Special Call to Action Box */}
            <div className="p-8 rounded-3xl bg-[var(--theme-section-bg,#F5F1EB)] border border-[var(--theme-border,#D9DED1)] flex flex-col md:flex-row md:items-center justify-between gap-6 mt-12">
              <div className="space-y-2 max-w-xl">
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#2C3327]">
                  {language === 'en' ? 'Ready to Engineer High-ROAS Campaigns for Your Brand?' : 'আপনার ব্র্যান্ডের জন্য প্রফিটেবল ক্যাম্পেইন শুরু করতে চান?'}
                </h3>
                <p className="text-xs sm:text-sm text-[#5C6652] leading-relaxed">
                  {language === 'en' 
                    ? 'Book a dedicated 1-on-1 strategy call with Sonjoy Sarkar to audit your ad account and map out the highest-performing creative & budget allocation.'
                    : 'আপনার অ্যাড অ্যাকাউন্ট অডিট করাতে এবং সঠিক বাজেট ও ক্রিয়েটিভ স্ট্র্যাটেজি সাজাতে সঞ্জয় সরকারের সাথে সরাসরি মিটিং বুক করুন।'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 flex-wrap">
                <button
                  onClick={handleOpenWhatsApp}
                  className="px-6 py-3 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-all flex items-center gap-2 shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Direct</span>
                </button>

                <button
                  onClick={() => handleOpenLead(page.titleEn)}
                  className="px-6 py-3 rounded-full bg-[var(--theme-btn-bg,#4A5D3B)] text-[var(--theme-btn-text,#FFFFFF)] text-xs font-bold hover:bg-[var(--theme-btn-hover,#3A4533)] transition-all shadow-xs"
                >
                  {language === 'en' ? 'Schedule Strategy Audit' : 'ফ্রি অডিট শিডিউল করুন'}
                </button>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Proof Modal */}
      {activeProofModal && (
        <div className="fixed inset-0 z-50 bg-[#2C3327]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D9DED1] shadow-2xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9DED1]">
              <div>
                <span className="px-3 py-1 bg-[#F5F1EB] rounded-full text-[10px] uppercase font-bold text-[#A69076]">
                  {activeProofModal.industry} • {activeProofModal.platform} Ads
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2C3327] mt-1">
                  {language === 'en' ? (activeProofModal.titleEn || activeProofModal.title) : (activeProofModal.titleBn || activeProofModal.title)}
                </h3>
              </div>
              <button
                onClick={() => setActiveProofModal(null)}
                className="p-2 rounded-full hover:bg-[#F5F1EB] text-[#8A957F]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {activeProofModal.proofImage && (
              <div className="rounded-2xl overflow-hidden border border-[#D9DED1] bg-[#F5F1EB]">
                <img
                  src={activeProofModal.proofImage}
                  alt={activeProofModal.title}
                  className="w-full h-auto object-cover max-h-96"
                />
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F]">
                {language === 'en' ? 'Campaign Strategy & Audit Notes:' : 'ক্যাম্পেইন বিবরণ ও অডিট নোট:'}
              </div>
              <p className="text-xs text-[#5C6652] leading-relaxed">
                {language === 'en' ? (activeProofModal.textDescriptionEn || activeProofModal.textDescription) : (activeProofModal.textDescriptionBn || activeProofModal.textDescription)}
              </p>
            </div>

            <div className="pt-4 border-t border-[#D9DED1] flex justify-end gap-3">
              <button
                onClick={() => setActiveProofModal(null)}
                className="px-5 py-2.5 rounded-full border border-[#D9DED1] text-xs font-semibold text-[#5C6652]"
              >
                {language === 'en' ? 'Close' : 'বন্ধ করুন'}
              </button>
              <button
                onClick={() => {
                  setActiveProofModal(null);
                  handleOpenLead(activeProofModal.title);
                }}
                className="px-6 py-2.5 rounded-full bg-[#4A5D3B] text-white text-xs font-semibold hover:bg-[#3A4533]"
              >
                {language === 'en' ? 'Deploy Similar Strategy' : 'একই স্ট্র্যাটেজি বাস্তবায়ন করুন'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
