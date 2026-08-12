import React, { useState } from 'react';
import { Menu, X, ArrowRight, ShieldCheck, Sparkles, MessageCircle, Globe, Lock } from 'lucide-react';
import { SiteSettings, HeaderSettings, HeaderNavLink } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  settings: SiteSettings;
  onOpenLeadForm: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
  logoDisplayMode: 'BOTH',
  mobileLogoDisplayMode: 'BOTH',
  showLogo: true,
  showBrandName: true,
  showPersonalName: true,
  showTagline: true,
  logoType: 'TEXT_BADGE',
  logoText: 'ST',
  logoImageUrl: '',
  logoWidth: 40,
  logoHeight: 40,
  customTaglineEn: 'Sonjoy Sarkar • Performance Marketing',
  customTaglineBn: 'সঞ্জয় সরকার • পারফরম্যান্স মার্কেটিং',
  sticky: true,
  showLanguageSwitcher: true,
  showAdminButton: true,
  showWhatsAppButton: true,
  ctaEnabled: true,
  ctaTextEn: 'Book Free Audit',
  ctaTextBn: 'ফ্রি স্ট্র্যাটেজি অডিট বুক করুন',
  ctaAction: 'LEAD_FORM',
  ctaCustomUrl: '',
  navLinks: [
    { id: 'nav-services', labelEn: 'Services', labelBn: 'সেবাসমূহ', sectionId: 'services', enabled: true, sortOrder: 1 },
    { id: 'nav-results', labelEn: 'Results & ROI', labelBn: 'ফলাফল ও ROI', sectionId: 'results', enabled: true, sortOrder: 2 },
    { id: 'nav-calculator', labelEn: 'Ads Calculator', labelBn: 'অ্যাড ক্যালকুলেটর', sectionId: 'calculator', enabled: true, sortOrder: 3 },
    { id: 'nav-case-studies', labelEn: 'Case Studies', labelBn: 'কেস স্টাডিজ', sectionId: 'case-studies', enabled: true, sortOrder: 4 },
    { id: 'nav-tiktok-guide', labelEn: 'TikTok Playbook', labelBn: 'টিকটক গাইড', sectionId: 'tiktok-education', enabled: true, sortOrder: 5 },
    { id: 'nav-faq', labelEn: 'FAQ', labelBn: 'সাধারণ জিজ্ঞাসা', sectionId: 'faq', enabled: true, sortOrder: 6 }
  ]
};

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenLeadForm,
  onNavigateSection,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  const header: HeaderSettings = {
    ...DEFAULT_HEADER_SETTINGS,
    ...(settings?.header || {})
  };

  const whatsappRaw = settings?.whatsapp?.number || settings?.whatsappNumber || '+8801815124970';
  const whatsappClean = whatsappRaw ? whatsappRaw.replace(/\D/g, '') : '8801815124970';
  const whatsappDefaultMsg = settings?.whatsapp?.defaultMessage || 'Hello Sonjoy, I would like to schedule a strategy session for TikTok & Facebook Ads campaigns.';
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(whatsappDefaultMsg)}`;

  // Filter & sort nav links
  const dynamicNavLinks = (header.navLinks && header.navLinks.length > 0)
    ? header.navLinks.filter(l => l.enabled !== false).sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    : DEFAULT_HEADER_SETTINGS.navLinks || [];

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  const handleCtaClick = () => {
    if (header.ctaAction === 'WHATSAPP') {
      window.open(whatsappUrl, '_blank');
    } else if (header.ctaAction === 'CALCULATOR') {
      handleNavClick('calculator');
    } else if (header.ctaAction === 'CUSTOM_URL' && header.ctaCustomUrl) {
      window.open(header.ctaCustomUrl, '_blank');
    } else {
      onOpenLeadForm();
    }
  };

  const ctaLabel = language === 'en'
    ? (header.ctaTextEn || 'Book Free Audit')
    : (header.ctaTextBn || settings.primaryCtaText || 'ফ্রি অডিট বুক করুন');

  const tagline = language === 'en'
    ? (header.customTaglineEn || `${settings.personalName} • Performance Marketing`)
    : (header.customTaglineBn || `${settings.personalName} • পারফরম্যান্স মার্কেটিং`);

  // Render Logo Component
  const renderLogoBadge = () => {
    if (header.logoType === 'IMAGE_URL' && header.logoImageUrl) {
      return (
        <img
          src={header.logoImageUrl}
          alt={settings.brandName || 'Brand Logo'}
          className="object-contain rounded-xl shadow-xs transition-transform group-hover:scale-105"
          style={{ width: header.logoWidth || 40, height: header.logoHeight || 40 }}
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-2xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center font-serif text-lg font-bold shadow-xs transition-transform group-hover:scale-105">
        {header.logoText || 'ST'}
      </div>
    );
  };

  return (
    <header className={`${header.sticky !== false ? 'sticky top-0' : 'relative'} z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#D9DED1] transition-all`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Personal Signature */}
        <div 
          onClick={() => handleNavClick('hero')} 
          className="cursor-pointer flex items-center gap-3 group"
          id="header-brand-logo"
        >
          {/* Desktop Logo Rendering */}
          <div className="hidden sm:flex items-center gap-3">
            {header.showLogo && (header.logoDisplayMode === 'BOTH' || header.logoDisplayMode === 'LOGO_ONLY') && (
              renderLogoBadge()
            )}

            {(header.logoDisplayMode === 'BOTH' || header.logoDisplayMode === 'NAME_ONLY') && (
              <div>
                {header.showBrandName && (
                  <div className="font-serif text-xl font-bold tracking-tight text-[#2C3327] group-hover:text-[#4A5D3B] transition-colors flex items-center gap-1.5">
                    <span>{settings.brandName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]"></span>
                  </div>
                )}
                {header.showTagline && (
                  <div className="text-[11px] uppercase tracking-[0.18em] text-[#8A957F] font-semibold">
                    {tagline}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Logo Rendering */}
          <div className="flex sm:hidden items-center gap-2.5">
            {header.showLogo && (header.mobileLogoDisplayMode === 'BOTH' || header.mobileLogoDisplayMode === 'LOGO_ONLY') && (
              renderLogoBadge()
            )}

            {(header.mobileLogoDisplayMode === 'BOTH' || header.mobileLogoDisplayMode === 'NAME_ONLY') && (
              <div>
                <div className="font-serif text-lg font-bold tracking-tight text-[#2C3327] group-hover:text-[#4A5D3B] transition-colors flex items-center gap-1">
                  <span>{settings.brandName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]"></span>
                </div>
                {header.showTagline && (
                  <div className="text-[9px] uppercase tracking-wider text-[#8A957F] font-medium">
                    {settings.personalName}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#5C6652]" id="desktop-nav">
          {dynamicNavLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.sectionId)}
              className="hover:text-[#2C3327] transition-colors relative py-1 focus:outline-none whitespace-nowrap text-xs font-semibold tracking-wide"
            >
              {language === 'en' ? item.labelEn : item.labelBn}
            </button>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Language Switcher */}
          {header.showLanguageSwitcher !== false && (
            <div className="flex items-center bg-[#F5F1EB] p-1 rounded-full border border-[#D9DED1] text-xs font-semibold" id="language-switcher-desktop">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 ${
                  language === 'en'
                    ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs font-bold'
                    : 'text-[#5C6652] hover:text-[#2C3327]'
                }`}
                title="Switch to English"
              >
                <Globe className="w-3 h-3" />
                <span>EN</span>
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-full transition-all ${
                  language === 'bn'
                    ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs font-bold'
                    : 'text-[#5C6652] hover:text-[#2C3327]'
                }`}
                title="বাংলায় পরিবর্তন করুন"
              >
                <span>বাংলা</span>
              </button>
            </div>
          )}

          {/* Admin Portal Quick Access */}
          {header.showAdminButton !== false && (
            <button
              onClick={onOpenAdmin}
              className="p-2.5 rounded-full border border-[#D9DED1] text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] transition-colors"
              title={language === 'en' ? 'Admin Portal' : 'অ্যাডমিন পোর্টাল'}
              id="header-admin-btn"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}

          {/* WhatsApp Icon */}
          {header.showWhatsAppButton !== false && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-full border border-[#D9DED1] text-[#4A5D3B] hover:bg-[#E8EAE2] transition-colors"
              title={language === 'en' ? 'Chat on WhatsApp' : 'WhatsApp এ মেসেজ দিন'}
              id="header-whatsapp-btn"
            >
              <MessageCircle className="w-4 h-4" />
            </a>
          )}

          {/* Primary CTA */}
          {header.ctaEnabled !== false && (
            <button
              onClick={handleCtaClick}
              className="bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
              id="header-primary-cta"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile Controls (Lang + Menu) */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Mobile Language Switcher */}
          {header.showLanguageSwitcher !== false && (
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-[#D9DED1] bg-[#F5F1EB] text-xs font-bold text-[#4A5D3B] flex items-center gap-1"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'EN' : 'বাং'}</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl border border-[#D9DED1] text-[#2C3327] hover:bg-[#F5F1EB]"
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FDFCF8] border-b border-[#D9DED1] px-6 py-6 space-y-4 shadow-lg animate-fadeIn">
          {/* Language Selector Inside Mobile Menu */}
          {header.showLanguageSwitcher !== false && (
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DED1]">
              <span className="text-xs font-semibold text-[#5C6652]">
                {language === 'en' ? 'Language / ভাষা' : 'ভাষা / Language'}:
              </span>
              <div className="flex items-center bg-[#F5F1EB] p-1 rounded-full border border-[#D9DED1] text-xs">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full font-bold ${
                    language === 'en' ? 'bg-[#4A5D3B] text-white' : 'text-[#5C6652]'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('bn')}
                  className={`px-3 py-1 rounded-full font-bold ${
                    language === 'bn' ? 'bg-[#4A5D3B] text-white' : 'text-[#5C6652]'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-2">
            {dynamicNavLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.sectionId)}
                className="text-left py-2.5 text-sm font-medium text-[#2C3327] border-b border-[#D9DED1]/40"
              >
                {language === 'en' ? item.labelEn : item.labelBn}
              </button>
            ))}
            {header.showAdminButton !== false && (
              <button
                onClick={() => {
                  onOpenAdmin();
                  setMobileMenuOpen(false);
                }}
                className="text-left py-2.5 text-sm font-semibold text-[#4A5D3B] flex items-center gap-2 border-b border-[#D9DED1]/40"
              >
                <Lock className="w-4 h-4" />
                <span>{language === 'en' ? 'Admin Studio' : 'অ্যাডমিন স্টুডিও'}</span>
              </button>
            )}
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            {header.ctaEnabled !== false && (
              <button
                onClick={() => {
                  handleCtaClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#4A5D3B] text-[#FDFCF8] py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2 shadow-xs"
              >
                <span>{ctaLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {header.showWhatsAppButton !== false && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full border border-[#D9DED1] text-[#4A5D3B] py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'en' ? 'Chat Directly on WhatsApp' : 'WhatsApp-এ সরাসরি কথা বলুন'}</span>
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
