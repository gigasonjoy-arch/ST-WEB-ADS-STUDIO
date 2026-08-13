import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  HelpCircle,
  TrendingUp,
  RefreshCw,
  Tag,
  Percent
} from 'lucide-react';
import { 
  CalculatorBenchmark, 
  District, 
  RecommendationRule, 
  CreativeType, 
  ConversionGoal,
  ProductPriceRange,
  SiteSettings 
} from '../../types';
import { storageService } from '../../services/storageService';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface BenchmarkManagementProps {
  settings?: SiteSettings;
  initialSubTab?: string;
  targetElementId?: string;
  highlightCategory?: string;
  onRefresh?: () => void;
}

export const BenchmarkManagement: React.FC<BenchmarkManagementProps> = ({ 
  settings, 
  initialSubTab,
  targetElementId,
  highlightCategory,
  onRefresh 
}) => {
  const getSubTabFromProp = (tabProp?: string): 'BENCHMARKS' | 'DISTRICTS' | 'RECOMMENDATIONS' | 'PRICE_RANGES' => {
    if (tabProp === 'PRICE_RANGES') return 'PRICE_RANGES';
    if (tabProp === 'DISTRICTS') return 'DISTRICTS';
    if (tabProp === 'RECOMMENDATIONS') return 'RECOMMENDATIONS';
    return 'BENCHMARKS';
  };

  const [activeSubTab, setActiveSubTab] = useState<'BENCHMARKS' | 'DISTRICTS' | 'RECOMMENDATIONS' | 'PRICE_RANGES'>(() => getSubTabFromProp(initialSubTab));
  
  // Benchmarks state
  const [benchmarks, setBenchmarks] = useState<CalculatorBenchmark[]>(() => storageService.getBenchmarks(true));
  const [editingBenchmark, setEditingBenchmark] = useState<CalculatorBenchmark | null>(null);
  const [isCreatingBenchmark, setIsCreatingBenchmark] = useState(false);
  
  // Price Ranges state
  const [priceRanges, setPriceRanges] = useState<ProductPriceRange[]>(() => storageService.getProductPriceRanges(false));
  const [editingPriceRange, setEditingPriceRange] = useState<ProductPriceRange | null>(null);
  const [isCreatingPriceRange, setIsCreatingPriceRange] = useState(false);

  // Districts state
  const [districts, setDistricts] = useState<District[]>(() => storageService.getDistricts(true));
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendationRule[]>(() => storageService.getRecommendations());
  const [editingRec, setEditingRec] = useState<RecommendationRule | null>(null);
  const [isCreatingRec, setIsCreatingRec] = useState(false);

  // Success notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'BENCHMARK' | 'PRICE_RANGE' | 'RECOMMENDATION'; id: string } | null>(null);

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(getSubTabFromProp(initialSubTab));
    }
  }, [initialSubTab]);

  // Deep-linking scroll & highlight effect
  useEffect(() => {
    if (targetElementId) {
      setTimeout(() => {
        const el = document.getElementById(targetElementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-[#4A5D3B]', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-[#4A5D3B]', 'ring-offset-2');
          }, 3500);
        }
      }, 250);
    }
  }, [targetElementId, activeSubTab]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveBenchmark = (bm: CalculatorBenchmark) => {
    storageService.saveBenchmark(bm);
    setBenchmarks(storageService.getBenchmarks(true));
    setEditingBenchmark(null);
    setIsCreatingBenchmark(false);
    showToast('বেঞ্চমার্ক সফলভাবে সংরক্ষণ করা হয়েছে!');
    if (onRefresh) onRefresh();
  };

  const handleDeleteBenchmark = (id: string) => {
    setItemToDelete({ type: 'BENCHMARK', id });
  };

  const handleSavePriceRange = (range: ProductPriceRange) => {
    storageService.saveProductPriceRange(range);
    setPriceRanges(storageService.getProductPriceRanges(false));
    setEditingPriceRange(null);
    setIsCreatingPriceRange(false);
    showToast('প্রাইস রেঞ্জ টায়ার সফলভাবে সংরক্ষণ করা হয়েছে!');
    if (onRefresh) onRefresh();
  };

  const handleDeletePriceRange = (id: string) => {
    setItemToDelete({ type: 'PRICE_RANGE', id });
  };

  const handleToggleDistrict = (d: District) => {
    const updated = { ...d, enabled: !d.enabled };
    storageService.saveDistrict(updated);
    setDistricts(storageService.getDistricts(true));
    if (onRefresh) onRefresh();
  };

  const handleSaveRec = (rec: RecommendationRule) => {
    storageService.saveRecommendation(rec);
    setRecommendations(storageService.getRecommendations());
    setEditingRec(null);
    setIsCreatingRec(false);
    showToast('সুপারিশ নিয়ম সফলভাবে সেভ করা হয়েছে!');
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] tracking-tight">
            ক্যালকুলেটর ইঞ্জিন ও বেঞ্চমার্ক
          </h1>
          <p className="text-sm text-[#5C6652] mt-1">
            টিকটক ও ফেসবুকের লোকাল ইন্ডাস্ট্রি CPM, CTR, CVR ডাটা এবং স্মার্ট এআই রেকমেন্ডেশন ম্যানেজ করুন।
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex flex-wrap items-center gap-1 bg-[#E8EAE2] p-1 rounded-2xl border border-[#D9DED1]">
          <button
            onClick={() => setActiveSubTab('BENCHMARKS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'BENCHMARKS' 
                ? 'bg-[#4A5D3B] text-white shadow-2xs' 
                : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            বেঞ্চমার্ক রেট ({benchmarks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('PRICE_RANGES')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'PRICE_RANGES' 
                ? 'bg-[#4A5D3B] text-white shadow-2xs' 
                : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            প্রাইস রেঞ্জ ও টায়ার ({priceRanges.length})
          </button>
          <button
            onClick={() => setActiveSubTab('DISTRICTS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'DISTRICTS' 
                ? 'bg-[#4A5D3B] text-white shadow-2xs' 
                : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            জেলা ও লোকেশন ({districts.length})
          </button>
          <button
            onClick={() => setActiveSubTab('RECOMMENDATIONS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'RECOMMENDATIONS' 
                ? 'bg-[#4A5D3B] text-white shadow-2xs' 
                : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            স্মার্ট রুলস ({recommendations.length})
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-[#4A5D3B] text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* --- TAB 1: BENCHMARKS --- */}
      {activeSubTab === 'BENCHMARKS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#5C6652] font-semibold">
              মোট বেঞ্চমার্ক ডাটাবেজ: <span className="font-bold text-[#2C3327]">{benchmarks.length} টি</span>
            </div>
            <button
              onClick={() => {
                setEditingBenchmark({
                  id: 'bm-' + Date.now().toString(36),
                  platform: 'TikTok',
                  location: 'All Bangladesh',
                  productCategory: 'E-commerce (Fashion)',
                  minPriceBDT: 500,
                  maxPriceBDT: 3500,
                  minBudgetUSD: 20,
                  maxBudgetUSD: 500,
                  creativeType: 'UGC',
                  conversionGoal: 'Purchase',
                  cpmBDT: 65,
                  ctrPercent: 2.1,
                  cpcBDT: 3.5,
                  cvrPercent: 2.8,
                  cpaBDT: 140,
                  estimatedRoasMin: 3.2,
                  estimatedRoasMax: 5.5,
                  confidence: 'HIGH',
                  notes: 'সোনজয় সরকার কর্তৃক ভেরিফাইড ক্যাম্পেইন ডাটা',
                  active: true
                });
                setIsCreatingBenchmark(true);
              }}
              className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন বেঞ্চমার্ক যোগ করুন</span>
            </button>
          </div>

          {/* Benchmark Table */}
          <div id="benchmarks-table-view" className="bg-white rounded-3xl border border-[#D9DED1] overflow-hidden shadow-2xs transition-all">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F5F1EB] border-b border-[#D9DED1] text-[11px] font-bold text-[#5C6652] uppercase tracking-wider">
                    <th className="py-3.5 px-4">প্ল্যাটফর্ম ও ক্যাটাগরি</th>
                    <th className="py-3.5 px-4">ফরম্যাট ও অবজেক্টিভ</th>
                    <th className="py-3.5 px-4">বেঞ্চমার্ক CPM / CTR</th>
                    <th className="py-3.5 px-4">কনভার্সন ও CPA</th>
                    <th className="py-3.5 px-4">প্রত্যাশিত ROAS</th>
                    <th className="py-3.5 px-4">কনফিডেন্স</th>
                    <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9DED1] text-xs">
                  {benchmarks.map((bm) => (
                    <tr key={bm.id} className="hover:bg-[#FDFCF8] transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                            bm.platform === 'TikTok' ? 'bg-black text-white' : 'bg-blue-600 text-white'
                          }`}>
                            {bm.platform}
                          </span>
                          <span className="font-bold text-[#2C3327]">{bm.productCategory}</span>
                        </div>
                        <div className="text-[11px] text-[#8A957F] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{bm.location}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-[#2C3327]">{bm.creativeType}</div>
                        <div className="text-[11px] text-[#5C6652]">{bm.conversionGoal}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2C3327]">৳{bm.cpmBDT} <span className="text-[10px] font-normal text-[#8A957F]">CPM</span></div>
                        <div className="text-[11px] text-[#5C6652]">{bm.ctrPercent}% CTR (৳{bm.cpcBDT}/ক্লিক)</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-bold text-[#2C3327]">{bm.cvrPercent}% CVR</div>
                        <div className="text-[11px] text-[#E2725B] font-semibold">গড় CPA: ৳{bm.cpaBDT}</div>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#4A5D3B]">
                        {bm.estimatedRoasMin}x - {bm.estimatedRoasMax}x
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          bm.confidence === 'HIGH' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : bm.confidence === 'MEDIUM' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-stone-100 text-stone-700'
                        }`}>
                          {bm.confidence}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingBenchmark(bm);
                              setIsCreatingBenchmark(false);
                            }}
                            className="p-1.5 text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] rounded-lg transition-colors"
                            title="এডিট করুন"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBenchmark(bm.id)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: DISTRICTS --- */}
      {activeSubTab === 'DISTRICTS' && (
        <div className="space-y-6">
          <div className="text-xs text-[#5C6652]">
            বাংলাদেশের ৬৪ জেলার মধ্যে শীর্ষ জেলাসমূহ সক্রিয় বা নিষ্ক্রিয় করুন। ক্যালকুলেটর ড্রপডাউনে এই জেলাগুলো দৃশ্যমান হবে।
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {districts.map((d) => (
              <div 
                key={d.id}
                className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                  d.enabled 
                    ? 'bg-white border-[#D9DED1] shadow-2xs' 
                    : 'bg-[#F5F1EB]/50 border-transparent opacity-60'
                }`}
              >
                <div>
                  <div className="font-bold text-xs text-[#2C3327]">{d.bnName} ({d.name})</div>
                  <div className="text-[11px] text-[#8A957F]">{d.division} বিভাগ • Tier {d.tier}</div>
                </div>

                <button
                  onClick={() => handleToggleDistrict(d)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-colors ${
                    d.enabled 
                      ? 'bg-[#4A5D3B] text-white' 
                      : 'bg-[#D9DED1] text-[#5C6652] hover:bg-[#8A957F] hover:text-white'
                  }`}
                >
                  {d.enabled ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 3: RECOMMENDATIONS --- */}
      {activeSubTab === 'RECOMMENDATIONS' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#5C6652]">
              ইউজারের দেওয়া ইনপুট (বাজেট, ক্রিয়েটিভ ও গোল) এর ওপর ভিত্তি করে স্বয়ংক্রিয় এআই রুলস দেখানো হয়।
            </div>
            <button
              onClick={() => {
                setEditingRec({
                  id: 'rec-' + Date.now().toString(36),
                  title: 'New Strategy Rule',
                  bnTitle: 'নতুন স্ট্র্যাটেজিক রুল',
                  description: 'Description in English',
                  bnDescription: 'বাংলায় স্ট্র্যাটেজিক অ্যাডভাইস বা অ্যাকশনেবল নির্দেশিকা।',
                  creativeType: 'UGC',
                  minBudgetUSD: 30,
                  priority: 1,
                  active: true
                });
                setIsCreatingRec(true);
              }}
              className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন রুল তৈরি করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendations.map((rec) => (
              <div 
                key={rec.id}
                className="bg-white p-5 rounded-3xl border border-[#D9DED1] space-y-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center font-bold text-xs">
                      #{rec.priority}
                    </span>
                    <h3 className="font-serif font-bold text-sm text-[#2C3327]">{rec.bnTitle}</h3>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingRec(rec);
                        setIsCreatingRec(false);
                      }}
                      className="p-1.5 text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] rounded-lg transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#5C6652] leading-relaxed">
                  {rec.bnDescription}
                </p>

                <div className="pt-2 border-t border-[#D9DED1]/60 flex flex-wrap items-center gap-2 text-[11px] text-[#8A957F]">
                  {rec.creativeType && (
                    <span className="bg-[#F5F1EB] px-2 py-0.5 rounded-md font-semibold text-[#2C3327]">
                      {rec.creativeType}
                    </span>
                  )}
                  {rec.minBudgetUSD && (
                    <span className="bg-[#F5F1EB] px-2 py-0.5 rounded-md font-semibold text-[#2C3327]">
                      মিনিমাম বাজেট: ${rec.minBudgetUSD}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 rounded-md font-bold ${rec.active ? 'text-emerald-700 bg-emerald-50' : 'text-stone-500 bg-stone-100'}`}>
                    {rec.active ? 'সক্রিয়' : 'বন্ধ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- TAB 4: PRICE RANGES --- */}
      {activeSubTab === 'PRICE_RANGES' && (
        <div id="price-ranges-section" className="space-y-6 transition-all">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[#5C6652]">
              প্রোডাক্ট প্রাইস টিয়ার ও ক্যাটাগরি রেঞ্জ ম্যানেজ করুন (ক্যালকুলেটর সিলেকশন অপশন)।
            </div>
            <button
              onClick={() => {
                setEditingPriceRange({
                  id: 'pr-' + Date.now().toString(36),
                  minPrice: 500,
                  maxPrice: 2000,
                  labelEn: '৳500 - ৳2,000 (Mid Tier)',
                  labelBn: '৳৫০০ - ৳২,০০০ (মিডিয়াম রেঞ্জ)',
                  tier: 'MID_TICKET',
                  expectedCVR: 2.5,
                  notes: 'জনপ্রিয় ই-কমার্স পোশাক ও পণ্য',
                  active: true
                });
                setIsCreatingPriceRange(true);
              }}
              className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>নতুন প্রাইস টায়ার যোগ করুন</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {priceRanges.map((pr) => (
              <div 
                key={pr.id}
                id={`price-tier-${pr.id}`}
                className="bg-white p-5 rounded-3xl border border-[#D9DED1] space-y-3 shadow-2xs transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center font-bold text-xs">
                        <Tag className="w-3.5 h-3.5" />
                      </span>
                      <h3 className="font-bold text-sm text-[#2C3327]">{pr.labelBn || pr.labelEn}</h3>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingPriceRange(pr);
                          setIsCreatingPriceRange(false);
                        }}
                        className="p-1.5 text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] rounded-lg transition-colors"
                        title="এডিট করুন"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePriceRange(pr.id)}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5 text-xs text-[#5C6652]">
                    <div className="flex justify-between">
                      <span>প্রাইস সীমা:</span>
                      <span className="font-bold text-[#2C3327]">৳{pr.minPrice} - ৳{pr.maxPrice}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>টিয়ার লেভেল:</span>
                      <span className="font-bold text-[#4A5D3B]">{pr.tier}</span>
                    </div>
                    {pr.expectedCVR && (
                      <div className="flex justify-between">
                        <span>প্রত্যাশিত CVR:</span>
                        <span className="font-bold text-[#2C3327]">{pr.expectedCVR}%</span>
                      </div>
                    )}
                    {pr.notes && (
                      <p className="text-[11px] text-[#8A957F] pt-1">{pr.notes}</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 border-t border-[#D9DED1]/60 flex items-center justify-between text-[11px]">
                  <span className="text-[#8A957F]">ID: <code>{pr.id}</code></span>
                  <span className={`px-2 py-0.5 rounded-md font-bold ${pr.active !== false ? 'text-emerald-700 bg-emerald-50' : 'text-stone-500 bg-stone-100'}`}>
                    {pr.active !== false ? 'সক্রিয়' : 'বন্ধ'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- EDIT / CREATE BENCHMARK MODAL --- */}
      {(editingBenchmark || isCreatingBenchmark) && editingBenchmark && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] w-full max-w-2xl rounded-3xl border border-[#D9DED1] p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-4">
              <h2 className="font-serif font-bold text-xl text-[#2C3327]">
                {isCreatingBenchmark ? 'নতুন বেঞ্চমার্ক যুক্ত করুন' : 'বেঞ্চমার্ক এডিট করুন'}
              </h2>
              <button
                onClick={() => {
                  setEditingBenchmark(null);
                  setIsCreatingBenchmark(false);
                }}
                className="p-2 text-[#8A957F] hover:text-[#2C3327] rounded-xl hover:bg-[#E8EAE2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveBenchmark(editingBenchmark);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">প্ল্যাটফর্ম</label>
                  <select
                    value={editingBenchmark.platform}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, platform: e.target.value as any })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  >
                    <option value="TikTok">TikTok</option>
                    <option value="Facebook">Facebook</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">প্রোডাক্ট ক্যাটাগরি</label>
                  <input
                    type="text"
                    value={editingBenchmark.productCategory}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, productCategory: e.target.value })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ক্রিয়েটিভ ফরম্যাট</label>
                  <select
                    value={editingBenchmark.creativeType}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, creativeType: e.target.value as any })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  >
                    <option value="UGC">UGC (User Generated Video)</option>
                    <option value="Product Video">Product Video</option>
                    <option value="Image">Image (Static)</option>
                    <option value="Professional Video">Professional High-End Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ক্যাম্পেইন অবজেক্টিভ</label>
                  <select
                    value={editingBenchmark.conversionGoal}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, conversionGoal: e.target.value as any })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  >
                    <option value="Purchase">Purchase (Website Conversion)</option>
                    <option value="Messages">Messages (Messenger / WhatsApp)</option>
                    <option value="Lead">Lead Generation</option>
                    <option value="Traffic">Traffic / Link Clicks</option>
                    <option value="Video Views">Video Views</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F1EB] p-4 rounded-2xl">
                <div>
                  <label className="block text-[11px] font-bold text-[#5C6652] mb-1">CPM (৳)</label>
                  <input
                    type="number"
                    value={editingBenchmark.cpmBDT}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, cpmBDT: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] p-2 rounded-xl text-xs font-bold text-[#2C3327]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5C6652] mb-1">CTR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBenchmark.ctrPercent}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, ctrPercent: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] p-2 rounded-xl text-xs font-bold text-[#2C3327]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5C6652] mb-1">CVR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBenchmark.cvrPercent}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, cvrPercent: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] p-2 rounded-xl text-xs font-bold text-[#2C3327]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#5C6652] mb-1">গড় CPA (৳)</label>
                  <input
                    type="number"
                    value={editingBenchmark.cpaBDT}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, cpaBDT: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] p-2 rounded-xl text-xs font-bold text-[#2C3327]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">মিনিমাম ROAS</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBenchmark.estimatedRoasMin}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, estimatedRoasMin: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ম্যাক্সিমাম ROAS</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingBenchmark.estimatedRoasMax}
                    onChange={(e) => setEditingBenchmark({ ...editingBenchmark, estimatedRoasMax: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D9DED1]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingBenchmark(null);
                    setIsCreatingBenchmark(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5C6652] hover:bg-[#E8EAE2] transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>বেঞ্চমার্ক সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT / CREATE RECOMMENDATION MODAL --- */}
      {(editingRec || isCreatingRec) && editingRec && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] w-full max-w-lg rounded-3xl border border-[#D9DED1] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-4">
              <h2 className="font-serif font-bold text-xl text-[#2C3327]">
                {isCreatingRec ? 'নতুন রুল তৈরি করুন' : 'রুল এডিট করুন'}
              </h2>
              <button
                onClick={() => {
                  setEditingRec(null);
                  setIsCreatingRec(false);
                }}
                className="p-2 text-[#8A957F] hover:text-[#2C3327] rounded-xl hover:bg-[#E8EAE2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveRec(editingRec);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">শিরোনাম (বাংলা)</label>
                <input
                  type="text"
                  value={editingRec.bnTitle}
                  onChange={(e) => setEditingRec({ ...editingRec, bnTitle: e.target.value })}
                  className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">পরামর্শ বিবরণ (বাংলা)</label>
                <textarea
                  rows={3}
                  value={editingRec.bnDescription}
                  onChange={(e) => setEditingRec({ ...editingRec, bnDescription: e.target.value })}
                  className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">প্রায়োরিটি র্যাংক</label>
                  <input
                    type="number"
                    value={editingRec.priority}
                    onChange={(e) => setEditingRec({ ...editingRec, priority: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ন্যূনতম বাজেট ($)</label>
                  <input
                    type="number"
                    value={editingRec.minBudgetUSD || 0}
                    onChange={(e) => setEditingRec({ ...editingRec, minBudgetUSD: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D9DED1]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRec(null);
                    setIsCreatingRec(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5C6652] hover:bg-[#E8EAE2] transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* --- EDIT / CREATE PRICE RANGE MODAL --- */}
      {(editingPriceRange || isCreatingPriceRange) && editingPriceRange && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] w-full max-w-lg rounded-3xl border border-[#D9DED1] p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-4">
              <h2 className="font-serif font-bold text-xl text-[#2C3327]">
                {isCreatingPriceRange ? 'নতুন প্রাইস রেঞ্জ যোগ করুন' : 'প্রাইস রেঞ্জ এডিট করুন'}
              </h2>
              <button
                onClick={() => {
                  setEditingPriceRange(null);
                  setIsCreatingPriceRange(false);
                }}
                className="p-2 text-[#8A957F] hover:text-[#2C3327] rounded-xl hover:bg-[#E8EAE2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSavePriceRange(editingPriceRange);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">লেবেল (বাংলা)</label>
                  <input
                    type="text"
                    value={editingPriceRange.labelBn || ''}
                    onChange={(e) => setEditingPriceRange({ ...editingPriceRange, labelBn: e.target.value })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    placeholder="৳৫০০ - ৳২,০০০"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">Label (English)</label>
                  <input
                    type="text"
                    value={editingPriceRange.labelEn || ''}
                    onChange={(e) => setEditingPriceRange({ ...editingPriceRange, labelEn: e.target.value })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    placeholder="৳500 - ৳2,000"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">সর্বনিম্ন মূল্য (৳)</label>
                  <input
                    type="number"
                    value={editingPriceRange.minPrice}
                    onChange={(e) => setEditingPriceRange({ ...editingPriceRange, minPrice: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">সর্বোচ্চ মূল্য (৳)</label>
                  <input
                    type="number"
                    value={editingPriceRange.maxPrice}
                    onChange={(e) => setEditingPriceRange({ ...editingPriceRange, maxPrice: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">টিয়ার লেভেল</label>
                  <select
                    value={editingPriceRange.tier}
                    onChange={(e) => setEditingPriceRange({ ...editingPriceRange, tier: e.target.value as any })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  >
                    <option value="LOW_TICKET">LOW_TICKET (Low Cost)</option>
                    <option value="MID_TICKET">MID_TICKET (Medium Range)</option>
                    <option value="HIGH_TICKET">HIGH_TICKET (High Value / Luxury)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">প্রত্যাশিত CVR (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPriceRange.expectedCVR || 2.5}
                    onChange={(e) => setEditingPriceRange({ ...editingPriceRange, expectedCVR: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">নোট / বিবরণ</label>
                <input
                  type="text"
                  value={editingPriceRange.notes || ''}
                  onChange={(e) => setEditingPriceRange({ ...editingPriceRange, notes: e.target.value })}
                  className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  placeholder="যেমন: ফ্যাশন, লাইফস্টাইল বা গ্যাজেট পণ্য"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D9DED1]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingPriceRange(null);
                    setIsCreatingPriceRange(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5C6652] hover:bg-[#E8EAE2] transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>সংরক্ষণ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!itemToDelete}
        title={
          itemToDelete?.type === 'BENCHMARK' 
            ? 'বেঞ্চমার্ক ডিলিট করুন' 
            : 'প্রাইস রেঞ্জ ডিলিট করুন'
        }
        message="আপনি কি নিশ্চিত যে এই আইটেমটি চিরতরে মুছে ফেলতে চান?"
        onConfirm={() => {
          if (itemToDelete) {
            if (itemToDelete.type === 'BENCHMARK') {
              storageService.deleteBenchmark(itemToDelete.id);
              setBenchmarks(storageService.getBenchmarks(true));
              showToast('বেঞ্চমার্ক মুছে ফেলা হয়েছে।');
            } else if (itemToDelete.type === 'PRICE_RANGE') {
              storageService.deleteProductPriceRange(itemToDelete.id);
              setPriceRanges(storageService.getProductPriceRanges(false));
              showToast('প্রাইস রেঞ্জ মুছে ফেলা হয়েছে।');
            }
            if (onRefresh) onRefresh();
            setItemToDelete(null);
          }
        }}
        onCancel={() => setItemToDelete(null)}
      />
    </div>
  );
};
