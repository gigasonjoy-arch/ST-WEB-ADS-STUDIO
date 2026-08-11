import React, { useState } from 'react';
import { Menu, X, ArrowRight, ShieldCheck, Sparkles, MessageCircle, Globe, Lock } from 'lucide-react';
import { SiteSettings } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HeaderProps {
  settings: SiteSettings;
  onOpenLeadForm: () => void;
  onNavigateSection: (sectionId: string) => void;
  onOpenAdmin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onOpenLeadForm,
  onNavigateSection,
  onOpenAdmin
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language, setLanguage, toggleLanguage, t } = useLanguage();

  const whatsappRaw = settings?.whatsapp?.number || settings?.whatsappNumber || '+8801815124970';
  const whatsappClean = whatsappRaw ? whatsappRaw.replace(/\D/g, '') : '8801815124970';
  const whatsappDefaultMsg = settings?.whatsapp?.defaultMessage || 'Hello Sonjoy, I would like to schedule a strategy session for TikTok & Facebook Ads campaigns.';
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(whatsappDefaultMsg)}`;

  const navItems = [
    { label: t('nav.home'), id: 'hero' },
    { label: t('nav.services'), id: 'services' },
    { label: t('nav.caseStudies'), id: 'results' },
    { label: t('nav.tiktok'), id: 'tiktok-guide' },
    { label: t('nav.calculator'), id: 'calculator' },
    { label: t('nav.faq'), id: 'faq' },
  ];

  const handleNavClick = (id: string) => {
    onNavigateSection(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FDFCF8]/95 backdrop-blur-md border-b border-[#D9DED1] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand & Personal Signature */}
        <div 
          onClick={() => handleNavClick('hero')} 
          className="cursor-pointer flex items-center gap-3 group"
          id="header-brand-logo"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center font-serif text-lg font-bold shadow-xs transition-transform group-hover:scale-105">
            ST
          </div>
          <div>
            <div className="font-serif text-xl font-bold tracking-tight text-[#2C3327] group-hover:text-[#4A5D3B] transition-colors flex items-center gap-1.5">
              <span>{settings.brandName}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]"></span>
            </div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-[#8A957F] font-semibold">
              {settings.personalName} • Performance Marketing
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-[#5C6652]" id="desktop-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="hover:text-[#2C3327] transition-colors relative py-1 focus:outline-none whitespace-nowrap"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Header Actions */}
        <div className="hidden sm:flex items-center gap-2.5">
          {/* Language Switcher */}
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

          {/* Admin Portal Quick Access */}
          <button
            onClick={onOpenAdmin}
            className="p-2.5 rounded-full border border-[#D9DED1] text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] transition-colors"
            title="Admin Login (Default: stweb2025)"
            id="header-admin-btn"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* WhatsApp Icon */}
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

          {/* Primary CTA */}
          <button
            onClick={onOpenLeadForm}
            className="bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide shadow-xs transition-all flex items-center gap-2 whitespace-nowrap"
            id="header-primary-cta"
          >
            <span>{language === 'en' ? 'Book Free Audit' : settings.primaryCtaText}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Controls (Lang + Menu) */}
        <div className="flex sm:hidden items-center gap-2">
          {/* Mobile Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1.5 rounded-xl border border-[#D9DED1] bg-[#F5F1EB] text-xs font-bold text-[#4A5D3B] flex items-center gap-1"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'en' ? 'EN' : 'বাং'}</span>
          </button>

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

          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className="text-left py-2.5 text-base font-medium text-[#2C3327] border-b border-[#D9DED1]/40"
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => {
                onOpenAdmin();
                setMobileMenuOpen(false);
              }}
              className="text-left py-2.5 text-sm font-semibold text-[#4A5D3B] flex items-center gap-2 border-b border-[#D9DED1]/40"
            >
              <Lock className="w-4 h-4" />
              <span>{language === 'en' ? 'Admin Studio (Login: stweb2025)' : 'অ্যাডমিন স্টুডিও (লগইন: stweb2025)'}</span>
            </button>
          </nav>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                onOpenLeadForm();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-[#4A5D3B] text-[#FDFCF8] py-3 rounded-full text-sm font-semibold flex items-center justify-center gap-2"
            >
              <span>{language === 'en' ? 'Book Free Ad Audit' : settings.primaryCtaText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full border border-[#D9DED1] text-[#4A5D3B] py-2.5 rounded-full text-xs font-semibold flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{language === 'en' ? 'Chat Directly on WhatsApp' : 'WhatsApp-এ সরাসরি কথা বলুন'}</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
