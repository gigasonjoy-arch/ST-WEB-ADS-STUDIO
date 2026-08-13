import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  ExternalLink, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  Globe, 
  Sparkles,
  Smartphone,
  Eye,
  Layers,
  MessageCircle
} from 'lucide-react';
import { SocialLinksSettings, SocialLinkItem } from '../../types';
import { storageService } from '../../services/storageService';
import { onlineDbClient } from '../../services/onlineDatabaseClient';
import { initialSocialLinksSettings } from '../../data/initialData';

export const SocialMediaManagement: React.FC = () => {
  const [socialSettings, setSocialSettings] = useState<SocialLinksSettings>(initialSocialLinksSettings);
  const [successMessage, setSuccessMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  
  // Custom link builder state
  const [customLabel, setCustomLabel] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [customPlatform, setCustomPlatform] = useState<SocialLinkItem['platform']>('custom');

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const loadData = () => {
    setSocialSettings(storageService.getSocialLinksSettings());
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSave = async () => {
    storageService.saveSocialLinksSettings(socialSettings);
    storageService.notify();
    try {
      await onlineDbClient.flushPendingSync();
    } catch {
      // Background sync retry
    }
    showNotification('সোশ্যাল মিডিয়া লিঙ্কসমূহ সফলভাবে সংরক্ষিত হয়েছে!');
  };

  const handleResetDefaults = async () => {
    setSocialSettings(initialSocialLinksSettings);
    storageService.saveSocialLinksSettings(initialSocialLinksSettings);
    storageService.notify();
    try {
      await onlineDbClient.flushPendingSync();
    } catch {
      // Background sync retry
    }
    showNotification('সোশ্যাল লিঙ্ক ডিফল্টে রিসেট করা হয়েছে।');
  };

  const handleCopy = (key: string, url: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleAddCustomLink = () => {
    if (!customLabel.trim() || !customUrl.trim()) return;

    const newItem: SocialLinkItem = {
      id: `custom-soc-${Date.now()}`,
      platform: customPlatform,
      label: customLabel.trim(),
      url: customUrl.trim(),
      enabled: true,
      sortOrder: (socialSettings.customLinks?.length || 0) + 1
    };

    const updated = {
      ...socialSettings,
      customLinks: [...(socialSettings.customLinks || []), newItem]
    };

    setSocialSettings(updated);
    setCustomLabel('');
    setCustomUrl('');
  };

  const handleRemoveCustomLink = (id: string) => {
    const updated = {
      ...socialSettings,
      customLinks: (socialSettings.customLinks || []).filter(item => item.id !== id)
    };
    setSocialSettings(updated);
  };

  const standardPlatforms = [
    {
      key: 'facebook',
      label: 'ফেসবুক পেজ / প্রোফাইল (Facebook)',
      placeholder: 'https://facebook.com/sonjoysarkar.official',
      value: socialSettings.facebook || '',
      color: 'bg-blue-600/10 text-blue-400 border-blue-500/20'
    },
    {
      key: 'tiktok',
      label: 'টিকটক অ্যাকাউন্ট (TikTok)',
      placeholder: 'https://tiktok.com/@sonjoysarkar',
      value: socialSettings.tiktok || '',
      color: 'bg-pink-600/10 text-pink-400 border-pink-500/20'
    },
    {
      key: 'youtube',
      label: 'ইউটিউব চ্যানেল (YouTube)',
      placeholder: 'https://youtube.com/@stwebads',
      value: socialSettings.youtube || '',
      color: 'bg-red-600/10 text-red-400 border-red-500/20'
    },
    {
      key: 'linkedin',
      label: 'লিঙ্কডইন প্রোফাইল (LinkedIn)',
      placeholder: 'https://linkedin.com/in/sonjoysarkar',
      value: socialSettings.linkedin || '',
      color: 'bg-sky-600/10 text-sky-400 border-sky-500/20'
    },
    {
      key: 'whatsapp',
      label: 'হোয়াটসঅ্যাপ লিঙ্ক বা নম্বর (WhatsApp)',
      placeholder: '+8801815124970 or https://wa.me/8801815124970',
      value: socialSettings.whatsapp || '',
      color: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20'
    },
    {
      key: 'instagram',
      label: 'ইনস্টাগ্রাম প্রোফাইল (Instagram)',
      placeholder: 'https://instagram.com/sonjoysarkar.official',
      value: socialSettings.instagram || '',
      color: 'bg-purple-600/10 text-purple-400 border-purple-500/20'
    },
    {
      key: 'xTwitter',
      label: 'টুইটার / এক্স (X / Twitter)',
      placeholder: 'https://twitter.com/sonjoysarkar',
      value: socialSettings.xTwitter || '',
      color: 'bg-slate-700/30 text-slate-300 border-slate-700'
    },
    {
      key: 'telegram',
      label: 'টেলিগ্রাম চ্যানেল / প্রোফাইল (Telegram)',
      placeholder: 'https://t.me/sonjoysarkar',
      value: socialSettings.telegram || '',
      color: 'bg-cyan-600/10 text-cyan-400 border-cyan-500/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1.5">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Share2 className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold font-serif">সোশ্যাল মিডিয়া লিঙ্ক ম্যানেজমেন্ট</h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              Live Channels
            </span>
          </div>
          <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
            আপনার ফেসবুক, টিকটক, ইউটিউব, হোয়াটসঅ্যাপ, লিঙ্কডইন এবং অন্যান্য সোশ্যাল মিডিয়া প্রোফাইল লিংকসমূহ কনফিগার করুন। এগুলো ওয়েবসাইটের ফুটার, হেডার এবং কন্টাক্ট সেকশনে স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে।
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetDefaults}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors border border-slate-700"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ডিফল্ট রিসেট</span>
          </button>

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

      {/* Display & Placement Toggles */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <Eye className="w-4 h-4 text-indigo-400" />
          <span>সোশ্যাল লিঙ্ক প্রদর্শন ও দৃশ্যমানতা (Display Locations)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={socialSettings.showInFooter !== false}
              onChange={(e) => setSocialSettings({ ...socialSettings, showInFooter: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-xs font-bold text-white">ফুটার সেকশনে প্রদর্শন</div>
              <div className="text-[10px] text-slate-400">Footer Icon Links</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={socialSettings.showInHeader !== false}
              onChange={(e) => setSocialSettings({ ...socialSettings, showInHeader: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-xs font-bold text-white">হেডার নেভিগেশনে প্রদর্শন</div>
              <div className="text-[10px] text-slate-400">Top Header Bar</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer hover:border-slate-700 transition-colors">
            <input
              type="checkbox"
              checked={socialSettings.showInContactPage !== false}
              onChange={(e) => setSocialSettings({ ...socialSettings, showInContactPage: e.target.checked })}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <div>
              <div className="text-xs font-bold text-white">যোগাযোগ পেজে প্রদর্শন</div>
              <div className="text-[10px] text-slate-400">Contact / Bio Section</div>
            </div>
          </label>
        </div>
      </div>

      {/* Main Standard Social Inputs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {standardPlatforms.map((platform) => {
          const val = (socialSettings as any)[platform.key] || '';
          return (
            <div
              key={platform.key}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4.5 space-y-2.5 transition-all hover:border-slate-700"
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold px-2 py-0.5 rounded border ${platform.color}`}>
                  {platform.label}
                </span>

                <div className="flex items-center gap-1.5">
                  {val && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleCopy(platform.key, val)}
                        className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                        title="Copy Link"
                      >
                        {copiedKey === platform.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>

                      <a
                        href={val.startsWith('http') ? val : (platform.key === 'whatsapp' ? `https://wa.me/${val.replace(/[^0-9]/g, '')}` : `https://${val}`)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 text-slate-400 hover:text-indigo-400 transition-colors"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </>
                  )}
                </div>
              </div>

              <input
                type="text"
                value={val}
                onChange={(e) => setSocialSettings({
                  ...socialSettings,
                  [platform.key]: e.target.value
                })}
                placeholder={platform.placeholder}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          );
        })}
      </div>

      {/* Custom Social Channels / Extra Links */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>কাস্টম সোশ্যাল ও চ্যানেল লিংক (Custom Links)</span>
        </h3>
        <p className="text-xs text-slate-400">
          আপনার কোনো অতিরিক্ত কমিউনিটি গ্রুপ, ডিসকর্ড, বা কাস্টম পোর্টাল থাকলে এখানে যুক্ত করতে পারেন।
        </p>

        {/* Add new custom link form */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            value={customLabel}
            onChange={(e) => setCustomLabel(e.target.value)}
            placeholder="লেবেল (e.g. VIP Telegram Group)"
            className="sm:w-1/3 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
          />
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="URL (https://...)"
            className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={handleAddCustomLink}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>যুক্ত করুন</span>
          </button>
        </div>

        {/* Custom Links List */}
        {socialSettings.customLinks && socialSettings.customLinks.length > 0 && (
          <div className="space-y-2 pt-2">
            {socialSettings.customLinks.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg"
              >
                <div>
                  <div className="text-xs font-bold text-white">{item.label}</div>
                  <div className="text-[11px] font-mono text-slate-400">{item.url}</div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 text-slate-400 hover:text-indigo-400"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomLink(item.id)}
                    className="p-1 text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
