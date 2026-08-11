import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  DollarSign, 
  Sparkles, 
  MessageCircle, 
  Eye, 
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  Download, 
  Upload, 
  RotateCcw,
  Bot,
  Sliders,
  Database,
  Tag
} from 'lucide-react';
import { SiteSettings, AISettings } from '../../types';
import { storageService } from '../../services/storageService';
import { FirebaseConnectionTester } from './FirebaseConnectionTester';
import { GtmTrackingSettings } from './GtmTrackingSettings';

interface AdminSettingsProps {
  settings: SiteSettings;
  onUpdateSettings: (updated: SiteSettings) => void;
}

export const AdminSettings: React.FC<AdminSettingsProps> = ({ settings, onUpdateSettings }) => {
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [aiSettings, setAiSettings] = useState<AISettings>(() => storageService.getAISettings());
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'AI_ENGINE' | 'SECTIONS' | 'WHATSAPP_SEO' | 'GTM_TRACKING' | 'FIREBASE_TEST' | 'BACKUP'>('GENERAL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);


  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    storageService.updateSiteSettings(formData);
    storageService.updateAISettings(aiSettings);
    onUpdateSettings(formData);
    showToast('সেটিংস সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const handleExportData = () => {
    const data = {
      siteSettings: storageService.getSiteSettings(),
      aiSettings: storageService.getAISettings(),
      benchmarks: storageService.getBenchmarks(true),
      districts: storageService.getDistricts(true),
      caseStudies: storageService.getCaseStudies(true),
      knowledgeBase: storageService.getKnowledgeBase(false),
      leads: storageService.getLeads(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `st_web_backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে।');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.siteSettings) {
          storageService.updateSiteSettings(parsed.siteSettings);
          setFormData(parsed.siteSettings);
          onUpdateSettings(parsed.siteSettings);
        }
        if (parsed.aiSettings) {
          storageService.updateAISettings(parsed.aiSettings);
          setAiSettings(parsed.aiSettings);
        }
        showToast('ব্যাকআপ সফলভাবে ইম্পোর্ট ও রিস্টোর করা হয়েছে!');
      } catch (err) {
        alert('ত্রুটি: ভুল বা করাপ্ট JSON ফাইল।');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] tracking-tight">
            সাইট ও সিস্টেম সেটিংস
          </h1>
          <p className="text-sm text-[#5C6652] mt-1">
            ব্র্যান্ডিং, কারেন্সি রেট, এআই ইঞ্জিন প্রম্পট, দৃশ্যমান সেকশন এবং ডাটা ব্যাকআপ কনফিগার করুন।
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-[#E8EAE2] p-1 rounded-2xl border border-[#D9DED1] overflow-x-auto">
          <button
            onClick={() => setActiveTab('GENERAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'GENERAL' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            সাধারণ ও ব্র্যান্ডিং
          </button>
          <button
            onClick={() => setActiveTab('AI_ENGINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'AI_ENGINE' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            এআই ইঞ্জিন
          </button>
          <button
            onClick={() => setActiveTab('SECTIONS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'SECTIONS' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            সেকশন দৃশ্যমানতা
          </button>
          <button
            onClick={() => setActiveTab('WHATSAPP_SEO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'WHATSAPP_SEO' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            হোয়াটসঅ্যাপ ও এসইও
          </button>
          <button
            onClick={() => setActiveTab('GTM_TRACKING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'GTM_TRACKING' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>GTM ও পিক্সেল ট্র্যাকিং</span>
          </button>
          <button
            onClick={() => setActiveTab('FIREBASE_TEST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'FIREBASE_TEST' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            ফায়ারবেস ক্লাউড টেস্ট
          </button>
          <button
            onClick={() => setActiveTab('BACKUP')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'BACKUP' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            ব্যাকআপ ও এক্সপোর্ট
          </button>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-[#4A5D3B] text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveGeneral} className="space-y-6">
        {/* TAB 1: GENERAL */}
        {activeTab === 'GENERAL' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-[#2C3327] border-b border-[#D9DED1] pb-3">
              মূল ব্র্যান্ড ও প্রোফাইল কনফিগারেশন
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ব্র্যান্ড নাম</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ব্যক্তিগত নাম</label>
                <input
                  type="text"
                  value={formData.personalName}
                  onChange={(e) => setFormData({ ...formData, personalName: e.target.value })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">টাইটেল ব্যাজ (Subtitle)</label>
                <input
                  type="text"
                  value={formData.titleBadge}
                  onChange={(e) => setFormData({ ...formData, titleBadge: e.target.value })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ডলার এক্সচেঞ্জ রেট (USD to BDT)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.exchangeRateUsdToBdt}
                  onChange={(e) => setFormData({ ...formData, exchangeRateUsdToBdt: Number(e.target.value) })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A5D3B]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5">হিরো সেকশন হেডলাইন</label>
              <textarea
                rows={2}
                value={formData.heroHeadline}
                onChange={(e) => setFormData({ ...formData, heroHeadline: e.target.value })}
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5">হিরো সাব-হেডলাইন</label>
              <textarea
                rows={3}
                value={formData.heroSubheadline}
                onChange={(e) => setFormData({ ...formData, heroSubheadline: e.target.value })}
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">প্রাইমারি CTA বাটন টেক্সট</label>
                <input
                  type="text"
                  value={formData.primaryCtaText}
                  onChange={(e) => setFormData({ ...formData, primaryCtaText: e.target.value })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">সেকেন্ডারি CTA বাটন টেক্সট</label>
                <input
                  type="text"
                  value={formData.secondaryCtaText}
                  onChange={(e) => setFormData({ ...formData, secondaryCtaText: e.target.value })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: AI ENGINE */}
        {activeTab === 'AI_ENGINE' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs">
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-3">
              <div className="flex items-center gap-2 text-[#4A5D3B]">
                <Bot className="w-5 h-5" />
                <h3 className="font-serif font-bold text-base text-[#2C3327]">Gemini AI মডেল ও গ্রাউন্ডিং পলিসি</h3>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={aiSettings.enabled}
                  onChange={(e) => setAiSettings({ ...aiSettings, enabled: e.target.checked })}
                  className="w-4 h-4 text-[#4A5D3B] rounded border-[#D9DED1]"
                />
                <span className="text-xs font-bold text-[#2C3327]">এআই চ্যাটবট সক্রিয়</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">প্রাইমারি এআই মডেল</label>
                <select
                  value={aiSettings.primaryModel}
                  onChange={(e) => setAiSettings({ ...aiSettings, primaryModel: e.target.value })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                >
                  <option value="gemini-3.6-flash">Gemini 3.6 Flash (Fast & Cost Efficient - Recommended)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">গ্রাউন্ডিং মোড (Anti-Hallucination)</label>
                <select
                  value={aiSettings.knowledgeRetrievalStrictness}
                  onChange={(e) => setAiSettings({ ...aiSettings, knowledgeRetrievalStrictness: e.target.value as any })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                >
                  <option value="STRICT_KB_ONLY">Strict Grounding (শুধু নলেজ বেসের ডাটা থেকে উত্তর)</option>
                  <option value="ASSISTED">Assisted (নলেজ বেস প্রাধান্য + সাধারণ মার্কেটিং সহায়তা)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5">সিস্টেম ইন্সট্রাকশন ও আচরণ প্রম্পট</label>
              <textarea
                rows={5}
                value={aiSettings.systemInstruction}
                onChange={(e) => setAiSettings({ ...aiSettings, systemInstruction: e.target.value })}
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-mono text-[#2C3327] leading-relaxed"
                required
              />
            </div>
          </div>
        )}

        {/* TAB 3: SECTIONS */}
        {activeTab === 'SECTIONS' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-[#2C3327] border-b border-[#D9DED1] pb-3">
              ল্যান্ডিং পেজ সেকশন শো / হাইড
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {Object.entries(formData.sectionVisibility).map(([key, val]) => (
                <label
                  key={key}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    val ? 'bg-[#FDFCF8] border-[#4A5D3B]/40' : 'bg-stone-50 border-stone-200 opacity-60'
                  }`}
                >
                  <span className="text-xs font-bold text-[#2C3327] capitalize">{key} সেকশন</span>
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={(e) => setFormData({
                      ...formData,
                      sectionVisibility: { ...formData.sectionVisibility, [key]: e.target.checked }
                    })}
                    className="w-4 h-4 text-[#4A5D3B] rounded border-[#D9DED1] focus:ring-[#4A5D3B]"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP & SEO */}
        {activeTab === 'WHATSAPP_SEO' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-[#2C3327] border-b border-[#D9DED1] pb-3">
              হোয়াটসঅ্যাপ ইন্টিগ্রেশন ও এসইও মেটাডাটা
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">হোয়াটসঅ্যাপ নম্বর (কান্ট্রি কোড সহ)</label>
                <input
                  type="text"
                  value={formData.whatsapp.number}
                  onChange={(e) => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, number: e.target.value }
                  })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ডিফল্ট মেসেজ প্রম্পট</label>
                <input
                  type="text"
                  value={formData.whatsapp.defaultMessage}
                  onChange={(e) => setFormData({
                    ...formData,
                    whatsapp: { ...formData.whatsapp, defaultMessage: e.target.value }
                  })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">SEO সাইট টাইটেল</label>
                <input
                  type="text"
                  value={formData.seo.siteTitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, siteTitle: e.target.value }
                  })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">SEO মেটা ডেসক্রিপশন</label>
                <input
                  type="text"
                  value={formData.seo.siteDescription}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, siteDescription: e.target.value }
                  })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB: GTM & TRACKING CODES */}
        {activeTab === 'GTM_TRACKING' && (
          <GtmTrackingSettings 
            gtm={formData.gtm} 
            onChange={(updatedGtm) => setFormData({ ...formData, gtm: updatedGtm })} 
          />
        )}

        {/* TAB: FIREBASE TEST & DIAGNOSTICS */}
        {activeTab === 'FIREBASE_TEST' && (
          <FirebaseConnectionTester />
        )}

        {/* TAB 5: BACKUP & RESTORE */}
        {activeTab === 'BACKUP' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-[#2C3327] border-b border-[#D9DED1] pb-3">
              ডাটাবেজ ব্যাকআপ ও রিস্টোর
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-3">
                <div className="font-bold text-xs text-[#2C3327]">১. সম্পূর্ণ সিস্টেম ব্যাকআপ ডাউনলোড</div>
                <p className="text-xs text-[#5C6652]">
                  সকল লিড, নলেজ বেস, কেস স্টাডি ও বেঞ্চমার্ক রেট একটি JSON ফাইলে সেভ করুন।
                </p>
                <button
                  type="button"
                  onClick={handleExportData}
                  className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON ব্যাকআপ ডাউনলোড করুন</span>
                </button>
              </div>

              <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-3">
                <div className="font-bold text-xs text-[#2C3327]">২. ব্যাকআপ ফাইল থেকে রিস্টোর</div>
                <p className="text-xs text-[#5C6652]">
                  পূর্বে ডাউনলোড করা JSON ব্যাকআপ আপলোড করে ডাটাবেজ পুনরুদ্ধার করুন।
                </p>
                <label className="inline-flex items-center gap-2 bg-white border border-[#D9DED1] hover:bg-[#E8EAE2] text-[#2C3327] px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-2xs">
                  <Upload className="w-4 h-4" />
                  <span>JSON ফাইল নির্বাচন করুন</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Submit Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-[#D9DED1]">
          <button
            type="submit"
            className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-6 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
          >
            <Save className="w-4 h-4" />
            <span>সকল সেটিংস সংরক্ষণ করুন</span>
          </button>
        </div>
      </form>
    </div>
  );
};
