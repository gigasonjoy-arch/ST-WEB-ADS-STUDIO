import React from 'react';
import { ArrowRight, Calculator, MessageCircle, CheckCircle2, TrendingUp, Sparkles, Shield } from 'lucide-react';
import { SiteSettings } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface HeroProps {
  settings: SiteSettings;
  onOpenLeadForm: () => void;
  onScrollToCalculator: () => void;
}

const hasBengali = (text?: string) => Boolean(text && /[\u0980-\u09FF]/.test(text));

export const Hero: React.FC<HeroProps> = ({
  settings,
  onOpenLeadForm,
  onScrollToCalculator
}) => {
  const { language, t } = useLanguage();

  const isBn = language === 'bn';

  const headline = isBn
    ? (settings.heroHeadlineBn || (hasBengali(settings.heroHeadline) ? settings.heroHeadline : t('hero.headline')))
    : (settings.heroHeadlineEn || (!hasBengali(settings.heroHeadline) ? settings.heroHeadline : t('hero.headline')));

  const subheadline = isBn
    ? (settings.heroSubheadlineBn || (hasBengali(settings.heroSubheadline) ? settings.heroSubheadline : t('hero.subheadline')))
    : (settings.heroSubheadlineEn || (!hasBengali(settings.heroSubheadline) ? settings.heroSubheadline : t('hero.subheadline')));

  const titleBadge = isBn
    ? (settings.titleBadgeBn || (hasBengali(settings.titleBadge) ? settings.titleBadge : t('hero.badge')))
    : (settings.titleBadgeEn || (!hasBengali(settings.titleBadge) ? settings.titleBadge : t('hero.badge')));

  const primaryCta = isBn
    ? (settings.primaryCtaTextBn || (hasBengali(settings.primaryCtaText) ? settings.primaryCtaText : t('hero.cta.primary')))
    : (settings.primaryCtaTextEn || (!hasBengali(settings.primaryCtaText) ? settings.primaryCtaText : t('hero.cta.primary')));

  const secondaryCta = isBn
    ? (settings.secondaryCtaTextBn || (hasBengali(settings.secondaryCtaText) ? settings.secondaryCtaText : t('hero.cta.secondary')))
    : (settings.secondaryCtaTextEn || (!hasBengali(settings.secondaryCtaText) ? settings.secondaryCtaText : t('hero.cta.secondary')));

  const heroBadge = isBn
    ? (settings.heroBadgeTextBn || (hasBengali(settings.heroBadgeText) ? settings.heroBadgeText : t('hero.verifiedPractitioner')))
    : (settings.heroBadgeTextEn || (!hasBengali(settings.heroBadgeText) ? settings.heroBadgeText : t('hero.verifiedPractitioner')));

  const personalName = isBn
    ? (settings.personalNameBn || settings.personalName || 'সঞ্জয় সরকার')
    : (settings.personalName || 'Sonjoy Sarkar');

  const sonjoyRole = isBn
    ? (settings.sonjoyRoleBn || (hasBengali(settings.sonjoyRole) ? settings.sonjoyRole : 'পারফরম্যান্স অ্যাডস স্পেশালিস্ট'))
    : (settings.sonjoyRoleEn || (!hasBengali(settings.sonjoyRole) ? settings.sonjoyRole : 'Performance Ads & Growth Specialist'));

  const specialistFocusTitle = isBn
    ? (settings.heroSpecialistFocusTitleBn || t('hero.profile.focus'))
    : (settings.heroSpecialistFocusTitleEn || (!hasBengali(settings.heroSpecialistFocusTitle) ? settings.heroSpecialistFocusTitle : 'SPECIALIST FOCUS:'));

  const sonjoyBio = isBn
    ? (settings.sonjoyBioBn || (hasBengali(settings.sonjoyBio) ? settings.sonjoyBio : t('hero.profile.bio')))
    : (settings.sonjoyBioEn || (!hasBengali(settings.sonjoyBio) ? settings.sonjoyBio : t('hero.profile.bio')));

  const statGroups = isBn
    ? (settings.heroStatAdGroupsBn || (hasBengali(settings.heroStatAdGroups) ? settings.heroStatAdGroups : '১২৬টি অ্যাড গ্রুপ'))
    : (settings.heroStatAdGroups || '126 Groups');

  const statImpressions = isBn
    ? (settings.heroStatImpressionsBn || (hasBengali(settings.heroStatImpressions) ? settings.heroStatImpressions : '৩.৬৬ মিলিয়ন+'))
    : (settings.heroStatImpressions || '3.66M+');

  const statConversations = isBn
    ? (settings.heroStatConversationsBn || (hasBengali(settings.heroStatConversations) ? settings.heroStatConversations : '১৮,৬৯৮টি'))
    : (settings.heroStatConversations || '18,698');

  const statLeads = isBn
    ? (settings.heroStatLeadsBn || (hasBengali(settings.heroStatLeads) ? settings.heroStatLeads : '১,৩১৬টি'))
    : (settings.heroStatLeads || '1,316');

  const primaryPlatform = isBn
    ? (settings.heroPrimaryPlatformBn || settings.heroPrimaryPlatform || 'TikTok Ads')
    : (settings.heroPrimaryPlatform || 'TikTok Ads');

  const secondaryPlatform = isBn
    ? (settings.heroSecondaryPlatformBn || settings.heroSecondaryPlatform || 'Facebook Ads')
    : (settings.heroSecondaryPlatform || 'Facebook Ads');

  const targetRegion = isBn
    ? (settings.heroTargetRegionBn || 'মার্কেট: বাংলাদেশ')
    : (settings.heroTargetRegion || 'Bangladesh');

  const whatsappRaw = settings?.whatsapp?.number || (settings as any)?.whatsappNumber || '+8801815124970';
  const whatsappClean = whatsappRaw ? whatsappRaw.replace(/\D/g, '') : '8801815124970';
  const whatsappDefaultMsg = isBn
    ? 'হ্যালো সঞ্জয়, আমি টিকটক ও ফেসবুক অ্যাডস ক্যাম্পেইনের জন্য একটি স্ট্র্যাটেজি সেশন বুক করতে চাই।'
    : (settings?.whatsapp?.defaultMessage || 'Hello Sonjoy, I would like to schedule a strategy session for TikTok & Facebook Ads campaigns.');
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
              <span className="font-semibold">{personalName}</span>
              <span className="text-[#8A957F]">•</span>
              <span className="text-[#5C6652]">{titleBadge}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#2C3327] font-normal leading-[1.25] tracking-tight">
              {headline}
            </h1>

            {/* Subheadline & Honest Positioning */}
            <p className="text-base sm:text-lg text-[#5C6652] leading-relaxed max-w-2xl">
              {subheadline}
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
                className="bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] px-7 py-4 rounded-full text-sm font-semibold tracking-wide shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3 group cursor-pointer"
                id="hero-primary-cta"
              >
                <span>{primaryCta}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={onScrollToCalculator}
                className="bg-[#FFFFFF] hover:bg-[#F5F1EB] text-[#2C3327] border border-[#D9DED1] px-6 py-4 rounded-full text-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                id="hero-calculator-cta"
              >
                <Calculator className="w-4 h-4 text-[#4A5D3B]" />
                <span>{secondaryCta}</span>
              </button>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#4A5D3B] hover:text-[#2C3327] p-2 flex items-center justify-center gap-1.5 transition-colors"
                id="hero-whatsapp-link"
              >
                <MessageCircle className="w-4 h-4 text-[#4A5D3B]" />
                <span>{isBn ? 'WhatsApp এ কথা বলুন' : 'Talk on WhatsApp'}</span>
              </a>
            </div>

          </div>

          {/* Right Column: Specialist Profile & Performance Snapshot */}
          <div className="lg:col-span-5">
            <div className="relative bg-[#2C3327] text-[#FDFCF8] rounded-[36px] p-8 sm:p-10 shadow-xl border border-[#3A4533] overflow-hidden">
              
              {/* Top Profile Header */}
              <div className="flex items-center gap-5 pb-8 border-b border-[#3A4533]">
                <div className="w-20 h-20 rounded-2xl bg-[#E8EAE2] overflow-hidden border-2 border-[#8A957F]/40 shrink-0 shadow-inner">
                  <img
                    src={settings.sonjoyImage}
                    alt={personalName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="inline-block px-2.5 py-0.5 bg-[#4A5D3B] rounded-full text-[10px] uppercase tracking-widest text-[#FDFCF8] font-bold mb-1.5 shadow-2xs">
                    {heroBadge}
                  </div>
                  <h2 className="text-xl font-serif text-[#FDFCF8] font-bold">{personalName}</h2>
                  <p className="text-xs text-[#8A957F]">{sonjoyRole}</p>
                </div>
              </div>

              {/* Bio Summary */}
              <div className="py-6">
                <div className="text-[11px] uppercase tracking-wider font-bold text-[#8A957F] mb-2">
                  {specialistFocusTitle}
                </div>
                <p className="text-xs leading-relaxed text-[#D9DED1]">
                  {sonjoyBio}
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
                    <div className="text-xl font-serif font-bold text-[#FDFCF8]">{statGroups}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A957F] uppercase font-bold">{t('hero.stats.impressions')}</div>
                    <div className="text-xl font-serif font-bold text-[#FDFCF8]">{statImpressions}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A957F] uppercase font-bold">{t('hero.stats.conversations')}</div>
                    <div className="text-xl font-serif font-bold text-[#FDFCF8]">{statConversations}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-[#8A957F] uppercase font-bold">{t('hero.stats.leads')}</div>
                    <div className="text-xl font-serif font-bold text-[#FDFCF8]">{statLeads}</div>
                  </div>
                </div>

                <div className="pt-2 text-[10px] text-[#8A957F] italic border-t border-[#4A5D3B]/30">
                  {t('hero.stats.note')}
                </div>
              </div>

              {/* Target Platforms */}
              <div className="pt-6 flex items-center justify-between text-xs text-[#8A957F]">
                <span>{t('hero.platforms.primary')}: <strong className="text-[#FDFCF8]">{primaryPlatform}</strong></span>
                <span>•</span>
                <span>{t('hero.platforms.secondary')}: <strong className="text-[#FDFCF8]">{secondaryPlatform}</strong></span>
                <span>•</span>
                <span><strong className="text-[#FDFCF8]">{targetRegion}</strong></span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
