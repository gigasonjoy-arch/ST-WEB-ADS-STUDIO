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
    { id: 'nav-services', labelEn: 'Services', labelBn: 'সেবাসমূহ', route: '/services', sectionId: 'services', enabled: true, sortOrder: 1 },
    { id: 'nav-case-studies', labelEn: 'Case Studies', labelBn: 'কেস স্টাডিজ', route: '/case-studies', sectionId: 'case-studies', enabled: true, sortOrder: 2 },
    { id: 'nav-media-gallery', labelEn: 'Media Gallery', labelBn: 'মিডিয়া গ্যালারি', route: '/media-gallery', sectionId: 'media-gallery', enabled: true, sortOrder: 3 },
    { id: 'nav-tiktok-guide', labelEn: 'TikTok Playbook', labelBn: 'টিকটক গাইড', route: '/tiktok-ads', sectionId: 'tiktok-education', enabled: true, sortOrder: 4 },
    { id: 'nav-facebook-ads', labelEn: 'Facebook Ads', labelBn: 'ফেসবুক অ্যাডস', route: '/facebook-ads', sectionId: 'facebook-ads', enabled: true, sortOrder: 5 },
    { id: 'nav-calculator', labelEn: 'Ads Calculator', labelBn: 'অ্যাড ক্যালকুলেটর', route: '/#calculator', sectionId: 'calculator', enabled: true, sortOrder: 6 },
    { id: 'nav-contact', labelEn: 'Contact', labelBn: 'যোগাযোগ', route: '/contact', sectionId: 'contact', enabled: true, sortOrder: 7 }
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

  // Filter & sort nav links, ensuring Media Gallery is always included
  const dynamicNavLinks: HeaderNavLink[] = (() => {
    const rawLinks = (header.navLinks && header.navLinks.length > 0)
      ? header.navLinks.filter(l => l.enabled !== false)
      : [...(DEFAULT_HEADER_SETTINGS.navLinks || [])];

    const hasMediaGallery = rawLinks.some(l => 
      l.id === 'nav-media-gallery' || 
      l.sectionId === 'media-gallery' || 
      l.route === '/media-gallery' ||
      l.labelEn?.toLowerCase().includes('media gallery')
    );

    let finalLinks = [...rawLinks];
    if (!hasMediaGallery) {
      const mediaGalleryLink: HeaderNavLink = {
        id: 'nav-media-gallery',
        labelEn: 'Media Gallery',
        labelBn: 'মিডিয়া গ্যালারি',
        route: '/media-gallery',
        sectionId: 'media-gallery',
        enabled: true,
        sortOrder: 3
      };
      const insertIndex = Math.min(2, finalLinks.length);
      finalLinks.splice(insertIndex, 0, mediaGalleryLink);
    }

    return finalLinks.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  })();

  const handleNavClick = (link: HeaderNavLink) => {
    const target = link.route || link.sectionId || 'hero';
    onNavigateSection(target);
    setMobileMenuOpen(false);
  };

  const handleCtaClick = () => {
    if (header.ctaAction === 'WHATSAPP') {
      window.open(whatsappUrl, '_blank');
    } else if (header.ctaAction === 'CALCULATOR') {
      onNavigateSection('calculator');
    } else if (header.ctaAction === 'CUSTOM_URL' && header.ctaCustomUrl) {
      window.open(header.ctaCustomUrl, '_blank');
    } else {
      onOpenLeadForm();
    }
  };

  const hasBengali = (text?: string) => Boolean(text && /[\u0980-\u09FF]/.test(text));

  const ctaLabel = language === 'en'
    ? (header.ctaTextEn || 'Book Free Audit')
    : (header.ctaTextBn || settings.primaryCtaTextBn || (hasBengali(settings.primaryCtaText) ? settings.primaryCtaText : 'ফ্রি স্ট্র্যাটেজি অডিট বুক করুন'));

  const personalName = language === 'bn'
    ? (settings.personalNameBn || settings.personalName || 'সঞ্জয় সরকার')
    : (settings.personalName || 'Sonjoy Sarkar');

  const brandName = language === 'bn'
    ? (settings.brandNameBn || settings.brandName || 'ST Web & Ads Studio')
    : (settings.brandName || 'ST Web & Ads Studio');

  const tagline = language === 'en'
    ? (header.customTaglineEn || `${personalName} • Performance Marketing`)
    : (header.customTaglineBn || `${personalName} • পারফরম্যান্স মার্কেটিং`);

  // Render Logo Component
  const renderLogoBadge = (isMobile = false) => {
    const sizeClasses = isMobile ? "w-8 h-8 rounded-xl text-sm" : "w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl text-base sm:text-lg";
    
    if (header.logoType === 'IMAGE_URL' && header.logoImageUrl) {
      return (
        <img
          src={header.logoImageUrl}
          alt={settings.brandName || 'Brand Logo'}
          className={`object-contain shadow-xs transition-transform group-hover:scale-105 shrink-0 ${isMobile ? 'w-8 h-8 rounded-xl' : 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl'}`}
          style={!isMobile && header.logoWidth ? { width: header.logoWidth, height: header.logoHeight || header.logoWidth } : undefined}
        />
      );
    }
    return (
      <div className={`${sizeClasses} bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center font-serif font-bold shadow-xs transition-transform group-hover:scale-105 shrink-0 select-none`}>
        {header.logoText || 'ST'}
      </div>
    );
  };

  return (
    <header className={`${header.sticky !== false ? 'sticky top-0' : 'relative'} z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#D9DED1]/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all`}>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 lg:gap-4">
        
        {/* Brand & Personal Signature */}
        <div 
          onClick={() => onNavigateSection('hero')} 
          className="cursor-pointer flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0"
          id="header-brand-logo"
        >
          {/* Desktop Logo Rendering */}
          <div className="hidden sm:flex items-center gap-2.5 sm:gap-3 shrink-0">
            {header.showLogo && (header.logoDisplayMode === 'BOTH' || header.logoDisplayMode === 'LOGO_ONLY') && (
              renderLogoBadge(false)
            )}

            {(header.logoDisplayMode === 'BOTH' || header.logoDisplayMode === 'NAME_ONLY') && (
              <div className="flex flex-col justify-center min-w-0">
                {header.showBrandName && (
                  <div className="font-serif text-base md:text-lg lg:text-xl font-bold tracking-tight text-[#2C3327] group-hover:text-[#4A5D3B] transition-colors flex items-center gap-1.5 whitespace-nowrap leading-tight">
                    <span>{brandName}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B] shrink-0"></span>
                  </div>
                )}
                {header.showTagline && (
                  <div className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-[#8A957F] font-semibold whitespace-nowrap leading-none mt-1">
                    {tagline}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Logo Rendering */}
          <div className="flex sm:hidden items-center gap-2 shrink-0 min-w-0">
            {header.showLogo && (header.mobileLogoDisplayMode === 'BOTH' || header.mobileLogoDisplayMode === 'LOGO_ONLY') && (
              renderLogoBadge(true)
            )}

            {(header.mobileLogoDisplayMode === 'BOTH' || header.mobileLogoDisplayMode === 'NAME_ONLY') && (
              <div className="flex flex-col justify-center min-w-0">
                <div className="font-serif text-sm font-bold tracking-tight text-[#2C3327] group-hover:text-[#4A5D3B] transition-colors flex items-center gap-1 whitespace-nowrap leading-tight">
                  <span className="truncate max-w-[170px] xs:max-w-[210px]">{brandName}</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B] shrink-0"></span>
                </div>
                {header.showTagline && (
                  <div className="text-[9px] uppercase tracking-wider text-[#8A957F] font-medium whitespace-nowrap leading-none mt-0.5 truncate max-w-[170px] xs:max-w-[210px]">
                    {personalName}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 2xl:gap-4 text-sm font-medium text-[#5C6652]" id="desktop-nav">
          {dynamicNavLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="px-2.5 py-1.5 rounded-lg text-xs 2xl:text-[13px] font-semibold tracking-wide text-[#5C6652] hover:text-[#2C3327] hover:bg-[#F5F1EB]/90 transition-all whitespace-nowrap focus:outline-none"
            >
              {language === 'en' ? item.labelEn : item.labelBn}
            </button>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="hidden sm:flex items-center gap-1.5 lg:gap-2 shrink-0">
          {/* Language Switcher */}
          {header.showLanguageSwitcher !== false && (
            <div className="flex items-center bg-[#F5F1EB] p-0.5 rounded-full border border-[#D9DED1] text-xs font-semibold shrink-0" id="language-switcher-desktop">
              <button
                onClick={() => setLanguage('en')}
                className={`px-2.5 py-1 rounded-full transition-all flex items-center gap-1 text-[11px] font-bold ${
                  language === 'en'
                    ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs'
                    : 'text-[#5C6652] hover:text-[#2C3327]'
                }`}
                title="Switch to English"
              >
                <Globe className="w-3 h-3" />
                <span>EN</span>
              </button>
              <button
                onClick={() => setLanguage('bn')}
                className={`px-2.5 py-1 rounded-full transition-all text-[11px] font-bold ${
                  language === 'bn'
                    ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs'
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
              className="p-2 rounded-full border border-[#D9DED1] bg-[#FDFCF8] text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] transition-colors shrink-0"
              title={language === 'en' ? 'Admin Studio' : 'অ্যাডমিন স্টুডিও'}
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
              className="p-2 rounded-full border border-[#D9DED1] bg-[#FDFCF8] text-[#4A5D3B] hover:bg-[#E8EAE2] transition-colors shrink-0"
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
              className="bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] px-3.5 lg:px-4 py-2 rounded-full text-xs font-bold tracking-wide shadow-xs hover:shadow transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 group"
              id="header-primary-cta"
            >
              <span>{ctaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Mobile Controls (Lang + Menu) */}
        <div className="flex sm:hidden items-center gap-1.5 shrink-0">
          {/* Mobile Language Switcher */}
          {header.showLanguageSwitcher !== false && (
            <button
              onClick={toggleLanguage}
              className="px-2.5 py-1.5 rounded-xl border border-[#D9DED1] bg-[#F5F1EB] text-xs font-bold text-[#4A5D3B] flex items-center gap-1 shrink-0"
              title="Switch Language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'EN' : 'বাং'}</span>
            </button>
          )}

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl border border-[#D9DED1] text-[#2C3327] hover:bg-[#F5F1EB] shrink-0"
            id="mobile-menu-toggle"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden bg-[#FDFCF8] border-b border-[#D9DED1] px-5 py-5 space-y-4 shadow-xl animate-fadeIn">
          {/* Language Selector Inside Mobile Menu */}
          {header.showLanguageSwitcher !== false && (
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DED1]/70">
              <span className="text-xs font-semibold text-[#5C6652]">
                {language === 'en' ? 'Language' : 'ভাষা'}:
              </span>
              <div className="flex items-center bg-[#F5F1EB] p-0.5 rounded-full border border-[#D9DED1] text-xs">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    language === 'en' ? 'bg-[#4A5D3B] text-white shadow-xs' : 'text-[#5C6652]'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('bn')}
                  className={`px-3 py-1 rounded-full font-bold transition-all ${
                    language === 'bn' ? 'bg-[#4A5D3B] text-white shadow-xs' : 'text-[#5C6652]'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          )}

          <nav className="flex flex-col space-y-1">
            {dynamicNavLinks.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item)}
                className="text-left px-3 py-2.5 text-sm font-semibold text-[#2C3327] hover:bg-[#F5F1EB] rounded-xl transition-colors"
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
                className="text-left px-3 py-2.5 text-sm font-semibold text-[#4A5D3B] hover:bg-[#F5F1EB] rounded-xl flex items-center gap-2 transition-colors"
              >
                <Lock className="w-4 h-4" />
                <span>{language === 'en' ? 'Admin Studio' : 'অ্যাডমিন স্টুডিও'}</span>
              </button>
            )}
          </nav>

          <div className="pt-2 flex flex-col gap-2.5">
            {header.ctaEnabled !== false && (
              <button
                onClick={() => {
                  handleCtaClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] py-3 rounded-full text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-all"
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
                className="w-full border border-[#D9DED1] bg-[#FDFCF8] hover:bg-[#F5F1EB] text-[#4A5D3B] py-2.5 rounded-full text-xs font-bold flex items-center justify-center gap-2 transition-all"
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
