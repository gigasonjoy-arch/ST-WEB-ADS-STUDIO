import React from 'react';
import { ArrowRight, Calculator, MessageCircle, CheckCircle2, TrendingUp, Sparkles, Shield } from 'lucide-react';
import { SiteSettings } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HeroProps {
  settings: SiteSettings;
  onOpenLeadForm: () => void;
  onScrollToCalculator: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  settings,
  onOpenLeadForm,
  onScrollToCalculator
}) => {
  const { language, t } = useLanguage();

  const whatsappRaw = settings?.whatsapp?.number || (settings as any)?.whatsappNumber || '+8801815124970';
  const whatsappClean = whatsappRaw ? whatsappRaw.replace(/\D/g, '') : '8801815124970';
  const whatsappDefaultMsg = settings?.whatsapp?.defaultMessage || 'Hello Sonjoy, I would like to schedule a strategy session for TikTok & Facebook Ads campaigns.';
  const whatsappUrl = `https://wa.me/${whatsappClean}?text=${encodeURIComponent(whatsappDefaultMsg)}`;

  return (
    <section id="hero" className="relative pt-12 pb-20 lg:pt-20 lg:pb-28 overflow-hidden bg-[#FDFCF8]">
      {/* Decorative Natural Organic Geometry */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#E8EAE2]/50 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#F5F1EB] rounded-full blur-2xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Value Proposition & Positioning */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Trust Pill / Verification Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#F5F1EB] border border-[#D9DED1] text-xs text-[#4A5D3B] font-medium shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#E2725B] animate-pulse"></span>
              <span className="font-semibold">{settings.personalName}</span>
              <span className="text-[#8A957F]">•</span>
              <span className="text-[#5C6652]">{language === 'en' ? 'Performance Marketing Specialist (TikTok & Meta Ads)' : settings.titleBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2C3327] font-normal leading-[1.25] tracking-tight">
              {language === 'en' ? t('hero.headline') : settings.heroHeadline}
            </h1>

            {/* Subheadline & Honest Positioning */}
            <p className="text-base sm:text-lg text-[#5C6652] leading-relaxed max-w-2xl">
              {language === 'en' ? t('hero.subheadline') : settings.heroSubheadline}
            </p>

            {/* Core Methodology Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9DED1] shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center mb-2">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F]">{t('hero.pillar.tracking.title')}</div>
                <div className="text-sm font-semibold text-[#2C3327] mt-0.5">{t('hero.pillar.tracking.desc')}</div>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9DED1] shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-[#F5F1EB] text-[#A69076] flex items-center justify-center mb-2">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F]">{t('hero.pillar.creative.title')}</div>
                <div className="text-sm font-semibold text-[#2C3327] mt-0.5">{t('hero.pillar.creative.desc')}</div>
              </div>

              <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9DED1] shadow-xs">
                <div className="w-7 h-7 rounded-xl bg-[#E2725B]/10 text-[#E2725B] flex items-center justify-center mb-2">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F]">{t('hero.pillar.optimization.title')}</div>
                <div className="text-sm font-semibold text-[#2C3327] mt-0.5">{t('hero.pillar.optimization.desc')}</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <button
                onClick={onOpenLeadForm}
                className="bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] px-7 py-4 rounded-full text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group"
                id="hero-primary-cta"
              >
                <span>{language === 'en' ? 'Book Free Strategy Audit' : settings.primaryCtaText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onScrollToCalculator}
                className="bg-[#FFFFFF] hover:bg-[#F5F1EB] text-[#2C3327] border border-[#D9DED1] px-6 py-4 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                id="hero-calculator-cta"
              >
                <Calculator className="w-4 h-4 text-[#4A5D3B]" />
                <span>{language === 'en' ? 'Predict Ads ROI' : settings.secondaryCtaText}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#4A5D3B] hover:text-[#2C3327] p-2 flex items-center justify-center gap-1.5 transition-colors"
                id="hero-whatsapp-link"
              >
                <MessageCircle className="w-4 h-4 text-[#4A5D3B]" />
                <span>{language === 'en' ? 'Talk on WhatsApp' : 'WhatsApp এ কথা বলুন'}</span>
              </a>
            </div>

          </div>

          {/* Right Column: Specialist Profile & Performance Snapshot */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#2C3327] text-[#FDFCF8] rounded-[36px] p-8 sm:p-10 shadow-xl border border-[#3A4533] overflow-hidden">
              
              {/* Top Profile Header */}
              <div className="flex items-center gap-5 pb-8 border-b border-[#3A4533]">
                <div className="w-20 h-20 rounded-2xl bg-[#E8EAE2] overflow-hidden border-2 border-[#8A957F]/40 shrink-0">
                  <img
                    src={settings.sonjoyImage}
                    alt={settings.personalName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 bg-[#4A5D3B] rounded-full text-[10px] uppercase tracking-widest text-[#FDFCF8] font-bold mb-1.5">
                    {t('hero.verifiedPractitioner')}
                  </div>
                  <h2 className="text-xl font-serif text-[#FDFCF8] font-bold">{settings.personalName}</h2>
                  <p className="text-xs text-[#8A957F]">{language === 'en' ? 'Performance Ads & Growth Specialist' : settings.sonjoyRole}</p>
                </div>
              </div>

              {/* Bio Summary */}
              <div className="py-6">
                <div className="text-[11px] uppercase tracking-wider font-bold text-[#8A957F] mb-2">{t('hero.profile.focus')}</div>
                <p className="text-xs leading-relaxed text-[#D9DED1]">
                  {language === 'en' ? t('hero.profile.bio') : settings.sonjoyBio}
                </p>
              </div>

              {/* Verified Account Metric Snapshot */}
              <div className="bg-[#3A4533]/80 rounded-2xl p-5 border border-[#4A5D3B]/40 space-y-3">
                <div className="flex items-center justify-between text-[11px] text-[#8A957F] font-semibold uppercase tracking-wider">
                  <span>{t('hero.stats.header')}</span>
                  <span className="text-[#E2725B] font-bold">{t('hero.stats.tag')}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <div className="text-[10px] text-[#8A957F] uppercase font-bold">{t('hero.stats.groups')}</div>
                    <div className="text-xl font-serif font-bold text-[#FDFCF8]">126 Groups</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A957F] uppercase font-bold">{t('hero.stats.impressions')}</div>
                    <div className="text-xl font-serif font-bold text-[#FDFCF8]">3.66M+</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A957F] uppercase font-bold">{t('hero.stats.conversations')}</div>
                    <div className="text-xl font-serif font-bold text-[#FDFCF8]">18,698</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A957F] uppercase font-bold">{t('hero.stats.leads')}</div>
                    <div className="text-xl font-serif font-bold text-[#FDFCF8]">1,316</div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-[#8A957F] italic border-t border-[#4A5D3B]/30">
                  {t('hero.stats.note')}
                </div>
              </div>

              {/* Target Platforms */}
              <div className="pt-6 flex items-center justify-between text-xs text-[#8A957F]">
                <span>{t('hero.platforms.primary')}: <strong className="text-[#FDFCF8]">TikTok Ads</strong></span>
                <span>•</span>
                <span>{t('hero.platforms.secondary')}: <strong className="text-[#FDFCF8]">Facebook Ads</strong></span>
                <span>•</span>
                <span><strong className="text-[#FDFCF8]">Bangladesh</strong></span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
