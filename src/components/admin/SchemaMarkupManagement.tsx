import React, { useState, useEffect } from 'react';
import { 
  FileCode, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  ExternalLink, 
  Download, 
  Sparkles, 
  Globe, 
  Building2, 
  User, 
  HelpCircle, 
  MapPin, 
  Phone, 
  Mail, 
  Code2, 
  Layers, 
  CheckSquare, 
  Plus, 
  Trash2,
  Eye,
  ShieldCheck
} from 'lucide-react';
import { SchemaMarkupSettings, SiteSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { schemaService } from '../../services/schemaService';
import { initialSchemaMarkupSettings } from '../../data/initialData';

export const SchemaMarkupManagement: React.FC = () => {
  const [settings, setSettings] = useState<SchemaMarkupSettings>(initialSchemaMarkupSettings);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => storageService.getSiteSettings());
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'CUSTOM_JSON' | 'PREVIEW'>('VISUAL');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [newServiceInput, setNewServiceInput] = useState('');
  const [newSameAsInput, setNewSameAsInput] = useState('');
  const [validationResult, setValidationResult] = useState<{ isValid: boolean; error?: string }>({ isValid: true });

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const loadData = () => {
    const loadedSettings = storageService.getSchemaMarkupSettings();
    const loadedSite = storageService.getSiteSettings();
    setSettings(loadedSettings);
    setSiteSettings(loadedSite);
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSave = () => {
    if (activeTab === 'CUSTOM_JSON' && settings.customJsonLd) {
      const check = schemaService.validateJsonLd(settings.customJsonLd);
      setValidationResult(check);
      if (!check.isValid) {
        showNotification('JSON Syntax Error! Please fix before saving.');
        return;
      }
    }

    storageService.saveSchemaMarkupSettings(settings);
    showNotification('Schema Markup (JSON-LD) configuration saved & injected successfully!');
  };

  const handleResetDefaults = () => {
    setSettings(initialSchemaMarkupSettings);
    storageService.saveSchemaMarkupSettings(initialSchemaMarkupSettings);
    showNotification('Reset Schema Markup to default agency structure.');
  };

  const currentGeneratedSchema = schemaService.generateMainSchema(settings, siteSettings);
  const currentSchemaString = JSON.stringify(currentGeneratedSchema, null, 2);

  const handleCopySchema = () => {
    const textToCopy = (activeTab === 'CUSTOM_JSON' && settings.customJsonLd) 
      ? settings.customJsonLd 
      : currentSchemaString;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSchema = () => {
    const content = (activeTab === 'CUSTOM_JSON' && settings.customJsonLd) 
      ? settings.customJsonLd 
      : currentSchemaString;
    const blob = new Blob([content], { type: 'application/ld+json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schema-markup.jsonld';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleAddService = () => {
    if (!newServiceInput.trim()) return;
    const current = settings.serviceOffered || [];
    if (!current.includes(newServiceInput.trim())) {
      setSettings({
        ...settings,
        serviceOffered: [...current, newServiceInput.trim()]
      });
      setNewServiceInput('');
    }
  };

  const handleRemoveService = (index: number) => {
    const current = [...(settings.serviceOffered || [])];
    current.splice(index, 1);
    setSettings({
      ...settings,
      serviceOffered: current
    });
  };

  const handleAddSameAs = () => {
    if (!newSameAsInput.trim()) return;
    const current = settings.sameAs || [];
    if (!current.includes(newSameAsInput.trim())) {
      setSettings({
        ...settings,
        sameAs: [...current, newSameAsInput.trim()]
      });
      setNewSameAsInput('');
    }
  };

  const handleRemoveSameAs = (index: number) => {
    const current = [...(settings.sameAs || [])];
    current.splice(index, 1);
    setSettings({
      ...settings,
      sameAs: current
    });
  };

  const handleFormatCustomJson = () => {
    if (!settings.customJsonLd) return;
    try {
      const parsed = JSON.parse(settings.customJsonLd);
      setSettings({
        ...settings,
        customJsonLd: JSON.stringify(parsed, null, 2)
      });
      setValidationResult({ isValid: true });
    } catch (e: any) {
      setValidationResult({ isValid: false, error: e.message });
    }
  };

  const googleTestUrl = schemaService.getGoogleRichResultsTestUrl(settings.url || 'https://sonjoysarkar.netlify.app');

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <FileCode className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-serif">Schema Markup ও JSON-LD স্ট্রাকচার্ড ডাটা</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Google SEO Ready
            </span>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            গুগল সার্চ ইঞ্জিন, গুগল বট ও AI ক্রলারদের জন্য Schema.org / JSON-LD স্ট্রাকচার্ড ডাটা কনফিগার করুন। এতে গুগল সার্চ রেজাল্টে রিচ স্নাইপেটস (Rich Snippets), স্টার রেটিং ও এফএকিউ ড্রপডাউন প্রদর্শিত হবে।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopySchema}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'কপি হয়েছে' : 'JSON-LD কপি'}</span>
          </button>

          <button
            onClick={handleDownloadSchema}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Download JSON-LD File"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ডাউনলোড</span>
          </button>

          <a
            href={googleTestUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Google Rich Results টেস্ট</span>
          </a>

          <button
            onClick={handleSave}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>পরিবর্তন সেভ করুন</span>
          </button>
        </div>
      </div>

      {/* Notification Toast */}
      {successMessage && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between text-sm shadow-md animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Mode Switcher */}
      <div className="flex border-b border-slate-800 pb-2 justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('VISUAL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'VISUAL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ভিজুয়াল স্কিমা বিল্ডার (Visual Builder)</span>
          </button>

          <button
            onClick={() => setActiveTab('CUSTOM_JSON')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'CUSTOM_JSON'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>কাস্টম JSON-LD স্ক্রিপ্ট (Custom Code)</span>
          </button>

          <button
            onClick={() => setActiveTab('PREVIEW')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'PREVIEW'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>লাইভ প্রিভিউ ও কোড ভিউ</span>
          </button>
        </div>

        <button
          onClick={handleResetDefaults}
          className="text-xs text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-950/30"
        >
          <RefreshCw className="w-3 h-3" />
          <span>ডিফল্ট রিসেট</span>
        </button>
      </div>

      {/* Main Form Body */}
      {activeTab === 'VISUAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left / Center 2 Columns: Config Panels */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Master Toggle & Schema Type */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-indigo-900/50 text-indigo-400 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">স্কিমা মার্কআপ সক্রিয়করণ (Master Toggle)</h3>
                    <p className="text-xs text-slate-400">ওয়েবসাইটের হেডে স্বয়ংক্রিয়ভাবে JSON-LD ইনজেক্ট করুন</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {/* Schema Type Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Schema.org প্রধান সত্তা টাইপ (Primary Entity Type)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'ProfessionalService', label: 'ProfessionalService', desc: 'অ্যাড এজেন্সি / কনসালটেন্সি' },
                    { id: 'LocalBusiness', label: 'LocalBusiness', desc: 'লোকাল অফিস / ব্যবসা' },
                    { id: 'Organization', label: 'Organization', desc: 'কর্পোরেট প্রতিষ্ঠান' },
                    { id: 'Person', label: 'Person', desc: 'সঞ্জয় সরকার (ব্যক্তিগত ব্র্যান্ড)' }
                  ].map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSettings({ ...settings, schemaType: t.id as any })}
                      className={`p-3 rounded-lg text-left border transition-all ${
                        settings.schemaType === t.id
                          ? 'bg-indigo-950/70 border-indigo-500 text-white shadow-sm ring-1 ring-indigo-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="text-xs font-bold">{t.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">{t.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Basic Entity Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ব্র্যান্ড বা সত্তার নাম (Entity Name) *
                  </label>
                  <input
                    type="text"
                    value={settings.name}
                    onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                    placeholder="e.g. ST Web & Ads Studio | Sonjoy Sarkar"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    বিকল্প বা সংক্ষিপ্ত নাম (Alternate Name)
                  </label>
                  <input
                    type="text"
                    value={settings.alternateName || ''}
                    onChange={(e) => setSettings({ ...settings, alternateName: e.target.value })}
                    placeholder="e.g. ST Web & Ads Studio"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    বিবরণ (Entity Description)
                  </label>
                  <textarea
                    rows={2}
                    value={settings.description}
                    onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                    placeholder="Brief description for Google search engines..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    ক্যানোনিক্যাল ওয়েবসাইট URL
                  </label>
                  <input
                    type="url"
                    value={settings.url}
                    onChange={(e) => setSettings({ ...settings, url: e.target.value })}
                    placeholder="https://sonjoysarkar.netlify.app"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    লোগো ইমেজ URL
                  </label>
                  <input
                    type="text"
                    value={settings.logoUrl || ''}
                    onChange={(e) => setSettings({ ...settings, logoUrl: e.target.value })}
                    placeholder="https://sonjoysarkar.netlify.app/logo.png"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Founder, Contact & Location Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>প্রতিষ্ঠাতা ও যোগাযোগের তথ্য (Founder & Contact)</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    প্রতিষ্ঠাতার নাম (Founder Name)
                  </label>
                  <input
                    type="text"
                    value={settings.founderName || ''}
                    onChange={(e) => setSettings({ ...settings, founderName: e.target.value })}
                    placeholder="Sonjoy Sarkar"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    প্রতিষ্ঠাতার পদবি (Job Title)
                  </label>
                  <input
                    type="text"
                    value={settings.founderJobTitle || ''}
                    onChange={(e) => setSettings({ ...settings, founderJobTitle: e.target.value })}
                    placeholder="TikTok & Facebook Ads Specialist"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    অফিসিয়াল ফোন নম্বর (Telephone)
                  </label>
                  <input
                    type="text"
                    value={settings.telephone || ''}
                    onChange={(e) => setSettings({ ...settings, telephone: e.target.value })}
                    placeholder="+8801815124970"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    অফিসিয়াল ইমেইল (Email)
                  </label>
                  <input
                    type="email"
                    value={settings.email || ''}
                    onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                    placeholder="sonjoy.ads.studio@gmail.com"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Address details */}
              <div className="pt-2 border-t border-slate-800 space-y-3">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                  <span>অফিস ঠিকানা ও ভৌগোলিক স্থানাঙ্ক (Postal Address & Geo Coordinates)</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-[11px] text-slate-400 mb-1">রাস্তা / এলাকা</label>
                    <input
                      type="text"
                      value={settings.address?.streetAddress || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        address: { ...settings.address, streetAddress: e.target.value }
                      })}
                      placeholder="Dhanmondi, Sector 27"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">শহর (Locality)</label>
                    <input
                      type="text"
                      value={settings.address?.addressLocality || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        address: { ...settings.address, addressLocality: e.target.value }
                      })}
                      placeholder="Dhaka"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">পোস্টাল কোড</label>
                    <input
                      type="text"
                      value={settings.address?.postalCode || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        address: { ...settings.address, postalCode: e.target.value }
                      })}
                      placeholder="1209"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">অক্ষাংশ (Latitude)</label>
                    <input
                      type="text"
                      value={settings.geo?.latitude || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        geo: { ...settings.geo, latitude: e.target.value }
                      })}
                      placeholder="23.7465"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">দ্রাঘিমাংশ (Longitude)</label>
                    <input
                      type="text"
                      value={settings.geo?.longitude || ''}
                      onChange={(e) => setSettings({
                        ...settings,
                        geo: { ...settings.geo, longitude: e.target.value }
                      })}
                      placeholder="90.3760"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">মূল্য স্তর (Price Range)</label>
                    <input
                      type="text"
                      value={settings.priceRange || ''}
                      onChange={(e) => setSettings({ ...settings, priceRange: e.target.value })}
                      placeholder="$$ - $$$"
                      className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Services Offered Catalog */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>প্রদত্ত সেবাসমূহ (OfferCatalog Services)</span>
              </h3>
              <p className="text-xs text-slate-400">
                গুগলে আপনার এজেন্সির অফার করা সার্ভিসগুলো যুক্ত করুন যা সার্চ ফলাফলে ইনডেক্স হবে।
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newServiceInput}
                  onChange={(e) => setNewServiceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddService();
                    }
                  }}
                  placeholder="e.g. TikTok Ad Account Unban Support"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>যুক্ত করুন</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {(settings.serviceOffered || []).map((srv, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-950 border border-slate-800 text-indigo-300 rounded-full text-xs font-medium"
                  >
                    <span>{srv}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(idx)}
                      className="text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* SameAs Social Profiles */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-400" />
                <span>সোশ্যাল প্রোফাইল লিঙ্ক (sameAs Authority Links)</span>
              </h3>
              <p className="text-xs text-slate-400">
                গুগল আপনার ব্র্যান্ডের সোশ্যাল প্ল্যাটফর্মগুলো ভেরিফাই করার জন্য এই লিঙ্কগুলো ব্যবহার করে।
              </p>

              <div className="flex gap-2">
                <input
                  type="url"
                  value={newSameAsInput}
                  onChange={(e) => setNewSameAsInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSameAs();
                    }
                  }}
                  placeholder="https://facebook.com/sonjoysarkar.official"
                  className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
                />
                <button
                  type="button"
                  onClick={handleAddSameAs}
                  className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>যুক্ত করুন</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-1">
                {(settings.sameAs || []).map((url, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300"
                  >
                    <span className="truncate max-w-[80%]">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSameAs(idx)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sync Toggles & Quick Stats */}
          <div className="space-y-6">
            
            {/* Automatic Dynamic Schemas */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>স্বয়ংক্রিয় রিচ স্নাইপেট সিঙ্ক</span>
              </h3>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.includeFaqSchema !== false}
                    onChange={(e) => setSettings({ ...settings, includeFaqSchema: e.target.checked })}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>FAQPage স্কিমা অটো-সিঙ্ক</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      নলেজ বেসের প্রশ্ন-উত্তরগুলো স্বয়ংক্রিয়ভাবে FAQ JSON-LD হিসেবে গুগলকে প্রদান করবে।
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.includeBreadcrumbSchema !== false}
                    onChange={(e) => setSettings({ ...settings, includeBreadcrumbSchema: e.target.checked })}
                    className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-400" />
                      <span>BreadcrumbList স্কিমা সিঙ্ক</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      ওয়েবসাইট পেজ ও সার্ভিসের নেভিগেশন হায়ারার্কি গুগলে প্রদর্শন করবে।
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Quick Live Preview Snippet */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                  <span>জেনারেটেড JSON-LD প্রিভিউ</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">
                  Active
                </span>
              </div>

              <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-[11px] font-mono text-indigo-300 max-h-64 overflow-y-auto leading-relaxed">
                {currentSchemaString}
              </pre>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setActiveTab('PREVIEW')}
                  className="text-xs text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>সম্পূর্ণ কোড দেখুন</span>
                  <ExternalLink className="w-3 h-3" />
                </button>

                <button
                  type="button"
                  onClick={handleCopySchema}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copied ? 'কপি হয়েছে' : 'কপি করুন'}</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Custom JSON-LD Code Editor */}
      {activeTab === 'CUSTOM_JSON' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  <span>কাস্টম JSON-LD স্ক্রিপ্ট এডিটর</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  আপনার নিজের কাস্টমাইজড Schema.org JSON কোড সরাসরি পেস্ট করুন। এটি স্বয়ংক্রিয়ভাবে &lt;head&gt; এ যুক্ত হবে।
                </p>
              </div>

              <button
                type="button"
                onClick={handleFormatCustomJson}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Format / Beautify JSON</span>
              </button>
            </div>

            <textarea
              rows={16}
              value={settings.customJsonLd || ''}
              onChange={(e) => {
                setSettings({ ...settings, customJsonLd: e.target.value });
                if (e.target.value.trim()) {
                  setValidationResult(schemaService.validateJsonLd(e.target.value));
                } else {
                  setValidationResult({ isValid: true });
                }
              }}
              placeholder={`{\n  "@context": "https://schema.org",\n  "@type": "ProfessionalService",\n  "name": "ST Web & Ads Studio",\n  "url": "https://sonjoysarkar.netlify.app"\n}`}
              className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
            />

            {!validationResult.isValid && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-lg text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{validationResult.error}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Preview View */}
      {activeTab === 'PREVIEW' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Eye className="w-4 h-4 text-indigo-400" />
              <span>Full Generated JSON-LD Markup</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">application/ld+json</span>
          </div>

          <pre className="p-5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-emerald-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[500px]">
            {currentSchemaString}
          </pre>
        </div>
      )}
    </div>
  );
};
