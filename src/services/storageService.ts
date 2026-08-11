import { 
  Lead, 
  LeadStatus, 
  LeadActivity,
  LeadSubmission,
  CaseStudy, 
  District, 
  CalculatorBenchmark, 
  RecommendationRule, 
  CalculatorInput, 
  CalculatorOutput, 
  PlatformPrediction,
  KnowledgeBaseItem, 
  KnowledgeGap, 
  AIConversation, 
  AISettings, 
  AnalyticsEvent, 
  VisitorJourney, 
  SiteSettings, 
  SocialLink, 
  UserProfile, 
  AuditLogEntry, 
  MediaItem,
  FAQItem,
  ProductPriceRange,
  AdminUser
} from '../types';

import {
  initialSiteSettings,
  initialSocialLinks,
  initialCaseStudies,
  initialDistricts,
  initialBenchmarks,
  initialRecommendationRules,
  initialKnowledgeBase,
  initialMedia,
  initialUsers,
  initialProductPriceRanges,
  initialAdminUsers
} from '../data/initialData';

import { db, doc, setDoc } from './firebase';

const syncLeadToFirestore = async (lead: Lead) => {
  try {
    if (db) {
      await setDoc(doc(db, 'leads', lead.id), {
        id: lead.id,
        name: lead.name,
        phone: lead.whatsapp,
        businessType: lead.businessType || 'General Business',
        monthlyBudget: lead.monthlyBudget || '',
        status: lead.status,
        notes: lead.notes || '',
        createdAt: lead.createdAt,
        calculatorSummary: lead.calculatorSummary || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }
  } catch (err) {
    // Non-blocking background sync
    console.debug('Firestore background lead sync notice:', err);
  }
};

const STORAGE_KEYS = {
  SITE_SETTINGS: 'st_site_settings_v1',
  SOCIAL_LINKS: 'st_social_links_v1',
  CASE_STUDIES: 'st_case_studies_v1',
  DISTRICTS: 'st_districts_v1',
  BENCHMARKS: 'st_benchmarks_v1',
  RECOMMENDATIONS: 'st_recommendations_v1',
  PRODUCT_PRICE_RANGES: 'st_product_price_ranges_v1',
  LEADS: 'st_leads_v1',
  KNOWLEDGE_BASE: 'st_knowledge_base_v1',
  KNOWLEDGE_Gaps: 'st_knowledge_gaps_v1',
  AI_CONVERSATIONS: 'st_ai_conversations_v1',
  AI_SETTINGS: 'st_ai_settings_v1',
  ANALYTICS_EVENTS: 'st_analytics_events_v1',
  VISITOR_JOURNEYS: 'st_visitor_journeys_v1',
  MEDIA: 'st_media_v1',
  USERS: 'st_users_v1',
  ADMIN_USERS: 'st_admin_users_v1',
  CURRENT_USER: 'st_current_user_v1',
  AUDIT_LOGS: 'st_audit_logs_v1',
  VISITOR_ID: 'st_visitor_id_v1',
  LAST_LEAD_INFO: 'st_last_lead_info_v1'
};

class StorageService {
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.initDefaults();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(key);
      if (!data) return fallback;
      return JSON.parse(data);
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (err) {
      console.warn('Storage write failed', err);
    }
  }

  private initDefaults() {
    if (!localStorage.getItem(STORAGE_KEYS.SITE_SETTINGS)) {
      this.setItem(STORAGE_KEYS.SITE_SETTINGS, initialSiteSettings);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SOCIAL_LINKS)) {
      this.setItem(STORAGE_KEYS.SOCIAL_LINKS, initialSocialLinks);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CASE_STUDIES)) {
      this.setItem(STORAGE_KEYS.CASE_STUDIES, initialCaseStudies);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DISTRICTS)) {
      this.setItem(STORAGE_KEYS.DISTRICTS, initialDistricts);
    }
    if (!localStorage.getItem(STORAGE_KEYS.BENCHMARKS)) {
      this.setItem(STORAGE_KEYS.BENCHMARKS, initialBenchmarks);
    }
    if (!localStorage.getItem(STORAGE_KEYS.RECOMMENDATIONS)) {
      this.setItem(STORAGE_KEYS.RECOMMENDATIONS, initialRecommendationRules);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRODUCT_PRICE_RANGES)) {
      this.setItem(STORAGE_KEYS.PRODUCT_PRICE_RANGES, initialProductPriceRanges);
    }
    if (!localStorage.getItem(STORAGE_KEYS.KNOWLEDGE_BASE)) {
      this.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, initialKnowledgeBase);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDIA)) {
      this.setItem(STORAGE_KEYS.MEDIA, initialMedia);
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.setItem(STORAGE_KEYS.USERS, initialUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ADMIN_USERS)) {
      this.setItem(STORAGE_KEYS.ADMIN_USERS, initialAdminUsers);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      this.setItem(STORAGE_KEYS.CURRENT_USER, initialAdminUsers[0]); // Default admin
    }
    if (!localStorage.getItem(STORAGE_KEYS.AI_SETTINGS)) {
      const defaultAiSettings: AISettings = {
        enabled: true,
        provider: 'Gemini',
        primaryModel: 'gemini-3.6-flash',
        backupModel: 'gemini-3.6-flash',
        temperature: 0.2,
        maxOutputTokens: 800,
        systemInstruction: `You are the official AI assistant for Sonjoy Sarkar and ST Web & Ads Studio.
Your sole purpose is to answer questions strictly grounded in the published Knowledge Base and approved Case Studies.
Do NOT invent claims, client names, ROAS guarantees, or pricing.
If information is not present in the Knowledge Base, respond politely: "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে।"
Always encourage the user with helpful next steps: Lead Form, Ads Prediction Calculator, or WhatsApp.`,
        knowledgeRetrievalStrictness: 'STRICT_KB_ONLY',
        ctaStrategy: 'CONTEXTUAL'
      };
      this.setItem(STORAGE_KEYS.AI_SETTINGS, defaultAiSettings);
    }
  }

  // --- Visitor Management ---
  public getVisitorId(): string {
    let vid = localStorage.getItem(STORAGE_KEYS.VISITOR_ID);
    if (!vid) {
      vid = 'v-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
      localStorage.setItem(STORAGE_KEYS.VISITOR_ID, vid);
    }
    return vid;
  }

  public getSavedLeadInfo(): { name?: string; whatsapp?: string; socialLink?: string; location?: string } | null {
    return this.getItem(STORAGE_KEYS.LAST_LEAD_INFO, null);
  }

  public setSavedLeadInfo(info: { name: string; whatsapp: string; socialLink?: string; location: string }): void {
    this.setItem(STORAGE_KEYS.LAST_LEAD_INFO, info);
  }

  // --- Site Settings ---
  public getSiteSettings(): SiteSettings {
    const saved = this.getItem<SiteSettings>(STORAGE_KEYS.SITE_SETTINGS, initialSiteSettings);
    return {
      ...initialSiteSettings,
      ...(saved || {}),
      whatsapp: {
        ...initialSiteSettings.whatsapp,
        ...(saved?.whatsapp || {}),
        number: saved?.whatsapp?.number || saved?.whatsappNumber || initialSiteSettings.whatsapp.number || '+8801815124970',
        defaultMessage: saved?.whatsapp?.defaultMessage || initialSiteSettings.whatsapp.defaultMessage || 'Hello Sonjoy, I would like to schedule a strategy session for TikTok & Facebook Ads campaigns.'
      },
      seo: {
        ...initialSiteSettings.seo,
        ...(saved?.seo || {})
      },
      gtm: {
        ...initialSiteSettings.gtm,
        ...(saved?.gtm || {}),
        enabled: saved?.gtm?.enabled ?? initialSiteSettings.gtm.enabled ?? false,
        containerId: saved?.gtm?.containerId || initialSiteSettings.gtm.containerId || 'GTM-XXXXXXX',
        tiktokPixelId: saved?.gtm?.tiktokPixelId || '',
        metaPixelId: saved?.gtm?.metaPixelId || '',
        googleAnalyticsId: saved?.gtm?.googleAnalyticsId || '',
        customHeadScript: saved?.gtm?.customHeadScript || '',
        customBodyScript: saved?.gtm?.customBodyScript || ''
      },
      sectionVisibility: {
        ...initialSiteSettings.sectionVisibility,
        ...(saved?.sectionVisibility || {})
      }
    };
  }

  public updateSiteSettings(settings: Partial<SiteSettings>): void {
    const current = this.getSiteSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.SITE_SETTINGS, updated);
    this.logAudit('EDIT_SETTINGS', 'SiteSettings', 'Updated global site settings');
  }

  // --- Social Links ---
  public getSocialLinks(): SocialLink[] {
    return this.getItem<SocialLink[]>(STORAGE_KEYS.SOCIAL_LINKS, initialSocialLinks)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }

  public saveSocialLink(link: SocialLink): void {
    const links = this.getSocialLinks();
    const idx = links.findIndex(l => l.id === link.id);
    if (idx >= 0) {
      links[idx] = link;
    } else {
      links.push(link);
    }
    this.setItem(STORAGE_KEYS.SOCIAL_LINKS, links);
    this.logAudit('SAVE_SOCIAL_LINK', 'SocialLink', `Saved ${link.platform}`);
  }

  public deleteSocialLink(id: string): void {
    const links = this.getSocialLinks().filter(l => l.id !== id);
    this.setItem(STORAGE_KEYS.SOCIAL_LINKS, links);
    this.logAudit('DELETE_SOCIAL_LINK', 'SocialLink', `Deleted link ${id}`);
  }

  // --- Case Studies ---
  public getCaseStudies(includeDrafts: boolean = false): CaseStudy[] {
    const all = this.getItem<CaseStudy[]>(STORAGE_KEYS.CASE_STUDIES, initialCaseStudies);
    // Normalize and ensure bilingual fields exist
    const normalized = all.map(c => {
      const initialMatch = initialCaseStudies.find(ic => ic.id === c.id);
      return {
        ...c,
        titleEn: c.titleEn || initialMatch?.titleEn || c.title,
        titleBn: c.titleBn || initialMatch?.titleBn || c.title,
        resultSummaryEn: c.resultSummaryEn || initialMatch?.resultSummaryEn || c.resultSummary,
        resultSummaryBn: c.resultSummaryBn || initialMatch?.resultSummaryBn || c.resultSummary,
        textDescriptionEn: c.textDescriptionEn || initialMatch?.textDescriptionEn || c.textDescription,
        textDescriptionBn: c.textDescriptionBn || initialMatch?.textDescriptionBn || c.textDescription,
        industryEn: c.industryEn || initialMatch?.industryEn || c.industry,
        industryBn: c.industryBn || initialMatch?.industryBn || c.industry,
        notesEn: c.notesEn || initialMatch?.notesEn || c.notes,
        notesBn: c.notesBn || initialMatch?.notesBn || c.notes
      };
    });
    const sorted = normalized.sort((a, b) => a.sortOrder - b.sortOrder);
    if (includeDrafts) return sorted;
    return sorted.filter(c => c.isPublished);
  }

  public saveCaseStudy(caseStudy: CaseStudy): void {
    const items = this.getItem<CaseStudy[]>(STORAGE_KEYS.CASE_STUDIES, initialCaseStudies);
    const idx = items.findIndex(c => c.id === caseStudy.id);
    const updated = { ...caseStudy, updatedAt: new Date().toISOString() };
    if (idx >= 0) {
      items[idx] = updated;
    } else {
      items.unshift(updated);
    }
    this.setItem(STORAGE_KEYS.CASE_STUDIES, items);
    this.logAudit('SAVE_CASE_STUDY', 'CaseStudy', `Saved case study: ${caseStudy.title}`);
  }

  public deleteCaseStudy(id: string): void {
    const items = this.getItem<CaseStudy[]>(STORAGE_KEYS.CASE_STUDIES, initialCaseStudies).filter(c => c.id !== id);
    this.setItem(STORAGE_KEYS.CASE_STUDIES, items);
    this.logAudit('DELETE_CASE_STUDY', 'CaseStudy', `Deleted case study ${id}`);
  }

  // --- Districts & Locations ---
  public getDistricts(includeDisabled: boolean = false): District[] {
    const all = this.getItem<District[]>(STORAGE_KEYS.DISTRICTS, initialDistricts);
    if (includeDisabled) return all;
    return all.filter(d => d.enabled);
  }

  public saveDistrict(district: District): void {
    const items = this.getItem<District[]>(STORAGE_KEYS.DISTRICTS, initialDistricts);
    const idx = items.findIndex(d => d.id === district.id);
    if (idx >= 0) items[idx] = district;
    else items.push(district);
    this.setItem(STORAGE_KEYS.DISTRICTS, items);
    this.logAudit('SAVE_DISTRICT', 'District', `Saved district: ${district.name}`);
  }

  // --- Benchmarks & Calculation Engine ---
  public getBenchmarks(includeInactive: boolean = false): CalculatorBenchmark[] {
    const all = this.getItem<CalculatorBenchmark[]>(STORAGE_KEYS.BENCHMARKS, initialBenchmarks);
    if (includeInactive) return all;
    return all.filter(b => b.active);
  }

  public saveBenchmark(bm: CalculatorBenchmark): void {
    const items = this.getItem<CalculatorBenchmark[]>(STORAGE_KEYS.BENCHMARKS, initialBenchmarks);
    const idx = items.findIndex(b => b.id === bm.id);
    if (idx >= 0) items[idx] = bm;
    else items.unshift(bm);
    this.setItem(STORAGE_KEYS.BENCHMARKS, items);
    this.logAudit('SAVE_BENCHMARK', 'Benchmark', `Saved ${bm.platform} benchmark for ${bm.productCategory}`);
  }

  public deleteBenchmark(id: string): void {
    const items = this.getItem<CalculatorBenchmark[]>(STORAGE_KEYS.BENCHMARKS, initialBenchmarks).filter(b => b.id !== id);
    this.setItem(STORAGE_KEYS.BENCHMARKS, items);
    this.logAudit('DELETE_BENCHMARK', 'Benchmark', `Deleted benchmark ${id}`);
  }

  // --- Product Price Ranges ---
  public getProductPriceRanges(includeInactive: boolean = false): ProductPriceRange[] {
    const all = this.getItem<ProductPriceRange[]>(STORAGE_KEYS.PRODUCT_PRICE_RANGES, initialProductPriceRanges);
    const sorted = [...all].sort((a, b) => a.sortOrder - b.sortOrder);
    if (includeInactive) return sorted;
    return sorted.filter(r => r.active);
  }

  public saveProductPriceRange(range: ProductPriceRange): void {
    const items = this.getItem<ProductPriceRange[]>(STORAGE_KEYS.PRODUCT_PRICE_RANGES, initialProductPriceRanges);
    const idx = items.findIndex(r => r.id === range.id);
    if (idx >= 0) {
      items[idx] = range;
    } else {
      items.push(range);
    }
    this.setItem(STORAGE_KEYS.PRODUCT_PRICE_RANGES, items);
    this.logAudit('SAVE_PRICE_RANGE', 'ProductPriceRange', `Saved price tier: ${range.labelEn}`);
    this.notify();
  }

  public deleteProductPriceRange(id: string): void {
    const items = this.getItem<ProductPriceRange[]>(STORAGE_KEYS.PRODUCT_PRICE_RANGES, initialProductPriceRanges).filter(r => r.id !== id);
    this.setItem(STORAGE_KEYS.PRODUCT_PRICE_RANGES, items);
    this.logAudit('DELETE_PRICE_RANGE', 'ProductPriceRange', `Deleted price tier ${id}`);
    this.notify();
  }

  public resetProductPriceRanges(): void {
    this.setItem(STORAGE_KEYS.PRODUCT_PRICE_RANGES, initialProductPriceRanges);
    this.logAudit('RESET_PRICE_RANGES', 'ProductPriceRange', 'Reset price ranges to defaults');
    this.notify();
  }

  public getRecommendations(): RecommendationRule[] {
    return this.getItem<RecommendationRule[]>(STORAGE_KEYS.RECOMMENDATIONS, initialRecommendationRules)
      .sort((a, b) => a.priority - b.priority);
  }

  public saveRecommendation(rec: RecommendationRule): void {
    const items = this.getRecommendations();
    const idx = items.findIndex(r => r.id === rec.id);
    if (idx >= 0) items[idx] = rec;
    else items.push(rec);
    this.setItem(STORAGE_KEYS.RECOMMENDATIONS, items);
  }

  /**
   * Hierarchical Benchmark Selection Engine
   * Exact Match -> Category+Platform+Creative+Goal -> Category+Platform+Goal -> Platform+Goal -> Platform Default
   */
  private findBestBenchmark(platform: 'TikTok' | 'Facebook', input: CalculatorInput): { benchmark: CalculatorBenchmark; matchLevel: string } {
    const all = this.getBenchmarks(false).filter(b => b.platform === platform);
    
    // Level 1: Exact Match (Location + Category + Platform + Creative + Goal)
    let match = all.find(b => 
      b.productCategory.toLowerCase() === input.productCategory.toLowerCase() &&
      b.creativeType === input.creativeType &&
      b.conversionGoal === input.conversionGoal &&
      (b.location === input.location || b.location === 'All Bangladesh')
    );
    if (match) return { benchmark: match, matchLevel: 'Exact Benchmark Match' };

    // Level 2: Category + Platform + Creative + Goal
    match = all.find(b =>
      b.productCategory.toLowerCase() === input.productCategory.toLowerCase() &&
      b.creativeType === input.creativeType &&
      b.conversionGoal === input.conversionGoal
    );
    if (match) return { benchmark: match, matchLevel: 'Category + Creative Benchmark Match' };

    // Level 3: Platform + Category + Goal
    match = all.find(b =>
      b.productCategory.toLowerCase() === input.productCategory.toLowerCase() &&
      b.conversionGoal === input.conversionGoal
    );
    if (match) return { benchmark: match, matchLevel: 'Category + Goal Benchmark Match' };

    // Level 4: Platform + Goal
    match = all.find(b => b.conversionGoal === input.conversionGoal);
    if (match) return { benchmark: match, matchLevel: 'Goal-Level Platform Benchmark' };

    // Level 5: Platform Fallback
    const fallback = all[0] || initialBenchmarks[0];
    return { benchmark: fallback, matchLevel: 'Platform Default Baseline (Market Average)' };
  }

  public calculatePrediction(input: CalculatorInput): CalculatorOutput {
    const settings = this.getSiteSettings();
    const rate = settings.exchangeRateUsdToBdt || 150.0;
    const budgetBDT = Math.max(1, input.adBudgetUSD * rate);
    const inputPrice = input.productPriceBDT || 1200;

    // Find dynamic Product Price Range match
    const priceRanges = this.getProductPriceRanges(false);
    const matchedPriceTier = priceRanges.find(r => 
      inputPrice >= r.minPriceBDT && inputPrice <= r.maxPriceBDT
    ) || priceRanges.find(r => inputPrice <= r.maxPriceBDT) || priceRanges[priceRanges.length - 1] || {
      id: 'default-tier',
      labelEn: 'Standard Tier',
      labelBn: 'স্ট্যান্ডার্ড টায়ার',
      minPriceBDT: 0,
      maxPriceBDT: 999999,
      cvrMultiplier: 1.0,
      cpcMultiplier: 1.0,
      recommendedGoal: 'Purchase',
      averageTicketBDT: inputPrice,
      active: true,
      sortOrder: 1
    };

    const buildPlatformPrediction = (platform: 'TikTok' | 'Facebook'): PlatformPrediction => {
      const { benchmark, matchLevel } = this.findBestBenchmark(platform, input);
      
      // Creative multiplier
      let creativeMultiplier = 1.0;
      if (input.creativeType === 'UGC') creativeMultiplier = 1.25;
      else if (input.creativeType === 'Product Video') creativeMultiplier = 1.15;
      else if (input.creativeType === 'Image') creativeMultiplier = 0.85;

      // Location multiplier
      let locationMultiplier = 1.0;
      if (input.location === 'Dhaka' || input.location === 'Chattogram') locationMultiplier = 1.08;

      // Product price impact on CPM/CPC (higher-ticket items have slightly higher CPM due to competition)
      const priceCpcMultiplier = matchedPriceTier.cpcMultiplier || 1.0;
      const effectiveCpm = (benchmark.cpmBDT / creativeMultiplier) * locationMultiplier * priceCpcMultiplier;
      const totalImpressions = (budgetBDT / effectiveCpm) * 1000;
      
      const impMin = Math.max(50, Math.round(totalImpressions * 0.85));
      const impMax = Math.max(impMin + 50, Math.round(totalImpressions * 1.25));

      const reachMin = Math.max(40, Math.round(impMin * 0.75));
      const reachMax = Math.max(reachMin + 40, Math.round(impMax * 0.85));

      const effectiveCtr = (benchmark.ctrPercent * creativeMultiplier) / 100;
      const clicksMin = Math.max(2, Math.round(impMin * effectiveCtr));
      const clicksMax = Math.max(clicksMin + 2, Math.round(impMax * effectiveCtr));

      // Conversion Rate dynamically altered by product price tier
      const priceCvrMultiplier = matchedPriceTier.cvrMultiplier || 1.0;
      const effectiveCvr = Math.max(0.005, (benchmark.cvrPercent * priceCvrMultiplier) / 100);

      // Goal-specific result calculations
      let resultsMin = 1;
      let resultsMax = 2;
      let resultLabel = 'Est. Purchases';

      switch (input.conversionGoal) {
        case 'Purchase':
          resultLabel = 'Est. Purchases';
          resultsMin = Math.max(1, Math.round(clicksMin * effectiveCvr));
          resultsMax = Math.max(resultsMin + 1, Math.round(clicksMax * effectiveCvr));
          break;
        case 'Lead':
          resultLabel = 'Est. Qualified Leads';
          resultsMin = Math.max(1, Math.round(clicksMin * Math.max(0.04, effectiveCvr * 1.8)));
          resultsMax = Math.max(resultsMin + 1, Math.round(clicksMax * Math.max(0.05, effectiveCvr * 1.8)));
          break;
        case 'View Content':
          resultLabel = 'Est. Content Views';
          resultsMin = Math.max(10, Math.round(clicksMin * 0.85));
          resultsMax = Math.max(resultsMin + 10, Math.round(clicksMax * 0.95));
          break;
        case 'Messages':
          resultLabel = 'Est. Conversations';
          resultsMin = Math.max(1, Math.round(clicksMin * Math.max(0.05, effectiveCvr * 2.2)));
          resultsMax = Math.max(resultsMin + 1, Math.round(clicksMax * Math.max(0.06, effectiveCvr * 2.2)));
          break;
        case 'Link Clicks':
          resultLabel = 'Est. Link Clicks';
          resultsMin = clicksMin;
          resultsMax = clicksMax;
          break;
        case 'Video Views':
          resultLabel = 'Est. Video Views (ThruPlay)';
          resultsMin = Math.max(20, Math.round(impMin * 0.45));
          resultsMax = Math.max(resultsMin + 50, Math.round(impMax * 0.65));
          break;
        case 'App Installs':
          resultLabel = 'Est. App Installs';
          resultsMin = Math.max(1, Math.round(clicksMin * 0.12));
          resultsMax = Math.max(resultsMin + 1, Math.round(clicksMax * 0.18));
          break;
        case 'App Events':
          resultLabel = 'Est. In-App Events';
          resultsMin = Math.max(1, Math.round(clicksMin * 0.04));
          resultsMax = Math.max(resultsMin + 1, Math.round(clicksMax * 0.08));
          break;
        case 'Reach':
          resultLabel = 'Est. Unique People Reached';
          resultsMin = reachMin;
          resultsMax = reachMax;
          break;
        case 'Post Engagement':
          resultLabel = 'Est. Post Engagements';
          resultsMin = Math.max(15, Math.round(impMin * 0.08));
          resultsMax = Math.max(resultsMin + 20, Math.round(impMax * 0.14));
          break;
        case 'Follower Ads':
          resultLabel = 'Est. New Followers / Likes';
          resultsMin = Math.max(5, Math.round(clicksMin * 0.45));
          resultsMax = Math.max(resultsMin + 5, Math.round(clicksMax * 0.65));
          break;
        case 'Calls':
          resultLabel = 'Est. Direct Phone Calls';
          resultsMin = Math.max(1, Math.round(clicksMin * 0.035));
          resultsMax = Math.max(resultsMin + 1, Math.round(clicksMax * 0.06));
          break;
        case 'Traffic':
          resultLabel = 'Est. Landing Page Visits';
          resultsMin = Math.max(5, Math.round(clicksMin * 0.88));
          resultsMax = Math.max(resultsMin + 5, Math.round(clicksMax * 0.96));
          break;
        default:
          resultLabel = 'Est. Results';
          resultsMin = Math.max(1, Math.round(clicksMin * effectiveCvr));
          resultsMax = Math.max(resultsMin + 1, Math.round(clicksMax * effectiveCvr));
      }

      const costPerResultMin = Math.max(1, Math.round(budgetBDT / (resultsMax || 1)));
      const costPerResultMax = Math.max(costPerResultMin, Math.round(budgetBDT / (resultsMin || 1)));

      // Sales value calculation: strictly dynamic with selected product price
      const salesMin = Math.round(resultsMin * inputPrice);
      const salesMax = Math.round(resultsMax * inputPrice);

      let roasMin = Number((salesMin / budgetBDT).toFixed(1));
      let roasMax = Number((salesMax / budgetBDT).toFixed(1));
      if (roasMin < 0.2) roasMin = 0.2;
      if (roasMax > 12.0) roasMax = 12.0;

      let confidence: 'HIGH' | 'MEDIUM' | 'LOW' = benchmark.confidence;
      let confidenceReason = `Model: ${matchLevel} calibrated for price tier [${matchedPriceTier.labelEn}]. Location: ${input.location}, Category: ${input.productCategory}, Creative: ${input.creativeType}, Goal: ${input.conversionGoal}.`;

      if (input.adBudgetUSD < 5) {
        confidence = 'MEDIUM';
        confidenceReason += ' (Micro-budget calibration mode: high accuracy for initial testing).';
      }

      return {
        platform,
        estimatedReach: { min: reachMin, max: reachMax, formatted: `${reachMin.toLocaleString('en-IN')} - ${reachMax.toLocaleString('en-IN')}` },
        estimatedImpressions: { min: impMin, max: impMax, formatted: `${impMin.toLocaleString('en-IN')} - ${impMax.toLocaleString('en-IN')}` },
        estimatedClicks: { min: clicksMin, max: clicksMax, formatted: `${clicksMin.toLocaleString('en-IN')} - ${clicksMax.toLocaleString('en-IN')}` },
        estimatedResults: { min: resultsMin, max: resultsMax, formatted: `${resultsMin.toLocaleString('en-IN')} - ${resultsMax.toLocaleString('en-IN')}` },
        resultLabel,
        estimatedCostPerResult: { min: costPerResultMin, max: costPerResultMax, formatted: `৳${costPerResultMin.toLocaleString('en-IN')} - ৳${costPerResultMax.toLocaleString('en-IN')}` },
        estimatedSalesValueBDT: { min: salesMin, max: salesMax, formatted: `৳${salesMin.toLocaleString('en-IN')} - ৳${salesMax.toLocaleString('en-IN')}` },
        estimatedRoas: { min: roasMin, max: roasMax, formatted: `${roasMin}x - ${roasMax}x` },
        confidence,
        confidenceReason,
        benchmarkUsed: `${matchLevel} (${matchedPriceTier.labelEn})`
      };
    };

    let tiktokPred: PlatformPrediction | undefined;
    let fbPred: PlatformPrediction | undefined;
    let comparisonVerdict: string | undefined;

    if (input.platform === 'TikTok' || input.platform === 'Compare TikTok vs Facebook') {
      tiktokPred = buildPlatformPrediction('TikTok');
    }
    if (input.platform === 'Facebook' || input.platform === 'Compare TikTok vs Facebook') {
      fbPred = buildPlatformPrediction('Facebook');
    }

    if (tiktokPred && fbPred) {
      if (input.creativeType === 'UGC' || input.creativeType === 'Product Video') {
        comparisonVerdict = `Based on creative format (${input.creativeType}) and price point (৳${inputPrice.toLocaleString('en-IN')}), TikTok delivers superior impression volume and lower top-funnel acquisition costs. Facebook remains optimal for retargeting and high basket cart recovery.`;
      } else {
        comparisonVerdict = `For static image assets, Facebook provides higher response stability. We strongly recommend testing short-form UGC video hooks on TikTok for maximum ROAS.`;
      }
    }

    // Filter relevant recommendations
    const allRecs = this.getRecommendations().filter(r => r.active);
    const matchedRecs = allRecs.filter(r => {
      if (r.creativeType && r.creativeType !== input.creativeType) return false;
      if (r.minBudgetUSD && input.adBudgetUSD < r.minBudgetUSD) return false;
      return true;
    }).slice(0, 4);

    return {
      inputs: input,
      adBudgetBDT: budgetBDT,
      exchangeRate: rate,
      tiktok: tiktokPred,
      facebook: fbPred,
      comparisonVerdict,
      recommendations: matchedRecs,
      generatedAt: new Date().toISOString()
    };
  }

  // --- Lead Management CRM ---
  public getLeads(): Lead[] {
    return this.getItem<Lead[]>(STORAGE_KEYS.LEADS, []).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getLeadById(id: string): Lead | undefined {
    return this.getLeads().find(l => l.id === id);
  }

  public captureLead(leadData: {
    name: string;
    whatsapp: string;
    socialLink?: string;
    location?: string;
    businessType?: string;
    monthlyBudget?: string;
    notes?: string;
    calculatorSummary?: string;
  }): Lead {
    return this.addOrUpdateLead({
      location: 'Bangladesh',
      ...leadData
    });
  }

  public addOrUpdateLead(leadData: {
    name: string;
    whatsapp: string;
    socialLink?: string;
    location: string;
    businessType?: string;
    monthlyBudget?: string;
    notes?: string;
    source?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    calculatorSummary?: string;
    activityType?: LeadActivity['type'];
    activityDescription?: string;
  }): Lead {
    const leads = this.getLeads();
    const visitorId = this.getVisitorId();
    const rawPhone = leadData.whatsapp || (leadData as any).phone || '';
    const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '') : '';

    // Check if lead with this WhatsApp already exists
    let existing = cleanPhone 
      ? leads.find(l => {
          const lPhone = l.whatsapp || (l as any).phone || '';
          return lPhone ? lPhone.replace(/\D/g, '') === cleanPhone : false;
        })
      : undefined;

    const timestamp = new Date().toISOString();
    const activity: LeadActivity = {
      id: 'act-' + Math.random().toString(36).substring(2, 7),
      type: leadData.activityType || 'FORM_SUBMITTED',
      timestamp,
      description: leadData.activityDescription || 'Submitted Lead Information'
    };

    if (existing) {
      existing.name = leadData.name || existing.name;
      existing.socialLink = leadData.socialLink || existing.socialLink;
      existing.location = leadData.location || existing.location;
      existing.businessType = leadData.businessType || existing.businessType;
      existing.monthlyBudget = leadData.monthlyBudget || existing.monthlyBudget;
      existing.lastActivity = timestamp;
      if (leadData.calculatorSummary) {
        existing.calculatorUsed = true;
        existing.calculatorSummary = leadData.calculatorSummary;
      }
      if (leadData.notes) {
        existing.notes = (existing.notes ? existing.notes + '\n' : '') + leadData.notes;
      }
      existing.activities.unshift(activity);

      this.setItem(STORAGE_KEYS.LEADS, leads);
      this.setSavedLeadInfo({
        name: existing.name,
        whatsapp: existing.whatsapp,
        socialLink: existing.socialLink,
        location: existing.location
      });
      this.logAudit('UPDATE_LEAD', 'Lead', `Updated lead profile for ${existing.name} (${existing.whatsapp})`);
      syncLeadToFirestore(existing);
      return existing;
    } else {
      const newLead: Lead = {
        id: 'LD-' + (1000 + leads.length + 1),
        name: leadData.name,
        whatsapp: leadData.whatsapp,
        socialLink: leadData.socialLink,
        location: leadData.location,
        businessType: leadData.businessType,
        monthlyBudget: leadData.monthlyBudget,
        notes: leadData.notes,
        source: leadData.source || 'Direct Website',
        utmSource: leadData.utmSource,
        utmMedium: leadData.utmMedium,
        utmCampaign: leadData.utmCampaign,
        firstVisit: timestamp,
        lastActivity: timestamp,
        createdAt: timestamp,
        status: 'NEW',
        calculatorUsed: !!leadData.calculatorSummary,
        aiChatUsed: false,
        whatsappClicked: false,
        caseStudyViewed: false,
        calculatorSummary: leadData.calculatorSummary,
        activities: [activity],
        visitorId
      };

      leads.unshift(newLead);
      this.setItem(STORAGE_KEYS.LEADS, leads);
      this.setSavedLeadInfo({
        name: newLead.name,
        whatsapp: newLead.whatsapp,
        socialLink: newLead.socialLink,
        location: newLead.location
      });
      this.logAudit('CREATE_LEAD', 'Lead', `New lead captured: ${newLead.name} (${newLead.whatsapp})`);
      syncLeadToFirestore(newLead);
      return newLead;
    }
  }

  public updateLeadStatus(id: string, status: LeadStatus, note?: string): void {
    const leads = this.getLeads();
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    const oldStatus = lead.status;
    lead.status = status;
    lead.lastActivity = new Date().toISOString();
    lead.activities.unshift({
      id: 'act-' + Math.random().toString(36).substring(2, 7),
      type: 'STATUS_CHANGED',
      timestamp: new Date().toISOString(),
      description: `Status changed from ${oldStatus} to ${status}${note ? `: ${note}` : ''}`
    });

    this.setItem(STORAGE_KEYS.LEADS, leads);
    this.logAudit('UPDATE_LEAD_STATUS', 'Lead', `Lead ${id} status updated to ${status}`);
    syncLeadToFirestore(lead);
  }

  public addLeadNote(id: string, noteText: string): void {
    const leads = this.getLeads();
    const lead = leads.find(l => l.id === id);
    if (!lead) return;

    lead.notes = (lead.notes ? lead.notes + '\n' : '') + `[${new Date().toLocaleDateString()}] ${noteText}`;
    lead.activities.unshift({
      id: 'act-' + Math.random().toString(36).substring(2, 7),
      type: 'NOTE_ADDED',
      timestamp: new Date().toISOString(),
      description: `Added note: ${noteText}`
    });

    this.setItem(STORAGE_KEYS.LEADS, leads);
  }

  public deleteLead(id: string): void {
    const leads = this.getLeads().filter(l => l.id !== id);
    this.setItem(STORAGE_KEYS.LEADS, leads);
    this.logAudit('DELETE_LEAD', 'Lead', `Deleted lead ID: ${id}`);
  }

  // --- Knowledge Base & Gaps ---
  public getKnowledgeBase(onlyPublished: boolean = true): KnowledgeBaseItem[] {
    const raw = this.getItem<KnowledgeBaseItem[]>(STORAGE_KEYS.KNOWLEDGE_BASE, initialKnowledgeBase);
    
    // Ensure all items have bilingual fields merged from initialKnowledgeBase if missing
    const all = raw.map(item => {
      const initMatch = initialKnowledgeBase.find(k => k.id === item.id);
      return {
        ...item,
        questionEn: item.questionEn || initMatch?.questionEn || item.title || item.question,
        questionBn: item.questionBn || initMatch?.questionBn || item.question,
        answerEn: item.answerEn || initMatch?.answerEn || item.answer,
        answerBn: item.answerBn || initMatch?.answerBn || item.answer,
        categoryEn: item.categoryEn || initMatch?.categoryEn || item.category,
        categoryBn: item.categoryBn || initMatch?.categoryBn || item.category,
      };
    });

    const sorted = all.sort((a, b) => b.priority - a.priority);
    if (onlyPublished) {
      return sorted.filter(k => k.status === 'published');
    }
    return sorted;
  }

  public getFAQs(onlyPublished: boolean = true): FAQItem[] {
    const kb = this.getKnowledgeBase(onlyPublished);
    return kb.map(item => ({
      id: item.id,
      question: item.question,
      answer: item.answer,
      category: item.category,
      questionEn: item.questionEn,
      questionBn: item.questionBn,
      answerEn: item.answerEn,
      answerBn: item.answerBn,
      categoryEn: item.categoryEn,
      categoryBn: item.categoryBn
    }));
  }

  public saveKnowledgeItem(item: KnowledgeBaseItem): void {
    const items = this.getItem<KnowledgeBaseItem[]>(STORAGE_KEYS.KNOWLEDGE_BASE, initialKnowledgeBase);
    const idx = items.findIndex(k => k.id === item.id);
    const updated = { ...item, updatedAt: new Date().toISOString() };
    if (idx >= 0) items[idx] = updated;
    else items.unshift(updated);
    this.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, items);
    this.logAudit('SAVE_KB_ITEM', 'KnowledgeBase', `Saved knowledge article: ${item.title}`);
  }

  public deleteKnowledgeItem(id: string): void {
    const items = this.getItem<KnowledgeBaseItem[]>(STORAGE_KEYS.KNOWLEDGE_BASE, initialKnowledgeBase).filter(k => k.id !== id);
    this.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, items);
    this.logAudit('DELETE_KB_ITEM', 'KnowledgeBase', `Deleted knowledge item ${id}`);
  }

  public getKnowledgeGaps(): KnowledgeGap[] {
    return this.getItem<KnowledgeGap[]>(STORAGE_KEYS.KNOWLEDGE_Gaps, []).sort(
      (a, b) => new Date(b.lastAsked).getTime() - new Date(a.lastAsked).getTime()
    );
  }

  public logKnowledgeGap(question: string, aiResponseGiven?: string, visitorId?: string): void {
    const gaps = this.getKnowledgeGaps();
    const existing = gaps.find(g => g.question.trim().toLowerCase() === question.trim().toLowerCase());
    const timestamp = new Date().toISOString();

    if (existing) {
      existing.count += 1;
      existing.lastAsked = timestamp;
      if (aiResponseGiven) existing.aiResponseGiven = aiResponseGiven;
    } else {
      gaps.unshift({
        id: 'gap-' + Math.random().toString(36).substring(2, 8),
        question: question.trim(),
        visitorId: visitorId || this.getVisitorId(),
        count: 1,
        lastAsked: timestamp,
        aiResponseGiven,
        status: 'unresolved',
        createdAt: timestamp
      });
    }

    this.setItem(STORAGE_KEYS.KNOWLEDGE_Gaps, gaps);
  }

  public resolveKnowledgeGap(id: string, answer: string, addToKb: boolean): void {
    const gaps = this.getKnowledgeGaps();
    const gap = gaps.find(g => g.id === id);
    if (!gap) return;

    gap.adminAnswer = answer;
    gap.status = addToKb ? 'added_to_kb' : 'resolved';
    this.setItem(STORAGE_KEYS.KNOWLEDGE_Gaps, gaps);

    if (addToKb) {
      this.saveKnowledgeItem({
        id: 'kb-' + Math.random().toString(36).substring(2, 8),
        title: gap.question.slice(0, 60),
        category: (gap.category as any) || 'General',
        question: gap.question,
        answer,
        keywords: gap.question.toLowerCase().split(' ').filter(w => w.length > 2),
        priority: 5,
        status: 'published',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
  }

  // --- AI Conversations & Settings ---
  public getAIConversations(): AIConversation[] {
    return this.getItem<AIConversation[]>(STORAGE_KEYS.AI_CONVERSATIONS, []).sort(
      (a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
    );
  }

  public saveAIConversation(conv: AIConversation): void {
    const convs = this.getAIConversations();
    const idx = convs.findIndex(c => c.id === conv.id);
    if (idx >= 0) convs[idx] = conv;
    else convs.unshift(conv);
    this.setItem(STORAGE_KEYS.AI_CONVERSATIONS, convs);
  }

  public getAISettings(): AISettings {
    return this.getItem<AISettings>(STORAGE_KEYS.AI_SETTINGS, {
      enabled: true,
      provider: 'Gemini',
      primaryModel: 'gemini-3.6-flash',
      backupModel: 'gemini-3.6-flash',
      temperature: 0.2,
      maxOutputTokens: 800,
      systemInstruction: 'Answer strictly using Knowledge Base.',
      knowledgeRetrievalStrictness: 'STRICT_KB_ONLY',
      ctaStrategy: 'CONTEXTUAL'
    });
  }

  public saveAISettings(settings: Partial<AISettings>): void {
    const current = this.getAISettings();
    this.setItem(STORAGE_KEYS.AI_SETTINGS, { ...current, ...settings });
    this.logAudit('UPDATE_AI_SETTINGS', 'AISettings', 'Updated AI configuration');
  }

  // --- Analytics & Events ---
  public trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    const visitorId = this.getVisitorId();
    const event: AnalyticsEvent = {
      id: 'ev-' + Math.random().toString(36).substring(2, 9),
      visitorId,
      eventName,
      page: window.location.pathname,
      properties,
      timestamp: new Date().toISOString()
    };

    const events = this.getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS_EVENTS, []);
    events.unshift(event);
    // Keep max 500 in client storage
    if (events.length > 500) events.pop();
    this.setItem(STORAGE_KEYS.ANALYTICS_EVENTS, events);

    // Update visitor journey
    this.updateVisitorJourney(event);
  }

  private updateVisitorJourney(event: AnalyticsEvent) {
    const journeys = this.getItem<Record<string, VisitorJourney>>(STORAGE_KEYS.VISITOR_JOURNEYS, {});
    const vid = event.visitorId;
    const now = event.timestamp;

    if (!journeys[vid]) {
      journeys[vid] = {
        visitorId: vid,
        firstSeen: now,
        lastSeen: now,
        sessionsCount: 1,
        deviceType: window.innerWidth < 768 ? 'mobile' : window.innerWidth < 1024 ? 'tablet' : 'desktop',
        browser: navigator.userAgent.includes('Chrome') ? 'Chrome' : navigator.userAgent.includes('Safari') ? 'Safari' : 'Other',
        events: [event]
      };
    } else {
      journeys[vid].lastSeen = now;
      journeys[vid].events.unshift(event);
      if (journeys[vid].events.length > 50) journeys[vid].events.pop();
    }

    this.setItem(STORAGE_KEYS.VISITOR_JOURNEYS, journeys);
  }

  public getAnalyticsEvents(): AnalyticsEvent[] {
    return this.getItem<AnalyticsEvent[]>(STORAGE_KEYS.ANALYTICS_EVENTS, []);
  }

  public getVisitorJourneys(): VisitorJourney[] {
    const journeys = this.getItem<Record<string, VisitorJourney>>(STORAGE_KEYS.VISITOR_JOURNEYS, {});
    return Object.values(journeys).sort(
      (a, b) => new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime()
    );
  }

  // --- Media Library ---
  public getMedia(includeDisabled: boolean = true): MediaItem[] {
    const media = this.getItem<MediaItem[]>(STORAGE_KEYS.MEDIA, initialMedia);
    if (includeDisabled) return media;
    return media.filter(m => m.isEnabled !== false);
  }

  public saveMedia(item: MediaItem): void {
    const media = this.getItem<MediaItem[]>(STORAGE_KEYS.MEDIA, initialMedia);
    const idx = media.findIndex(m => m.id === item.id);
    if (idx >= 0) {
      media[idx] = item;
      this.logAudit('UPDATE_MEDIA', 'Media', `Updated media: ${item.title}`);
    } else {
      media.unshift(item);
      this.logAudit('UPLOAD_MEDIA', 'Media', `Added media: ${item.title} (${item.type})`);
    }
    this.setItem(STORAGE_KEYS.MEDIA, media);
    this.notify();
  }

  public deleteMedia(id: string): void {
    const media = this.getItem<MediaItem[]>(STORAGE_KEYS.MEDIA, initialMedia).filter(m => m.id !== id);
    this.setItem(STORAGE_KEYS.MEDIA, media);
    this.logAudit('DELETE_MEDIA', 'Media', `Deleted media item ${id}`);
    this.notify();
  }

  public toggleMediaStatus(id: string): void {
    const media = this.getItem<MediaItem[]>(STORAGE_KEYS.MEDIA, initialMedia);
    const item = media.find(m => m.id === id);
    if (item) {
      item.isEnabled = item.isEnabled === false ? true : false;
      this.setItem(STORAGE_KEYS.MEDIA, media);
      this.logAudit('TOGGLE_MEDIA', 'Media', `Toggled status for ${item.title} to ${item.isEnabled ? 'Enabled' : 'Disabled'}`);
      this.notify();
    }
  }

  public getMediaByPlacement(placement: string): MediaItem[] {
    return this.getMedia(false).filter(m => m.placement === placement);
  }

  // --- Admin Users & Permissions ---
  public getAdminUsers(): AdminUser[] {
    return this.getItem<AdminUser[]>(STORAGE_KEYS.ADMIN_USERS, initialAdminUsers);
  }

  public saveAdminUser(user: AdminUser): void {
    const users = this.getAdminUsers();
    const idx = users.findIndex(u => u.id === user.id);
    if (idx >= 0) {
      users[idx] = user;
      this.logAudit('UPDATE_ADMIN_USER', 'AdminUser', `Updated user account: ${user.name} (${user.role})`);
    } else {
      users.push(user);
      this.logAudit('CREATE_ADMIN_USER', 'AdminUser', `Created user account: ${user.name} (${user.role})`);
    }
    this.setItem(STORAGE_KEYS.ADMIN_USERS, users);
    this.notify();
  }

  public deleteAdminUser(id: string): void {
    const users = this.getAdminUsers().filter(u => u.id !== id);
    this.setItem(STORAGE_KEYS.ADMIN_USERS, users);
    this.logAudit('DELETE_ADMIN_USER', 'AdminUser', `Deleted user account ${id}`);
    this.notify();
  }

  public toggleAdminUserStatus(id: string): void {
    const users = this.getAdminUsers();
    const user = users.find(u => u.id === id);
    if (user) {
      user.status = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      this.setItem(STORAGE_KEYS.ADMIN_USERS, users);
      this.logAudit('TOGGLE_USER_STATUS', 'AdminUser', `Changed status for ${user.name} to ${user.status}`);
      this.notify();
    }
  }

  public getCurrentAdminUser(): AdminUser {
    return this.getItem<AdminUser>(STORAGE_KEYS.CURRENT_USER, initialAdminUsers[0]);
  }

  public setCurrentAdminUser(user: AdminUser): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
    this.notify();
  }

  // Legacy user compatibility
  public getUsers(): UserProfile[] {
    return this.getItem<UserProfile[]>(STORAGE_KEYS.USERS, initialUsers);
  }

  public getCurrentUser(): UserProfile {
    const admin = this.getCurrentAdminUser();
    return {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role === 'ADMIN' ? 'admin' : 'editor',
      createdAt: admin.createdAt
    };
  }

  public setCurrentUser(user: UserProfile): void {
    this.setItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  // --- Audit Logs ---
  public getAuditLogs(): AuditLogEntry[] {
    return this.getItem<AuditLogEntry[]>(STORAGE_KEYS.AUDIT_LOGS, []).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  public logAudit(action: string, entity: string, details: string): void {
    const user = this.getCurrentAdminUser();
    const entry: AuditLogEntry = {
      id: 'aud-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      userName: user?.name || 'Sonjoy Sarkar',
      userRole: (user?.role as any) || 'ADMIN',
      action,
      entity,
      details
    };
    const logs = this.getAuditLogs();
    logs.unshift(entry);
    if (logs.length > 200) logs.pop();
    this.setItem(STORAGE_KEYS.AUDIT_LOGS, logs);
  }

  // --- Backup & Restore ---
  public exportFullBackup(): string {
    const backup = {
      version: '1.2.0',
      timestamp: new Date().toISOString(),
      siteSettings: this.getSiteSettings(),
      socialLinks: this.getSocialLinks(),
      caseStudies: this.getCaseStudies(true),
      districts: this.getDistricts(true),
      benchmarks: this.getBenchmarks(true),
      recommendations: this.getRecommendations(),
      productPriceRanges: this.getProductPriceRanges(true),
      leads: this.getLeads(),
      knowledgeBase: this.getKnowledgeBase(false),
      knowledgeGaps: this.getKnowledgeGaps(),
      media: this.getMedia(true),
      adminUsers: this.getAdminUsers(),
      aiSettings: this.getAISettings()
    };
    return JSON.stringify(backup, null, 2);
  }

  public importFullBackup(jsonStr: string): { success: boolean; message: string } {
    try {
      const data = JSON.parse(jsonStr);
      if (data.siteSettings) this.setItem(STORAGE_KEYS.SITE_SETTINGS, data.siteSettings);
      if (data.socialLinks) this.setItem(STORAGE_KEYS.SOCIAL_LINKS, data.socialLinks);
      if (data.caseStudies) this.setItem(STORAGE_KEYS.CASE_STUDIES, data.caseStudies);
      if (data.districts) this.setItem(STORAGE_KEYS.DISTRICTS, data.districts);
      if (data.benchmarks) this.setItem(STORAGE_KEYS.BENCHMARKS, data.benchmarks);
      if (data.recommendations) this.setItem(STORAGE_KEYS.RECOMMENDATIONS, data.recommendations);
      if (data.productPriceRanges) this.setItem(STORAGE_KEYS.PRODUCT_PRICE_RANGES, data.productPriceRanges);
      if (data.leads) this.setItem(STORAGE_KEYS.LEADS, data.leads);
      if (data.knowledgeBase) this.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, data.knowledgeBase);
      if (data.knowledgeGaps) this.setItem(STORAGE_KEYS.KNOWLEDGE_Gaps, data.knowledgeGaps);
      if (data.media) this.setItem(STORAGE_KEYS.MEDIA, data.media);
      if (data.adminUsers) this.setItem(STORAGE_KEYS.ADMIN_USERS, data.adminUsers);
      if (data.aiSettings) this.setItem(STORAGE_KEYS.AI_SETTINGS, data.aiSettings);

      this.logAudit('IMPORT_BACKUP', 'System', 'Restored full system database from JSON backup');
      return { success: true, message: 'Database successfully restored.' };
    } catch (err: any) {
      return { success: false, message: 'Invalid backup file format: ' + err.message };
    }
  }

  public recordEvent(eventName: string, properties?: any): void {
    this.trackEvent(eventName, { path: window.location.pathname, ...(properties || {}) });
  }

  public getCalculatorBenchmarks(includeInactive = false): CalculatorBenchmark[] {
    return this.getBenchmarks(includeInactive);
  }

  public updateAISettings(settings: AISettings): void {
    this.setItem(STORAGE_KEYS.AI_SETTINGS, settings);
    this.logAudit('UPDATE_AI_SETTINGS', 'AI Settings', 'Updated Gemini model or grounding strictness');
    this.notify();
  }

  public saveLead(lead: LeadSubmission): void {
    const leads = this.getLeads();
    const existingIndex = leads.findIndex(l => l.id === lead.id);
    
    // Map LeadSubmission to Lead model
    const leadModel: Lead = {
      id: lead.id,
      name: lead.name,
      whatsapp: lead.phone,
      socialLink: lead.websiteOrPage,
      location: 'Bangladesh',
      businessType: lead.businessType,
      monthlyBudget: lead.monthlyBudget,
      notes: lead.notes,
      source: 'Direct Form Submission',
      firstVisit: lead.createdAt,
      lastActivity: new Date().toISOString(),
      createdAt: lead.createdAt,
      status: lead.status || 'NEW',
      calculatorUsed: !!lead.calculatorSnapshot,
      aiChatUsed: false,
      whatsappClicked: false,
      caseStudyViewed: false,
      calculatorSummary: lead.calculatorSnapshot 
        ? `Budget: ৳${lead.calculatorSnapshot.budgetBDT.toLocaleString('bn-BD')} | Category: ${lead.calculatorSnapshot.category || ''}`
        : undefined,
      activities: [
        {
          id: 'act-' + Math.random().toString(36).substring(2, 7),
          type: 'FORM_SUBMITTED',
          timestamp: new Date().toISOString(),
          description: `Submitted lead form for ${lead.interestedService}`
        }
      ],
      visitorId: lead.visitorId || this.getVisitorId()
    };

    if (existingIndex >= 0) {
      leads[existingIndex] = leadModel;
    } else {
      leads.unshift(leadModel);
    }

    this.setItem(STORAGE_KEYS.LEADS, leads);
    this.logAudit('CREATE_LEAD', 'CRM Lead', `Captured lead from ${lead.name} (${lead.phone})`);
    this.notify();
  }

  public resetToDefaults(): void {
    localStorage.clear();
    this.initDefaults();
    this.notify();
    this.logAudit('RESET_DEFAULTS', 'System', 'Reset all settings and database to factory defaults');
  }
}

export const storageService = new StorageService();
