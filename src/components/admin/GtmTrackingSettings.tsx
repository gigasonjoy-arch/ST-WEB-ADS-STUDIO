import React, { useState } from 'react';
import { 
  Tag, 
  Code2, 
  Activity, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Play, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { GtmSettings } from '../../types';
import { trackingService } from '../../services/trackingService';

interface GtmTrackingSettingsProps {
  gtm: GtmSettings;
  onChange: (updated: GtmSettings) => void;
}

export const GtmTrackingSettings: React.FC<GtmTrackingSettingsProps> = ({ gtm, onChange }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [testEventStatus, setTestEventStatus] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<any[]>(() => trackingService.getRecentDataLayerEvents());

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleFireTestEvent = (eventName: string, sampleData: Record<string, any>) => {
    trackingService.pushEvent(eventName, sampleData);
    setTestEventStatus(`ইভেন্ট '${eventName}' সফলভাবে dataLayer এ পুশ করা হয়েছে!`);
    setRecentEvents(trackingService.getRecentDataLayerEvents());
    setTimeout(() => setTestEventStatus(null), 4000);
  };

  const gtmHeadSnippet = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtm.containerId || 'GTM-XXXXXXX'}');</script>
<!-- End Google Tag Manager -->`;

  const gtmBodySnippet = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtm.containerId || 'GTM-XXXXXXX'}"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

  return (
    <div className="space-y-8">
      {/* 1. Master GTM Container Box */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D3B]/10 border border-[#4A5D3B]/20 flex items-center justify-center text-[#4A5D3B]">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-[#2C3327]">
                Google Tag Manager (GTM) কনফিগারেশন
              </h3>
              <p className="text-xs text-[#5C6652]">
                GTM Container ID যুক্ত করে সাইটের ট্র্যাকিং ট্যাগসমূহ কেন্দ্রীয়ভাবে পরিচালনা করুন।
              </p>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 cursor-pointer bg-[#FDFCF8] border border-[#D9DED1] px-4 py-2 rounded-2xl">
            <span className="text-xs font-bold text-[#2C3327]">GTM ট্র্যাকিং স্ট্যাটাস:</span>
            <input
              type="checkbox"
              checked={gtm.enabled}
              onChange={(e) => onChange({ ...gtm, enabled: e.target.checked })}
              className="w-4 h-4 text-[#4A5D3B] rounded border-[#D9DED1] focus:ring-[#4A5D3B]"
            />
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              gtm.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-100 text-stone-600'
            }`}>
              {gtm.enabled ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয় (Disabled)'}
            </span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#2C3327] mb-1.5 flex items-center justify-between">
                <span>GTM Container ID</span>
                <a 
                  href="https://tagmanager.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-[#4A5D3B] hover:underline flex items-center gap-1 text-[11px] font-normal"
                >
                  <span>GTM ড্যাশবোর্ড খুলুন</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="যেমন: GTM-XXXXXXX"
                  value={gtm.containerId}
                  onChange={(e) => onChange({ ...gtm, containerId: e.target.value.trim().toUpperCase() })}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-mono font-bold text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                />
              </div>
              <p className="text-[11px] text-[#5C6652] mt-1.5">
                ফরম্যাট: <code className="bg-[#E8EAE2] px-1.5 py-0.5 rounded text-[#2C3327]">GTM-XXXXXXX</code>. এটি সেভ করার পর সাইটের হেডারে স্বয়ংক্রিয়ভাবে ডাটালেয়ার ও ট্র্যাকিং স্ক্রিপ্ট লোড হবে।
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-2">
              <div className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#4A5D3B]" />
                <span>স্বয়ংক্রিয় ডাটালেয়ার ইভেন্ট সাপোর্ট</span>
              </div>
              <p className="text-[11px] text-[#5C6652] leading-relaxed">
                এই প্ল্যাটফর্মে <code className="bg-[#E8EAE2] px-1 py-0.5 rounded">window.dataLayer</code> ডিফল্টভাবে সক্রিয় রয়েছে। লিড সাবমিশন, ক্যালকুলেটর হিসাব, এবং হোয়াটসঅ্যাপ ক্লিক সরাসরি GTM ট্রিগারে ট্র্যাক করা যাবে।
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#2C3327]">
              <span>GTM কোড স্ন্যাপশট (স্বয়ংক্রিয় ইনজেকশন)</span>
              <button
                type="button"
                onClick={() => handleCopy(gtmHeadSnippet, 'gtm_head')}
                className="text-[#4A5D3B] hover:text-[#2C3327] flex items-center gap-1 text-[11px]"
              >
                {copiedSection === 'gtm_head' ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span className="text-emerald-700">কপি হয়েছে!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Head কোড কপি</span>
                  </>
                )}
              </button>
            </div>
            <pre className="bg-[#1E241B] text-[#D9DED1] p-3 rounded-2xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-[#3A4533] max-h-48">
              {gtmHeadSnippet}
            </pre>
          </div>
        </div>
      </div>

      {/* 2. Direct Pixels & Analytics IDs */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
        <div className="border-b border-[#D9DED1] pb-3">
          <h3 className="font-serif font-bold text-base text-[#2C3327]">
            ডিরেক্ট পিক্সেল ও অ্যানালিটিক্স আইডি (বিকল্প / সহায়ক)
          </h3>
          <p className="text-xs text-[#5C6652] mt-0.5">
            GTM ছাড়াও চাইলে সরাসরি Meta, TikTok অথবা GA4 আইডি দিয়ে ট্র্যাকিং চালু রাখতে পারেন।
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
              Google Analytics 4 (GA4) ID
            </label>
            <input
              type="text"
              placeholder="যেমন: G-XXXXXXXXXX"
              value={gtm.googleAnalyticsId || ''}
              onChange={(e) => onChange({ ...gtm, googleAnalyticsId: e.target.value.trim().toUpperCase() })}
              className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3 py-2 rounded-xl text-xs font-mono font-medium text-[#2C3327]"
            />
            <span className="text-[10px] text-[#5C6652] mt-1 block">যেমন: G-2B4XYZ89</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
              Meta (Facebook) Pixel ID
            </label>
            <input
              type="text"
              placeholder="যেমন: 123456789012345"
              value={gtm.metaPixelId || ''}
              onChange={(e) => onChange({ ...gtm, metaPixelId: e.target.value.trim() })}
              className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3 py-2 rounded-xl text-xs font-mono font-medium text-[#2C3327]"
            />
            <span className="text-[10px] text-[#5C6652] mt-1 block">সংখ্যা আইডি (15-16 ডিজিট)</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
              TikTok Pixel ID
            </label>
            <input
              type="text"
              placeholder="যেমন: C1234567890ABC"
              value={gtm.tiktokPixelId || ''}
              onChange={(e) => onChange({ ...gtm, tiktokPixelId: e.target.value.trim().toUpperCase() })}
              className="w-full bg-[#FDFCF8] border border-[#D9DED1] px-3 py-2 rounded-xl text-xs font-mono font-medium text-[#2C3327]"
            />
            <span className="text-[10px] text-[#5C6652] mt-1 block">যেমন: C5L0K2R01P0ABC</span>
          </div>
        </div>
      </div>

      {/* 3. Custom Head & Body Scripts */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
        <div className="border-b border-[#D9DED1] pb-3">
          <h3 className="font-serif font-bold text-base text-[#2C3327] flex items-center gap-2">
            <Code2 className="w-4 h-4 text-[#4A5D3B]" />
            <span>কাস্টম স্ক্রিপ্ট ও হেডার কোড (Custom Header / Footer Scripts)</span>
          </h3>
          <p className="text-xs text-[#5C6652] mt-0.5">
            Microsoft Clarity, Pinterest Pixel, Hotjar, Google Site Verification ইত্যাদি কোড বসাতে পারেন।
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
              কাস্টম Head স্ক্রিপ্ট (<code className="font-mono text-[11px]">&lt;head&gt;</code> এর ভেতর)
            </label>
            <textarea
              rows={4}
              placeholder="<script> /* Your custom tracking code */ </script>"
              value={gtm.customHeadScript || ''}
              onChange={(e) => onChange({ ...gtm, customHeadScript: e.target.value })}
              className="w-full bg-[#FDFCF8] border border-[#D9DED1] p-3 rounded-xl text-xs font-mono text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
              কাস্টম Body স্ক্রিপ্ট (<code className="font-mono text-[11px]">&lt;body&gt;</code> এর শুরুতে)
            </label>
            <textarea
              rows={4}
              placeholder="<noscript> /* Your fallback noscript or tracking iframe */ </noscript>"
              value={gtm.customBodyScript || ''}
              onChange={(e) => onChange({ ...gtm, customBodyScript: e.target.value })}
              className="w-full bg-[#FDFCF8] border border-[#D9DED1] p-3 rounded-xl text-xs font-mono text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
            />
          </div>
        </div>
      </div>

      {/* 4. Live DataLayer Events Tester & Guide */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D9DED1] pb-4">
          <div>
            <h3 className="font-serif font-bold text-base text-[#2C3327] flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#4A5D3B]" />
              <span>DataLayer ইভেন্ট টেস্ট ও লাইভ মনিটর</span>
            </h3>
            <p className="text-xs text-[#5C6652] mt-0.5">
              ওয়েবসাইটের বিভিন্ন অ্যাকশনে স্বয়ংক্রিয়ভাবে ফায়ার হওয়া DataLayer ইভেন্টসমূহ পরীক্ষা করুন।
            </p>
          </div>

          {testEventStatus && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{testEventStatus}</span>
            </div>
          )}
        </div>

        {/* Action Triggers */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            type="button"
            onClick={() => handleFireTestEvent('generate_lead', {
              lead_type: 'tiktok_ads',
              business_category: 'E-commerce',
              monthly_budget_usd: 500,
              currency: 'BDT'
            })}
            className="p-3 bg-[#FDFCF8] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C3327]">Lead Event</span>
              <Play className="w-3 h-3 text-[#4A5D3B] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] text-[#5C6652] mt-1 block">generate_lead</span>
          </button>

          <button
            type="button"
            onClick={() => handleFireTestEvent('calculator_calculate', {
              category: 'Fashion & Apparel',
              budget_bdt: 25000,
              predicted_roas: 3.8
            })}
            className="p-3 bg-[#FDFCF8] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C3327]">Calculator Event</span>
              <Play className="w-3 h-3 text-[#4A5D3B] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] text-[#5C6652] mt-1 block">calculator_calculate</span>
          </button>

          <button
            type="button"
            onClick={() => handleFireTestEvent('whatsapp_click', {
              position: 'floating_widget',
              phone: '8801815124970'
            })}
            className="p-3 bg-[#FDFCF8] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C3327]">WhatsApp Click</span>
              <Play className="w-3 h-3 text-[#4A5D3B] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] text-[#5C6652] mt-1 block">whatsapp_click</span>
          </button>

          <button
            type="button"
            onClick={() => handleFireTestEvent('ai_chat_interaction', {
              query_topic: 'TikTok Ad Account Setup',
              role: 'visitor'
            })}
            className="p-3 bg-[#FDFCF8] hover:bg-[#E8EAE2] border border-[#D9DED1] rounded-2xl text-left transition-colors group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#2C3327]">AI Chat Event</span>
              <Play className="w-3 h-3 text-[#4A5D3B] group-hover:translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] text-[#5C6652] mt-1 block">ai_chat_interaction</span>
          </button>
        </div>

        {/* Live DataLayer Queue Viewer */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[#2C3327]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#4A5D3B]" />
              <span>সাম্প্রতিক dataLayer ইভেন্টসমূহ ({recentEvents.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setRecentEvents(trackingService.getRecentDataLayerEvents())}
              className="text-[#4A5D3B] hover:underline text-[11px]"
            >
              রিফ্রেশ করুন
            </button>
          </div>

          <div className="bg-[#1E241B] text-[#D9DED1] p-3.5 rounded-2xl font-mono text-[11px] max-h-56 overflow-y-auto space-y-2 border border-[#3A4533]">
            {recentEvents.length === 0 ? (
              <div className="text-stone-500 italic text-center py-4">
                এখনও কোনো dataLayer ইভেন্ট ফায়ার করা হয়নি। ওপরের বাটন চেপে টেস্ট করুন।
              </div>
            ) : (
              recentEvents.map((evt, idx) => (
                <div key={idx} className="border-b border-[#3A4533]/60 pb-2 last:border-b-0 last:pb-0">
                  <div className="text-[#8FB377] font-bold">
                    #{idx + 1} {evt.event ? `[event: "${evt.event}"]` : JSON.stringify(evt)}
                  </div>
                  <pre className="text-stone-300 text-[10px] mt-0.5 overflow-x-auto whitespace-pre-wrap">
                    {JSON.stringify(evt, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
