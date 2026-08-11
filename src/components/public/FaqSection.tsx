import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle, ArrowRight } from 'lucide-react';
import { FAQItem } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FaqSectionProps {
  faqs?: FAQItem[];
  onOpenLeadForm: () => void;
}

export const FaqSection: React.FC<FaqSectionProps> = ({ faqs = [], onOpenLeadForm }) => {
  const { language, t } = useLanguage();
  const safeFaqs = faqs || [];
  const [openId, setOpenId] = useState<string | null>(safeFaqs[0]?.id || null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const categories = [
    { id: 'all', labelEn: 'All Questions', labelBn: 'সব প্রশ্ন' },
    { id: 'tiktok', labelEn: 'TikTok Ads', labelBn: 'টিকটক অ্যাডস', matchKeys: ['TikTok Ads', 'tiktok'] },
    { id: 'pricing', labelEn: 'Pricing & Process', labelBn: 'খরচ ও প্রক্রিয়া', matchKeys: ['Pricing & Process', 'Services', 'Policies', 'Contact'] },
    { id: 'tracking', labelEn: 'Tracking & Pixel', labelBn: 'ট্র্যাকিং ও পিক্সেল', matchKeys: ['Tracking & Pixel', 'Calculator', 'tracking'] },
    { id: 'bio', labelEn: 'About Sonjoy', labelBn: 'সোনজয় সরকার', matchKeys: ['Sonjoy', 'Services & Bio', 'bio'] }
  ];

  const filteredFaqs = safeFaqs.filter(f => {
    if (selectedCategoryId === 'all') return true;
    const activeCat = categories.find(c => c.id === selectedCategoryId);
    if (!activeCat || !activeCat.matchKeys) return true;
    return activeCat.matchKeys.some(k => 
      f.category?.toLowerCase().includes(k.toLowerCase()) ||
      f.categoryEn?.toLowerCase().includes(k.toLowerCase()) ||
      f.categoryBn?.toLowerCase().includes(k.toLowerCase())
    );
  });

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 lg:py-28 bg-[#FDFCF8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-14 space-y-3">
          <div className="inline-block px-3 py-1 bg-[#E8EAE2] rounded-full text-[10px] uppercase tracking-[0.2em] text-[#4A5D3B] font-bold">
            {t('faq.badge')}
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C3327]">
            {t('faq.title')}
          </h2>
          <p className="text-sm sm:text-base text-[#5C6652] leading-relaxed">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs'
                  : 'bg-[#F5F1EB] text-[#5C6652] border border-[#D9DED1] hover:bg-[#E8EAE2]'
              }`}
            >
              {language === 'en' ? cat.labelEn : cat.labelBn}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {filteredFaqs.map((faq) => {
            const isOpen = openId === faq.id;
            const questionText = language === 'en' 
              ? (faq.questionEn || faq.question) 
              : (faq.questionBn || faq.question);
            const answerText = language === 'en' 
              ? (faq.answerEn || faq.answer) 
              : (faq.answerBn || faq.answer);

            return (
              <div
                key={faq.id}
                className={`bg-[#FFFFFF] rounded-2xl border transition-all ${
                  isOpen ? 'border-[#4A5D3B]/50 shadow-xs ring-1 ring-[#4A5D3B]/10' : 'border-[#D9DED1]'
                } overflow-hidden`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="font-serif text-base sm:text-lg font-bold text-[#2C3327]">
                    {questionText}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full bg-[#F5F1EB] text-[#4A5D3B] flex items-center justify-center shrink-0 transition-transform ${
                      isOpen ? 'rotate-180 bg-[#4A5D3B] text-[#FDFCF8]' : ''
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-6 sm:px-6 pt-1 text-xs sm:text-sm text-[#5C6652] leading-relaxed border-t border-[#D9DED1]/40 bg-[#FDFCF8]/50 animate-fadeIn">
                    <p>{answerText}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions CTA */}
        <div className="mt-14 p-8 rounded-3xl bg-[#F5F1EB] border border-[#D9DED1] text-center space-y-4">
          <h3 className="font-serif text-xl font-bold text-[#2C3327]">
            {language === 'en' ? 'Still have unanswered questions?' : 'আপনার প্রশ্নের উত্তর খুঁজে পাননি?'}
          </h3>
          <p className="text-xs text-[#5C6652] max-w-md mx-auto">
            {language === 'en' 
              ? 'Chat with our AI Strategy Assistant or message Sonjoy Sarkar directly on WhatsApp.' 
              : 'আমাদের এআই অ্যাসিস্ট্যান্টের সাথে চ্যাট করুন অথবা সরাসরি হোয়াটসঅ্যাপে সঞ্জয় সরকারের সাথে কথা বলুন।'}
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              onClick={onOpenLeadForm}
              className="px-6 py-2.5 bg-[#4A5D3B] text-[#FDFCF8] rounded-full text-xs font-semibold hover:bg-[#3A4533] transition-colors"
            >
              {language === 'en' ? 'Book Free Strategy Audit' : 'ফরম পূরণ করুন'}
            </button>
            <a
              href="https://wa.me/8801815124970"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-2.5 bg-[#FFFFFF] border border-[#D9DED1] text-[#4A5D3B] rounded-full text-xs font-semibold hover:bg-[#E8EAE2] transition-colors flex items-center gap-2"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Direct WhatsApp' : 'WhatsApp এ মেসেজ দিন'}</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};

