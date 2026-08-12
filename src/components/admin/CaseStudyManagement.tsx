import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  ShieldCheck, 
  Eye, 
  CheckCircle2, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Youtube, 
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { CaseStudy } from '../../types';
import { storageService } from '../../services/storageService';
import { VideoEmbedPlayer } from '../common/VideoEmbedPlayer';

interface CaseStudyManagementProps {
  caseStudies?: CaseStudy[];
  initialFilter?: string;
  highlightCaseStudyId?: string;
  targetElementId?: string;
  onSaveCaseStudy?: (study: CaseStudy) => void;
  onDeleteCaseStudy?: (id: string) => void;
  onRefresh?: () => void;
}

export const CaseStudyManagement: React.FC<CaseStudyManagementProps> = ({
  caseStudies: propCaseStudies,
  initialFilter,
  highlightCaseStudyId,
  targetElementId,
  onSaveCaseStudy,
  onDeleteCaseStudy,
  onRefresh
}) => {
  const [internalStudies, setInternalStudies] = useState<CaseStudy[]>(() => storageService.getCaseStudies());
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentStudy, setCurrentStudy] = useState<Partial<CaseStudy>>({});
  const [imageUploadLoading, setImageUploadLoading] = useState<boolean>(false);

  const caseStudies = propCaseStudies || internalStudies;

  // Deep-linking scroll & highlight effect
  useEffect(() => {
    const targetId = targetElementId || (highlightCaseStudyId ? `case-study-${highlightCaseStudyId}` : null);
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('ring-4', 'ring-[#4A5D3B]', 'ring-offset-2', 'transition-all');
          setTimeout(() => {
            el.classList.remove('ring-4', 'ring-[#4A5D3B]', 'ring-offset-2');
          }, 3500);
        }
      }, 250);
    }
  }, [targetElementId, highlightCaseStudyId]);

  const refreshData = () => {
    setInternalStudies(storageService.getCaseStudies());
    if (onRefresh) onRefresh();
  };

  const handleOpenNew = () => {
    setCurrentStudy({
      id: `cs_${Date.now()}`,
      title: '',
      titleBn: '',
      titleEn: '',
      clientName: '',
      industry: 'Fashion & Apparel',
      platform: 'TikTok',
      status: 'PUBLISHED',
      isPublished: true,
      isVerifiedReport: true,
      resultSummary: '',
      resultSummaryBn: '',
      resultSummaryEn: '',
      textDescription: '',
      adSpendBDT: 25000,
      impressions: 500000,
      roas: 3.5,
      cpa: 140,
      proofImage: '',
      videoUrl: '',
      youtubeEmbed: '',
      tiktokEmbed: ''
    });
    setIsEditing(true);
  };

  const handleEdit = (cs: CaseStudy) => {
    setCurrentStudy({ ...cs });
    setIsEditing(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('আপনি কি নিশ্চিত এই কেস স্টাডি মুছে ফেলতে চান?')) {
      storageService.deleteCaseStudy(id);
      if (onDeleteCaseStudy) onDeleteCaseStudy(id);
      refreshData();
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('ইমেজের সাইজ সর্বোচ্চ ৫ মেগাবাইট হতে পারবে।');
      return;
    }

    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Data = event.target?.result as string;
      setCurrentStudy(prev => ({
        ...prev,
        proofImage: base64Data
      }));
      setImageUploadLoading(false);
    };
    reader.onerror = () => {
      alert('ইমেজ ফাইল লোড করতে সমস্যা হয়েছে।');
      setImageUploadLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudy.title || !currentStudy.resultSummary) return;

    const updated = {
      ...currentStudy,
      titleBn: currentStudy.titleBn || currentStudy.title,
      titleEn: currentStudy.titleEn || currentStudy.title,
      resultSummaryBn: currentStudy.resultSummaryBn || currentStudy.resultSummary,
      resultSummaryEn: currentStudy.resultSummaryEn || currentStudy.resultSummary
    } as CaseStudy;

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
            স্ক্রিনশট ইমেজ আপলোড, ইউটিউব/টিকটক ভিডিও এম্বেড ও অডিট রিপোর্ট পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 bg-[#4A5D3B] text-[#FDFCF8] rounded-xl text-xs font-semibold hover:bg-[#3A4533] flex items-center gap-2 shadow-2xs cursor-pointer transition-all"
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
            id={`case-study-${cs.id}`}
            className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] overflow-hidden shadow-2xs flex flex-col justify-between transition-all"
          >
            {/* Proof Image / Video Banner */}
            {cs.proofImage ? (
              <div className="relative h-44 w-full bg-[#E8EAE2] overflow-hidden border-b border-[#D9DED1]">
                <img 
                  src={cs.proofImage} 
                  alt={cs.title} 
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 text-white rounded-md text-[10px] font-bold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  <span>Proof Screenshot</span>
                </span>
              </div>
            ) : cs.videoUrl || cs.youtubeEmbed || cs.tiktokEmbed ? (
              <div className="p-3 bg-[#F5F1EB] border-b border-[#D9DED1]">
                <VideoEmbedPlayer 
                  url={cs.videoUrl} 
                  embedCode={cs.youtubeEmbed || cs.tiktokEmbed} 
                  title={cs.title} 
                  aspectRatio="16:9"
                />
              </div>
            ) : null}

            <div className="p-6 flex-1 flex flex-col justify-between">
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
                  {cs.roas && (
                    <div>
                      <div className="text-[9px] uppercase font-bold text-[#8A957F]">ROAS</div>
                      <div className="font-bold text-[#E2725B]">{cs.roas}x</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#D9DED1] text-xs">
                <span className="text-[11px] text-[#8A957F]">
                  ID: <code className="bg-[#E8EAE2] px-1 py-0.5 rounded text-[10px]">{cs.id}</code>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(cs)}
                    className="p-1.5 rounded-lg border border-[#D9DED1] text-[#4A5D3B] hover:bg-[#E8EAE2] transition-colors"
                    title="Edit Case Study"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cs.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                    title="Delete Case Study"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] p-6 sm:p-8 max-w-3xl w-full my-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-4">
              <h3 className="font-serif font-bold text-lg text-[#2C3327] flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#4A5D3B]" />
                <span>{currentStudy.title ? 'কেস স্টাডি এডিট করুন' : 'নতুন কেস স্টাডি তৈরি করুন'}</span>
              </h3>
              <button 
                onClick={() => setIsEditing(false)} 
                className="p-1.5 rounded-full hover:bg-[#E8EAE2] text-[#8A957F] hover:text-[#2C3327]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              
              {/* Titles */}
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">কেস স্টাডি শিরোনাম (বাংলা) *</label>
                <input
                  type="text"
                  required
                  value={currentStudy.title || ''}
                  onChange={(e) => setCurrentStudy({ ...currentStudy, title: e.target.value, titleBn: e.target.value })}
                  placeholder="e.g. ফ্যাশন ব্র্যান্ডে ১২৬টি অ্যাড গ্রুপ সমন্বিত ১৮,৬৯৮টি ইনবক্স কনভার্সন"
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs text-[#2C3327] focus:border-[#4A5D3B] focus:ring-1 focus:ring-[#4A5D3B] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">Title (English)</label>
                <input
                  type="text"
                  value={currentStudy.titleEn || ''}
                  onChange={(e) => setCurrentStudy({ ...currentStudy, titleEn: e.target.value })}
                  placeholder="e.g. 18,698 Inbox Conversations with 126 TikTok Ad Groups for Apparel Brand"
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs text-[#2C3327] outline-none"
                />
              </div>

              {/* Classification */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1">ইন্ডাস্ট্রি / নিশ</label>
                  <input
                    type="text"
                    value={currentStudy.industry || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, industry: e.target.value })}
                    placeholder="e.g. Fashion & Apparel"
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1">প্ল্যাটফর্ম</label>
                  <select
                    value={currentStudy.platform || 'TikTok'}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, platform: e.target.value as 'TikTok' | 'Facebook' | 'Both' })}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  >
                    <option value="TikTok">TikTok Ads</option>
                    <option value="Facebook">Facebook Ads</option>
                    <option value="Both">Dual Platform (TikTok + FB)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1">স্ট্যাটাস</label>
                  <select
                    value={currentStudy.isPublished === false || currentStudy.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED'}
                    onChange={(e) => {
                      const val = e.target.value as 'PUBLISHED' | 'DRAFT';
                      setCurrentStudy({
                        ...currentStudy,
                        status: val,
                        isPublished: val === 'PUBLISHED'
                      });
                    }}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  >
                    <option value="PUBLISHED">PUBLISHED (লাইভ প্রকাশিত)</option>
                    <option value="DRAFT">DRAFT (খসড়া)</option>
                  </select>
                </div>
              </div>

              {/* PROOF IMAGE UPLOAD SECTION */}
              <div className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#D9DED1] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#4A5D3B]" />
                    <span>কেস স্টাডি প্রুফ স্ক্রিনশট / ইমেজ আপলোড (Proof Image)</span>
                  </label>
                  {currentStudy.proofImage && (
                    <button
                      type="button"
                      onClick={() => setCurrentStudy(prev => ({ ...prev, proofImage: '' }))}
                      className="text-[11px] text-red-600 hover:underline font-bold"
                    >
                      ইমেজ সরান
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C6652] mb-1">
                      কম্পিউটার/মোবাইল থেকে সরাসরি আপলোড করুন:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="block w-full text-xs text-[#5C6652] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#4A5D3B] file:text-white hover:file:bg-[#3A4533] cursor-pointer"
                    />
                    <p className="text-[10px] text-[#8A957F] mt-1">সাপোর্টেড ফরম্যাট: JPG, PNG, WEBP (Max 5MB)</p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C6652] mb-1">
                      অথবা ইমেজ ওয়েব URL লিখুন:
                    </label>
                    <input
                      type="text"
                      value={currentStudy.proofImage || ''}
                      onChange={(e) => setCurrentStudy({ ...currentStudy, proofImage: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs text-[#2C3327]"
                    />
                  </div>
                </div>

                {/* Proof Image Preview */}
                {currentStudy.proofImage && (
                  <div className="relative rounded-xl overflow-hidden border border-[#D9DED1] max-h-48 w-full bg-black/5 flex items-center justify-center">
                    <img 
                      src={currentStudy.proofImage} 
                      alt="Proof Preview" 
                      className="max-h-48 w-auto object-contain rounded-lg shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* YOUTUBE & TIKTOK VIDEO EMBED SYSTEM */}
              <div className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#D9DED1] space-y-3">
                <label className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-[#E2725B]" />
                  <span>ইউটিউব ও টিকটক ভিডিও এম্বেড সিস্টেম (YouTube & TikTok Embed)</span>
                </label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C6652] mb-1 flex items-center gap-1">
                      <Youtube className="w-3.5 h-3.5 text-red-600" />
                      <span>YouTube Video URL / Embed Link:</span>
                    </label>
                    <input
                      type="text"
                      value={currentStudy.videoUrl || ''}
                      onChange={(e) => setCurrentStudy({ ...currentStudy, videoUrl: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... or youtu.be/..."
                      className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs text-[#2C3327]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[#5C6652] mb-1 flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-black inline-block"></span>
                      <span>TikTok Video URL / Embed Code:</span>
                    </label>
                    <input
                      type="text"
                      value={currentStudy.tiktokEmbed || ''}
                      onChange={(e) => setCurrentStudy({ ...currentStudy, tiktokEmbed: e.target.value })}
                      placeholder="https://www.tiktok.com/@.../video/... or embed code"
                      className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs text-[#2C3327]"
                    />
                  </div>
                </div>

                {/* Real-time Video Preview */}
                {(currentStudy.videoUrl || currentStudy.tiktokEmbed) && (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-[#4A5D3B] mb-1.5">লাইভ ভিডিও প্লেয়ার প্রিভিউ:</p>
                    <VideoEmbedPlayer
                      url={currentStudy.videoUrl || currentStudy.tiktokEmbed}
                      embedCode={currentStudy.tiktokEmbed}
                      title={currentStudy.title || "Video Preview"}
                      aspectRatio="auto"
                      className="max-h-56"
                    />
                  </div>
                )}
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#F5F1EB] p-4 rounded-2xl border border-[#D9DED1]">
                <div>
                  <label className="block text-[11px] font-bold text-[#2C3327] mb-1">Ad Spend (৳)</label>
                  <input
                    type="number"
                    value={currentStudy.adSpendBDT || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, adSpendBDT: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2C3327] mb-1">Impressions</label>
                  <input
                    type="number"
                    value={currentStudy.impressions || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, impressions: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2C3327] mb-1">Conversations</label>
                  <input
                    type="number"
                    value={currentStudy.conversations || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, conversations: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2C3327] mb-1">Leads</label>
                  <input
                    type="number"
                    value={currentStudy.leads || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, leads: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2C3327] mb-1">Purchases</label>
                  <input
                    type="number"
                    value={currentStudy.purchases || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, purchases: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2C3327] mb-1">ROAS (x)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={currentStudy.roas || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, roas: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2C3327] mb-1">CPA (৳)</label>
                  <input
                    type="number"
                    value={currentStudy.cpa || ''}
                    onChange={(e) => setCurrentStudy({ ...currentStudy, cpa: Number(e.target.value) })}
                    className="w-full bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2.5 py-1.5 text-xs text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2C3327] mb-1">CTR (%)</label>
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
                <label className="block text-xs font-bold text-[#2C3327] mb-1">ফলাফল সংক্ষেপ (Result Summary) *</label>
                <textarea
                  rows={2}
                  required
                  value={currentStudy.resultSummary || ''}
                  onChange={(e) => setCurrentStudy({ ...currentStudy, resultSummary: e.target.value, resultSummaryBn: e.target.value })}
                  placeholder="e.g. ১২৬টি টিকটক অ্যাড গ্রুপ সমন্বিত ক্যাম্পেইনে ১৮,৬৯৮টি গ্রাহক মেসেজ এবং ১,৩১৬টি লিড রেকর্ড করা হয়।"
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl p-3 text-xs text-[#2C3327] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">বিস্তারিত স্ট্র্যাটেজি ও ব্যাকগ্রাউন্ড</label>
                <textarea
                  rows={3}
                  value={currentStudy.textDescription || ''}
                  onChange={(e) => setCurrentStudy({ ...currentStudy, textDescription: e.target.value })}
                  placeholder="ক্যাম্পেইন স্ট্র্যাটেজি, ক্রিয়েটিভ ফরম্যাট এবং অপ্টিমাইজেশনের বিস্তারিত বিবরণ..."
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl p-3 text-xs text-[#2C3327] outline-none"
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
                <label htmlFor="verifiedCheck" className="text-xs font-semibold text-[#2C3327] cursor-pointer">
                  ভেরিফায়েড অডিট ব্যাজ প্রদর্শন করুন (Verified Practitioner Report)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D9DED1]">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-[#D9DED1] text-xs font-semibold rounded-xl text-[#5C6652] hover:bg-[#F5F1EB]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4A5D3B] text-[#FDFCF8] text-xs font-semibold rounded-xl hover:bg-[#3A4533] shadow-2xs"
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
