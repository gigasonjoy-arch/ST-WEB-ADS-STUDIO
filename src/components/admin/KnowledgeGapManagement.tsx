import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Plus, 
  HelpCircle, 
  Clock, 
  Search, 
  Check, 
  X, 
  Sparkles,
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { KnowledgeGap, SiteSettings } from '../../types';
import { storageService } from '../../services/storageService';

interface KnowledgeGapManagementProps {
  settings?: SiteSettings;
  onRefresh?: () => void;
}

export const KnowledgeGapManagement: React.FC<KnowledgeGapManagementProps> = ({ settings, onRefresh }) => {
  const [gaps, setGaps] = useState<KnowledgeGap[]>(() => storageService.getKnowledgeGaps());
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'unresolved' | 'resolved' | 'added_to_kb'>('ALL');
  const [selectedGap, setSelectedGap] = useState<KnowledgeGap | null>(null);
  const [adminAnswer, setAdminAnswer] = useState('');
  const [addToKnowledgeBase, setAddToKnowledgeBase] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResolve = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGap || !adminAnswer.trim()) return;

    storageService.resolveKnowledgeGap(selectedGap.id, adminAnswer, addToKnowledgeBase);
    setGaps(storageService.getKnowledgeGaps());
    setSelectedGap(null);
    setAdminAnswer('');
    showToast(addToKnowledgeBase ? 'উত্তর সেভ করা হয়েছে এবং নলেজ বেসে যোগ করা হয়েছে!' : 'প্রশ্নটি সমাধান হিসেবে চিহ্নিত করা হয়েছে।');
    if (onRefresh) onRefresh();
  };

  const filteredGaps = gaps.filter(gap => {
    if (filterStatus === 'ALL') return true;
    return gap.status === filterStatus;
  });

  const unresolvedCount = gaps.filter(g => g.status === 'unresolved').length;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] tracking-tight">
            অজানা প্রশ্ন ও Knowledge Gaps
          </h1>
          <p className="text-sm text-[#5C6652] mt-1">
            ওয়েবসাইটে ভিজিটরদের করা যে প্রশ্নগুলোর উত্তর এআই এর নলেজ বেসে ছিল না, সেগুলো এখানে জমা হয়। উত্তর দিয়ে নলেজ বেস সমৃদ্ধ করুন।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-[#E2725B]/10 text-[#E2725B] text-xs font-bold border border-[#E2725B]/20">
            অমীমাংসিত প্রশ্ন: {unresolvedCount} টি
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-[#4A5D3B] text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterStatus('ALL')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'ALL'
              ? 'bg-[#4A5D3B] text-white'
              : 'bg-white border border-[#D9DED1] text-[#5C6652] hover:bg-[#E8EAE2]'
          }`}
        >
          সব ({gaps.length})
        </button>
        <button
          onClick={() => setFilterStatus('unresolved')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'unresolved'
              ? 'bg-[#E2725B] text-white'
              : 'bg-white border border-[#D9DED1] text-[#5C6652] hover:bg-[#E8EAE2]'
          }`}
        >
          অমীমাংসিত ({unresolvedCount})
        </button>
        <button
          onClick={() => setFilterStatus('added_to_kb')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
            filterStatus === 'added_to_kb'
              ? 'bg-[#4A5D3B] text-white'
              : 'bg-white border border-[#D9DED1] text-[#5C6652] hover:bg-[#E8EAE2]'
          }`}
        >
          নলেজ বেসে যোগ করা ({gaps.filter(g => g.status === 'added_to_kb').length})
        </button>
      </div>

      {/* Gaps List */}
      {filteredGaps.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#D9DED1] text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-[#4A5D3B] mx-auto" />
          <h3 className="font-serif font-bold text-base text-[#2C3327]">কোনো অজানা প্রশ্ন জমা নেই</h3>
          <p className="text-xs text-[#5C6652] max-w-md mx-auto">
            আপনার নলেজ বেস পরিপূর্ণ! ভিজিটররা যখন নতুন প্রশ্ন করবেন যা জানা নেই, তা স্বয়ংক্রিয়ভাবে এখানে লগ হবে।
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGaps.map((gap) => (
            <div
              key={gap.id}
              className="bg-white p-5 rounded-3xl border border-[#D9DED1] space-y-4 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                      gap.status === 'unresolved'
                        ? 'bg-rose-100 text-rose-700'
                        : gap.status === 'added_to_kb'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {gap.status === 'unresolved' ? 'অমীমাংসিত' : gap.status === 'added_to_kb' ? 'KB তে অন্তর্ভুক্ত' : 'সমাধানকৃত'}
                    </span>
                    <span className="text-[11px] font-bold text-[#8A957F] bg-[#F5F1EB] px-2 py-0.5 rounded-md">
                      {gap.count} বার জিজ্ঞাসিত
                    </span>
                  </div>

                  <div className="text-[11px] text-[#8A957F] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(gap.lastAsked).toLocaleDateString('bn-BD')}</span>
                  </div>
                </div>

                <div>
                  <div className="text-[11px] font-bold text-[#8A957F] uppercase tracking-wider mb-1">ভিজিটরের প্রশ্ন:</div>
                  <h3 className="font-serif font-bold text-sm text-[#2C3327]">
                    "{gap.question}"
                  </h3>
                </div>

                {gap.adminAnswer && (
                  <div className="bg-[#FDFCF8] p-3 rounded-2xl border border-[#D9DED1] space-y-1">
                    <div className="text-[10px] font-bold text-[#4A5D3B] uppercase">অ্যাডমিন উত্তর:</div>
                    <div className="text-xs text-[#2C3327] leading-relaxed">{gap.adminAnswer}</div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#D9DED1]">
                {gap.status === 'unresolved' ? (
                  <button
                    onClick={() => {
                      setSelectedGap(gap);
                      setAdminAnswer(gap.suggestedAnswer || '');
                      setAddToKnowledgeBase(true);
                    }}
                    className="w-full bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>উত্তর প্রদান ও নলেজ বেসে যোগ করুন</span>
                  </button>
                ) : (
                  <div className="text-right text-[11px] text-[#4A5D3B] font-bold flex items-center justify-end gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>সমাধান সম্পন্ন হয়েছে</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- ANSWER MODAL --- */}
      {selectedGap && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] w-full max-w-lg rounded-3xl border border-[#D9DED1] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-4">
              <h2 className="font-serif font-bold text-xl text-[#2C3327]">
                অজানা প্রশ্নের সমাধান ও উত্তর
              </h2>
              <button
                onClick={() => setSelectedGap(null)}
                className="p-2 text-[#8A957F] hover:text-[#2C3327] rounded-xl hover:bg-[#E8EAE2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#E8EAE2]/50 p-4 rounded-2xl border border-[#D9DED1]">
              <div className="text-[11px] font-bold text-[#5C6652] uppercase mb-1">ভিজিটর প্রশ্ন:</div>
              <div className="font-serif font-bold text-sm text-[#2C3327]">"{selectedGap.question}"</div>
            </div>

            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                  সঠিক উত্তর লিখুন (এআই এই উত্তরটি মুখস্থ করবে)
                </label>
                <textarea
                  rows={4}
                  value={adminAnswer}
                  onChange={(e) => setAdminAnswer(e.target.value)}
                  className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  placeholder="বিস্তারিত সঠিক উত্তর লিখুন..."
                  required
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addToKb"
                  checked={addToKnowledgeBase}
                  onChange={(e) => setAddToKnowledgeBase(e.target.checked)}
                  className="w-4 h-4 text-[#4A5D3B] rounded border-[#D9DED1] focus:ring-[#4A5D3B]"
                />
                <label htmlFor="addToKb" className="text-xs font-bold text-[#2C3327] cursor-pointer">
                  স্থায়ী নলেজ বেসে নতুন আর্টিকেল হিসেবে পাবলিশ করুন
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D9DED1]">
                <button
                  type="button"
                  onClick={() => setSelectedGap(null)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5C6652] hover:bg-[#E8EAE2] transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>উত্তর সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
