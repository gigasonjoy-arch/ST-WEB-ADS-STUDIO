import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  DollarSign, 
  Sparkles, 
  MessageCircle, 
  Eye, 
  EyeOff,
  ShieldCheck, 
  Globe, 
  CheckCircle2, 
  Download, 
  Upload, 
  RotateCcw,
  Bot,
  Sliders,
  Database,
  Tag,
  KeyRound,
  Lock,
  Layout,
  Smartphone,
  Monitor,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  ArrowRight
} from 'lucide-react';
import { SiteSettings, AISettings, HeaderSettings, HeaderNavLink, LogoDisplayMode } from '../../types';
import { storageService } from '../../services/storageService';
import { FirebaseConnectionTester } from './FirebaseConnectionTester';
import { GtmTrackingSettings } from './GtmTrackingSettings';

interface AdminSettingsProps {
  settings: SiteSettings;
  onUpdateSettings: (updated: SiteSettings) => void;
  initialSubTab?: string;
  targetElementId?: string;
}

const DEFAULT_HEADER_SETTINGS: HeaderSettings = {
  logoDisplayMode: 'BOTH',
  mobileLogoDisplayMode: 'BOTH',
  showLogo: true,
  showBrandName: true,
  showPersonalName: true,
  showTagline: true,
  logoType: 'TEXT_BADGE',
  logoText: 'ST',
  logoImageUrl: '',
  logoWidth: 40,
  logoHeight: 40,
  customTaglineEn: 'Sonjoy Sarkar • Performance Marketing',
  customTaglineBn: 'সঞ্জয় সরকার • পারফরম্যান্স মার্কেটিং',
  sticky: true,
  showLanguageSwitcher: true,
  showAdminButton: true,
  showWhatsAppButton: true,
  ctaEnabled: true,
  ctaTextEn: 'Book Free Audit',
  ctaTextBn: 'ফ্রি স্ট্র্যাটেজি অডিট বুক করুন',
  ctaAction: 'LEAD_FORM',
  ctaCustomUrl: '',
  navLinks: [
    { id: 'nav-services', labelEn: 'Services', labelBn: 'সেবাসমূহ', sectionId: 'services', enabled: true, sortOrder: 1 },
    { id: 'nav-results', labelEn: 'Results & ROI', labelBn: 'ফলাফল ও ROI', sectionId: 'results', enabled: true, sortOrder: 2 },
    { id: 'nav-calculator', labelEn: 'Ads Calculator', labelBn: 'অ্যাড ক্যালকুলেটর', sectionId: 'calculator', enabled: true, sortOrder: 3 },
    { id: 'nav-case-studies', labelEn: 'Case Studies', labelBn: 'কেস স্টাডিজ', sectionId: 'case-studies', enabled: true, sortOrder: 4 },
    { id: 'nav-tiktok-guide', labelEn: 'TikTok Playbook', labelBn: 'টিকটক গাইড', sectionId: 'tiktok-education', enabled: true, sortOrder: 5 },
    { id: 'nav-faq', labelEn: 'FAQ', labelBn: 'সাধারণ জিজ্ঞাসা', sectionId: 'faq', enabled: true, sortOrder: 6 }
  ]
};

export const AdminSettings: React.FC<AdminSettingsProps> = ({ 
  settings, 
  onUpdateSettings,
  initialSubTab,
  targetElementId
}) => {
  const normalizeSubTab = (tab?: string): 'GENERAL' | 'HEADER_MANAGEMENT' | 'AI_ENGINE' | 'SECTIONS' | 'WHATSAPP_SEO' | 'GTM_TRACKING' | 'FIREBASE_TEST' | 'SECURITY' | 'BACKUP' => {
    if (!tab) return 'GENERAL';
    if (tab === 'HEADER_MANAGEMENT' || tab === 'HEADER_SETTINGS' || tab === 'HEADER') return 'HEADER_MANAGEMENT';
    if (tab === 'AI_ENGINE' || tab === 'AI_ENGINE_CONFIG' || tab === 'AI') return 'AI_ENGINE';
    if (tab === 'SECTIONS' || tab === 'SECTIONS_ORDER') return 'SECTIONS';
    if (tab === 'WHATSAPP_SEO' || tab === 'WHATSAPP' || tab === 'SEO') return 'WHATSAPP_SEO';
    if (tab === 'GTM_TRACKING' || tab === 'GTM_SETTINGS' || tab === 'TIKTOK_PIXEL' || tab === 'PIXEL' || tab === 'TRACKING') return 'GTM_TRACKING';
    if (tab === 'FIREBASE_TEST' || tab === 'FIREBASE_DIAGNOSTICS' || tab === 'FIREBASE') return 'FIREBASE_TEST';
    if (tab === 'SECURITY' || tab === 'SECURITY_PASSCODE' || tab === 'PASSCODE') return 'SECURITY';
    if (tab === 'BACKUP' || tab === 'DATA_BACKUP' || tab === 'EXPORT') return 'BACKUP';
    return 'GENERAL';
  };

  const [formData, setFormData] = useState<SiteSettings>(() => ({
    ...settings,
    header: {
      ...DEFAULT_HEADER_SETTINGS,
      ...(settings.header || {})
    }
  }));
  const [aiSettings, setAiSettings] = useState<AISettings>(() => storageService.getAISettings());
  const [activeTab, setActiveTab] = useState<
    'GENERAL' | 'HEADER_MANAGEMENT' | 'AI_ENGINE' | 'SECTIONS' | 'WHATSAPP_SEO' | 'GTM_TRACKING' | 'FIREBASE_TEST' | 'SECURITY' | 'BACKUP'
  >(() => normalizeSubTab(initialSubTab));
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Security Passcode State
  const [currentEnteredPasscode, setCurrentEnteredPasscode] = useState<string>('');
  const [newPasscode, setNewPasscode] = useState<string>('');
  const [confirmNewPasscode, setConfirmNewPasscode] = useState<string>('');
  const [showCurrentPass, setShowCurrentPass] = useState<boolean>(false);
  const [showNewPass, setShowNewPass] = useState<boolean>(false);
  const [securityStatusMsg, setSecurityStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync with initialSubTab & targetElementId
  useEffect(() => {
    if (initialSubTab) {
      setActiveTab(normalizeSubTab(initialSubTab));
    }
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
  }, [initialSubTab, targetElementId]);

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

  const handleUpdatePasscode = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityStatusMsg(null);

    if (!storageService.verifyAdminPasscode(currentEnteredPasscode)) {
      setSecurityStatusMsg({ type: 'error', text: 'বর্তমান পাসকোডটি সঠিক নয়!' });
      return;
    }

    if (!newPasscode || newPasscode.length < 6) {
      setSecurityStatusMsg({ type: 'error', text: 'নতুন পাসকোড কমপক্ষে ৬ অক্ষরের হতে হবে।' });
      return;
    }

    if (newPasscode !== confirmNewPasscode) {
      setSecurityStatusMsg({ type: 'error', text: 'নতুন পাসকোড এবং কনফার্ম পাসকোড মিলছে না।' });
      return;
    }

    storageService.setAdminPasscode(newPasscode);
    setCurrentEnteredPasscode('');
    setNewPasscode('');
    setConfirmNewPasscode('');
    setSecurityStatusMsg({ type: 'success', text: 'অ্যাডমিন সিকিউরিটি পাসকোড সফলভাবে পরিবর্তন হয়েছে!' });
    showToast('পাসকোড সফলভাবে আপডেট করা হয়েছে!');
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

  // Header helper methods
  const headerSettings: HeaderSettings = formData.header || DEFAULT_HEADER_SETTINGS;

  const updateHeader = (updates: Partial<HeaderSettings>) => {
    setFormData(prev => ({
      ...prev,
      header: {
        ...(prev.header || DEFAULT_HEADER_SETTINGS),
        ...updates
      }
    }));
  };

  const handleAddNavLink = () => {
    const newLink: HeaderNavLink = {
      id: `nav-${Date.now()}`,
      labelEn: 'New Link',
      labelBn: 'নতুন লিংক',
      sectionId: 'services',
      enabled: true,
      sortOrder: (headerSettings.navLinks?.length || 0) + 1
    };
    updateHeader({
      navLinks: [...(headerSettings.navLinks || []), newLink]
    });
  };

  const handleRemoveNavLink = (id: string) => {
    updateHeader({
      navLinks: (headerSettings.navLinks || []).filter(l => l.id !== id)
    });
  };

  const handleUpdateNavLink = (id: string, updates: Partial<HeaderNavLink>) => {
    updateHeader({
      navLinks: (headerSettings.navLinks || []).map(l => l.id === id ? { ...l, ...updates } : l)
    });
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
            হেডার ও লোগো কন্ট্রোল, ব্র্যান্ডিং, কারেন্সি রেট, এআই ইঞ্জিন, দৃশ্যমান সেকশন এবং ডাটা ব্যাকআপ কনফিগার করুন।
          </p>
        </div>

        {/* Sub-tabs */}
        <div className="flex items-center gap-1 bg-[#E8EAE2] p-1 rounded-2xl border border-[#D9DED1] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('GENERAL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'GENERAL' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            সাধারণ ও ব্র্যান্ডিং
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('HEADER_MANAGEMENT')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'HEADER_MANAGEMENT' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            <span>হেডার ও লোগো কন্ট্রোল</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('AI_ENGINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'AI_ENGINE' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            এআই ইঞ্জিন
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SECTIONS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'SECTIONS' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            সেকশন দৃশ্যমানতা
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('WHATSAPP_SEO')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'WHATSAPP_SEO' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            হোয়াটসঅ্যাপ ও এসইও
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('GTM_TRACKING')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'GTM_TRACKING' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            <Tag className="w-3 h-3" />
            <span>GTM ও পিক্সেল ট্র্যাকিং</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('FIREBASE_TEST')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'FIREBASE_TEST' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            ফায়ারবেস ক্লাউড টেস্ট
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('SECURITY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              activeTab === 'SECURITY' ? 'bg-[#4A5D3B] text-white shadow-2xs' : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            <KeyRound className="w-3 h-3" />
            <span>সিকিউরিটি ও পাসকোড</span>
          </button>
          <button
            type="button"
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

            {/* Frontend Default Language Selector */}
            <div className="bg-[#F8F9F5] p-4.5 rounded-2xl border border-[#D9DED1] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] flex items-center gap-2">
                    <Globe className="w-4 h-4 text-[#4A5D3B]" />
                    <span>ফ্রন্টএন্ডের ডিফল্ট ভাষা (Frontend Default Language)</span>
                  </label>
                  <p className="text-[11px] text-[#5C6652] mt-0.5">
                    নতুন ভিজিটর প্রথমবার ওয়েবসাইটে প্রবেশ করলে মূল ইন্টারফেসটি যে ভাষায় প্রদর্শিত হবে।
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  (formData.defaultLanguage || 'bn') === 'bn'
                    ? 'bg-[#4A5D3B] text-white border-[#4A5D3B] shadow-2xs'
                    : 'bg-white text-[#2C3327] border-[#D9DED1] hover:border-[#4A5D3B]'
                }`}>
                  <input
                    type="radio"
                    name="defaultLanguage"
                    value="bn"
                    checked={(formData.defaultLanguage || 'bn') === 'bn'}
                    onChange={() => setFormData({ ...formData, defaultLanguage: 'bn' })}
                    className="hidden"
                  />
                  <span>🇧🇩 বাংলা (Bangla)</span>
                </label>

                <label className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  formData.defaultLanguage === 'en'
                    ? 'bg-[#4A5D3B] text-white border-[#4A5D3B] shadow-2xs'
                    : 'bg-white text-[#2C3327] border-[#D9DED1] hover:border-[#4A5D3B]'
                }`}>
                  <input
                    type="radio"
                    name="defaultLanguage"
                    value="en"
                    checked={formData.defaultLanguage === 'en'}
                    onChange={() => setFormData({ ...formData, defaultLanguage: 'en' })}
                    className="hidden"
                  />
                  <span>🇺🇸 English (ইংরেজি)</span>
                </label>
              </div>
            </div>

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

              <div id="setting-exchange-rate-input">
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

        {/* TAB: HEADER & LOGO MANAGEMENT (WordPress-style full dynamic control) */}
        {activeTab === 'HEADER_MANAGEMENT' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-8 shadow-2xs" id="header-management-panel">
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-4">
              <div>
                <h3 className="font-serif font-bold text-base text-[#2C3327] flex items-center gap-2">
                  <Layout className="w-5 h-5 text-[#4A5D3B]" />
                  <span>হেডার ও লোগো কন্ট্রোল (Header & Logo Management)</span>
                </h3>
                <p className="text-xs text-[#5C6652] mt-0.5">
                  ডেস্কটপ ও মোবাইলে লোগো, ব্র্যান্ড নাম, ট্যাগলাইন, মেনু লিঙ্ক ও CTA বাটনের দৃশ্যমানতা নিয়ন্ত্রণ করুন।
                </p>
              </div>
            </div>

            {/* LIVE PREVIEW BOX */}
            <div className="p-4 bg-[#F5F1EB] rounded-2xl border border-[#D9DED1] space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-[#5C6652]">
                <span className="flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-[#4A5D3B]" />
                  <span>লাইভ হেডার প্রিভিউ (Live Header Preview)</span>
                </span>
                <span className="text-[11px] text-[#8A957F]">
                  মোড: {headerSettings.logoDisplayMode} (মোবাইল: {headerSettings.mobileLogoDisplayMode})
                </span>
              </div>

              <div className="bg-[#FDFCF8] p-4 rounded-xl border border-[#D9DED1] flex items-center justify-between shadow-xs">
                {/* Brand / Logo Preview */}
                <div className="flex items-center gap-3">
                  {headerSettings.showLogo && (headerSettings.logoDisplayMode === 'BOTH' || headerSettings.logoDisplayMode === 'LOGO_ONLY') && (
                    headerSettings.logoType === 'IMAGE_URL' && headerSettings.logoImageUrl ? (
                      <img 
                        src={headerSettings.logoImageUrl} 
                        alt="Logo" 
                        className="object-contain rounded-lg"
                        style={{ width: headerSettings.logoWidth || 40, height: headerSettings.logoHeight || 40 }}
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-2xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center font-serif text-lg font-bold shadow-xs">
                        {headerSettings.logoText || 'ST'}
                      </div>
                    )
                  )}

                  {(headerSettings.logoDisplayMode === 'BOTH' || headerSettings.logoDisplayMode === 'NAME_ONLY') && (
                    <div>
                      {headerSettings.showBrandName && (
                        <div className="font-serif text-lg font-bold text-[#2C3327] flex items-center gap-1.5">
                          <span>{formData.brandName}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B]"></span>
                        </div>
                      )}
                      {headerSettings.showTagline && (
                        <div className="text-[10px] uppercase tracking-[0.18em] text-[#8A957F] font-semibold">
                          {headerSettings.customTaglineBn || headerSettings.customTaglineEn || `${formData.personalName} • Performance Marketing`}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Nav items preview */}
                <div className="hidden md:flex items-center gap-3 text-xs text-[#5C6652] font-medium">
                  {(headerSettings.navLinks || []).filter(l => l.enabled).slice(0, 4).map(l => (
                    <span key={l.id} className="px-2 py-1 bg-white rounded-lg border border-[#D9DED1] text-[11px]">
                      {l.labelBn || l.labelEn}
                    </span>
                  ))}
                </div>

                {/* CTA preview */}
                {headerSettings.ctaEnabled && (
                  <div className="px-3 py-1.5 bg-[#4A5D3B] text-white rounded-full text-xs font-bold shadow-xs">
                    {headerSettings.ctaTextBn || headerSettings.ctaTextEn || 'Book Free Audit'}
                  </div>
                )}
              </div>
            </div>

            {/* SECTION 1: LOGO DISPLAY MODES (DESKTOP & MOBILE) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Desktop Mode */}
              <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-[#2C3327]">
                  <Monitor className="w-4 h-4 text-[#4A5D3B]" />
                  <span>১. ডেস্কটপ ডিসপ্লে মোড (Desktop Logo Mode)</span>
                </div>
                <p className="text-[11px] text-[#5C6652]">
                  পিসি এবং ল্যাপটপ স্ক্রিনে ব্র্যান্ড লোগো ও নাম কীভাবে দৃশ্যমান হবে:
                </p>
                <div className="space-y-2">
                  {[
                    { mode: 'BOTH', label: 'উভয়ই দেখান (Logo + Company Name)', desc: 'লোগো আইকন এবং এজেন্সির নাম পাশাপাশি থাকবে' },
                    { mode: 'LOGO_ONLY', label: 'শুধুমাত্র লোগো (Logo Only)', desc: 'শুধুমাত্র ব্র্যান্ড আইকন বা ছবি থাকবে' },
                    { mode: 'NAME_ONLY', label: 'শুধুমাত্র কোম্পানির নাম (Name Only)', desc: 'লোগো ছাড়া শুধু নাম ও ট্যাগলাইন থাকবে' },
                    { mode: 'NONE', label: 'উভয়ই গোপন রাখুন (Hide Brand Header)', desc: 'ব্র্যান্ড টাইটেল অংশ পুরোপুরি লুকায়িত থাকবে' },
                  ].map(opt => (
                    <label 
                      key={opt.mode}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        headerSettings.logoDisplayMode === opt.mode ? 'bg-white border-[#4A5D3B] ring-2 ring-[#4A5D3B]/20' : 'bg-stone-50/60 border-[#D9DED1]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="desktopLogoMode"
                        checked={headerSettings.logoDisplayMode === opt.mode}
                        onChange={() => updateHeader({ logoDisplayMode: opt.mode as LogoDisplayMode })}
                        className="mt-1 text-[#4A5D3B] focus:ring-[#4A5D3B]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#2C3327]">{opt.label}</div>
                        <div className="text-[11px] text-[#8A957F]">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mobile Mode */}
              <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-3">
                <div className="flex items-center gap-2 font-bold text-xs text-[#2C3327]">
                  <Smartphone className="w-4 h-4 text-[#4A5D3B]" />
                  <span>২. মোবাইল ডিসপ্লে মোড (Mobile Logo Mode)</span>
                </div>
                <p className="text-[11px] text-[#5C6652]">
                  স্মার্টফোন ও ছোট ডিভাইসের স্ক্রিন স্পেস বাঁচানোর জন্য আলাদা মোড:
                </p>
                <div className="space-y-2">
                  {[
                    { mode: 'BOTH', label: 'উভয়ই দেখান (Logo + Short Name)', desc: 'লোগো এবং নাম উভয়ই মোবাইলে শো করবে' },
                    { mode: 'LOGO_ONLY', label: 'শুধুমাত্র লোগো (Mobile Logo Only)', desc: 'মোবাইলে ক্লিন লুকের জন্য শুধুমাত্র লোগো থাকবে' },
                    { mode: 'NAME_ONLY', label: 'শুধুমাত্র নাম (Mobile Name Only)', desc: 'শুধুমাত্র কোম্পানির নাম মোবাইলে শো করবে' },
                    { mode: 'NONE', label: 'লুকিয়ে রাখুন (Hide on Mobile)', desc: 'মোবাইল হেডারে ব্র্যান্ড টেক্সট গোপন থাকবে' },
                  ].map(opt => (
                    <label 
                      key={opt.mode}
                      className={`p-3 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                        headerSettings.mobileLogoDisplayMode === opt.mode ? 'bg-white border-[#4A5D3B] ring-2 ring-[#4A5D3B]/20' : 'bg-stone-50/60 border-[#D9DED1]'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mobileLogoMode"
                        checked={headerSettings.mobileLogoDisplayMode === opt.mode}
                        onChange={() => updateHeader({ mobileLogoDisplayMode: opt.mode as LogoDisplayMode })}
                        className="mt-1 text-[#4A5D3B] focus:ring-[#4A5D3B]"
                      />
                      <div>
                        <div className="text-xs font-bold text-[#2C3327]">{opt.label}</div>
                        <div className="text-[11px] text-[#8A957F]">{opt.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* SECTION 2: GRANULAR VISIBILITY TOGGLES */}
            <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-4">
              <h4 className="text-xs font-bold text-[#2C3327] uppercase tracking-wider">
                ৩. বিস্তারিত উপাদান দৃশ্যমানতা (Element Visibility Toggles)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="p-3 bg-white rounded-xl border border-[#D9DED1] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#2C3327]">লোগো দেখান</span>
                  <input
                    type="checkbox"
                    checked={headerSettings.showLogo}
                    onChange={(e) => updateHeader({ showLogo: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-[#D9DED1] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#2C3327]">ব্র্যান্ড নাম দেখান</span>
                  <input
                    type="checkbox"
                    checked={headerSettings.showBrandName}
                    onChange={(e) => updateHeader({ showBrandName: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-[#D9DED1] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#2C3327]">ব্যক্তিগত নাম দেখান</span>
                  <input
                    type="checkbox"
                    checked={headerSettings.showPersonalName}
                    onChange={(e) => updateHeader({ showPersonalName: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-[#D9DED1] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#2C3327]">ট্যাগলাইন দেখান</span>
                  <input
                    type="checkbox"
                    checked={headerSettings.showTagline}
                    onChange={(e) => updateHeader({ showTagline: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                </label>
              </div>
            </div>

            {/* SECTION 3: LOGO TYPE & CUSTOMIZATION */}
            <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-4">
              <h4 className="text-xs font-bold text-[#2C3327] uppercase tracking-wider">
                ৪. লোগো স্টাইল ও কনফিগারেশন (Logo Style & Source)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">লোগো টাইপ</label>
                  <select
                    value={headerSettings.logoType}
                    onChange={(e) => updateHeader({ logoType: e.target.value as any })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  >
                    <option value="TEXT_BADGE">মডার্ন টেক্সট ব্যাজ (যেমন: ST)</option>
                    <option value="IMAGE_URL">কাস্টম ইমেজ লোগো (URL)</option>
                  </select>
                </div>

                {headerSettings.logoType === 'TEXT_BADGE' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#2C3327] mb-1.5">লোগো ব্যাজ টেক্সট</label>
                    <input
                      type="text"
                      maxLength={4}
                      value={headerSettings.logoText}
                      onChange={(e) => updateHeader({ logoText: e.target.value.toUpperCase() })}
                      placeholder="ST"
                      className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#2C3327]"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#2C3327] mb-1.5">লোগো ইমেজ লিঙ্ক (Image URL)</label>
                    <input
                      type="url"
                      value={headerSettings.logoImageUrl || ''}
                      onChange={(e) => updateHeader({ logoImageUrl: e.target.value })}
                      placeholder="https://example.com/logo.png"
                      className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs text-[#2C3327]"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">কাস্টম ট্যাগলাইন (বাংলা)</label>
                  <input
                    type="text"
                    value={headerSettings.customTaglineBn || ''}
                    onChange={(e) => updateHeader({ customTaglineBn: e.target.value })}
                    placeholder="সঞ্জয় সরকার • পারফরম্যান্স মার্কেটিং"
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">কাস্টম ট্যাগলাইন (English)</label>
                  <input
                    type="text"
                    value={headerSettings.customTaglineEn || ''}
                    onChange={(e) => updateHeader({ customTaglineEn: e.target.value })}
                    placeholder="Sonjoy Sarkar • Performance Marketing"
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 4: HEADER CTA BUTTON & ACTIONS */}
            <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#2C3327] uppercase tracking-wider">
                  ৫. হেডার কল-টু-অ্যাকশন বাটন (Header CTA Button)
                </h4>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={headerSettings.ctaEnabled}
                    onChange={(e) => updateHeader({ ctaEnabled: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                  <span className="text-xs font-bold text-[#2C3327]">CTA বাটন সক্রিয়</span>
                </label>
              </div>

              {headerSettings.ctaEnabled && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#2C3327] mb-1.5">বাটন টেক্সট (বাংলা)</label>
                    <input
                      type="text"
                      value={headerSettings.ctaTextBn}
                      onChange={(e) => updateHeader({ ctaTextBn: e.target.value })}
                      placeholder="ফ্রি স্ট্র্যাটেজি অডিট বুক করুন"
                      className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C3327] mb-1.5">বাটন টেক্সট (English)</label>
                    <input
                      type="text"
                      value={headerSettings.ctaTextEn}
                      onChange={(e) => updateHeader({ ctaTextEn: e.target.value })}
                      placeholder="Book Free Audit"
                      className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ক্লিক অ্যাকশন</label>
                    <select
                      value={headerSettings.ctaAction}
                      onChange={(e) => updateHeader({ ctaAction: e.target.value as any })}
                      className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    >
                      <option value="LEAD_FORM">লিড ফর্ম ওপেন করুন (Lead Modal)</option>
                      <option value="WHATSAPP">হোয়াটসঅ্যাপ চ্যাট শুরু করুন</option>
                      <option value="CALCULATOR">অ্যাড ক্যালকুলেটরে স্ক্রল করুন</option>
                      <option value="CUSTOM_URL">কাস্টম লিঙ্ক ওপেন করুন</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 5: NAVIGATION LINKS MANAGER */}
            <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#2C3327] uppercase tracking-wider">
                  ৬. হেডার মেনু ও নেভিগেশন লিংক ম্যানেজার (Nav Links)
                </h4>
                <button
                  type="button"
                  onClick={handleAddNavLink}
                  className="px-3 py-1.5 bg-[#4A5D3B] hover:bg-[#3D4D30] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>নতুন লিংক যোগ করুন</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {(headerSettings.navLinks || []).map((link, idx) => (
                  <div 
                    key={link.id}
                    className="p-3.5 bg-white rounded-xl border border-[#D9DED1] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <span className="w-6 h-6 rounded-full bg-[#E8EAE2] text-[#4A5D3B] text-xs font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                        <input
                          type="text"
                          value={link.labelBn}
                          onChange={(e) => handleUpdateNavLink(link.id, { labelBn: e.target.value })}
                          placeholder="বাংলা নাম"
                          className="bg-[#FDFCF8] border border-[#D9DED1] px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2C3327]"
                        />
                        <input
                          type="text"
                          value={link.labelEn}
                          onChange={(e) => handleUpdateNavLink(link.id, { labelEn: e.target.value })}
                          placeholder="English Label"
                          className="bg-[#FDFCF8] border border-[#D9DED1] px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2C3327]"
                        />
                        <select
                          value={link.route || link.sectionId}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val.startsWith('/')) {
                              handleUpdateNavLink(link.id, { route: val, sectionId: val.replace(/^\//, '') });
                            } else {
                              handleUpdateNavLink(link.id, { sectionId: val, route: `/${val}` });
                            }
                          }}
                          className="bg-[#FDFCF8] border border-[#D9DED1] px-2.5 py-1.5 rounded-lg text-xs font-medium text-[#2C3327]"
                        >
                          <option value="hero">Hero (হোম)</option>
                          <option value="/services">Services (সেবাসমূহ)</option>
                          <option value="/case-studies">Case Studies (কেস স্টাডিজ)</option>
                          <option value="/media-gallery">Media Gallery (মিডিয়া গ্যালারি)</option>
                          <option value="/tiktok-ads">TikTok Guide (টিকটক গাইড)</option>
                          <option value="/facebook-ads">Facebook Ads (ফেসবুক অ্যাডস)</option>
                          <option value="results">Results & ROI (ফলাফল)</option>
                          <option value="calculator">Calculator (ক্যালকুলেটর)</option>
                          <option value="/contact">Contact (যোগাযোগ)</option>
                          <option value="faq">FAQ (সাধারণ জিজ্ঞাসা)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-[#5C6652]">
                        <input
                          type="checkbox"
                          checked={link.enabled}
                          onChange={(e) => handleUpdateNavLink(link.id, { enabled: e.target.checked })}
                          className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                        />
                        <span>সক্রিয়</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveNavLink(link.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="মুছে ফেলুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SECTION 6: LAYOUT & QUICK TOGGLES */}
            <div className="p-5 rounded-2xl border border-[#D9DED1] bg-[#FDFCF8] space-y-4">
              <h4 className="text-xs font-bold text-[#2C3327] uppercase tracking-wider">
                ৭. হেডার আচরণ ও কুইক কন্ট্রোলস (Header Behavior)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <label className="p-3 bg-white rounded-xl border border-[#D9DED1] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#2C3327]">স্টিকি হেডার (Sticky)</span>
                  <input
                    type="checkbox"
                    checked={headerSettings.sticky}
                    onChange={(e) => updateHeader({ sticky: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-[#D9DED1] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#2C3327]">ভাষা পরিবর্তন বাটন (EN/বাং)</span>
                  <input
                    type="checkbox"
                    checked={headerSettings.showLanguageSwitcher}
                    onChange={(e) => updateHeader({ showLanguageSwitcher: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-[#D9DED1] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#2C3327]">অ্যাডমিন লক বাটন</span>
                  <input
                    type="checkbox"
                    checked={headerSettings.showAdminButton}
                    onChange={(e) => updateHeader({ showAdminButton: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                </label>

                <label className="p-3 bg-white rounded-xl border border-[#D9DED1] flex items-center justify-between cursor-pointer">
                  <span className="text-xs font-bold text-[#2C3327]">WhatsApp বাটন</span>
                  <input
                    type="checkbox"
                    checked={headerSettings.showWhatsAppButton}
                    onChange={(e) => updateHeader({ showWhatsAppButton: e.target.checked })}
                    className="w-4 h-4 text-[#4A5D3B] rounded focus:ring-[#4A5D3B]"
                  />
                </label>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: AI ENGINE */}
        {activeTab === 'AI_ENGINE' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs" id="ai-engine-settings">
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-3">
              <div className="flex items-center gap-2 text-[#4A5D3B]">
                <Bot className="w-5 h-5" />
                <div>
                  <h3 className="font-serif font-bold text-base text-[#2C3327]">গ্রাউন্ডেড AI নলেজ ইঞ্জিন</h3>
                  <p className="text-[11px] text-[#5C6652]">জিরো এপিআই-কি (১০০% ফ্রি, দ্রুত ও সরাসরি নলেজ বেস থেকে উত্তর)</p>
                </div>
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

            <div className="p-4 bg-[#F4F6F0] rounded-2xl border border-[#D9DED1] text-xs text-[#5C6652] space-y-1.5">
              <div className="font-bold text-[#2C3327] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#4A5D3B]" />
                অটোনোমাস নলেজ বেস ও অ্যাডস প্রেডিকশন সক্রিয়
              </div>
              <p className="leading-relaxed">
                এই চ্যাটবট কোনো এক্সটার্নাল এপিআই কি (API Key) ছাড়াই সম্পূর্ণ নির্ভুলভাবে আপনার এজেন্সির নলেজ বেস, সার্ভিস চার্জ, টিকটক ও ফেসবুক অ্যাডসের বেঞ্চমার্ক এবং রিয়েল-টাইম বাজেট প্রেডিকশন ক্যালকুলেট করে ভিজিটরদের উত্তর দেয়।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ইঞ্জিন মোড</label>
                <select
                  value={aiSettings.knowledgeRetrievalStrictness}
                  onChange={(e) => setAiSettings({ ...aiSettings, knowledgeRetrievalStrictness: e.target.value as any })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                >
                  <option value="STRICT_KB_ONLY">Strict Grounding (শুধু ভেরিফাইড নলেজ বেস থেকে উত্তর)</option>
                  <option value="ASSISTED">Assisted (নলেজ বেস প্রাধান্য + দ্রুত গাইডেন্স)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">রেসপন্স স্পিড</label>
                <input
                  type="text"
                  disabled
                  value="তাৎক্ষণিক (0ms Instant Local Execution)"
                  className="w-full bg-[#E8EAE2]/50 border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-bold text-[#4A5D3B]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5">অ্যাসিস্ট্যান্ট আচরণ ও ব্র্যান্ড পলিসি প্রম্পট</label>
              <textarea
                rows={4}
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
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs" id="section-visibility-settings">
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
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs" id="setting-whatsapp-input">
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
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ডিফল্ট মেসেজ প্রি-ফিল</label>
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#D9DED1]">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">এসইও মেটা টাইটেল</label>
                <input
                  type="text"
                  value={formData.seo.metaTitle}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, metaTitle: e.target.value }
                  })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">এসইও মেটা কি-ওয়ার্ডস</label>
                <input
                  type="text"
                  value={formData.seo.keywords}
                  onChange={(e) => setFormData({
                    ...formData,
                    seo: { ...formData.seo, keywords: e.target.value }
                  })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5">এসইও ডেসক্রিপশন</label>
              <textarea
                rows={2}
                value={formData.seo.metaDescription}
                onChange={(e) => setFormData({
                  ...formData,
                  seo: { ...formData.seo, metaDescription: e.target.value }
                })}
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                required
              />
            </div>
          </div>
        )}

        {/* TAB 5: GTM & PIXEL TRACKING */}
        {activeTab === 'GTM_TRACKING' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs">
            <h3 className="font-serif font-bold text-base text-[#2C3327] border-b border-[#D9DED1] pb-3">
              Google Tag Manager ও পিক্সেল ট্র্যাকিং
            </h3>
            <GtmTrackingSettings
              gtm={formData.gtm}
              onChange={(updatedGtm) => setFormData({ ...formData, gtm: updatedGtm })}
            />
          </div>
        )}

        {/* TAB 6: FIREBASE TEST */}
        {activeTab === 'FIREBASE_TEST' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs" id="firebase-diagnostics-section">
            <h3 className="font-serif font-bold text-base text-[#2C3327] border-b border-[#D9DED1] pb-3">
              ফায়ারবেস ক্লাউড ডেটাবেস সংযোগ পরীক্ষা
            </h3>
            <FirebaseConnectionTester />
          </div>
        )}

        {/* TAB 7: SECURITY */}
        {activeTab === 'SECURITY' && (
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] space-y-6 shadow-2xs" id="setting-security-passcode-form">
            <div className="flex items-center gap-2 border-b border-[#D9DED1] pb-3">
              <KeyRound className="w-5 h-5 text-[#4A5D3B]" />
              <h3 className="font-serif font-bold text-base text-[#2C3327]">
                অ্যাডমিন সিকিউরিটি পাসকোড পরিবর্তন
              </h3>
            </div>

            <p className="text-xs text-[#5C6652] leading-relaxed">
              অ্যাডমিন ড্যাশবোর্ডে প্রবেশের নিরাপত্তা নিশ্চিত করতে ৬ বা তার বেশি অক্ষরের শক্তিশালী পাসকোড সেট করুন।
            </p>

            {securityStatusMsg && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                  securityStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {securityStatusMsg.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <EyeOff className="w-4 h-4 text-red-600 shrink-0" />
                )}
                <span>{securityStatusMsg.text}</span>
              </div>
            )}

            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                  ১. বর্তমান পাসকোড দিন
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    value={currentEnteredPasscode}
                    onChange={(e) => setCurrentEnteredPasscode(e.target.value)}
                    placeholder="বর্তমান পাসকোড"
                    className="w-full bg-white border border-[#D9DED1] pl-4 pr-10 py-2.5 rounded-xl text-xs font-medium text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-[#8A957F] hover:text-[#2C3327] transition-colors p-0.5"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                  ২. নতুন পাসকোড দিন (কমপক্ষে ৬ অক্ষর)
                </label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    value={newPasscode}
                    onChange={(e) => setNewPasscode(e.target.value)}
                    placeholder="নতুন পাসকোড"
                    className="w-full bg-white border border-[#D9DED1] pl-4 pr-10 py-2.5 rounded-xl text-xs font-medium text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-[#8A957F] hover:text-[#2C3327] transition-colors p-0.5"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                  ৩. নতুন পাসকোড নিশ্চিত করুন
                </label>
                <input
                  type="password"
                  value={confirmNewPasscode}
                  onChange={(e) => setConfirmNewPasscode(e.target.value)}
                  placeholder="পুনরায় নতুন পাসকোড লিখুন"
                  className="w-full bg-white border border-[#D9DED1] px-4 py-2.5 rounded-xl text-xs font-medium text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleUpdatePasscode}
                  className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-2xs"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>পাসকোড আপডেট করুন</span>
                </button>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed">
              💡 <strong>টিপ:</strong> পাসকোড পরিবর্তন করলে পরবর্তীতে লগইন করার সময় শুধুমাত্র আপনার নতুন পাসকোডটি প্রযোজ্য হবে।
            </div>
          </div>
        )}

        {/* TAB 8: BACKUP & RESTORE */}
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
