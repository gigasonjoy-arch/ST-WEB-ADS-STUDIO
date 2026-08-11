import React, { useState } from 'react';
import { CaseStudy } from '../../types';
import { CheckCircle2, TrendingUp, ExternalLink, ShieldCheck, Eye, Sparkles, Filter, ChevronRight, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface CaseStudiesSectionProps {
  caseStudies?: CaseStudy[];
  onOpenLeadForm?: () => void;
  onOpenLeadFormWithContext?: (data: any) => void;
}

export const CaseStudiesSection: React.FC<CaseStudiesSectionProps> = ({
  caseStudies = [],
  onOpenLeadForm,
  onOpenLeadFormWithContext
}) => {
  const { language, t } = useLanguage();
  const [selectedIndustry, setSelectedIndustry] = useState<string>('All');
  const [activeProofModal, setActiveProofModal] = useState<CaseStudy | null>(null);

  const safeCaseStudies = caseStudies || [];
  const industries = ['All', ...Array.from(new Set(safeCaseStudies.map(c => c.industry).filter(Boolean)))];

  const filtered = safeCaseStudies.filter(c => {
    if (selectedIndustry === 'All') return true;
    return c.industry === selectedIndustry;
  });

  const handleOpenLead = () => {
    if (onOpenLeadFormWithContext) {
      onOpenLeadFormWithContext({ interestedService: 'Case Study Strategy Consultation' });
    } else if (onOpenLeadForm) {
      onOpenLeadForm();
    }
  };

  return (
    <section id="results" className="py-20 lg:py-28 bg-[#F5F1EB] border-y border-[#D9DED1]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-block px-3 py-1 bg-[#E8EAE2] rounded-full text-[10px] uppercase tracking-[0.2em] text-[#4A5D3B] font-bold">
              {t('cs.badge')}
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-[#2C3327]">
              {t('cs.title')}
            </h2>
            <p className="text-sm sm:text-base text-[#5C6652] leading-relaxed">
              {t('cs.subtitle')}
            </p>
          </div>

          {/* Industry Filter Pills */}
          <div className="flex flex-wrap gap-2 items-center">
            {industries.map((ind) => (
              <button
                key={ind}
                onClick={() => setSelectedIndustry(ind)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  selectedIndustry === ind
                    ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs'
                    : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#E8EAE2]'
                }`}
              >
                {ind === 'All' ? (language === 'en' ? 'All Categories' : 'সব ক্যাটাগরি') : ind}
              </button>
            ))}
          </div>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {filtered.map((cs) => (
            <div
              key={cs.id}
              className={`bg-[#FFFFFF] rounded-[32px] border ${
                cs.isVerifiedReport ? 'border-[#4A5D3B]/40 ring-2 ring-[#4A5D3B]/10' : 'border-[#D9DED1]'
              } p-7 flex flex-col justify-between shadow-sm hover:shadow-md transition-all group`}
            >
              <div>
                {/* Top Meta & Badges */}
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-3 py-1 bg-[#F5F1EB] rounded-full text-[10px] uppercase tracking-wider font-bold text-[#A69076]">
                    {language === 'en' ? (cs.industryEn || cs.industry) : (cs.industryBn || cs.industry)}
                  </span>
                  <span className="px-2.5 py-0.5 bg-[#E8EAE2] rounded-full text-[10px] font-semibold text-[#4A5D3B]">
                    {cs.platform} Ads
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-serif text-xl font-bold text-[#2C3327] mb-3 leading-snug group-hover:text-[#4A5D3B] transition-colors">
                  {language === 'en' ? (cs.titleEn || cs.title) : (cs.titleBn || cs.title)}
                </h3>

                {/* Verified internal banner */}
                {cs.isVerifiedReport && (
                  <div className="mb-4 bg-[#E8EAE2]/60 rounded-xl p-3 border border-[#D9DED1] flex items-start gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-[#4A5D3B] shrink-0 mt-0.5" />
                    <p className="text-[11px] text-[#4A5D3B] font-medium leading-relaxed">
                      {language === 'en' ? 'Verified internal audit dataset across 126 active ad groups.' : 'অভ্যন্তরীণ ১২৬টি অ্যাড গ্রুপ সমন্বিত ভেরিফায়েড অডিট ডেটা।'}
                    </p>
                  </div>
                )}

                {/* Result Summary */}
                <p className="text-xs text-[#5C6652] leading-relaxed mb-6">
                  {language === 'en' ? (cs.resultSummaryEn || cs.resultSummary) : (cs.resultSummaryBn || cs.resultSummary)}
                </p>

                {/* Core Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 py-4 border-y border-[#D9DED1]/60 mb-6 bg-[#FDFCF8] rounded-2xl p-3.5">
                  {cs.adSpendBDT !== undefined && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8A957F]">{t('cs.spend')}</div>
                      <div className="text-sm font-serif font-bold text-[#2C3327]">
                        ৳{cs.adSpendBDT.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {cs.impressions !== undefined && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8A957F]">{t('cs.impressions')}</div>
                      <div className="text-sm font-serif font-bold text-[#2C3327]">
                        {cs.impressions > 1000000 
                          ? `${(cs.impressions / 1000000).toFixed(2)}M` 
                          : cs.impressions.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {cs.conversations !== undefined && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8A957F]">Conversations</div>
                      <div className="text-sm font-serif font-bold text-[#4A5D3B]">
                        {cs.conversations.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {cs.leads !== undefined && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8A957F]">{t('cs.leads')}</div>
                      <div className="text-sm font-serif font-bold text-[#4A5D3B]">
                        {cs.leads.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {cs.purchases !== undefined && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8A957F]">Purchases</div>
                      <div className="text-sm font-serif font-bold text-[#4A5D3B]">
                        {cs.purchases.toLocaleString('en-IN')}
                      </div>
                    </div>
                  )}

                  {cs.roas !== undefined && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8A957F]">{t('cs.roas')}</div>
                      <div className="text-sm font-serif font-bold text-[#E2725B]">
                        {cs.roas}x
                      </div>
                    </div>
                  )}

                  {cs.cpa !== undefined && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8A957F]">CPA / Cost</div>
                      <div className="text-sm font-serif font-bold text-[#2C3327]">
                        ৳{cs.cpa}
                      </div>
                    </div>
                  )}

                  {cs.ctr !== undefined && (
                    <div>
                      <div className="text-[10px] uppercase font-bold text-[#8A957F]">CTR</div>
                      <div className="text-sm font-serif font-bold text-[#2C3327]">
                        {cs.ctr}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button & Proof Trigger */}
              <div className="flex items-center justify-between pt-2">
                {cs.proofImage ? (
                  <button
                    onClick={() => setActiveProofModal(cs)}
                    className="text-xs font-semibold text-[#4A5D3B] hover:text-[#2C3327] flex items-center gap-1.5 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>{t('cs.viewProof')}</span>
                  </button>
                ) : (
                  <span className="text-[11px] text-[#8A957F]">Verified Metrics</span>
                )}

                <button
                  onClick={handleOpenLead}
                  className="p-2.5 rounded-full bg-[#E8EAE2] text-[#4A5D3B] hover:bg-[#4A5D3B] hover:text-[#FDFCF8] transition-colors"
                  title={language === 'en' ? 'Discuss Similar Campaign' : 'এই ধরণের রেজাল্ট আলোচনা করুন'}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Disclaimer Note */}
        <div className="mt-12 p-6 rounded-2xl bg-[#E8EAE2]/50 border border-[#D9DED1] text-center max-w-3xl mx-auto">
          <p className="text-xs text-[#5C6652] leading-relaxed">
            {language === 'en' 
              ? '*The figures above reflect historical performance data from managed client campaigns. Individual outcomes vary based on product positioning, unique value propositions, landing page conversion rates, market seasonality, and ad creative quality.' 
              : '*উপরের পরিসংখ্যানগুলো অতীতের বাস্তব ক্যাম্পেইন ডেটা। প্রতিটি ব্যবসার ফলাফল প্রোডাক্টের কোয়ালিটি, ইউনিক সেলিং প্রপোজিশন, মার্কেট ডিমান্ড এবং ক্রিয়েটিভ কোয়ালিটির ওপর নির্ভর করে। আমরা কোনো নির্দিষ্ট সংখ্যার অন্ধ গ্যারান্টি প্রদান করি না।'}
          </p>
        </div>

      </div>

      {/* Proof Screenshot / Detail Modal */}
      {activeProofModal && (
        <div className="fixed inset-0 z-50 bg-[#2C3327]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
          <div className="bg-[#FFFFFF] rounded-[32px] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#D9DED1] shadow-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-4 border-b border-[#D9DED1]">
              <div>
                <span className="px-3 py-1 bg-[#F5F1EB] rounded-full text-[10px] uppercase font-bold text-[#A69076]">
                  {language === 'en' ? (activeProofModal.industryEn || activeProofModal.industry) : (activeProofModal.industryBn || activeProofModal.industry)} • {activeProofModal.platform} Ads
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2C3327] mt-1">
                  {language === 'en' ? (activeProofModal.titleEn || activeProofModal.title) : (activeProofModal.titleBn || activeProofModal.title)}
                </h3>
              </div>
              <button
                onClick={() => setActiveProofModal(null)}
                className="p-2 rounded-full hover:bg-[#F5F1EB] text-[#8A957F] hover:text-[#2C3327]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-6 space-y-4">
              {activeProofModal.proofImage && (
                <div className="rounded-2xl overflow-hidden border border-[#D9DED1] bg-[#F5F1EB]">
                  <img
                    src={activeProofModal.proofImage}
                    alt={activeProofModal.title}
                    className="w-full h-auto object-cover max-h-80"
                  />
                </div>
              )}

              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F]">
                  {language === 'en' ? 'Campaign Overview & Strategy:' : 'ক্যাম্পেইন বিবরণ ও স্ট্র্যাটেজি:'}
                </div>
                <p className="text-xs text-[#5C6652] leading-relaxed">
                  {language === 'en' ? (activeProofModal.textDescriptionEn || activeProofModal.textDescription) : (activeProofModal.textDescriptionBn || activeProofModal.textDescription)}
                </p>
              </div>

              {(activeProofModal.notes || activeProofModal.notesEn || activeProofModal.notesBn) && (
                <div className="p-3 bg-[#E8EAE2]/50 rounded-xl text-[11px] text-[#4A5D3B]">
                  <strong>{language === 'en' ? 'Notes:' : 'নোট:'}</strong> {language === 'en' ? (activeProofModal.notesEn || activeProofModal.notes) : (activeProofModal.notesBn || activeProofModal.notes)}
                </div>
              )}
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
                  handleOpenLead();
                }}
                className="px-6 py-2.5 rounded-full bg-[#4A5D3B] text-[#FDFCF8] text-xs font-semibold"
              >
                {language === 'en' ? 'Deploy Similar Strategy' : 'একই স্ট্র্যাটেজিতে কাজ করতে চান?'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

