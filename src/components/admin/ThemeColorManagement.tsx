import React, { useState, useEffect } from 'react';
import { SiteThemeSettings, ColorPalette, FaviconSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { themeService, DEFAULT_COLOR_PALETTES, DEFAULT_THEME_SETTINGS, DEFAULT_FAVICON_SETTINGS } from '../../services/themeService';
import { 
  Palette, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Save, 
  Eye, 
  Globe, 
  Code, 
  Image as ImageIcon, 
  Smile, 
  Sliders, 
  CheckCircle2,
  ExternalLink,
  Layers,
  Layout
} from 'lucide-react';

interface ThemeColorManagementProps {
  onThemeUpdated?: () => void;
}

export const ThemeColorManagement: React.FC<ThemeColorManagementProps> = ({ onThemeUpdated }) => {
  const [theme, setTheme] = useState<SiteThemeSettings>(DEFAULT_THEME_SETTINGS);
  const [favicon, setFavicon] = useState<FaviconSettings>(DEFAULT_FAVICON_SETTINGS);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'PALETTES' | 'CUSTOM_COLORS' | 'FAVICON' | 'CUSTOM_CSS'>('PALETTES');
  const [previewPalette, setPreviewPalette] = useState<string>('classic-olive');

  useEffect(() => {
    const loadedTheme = storageService.getThemeSettings();
    const loadedFavicon = storageService.getFaviconSettings();
    setTheme(loadedTheme);
    setFavicon(loadedFavicon);
    setPreviewPalette(loadedTheme.activePaletteId || 'classic-olive');
  }, []);

  const handleSelectPalette = (palette: ColorPalette) => {
    const updated: SiteThemeSettings = {
      ...theme,
      activePaletteId: palette.id,
      backgroundColor: palette.backgroundColor,
      textColor: palette.textColor,
      headingColor: palette.headingColor,
      buttonBgColor: palette.buttonBgColor,
      buttonTextColor: palette.buttonTextColor,
      buttonHoverBgColor: palette.buttonHoverBgColor,
      accentColor: palette.accentColor,
      linkColor: palette.linkColor,
      borderColor: palette.borderColor,
      cardBgColor: palette.cardBgColor,
      sectionBgColor: palette.sectionBgColor,
      headerBgColor: palette.headerBgColor,
      headerTextColor: palette.headerTextColor,
      footerBgColor: palette.footerBgColor,
      footerTextColor: palette.footerTextColor,
      badgeBgColor: palette.badgeBgColor,
      badgeTextColor: palette.badgeTextColor
    };
    setTheme(updated);
    setPreviewPalette(palette.id);
    // Apply immediately to preview live changes
    themeService.applyTheme(updated);
    onThemeUpdated?.();
  };

  const handleColorChange = (key: keyof SiteThemeSettings, value: string) => {
    const updated = {
      ...theme,
      [key]: value,
      activePaletteId: 'custom'
    };
    setTheme(updated);
    themeService.applyTheme(updated);
    onThemeUpdated?.();
  };

  const handleSaveTheme = () => {
    storageService.saveThemeSettings(theme);
    storageService.saveFaviconSettings(favicon);
    setSavedSuccess(true);
    onThemeUpdated?.();
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset colors and theme to the default Classic Olive palette?')) {
      const defaultTheme = {
        activePaletteId: 'classic-olive',
        ...DEFAULT_COLOR_PALETTES[0],
        customCss: ''
      };
      setTheme(defaultTheme);
      themeService.applyTheme(defaultTheme);
      themeService.updateFavicon(DEFAULT_FAVICON_SETTINGS, defaultTheme);
      storageService.saveThemeSettings(defaultTheme);
      storageService.saveFaviconSettings(DEFAULT_FAVICON_SETTINGS);
      onThemeUpdated?.();
    }
  };

  const colorFields: { key: keyof SiteThemeSettings; label: string; labelBn: string; description: string }[] = [
    { key: 'backgroundColor', label: 'Canvas / Page Background', labelBn: 'মূল পেজ ব্যাকগ্রাউন্ড', description: 'Overall main background color' },
    { key: 'sectionBgColor', label: 'Alternate Section Background', labelBn: 'সেকশন ব্যাকগ্রাউন্ড', description: 'Used for case studies & highlighted zones' },
    { key: 'cardBgColor', label: 'Cards & Containers', labelBn: 'কার্ড ও কন্টেইনার', description: 'Background for interactive cards & boxes' },
    { key: 'textColor', label: 'Body Text Color', labelBn: 'বডি টেক্সট কালার', description: 'Primary paragraph and description text' },
    { key: 'headingColor', label: 'Headings & Titles', labelBn: 'হেডিং ও টাইটেল কালার', description: 'Main headings and serif titles' },
    { key: 'buttonBgColor', label: 'Primary Button Background', labelBn: 'বাটন ব্যাকগ্রাউন্ড', description: 'CTA buttons, submit triggers' },
    { key: 'buttonTextColor', label: 'Button Text Color', labelBn: 'বাটন টেক্সট কালার', description: 'Text inside primary buttons' },
    { key: 'buttonHoverBgColor', label: 'Button Hover Background', labelBn: 'বাটন হোভার কালার', description: 'Color when hovering over buttons' },
    { key: 'accentColor', label: 'Accent / Highlight Color', labelBn: 'অ্যাকসেন্ট ও স্পার্ক কালার', description: 'Icons, badges, focus rings' },
    { key: 'linkColor', label: 'Link Color', labelBn: 'লিংক কালার', description: 'Interactive hyperlinks & breadcrumbs' },
    { key: 'borderColor', label: 'Subtle Borders & Dividers', labelBn: 'বর্ডার ও ডিভাইডার কালার', description: 'Card outlines and subtle splitters' },
    { key: 'badgeBgColor', label: 'Pill / Badge Background', labelBn: 'ব্যাজ ব্যাকগ্রাউন্ড', description: 'Small status badges and tags' },
    { key: 'badgeTextColor', label: 'Badge Text Color', labelBn: 'ব্যাজ টেক্সট কালার', description: 'Text color inside badges' },
    { key: 'headerBgColor', label: 'Top Navigation Background', labelBn: 'হেডার নেভিগেশন ব্যাকগ্রাউন্ড', description: 'Sticky top bar background' },
    { key: 'headerTextColor', label: 'Header Text Color', labelBn: 'হেডার টেক্সট কালার', description: 'Navigation links color' },
    { key: 'footerBgColor', label: 'Footer Background', labelBn: 'ফুটার ব্যাকগ্রাউন্ড', description: 'Dark/deep footer background' },
    { key: 'footerTextColor', label: 'Footer Text Color', labelBn: 'ফুটার টেক্সট কালার', description: 'Footer links and copyright text' },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A5D3B]">
            <Palette className="w-4 h-4" />
            <span>ওয়েবসাইট কালার ও থিম ম্যানেজমেন্ট (Live Theme Engine)</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3327] mt-1">
            Visual Brand & Dynamic Color System
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6652] mt-1">
            যেকোনো কোড পরিবর্তন ছাড়াই এডমিন প্যানেল থেকে ওয়েবসাইটের প্রতিটি সেকশন, বাটন, হেডার, কার্ড এবং ফেভিকনের কালার পরিবর্তন করুন।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetToDefault}
            className="px-4 py-2.5 rounded-xl border border-[#D9DED1] text-xs font-semibold text-[#5C6652] hover:bg-[#F4F6F0] transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>রিসেট (Default)</span>
          </button>

          <button
            onClick={handleSaveTheme}
            className="px-6 py-2.5 rounded-xl bg-[#4A5D3B] text-[#FFFFFF] text-xs font-bold hover:bg-[#3A4533] transition-all flex items-center gap-2 shadow-xs"
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#25D366]" />
                <span>পাবলিশ সফল হয়েছে!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>পরিবর্তন সংরক্ষণ করুন (Publish)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#D9DED1] pb-2">
        <button
          onClick={() => setActiveTab('PALETTES')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'PALETTES'
              ? 'bg-[#4A5D3B] text-[#FFFFFF] shadow-2xs'
              : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F4F6F0]'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>প্রিমেড প্যালেটস (Ready Themes)</span>
        </button>

        <button
          onClick={() => setActiveTab('CUSTOM_COLORS')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CUSTOM_COLORS'
              ? 'bg-[#4A5D3B] text-[#FFFFFF] shadow-2xs'
              : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F4F6F0]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>কাস্টম কালার কন্ট্রোল (All Elements)</span>
        </button>

        <button
          onClick={() => setActiveTab('FAVICON')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'FAVICON'
              ? 'bg-[#4A5D3B] text-[#FFFFFF] shadow-2xs'
              : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F4F6F0]'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>ফেভিকন সেটিংস (Browser Favicon)</span>
        </button>

        <button
          onClick={() => setActiveTab('CUSTOM_CSS')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'CUSTOM_CSS'
              ? 'bg-[#4A5D3B] text-[#FFFFFF] shadow-2xs'
              : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F4F6F0]'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>কাস্টম CSS ইনজেকশন</span>
        </button>
      </div>

      {/* TAB 1: PRESET PALETTES */}
      {activeTab === 'PALETTES' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEFAULT_COLOR_PALETTES.map((palette) => {
              const isSelected = theme.activePaletteId === palette.id;
              return (
                <div
                  key={palette.id}
                  onClick={() => handleSelectPalette(palette)}
                  className={`cursor-pointer rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#4A5D3B] ring-2 ring-[#4A5D3B]/20 shadow-md bg-[#FFFFFF]'
                      : 'border-[#D9DED1] bg-[#FFFFFF] hover:border-[#8A957F]'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-serif font-bold text-base text-[#2C3327]">
                          {palette.nameBn}
                        </h4>
                        <div className="text-xs text-[#5C6652] mt-0.5">
                          {palette.nameEn}
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#4A5D3B] text-[#FFFFFF] flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Color Swatches Grid */}
                    <div className="grid grid-cols-5 gap-1.5 p-2 rounded-2xl bg-[#F4F6F0] border border-[#D9DED1]/60">
                      <div className="h-8 rounded-lg shadow-2xs" style={{ backgroundColor: palette.backgroundColor }} title="Canvas Background" />
                      <div className="h-8 rounded-lg shadow-2xs" style={{ backgroundColor: palette.buttonBgColor }} title="Button Background" />
                      <div className="h-8 rounded-lg shadow-2xs" style={{ backgroundColor: palette.accentColor }} title="Accent Spark" />
                      <div className="h-8 rounded-lg shadow-2xs" style={{ backgroundColor: palette.textColor }} title="Text" />
                      <div className="h-8 rounded-lg shadow-2xs" style={{ backgroundColor: palette.footerBgColor }} title="Footer" />
                    </div>

                    {/* Mini Live Preview Box */}
                    <div 
                      className="p-4 rounded-2xl border text-xs space-y-2"
                      style={{
                        backgroundColor: palette.backgroundColor,
                        color: palette.textColor,
                        borderColor: palette.borderColor
                      }}
                    >
                      <div className="font-serif font-bold text-sm" style={{ color: palette.headingColor }}>
                        Preview Title Sample
                      </div>
                      <p className="text-[11px] opacity-80">
                        High conversion ads & verified analytics preview.
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span 
                          className="px-3 py-1 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor: palette.buttonBgColor,
                            color: palette.buttonTextColor
                          }}
                        >
                          Book Strategy Call
                        </span>
                        <span 
                          className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                          style={{
                            backgroundColor: palette.badgeBgColor,
                            color: palette.badgeTextColor
                          }}
                        >
                          3.8x ROAS
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#D9DED1]/50 flex justify-between items-center text-xs font-semibold">
                    <span className="text-[#5C6652]">প্যালেট নির্বাচন করুন</span>
                    <span className={isSelected ? 'text-[#4A5D3B] font-bold' : 'text-[#8A957F]'}>
                      {isSelected ? '✓ সক্রিয় রয়েছে' : 'ক্লিক করে চালু করুন'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: GRANULAR CUSTOM COLOR PICKERS */}
      {activeTab === 'CUSTOM_COLORS' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-[#D9DED1]">
            <div>
              <h3 className="font-serif text-lg font-bold text-[#2C3327]">
                ওয়েবসাইটের প্রতিটি এলিমেন্টের কালার কাস্টমাইজ করুন
              </h3>
              <p className="text-xs text-[#5C6652]">
                কালার পরিবর্তন করলেই সাথে সাথে লাইভ প্রিভিউতে দৃশ্যমান হবে।
              </p>
            </div>
            <div className="text-xs px-3 py-1 rounded-full bg-[#E8EAE2] text-[#4A5D3B] font-bold font-mono">
              Mode: {theme.activePaletteId}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {colorFields.map((field) => {
              const currentValue = (theme[field.key] as string) || '#000000';
              return (
                <div key={field.key} className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-[#2C3327]">{field.labelBn}</div>
                      <div className="text-[11px] text-[#5C6652]">{field.label}</div>
                    </div>
                    <div 
                      className="w-7 h-7 rounded-lg border border-[#D9DED1] shadow-2xs shrink-0" 
                      style={{ backgroundColor: currentValue }} 
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="color"
                      value={currentValue}
                      onChange={(e) => handleColorChange(field.key, e.target.value)}
                      className="w-10 h-9 p-0.5 border border-[#D9DED1] rounded-xl cursor-pointer bg-white shrink-0"
                    />
                    <input
                      type="text"
                      value={currentValue}
                      onChange={(e) => handleColorChange(field.key, e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-xl border border-[#D9DED1] font-mono text-xs text-[#2C3327] bg-[#FFFFFF]"
                    />
                  </div>
                  <div className="text-[10px] text-[#8A957F]">{field.description}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: FAVICON MANAGEMENT */}
      {activeTab === 'FAVICON' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
          <div className="pb-4 border-b border-[#D9DED1]">
            <h3 className="font-serif text-lg font-bold text-[#2C3327] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#4A5D3B]" />
              <span>ব্রাউজার ফেভিকন ম্যানেজমেন্ট (Tab Icon & Badge)</span>
            </h3>
            <p className="text-xs text-[#5C6652] mt-0.5">
              ব্রাউজার ট্যাবে যে আইকন প্রদর্শিত হয় তা যেকোনো সময় ইমেজ URL, ইমোজি অথবা স্টাইলিশ টেক্সট ব্যাজের মাধ্যমে কাস্টমাইজ করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Mode 1: Text / Monogram Badge */}
            <div 
              onClick={() => {
                const updated = { ...favicon, faviconType: 'SVG_TEXT' as const };
                setFavicon(updated);
                themeService.updateFavicon(updated, theme);
              }}
              className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                favicon.faviconType === 'SVG_TEXT'
                  ? 'border-[#4A5D3B] ring-2 ring-[#4A5D3B]/20 bg-[#F4F6F0]'
                  : 'border-[#D9DED1] bg-[#FFFFFF] hover:border-[#8A957F]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs text-[#2C3327]">১. মনোগ্রাম টেক্সট ব্যাজ (SVG)</span>
                {favicon.faviconType === 'SVG_TEXT' && <Check className="w-4 h-4 text-[#4A5D3B]" />}
              </div>
              <p className="text-xs text-[#5C6652] mb-4">
                ওয়েবসাইটের ব্র্যান্ড কালার মিলিয়ে ঝকঝকে ২-৩ অক্ষরের ভেক্টর ব্যাজ।
              </p>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#2C3327] block">ব্যাজ টেক্সট (১-৩ অক্ষর):</label>
                <input
                  type="text"
                  maxLength={3}
                  value={favicon.badgeText || 'ST'}
                  onChange={(e) => {
                    const updated = { ...favicon, badgeText: e.target.value.toUpperCase() };
                    setFavicon(updated);
                    themeService.updateFavicon(updated, theme);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-sm font-mono font-bold tracking-wider"
                  placeholder="ST"
                />
              </div>
            </div>

            {/* Mode 2: Emoji Favicon */}
            <div 
              onClick={() => {
                const updated = { ...favicon, faviconType: 'EMOJI' as const };
                setFavicon(updated);
                themeService.updateFavicon(updated, theme);
              }}
              className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                favicon.faviconType === 'EMOJI'
                  ? 'border-[#4A5D3B] ring-2 ring-[#4A5D3B]/20 bg-[#F4F6F0]'
                  : 'border-[#D9DED1] bg-[#FFFFFF] hover:border-[#8A957F]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs text-[#2C3327]">২. ইমোজি আইকন</span>
                {favicon.faviconType === 'EMOJI' && <Check className="w-4 h-4 text-[#4A5D3B]" />}
              </div>
              <p className="text-xs text-[#5C6652] mb-4">
                গ্রোথ বা মার্কেটিং সিম্বল যেমন 📈, 🚀, ⚡ বা 🎯
              </p>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#2C3327] block">পছন্দের ইমোজি সিলেক্ট করুন:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={favicon.faviconEmoji || '📈'}
                    onChange={(e) => {
                      const updated = { ...favicon, faviconEmoji: e.target.value };
                      setFavicon(updated);
                      themeService.updateFavicon(updated, theme);
                    }}
                    className="w-16 px-3 py-2 rounded-xl border border-[#D9DED1] text-lg text-center font-bold"
                  />
                  <div className="flex gap-1.5 flex-wrap">
                    {['📈', '🚀', '🎯', '⚡', '📊', '💼'].map((emo) => (
                      <button
                        key={emo}
                        type="button"
                        onClick={() => {
                          const updated = { ...favicon, faviconEmoji: emo, faviconType: 'EMOJI' as const };
                          setFavicon(updated);
                          themeService.updateFavicon(updated, theme);
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-[#D9DED1] bg-white text-sm hover:bg-[#E8EAE2]"
                      >
                        {emo}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Mode 3: Custom URL Image */}
            <div 
              onClick={() => {
                const updated = { ...favicon, faviconType: 'URL' as const };
                setFavicon(updated);
                themeService.updateFavicon(updated, theme);
              }}
              className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                favicon.faviconType === 'URL'
                  ? 'border-[#4A5D3B] ring-2 ring-[#4A5D3B]/20 bg-[#F4F6F0]'
                  : 'border-[#D9DED1] bg-[#FFFFFF] hover:border-[#8A957F]'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-xs text-[#2C3327]">৩. কাস্টম ইমেজ / পিএনজি URL</span>
                {favicon.faviconType === 'URL' && <Check className="w-4 h-4 text-[#4A5D3B]" />}
              </div>
              <p className="text-xs text-[#5C6652] mb-4">
                যেকোনো হোস্ট করা .png, .ico বা .svg ফাইলের লিঙ্ক।
              </p>

              <div className="space-y-3">
                <label className="text-[11px] font-bold text-[#2C3327] block">Favicon Image URL:</label>
                <input
                  type="url"
                  value={favicon.faviconUrl || ''}
                  onChange={(e) => {
                    const updated = { ...favicon, faviconUrl: e.target.value };
                    setFavicon(updated);
                    themeService.updateFavicon(updated, theme);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs font-mono"
                  placeholder="https://example.com/logo-32x32.png"
                />
              </div>
            </div>

          </div>

          <div className="p-4 rounded-2xl bg-[#F4F6F0] border border-[#D9DED1] flex items-center justify-between">
            <div className="text-xs text-[#5C6652]">
              বর্তমানে ব্রাউজার হেড ট্যাগে <code className="font-mono bg-white px-1.5 py-0.5 rounded border">rel="icon"</code> আপডেট হয়েছে।
            </div>
            <button
              onClick={() => themeService.updateFavicon(favicon, theme)}
              className="px-4 py-1.5 rounded-xl bg-[#4A5D3B] text-[#FFFFFF] text-xs font-semibold hover:bg-[#3A4533]"
            >
              রিফ্রেশ করুন
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: CUSTOM CSS INJECTION */}
      {activeTab === 'CUSTOM_CSS' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-4">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#2C3327] flex items-center gap-2">
              <Code className="w-5 h-5 text-[#4A5D3B]" />
              <span>কাস্টম CSS ইনজেকশন (Advanced Stylist)</span>
            </h3>
            <p className="text-xs text-[#5C6652]">
              ওয়েবসাইটের নির্দিষ্ট ক্লাস বা অ্যানিমেশন ওভাররাইড করতে সরাসরি ভ্যালিড CSS কোড লিখুন।
            </p>
          </div>

          <textarea
            rows={8}
            value={theme.customCss || ''}
            onChange={(e) => {
              const updated = { ...theme, customCss: e.target.value };
              setTheme(updated);
              themeService.applyTheme(updated);
            }}
            placeholder={`/* Example custom CSS overrides */\n.theme-btn-primary {\n  box-shadow: 0 4px 14px 0 rgba(74, 93, 59, 0.39);\n}`}
            className="w-full p-4 rounded-2xl border border-[#D9DED1] font-mono text-xs text-[#2C3327] bg-[#FDFCF8] focus:ring-2 focus:ring-[#4A5D3B] outline-hidden leading-relaxed"
          />
        </div>
      )}

      {/* Live Preview Panel */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#D9DED1]">
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-[#4A5D3B]" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#2C3327]">
              লাইভ উপাদান প্রিভিউ (Interactive Theme Mockup)
            </h3>
          </div>
          <span className="text-xs text-[#8A957F]">
            কালার পরিবর্তন রিয়েল-টাইমে এখানে দেখা যাবে
          </span>
        </div>

        <div 
          className="p-6 sm:p-8 rounded-3xl border transition-all space-y-6"
          style={{
            backgroundColor: theme.backgroundColor,
            color: theme.textColor,
            borderColor: theme.borderColor
          }}
        >
          {/* Header Preview Bar */}
          <div 
            className="p-4 rounded-2xl border flex items-center justify-between"
            style={{
              backgroundColor: theme.headerBgColor,
              color: theme.headerTextColor,
              borderColor: theme.borderColor
            }}
          >
            <div className="font-serif font-bold text-sm tracking-wide">
              SONJOY SARKAR <span className="text-[10px] opacity-70 font-sans font-normal">• ADS ARCHITECT</span>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span>Results</span>
              <span>Services</span>
              <span>TikTok Guide</span>
              <button
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: theme.buttonBgColor,
                  color: theme.buttonTextColor
                }}
              >
                Book Call
              </button>
            </div>
          </div>

          {/* Hero Content Preview */}
          <div className="space-y-3 max-w-xl">
            <div 
              className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: theme.badgeBgColor,
                color: theme.badgeTextColor
              }}
            >
              TikTok & Meta Scaling Partner
            </div>
            <h1 
              className="font-serif text-2xl sm:text-3xl font-bold leading-tight"
              style={{ color: theme.headingColor }}
            >
              ৳3.2 Crore+ Ad Spend Managed with Precision ROAS.
            </h1>
            <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
              No generic advice. Engineered full-funnel TikTok & Facebook advertising for Bangladesh e-commerce brands.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                className="px-5 py-2.5 rounded-full text-xs font-bold shadow-xs transition-transform hover:scale-102"
                style={{
                  backgroundColor: theme.buttonBgColor,
                  color: theme.buttonTextColor
                }}
              >
                Schedule Strategy Audit →
              </button>
              <span 
                className="text-xs font-bold underline cursor-pointer"
                style={{ color: theme.linkColor }}
              >
                View 100+ Case Studies
              </span>
            </div>
          </div>

          {/* Card Component Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div 
              className="p-5 rounded-2xl border space-y-2"
              style={{
                backgroundColor: theme.cardBgColor,
                borderColor: theme.borderColor
              }}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.accentColor }}>
                Verified ROAS Case Study
              </div>
              <div className="font-serif font-bold text-sm" style={{ color: theme.headingColor }}>
                Dhaka Skincare Brand Scaled to ৳18.4L GMV
              </div>
              <p className="text-xs opacity-75">
                CPA reduced by 41% utilizing creator UGC and TikTok Pixel Retargeting.
              </p>
            </div>

            <div 
              className="p-5 rounded-2xl border space-y-2"
              style={{
                backgroundColor: theme.sectionBgColor,
                borderColor: theme.borderColor
              }}
            >
              <div className="text-[10px] uppercase font-bold tracking-wider" style={{ color: theme.accentColor }}>
                Conversion Calculator
              </div>
              <div className="font-serif font-bold text-sm" style={{ color: theme.headingColor }}>
                Predict Ad Returns & Optimal Spend
              </div>
              <p className="text-xs opacity-75">
                Calibrated with actual benchmark data across 64 Bangladesh districts.
              </p>
            </div>
          </div>

          {/* Footer Preview Bar */}
          <div 
            className="p-4 rounded-2xl border text-xs flex items-center justify-between"
            style={{
              backgroundColor: theme.footerBgColor,
              color: theme.footerTextColor,
              borderColor: theme.borderColor
            }}
          >
            <div>© 2026 Sonjoy Sarkar • ST Web & Ads Studio</div>
            <div className="opacity-75">Privacy • Terms • Case Studies</div>
          </div>

        </div>
      </div>

    </div>
  );
};
