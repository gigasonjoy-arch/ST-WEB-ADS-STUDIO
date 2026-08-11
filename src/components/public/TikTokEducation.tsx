import React from 'react';
import { Smartphone, Users, Zap, AlertTriangle, CheckCircle2, TrendingUp, Lightbulb, PlayCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export const TikTokEducation: React.FC = () => {
  const { language, t } = useLanguage();

  const insights = language === 'en' ? [
    {
      title: t('tiktok.p1.title'),
      desc: t('tiktok.p1.desc'),
      icon: TrendingUp
    },
    {
      title: t('tiktok.p2.title'),
      desc: t('tiktok.p2.desc'),
      icon: Users
    },
    {
      title: t('tiktok.p3.title'),
      desc: t('tiktok.p3.desc'),
      icon: Smartphone
    }
  ] : [
    {
      title: "কম CPM ও ব্যাপক অর্গানিক রিচ",
      desc: "বাংলাদেশে ফেসবুকের তুলনায় টিকটকে প্রতি ১,০০০ ইমপ্রেশনের খরচ (CPM) এখনো তুলনামূলক অনেক কম। ফলে কম বাজেটে বড় অডিয়েন্সে পৌঁছানো সম্ভব।",
      icon: TrendingUp
    },
    {
      title: "অ্যাক্টিভ ও ডিসিশন-মেকার অডিয়েন্স",
      desc: "টিকটক এখন শুধু কিশোরদের প্ল্যাটফর্ম নয়। বাংলাদেশে ১৮ থেকে ৩৫ বছর বয়সী বিশাল সক্রিয় অনলাইন ক্রেতা গোষ্ঠী প্রতিদিন টিকটকে সময় কাটায়।",
      icon: Users
    },
    {
      title: "UGC ও নেটিভ ভিডিওর উচ্চ কনভার্সন",
      desc: "স্মার্টফোনে ধারণ করা বাস্তবমুখী আনবক্সিং বা রিভিউ ভিডিও (User Generated Content) ট্রেডিশনাল চকচকে টিভির বিজ্ঞাপনের চেয়ে ৩ গুণ বেশি বিশ্বাস তৈরি করে।",
      icon: Smartphone
    }
  ];

  const myths = language === 'en' ? [
    {
      myth: t('tiktok.m1.myth'),
      fact: t('tiktok.m1.fact')
    },
    {
      myth: t('tiktok.m2.myth'),
      fact: t('tiktok.m2.fact')
    },
    {
      myth: t('tiktok.m3.myth'),
      fact: t('tiktok.m3.fact')
    }
  ] : [
    {
      myth: "টিকটকে শুধু সস্তা বা ফ্রি জিনিস বিক্রি হয়",
      fact: "বাস্তবে সঠিক ট্র্যাকিং ও হাই-কোয়ালিটি UGC ভিডিও দিয়ে ১,৫০০ থেকে ৮,০০০ টাকার ফ্যাশন, গ্যাজেট ও স্কিনকেয়ার সফলভাবে বিক্রি হচ্ছে।"
    },
    {
      myth: "টিকটক বিজ্ঞাপনে কোনো পিক্সেল বা ট্র্যাকিং নেই",
      fact: "টিকটকের ফুল-ফিচার্ড Pixel এবং Events API রয়েছে যা দিয়ে AddToCart, InitiateCheckout ও Purchase নির্ভুলভাবে ট্র্যাক এবং অপটিমাইজ করা যায়।"
    },
    {
      myth: "প্রফেশনাল শুটিং ক্যামেরা ছাড়া ক্যাম্পেইন চলে না",
      fact: "টিকটক অ্যালগরিদম প্রাকৃতিক ও আনফিল্টার্ড স্মার্টফোন ভিডিওকে বেশি পুশ করে। দামি ক্যামেরা নয়, বরং প্রথম ৩ সেকেন্ডের হুক (Hook) সবচেয়ে জরুরি।"
    }
  ];

  return (
    <section id="tiktok-guide" className="py-20 lg:py-28 bg-[#FDFCF8] border-t border-[#D9DED1]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14 space-y-3">
          <div className="inline-block px-3 py-1 bg-[#E8EAE2] rounded-full text-[10px] uppercase tracking-[0.2em] text-[#4A5D3B] font-bold">
            {t('tiktok.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C3327]">
            {t('tiktok.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#5C6652] leading-relaxed">
            {t('tiktok.subtitle')}
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {insights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="bg-[#FFFFFF] p-7 rounded-3xl border border-[#D9DED1] shadow-xs hover:border-[#4A5D3B]/40 transition-all"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-bold text-[#2C3327] mb-2">
                  {item.title}
                </h3>
                <p className="text-xs text-[#5C6652] leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Myths vs Facts Box */}
        <div className="bg-[#2C3327] text-[#FDFCF8] rounded-[36px] p-8 sm:p-12 border border-[#3A4533]">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-[#E2725B]/20 text-[#E2725B] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-serif font-bold text-[#FDFCF8]">
                {t('tiktok.myths.title')}
              </h3>
              <p className="text-xs text-[#8A957F]">
                {t('tiktok.myths.sub')}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {myths.map((m, idx) => (
              <div key={idx} className="bg-[#3A4533]/80 p-6 rounded-2xl border border-[#4A5D3B]/40 space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#E2725B] tracking-wider">{t('tiktok.myth.label')}</span>
                  <p className="text-xs font-semibold text-[#FDFCF8] mt-0.5 leading-snug">
                    "{m.myth}"
                  </p>
                </div>
                <div className="pt-2 border-t border-[#4A5D3B]/30">
                  <span className="text-[10px] uppercase font-bold text-[#8A957F] tracking-wider">{t('tiktok.fact.label')}</span>
                  <p className="text-xs text-[#D9DED1] mt-0.5 leading-relaxed">
                    {m.fact}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

