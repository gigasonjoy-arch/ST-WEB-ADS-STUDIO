import React from 'react';
import { ArrowRight, CheckCircle2, Shield, Video, Target, BarChart3, RefreshCw, Layers } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ServicesSectionProps {
  onOpenLeadForm: () => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onOpenLeadForm }) => {
  const { language, t } = useLanguage();

  const tiktokDeliverables = language === 'en' ? [
    "Business Center & TikTok Ad Account Setup",
    "TikTok Pixel & Standard/Custom Event Tracking",
    "Audience Research (Interest, Hashtag, Behavioral)",
    "UGC & Smartphone Video Hook / Creative Guidance",
    "Campaign Structure (Spark Ads & Native In-Feed)",
    "Bid Strategy & Budget Optimization",
    "Retargeting Funnel (ViewContent & AddToCart)",
    "Weekly Performance Reports & Optimization"
  ] : [
    "বিজনেস সেন্টার ও অ্যাড অ্যাকাউন্ট প্রফেশনাল সেটআপ",
    "টিকটক পিক্সেল ও কাস্টম ইভেন্ট নিখুঁত ট্র্যাকিং",
    "অডিয়েন্স রিসার্চ (ইন্টারেস্ট, হ্যাশট্যাগ ও বিহেভিওরাল)",
    "UGC ও স্মার্টফোন ভিডিও হুক / ক্রিয়েটিভ গাইডলাইন",
    "ক্যাম্পেইন স্ট্রাকচার (স্পার্ক অ্যাডস ও নেটিভ ইন-ফিড)",
    "বিড স্ট্র্যাটেজি ও বাজেট অপ্টিমাইজেশন",
    "রিটার্গেটিং ফানেল (ViewContent ও AddToCart)",
    "সাপ্তাহিক পারফরম্যান্স রিপোর্ট ও রিভিউ"
  ];

  const facebookDeliverables = language === 'en' ? [
    "Meta Business Manager & Ad Account Configuration",
    "Facebook Pixel & Conversions API (CAPI) Tracking",
    "Custom Audiences & Lookalike Modeling",
    "CBO (Advantage+ Budget) & ABO Split-Testing",
    "Catalog Sales / Dynamic Product Ads Setup",
    "Middle-of-Funnel & Bottom-of-Funnel Retargeting",
    "Creative Fatigue Detection & Refresh Guidelines",
    "Weekly ROAS & CPA Dashboard Reporting"
  ] : [
    "মেটা বিজনেস ম্যানেজার ও অ্যাড অ্যাকাউন্ট কনফিগারেশন",
    "ফেসবুক পিক্সেল ও কনভার্সন এপিআই (CAPI) ট্র্যাকিং",
    "কাস্টম অডিয়েন্স ও লুকেলাইক মডেলিং",
    "CBO (অ্যাডভান্টেজ+ বাজেট) ও ABO স্প্লিট-টেস্টিং",
    "ক্যাটালগ সেলস / ডায়নামিক প্রোডাক্ট অ্যাডস সেটআপ",
    "মিডল-অফ-ফানেল ও বটম-অফ-ফানেল রিটার্গেটিং",
    "ক্রিয়েটিভ ফ্যাটিগ ডিটেকশন ও রিফ্রেশ গাইডলাইন",
    "সাপ্তাহিক ROAS ও CPA ড্যাশবোর্ড রিপোর্টিং"
  ];

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#FDFCF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-block px-3 py-1 bg-[#E8EAE2] rounded-full text-[10px] uppercase tracking-[0.2em] text-[#4A5D3B] font-bold">
            {t('services.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C3327]">
            {t('services.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#5C6652] leading-relaxed">
            {t('services.subtitle')}
          </p>
        </div>

        {/* 2 Main Service Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Card 1: TikTok Ads Management (Primary Service) */}
          <div className="bg-[#FFFFFF] rounded-[36px] border border-[#D9DED1] p-8 sm:p-10 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-[#4A5D3B]/50 transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#E8EAE2]/40 rounded-bl-[100px] -z-0 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3.5 py-1 bg-[#4A5D3B] text-[#FDFCF8] rounded-full text-[10px] uppercase tracking-widest font-bold">
                  {t('services.tt.tag')}
                </span>
                <span className="text-xs font-semibold text-[#8A957F]">
                  {t('services.tt.sub')}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] mb-3">
                {t('services.tt.title')}
              </h3>

              <p className="text-xs sm:text-sm text-[#5C6652] leading-relaxed mb-8">
                {t('services.tt.desc')}
              </p>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F] mb-3">
                  {t('services.tt.includes')}
                </div>
                {tiktokDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[#2C3327]">
                    <div className="w-4 h-4 rounded-full bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 relative z-10">
              <button
                onClick={onOpenLeadForm}
                className="w-full bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] py-3.5 rounded-full text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('services.tt.cta')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Facebook Ads Management (Secondary Service) */}
          <div className="bg-[#FFFFFF] rounded-[36px] border border-[#D9DED1] p-8 sm:p-10 shadow-sm relative overflow-hidden flex flex-col justify-between group hover:border-[#8A957F] transition-all">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F5F1EB] rounded-bl-[100px] -z-0 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <span className="px-3.5 py-1 bg-[#F5F1EB] text-[#5C6652] border border-[#D9DED1] rounded-full text-[10px] uppercase tracking-widest font-bold">
                  {t('services.fb.tag')}
                </span>
                <span className="text-xs font-semibold text-[#8A957F]">
                  {t('services.fb.sub')}
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] mb-3">
                {t('services.fb.title')}
              </h3>

              <p className="text-xs sm:text-sm text-[#5C6652] leading-relaxed mb-8">
                {t('services.fb.desc')}
              </p>

              <div className="space-y-3 pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F] mb-3">
                  {t('services.fb.includes')}
                </div>
                {facebookDeliverables.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-[#2C3327]">
                    <div className="w-4 h-4 rounded-full bg-[#F5F1EB] text-[#A69076] flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-10 relative z-10">
              <button
                onClick={onOpenLeadForm}
                className="w-full bg-[#FFFFFF] hover:bg-[#F5F1EB] text-[#2C3327] border border-[#D9DED1] py-3.5 rounded-full text-xs font-semibold tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                <span>{t('services.fb.cta')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
