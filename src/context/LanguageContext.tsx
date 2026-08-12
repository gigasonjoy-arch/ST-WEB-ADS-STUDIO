import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.tiktok': 'TikTok Guide',
    'nav.audience': 'Who It Is For',
    'nav.process': 'Workflow',
    'nav.calculator': 'Ads Calculator',
    'nav.caseStudies': 'Case Studies',
    'nav.faq': 'FAQ',
    'nav.admin': 'Admin',
    'nav.getQuote': 'Book a Free Audit',
    'nav.whatsapp': 'Chat on WhatsApp',

    // Hero
    'hero.badge': 'Performance Marketing Specialist (TikTok & Facebook Ads)',
    'hero.verifiedPractitioner': 'Verified Practitioner',
    'hero.headline': 'Predictable, Tracking-Backed & Optimized Ads for Measurable Growth.',
    'hero.subheadline': 'We don’t make fake guarantees or empty promises. Through precise pixel tracking, creative angle testing, and data-driven optimization, we maximize the return on every dollar of your ad budget.',
    'hero.cta.primary': 'Fill Lead Form',
    'hero.cta.secondary': 'Predict Ads ROI',
    'hero.cta.whatsapp': 'Talk on WhatsApp',
    'hero.pillar.tracking.title': 'Tracking Accuracy',
    'hero.pillar.tracking.desc': 'Pixel & Server Event Precision',
    'hero.pillar.creative.title': 'Creative Angle',
    'hero.pillar.creative.desc': 'UGC & Smartphone Video Hook Testing',
    'hero.pillar.optimization.title': 'Optimization',
    'hero.pillar.optimization.desc': 'Data-Led CBO Scaling Framework',
    'hero.profile.focus': 'Specialist Focus:',
    'hero.profile.bio': 'Digital Marketing Executive & Performance Ads Specialist. Experienced in precision pixel tracking, UGC video creative strategies, and ROI-focused TikTok & Meta ad campaigns for e-commerce, fashion, beauty, skincare, and local brands in Bangladesh.',
    'hero.stats.header': 'TikTok Ads Manager Consolidated Data',
    'hero.stats.tag': 'Historical Audit',
    'hero.stats.groups': 'Ad Groups Audited',
    'hero.stats.impressions': 'Impressions Managed',
    'hero.stats.conversations': 'Customer Conversations',
    'hero.stats.leads': 'Qualified Leads',
    'hero.stats.note': '*Internal campaign audit dataset across 126 ad groups. Historical figures do not constitute a future guarantee.',
    'hero.platforms.primary': 'Primary',
    'hero.platforms.secondary': 'Secondary',
    'hero.platforms.market': 'Market: Bangladesh',

    // Services
    'services.badge': 'Core Service Offerings',
    'services.title': 'Structured & Tracking-Driven Ad Management',
    'services.subtitle': 'We eliminate fluff and focus exclusively on high-impact performance levers that convert ad spend into revenue and customer acquisitions.',
    'services.tt.tag': 'Primary Service',
    'services.tt.sub': 'For High-Growth Brands',
    'services.tt.title': 'TikTok Ads Management',
    'services.tt.desc': 'Short-form UGC and smartphone video campaigns designed to capture Bangladesh’s fast-growing demographic. Structured to maximize engagement, lower CPM, and drive verified purchases.',
    'services.tt.includes': 'What’s included in the campaign:',
    'services.tt.cta': 'Discuss TikTok Ads Strategy',
    'services.fb.tag': 'Secondary Service',
    'services.fb.sub': 'For Established Channels',
    'services.fb.title': 'Facebook Ads Management',
    'services.fb.desc': 'Meta Business Suite configuration with Conversions API (CAPI), custom & lookalike audience retargeting funnels, and high-intent messaging/catalog sales campaigns.',
    'services.fb.includes': 'What’s included in the campaign:',
    'services.fb.cta': 'Discuss Facebook Ads Strategy',

    // TikTok Education
    'tiktok.badge': 'Platform Insights',
    'tiktok.title': 'Real Potential & Honest Understanding of TikTok Ads in Bangladesh',
    'tiktok.subtitle': 'Debunking common myths and explaining why TikTok is a high-yield growth engine for Bangladesh e-commerce today.',
    'tiktok.p1.title': 'Low CPM & High Organic Engagement',
    'tiktok.p1.desc': 'Cost per thousand impressions (CPM) on TikTok Bangladesh is still significantly lower than Facebook, enabling wider brand reach at fraction of the budget.',
    'tiktok.p2.title': 'Active, Purchasing Demographics',
    'tiktok.p2.desc': 'No longer just a teen app. Bangladesh’s 18–35 demographic spends an average of 43 minutes daily discovering and buying products on TikTok.',
    'tiktok.p3.title': 'High Conversion from Authentic UGC',
    'tiktok.p3.desc': 'Unpolished, smartphone-recorded unboxing, try-on, and customer reaction videos generate up to 3x higher trust and purchase intent than studio TVCs.',
    'tiktok.myths.title': '3 Popular Myths vs Data-Driven Reality',
    'tiktok.myths.sub': 'Learnings derived from real campaign audits in Bangladesh',
    'tiktok.myth.label': 'Myth',
    'tiktok.fact.label': 'Fact',
    'tiktok.m1.myth': 'Only cheap or low-ticket items sell on TikTok',
    'tiktok.m1.fact': 'With verified pixel tracking and high-retention UGC hooks, fashion, gadgets, and skincare priced between ৳1,500 to ৳8,000 convert consistently.',
    'tiktok.m2.myth': 'There is no pixel or conversion tracking on TikTok',
    'tiktok.m2.fact': 'TikTok has a full-featured Pixel and Events API allowing precision tracking for PageView, ViewContent, AddToCart, InitiateCheckout, and Purchases.',
    'tiktok.m3.myth': 'You need expensive studio cameras to run TikTok ads',
    'tiktok.m3.fact': 'The algorithm heavily favors native, unfiltered smartphone videos. The first 3 seconds hook matters far more than camera equipment.',

    // Audience & Process
    'audience.badge': 'Target Businesses',
    'audience.title': 'Who Is This Service Best Suited For?',
    'audience.subtitle': 'We do not enforce a one-size-fits-all formula. Every campaign structure is tailored to the product margins, audience behavior, and sales funnel.',
    'process.badge': '4-Step Workflow',
    'process.title': 'How We Execute Your Campaigns',
    'process.subtitle': 'Instead of relying on guesswork, every campaign follows a disciplined 4-step scientific marketing framework.',
    'process.s1.num': '01',
    'process.s1.title': 'Business & Offer Audit',
    'process.s1.desc': 'Auditing your product pricing, gross margins, target audience persona, competitor ads, and current messaging/checkout flow.',
    'process.s2.num': '02',
    'process.s2.title': 'Tracking & Pixel Setup',
    'process.s2.desc': 'Configuring TikTok Pixel & Meta Conversions API (CAPI) with full event parameters (ViewContent, AddToCart, Purchase) for optimal machine learning.',
    'process.s3.num': '03',
    'process.s3.title': 'Creative Angle Launch',
    'process.s3.desc': 'Deploying 3–5 distinct video angles (problem-solution, try-on, customer review, offer hooks) across broad and targeted interest segments.',
    'process.s4.num': '04',
    'process.s4.title': 'Data-Led Optimization',
    'process.s4.desc': 'Analyzing weekly CPA, CTR, ROAS, and retention to scale winning ad sets while rapidly pruning underperforming creatives.',

    // Ads Calculator
    'calc.badge': 'Interactive Prediction Tool',
    'calc.title': 'TikTok & Facebook Ads Prediction Calculator',
    'calc.subtitle': 'Estimate your projected reach, impressions, clicks, conversions, and expected ROAS range based on verified Bangladesh performance benchmarks.',
    'calc.platform': 'Target Ad Platform',
    'calc.industry': 'Product Category / Industry',
    'calc.objective': 'Campaign Objective',
    'calc.budget': 'Monthly Advertising Budget',
    'calc.aov': 'Average Product Price (BDT)',
    'calc.creative': 'Creative Readiness',
    'calc.objective.purchase': 'E-commerce Purchase',
    'calc.objective.conversation': 'Customer Messages (WhatsApp/Inbox)',
    'calc.objective.leads': 'Lead Form Inquiries',
    'calc.creative.ugc': 'UGC / Video Ready (Recommended)',
    'calc.creative.image': 'Static Images Only',
    'calc.creative.mixed': 'Mixed (Image + Video)',
    'calc.results.title': 'Projected Campaign Performance',
    'calc.results.impressions': 'Estimated Impressions',
    'calc.results.clicks': 'Projected Clicks',
    'calc.results.actions': 'Estimated Conversions',
    'calc.results.cpa': 'Est. Cost Per Result',
    'calc.results.roas': 'Projected ROAS Range',
    'calc.results.revenue': 'Projected Gross Revenue',
    'calc.unlock.title': 'Unlock Detailed Strategy Breakdown',
    'calc.unlock.desc': 'Enter your contact details to unlock the full breakdown and receive a customized audit report on WhatsApp.',
    'calc.unlock.name': 'Your Name',
    'calc.unlock.phone': 'WhatsApp Number',
    'calc.unlock.btn': 'Unlock Full Breakdown',
    'calc.disclaimer': '*This calculator uses historical benchmarks for projection purposes only. Actual results vary based on offer strength, website speed, and creative quality.',

    // Case Studies
    'cs.badge': 'Track Record & Audits',
    'cs.title': 'Real Campaign Case Studies & Verified Results',
    'cs.subtitle': 'Transparent, data-backed reports with genuine metrics and zero inflated claims.',
    'cs.filter.all': 'All Studies',
    'cs.filter.tiktok': 'TikTok Ads',
    'cs.filter.facebook': 'Facebook Ads',
    'cs.verifiedTag': 'Verified Campaign Report',
    'cs.spend': 'Ad Spend (BDT)',
    'cs.impressions': 'Impressions',
    'cs.clicks': 'Clicks',
    'cs.leads': 'Leads / Messages',
    'cs.roas': 'ROAS',
    'cs.viewProof': 'View Proof / Analytics',
    'cs.cta': 'Book Similar Strategy Audit',

    // FAQ
    'faq.badge': 'Common Inquiries',
    'faq.title': 'Frequently Asked Questions',
    'faq.subtitle': 'Direct answers to questions about our ad management services, pricing, tracking, and campaign workflows.',
    'faq.search': 'Search questions...',
    'faq.stillQuestions': 'Still have specific questions?',
    'faq.askAi': 'Ask our AI Assistant',
    'faq.orWhatsapp': 'or talk directly on WhatsApp',

    // Lead Form Modal
    'modal.title': 'Request a Free Ad Strategy Audit',
    'modal.subtitle': 'Fill out your business details. We will analyze your niche and get back within 24 hours with a customized strategy outline.',
    'modal.name': 'Full Name',
    'modal.namePlaceholder': 'e.g. Tanvir Ahmed',
    'modal.phone': 'WhatsApp Number (Active)',
    'modal.phonePlaceholder': 'e.g. 017XXXXXXXX',
    'modal.business': 'Business Name / Type',
    'modal.businessPlaceholder': 'e.g. Fashion Boutique, Skincare Online',
    'modal.budget': 'Monthly Ad Budget Plan',
    'modal.notes': 'Specific Requirements / Goals (Optional)',
    'modal.notesPlaceholder': 'Tell us about your current campaigns, challenges, or targets...',
    'modal.submit': 'Submit Audit Request',
    'modal.submitting': 'Submitting...',
    'modal.success.title': 'Thank You! Your Request Has Been Received',
    'modal.success.desc': 'Sonjoy will review your business information and reach out on WhatsApp shortly with tailored insights.',
    'modal.close': 'Close',

    // AI Chat Widget
    'chat.title': 'ST Studio AI Assistant',
    'chat.subtitle': 'Ask anything about TikTok & Facebook ads',
    'chat.greeting': 'Hello! I am Sonjoy Sarkar’s official AI assistant. How can I assist you with TikTok or Facebook ad campaigns today?',
    'chat.placeholder': 'Type your question here...',
    'chat.chip1': 'Why TikTok Ads in Bangladesh?',
    'chat.chip2': 'What is included in the service?',
    'chat.chip3': 'How does the Ads Calculator work?',
    'chat.disclaimer': 'Grounded in our published knowledge base & verified case studies.',

    // Footer
    'footer.about': 'About ST Web & Ads Studio',
    'footer.bio': 'Led by Sonjoy Sarkar, providing data-backed, tracking-focused performance advertising for high-growth e-commerce, lifestyle, and local businesses in Bangladesh.',
    'footer.quickLinks': 'Quick Navigation',
    'footer.contact': 'Direct Contact',
    'footer.ctaTitle': 'Ready to Scale Your Ads Efficiently?',
    'footer.ctaDesc': 'Let’s audit your tracking, creatives, and ad strategy.',
    'footer.ctaBtn': 'Book Free Strategy Call',
    'footer.disclaimer': 'Disclaimer: This site is not affiliated with, endorsed by, or sponsored by TikTok (ByteDance Ltd.) or Meta Platforms, Inc. All case studies are based on historical campaign data and do not guarantee future earnings.',
    'footer.copyright': 'All rights reserved. Designed for Sonjoy Sarkar.',
    'footer.adminLink': 'Admin Portal',

    // Admin Login Screen
    'admin.login.title': 'Admin Studio Login',
    'admin.login.sub': 'Sonjoy Sarkar - TikTok & Facebook Ads Specialist',
    'admin.login.label': 'Admin Security Passcode',
    'admin.login.placeholder': 'Enter admin passcode (e.g. stweb2025)',
    'admin.login.btn': 'Access Admin Studio',
    'admin.login.back': '← Back to Website',
    'admin.login.hint': 'Default access passcode: stweb2025 (or admin123 / sonjoy)'
  },
  bn: {
    // Navigation
    'nav.home': 'হোম',
    'nav.services': 'বিজ্ঞাপন সেবা',
    'nav.tiktok': 'টিকটক গাইড',
    'nav.audience': 'কাদের জন্য',
    'nav.process': 'কাজের ধাপ',
    'nav.calculator': 'অ্যাড ক্যালকুলেটর',
    'nav.caseStudies': 'কেস স্টাডিজ',
    'nav.faq': 'সাধারণ প্রশ্ন',
    'nav.admin': 'অ্যাডমিন',
    'nav.getQuote': 'ফ্রি অডিট বুক করুন',
    'nav.whatsapp': 'WhatsApp-এ কথা বলুন',

    // Hero
    'hero.badge': 'পারফরম্যান্স মার্কেটিং স্পেশালিস্ট (TikTok & Facebook Ads)',
    'hero.verifiedPractitioner': 'ভেরিফাইড প্র্যাকটিশনার',
    'hero.headline': 'পরিকল্পিত, ট্র্যাকিং-নির্ভর ও অপ্টিমাইজড বিজ্ঞাপনে ব্যবসার পরিমাপযোগ্য প্রবৃদ্ধি।',
    'hero.subheadline': 'আমরা কোনো অবাস্তব গ্যারান্টি বা অবাস্তব সেলস প্রতিশ্রুতি দিই না। সঠিক ট্র্যাকিং, ক্রিয়েটিভ টেস্টিং এবং ডেটা-চালিত অপ্টিমাইজেশনের মাধ্যমে আপনার প্রতিটি বিজ্ঞাপনী বাজেটের সর্বোচ্চ কার্যকারিতা নিশ্চিত করতে কাজ করি।',
    'hero.cta.primary': 'Lead Form পূরণ করুন',
    'hero.cta.secondary': 'Ads Prediction দেখুন',
    'hero.cta.whatsapp': 'WhatsApp এ কথা বলুন',
    'hero.pillar.tracking.title': 'ট্র্যাকিং নির্ভুলতা',
    'hero.pillar.tracking.desc': 'পিক্সেল ও সার্ভার ইভেন্ট প্রিসিশন',
    'hero.pillar.creative.title': 'ক্রিয়েটিভ অ্যাঙ্গেল',
    'hero.pillar.creative.desc': 'UGC ও স্মার্টফোন ভিডিও হুক টেস্টিং',
    'hero.pillar.optimization.title': 'অপটিমাইজেশন',
    'hero.pillar.optimization.desc': 'ডেটা-চালিত CBO স্কেলিং ফ্রেমওয়ার্ক',
    'hero.profile.focus': 'স্পেশালিস্ট ফোকাস:',
    'hero.profile.bio': 'ডিজিটাল মার্কেটিং এক্সিকিউটিভ ও পারফরম্যান্স অ্যাড স্পেশালিস্ট। বাংলাদেশে ই-কমার্স, ফ্যাশন, কসমেটিক্স এবং লোকাল বিজনেসগুলোর জন্য টিকটক ও ফেসবুক বিজ্ঞাপনে প্রিসিশন পিক্সেল ট্র্যাকিং, ক্রিয়েটিভ স্ট্র্যাটেজি এবং আরওআই-ফোকাসড ক্যাম্পেইন ম্যানেজমেন্টে অভিজ্ঞ।',
    'hero.stats.header': 'TikTok Ads Manager কনসোলিডেটেড ডেটা',
    'hero.stats.tag': 'ঐতিহাসিক অডিট',
    'hero.stats.groups': 'অডিটকৃত অ্যাড গ্রুপ',
    'hero.stats.impressions': 'মোট ইমপ্রেশন ম্যানেজড',
    'hero.stats.conversations': 'কাস্টমার কনভার্সেশন',
    'hero.stats.leads': 'কোয়ালিফাইড লিড',
    'hero.stats.note': '*অভ্যন্তরীণ অডিট রিপোর্ট। ১২৬টি অ্যাড গ্রুপের ঐতিহাসিক ডেটা, কোনো সাধারণ ভবিষ্যৎ দাবি নয়।',
    'hero.platforms.primary': 'প্রধান',
    'hero.platforms.secondary': 'সেকেন্ডারি',
    'hero.platforms.market': 'মার্কেট: বাংলাদেশ',

    // Services
    'services.badge': 'মূল সেবাসমূহ',
    'services.title': 'পরিকল্পিত ও ট্র্যাকিং-নির্ভর বিজ্ঞাপন সেবা',
    'services.subtitle': 'আমরা অপ্রয়োজনীয় জটিল সেবা না দেখিয়ে শুধুমাত্র সেই কার্যকরী ক্ষেত্রগুলোতে ফোকাস করি যা আপনার বিজ্ঞাপনী খরচকে বিক্রয়ে রূপান্তর করতে সহায়ক।',
    'services.tt.tag': 'প্রধান সেবা',
    'services.tt.sub': 'উচ্চ-প্রবৃদ্ধির ব্র্যান্ডের জন্য',
    'services.tt.title': 'TikTok Ads Management',
    'services.tt.desc': 'বাংলাদেশে দ্রুত বর্ধনশীল তরুণ ক্রেতাদের কাছে পৌঁছাতে শর্ট ভিডিও ও UGC-ফোকাসড ক্যাম্পেইন ম্যানেজমেন্ট। কম ইমপ্রেশন খরচে সর্বোচ্চ এঙ্গেজমেন্ট ও পারচেজ নিশ্চিত করার ডেটা-চালিত কাঠামো।',
    'services.tt.includes': 'ক্যাম্পেইনে কী কী অন্তর্ভুক্ত:',
    'services.tt.cta': 'TikTok Ads নিয়ে আলোচনা করুন',
    'services.fb.tag': 'সেকেন্ডারি সেবা',
    'services.fb.sub': 'প্রতিষ্ঠিত চ্যানেলের জন্য',
    'services.fb.title': 'Facebook Ads Management',
    'services.fb.desc': 'মেটা বিজনেস ম্যানেজারে কনভার্সন এপিআই (CAPI) ট্র্যাকিং, কাস্টম ও লুকেলাইক অডিয়েন্স ফানেলিং এবং মেসেজিং/ওয়েব সেলস ক্যাম্পেইন ম্যানেজমেন্ট।',
    'services.fb.includes': 'ক্যাম্পেইনে কী কী অন্তর্ভুক্ত:',
    'services.fb.cta': 'Facebook Ads নিয়ে আলোচনা করুন',

    // TikTok Education
    'tiktok.badge': 'প্ল্যাটফর্ম বিশ্লেষণ',
    'tiktok.title': 'বাংলাদেশে টিকটক বিজ্ঞাপনের বাস্তব সম্ভাবনা ও সঠিক বোঝাপড়া',
    'tiktok.subtitle': 'টিকটক নিয়ে সাধারণ কিছু ভ্রান্ত ধারণা এবং কেন বর্তমান ই-কমার্স মার্কেটে এটি একটি শক্তিশালী প্রবৃদ্ধি চ্যানেল।',
    'tiktok.p1.title': 'কম CPM ও ব্যাপক অর্গানিক রিচ',
    'tiktok.p1.desc': 'বাংলাদেশে ফেসবুকের তুলনায় টিকটকে প্রতি ১,০০০ ইমপ্রেশনের খরচ (CPM) এখনো তুলনামূলক অনেক কম। ফলে কম বাজেটে বড় অডিয়েন্সে পৌঁছানো সম্ভব।',
    'tiktok.p2.title': 'অ্যাক্টিভ ও ডিসিশন-মেকার অডিয়েন্স',
    'tiktok.p2.desc': 'টিকটক এখন শুধু কিশোরদের প্ল্যাটফর্ম নয়। বাংলাদেশে ১৮ থেকে ৩৫ বছর বয়সী বিশাল সক্রিয় অনলাইন ক্রেতা গোষ্ঠী প্রতিদিন টিকটকে সময় কাটায়।',
    'tiktok.p3.title': 'UGC ও নেটিভ ভিডিওর উচ্চ কনভার্সন',
    'tiktok.p3.desc': 'স্মার্টফোনে ধারণ করা বাস্তবমুখী আনবক্সিং বা রিভিউ ভিডিও (User Generated Content) ট্রেডিশনাল চকচকে টিভির বিজ্ঞাপনের চেয়ে ৩ গুণ বেশি বিশ্বাস তৈরি করে।',
    'tiktok.myths.title': 'জনপ্রিয় ৩টি ভুল ধারণা বনাম ডেটা-ভিত্তিক বাস্তবতা',
    'tiktok.myths.sub': 'আমাদের বাস্তব ক্যাম্পেইন অডিট ও ডেটা থেকে পাওয়া অভিজ্ঞতা',
    'tiktok.myth.label': 'ভুল ধারণা',
    'tiktok.fact.label': 'বাস্তবতা',
    'tiktok.m1.myth': 'টিকটকে শুধু সস্তা বা ফ্রি জিনিস বিক্রি হয়',
    'tiktok.m1.fact': 'বাস্তবে সঠিক ট্র্যাকিং ও হাই-কোয়ালিটি UGC ভিডিও দিয়ে ১,৫০০ থেকে ৮,০০০ টাকার ফ্যাশন, গ্যাজেট ও স্কিনকেয়ার সফলভাবে বিক্রি হচ্ছে।',
    'tiktok.m2.myth': 'টিকটক বিজ্ঞাপনে কোনো পিক্সেল বা ট্র্যাকিং নেই',
    'tiktok.m2.fact': 'টিকটকের ফুল-ফিচার্ড Pixel এবং Events API রয়েছে যা দিয়ে AddToCart, InitiateCheckout ও Purchase নির্ভুলভাবে ট্র্যাক এবং অপটিমাইজ করা যায়।',
    'tiktok.m3.myth': 'প্রফেশনাল শুটিং ক্যামেরা ছাড়া ক্যাম্পেইন চলে না',
    'tiktok.m3.fact': 'টিকটক অ্যালগরিদম প্রাকৃতিক ও আনফিল্টার্ড স্মার্টফোন ভিডিওকে বেশি পুশ করে। দামি ক্যামেরা নয়, বরং প্রথম ৩ সেকেন্ডের হুক সবচেয়ে জরুরি।',

    // Audience & Process
    'audience.badge': 'টার্গেট বিজনেস',
    'audience.title': 'কাদের জন্য এই সেবা সবচেয়ে কার্যকর?',
    'audience.subtitle': 'আমরা কোনো একক ফর্মুলা সবার ওপর চাপাই না। ব্যবসার ক্যাটাগরি ও অফারের ওপর নির্ভর করে কাস্টমাইজড স্ট্র্যাটেজি তৈরি করি।',
    'process.badge': '৪-ধাপের কার্যপ্রণালী',
    'process.title': 'কীভাবে কাজ পরিচালিত হয়?',
    'process.subtitle': 'অনুমান বা ভাগ্যের ওপর ভরসা না করে একটি সুশৃঙ্খল ৪-ধাপের বৈজ্ঞানিক পদ্ধতিতে প্রতিটি ক্যাম্পেইন পরিচালিত হয়।',
    'process.s1.num': '০১',
    'process.s1.title': 'বিজনেস ও অফার অ্যানালাইসিস',
    'process.s1.desc': 'আপনার প্রোডাক্টের প্রাইসিং, মার্জিন, টার্গেট অডিয়েন্স এবং বর্তমান ল্যান্ডিং পেজ বা মেসেজিং ফ্লো পুঙ্খানুপুঙ্খ অডিট করা।',
    'process.s2.num': '০২',
    'process.s2.title': 'ট্র্যাকিং ও পিক্সেল ইন্টিগ্রেশন',
    'process.s2.desc': 'টিকটক পিক্সেল ও ফেসবুক কনভার্সন এপিআই (CAPI) নিখুঁতভাবে সেটআপ করা যাতে প্রতিটি ইভেন্ট নির্ভুল রেকর্ড হয়।',
    'process.s3.num': '০৩',
    'process.s3.title': 'ক্রিয়েটিভ টেস্টিং ও লঞ্চ',
    'process.s3.desc': '৩-৫টি ভিন্ন ক্রিয়েটিভ অ্যাঙ্গেল (UGC, ডেমো, অফার) এবং ব্রড ও ইন্টারেস্ট অডিয়েন্সে ক্যাম্পেইন লাইভ করা।',
    'process.s4.num': '০৪',
    'process.s4.title': 'ডেটা-নির্ভর অপ্টিমাইজেশন',
    'process.s4.desc': 'সাপ্তাহিক সিপিএ (CPA), সিটিআর (CTR) এবং আরওআই (ROAS) বিশ্লেষণ করে উইনিং অ্যাডে বাজেট স্কেল করা এবং দুর্বল অ্যাড বন্ধ করা।',

    // Ads Calculator
    'calc.badge': 'ইন্টারেক্টিভ প্রেডিকশন টুল',
    'calc.title': 'TikTok ও Facebook Ads প্রেডিকশন ক্যালকুলেটর',
    'calc.subtitle': 'বাংলাদেশের ঐতিহাসিক অ্যাড বেঞ্চমার্কের ওপর ভিত্তি করে আপনার আনুমানিক রিচ, ইমপ্রেশন, ক্লিক, মেসেজ ও সম্ভাব্য আরওআই রেঞ্জ দেখুন।',
    'calc.platform': 'বিজ্ঞাপন প্ল্যাটফর্ম নির্বাচন',
    'calc.industry': 'প্রোডাক্ট ক্যাটাগরি / ইন্ডাস্ট্রি',
    'calc.objective': 'ক্যাম্পেইনের মূল উদ্দেশ্য',
    'calc.budget': 'মাসিক অ্যাড বাজেট',
    'calc.aov': 'গড় প্রোডাক্ট মূল্য (টাকা)',
    'calc.creative': 'ক্রিয়েটিভ প্রস্তুতি',
    'calc.objective.purchase': 'ই-কমার্স ওয়েবসাইট পারচেজ',
    'calc.objective.conversation': 'মেসেজিং ও ইনবক্স (WhatsApp/Messenger)',
    'calc.objective.leads': 'লিড ফর্ম ইনফরমেশন সংগ্রহ',
    'calc.creative.ugc': 'UGC / শর্ট ভিডিও প্রস্তুত (রিকমেন্ডেড)',
    'calc.creative.image': 'শুধুমাত্র ইমেজ বা ফটো',
    'calc.creative.mixed': 'মিক্সড (ফটো + ভিডিও)',
    'calc.results.title': 'সম্ভাব্য ক্যাম্পেইন প্রজেকশন',
    'calc.results.impressions': 'আনুমানিক ইমপ্রেশন',
    'calc.results.clicks': 'আনুমানিক ক্লিক',
    'calc.results.actions': 'আনুমানিক কনভার্সন',
    'calc.results.cpa': 'প্রতি রেজাল্টের আনুমানিক খরচ',
    'calc.results.roas': 'প্রত্যাশিত ROAS রেঞ্জ',
    'calc.results.revenue': 'প্রত্যাশিত গ্রস রেভিনিউ',
    'calc.unlock.title': 'বিস্তারিত স্ট্র্যাটেজি ব্রেকডাউন আনলক করুন',
    'calc.unlock.desc': 'আপনার যোগাযোগের তথ্য দিয়ে ফুল রিপোর্ট দেখুন এবং WhatsApp-এ ফ্রি স্ট্র্যাটেজি অডিট পরামর্শ গ্রহণ করুন।',
    'calc.unlock.name': 'আপনার নাম',
    'calc.unlock.phone': 'WhatsApp নম্বর',
    'calc.unlock.btn': 'সম্পূর্ণ রিপোর্ট আনলক করুন',
    'calc.disclaimer': '*এই ক্যালকুলেটরটি ঐতিহাসিক ডেটার ওপর ভিত্তি করে একটি আনুমানিক প্রজেকশন প্রদান করে। প্রোডাক্টের অফার ও ক্রিয়েটিভ কোয়ালিটির ওপর ভিত্তি করে বাস্তব ফলাফল ভিন্ন হতে পারে।',

    // Case Studies
    'cs.badge': 'বাস্তব প্রমাণ ও ট্র্যাক রেকর্ড',
    'cs.title': 'বাস্তব ক্যাম্পেইন কেস স্টাডিজ ও অডিট রিপোর্ট',
    'cs.subtitle': 'কোনো অতিরঞ্জিত দাবি ছাড়া বাস্তব ডেটা ও স্ক্রিনশটসহ স্বচ্ছ পারফরম্যান্স রিপোর্ট।',
    'cs.filter.all': 'সবগুলো',
    'cs.filter.tiktok': 'টিকটক অ্যাডস',
    'cs.filter.facebook': 'ফেসবুক অ্যাডস',
    'cs.verifiedTag': 'ভেরিফাইড ক্যাম্পেইন রিপোর্ট',
    'cs.spend': 'অ্যাড খরচ (টাকা)',
    'cs.impressions': 'ইমপ্রেশন',
    'cs.clicks': 'ক্লিক',
    'cs.leads': 'লিড / মেসেজ',
    'cs.roas': 'ROAS',
    'cs.viewProof': 'প্রুফ / অ্যানালিটিক্স দেখুন',
    'cs.cta': 'অনুরূপ স্ট্র্যাটেজি অডিট বুক করুন',

    // FAQ
    'faq.badge': 'সাধারণ প্রশ্নোত্তর',
    'faq.title': 'সচরাচর জিজ্ঞাসিত প্রশ্নাবলি',
    'faq.subtitle': 'আমাদের বিজ্ঞাপন পরিচালনা সেবা, চার্জ, ট্র্যাকিং ও কাজের ধরন সম্পর্কে স্পষ্ট উত্তর।',
    'faq.search': 'প্রশ্ন খুঁজুন...',
    'faq.stillQuestions': 'নির্দিষ্ট কোনো প্রশ্ন আছে?',
    'faq.askAi': 'আমাদের AI অ্যাসিস্ট্যান্টকে জিজ্ঞেস করুন',
    'faq.orWhatsapp': 'অথবা সরাসরি WhatsApp-এ কথা বলুন',

    // Lead Form Modal
    'modal.title': 'ফ্রি অ্যাড স্ট্র্যাটেজি অডিট বুক করুন',
    'modal.subtitle': 'আপনার ব্যবসার প্রাথমিক তথ্য পূরণ করুন। আমরা আপনার নিশ ও প্রোডাক্ট যাচাই করে ২৪ ঘণ্টার মধ্যে একটি কাস্টমাইজড প্ল্যান পাঠাব।',
    'modal.name': 'আপনার পুরো নাম',
    'modal.namePlaceholder': 'যেমন: তানভীর আহমেদ',
    'modal.phone': 'সক্রিয় WhatsApp নম্বর',
    'modal.phonePlaceholder': 'যেমন: 017XXXXXXXX',
    'modal.business': 'ব্যবসার নাম বা ক্যাটাগরি',
    'modal.businessPlaceholder': 'যেমন: ফ্যাশন বুটিক, স্কিনকেয়ার শপ',
    'modal.budget': 'পরিকল্পিত মাসিক অ্যাড বাজেট',
    'modal.notes': 'নির্দিষ্ট কোনো লক্ষ্য বা মন্তব্য (ঐচ্ছিক)',
    'modal.notesPlaceholder': 'আপনার বর্তমান ক্যাম্পেইন, চ্যালেঞ্জ বা লক্ষ্য সম্পর্কে লিখুন...',
    'modal.submit': 'অডিট রিকোয়েস্ট জমা দিন',
    'modal.submitting': 'জমা হচ্ছে...',
    'modal.success.title': 'ধন্যবাদ! আপনার রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে',
    'modal.success.desc': 'সঞ্জয় সরকার আপনার তথ্য দেখে দ্রুত WhatsApp-এ যোগাযোগ করবেন।',
    'modal.close': 'বন্ধ করুন',

    // AI Chat Widget
    'chat.title': 'ST Studio AI অ্যাসিস্ট্যান্ট',
    'chat.subtitle': 'টিকটক ও ফেসবুক বিজ্ঞাপন সম্পর্কে যেকোনো প্রশ্ন করুন',
    'chat.greeting': 'হ্যালো! আমি সঞ্জয় সরকারের অফিশিয়াল AI অ্যাসিস্ট্যান্ট। আজ আপনার ব্যবসার টিকটক বা ফেসবুক অ্যাড ক্যাম্পেইন নিয়ে কীভাবে সাহায্য করতে পারি?',
    'chat.placeholder': 'আপনার প্রশ্নটি এখানে লিখুন...',
    'chat.chip1': 'বাংলাদেশে টিকটক অ্যাড কেন কার্যকর?',
    'chat.chip2': 'বিজ্ঞাপন সেবায় কী কী অন্তর্ভুক্ত রয়েছে?',
    'chat.chip3': 'অ্যাড ক্যালকুলেটর কীভাবে কাজ করে?',
    'chat.disclaimer': 'আমাদের অনুমোদিত নলেজ বেস ও কেস স্টাডিজের ভিত্তিতে উত্তর প্রদান করা হয়।',

    // Footer
    'footer.about': 'ST Web & Ads Studio সম্পর্কে',
    'footer.bio': 'সঞ্জয় সরকারের পরিচালনায় বাংলাদেশে ই-কমার্স, ফ্যাশন ও লোকাল বিজনেসের জন্য ট্র্যাকিং-নির্ভর ও আরওআই-ফোকাসড পারফরম্যান্স মার্কেটিং এজেন্সি।',
    'footer.quickLinks': 'নেভিগেশন',
    'footer.contact': 'সরাসরি যোগাযোগ',
    'footer.ctaTitle': 'আপনার ব্যবসার বিজ্ঞাপনী খরচকে বিক্রয়ে রূপান্তর করতে প্রস্তুত?',
    'footer.ctaDesc': 'আসুন আপনার ট্র্যাকিং, ক্রিয়েটিভ এবং অ্যাড ফানেল নিয়ে আলোচনা করি।',
    'footer.ctaBtn': 'ফ্রি স্ট্র্যাটেজি কল বুক করুন',
    'footer.disclaimer': 'দাবিত্যাগ: এই ওয়েবসাইটটি কোনোভাবেই টিকটক (বাইটড্যান্স লিমিটেড) বা মেটা প্ল্যাটফর্মস ইনকর্পোরেটেডের সাথে অধিভুক্ত বা অনুমোদিত নয়। প্রদর্শিত কেস স্টাডিগুলো ঐতিহাসিক ক্যাম্পেইন ডেটার ওপর ভিত্তি করে তৈরি এবং কোনো ভবিষ্যৎ নিশ্চিত আয়ের গ্যারান্টি নয়।',
    'footer.copyright': 'সর্বস্বত্ব সংরক্ষিত। Sonjoy Sarkar-এর জন্য তৈরিকৃত।',
    'footer.adminLink': 'অ্যাডমিন স্টুডিও',

    // Admin Login Screen
    'admin.login.title': 'অ্যাডমিন স্টুডিও লগইন',
    'admin.login.sub': 'সঞ্জয় সরকার - পারফরম্যান্স অ্যাড স্পেশালিস্ট',
    'admin.login.label': 'অ্যাডমিন সিকিউরিটি পাসকোড',
    'admin.login.placeholder': 'অ্যাডমিন পাসকোড লিখুন (যেমন: stweb2025)',
    'admin.login.btn': 'অ্যাডমিন প্যানেলে প্রবেশ করুন',
    'admin.login.back': '← ওয়েবসাইটে ফিরে যান',
    'admin.login.hint': 'ডিফল্ট অ্যাক্সেস পাসকোড: stweb2025 (অথবা admin123 / sonjoy)'
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default to English ('en') as requested by the user
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('st_app_language');
      if (saved === 'bn' || saved === 'en') {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language from storage', e);
    }
    return 'en'; // English by default
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('st_app_language', lang);
    } catch (e) {
      console.warn('Could not save language to storage', e);
    }
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string): string => {
    const currentDict = translations[language] || translations.en;
    if (currentDict[key as keyof typeof currentDict]) {
      return currentDict[key as keyof typeof currentDict];
    }
    // Fallback to English
    return translations.en[key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
