import React, { useState } from 'react';
import { FileText, Plus, Edit3, Trash2, ShieldCheck, Eye, CheckCircle2, X } from 'lucide-react';
import { CaseStudy } from '../../types';
import { storageService } from '../../services/storageService';

interface CaseStudyManagementProps {
  caseStudies?: CaseStudy[];
  onSaveCaseStudy?: (study: CaseStudy) => void;
  onDeleteCaseStudy?: (id: string) => void;
  onRefresh?: () => void;
}

export const CaseStudyManagement: React.FC<CaseStudyManagementProps> = ({
  caseStudies: propCaseStudies,
  onSaveCaseStudy,
  onDeleteCaseStudy,
  onRefresh
}) => {
  const [internalStudies, setInternalStudies] = useState<CaseStudy[]>(() => storageService.getCaseStudies());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentStudy, setCurrentStudy] = useState<Partial<CaseStudy>>({});

  const caseStudies = propCaseStudies || internalStudies;

  const refreshData = () => {
    setInternalStudies(storageService.getCaseStudies());
    if (onRefresh) onRefresh();
  };

  const handleOpenNew = () => {
    setCurrentStudy({
      id: `cs_${Date.now()}`,
      title: '',
      clientName: '',
      industry: 'Fashion & Apparel',
      platform: 'TIKTOK',
      status: 'PUBLISHED',
      isVerifiedReport: false,
      resultSummary: '',
      textDescription: '',
      adSpendBDT: 25000,
      impressions: 500000,
      roas: 3.5,
      cpa: 140
    });
    setIsEditing(true);
  };

  const handleEdit = (cs: CaseStudy) => {
    setCurrentStudy({ ...cs });
    setIsEditing(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudy.title || !currentStudy.resultSummary) return;

    const updated = currentStudy as CaseStudy;
    storageService.saveCaseStudy(updated);
    if (onSaveCaseStudy) onSaveCaseStudy(updated);
    refreshData();
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327]">
            কেস স্টাডি ও ক্যাম্পেইন প্রুফ ম্যানেজমেন্ট
          </h1>
          <p className="text-xs text-[#5C6652] mt-1">
            ওয়েবসাইটে প্রদর্শিত বাস্তব ক্যাম্পেইন ফলাফল, মেট্রিক্স ও অডিট রিপোর্ট পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-[#4A5D3B] text-[#FDFCF8] rounded-xl text-xs font-semibold hover:bg-[#3A4533] flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন কেস স্টাডি যোগ করুন</span>
        </button>
      </div>

      {/* Case Study Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {caseStudies.map((cs) => (
          <div
            key={cs.id}
            className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] p-6 shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 bg-[#F5F1EB] rounded-full text-[10px] uppercase font-bold text-[#A69076]">
                  {cs.industry}
                </span>
                <div className="flex items-center gap-1.5">
                  {cs.isVerifiedReport && (
                    <span className="px-2 py-0.5 bg-[#E8EAE2] rounded-full text-[10px] font-bold text-[#4A5D3B] flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-[#8A957F]">{cs.platform}</span>
                </div>
              </div>

              <h3 className="font-serif text-base font-bold text-[#2C3327] mb-2 leading-snug">
                {cs.title}
              </h3>

              <p className="text-xs text-[#5C6652] mb-4 leading-relaxed line-clamp-3">
                {cs.resultSummary}
              </p>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 bg-[#FDFCF8] p-3 rounded-2xl border border-[#D9DED1]/60 text-xs mb-4">
                {cs.adSpendBDT && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#8A957F]">Ad Spend</div>
                    <div className="font-bold text-[#2C3327]">৳{cs.adSpendBDT.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {cs.conversations && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#8A957F]">Conversations</div>
                    <div className="font-bold text-[#4A5D3B]">{cs.conversations.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {cs.leads && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#8A957F]">Leads</div>
                    <div className="font-bold text-[#4A5D3B]">{cs.leads.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {cs.purchases && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#8A957F]">Purchases</div>
                    <div className="font-bold text-[#4A5D3B]">{cs.purchases.toLocaleString('en-IN')}</div>
                  </div>
                )}
                {cs.roas && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#8A957F]">ROAS</div>
                    <div className="font-bold text-[#E2725B]">{cs.roas}x</div>
                  </div>
                )}
                {cs.cpa && (
                  <div>
                    <div className="text-[9px] uppercase font-bold text-[#8A957F]">CPA</div>
                    <div className="font-bold text-[#2C3327]">৳{cs.cpa}</div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-[#D9DED1] flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                cs.status === 'PUBLISHED' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {cs.status}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleEdit(cs)}
                  className="p-1.5 rounded-lg bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]"
                  title="এডিট করুন"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`আপনি কি "${cs.title}" কেস স্টাডিটি মুছে ফেলতে চান?`)) {
                      storageService.deleteCaseStudy(cs.id);
                      if (onDeleteCaseStudy) onDeleteCaseStudy(cs.id);
                      refreshData();
                    }
                  }}
                  className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit / Create Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-[#2C3327]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-[#D9DED1] shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#D9DED1]">
              <h3 className="font-serif text-lg font-bold text-[#2C3327]">
                {currentStudy.title ? 'কেস স্টাডি এডিট করুন' : 'নতুন কেস স্টাডি তৈরি করুন'}
              </h3>
              <button onClick={() => setIsEditing(false)} className="p-1 text-[#8A957F] hover:text-[#2C3327]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#2C3327]">কেস স্টাডি শিরোনাম *</label>
                <input
                  type="text"
                  required
                  value={currentStudy.title || ''}
                  onChange={(e) => setCurrentStudy({ ...currentStudy, title: e.target.value })}
                  placeholder="e.g. ফ্যাশন ব্র্যান্ডে ১২৬টি অ্যাড গ্রুপ সমন্বিত ১৮,৬৯৮টি ইনবক্স কনভার্সন"
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#2C3327]">ইন্ডাস্ট্রি / নিশ</label>
                  <input
                    type="text"
                    value={currentStudy.industry || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, industry: e.target.value })}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327]">প্ল্যাটফর্ম</label>
                  <select
                    value={currentStudy.platform || 'TIKTOK'}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, platform: e.target.value as any })}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  >
                    <option value="TIKTOK">TikTok Ads</option>
                    <option value="FACEBOOK">Facebook Ads</option>
                    <option value="BOTH">Dual Platform</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327]">স্ট্যাটাস</label>
                  <select
                    value={currentStudy.status || 'PUBLISHED'}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, status: e.target.value as any })}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  >
                    <option value="PUBLISHED">PUBLISHED (লাইভ)</option>
                    <option value="DRAFT">DRAFT (খসড়া)</option>
                  </select>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F1EB] p-4 rounded-2xl border border-[#D9DED1]">
                <div>
                  <label className="text-[11px] font-bold text-[#2C3327]">Ad Spend (৳)</label>
                  <input
                    type="number"
                    value={currentStudy.adSpendBDT || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, adSpendBDT: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#2C3327]">Impressions</label>
                  <input
                    type="number"
                    value={currentStudy.impressions || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, impressions: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#2C3327]">Conversations</label>
                  <input
                    type="number"
                    value={currentStudy.conversations || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, conversations: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#2C3327]">Leads</label>
                  <input
                    type="number"
                    value={currentStudy.leads || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, leads: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#2C3327]">Purchases</label>
                  <input
                    type="number"
                    value={currentStudy.purchases || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, purchases: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#2C3327]">ROAS (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentStudy.roas || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, roas: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#2C3327]">CPA (৳)</label>
                  <input
                    type="number"
                    value={currentStudy.cpa || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, cpa: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#2C3327]">CTR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentStudy.ctr || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, ctr: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C3327]">ফলাফল সংক্ষেপ (Result Summary) *</label>
                <textarea
                  rows={2}
                  required
                  value={currentStudy.resultSummary || ''}
                  onChange={(e) => setCurrentStudy({ ...currentStudy, resultSummary: e.target.value })}
                  placeholder="e.g. ১২৬টি টিকটক অ্যাড গ্রুপ সমন্বিত ক্যাম্পেইনে ১৮,৬৯৮টি গ্রাহক মেসেজ এবং ১,৩১৬টি লিড রেকর্ড করা হয়।"
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl p-3 text-xs text-[#2C3327]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C3327]">বিস্তারিত স্ট্র্যাটেজি ও ব্যাকগ্রাউন্ড</label>
                <textarea
                  rows={3}
                  value={currentStudy.textDescription || ''}
                  onChange={(e) => setCurrentStudy({ ...currentStudy, textDescription: e.target.value })}
                  placeholder="ক্যাম্পেইন স্ট্র্যাটেজি, ক্রিয়েটিভ ফরম্যাট এবং অপ্টিমাইজেশনের বিস্তারিত বিবরণ..."
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl p-3 text-xs text-[#2C3327]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="verifiedCheck"
                  checked={currentStudy.isVerifiedReport || false}
                  onChange={(e) => setCurrentStudy({ ...currentStudy, isVerifiedReport: e.target.checked })}
                  className="rounded text-[#4A5D3B]"
                />
                <label htmlFor="verifiedCheck" className="text-xs font-semibold text-[#2C3327]">
                  ভেরিফায়েড অডিট ব্যাজ প্রদর্শন করুন (Verified Practitioner Report)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#D9DED1]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-[#D9DED1] text-xs font-semibold rounded-xl text-[#5C6652]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4A5D3B] text-[#FDFCF8] text-xs font-semibold rounded-xl hover:bg-[#3A4533]"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
