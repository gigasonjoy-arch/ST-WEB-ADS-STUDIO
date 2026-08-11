import React from 'react';
import { CheckCircle2, ArrowRight, ShoppingBag, Sparkles, Utensils, Smartphone, Store, ShieldCheck, Search, Sliders, Rocket, LineChart } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AudienceAndProcessProps {
  onOpenLeadForm: () => void;
}

export const AudienceAndProcess: React.FC<AudienceAndProcessProps> = ({ onOpenLeadForm }) => {
  const { language, t } = useLanguage();

  const targetBusinesses = language === 'en' ? [
    { title: "E-commerce Brands", icon: ShoppingBag, label: "E-commerce Brands & Online Shops", desc: "Website purchase conversion & retargeting funnel optimization" },
    { title: "Fashion & Apparel", icon: Sparkles, label: "Fashion, Clothing & Lifestyle", desc: "Short UGC video angles and trending sound creative testing" },
    { title: "Beauty & Cosmetics", icon: Sparkles, label: "Beauty, Skincare & Cosmetics", desc: "Ingredient demonstrations & high-trust social proof conversion" },
    { title: "Electronics & Gadgets", icon: Smartphone, label: "Electronics & Smart Gadgets", desc: "Feature walkthroughs & direct messaging purchase campaigns" },
    { title: "Food & Restaurant", icon: Utensils, label: "Food, Bakeries & Cloud Kitchens", desc: "Hyper-local geo-targeting & direct order delivery volume" },
    { title: "Local Service Businesses", icon: Store, label: "Local Services & Consultancies", desc: "High-intent lead generation & automated WhatsApp inquiries" }
  ] : [
    { title: "E-commerce Brands", icon: ShoppingBag, label: "ই-কমার্স ব্র্যান্ড ও অনলাইন শপ", desc: "ওয়েবসাইট পারচেজ ও রিটার্গেটিং অপটিমাইজেশন" },
    { title: "Fashion & Apparel", icon: Sparkles, label: "ফ্যাশন, ক্লথিং ও লাইফস্টাইল", desc: "UGC ভিডিও ও ট্রেন্ডিং ক্রিয়েটিভ টেস্ট" },
    { title: "Beauty & Cosmetics", icon: Sparkles, label: "বিউটি, স্কিনকেয়ার ও কসমেটিক্স", desc: "ইনগ্রিডিয়েন্ট ডেমো ও প্রুফ-বেসড কনভার্সন" },
    { title: "Electronics & Gadgets", icon: Smartphone, label: "ইলেকট্রনিক্স ও গ্যাজেট", desc: "ফিচার ওয়াকথ্রু ও ডিরেক্ট মেসেজিং ক্যাম্পেইন" },
    { title: "Food & Restaurant", icon: Utensils, label: "ফুড, বেকারি ও ক্লাউড কিচেন", desc: "লোকাল এরিয়া পিনপয়েন্টিং ও অর্ডার ড্রাইভ" },
    { title: "Local Service Businesses", icon: Store, label: "লোকাল সার্ভিস ও প্রফেশনাল সেবা", desc: "কোয়ালিফাইড লিড ও হোয়াটসঅ্যাপ কনভার্সেশন" }
  ];

  const steps = language === 'en' ? [
    {
      num: "01",
      title: t('process.s1.title'),
      eng: "Understand the Business & Market",
      desc: t('process.s1.desc'),
      icon: Search
    },
    {
      num: "02",
      title: t('process.s2.title'),
      eng: "Plan & Setup Tracking Infrastructure",
      desc: t('process.s2.desc'),
      icon: Sliders
    },
    {
      num: "03",
      title: t('process.s3.title'),
      eng: "Launch Structured Creative Angles",
      desc: t('process.s3.desc'),
      icon: Rocket
    },
    {
      num: "04",
      title: t('process.s4.title'),
      eng: "Scale & Optimize Based on Data",
      desc: t('process.s4.desc'),
      icon: LineChart
    }
  ] : [
    {
      num: "০১",
      title: "বিজনেস ও অফার অ্যানালাইসিস",
      eng: "Understand the Business & Market",
      desc: "আপনার প্রোডাক্টের প্রাইসিং, মার্জিন, টার্গেট অডিয়েন্স এবং বর্তমান ল্যান্ডিং পেজ বা মেসেজিং ফ্লো পুঙ্খানুপুঙ্খ অডিট করা।",
      icon: Search
    },
    {
      num: "০২",
      title: "ট্র্যাকিং ও পিক্সেল ইন্টিগ্রেশন",
      eng: "Plan & Setup Tracking Infrastructure",
      desc: "টিকটক পিক্সেল ও ফেসবুক কনভার্সন এপিআই (CAPI) নিখুঁতভাবে সেটআপ করা যাতে প্রতিটি ইভেন্ট নির্ভুল রেকর্ড হয়।",
      icon: Sliders
    },
    {
      num: "০৩",
      title: "ক্রিয়েটিভ টেস্টিং ও লঞ্চ",
      eng: "Launch Structured Creative Angles",
      desc: "৩-৫টি ভিন্ন ক্রিয়েটিভ অ্যাঙ্গেল (UGC, ডেমো, অফার) এবং ব্রড ও ইন্টারেস্ট অডিয়েন্সে ক্যাম্পেইন লাইভ করা।",
      icon: Rocket
    },
    {
      num: "০৪",
      title: "ডেটা-নির্ভর অপ্টিমাইজেশন",
      eng: "Scale & Optimize Based on Data",
      desc: "সাপ্তাহিক সিপিএ (CPA), সিটিআর (CTR) এবং আরওআই (ROAS) বিশ্লেষণ করে উইনিং অ্যাডে বাজেট স্কেল করা এবং দুর্বল অ্যাড বন্ধ করা।",
      icon: LineChart
    }
  ];

  return (
    <div className="space-y-24 py-16 bg-[#FDFCF8]">
      
      {/* SECTION 4: WHO THIS IS FOR */}
      <section id="audience" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-block px-3 py-1 bg-[#E8EAE2] rounded-full text-[10px] uppercase tracking-[0.2em] text-[#4A5D3B] font-bold">
            {t('audience.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C3327]">
            {t('audience.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#5C6652] leading-relaxed">
            {t('audience.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {targetBusinesses.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#FFFFFF] p-6 rounded-3xl border border-[#D9DED1] hover:border-[#4A5D3B]/40 hover:shadow-sm transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#F5F1EB] text-[#4A5D3B] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2C3327] mb-1">
                  {item.label}
                </h3>
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#8A957F] mb-2">
                  {item.title}
                </div>
                <p className="text-xs text-[#5C6652] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 5: HOW THE PROCESS WORKS */}
      <section id="process" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#E8EAE2]/50 rounded-[40px] border border-[#D9DED1] p-8 sm:p-12 lg:p-16">
          
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-block px-3 py-1 bg-[#FFFFFF] rounded-full text-[10px] uppercase tracking-[0.2em] text-[#4A5D3B] font-bold">
              {t('process.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#2C3327]">
              {t('process.title')}
            </h2>
            <p className="text-sm sm:text-base text-[#5C6652] leading-relaxed">
              {t('process.subtitle')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-[#FFFFFF] p-7 rounded-3xl border border-[#D9DED1] flex flex-col justify-between relative shadow-xs"
                >
                  <div>
                    <div className="flex items-center justify-between mb-5">
                      <span className="font-serif text-2xl font-bold text-[#E2725B]">
                        {step.num}
                      </span>
                      <div className="w-9 h-9 rounded-xl bg-[#F5F1EB] text-[#4A5D3B] flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h3 className="font-serif text-lg font-bold text-[#2C3327] mb-1">
                      {step.title}
                    </h3>
                    <div className="text-[10px] font-semibold text-[#8A957F] uppercase tracking-wider mb-3">
                      {step.eng}
                    </div>

                    <p className="text-xs text-[#5C6652] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={onOpenLeadForm}
              className="bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] px-8 py-3.5 rounded-full text-xs font-semibold tracking-wide transition-all shadow-xs inline-flex items-center gap-2"
            >
              <span>{language === 'en' ? 'Start Your Campaign Strategy' : 'আপনার ক্যাম্পেইন স্ট্র্যাটেজি শুরু করুন'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
};

