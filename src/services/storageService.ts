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
  AdminUser,
  CustomPage,
  SiteThemeSettings,
  FaviconSettings,
  HomePageSettings,
  ServicePackage,
  RobotsSettings,
  SitemapSettings
} from '../types';
import { hashPassword, normalizeMobileNumber, isValidEmail, DEFAULT_ADMIN_PASSWORD_HASH } from '../utils/security';

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
  initialAdminUsers,
  initialCustomPages,
  initialHomePageSettings
} from '../data/initialData';

import { themeService, DEFAULT_THEME_SETTINGS, DEFAULT_FAVICON_SETTINGS } from './themeService';
import { 
  db, 
  doc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  onSnapshot 
} from './firebase';
import { onlineDbClient } from './onlineDatabaseClient';

const syncLeadToFirestore = async (lead: Lead) => {
  try {
    if (db) {
      await setDoc(doc(db, 'leads', lead.id), {
        id: lead.id,
        name: lead.name || '',
        phone: lead.whatsapp || '',
        whatsapp: lead.whatsapp || '',
        socialLink: lead.socialLink || '',
        location: lead.location || 'Bangladesh',
        businessType: lead.businessType || 'General Business',
        interestedService: (lead as any).interestedService || 'TIKTOK_ADS',
        monthlyBudget: lead.monthlyBudget || '',
        status: lead.status || 'NEW',
        notes: lead.notes || '',
        createdAt: lead.createdAt || new Date().toISOString(),
        calculatorSummary: lead.calculatorSummary || '',
        source: lead.source || 'Website Lead Form',
        visitorId: lead.visitorId || '',
        activities: lead.activities || [],
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
  THEME_SETTINGS: 'st_theme_settings_v1',
  FAVICON_SETTINGS: 'st_favicon_settings_v1',
  HOME_PAGE_SETTINGS: 'st_home_page_settings_v1',
  CUSTOM_PAGES: 'st_custom_pages_v1',
  SOCIAL_LINKS: 'st_social_links_v1',
  CASE_STUDIES: 'st_case_studies_v1',
  DISTRICTS: 'st_districts_v1',
  BENCHMARKS: 'st_benchmarks_v1',
  RECOMMENDATIONS: 'st_recommendations_v1',
  PRODUCT_PRICE_RANGES: 'st_product_price_ranges_v1',
  LEADS: 'st_leads_v1',
  KNOWLEDGE_BASE: 'st_knowledge_base_v1',
  KNOWLEDGE_GAPS: 'st_knowledge_gaps_v1',
  AI_CONVERSATIONS: 'st_ai_conversations_v1',
  AI_SETTINGS: 'st_ai_settings_v1',
  ANALYTICS_EVENTS: 'st_analytics_events_v1',
  VISITOR_JOURNEYS: 'st_visitor_journeys_v1',
  MEDIA: 'st_media_v1',
  USERS: 'st_users_v1',
  ADMIN_USERS: 'st_admin_users_v1',
  CURRENT_USER: 'st_current_user_v1',
  ROBOTS_SETTINGS: 'st_robots_settings_v1',
  SITEMAP_SETTINGS: 'st_sitemap_settings_v1',
  AUDIT_LOGS: 'st_audit_logs_v1',
  VISITOR_ID: 'st_visitor_id_v1',
  LAST_LEAD_INFO: 'st_last_lead_info_v1'
};

const KEY_TO_COLLECTION_MAP: Record<string, string> = {
  [STORAGE_KEYS.SITE_SETTINGS]: 'siteSettings',
  [STORAGE_KEYS.THEME_SETTINGS]: 'themeSettings',
  [STORAGE_KEYS.FAVICON_SETTINGS]: 'faviconSettings',
  [STORAGE_KEYS.HOME_PAGE_SETTINGS]: 'homePageSettings',
  [STORAGE_KEYS.CUSTOM_PAGES]: 'customPages',
  [STORAGE_KEYS.SOCIAL_LINKS]: 'socialLinks',
  [STORAGE_KEYS.CASE_STUDIES]: 'caseStudies',
  [STORAGE_KEYS.DISTRICTS]: 'districts',
  [STORAGE_KEYS.BENCHMARKS]: 'benchmarks',
  [STORAGE_KEYS.RECOMMENDATIONS]: 'recommendations',
  [STORAGE_KEYS.PRODUCT_PRICE_RANGES]: 'productPriceRanges',
  [STORAGE_KEYS.LEADS]: 'leads',
  [STORAGE_KEYS.KNOWLEDGE_BASE]: 'knowledgeBase',
  [STORAGE_KEYS.KNOWLEDGE_GAPS]: 'knowledgeGaps',
  [STORAGE_KEYS.AI_CONVERSATIONS]: 'aiConversations',
  [STORAGE_KEYS.AI_SETTINGS]: 'aiSettings',
  [STORAGE_KEYS.ANALYTICS_EVENTS]: 'analyticsEvents',
  [STORAGE_KEYS.VISITOR_JOURNEYS]: 'visitorJourneys',
  [STORAGE_KEYS.MEDIA]: 'media',
  [STORAGE_KEYS.USERS]: 'users',
  [STORAGE_KEYS.ADMIN_USERS]: 'adminUsers',
  [STORAGE_KEYS.ROBOTS_SETTINGS]: 'robotsSettings',
  [STORAGE_KEYS.SITEMAP_SETTINGS]: 'sitemapSettings',
  [STORAGE_KEYS.AUDIT_LOGS]: 'auditLogs',
};

class StorageService {
  private listeners: Set<() => void> = new Set();
  private isFirestoreSyncActive = false;
  private isOnlineDbSyncActive = false;
  private isBatchInitializing = false;
  private isApplyingRemoteUpdate = false;

  constructor() {
    this.initDefaults();
    this.initOnlineDbSync();
    this.initFirestoreSync();
  }

  private initOnlineDbSync(): void {
    if (this.isOnlineDbSyncActive) return;
    this.isOnlineDbSyncActive = true;

    // Listen to live updates from the Online Cloud Database
    onlineDbClient.subscribe((remoteDb: any) => {
      if (!remoteDb || typeof remoteDb !== 'object') return;

      let hasChanges = false;
      this.isApplyingRemoteUpdate = true;
      try {
        Object.entries(KEY_TO_COLLECTION_MAP).forEach(([storageKey, collectionName]) => {
          if (remoteDb[collectionName] !== undefined && remoteDb[collectionName] !== null) {
            try {
              const remoteStr = JSON.stringify(remoteDb[collectionName]);
              const localStr = localStorage.getItem(storageKey);
              if (remoteStr !== localStr) {
                localStorage.setItem(storageKey, remoteStr);
                hasChanges = true;
              }
            } catch (err) {
              console.warn('Storage sync error for ' + collectionName, err);
            }
          }
        });
      } finally {
        this.isApplyingRemoteUpdate = false;
      }

      if (hasChanges) {
        this.notify();
      }
    });

    // One-time initial push of local state if remote was empty or freshly initialized
    setTimeout(async () => {
      try {
        const remoteHealth = await onlineDbClient.getHealth();
        if (remoteHealth && remoteHealth.connected && remoteHealth.totalRecords === 0) {
          const fullPayload: Record<string, any> = {};
          Object.entries(KEY_TO_COLLECTION_MAP).forEach(([storageKey, collectionName]) => {
            const val = this.getItem(storageKey, null);
            if (val !== null) {
              fullPayload[collectionName] = val;
            }
          });
          if (Object.keys(fullPayload).length > 0) {
            await onlineDbClient.syncBatch(fullPayload);
          }
        }
      } catch {
        // Silently handle
      }
    }, 2000);
  }

  private initFirestoreSync(): void {
    if (this.isFirestoreSyncActive || !db) return;
    this.isFirestoreSyncActive = true;

    try {
      // 1. Real-time Firestore sync listener
      onSnapshot(
        collection(db, 'leads'),
        (snapshot) => {
          if (!snapshot || snapshot.empty) {
            // If firestore is empty, push existing local leads up to Cloud
            const localLeads = this.getItem<Lead[]>(STORAGE_KEYS.LEADS, []);
            if (localLeads.length > 0) {
              localLeads.forEach(l => syncLeadToFirestore(l));
            }
            return;
          }

          const remoteLeads: Lead[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && (data.id || docSnap.id)) {
              remoteLeads.push({
                id: data.id || docSnap.id,
                name: data.name || 'Anonymous',
                whatsapp: data.phone || data.whatsapp || '',
                socialLink: data.socialLink || '',
                location: data.location || 'Bangladesh',
                businessType: data.businessType || 'General Business',
                monthlyBudget: data.monthlyBudget || '',
                notes: data.notes || '',
                source: data.source || 'Online Form',
                createdAt: data.createdAt || new Date().toISOString(),
                lastActivity: data.updatedAt || data.createdAt || new Date().toISOString(),
                firstVisit: data.createdAt || new Date().toISOString(),
                status: (data.status as any) || 'NEW',
                calculatorUsed: !!data.calculatorSummary,
                aiChatUsed: false,
                whatsappClicked: false,
                caseStudyViewed: false,
                calculatorSummary: data.calculatorSummary || '',
                activities: Array.isArray(data.activities) ? data.activities : [],
                visitorId: data.visitorId || ''
              });
            }
          });

          // Merge remote leads with local leads
          const localLeads = this.getItem<Lead[]>(STORAGE_KEYS.LEADS, []);
          const mergedMap = new Map<string, Lead>();

          // Add local leads first
          localLeads.forEach(l => mergedMap.set(l.id, l));
          // Remote leads overwrite or augment
          remoteLeads.forEach(r => mergedMap.set(r.id, r));

          const mergedLeads = Array.from(mergedMap.values()).sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );

          this.setItem(STORAGE_KEYS.LEADS, mergedLeads);
          this.notify();

          // Push any local leads that are missing in Firestore
          localLeads.forEach(l => {
            if (!snapshot.docs.some(d => d.id === l.id)) {
              syncLeadToFirestore(l);
            }
          });
        },
        (error) => {
          console.debug('Firestore onSnapshot notice:', error?.message);
        }
      );
    } catch (e) {
      console.debug('Firestore sync init notice:', e);
    }
  }

  public async syncAllData(): Promise<boolean> {
    try {
      const fullPayload: Record<string, any> = {};
      Object.entries(KEY_TO_COLLECTION_MAP).forEach(([storageKey, collectionName]) => {
        const val = this.getItem(storageKey, null);
        if (val !== null) {
          fullPayload[collectionName] = val;
        }
      });
      if (Object.keys(fullPayload).length > 0) {
        return await onlineDbClient.syncBatch(fullPayload);
      }
      return true;
    } catch (e) {
      console.warn('Sync all data error:', e);
      return false;
    }
  }

  public async syncAllDataToCloud(): Promise<boolean> {
    return this.syncAllData();
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

      // Automatically queue batch sync with Online Cloud Database
      if (!this.isBatchInitializing && !this.isApplyingRemoteUpdate) {
        const collectionName = KEY_TO_COLLECTION_MAP[key];
        if (collectionName) {
          onlineDbClient.queueCollectionSync(collectionName, value);
        }
      }
    } catch (err) {
      console.warn('Storage write failed', err);
    }
  }

  private hasItem(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  }

  private initDefaults() {
    this.isBatchInitializing = true;
    try {
      if (!this.hasItem(STORAGE_KEYS.SITE_SETTINGS)) {
        this.setItem(STORAGE_KEYS.SITE_SETTINGS, initialSiteSettings);
      }
      if (!this.hasItem(STORAGE_KEYS.THEME_SETTINGS)) {
        this.setItem(STORAGE_KEYS.THEME_SETTINGS, DEFAULT_THEME_SETTINGS);
      }
      if (!this.hasItem(STORAGE_KEYS.FAVICON_SETTINGS)) {
        this.setItem(STORAGE_KEYS.FAVICON_SETTINGS, DEFAULT_FAVICON_SETTINGS);
      }
      if (!this.hasItem(STORAGE_KEYS.HOME_PAGE_SETTINGS)) {
        this.setItem(STORAGE_KEYS.HOME_PAGE_SETTINGS, initialHomePageSettings);
      }
      if (!this.hasItem(STORAGE_KEYS.CUSTOM_PAGES)) {
        this.setItem(STORAGE_KEYS.CUSTOM_PAGES, initialCustomPages);
      }
      if (!this.hasItem(STORAGE_KEYS.SOCIAL_LINKS)) {
        this.setItem(STORAGE_KEYS.SOCIAL_LINKS, initialSocialLinks);
      }
      if (!this.hasItem(STORAGE_KEYS.CASE_STUDIES)) {
        this.setItem(STORAGE_KEYS.CASE_STUDIES, initialCaseStudies);
      }
      if (!this.hasItem(STORAGE_KEYS.DISTRICTS)) {
        this.setItem(STORAGE_KEYS.DISTRICTS, initialDistricts);
      }
      if (!this.hasItem(STORAGE_KEYS.BENCHMARKS)) {
        this.setItem(STORAGE_KEYS.BENCHMARKS, initialBenchmarks);
      }
      if (!this.hasItem(STORAGE_KEYS.RECOMMENDATIONS)) {
        this.setItem(STORAGE_KEYS.RECOMMENDATIONS, initialRecommendationRules);
      }
      if (!this.hasItem(STORAGE_KEYS.PRODUCT_PRICE_RANGES)) {
        this.setItem(STORAGE_KEYS.PRODUCT_PRICE_RANGES, initialProductPriceRanges);
      }
      if (!this.hasItem(STORAGE_KEYS.KNOWLEDGE_BASE)) {
        this.setItem(STORAGE_KEYS.KNOWLEDGE_BASE, initialKnowledgeBase);
      }
      if (!this.hasItem(STORAGE_KEYS.MEDIA)) {
        this.setItem(STORAGE_KEYS.MEDIA, initialMedia);
      }
      if (!this.hasItem(STORAGE_KEYS.USERS)) {
        this.setItem(STORAGE_KEYS.USERS, initialUsers);
      }
      if (!this.hasItem(STORAGE_KEYS.ADMIN_USERS)) {
        this.setItem(STORAGE_KEYS.ADMIN_USERS, initialAdminUsers);
      }
      if (!this.hasItem(STORAGE_KEYS.CURRENT_USER)) {
        this.setItem(STORAGE_KEYS.CURRENT_USER, initialAdminUsers[0]); // Default admin
      }
      if (!this.hasItem(STORAGE_KEYS.ROBOTS_SETTINGS)) {
        this.setItem(STORAGE_KEYS.ROBOTS_SETTINGS, initialSiteSettings.robots || {
          content: "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\n\nSitemap: https://stwebads.com/sitemap.xml",
          allowAll: true,
          disallowAdmin: true,
          sitemapUrl: "https://stwebads.com/sitemap.xml",
          customRules: "",
          lastUpdated: new Date().toISOString().split('T')[0]
        });
      }
      if (!this.hasItem(STORAGE_KEYS.SITEMAP_SETTINGS)) {
        this.setItem(STORAGE_KEYS.SITEMAP_SETTINGS, initialSiteSettings.sitemap || {
          baseUrl: "https://stwebads.com",
          includeCustomPages: true,
          includeServices: true,
          includeCaseStudies: true,
          changefreq: "weekly",
          priority: 0.8,
          lastGenerated: new Date().toISOString().split('T')[0]
        });
      }
      if (!this.hasItem(STORAGE_KEYS.AI_SETTINGS)) {
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

      // Initial apply of theme and favicon
      const activeTheme = this.getItem<SiteThemeSettings>(STORAGE_KEYS.THEME_SETTINGS, DEFAULT_THEME_SETTINGS);
      const activeFavicon = this.getItem<FaviconSettings>(STORAGE_KEYS.FAVICON_SETTINGS, DEFAULT_FAVICON_SETTINGS);
      themeService.applyTheme(activeTheme);
      themeService.updateFavicon(activeFavicon, activeTheme);
    } catch (e) {
      console.warn('Init defaults notice:', e);
    } finally {
      this.isBatchInitializing = false;
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
        enabled: saved?.gtm !== undefined ? saved.gtm.enabled : true,
        containerId: (saved?.gtm?.containerId && saved.gtm.containerId !== 'GTM-XXXXXXX') ? saved.gtm.containerId : 'GTM-P3WLNDR6',
        tiktokPixelId: saved?.gtm?.tiktokPixelId || '',
        metaPixelId: saved?.gtm?.metaPixelId || '',
        googleAnalyticsId: saved?.gtm?.googleAnalyticsId || '',
        customHeadScript: saved?.gtm?.customHeadScript || '',
        customBodyScript: saved?.gtm?.customBodyScript || ''
      },
      sectionVisibility: {
        ...initialSiteSettings.sectionVisibility,
        ...(saved?.sectionVisibility || {})
      },
      header: {
        ...initialSiteSettings.header,
        ...(saved?.header || {}),
        navLinks: saved?.header?.navLinks || initialSiteSettings.header?.navLinks || []
      }
    };
  }

  public updateSiteSettings(settings: Partial<SiteSettings>): void {
    const current = this.getSiteSettings();
    const updated = { ...current, ...settings };
    this.setItem(STORAGE_KEYS.SITE_SETTINGS, updated);
    this.logAudit('EDIT_SETTINGS', 'SiteSettings', 'Updated global site settings');
  }

  // --- Theme & Color Management ---
  public getThemeSettings(): SiteThemeSettings {
    const saved = this.getItem<SiteThemeSettings>(STORAGE_KEYS.THEME_SETTINGS, DEFAULT_THEME_SETTINGS);
    return { ...DEFAULT_THEME_SETTINGS, ...(saved || {}) };
  }

  public saveThemeSettings(theme: SiteThemeSettings): void {
    this.setItem(STORAGE_KEYS.THEME_SETTINGS, theme);
    themeService.applyTheme(theme);
    const favicon = this.getFaviconSettings();
    themeService.updateFavicon(favicon, theme);
    this.logAudit('SAVE_THEME_SETTINGS', 'SiteTheme', `Saved site theme: ${theme.activePaletteId}`);
  }

  // --- Favicon Management ---
  public getFaviconSettings(): FaviconSettings {
    const saved = this.getItem<FaviconSettings>(STORAGE_KEYS.FAVICON_SETTINGS, DEFAULT_FAVICON_SETTINGS);
    return { ...DEFAULT_FAVICON_SETTINGS, ...(saved || {}) };
  }

  public saveFaviconSettings(favicon: FaviconSettings): void {
    this.setItem(STORAGE_KEYS.FAVICON_SETTINGS, favicon);
    const theme = this.getThemeSettings();
    themeService.updateFavicon(favicon, theme);
    this.logAudit('SAVE_FAVICON', 'Favicon', `Updated favicon configuration`);
  }

  // --- Home Page Content Control ---
  public getHomePageSettings(): HomePageSettings {
    const saved = this.getItem<HomePageSettings>(STORAGE_KEYS.HOME_PAGE_SETTINGS, initialHomePageSettings);
    return { ...initialHomePageSettings, ...(saved || {}) };
  }

  public saveHomePageSettings(settings: HomePageSettings): void {
    this.setItem(STORAGE_KEYS.HOME_PAGE_SETTINGS, settings);
    this.logAudit('SAVE_HOME_PAGE_SETTINGS', 'HomePageSettings', 'Updated home page dynamic content rules');
  }

  // --- WordPress-like Custom Page Management ---
  public getCustomPages(includeDrafts: boolean = false): CustomPage[] {
    const all = this.getItem<CustomPage[]>(STORAGE_KEYS.CUSTOM_PAGES, initialCustomPages);
    const sorted = [...all].sort((a, b) => a.sortOrder - b.sortOrder);
    if (includeDrafts) return sorted;
    return sorted.filter(p => p.status === 'PUBLISHED');
  }

  public getCustomPageBySlug(slug: string, includeDrafts: boolean = false): CustomPage | null {
    const all = this.getCustomPages(includeDrafts);
    const cleanSlug = slug.toLowerCase().replace(/^\/page\//, '').replace(/^\//, '');
    return all.find(p => p.slug.toLowerCase() === cleanSlug) || null;
  }

  public saveCustomPage(page: CustomPage): void {
    const all = this.getItem<CustomPage[]>(STORAGE_KEYS.CUSTOM_PAGES, initialCustomPages);
    const idx = all.findIndex(p => p.id === page.id);
    const now = new Date().toISOString();
    const updated: CustomPage = {
      ...page,
      updatedAt: now,
      createdAt: page.createdAt || now
    };
    if (idx >= 0) {
      all[idx] = updated;
    } else {
      all.push(updated);
    }
    this.setItem(STORAGE_KEYS.CUSTOM_PAGES, all);
    this.logAudit('SAVE_PAGE', 'CustomPage', `Saved page: ${page.titleEn} (${page.slug}) [${page.status}]`);
  }

  public deleteCustomPage(id: string): void {
    const all = this.getItem<CustomPage[]>(STORAGE_KEYS.CUSTOM_PAGES, initialCustomPages);
    const target = all.find(p => p.id === id);
    if (target?.isSystemPage) {
      console.warn('System pages cannot be deleted, but status can be changed to DISABLED');
      return;
    }
    const filtered = all.filter(p => p.id !== id);
    this.setItem(STORAGE_KEYS.CUSTOM_PAGES, filtered);
    this.logAudit('DELETE_PAGE', 'CustomPage', `Deleted page: ${id}`);
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
    this.notify();
    const targetLead = leads.find(l => l.id === id);
    if (targetLead) syncLeadToFirestore(targetLead);
  }

  public deleteLead(id: string): void {
    const leads = this.getLeads().filter(l => l.id !== id);
    this.setItem(STORAGE_KEYS.LEADS, leads);
    this.logAudit('DELETE_LEAD', 'Lead', `Deleted lead ID: ${id}`);
    try {
      if (db) {
        deleteDoc(doc(db, 'leads', id)).catch(() => {});
      }
    } catch {}
    this.notify();
  }

  public async forceCloudSync(): Promise<{ success: boolean; message: string; count: number }> {
    try {
      if (!db) {
        return { 
          success: false, 
          message: 'ফায়ারবেস ক্লাউড ডেটাবেস ইনিশিয়ালাইজ হয়নি।', 
          count: this.getLeads().length 
        };
      }

      const leads = this.getLeads();
      for (const lead of leads) {
        await syncLeadToFirestore(lead);
      }

      // Fetch all remote leads from Firestore
      const snap = await getDocs(collection(db, 'leads'));
      if (!snap.empty) {
        const remoteLeads: Lead[] = [];
        snap.forEach(d => {
          const data = d.data();
          if (data) {
            remoteLeads.push({
              id: data.id || d.id,
              name: data.name || 'Anonymous',
              whatsapp: data.phone || data.whatsapp || '',
              socialLink: data.socialLink || '',
              location: data.location || 'Bangladesh',
              businessType: data.businessType || 'General Business',
              monthlyBudget: data.monthlyBudget || '',
              notes: data.notes || '',
              source: data.source || 'Website Lead Form',
              createdAt: data.createdAt || new Date().toISOString(),
              lastActivity: data.updatedAt || data.createdAt || new Date().toISOString(),
              firstVisit: data.createdAt || new Date().toISOString(),
              status: (data.status as any) || 'NEW',
              calculatorUsed: !!data.calculatorSummary,
              aiChatUsed: false,
              whatsappClicked: false,
              caseStudyViewed: false,
              calculatorSummary: data.calculatorSummary || '',
              activities: Array.isArray(data.activities) ? data.activities : [],
              visitorId: data.visitorId || ''
            });
          }
        });

        const mergedMap = new Map<string, Lead>();
        leads.forEach(l => mergedMap.set(l.id, l));
        remoteLeads.forEach(r => mergedMap.set(r.id, r));

        const finalLeads = Array.from(mergedMap.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        this.setItem(STORAGE_KEYS.LEADS, finalLeads);
        this.notify();
      }

      return {
        success: true,
        message: `ক্লাউড ডেটাবেস (Firestore)-এ মোট ${leads.length} টি লিড সফলভাবে সিঙ্ক সম্পন্ন হয়েছে!`,
        count: this.getLeads().length
      };
    } catch (err: any) {
      return {
        success: false,
        message: `সিঙ্ক ব্যর্থ হয়েছে: ${err?.message || 'ফায়ারবেস সিকিউরিটি রুলস যাচাই করুন'}`,
        count: this.getLeads().length
      };
    }
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
    return this.getItem<KnowledgeGap[]>(STORAGE_KEYS.KNOWLEDGE_GAPS, []).sort(
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

    this.setItem(STORAGE_KEYS.KNOWLEDGE_GAPS, gaps);
  }

  public resolveKnowledgeGap(id: string, answer: string, addToKb: boolean): void {
    const gaps = this.getKnowledgeGaps();
    const gap = gaps.find(g => g.id === id);
    if (!gap) return;

    gap.adminAnswer = answer;
    gap.status = addToKb ? 'added_to_kb' : 'resolved';
    this.setItem(STORAGE_KEYS.KNOWLEDGE_GAPS, gaps);

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
    const raw = this.getItem<any[]>(STORAGE_KEYS.ADMIN_USERS, initialAdminUsers);
    const usersList = Array.isArray(raw) && raw.length > 0 ? raw : initialAdminUsers;
    
    const normalized: AdminUser[] = usersList.map(u => {
      const isPrimary = (u.email || '').toLowerCase() === 'giga.sonjoy@gmail.com' || u.role === 'SUPER_ADMIN';
      const role = (isPrimary || u.role === 'ADMIN' || u.role === 'admin' || u.role === 'SUPER_ADMIN') ? 'ADMIN' : 'EDITOR';
      const status = (u.status === 'DISABLED' || u.status === 'disabled' || u.isActive === false) && !isPrimary
        ? 'DISABLED' 
        : 'ACTIVE';
      
      return {
        id: u.id || (isPrimary ? 'usr-admin-1' : `usr-${Date.now()}`),
        name: isPrimary ? 'Sonjoy Sarkar' : (u.name || 'Admin User'),
        email: isPrimary ? 'giga.sonjoy@gmail.com' : (u.email || 'user@stwebads.com'),
        mobile: normalizeMobileNumber(u.mobile || '01723516793'),
        role: role as 'ADMIN' | 'EDITOR',
        status: status as 'ACTIVE' | 'DISABLED',
        passwordHash: u.passwordHash,
        passcode: u.passcode || 'stweb2025',
        createdAt: u.createdAt || '2026-01-01',
        lastLogin: u.lastLogin,
        avatarUrl: u.avatarUrl
      };
    });

    // Ensure primary admin always exists
    if (!normalized.some(u => u.email.toLowerCase() === 'giga.sonjoy@gmail.com')) {
      normalized.unshift(initialAdminUsers[0]);
    }
    return normalized;
  }

  public saveAdminUser(user: AdminUser): void {
    const users = this.getAdminUsers();
    // Normalize mobile
    const sanitizedUser: AdminUser = {
      ...user,
      email: user.email.trim().toLowerCase(),
      mobile: normalizeMobileNumber(user.mobile || '01723516793'),
      passwordHash: user.password ? hashPassword(user.password) : (user.passwordHash || hashPassword(user.passcode || 'stweb2025')),
      passcode: user.passcode || user.password || 'stweb2025'
    };

    const idx = users.findIndex(u => u.id === sanitizedUser.id);
    if (idx >= 0) {
      users[idx] = sanitizedUser;
      this.logAudit('UPDATE_ADMIN_USER', 'AdminUser', `Updated user account: ${sanitizedUser.name} (${sanitizedUser.role})`);
    } else {
      users.push(sanitizedUser);
      this.logAudit('CREATE_ADMIN_USER', 'AdminUser', `Created user account: ${sanitizedUser.name} (${sanitizedUser.role})`);
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

  public getAdminPasscode(): string {
    return this.getItem<string>('st_admin_passcode', 'stweb2025');
  }

  public setAdminPasscode(newPasscode: string): void {
    this.setItem('st_admin_passcode', newPasscode);
    this.logAudit('UPDATE_PASSCODE', 'Security', 'Admin access passcode updated successfully');
    this.notify();
  }

  /**
   * Triple-Credential Verification:
   * 1. Email (matches registered active user)
   * 2. Mobile (matches normalized Bangladeshi/Intl number e.g. 01723516793)
   * 3. Password / Passcode (matches SHA-256 hash or plain passcode)
   */
  public verifyAdminCredentials(email: string, mobile: string, passwordOrPasscode: string): AdminUser | null {
    if (!email || !mobile || !passwordOrPasscode) return null;

    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = normalizeMobileNumber(mobile.trim());
    const cleanPass = passwordOrPasscode.trim();
    const hashedAttempt = hashPassword(cleanPass);

    const users = this.getAdminUsers();

    // Check against all active users in storage
    const matchedUser = users.find(u => {
      if (u.status !== 'ACTIVE') return false;

      const userEmailMatch = u.email.toLowerCase() === cleanEmail;
      const userMobileMatch = normalizeMobileNumber(u.mobile) === cleanMobile || 
                             u.mobile.replace(/\D/g, '') === cleanMobile;
      
      const passMatch = 
        (u.passwordHash && (u.passwordHash === hashedAttempt || u.passwordHash === cleanPass)) ||
        (u.passcode && u.passcode === cleanPass) ||
        (u.password && u.password === cleanPass) ||
        (cleanPass === 'stweb2025'); // Global master fallback

      return userEmailMatch && userMobileMatch && passMatch;
    });

    if (matchedUser) {
      // Update last login timestamp
      matchedUser.lastLogin = new Date().toISOString().replace('T', ' ').substring(0, 16);
      this.saveAdminUser(matchedUser);
      this.setCurrentAdminUser(matchedUser);
      this.logAudit('ADMIN_LOGIN_SUCCESS', 'Auth', `Successful login for ${matchedUser.email} (${matchedUser.name})`);
      return matchedUser;
    }

    // Check if primary admin fallback matches
    if (
      cleanEmail === 'giga.sonjoy@gmail.com' &&
      cleanMobile === '01723516793' &&
      (cleanPass === 'stweb2025' || hashedAttempt === 'e949980d22081fdb7020d5bc5043bf7e55fae2fbbe2d7b4db13045610d4812a4')
    ) {
      const primaryAdmin = initialAdminUsers[0];
      this.setCurrentAdminUser(primaryAdmin);
      this.logAudit('ADMIN_LOGIN_SUCCESS', 'Auth', `Primary admin authenticated: ${primaryAdmin.email}`);
      return primaryAdmin;
    }

    this.logAudit('ADMIN_LOGIN_FAILED', 'Auth', `Failed login attempt for email: ${cleanEmail}, mobile: ${cleanMobile}`);
    return null;
  }

  public verifyAdminPasscode(passcode: string): boolean {
    if (!passcode) return false;
    const current = this.getAdminPasscode();
    if (passcode.trim() === current.trim()) return true;
    const users = this.getAdminUsers();
    return users.some(u => u.status === 'ACTIVE' && (u.passcode === passcode.trim() || u.password === passcode.trim()));
  }

  // --- Robots.txt & Sitemap Management ---
  public getRobotsSettings(): RobotsSettings {
    const fallback: RobotsSettings = {
      content: "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\n\nSitemap: https://stwebads.com/sitemap.xml",
      allowAll: true,
      disallowAdmin: true,
      sitemapUrl: "https://stwebads.com/sitemap.xml",
      customRules: "",
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    return this.getItem<RobotsSettings>(STORAGE_KEYS.ROBOTS_SETTINGS, fallback);
  }

  public saveRobotsSettings(settings: RobotsSettings): void {
    const updated = {
      ...settings,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    this.setItem(STORAGE_KEYS.ROBOTS_SETTINGS, updated);
    this.logAudit('UPDATE_ROBOTS_TXT', 'SEO', 'Updated robots.txt configuration and directives');
    this.notify();
  }

  public generateRobotsTxt(): string {
    const settings = this.getRobotsSettings();
    if (settings.content && settings.content.trim()) {
      return settings.content.trim();
    }
    let lines = ['User-agent: *'];
    if (settings.allowAll) {
      lines.push('Allow: /');
    }
    if (settings.disallowAdmin) {
      lines.push('Disallow: /admin');
      lines.push('Disallow: /admin/*');
    }
    if (settings.customRules && settings.customRules.trim()) {
      lines.push(settings.customRules.trim());
    }
    if (settings.sitemapUrl) {
      lines.push('');
      lines.push(`Sitemap: ${settings.sitemapUrl}`);
    }
    return lines.join('\n');
  }

  public getSitemapSettings(): SitemapSettings {
    const fallback: SitemapSettings = {
      baseUrl: "https://stwebads.com",
      includeCustomPages: true,
      includeServices: true,
      includeCaseStudies: true,
      changefreq: "weekly",
      priority: 0.8,
      lastGenerated: new Date().toISOString().split('T')[0]
    };
    return this.getItem<SitemapSettings>(STORAGE_KEYS.SITEMAP_SETTINGS, fallback);
  }

  public saveSitemapSettings(settings: SitemapSettings): void {
    const updated = {
      ...settings,
      lastGenerated: new Date().toISOString().split('T')[0]
    };
    this.setItem(STORAGE_KEYS.SITEMAP_SETTINGS, updated);
    this.logAudit('UPDATE_SITEMAP', 'SEO', `Updated XML sitemap configuration (${settings.baseUrl})`);
    this.notify();
  }

  public generateSitemapXml(): string {
    const settings = this.getSitemapSettings();
    const baseUrl = (settings.baseUrl || 'https://stwebads.com').replace(/\/$/, '');
    const today = new Date().toISOString().split('T')[0];

    const urls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

    // Core Homepage
    urls.push({
      loc: `${baseUrl}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0'
    });

    // Custom Pages
    if (settings.includeCustomPages) {
      const pages = this.getCustomPages(false);
      pages.forEach(p => {
        urls.push({
          loc: `${baseUrl}/page/${p.slug}`,
          lastmod: p.updatedAt ? p.updatedAt.split('T')[0] : today,
          changefreq: settings.changefreq || 'weekly',
          priority: (settings.priority || 0.8).toFixed(1)
        });
      });
    }

    // Case Studies
    if (settings.includeCaseStudies) {
      const caseStudies = this.getCaseStudies();
      caseStudies.forEach(cs => {
        urls.push({
          loc: `${baseUrl}/#case-studies`,
          lastmod: today,
          changefreq: 'weekly',
          priority: '0.7'
        });
      });
    }

    const xmlLines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ];

    urls.forEach(u => {
      xmlLines.push('  <url>');
      xmlLines.push(`    <loc>${u.loc}</loc>`);
      xmlLines.push(`    <lastmod>${u.lastmod}</lastmod>`);
      xmlLines.push(`    <changefreq>${u.changefreq}</changefreq>`);
      xmlLines.push(`    <priority>${u.priority}</priority>`);
      xmlLines.push('  </url>');
    });

    xmlLines.push('</urlset>');
    return xmlLines.join('\n');
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
      if (data.knowledgeGaps) this.setItem(STORAGE_KEYS.KNOWLEDGE_GAPS, data.knowledgeGaps);
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

  public saveLeadSubmission(submission: {
    name: string;
    phone: string;
    businessType?: string;
    monthlyBudget?: string;
    websiteUrl?: string;
    notes?: string;
  }): Lead {
    return this.captureLead({
      name: submission.name,
      whatsapp: submission.phone,
      businessType: submission.businessType,
      monthlyBudget: submission.monthlyBudget,
      socialLink: submission.websiteUrl,
      notes: submission.notes || 'Submitted via In-Chat AI Assistant',
      location: 'Bangladesh'
    });
  }

  public getServices(): ServicePackage[] {
    return [
      {
        id: 'srv-tiktok-scaling',
        title: 'TikTok Ads Growth & Scaling System',
        titleEn: 'TikTok Ads Growth & Scaling System',
        titleBn: 'টিকটক অ্যাডস গ্রোথ ও স্কেলিং প্যাকেজ',
        platform: 'TikTok',
        pricingModel: 'Monthly Retainer + Performance',
        descriptionEn: 'Full-funnel TikTok advertising management tailored for e-commerce brands in Bangladesh, UAE, and USA.',
        descriptionBn: 'ই-কমার্স ব্র্যান্ডের সেলস বহুগুণ বাড়াতে টিকটক অ্যাড অ্যাকাউন্ট, পিক্সেল এবং ফুল-ফানেল স্কেলিং সলিউশন।',
        features: [
          'Business Center & Pixel Custom Event Tracking',
          'UGC Video Creative Direction & Hook Testing',
          'Advantage+ / Spark Ads Strategy & Scaling',
          'Daily CPA, CPM & CVR Optimization'
        ],
        active: true
      },
      {
        id: 'srv-meta-scaling',
        title: 'Facebook & Instagram Direct ROAS Mastery',
        titleEn: 'Facebook & Instagram Direct ROAS Mastery',
        titleBn: 'ফেসবুক ও ইনস্টাগ্রাম অ্যাডস ROAS মাস্টারি',
        platform: 'Facebook & Meta',
        pricingModel: 'Monthly Retainer + Performance',
        descriptionEn: 'High-conversion Meta ad campaigns combining dynamic catalog ads, CBO budget scaling, and custom Lookalike audiences.',
        descriptionBn: 'অ্যাডভান্সড মেটা বিজনেস ম্যানেজার, CAPI কনভার্সন ট্র্যাকিং ও CBO স্কেলিংয়ের মাধ্যমে হাই-কনভার্টিং ক্যাম্পেইন।',
        features: [
          'Meta Business Manager & CAPI Server Tracking',
          'Dynamic Product Catalog & Broad Audience Testing',
          'Retargeting & Abandoned Cart Recovery Funnels',
          'Weekly Performance Reports & Live Data Dashboard'
        ],
        active: true
      }
    ];
  }

  public resetToDefaults(): void {
    localStorage.clear();
    this.initDefaults();
    this.notify();
    this.logAudit('RESET_DEFAULTS', 'System', 'Reset all settings and database to factory defaults');
  }
}

export const storageService = new StorageService();
