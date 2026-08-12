import React, { useState } from 'react';
import { 
  User, 
  Save, 
  Camera, 
  Upload, 
  Link as LinkIcon, 
  Phone, 
  Mail, 
  MapPin, 
  Sparkles, 
  Award, 
  TrendingUp, 
  CheckCircle2, 
  Eye, 
  Copy, 
  KeyRound, 
  ShieldCheck,
  ExternalLink,
  MessageCircle,
  Briefcase,
  Layers
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { storageService } from '../../services/storageService';

interface ProfileManagementProps {
  settings: SiteSettings;
  onUpdateSettings: (updated: SiteSettings) => void;
  onNavigateTab?: (tab: any) => void;
}

export const ProfileManagement: React.FC<ProfileManagementProps> = ({
  settings,
  onUpdateSettings,
  onNavigateTab
}) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePreviewMode, setActivePreviewMode] = useState<'CARD' | 'HERO'>('CARD');

  const adminDirectUrl = `${window.location.origin}${window.location.pathname}#admin`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyAdminUrl = () => {
    navigator.clipboard.writeText(adminDirectUrl);
    setCopiedLink(true);
    showToast('অ্যাডমিন প্যানেলের লিঙ্ক কপি করা হয়েছে!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('ইমেজ ফাইলের আকার ৫ মেগাবাইটের কম হতে হবে।');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setFormData(prev => ({
          ...prev,
          sonjoyImage: base64
        }));
        showToast('প্রোফাইল ছবি সফলভাবে লোড হয়েছে। সংরক্ষণ বাটনে ক্লিক করুন।');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateSiteSettings(formData);
    onUpdateSettings(formData);
    showToast('প্রোফাইল তথ্য সফলভাবে আপডেট ও সংরক্ষিত হয়েছে!');
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#4A5D3B] uppercase tracking-wider mb-1">
            <User className="w-4 h-4" />
            <span>প্র্যাকটিশনার ও ব্র্যান্ড প্রোফাইল</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] tracking-tight">
            প্রোফাইল ও পার্সোনাল ব্র্যান্ডিং এডিটর
          </h1>
          <p className="text-sm text-[#5C6652] mt-1">
            আপনার নাম, ছবি, বায়ো, অভিজ্ঞতা, ডেজিগনেশন এবং যোগাযোগের তথ্য এখান থেকে সরাসরি সম্পাদনা করুন।
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyAdminUrl}
            className="px-3.5 py-2 rounded-xl border border-[#D9DED1] bg-white hover:bg-[#F5F1EB] text-[#2C3327] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
            title="অ্যাডমিন প্যানেলের লিঙ্ক কপি করুন"
          >
            {copiedLink ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#5C6652]" />}
            <span>{copiedLink ? 'লিঙ্ক কপি হয়েছে!' : 'অ্যাডমিন লিঙ্ক কপি'}</span>
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="bg-[#4A5D3B] hover:bg-[#3A4533] text-white px-5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>পরিবর্তন সংরক্ষণ করুন</span>
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Admin Panel Quick Link Banner */}
      <div className="bg-[#E8EAE2]/70 p-4 rounded-2xl border border-[#D9DED1] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#4A5D3B] text-white flex items-center justify-center shrink-0">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#2C3327]">আপনার সরাসরি অ্যাডমিন প্যানেল URL</div>
            <div className="text-[11px] text-[#5C6652] font-mono break-all mt-0.5 select-all">
              {adminDirectUrl}
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCopyAdminUrl}
          className="px-3 py-1.5 bg-white hover:bg-[#FDFCF8] text-[#4A5D3B] border border-[#D9DED1] rounded-xl text-xs font-bold self-start sm:self-auto shrink-0 flex items-center gap-1.5 transition-colors"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>কপি করুন</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* SECTION 1: Profile Photo & Basic Identity */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9DED1]">
            <Camera className="w-4 h-4 text-[#4A5D3B]" />
            <h2 className="text-sm font-bold text-[#2C3327] uppercase tracking-wider">
              প্রোফাইল ছবি ও পরিচয়
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Avatar Uploader & Live Avatar Preview */}
            <div className="md:col-span-4 flex flex-col items-center text-center p-5 bg-[#FDFCF8] rounded-2xl border border-[#D9DED1] space-y-4">
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-[#E8EAE2] flex items-center justify-center">
                  {formData.sonjoyImage ? (
                    <img 
                      src={formData.sonjoyImage} 
                      alt={formData.personalName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-16 h-16 text-[#8A957F]" />
                  )}
                </div>
                <label className="absolute bottom-1 right-1 p-2.5 rounded-full bg-[#4A5D3B] text-white hover:bg-[#3A4533] cursor-pointer shadow-md transition-transform hover:scale-110">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div>
                <div className="font-serif font-bold text-base text-[#2C3327]">
                  {formData.personalName || 'Sonjoy Sarkar'}
                </div>
                <div className="text-[11px] text-[#5C6652] font-semibold mt-0.5">
                  {formData.sonjoyRole || 'Performance Marketer'}
                </div>
              </div>

              <div className="w-full space-y-2 text-left">
                <label className="block text-[11px] font-bold text-[#5C6652]">
                  ফাইল আপলোড করুন (ছবি):
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="block w-full text-xs text-[#5C6652] file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-[#4A5D3B] file:text-white hover:file:bg-[#3A4533] cursor-pointer"
                />
                <p className="text-[10px] text-[#8A957F]">JPG, PNG, WEBP (সর্বোচ্চ ৫ মেগাবাইট)</p>
              </div>

              <div className="w-full space-y-1 text-left">
                <label className="block text-[11px] font-bold text-[#5C6652]">
                  অথবা ছবির অনলাইন URL লিখুন:
                </label>
                <input
                  type="text"
                  value={formData.sonjoyImage}
                  onChange={(e) => setFormData({ ...formData, sonjoyImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs text-[#2C3327]"
                />
              </div>
            </div>

            {/* Basic Info Inputs */}
            <div className="md:col-span-8 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                    পূর্ণ নাম (Personal Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.personalName}
                    onChange={(e) => setFormData({ ...formData, personalName: e.target.value })}
                    placeholder="সঞ্জয় সরকার / Sonjoy Sarkar"
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                    ব্র্যান্ড বা এজেন্সি নাম (Brand Name) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.brandName}
                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                    placeholder="ST Web & Ads Studio"
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2C3327]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                    পদবি ও স্পেশালাইজেশন (Role / Designation)
                  </label>
                  <input
                    type="text"
                    value={formData.sonjoyRole}
                    onChange={(e) => setFormData({ ...formData, sonjoyRole: e.target.value })}
                    placeholder="Performance Marketer & TikTok Ads Specialist"
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                    টাইটেল ব্যাজ (Title Badge Text)
                  </label>
                  <input
                    type="text"
                    value={formData.titleBadge}
                    onChange={(e) => setFormData({ ...formData, titleBadge: e.target.value })}
                    placeholder="TikTok & Facebook Ads Specialist for BD Businesses"
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2C3327]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                  সংক্ষিপ্ত বায়ো (Short Bio - Hero & Footer)
                </label>
                <textarea
                  rows={3}
                  value={formData.sonjoyBio}
                  onChange={(e) => setFormData({ ...formData, sonjoyBio: e.target.value })}
                  placeholder="আপনার কাজের ধরন ও সাফল্যের সংক্ষিপ্ত বিবরণ..."
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl p-3 text-xs font-medium text-[#2C3327]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                  বিস্তারিত পরিচিতি ও কাজের পদ্ধতি (Detailed Bio / Practitioner Story)
                </label>
                <textarea
                  rows={4}
                  value={formData.sonjoyDetailedBio || ''}
                  onChange={(e) => setFormData({ ...formData, sonjoyDetailedBio: e.target.value })}
                  placeholder="আপনার মার্কেটিং ফিলোসফি, ডাটা ড্রাইভেন পদ্ধতি ও ক্লায়েন্ট সাপোর্ট পলিসি..."
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl p-3 text-xs font-medium text-[#2C3327]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Key Experience & Hero Performance Stats */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9DED1]">
            <Award className="w-4 h-4 text-[#4A5D3B]" />
            <h2 className="text-sm font-bold text-[#2C3327] uppercase tracking-wider">
              অভিজ্ঞতা ও পারফরম্যান্স পরিসংখ্যান (Stats)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1]">
              <label className="block text-[11px] font-bold text-[#5C6652] mb-1">
                অভিজ্ঞতার বছর (Years of Exp.)
              </label>
              <input
                type="number"
                value={formData.sonjoyExperienceYears || 4}
                onChange={(e) => setFormData({ ...formData, sonjoyExperienceYears: Number(e.target.value) })}
                className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2C3327]"
              />
              <span className="text-[10px] text-[#8A957F] mt-1 block">যেমন: 4+ Years</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1]">
              <label className="block text-[11px] font-bold text-[#5C6652] mb-1">
                ম্যানেজ করা মোট বাজেট (Total Spend)
              </label>
              <input
                type="text"
                value={formData.sonjoyTotalAdSpendManaged || '৳১.২ কোটি+'}
                onChange={(e) => setFormData({ ...formData, sonjoyTotalAdSpendManaged: e.target.value })}
                className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2C3327]"
              />
              <span className="text-[10px] text-[#8A957F] mt-1 block">যেমন: ৳১.২ কোটি+</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1]">
              <label className="block text-[11px] font-bold text-[#5C6652] mb-1">
                সফল ক্যাম্পেইন সংখ্যা (Campaigns)
              </label>
              <input
                type="text"
                value={formData.heroStatAdGroups || formData.sonjoyCampaignsCount || '126 Groups'}
                onChange={(e) => setFormData({ ...formData, heroStatAdGroups: e.target.value, sonjoyCampaignsCount: e.target.value })}
                className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2C3327]"
              />
              <span className="text-[10px] text-[#8A957F] mt-1 block">যেমন: 126 Groups</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1]">
              <label className="block text-[11px] font-bold text-[#5C6652] mb-1">
                মোট ইম্প্রেশন সংখ্যা (Impressions)
              </label>
              <input
                type="text"
                value={formData.heroStatImpressions || '3.66M+'}
                onChange={(e) => setFormData({ ...formData, heroStatImpressions: e.target.value })}
                className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2C3327]"
              />
              <span className="text-[10px] text-[#8A957F] mt-1 block">যেমন: 3.66M+</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1]">
              <label className="block text-[11px] font-bold text-[#5C6652] mb-1">
                মোট লিড সংখ্যা (Generated Leads)
              </label>
              <input
                type="text"
                value={formData.heroStatLeads || '1,316'}
                onChange={(e) => setFormData({ ...formData, heroStatLeads: e.target.value })}
                className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2C3327]"
              />
            </div>

            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1]">
              <label className="block text-[11px] font-bold text-[#5C6652] mb-1">
                মোট কনভার্সেশন / চ্যাট (Conversations)
              </label>
              <input
                type="text"
                value={formData.heroStatConversations || '18,698'}
                onChange={(e) => setFormData({ ...formData, heroStatConversations: e.target.value })}
                className="w-full bg-white border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs font-bold text-[#2C3327]"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: Contact Channels & Location */}
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-[#D9DED1]">
            <Phone className="w-4 h-4 text-[#4A5D3B]" />
            <h2 className="text-sm font-bold text-[#2C3327] uppercase tracking-wider">
              যোগাযোগ ও অফিস তথ্য (Contact Details)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5 flex items-center gap-1">
                <MessageCircle className="w-3.5 h-3.5 text-[#25D366]" />
                <span>WhatsApp নম্বর *</span>
              </label>
              <input
                type="text"
                value={formData.whatsapp?.number || formData.whatsappNumber || '+8801815124970'}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData({
                    ...formData,
                    whatsappNumber: val,
                    whatsapp: {
                      ...formData.whatsapp,
                      number: val
                    }
                  });
                }}
                placeholder="+8801815124970"
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2C3327]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#4A5D3B]" />
                <span>অফিসিয়াল ইমেইল (Email)</span>
              </label>
              <input
                type="email"
                value={formData.email || 'sonjoy.ads.studio@gmail.com'}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sonjoy.ads.studio@gmail.com"
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2C3327]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#E2725B]" />
                <span>অফিস লোকেশন / শহর (Location)</span>
              </label>
              <input
                type="text"
                value={formData.officeLocation || 'Dhaka, Bangladesh'}
                onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                placeholder="Dhaka, Bangladesh"
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2 text-xs font-semibold text-[#2C3327]"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            className="w-full sm:w-auto bg-[#4A5D3B] hover:bg-[#3A4533] text-white px-8 py-3 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>প্রোফাইল পরিবর্তন সংরক্ষণ করুন</span>
          </button>
        </div>

      </form>
    </div>
  );
};
