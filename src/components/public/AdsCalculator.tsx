import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  RefreshCw, 
  DollarSign, 
  Smartphone, 
  FileText, 
  Lock, 
  Unlock,
  AlertCircle,
  HelpCircle,
  BarChart2,
  Info,
  Tag,
  Layers,
  Zap,
  Target
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { trackingService } from '../../services/trackingService';
import { ProductPriceRange, LeadSubmission, SiteSettings } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AdsCalculatorProps {
  onOpenLeadFormWithContext?: (contextData: any) => void;
}

export const AdsCalculator: React.FC<AdsCalculatorProps> = ({ onOpenLeadFormWithContext }) => {
  const { language } = useLanguage();
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(storageService.getSiteSettings());
  const exchangeRate = siteSettings.exchangeRateUsdToBdt || 150;
  const minBudgetUSD = siteSettings.minAdBudgetUSD || siteSettings.minMonthlyBudgetUSD || 1;
  const minBudgetBDT = siteSettings.minAdBudgetBDT || siteSettings.minMonthlyBudgetBDT || Math.round(minBudgetUSD * exchangeRate);

  const [currency, setCurrency] = useState<'USD' | 'BDT'>('BDT');
  const [adBudgetUSD, setAdBudgetUSD] = useState<number>(200); // $200 default
  const [productPriceBDT, setProductPriceBDT] = useState<number>(1500); // ৳1,500 default
  const [selectedCategory, setSelectedCategory] = useState<string>('Fashion & Apparel');
  const [selectedPlatform, setSelectedPlatform] = useState<'Compare TikTok vs Facebook' | 'TikTok' | 'Facebook'>('Compare TikTok vs Facebook');
  const [selectedCreative, setSelectedCreative] = useState<'UGC' | 'Product Video' | 'Image'>('UGC');
  const [selectedGoal, setSelectedGoal] = useState<'Purchase' | 'Messages' | 'Lead'>('Purchase');
  const [selectedLocation, setSelectedLocation] = useState<string>('All Bangladesh');

  // Lead Gate / Unlock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [leadName, setLeadName] = useState('');
  const [leadPhone, setLeadPhone] = useState('');
  const [leadEmail, setLeadEmail] = useState('');
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);

  // Dynamic Product Price Ranges from Storage
  const [priceRanges, setPriceRanges] = useState<ProductPriceRange[]>([]);

  useEffect(() => {
    const updateFromStorage = () => {
      setSiteSettings(storageService.getSiteSettings());
      setPriceRanges(storageService.getProductPriceRanges(false));
    };

    updateFromStorage();
    const unsubscribe = storageService.subscribe(updateFromStorage);

    // Check if visitor has unlocked before
    const visitor = storageService.getVisitorId();
    const savedLeads = storageService.getLeads();
    const existing = savedLeads.find(l => l.visitorId === visitor);
    if (existing) {
      setIsUnlocked(true);
    }

    return () => unsubscribe();
  }, []);

  const categories = [
    'Fashion & Apparel',
    'Beauty & Cosmetics',
    'Electronics & Gadgets',
    'Footwear & Leather',
    'Food & Organic Grocery',
    'Home Decor & Lifestyle',
    'Jewelry & Accessories',
    'Health & Wellness',
    'Baby & Kids Products',
    'Online Courses & Services'
  ];

  const locations = [
    'All Bangladesh',
    'Dhaka Metropolitan',
    'Chattogram',
    'Sylhet',
    'Rajshahi',
    'Khulna'
  ];

  // Quick budget presets
  const budgetPresetsUSD = [
    { label: '$1 (Test)', val: 1 },
    { label: '$50', val: 50 },
    { label: '$150', val: 150 },
    { label: '$300', val: 300 },
    { label: '$500', val: 500 },
    { label: '$1,000', val: 1000 }
  ];

  const budgetPresetsBDT = [
    { label: '৳150 (Test)', val: 150 },
    { label: '৳7,500', val: 7500 },
    { label: '৳22,500', val: 22500 },
    { label: '৳45,000', val: 45000 },
    { label: '৳75,000', val: 75000 },
    { label: '৳1,50,000', val: 150000 }
  ];

  // Handle Budget Changes
  const handleBudgetUSDChange = (val: number) => {
    const safeVal = Math.max(minBudgetUSD, val);
    setAdBudgetUSD(safeVal);
  };

  const handleBudgetBDTChange = (valBDT: number) => {
    const safeBDT = Math.max(minBudgetBDT, valBDT);
    const usd = Number((safeBDT / exchangeRate).toFixed(2));
    setAdBudgetUSD(Math.max(minBudgetUSD, usd));
  };

  // Get current active price tier
  const activePriceTier = priceRanges.find(r => 
    productPriceBDT >= r.minPriceBDT && productPriceBDT <= r.maxPriceBDT
  ) || priceRanges[0];

  // Dynamic Real-Time Prediction Engine
  const predictionOutput = storageService.calculatePrediction({
    adBudgetUSD,
    productCategory: selectedCategory,
    platform: selectedPlatform,
    creativeType: selectedCreative,
    conversionGoal: selectedGoal,
    location: selectedLocation,
    productPriceBDT
  });

  const currentBudgetBDT = Math.round(adBudgetUSD * exchangeRate);

  const handleUnlockReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadPhone.trim() || !leadName.trim()) return;

    setIsSubmittingLead(true);
    const newLead: LeadSubmission = {
      id: `lead_${Date.now()}`,
      name: leadName.trim(),
      phone: leadPhone.trim(),
      email: leadEmail.trim() || undefined,
      businessType: selectedCategory,
      interestedService: selectedPlatform === 'TikTok' ? 'TIKTOK_ADS' : selectedPlatform === 'Facebook' ? 'FACEBOOK_ADS' : 'BOTH',
      monthlyBudget: `$${adBudgetUSD} (৳${currentBudgetBDT.toLocaleString('en-IN')})`,
      status: 'NEW',
      notes: `Prediction unlocked from Ads Calculator. Category: ${selectedCategory}, Product Price: ৳${productPriceBDT}, Platform: ${selectedPlatform}, Creative: ${selectedCreative}`,
      createdAt: new Date().toISOString(),
      visitorId: storageService.getVisitorId(),
      calculatorSnapshot: {
        budgetBDT: currentBudgetBDT,
        category: selectedCategory,
        estimatedActions: predictionOutput.tiktok?.estimatedResults.max || predictionOutput.facebook?.estimatedResults.max || 0,
        estimatedROAS: predictionOutput.tiktok?.estimatedRoas.max || predictionOutput.facebook?.estimatedRoas.max || 0
      }
    };

    storageService.saveLead(newLead);
    
    // Fire real-time server fallback to ensure Webhook and Telegram notifications are triggered
    fetch('/api/leads/fallback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newLead)
    }).catch(err => console.debug('Real-time fallback notice from calculator:', err));

    trackingService.pushEvent('generate_lead', {
      source: 'ads_calculator',
      lead_id: newLead.id,
      category: selectedCategory,
      platform: selectedPlatform,
      budget_usd: adBudgetUSD,
      budget_bdt: currentBudgetBDT
    });
    setIsSubmittingLead(false);
    setIsUnlocked(true);
  };

  // WhatsApp Message Link Generator
  const generateWhatsAppUrl = () => {
    const rawPhone = siteSettings?.whatsapp?.number || (siteSettings as any)?.whatsappNumber || '8801815124970';
    const cleanPhone = rawPhone ? rawPhone.replace(/[^0-9]/g, '') : '8801815124970';
    const message = `Hello Sonjoy Sarkar, I used your Ads Prediction Calculator for my ${selectedCategory} business.
Monthly Budget: $${adBudgetUSD} (৳${currentBudgetBDT.toLocaleString('en-IN')})
Product Price: ৳${productPriceBDT.toLocaleString('en-IN')}
Creative Format: ${selectedCreative}
Platform Preference: ${selectedPlatform}
Target Goal: ${selectedGoal}

I would like to consult on launching high-ROAS campaigns.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <section id="calculator" className="py-20 lg:py-28 bg-[#F5F1EB] border-y border-[#D9DED1]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-[#E8EAE2] rounded-full text-[10px] uppercase tracking-[0.2em] text-[#4A5D3B] font-bold">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive ROI & Ads Prediction Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-[#2C3327]">
            TikTok & Facebook Ads Budget Calculator
          </h2>
          <p className="text-sm sm:text-base text-[#5C6652] leading-relaxed">
            Estimate reach, clicks, qualified conversions, revenue, and ROAS calibrated specifically for the Bangladesh e-commerce ecosystem.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Input Parameters Form */}
          <div className="lg:col-span-6 bg-[#FFFFFF] rounded-[32px] border border-[#D9DED1] p-6 sm:p-8 shadow-sm space-y-6">
            
            {/* Currency & Exchange Rate Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D9DED1]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8A957F] flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#4A5D3B]" />
                <span>Campaign Parameters</span>
              </span>

              {/* Currency Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#8A957F] hidden sm:inline">
                  Exchange Rate: $1 = ৳{exchangeRate}
                </span>
                <div className="flex items-center bg-[#F5F1EB] p-1 rounded-full border border-[#D9DED1]">
                  <button
                    type="button"
                    onClick={() => setCurrency('BDT')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      currency === 'BDT' ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs' : 'text-[#5C6652]'
                    }`}
                  >
                    BDT (৳)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency('USD')}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      currency === 'USD' ? 'bg-[#4A5D3B] text-[#FDFCF8] shadow-xs' : 'text-[#5C6652]'
                    }`}
                  >
                    USD ($)
                  </button>
                </div>
              </div>
            </div>

            {/* 1. Total Ad Budget Input */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-[#4A5D3B]" />
                  <span>{language === 'en' ? 'Monthly Advertising Budget:' : 'মাসিক বিজ্ঞাপনী বাজেট:'}</span>
                </label>
                <div className="text-right">
                  <span className="text-base font-serif font-bold text-[#4A5D3B]">
                    {currency === 'BDT' ? `৳${currentBudgetBDT.toLocaleString('en-IN')}` : `$${adBudgetUSD.toLocaleString('en-US')}`}
                  </span>
                  <span className="text-[11px] text-[#8A957F] ml-1.5">
                    ({currency === 'BDT' ? `$${adBudgetUSD}` : `৳${currentBudgetBDT.toLocaleString('en-IN')}`})
                  </span>
                </div>
              </div>

              {/* Preset Budget Chips */}
              <div className="flex flex-wrap gap-2">
                {(currency === 'USD' ? budgetPresetsUSD : budgetPresetsBDT).map((preset) => {
                  const isSelected = currency === 'USD' 
                    ? adBudgetUSD === preset.val 
                    : currentBudgetBDT === preset.val;
                  return (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => currency === 'USD' ? handleBudgetUSDChange(preset.val) : handleBudgetBDTChange(preset.val)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-[#4A5D3B] text-[#FDFCF8] border-[#4A5D3B]'
                          : 'bg-[#FDFCF8] text-[#5C6652] border-[#D9DED1] hover:bg-[#E8EAE2]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>

              {/* Budget Range Slider */}
              {currency === 'USD' ? (
                <div className="space-y-1">
                  <input
                    type="range"
                    min={1}
                    max={2000}
                    step={1}
                    value={adBudgetUSD}
                    onChange={(e) => handleBudgetUSDChange(Number(e.target.value))}
                    className="w-full h-2 bg-[#E8EAE2] rounded-lg appearance-none cursor-pointer accent-[#4A5D3B]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A957F] font-medium">
                    <span>Min: $1</span>
                    <span>$500</span>
                    <span>$1,000</span>
                    <span>$2,000+</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <input
                    type="range"
                    min={150}
                    max={300000}
                    step={150}
                    value={currentBudgetBDT}
                    onChange={(e) => handleBudgetBDTChange(Number(e.target.value))}
                    className="w-full h-2 bg-[#E8EAE2] rounded-lg appearance-none cursor-pointer accent-[#4A5D3B]"
                  />
                  <div className="flex justify-between text-[10px] text-[#8A957F] font-medium">
                    <span>Min: ৳150</span>
                    <span>৳50,000</span>
                    <span>৳1,50,000</span>
                    <span>৳3,00,000+</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Product Price (Dynamic Price Range Impact) */}
            <div className="space-y-2.5 bg-[#F9FAF6] p-4 rounded-2xl border border-[#D9DED1]">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#E2725B]" />
                    <span>{language === 'en' ? 'Average Product Price / Ticket Size:' : 'গড় প্রোডাক্ট মূল্য / অর্ডার ভ্যালু:'}</span>
                  </label>
                  <div className="text-[11px] text-[#5C6652]">
                    {language === 'en' 
                      ? 'Price tier dynamically influences buyer conversion velocity & ticket ROAS.' 
                      : 'প্রোডাক্টের প্রাইস টায়ার কনভার্সন রেট ও সম্ভাব্য আরওআই-তে প্রভাব ফেলে।'}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base font-serif font-bold text-[#2C3327]">
                    ৳{productPriceBDT.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Quick Price Preset Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: language === 'en' ? '৳350 (Low Ticket)' : '৳৩৫০ (কম মূল্য)', val: 350 },
                  { label: language === 'en' ? '৳850 (Affordable)' : '৳৮৫০ (সাশ্রয়ী)', val: 850 },
                  { label: language === 'en' ? '৳1,500 (Mid-Standard)' : '৳১,৫০০ (স্ট্যান্ডার্ড)', val: 1500 },
                  { label: language === 'en' ? '৳2,800 (Premium)' : '৳২,৮০০ (প্রিমিয়াম)', val: 2800 },
                  { label: language === 'en' ? '৳5,500 (Luxury)' : '৳৫,৫০০ (লাক্সারি)', val: 5500 }
                ].map((tier) => (
                  <button
                    key={tier.val}
                    type="button"
                    onClick={() => setProductPriceBDT(tier.val)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all ${
                      productPriceBDT === tier.val
                        ? 'bg-[#2C3327] text-[#FDFCF8] border-[#2C3327]'
                        : 'bg-[#FFFFFF] text-[#5C6652] border-[#D9DED1] hover:bg-[#E8EAE2]'
                    }`}
                  >
                    {tier.label}
                  </button>
                ))}
              </div>

              {/* Price Range Slider */}
              <input
                type="range"
                min={100}
                max={15000}
                step={50}
                value={productPriceBDT}
                onChange={(e) => setProductPriceBDT(Number(e.target.value))}
                className="w-full h-2 bg-[#E8EAE2] rounded-lg appearance-none cursor-pointer accent-[#E2725B]"
              />

              {/* Active Tier Info Badge */}
              {activePriceTier && (
                <div className="flex items-center justify-between text-[11px] pt-1 text-[#5C6652]">
                  <span className="font-semibold text-[#4A5D3B] flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    Tier: {language === 'en' ? activePriceTier.labelEn : (activePriceTier.labelBn || activePriceTier.labelEn)}
                  </span>
                  <span className="text-[10px] bg-[#E8EAE2] px-2 py-0.5 rounded-full font-medium">
                    CVR Multiplier: {activePriceTier.cvrMultiplier}x
                  </span>
                </div>
              )}
            </div>

            {/* 3. Platform & Objective Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C3327]">
                  {language === 'en' ? 'Target Platform:' : 'বিজ্ঞাপন প্ল্যাটফর্ম নির্বাচন:'}
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value as any)}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2C3327] font-medium focus:outline-none focus:border-[#4A5D3B]"
                >
                  <option value="Compare TikTok vs Facebook">
                    {language === 'en' ? 'Compare TikTok vs Facebook' : 'TikTok ও Facebook তুলনা'}
                  </option>
                  <option value="TikTok">
                    {language === 'en' ? 'TikTok Ads Only' : 'শুধুমাত্র TikTok Ads'}
                  </option>
                  <option value="Facebook">
                    {language === 'en' ? 'Facebook Ads Only' : 'শুধুমাত্র Facebook Ads'}
                  </option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C3327]">
                  {language === 'en' ? 'Conversion Goal:' : 'কনভার্সন গোল (লক্ষ্য):'}
                </label>
                <select
                  value={selectedGoal}
                  onChange={(e) => setSelectedGoal(e.target.value as any)}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2C3327] font-medium focus:outline-none focus:border-[#4A5D3B]"
                >
                  <option value="Purchase">{language === 'en' ? 'Purchase (Web Orders / E-commerce)' : 'Purchase (অনলাইন অর্ডার / সেলস)'}</option>
                  <option value="Lead">{language === 'en' ? 'Lead (Inquiry Form Submissions)' : 'Lead (ফরম ফিলাপ / কোয়েরি)'}</option>
                  <option value="View Content">{language === 'en' ? 'View Content (Product / Page Views)' : 'View Content (প্রোডাক্ট ভিউ)'}</option>
                  <option value="Messages">{language === 'en' ? 'Messages (WhatsApp / Messenger)' : 'Messages (ইনবক্স / হোয়াটসঅ্যাপ)'}</option>
                  <option value="Link Clicks">{language === 'en' ? 'Link Clicks (Outbound Clicks)' : 'Link Clicks (ওয়েব লিঙ্ক ক্লিক)'}</option>
                  <option value="Video Views">{language === 'en' ? 'Video Views (ThruPlay / Video Plays)' : 'Video Views (ভিডিও ভিউ)'}</option>
                  <option value="App Installs">{language === 'en' ? 'App Installs (Mobile App Downloads)' : 'App Installs (অ্যাপ ইনস্টল)'}</option>
                  <option value="App Events">{language === 'en' ? 'App Events (In-App Actions)' : 'App Events (ইন-অ্যাপ ইভেন্ট)'}</option>
                  <option value="Reach">{language === 'en' ? 'Reach (Unique Audience Reached)' : 'Reach (ইউনিক মানুষের কাছে পৌঁছানো)'}</option>
                  <option value="Post Engagement">{language === 'en' ? 'Post Engagement (Likes, Shares, Comments)' : 'Post Engagement (লাইক/কমেন্ট/শেয়ার)'}</option>
                  <option value="Follower Ads">{language === 'en' ? 'Follower Ads (Page / Profile Growth)' : 'Follower Ads (পেজ ফলোয়ার বৃদ্ধি)'}</option>
                  <option value="Calls">{language === 'en' ? 'Calls (Direct Phone Inquiries)' : 'Calls (সরাসরি ফোন কল)'}</option>
                  <option value="Traffic">{language === 'en' ? 'Traffic (High-Intent Website Traffic)' : 'Traffic (ওয়েবসাইট ট্রাফিক)'}</option>
                </select>
              </div>
            </div>

            {/* 4. Product Category & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C3327]">
                  {language === 'en' ? 'Product Category:' : 'প্রোডাক্ট ক্যাটাগরি:'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2C3327] font-medium focus:outline-none focus:border-[#4A5D3B]"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#2C3327]">
                  {language === 'en' ? 'Target Geography:' : 'টার্গেট লোকেশন:'}
                </label>
                <select
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-2xl px-3.5 py-2.5 text-xs text-[#2C3327] font-medium focus:outline-none focus:border-[#4A5D3B]"
                >
                  {locations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 5. Creative Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#2C3327]">
                {language === 'en' ? 'Creative Asset Format:' : 'ক্রিয়েটিভ ফরম্যাট নির্বাচন:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'UGC', label: language === 'en' ? 'UGC / Video (+25% ROAS)' : 'UGC / ভিডিও (+২৫% ROAS)', icon: Smartphone },
                  { id: 'Product Video', label: language === 'en' ? 'Product Video (+15% ROAS)' : 'ডেমো ভিডিও (+১৫% ROAS)', icon: Zap },
                  { id: 'Image', label: language === 'en' ? 'Static Image Banner' : 'ইমেজ ব্যানার', icon: FileText }
                ].map((cr) => {
                  const Icon = cr.icon;
                  return (
                    <button
                      key={cr.id}
                      type="button"
                      onClick={() => setSelectedCreative(cr.id as any)}
                      className={`p-2.5 rounded-2xl text-[11px] font-semibold border text-center transition-all flex flex-col items-center gap-1 ${
                        selectedCreative === cr.id
                          ? 'bg-[#2C3327] text-[#FDFCF8] border-[#2C3327] shadow-xs'
                          : 'bg-[#FDFCF8] text-[#5C6652] border-[#D9DED1] hover:bg-[#E8EAE2]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{cr.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Real-Time Prediction Output */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Prediction Overview Card */}
            <div className="bg-[#2C3327] text-[#FDFCF8] rounded-[32px] p-6 sm:p-8 border border-[#3A4533] shadow-lg relative overflow-hidden space-y-6">
              
              {/* Header Status */}
              <div className="flex items-center justify-between pb-4 border-b border-[#3A4533]">
                <div>
                  <div className="text-[10px] uppercase font-bold text-[#E2725B] tracking-widest flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Real-Time Forecast Engine' : 'রিয়েল-টাইম ফোরকাস্ট ইঞ্জিন'}</span>
                  </div>
                  <h3 className="text-xl font-serif font-bold text-[#FDFCF8] mt-0.5">
                    {language === 'en' ? 'Estimated Campaign Outcomes' : 'সম্ভাব্য ক্যাম্পেইন ফলাফল'}
                  </h3>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-[#8A957F]">
                    {language === 'en' ? 'Daily Budget' : 'দৈনিক বাজেট'}
                  </div>
                  <div className="text-sm font-bold text-[#D9DED1]">
                    ৳{Math.round(currentBudgetBDT / 30).toLocaleString('en-IN')}/day (${(adBudgetUSD / 30).toFixed(1)}/day)
                  </div>
                </div>
              </div>

              {/* TikTok vs Facebook Tabs or Side-by-Side Display */}
              <div className="space-y-4">
                {predictionOutput.tiktok && (
                  <div className="bg-[#3A4533] p-5 rounded-2xl border border-[#4A5D3B]/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#00F2FE]"></span>
                        <span className="font-bold text-sm text-[#FDFCF8]">TikTok Ads Projection</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#4A5D3B] text-[#FDFCF8]">
                        {language === 'en' ? 'Confidence: ' : 'নির্ভুলতা: '}{predictionOutput.tiktok.confidence}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-[#2C3327]/60 p-2.5 rounded-xl border border-[#4A5D3B]/20">
                        <div className="text-[9px] uppercase font-bold text-[#8A957F]">
                          {language === 'en' ? 'Estimated Reach' : 'সম্ভাব্য রিচ'}
                        </div>
                        <div className="text-xs font-bold text-[#FDFCF8] mt-0.5">
                          {predictionOutput.tiktok.estimatedReach.formatted}
                        </div>
                      </div>

                      <div className="bg-[#2C3327]/60 p-2.5 rounded-xl border border-[#4A5D3B]/20">
                        <div className="text-[9px] uppercase font-bold text-[#8A957F]">
                          {language === 'en' ? 'Web Clicks' : 'সম্ভাব্য ক্লিক'}
                        </div>
                        <div className="text-xs font-bold text-[#FDFCF8] mt-0.5">
                          {predictionOutput.tiktok.estimatedClicks.formatted}
                        </div>
                      </div>

                      <div className="bg-[#2C3327]/60 p-2.5 rounded-xl border border-[#4A5D3B]/20">
                        <div className="text-[9px] uppercase font-bold text-[#8A957F]">{predictionOutput.tiktok.resultLabel}</div>
                        <div className="text-xs font-bold text-[#00F2FE] mt-0.5">
                          {predictionOutput.tiktok.estimatedResults.formatted}
                        </div>
                      </div>

                      <div className="bg-[#2C3327]/60 p-2.5 rounded-xl border border-[#4A5D3B]/20">
                        <div className="text-[9px] uppercase font-bold text-[#8A957F]">
                          {language === 'en' ? 'Est. ROAS' : 'সম্ভাব্য ROAS'}
                        </div>
                        <div className="text-xs font-bold text-[#E2725B] mt-0.5">
                          {predictionOutput.tiktok.estimatedRoas.formatted}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#4A5D3B]/30 text-[#D9DED1]">
                      <span>{language === 'en' ? 'Est. Cost Per Result: ' : 'প্রতি রেজাল্ট খরচ: '}<strong>{predictionOutput.tiktok.estimatedCostPerResult.formatted}</strong></span>
                      <span>{language === 'en' ? 'Gross Sales: ' : 'মোট বিক্রয়: '}<strong className="text-[#00F2FE]">{predictionOutput.tiktok.estimatedSalesValueBDT.formatted}</strong></span>
                    </div>
                  </div>
                )}

                {predictionOutput.facebook && (
                  <div className="bg-[#3A4533] p-5 rounded-2xl border border-[#4A5D3B]/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]"></span>
                        <span className="font-bold text-sm text-[#FDFCF8]">Facebook Ads Projection</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#4A5D3B] text-[#FDFCF8]">
                        {language === 'en' ? 'Confidence: ' : 'নির্ভুলতা: '}{predictionOutput.facebook.confidence}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                      <div className="bg-[#2C3327]/60 p-2.5 rounded-xl border border-[#4A5D3B]/20">
                        <div className="text-[9px] uppercase font-bold text-[#8A957F]">
                          {language === 'en' ? 'Estimated Reach' : 'সম্ভাব্য রিচ'}
                        </div>
                        <div className="text-xs font-bold text-[#FDFCF8] mt-0.5">
                          {predictionOutput.facebook.estimatedReach.formatted}
                        </div>
                      </div>

                      <div className="bg-[#2C3327]/60 p-2.5 rounded-xl border border-[#4A5D3B]/20">
                        <div className="text-[9px] uppercase font-bold text-[#8A957F]">
                          {language === 'en' ? 'Web Clicks' : 'সম্ভাব্য ক্লিক'}
                        </div>
                        <div className="text-xs font-bold text-[#FDFCF8] mt-0.5">
                          {predictionOutput.facebook.estimatedClicks.formatted}
                        </div>
                      </div>

                      <div className="bg-[#2C3327]/60 p-2.5 rounded-xl border border-[#4A5D3B]/20">
                        <div className="text-[9px] uppercase font-bold text-[#8A957F]">{predictionOutput.facebook.resultLabel}</div>
                        <div className="text-xs font-bold text-[#1877F2] mt-0.5">
                          {predictionOutput.facebook.estimatedResults.formatted}
                        </div>
                      </div>

                      <div className="bg-[#2C3327]/60 p-2.5 rounded-xl border border-[#4A5D3B]/20">
                        <div className="text-[9px] uppercase font-bold text-[#8A957F]">
                          {language === 'en' ? 'Est. ROAS' : 'সম্ভাব্য ROAS'}
                        </div>
                        <div className="text-xs font-bold text-[#E2725B] mt-0.5">
                          {predictionOutput.facebook.estimatedRoas.formatted}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-[#4A5D3B]/30 text-[#D9DED1]">
                      <span>{language === 'en' ? 'Est. Cost Per Result: ' : 'প্রতি রেজাল্ট খরচ: '}<strong>{predictionOutput.facebook.estimatedCostPerResult.formatted}</strong></span>
                      <span>{language === 'en' ? 'Gross Sales: ' : 'মোট বিক্রয়: '}<strong className="text-[#1877F2]">{predictionOutput.facebook.estimatedSalesValueBDT.formatted}</strong></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Strategic AI Verdict */}
              {predictionOutput.comparisonVerdict && (
                <div className="p-4 rounded-2xl bg-[#3A4533]/90 border border-[#4A5D3B]/40 text-xs leading-relaxed space-y-1.5">
                  <div className="flex items-center gap-1.5 text-[#E2725B] font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{language === 'en' ? 'Strategic Optimization Analysis' : 'স্ট্র্যাটেজিক অপ্টিমাইজেশন অ্যানালাইসিস'}</span>
                  </div>
                  <p className="text-[#D9DED1] text-[11px]">
                    {predictionOutput.comparisonVerdict}
                  </p>
                </div>
              )}

            </div>

            {/* Lead Unlock & Direct WhatsApp Booking */}
            {!isUnlocked ? (
              <div className="bg-[#FFFFFF] rounded-[32px] border-2 border-dashed border-[#4A5D3B]/40 p-6 sm:p-7 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#2C3327]">
                      {language === 'en' ? 'Unlock Full Performance Audit & Growth Roadmap' : 'সম্পূর্ণ পারফরম্যান্স অডিট ও রোডম্যাপ আনলক করুন'}
                    </h4>
                    <p className="text-[11px] text-[#5C6652]">
                      {language === 'en' 
                        ? 'Enter your details to save this calculation snapshot and receive a complimentary strategy review from Sonjoy Sarkar.' 
                        : 'আপনার তথ্য দিয়ে এই ক্যালকুলেশন রিপোর্টটি সেভ করুন এবং সঞ্জয় সরকারের সাথে ফ্রি স্ট্র্যাটেজি রিভিউ গ্রহণ করুন।'}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleUnlockReport} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      required
                      value={leadName}
                      onChange={(e) => setLeadName(e.target.value)}
                      placeholder={language === 'en' ? 'Your Full Name *' : 'আপনার নাম *'}
                      className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                    />
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder={language === 'en' ? 'WhatsApp Number (e.g. 01712xxxxxx) *' : 'WhatsApp নম্বর (যেমন 01712xxxxxx) *'}
                      className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                    />
                  </div>

                  <input
                    type="email"
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder={language === 'en' ? 'Email Address (Optional)' : 'ইমেইল এড্রেস (ঐচ্ছিক)'}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />

                  <button
                    type="submit"
                    disabled={isSubmittingLead}
                    className="w-full bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] py-3 rounded-xl text-xs font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    <span>{isSubmittingLead ? (language === 'en' ? 'Saving Snapshot...' : 'সেভ হচ্ছে...') : (language === 'en' ? 'Unlock Audit & Save Calculation' : 'রিপোর্ট আনলক ও সেভ করুন')}</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-[#E8EAE2]/70 rounded-[32px] border border-[#4A5D3B]/40 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#2C3327]">
                      {language === 'en' ? 'Performance Forecast Saved' : 'পারফরম্যান্স প্রজেকশন সেভ হয়েছে'}
                    </div>
                    <div className="text-[11px] text-[#5C6652]">
                      {language === 'en'
                        ? `Discuss your ৳${productPriceBDT} product strategy directly with Sonjoy Sarkar on WhatsApp.`
                        : `আপনার ৳${productPriceBDT} টাকার প্রোডাক্টের স্ট্র্যাটেজি নিয়ে সরাসরি WhatsApp-এ কথা বলুন।`}
                    </div>
                  </div>
                </div>

                <a
                  href={generateWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] rounded-xl text-xs font-bold shrink-0 text-center transition-colors shadow-xs"
                >
                  {language === 'en' ? 'Chat on WhatsApp' : 'WhatsApp এ মেসেজ দিন'}
                </a>
              </div>
            )}

            {/* Model Disclaimer */}
            <div className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#D9DED1] text-[11px] text-[#8A957F] leading-relaxed flex items-start gap-2">
              <Info className="w-4 h-4 text-[#8A957F] shrink-0 mt-0.5" />
              <span>
                <strong>{language === 'en' ? 'Model Note:' : 'মডেল নোট:'}</strong> {language === 'en'
                  ? 'Projections represent statistical medians from past Bangladesh campaign data. Actual return is subject to product market-fit, offer compellingness, video hook velocity, and checkout frictionless experience. Minimum testing budget starts at $1 (৳150).'
                  : 'এই প্রজেকশনটি বাংলাদেশে পূর্ববর্তী ক্যাম্পেইনের তথ্যের ওপর ভিত্তি করে তৈরি। বাস্তব ফলাফল প্রোডাক্টের গুণমান, ভিডিও হুক এবং ল্যান্ডিং পেজের সুবিধার ওপর নির্ভর করে। সর্বনিম্ন টেস্ট বাজেট শুরু $১ (৳১৫০) থেকে।'}
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
