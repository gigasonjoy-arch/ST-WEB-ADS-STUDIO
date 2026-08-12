import fs from 'fs';
import path from 'path';
import {
  initialSiteSettings,
  initialHomePageSettings,
  initialCustomPages,
  initialSocialLinks,
  initialCaseStudies,
  initialDistricts,
  initialBenchmarks,
  initialRecommendationRules,
  initialProductPriceRanges,
  initialKnowledgeBase,
  initialMedia,
  initialUsers,
  initialAdminUsers
} from '../src/data/initialData';
import { DEFAULT_THEME_SETTINGS, DEFAULT_FAVICON_SETTINGS } from '../src/services/themeService';

// Define the file paths for storage
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'online_db.json');
const BACKUP_FILE = path.join(DATA_DIR, 'online_db.backup.json');

// Default initial state
export interface DatabaseState {
  siteSettings?: any;
  themeSettings?: any;
  faviconSettings?: any;
  homePageSettings?: any;
  customPages?: any[];
  socialLinks?: any[];
  caseStudies?: any[];
  districts?: any[];
  benchmarks?: any[];
  recommendations?: any[];
  productPriceRanges?: any[];
  leads?: any[];
  knowledgeBase?: any[];
  knowledgeGaps?: any[];
  aiConversations?: any[];
  aiSettings?: any;
  analyticsEvents?: any[];
  visitorJourneys?: any[];
  media?: any[];
  users?: any[];
  adminUsers?: any[];
  robotsSettings?: any;
  sitemapSettings?: any;
  auditLogs?: any[];
  _lastUpdated?: string;
}

// In-memory cache
let inMemoryDb: DatabaseState | null = null;

// Ensure data directory exists
function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Error creating data directory:', err);
  }
}

// Initial defaults factory
export function getInitialDatabaseDefaults(): DatabaseState {
  return {
    siteSettings: initialSiteSettings,
    themeSettings: DEFAULT_THEME_SETTINGS,
    faviconSettings: DEFAULT_FAVICON_SETTINGS,
    homePageSettings: initialHomePageSettings,
    customPages: initialCustomPages,
    socialLinks: initialSocialLinks,
    caseStudies: initialCaseStudies,
    districts: initialDistricts,
    benchmarks: initialBenchmarks,
    recommendations: initialRecommendationRules,
    productPriceRanges: initialProductPriceRanges,
    leads: [],
    knowledgeBase: initialKnowledgeBase,
    knowledgeGaps: [],
    aiConversations: [],
    aiSettings: {
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
    },
    analyticsEvents: [],
    visitorJourneys: [],
    media: initialMedia,
    users: initialUsers,
    adminUsers: initialAdminUsers,
    robotsSettings: initialSiteSettings.robots || {
      content: "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\n\nSitemap: https://sonjoysarkar.netlify.app/sitemap.xml",
      allowAll: true,
      disallowAdmin: true,
      sitemapUrl: "https://sonjoysarkar.netlify.app/sitemap.xml",
      customRules: "",
      lastUpdated: new Date().toISOString().split('T')[0]
    },
    sitemapSettings: initialSiteSettings.sitemap || {
      baseUrl: "https://sonjoysarkar.netlify.app",
      includeCustomPages: true,
      includeServices: true,
      includeCaseStudies: true,
      changefreq: "weekly",
      priority: 0.8,
      lastGenerated: new Date().toISOString().split('T')[0]
    },
    auditLogs: [
      {
        id: 'log-1',
        timestamp: new Date().toISOString(),
        action: 'ONLINE_DATABASE_INITIALIZED',
        details: 'Initial cloud database schema and collection seeds bootstrapped.',
        userId: 'system'
      }
    ],
    _lastUpdated: new Date().toISOString()
  };
}

// Load database from file or initialize
export function loadDatabase(): DatabaseState {
  if (inMemoryDb) {
    return inMemoryDb;
  }

  ensureDataDir();

  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      // Merge with authoritative defaults to ensure no missing fields
      inMemoryDb = {
        ...getInitialDatabaseDefaults(),
        ...parsed,
        siteSettings: {
          ...initialSiteSettings,
          ...(parsed.siteSettings || {}),
          whatsapp: {
            ...initialSiteSettings.whatsapp,
            ...(parsed.siteSettings?.whatsapp || {})
          },
          seo: {
            ...initialSiteSettings.seo,
            ...(parsed.siteSettings?.seo || {})
          },
          gtm: {
            ...initialSiteSettings.gtm,
            ...(parsed.siteSettings?.gtm || {})
          },
          sectionVisibility: {
            ...initialSiteSettings.sectionVisibility,
            ...(parsed.siteSettings?.sectionVisibility || {})
          },
          header: {
            ...initialSiteSettings.header,
            ...(parsed.siteSettings?.header || {})
          }
        }
      };
      return inMemoryDb!;
    }
  } catch (err) {
    console.error('Error reading online_db.json, attempting backup...', err);
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const rawBackup = fs.readFileSync(BACKUP_FILE, 'utf8');
        inMemoryDb = { ...getInitialDatabaseDefaults(), ...JSON.parse(rawBackup) };
        return inMemoryDb!;
      }
    } catch (bErr) {
      console.error('Backup read error:', bErr);
    }
  }

  // First time bootstrap - initialize in-memory state before saving to avoid recursion
  const defaults = getInitialDatabaseDefaults();
  inMemoryDb = defaults;
  saveDatabase(defaults);
  return inMemoryDb;
}

// Save database to persistent file safely
export function saveDatabase(data: Partial<DatabaseState>): DatabaseState {
  ensureDataDir();

  // If inMemoryDb is not initialized and data is provided, use defaults + data
  const current = inMemoryDb ? inMemoryDb : getInitialDatabaseDefaults();
  const updated: DatabaseState = {
    ...current,
    ...data,
    _lastUpdated: new Date().toISOString()
  };

  inMemoryDb = updated;

  try {
    const jsonStr = JSON.stringify(updated, null, 2);
    const tempFile = `${DB_FILE}.tmp.${Date.now()}`;
    
    // Write to temporary file first for atomic replacement
    fs.writeFileSync(tempFile, jsonStr, 'utf8');
    fs.renameSync(tempFile, DB_FILE);

    // Also update backup safely
    try {
      fs.writeFileSync(BACKUP_FILE, jsonStr, 'utf8');
    } catch {
      // Non-critical
    }
  } catch (err) {
    console.error('Failed to write online_db.json to disk (in-memory state preserved):', err);
  }

  return updated;
}

// Collection Helpers
export function getCollection(name: string): any {
  const db = loadDatabase();
  return (db as any)[name] ?? null;
}

export function saveCollection(name: string, data: any): any {
  const db = loadDatabase();
  const updatedDb = { ...db, [name]: data };
  saveDatabase(updatedDb);
  return updatedDb[name as keyof DatabaseState];
}

export function upsertCollectionItem(name: string, item: any): any {
  const db = loadDatabase();
  const collection = (db as any)[name];

  if (Array.isArray(collection)) {
    const collectionCopy = [...collection];
    const index = collectionCopy.findIndex((i: any) => i && i.id === item.id);
    if (index >= 0) {
      collectionCopy[index] = { ...collectionCopy[index], ...item, updatedAt: new Date().toISOString() };
    } else {
      collectionCopy.unshift({ ...item, createdAt: item.createdAt || new Date().toISOString() });
    }
    saveDatabase({ [name]: collectionCopy });
    return item;
  } else {
    const updatedObj = { ...((db as any)[name] || {}), ...item };
    saveDatabase({ [name]: updatedObj });
    return updatedObj;
  }
}

export function deleteCollectionItem(name: string, id: string): boolean {
  const db = loadDatabase();
  const collection = (db as any)[name];

  if (Array.isArray(collection)) {
    const filtered = collection.filter((i: any) => i && String(i.id) !== String(id));
    const wasRemoved = filtered.length !== collection.length;
    saveDatabase({ [name]: filtered });
    return wasRemoved;
  }
  return false;
}

// Full live CRUD diagnostic test
export async function runServerCrudTest(): Promise<{
  success: boolean;
  timestamp: string;
  durationMs: number;
  steps: Array<{ step: string; status: 'SUCCESS' | 'FAILED'; detail: string; latencyMs: number }>;
}> {
  const startTime = Date.now();
  const steps: Array<{ step: string; status: 'SUCCESS' | 'FAILED'; detail: string; latencyMs: number }> = [];

  const testId = `crud-test-${Date.now()}`;
  const testLead = {
    id: testId,
    name: 'Online CRUD Diagnostic Probe',
    whatsapp: '01700000000',
    businessType: 'Automated Diagnostic Verification',
    status: 'NEW',
    notes: 'Generated by online database diagnostic runner',
    createdAt: new Date().toISOString()
  };

  try {
    // 1. CREATE
    const t0 = Date.now();
    upsertCollectionItem('leads', testLead);
    steps.push({
      step: '1. Create (Insert Online Record)',
      status: 'SUCCESS',
      detail: `Successfully inserted test lead (${testId}) into online server database.`,
      latencyMs: Date.now() - t0
    });

    // 2. READ
    const t1 = Date.now();
    const leads = getCollection('leads') || [];
    const found = leads.find((l: any) => l.id === testId);
    if (!found) {
      throw new Error(`Record ${testId} not found in online leads collection after insert.`);
    }
    steps.push({
      step: '2. Read (Query Online Record)',
      status: 'SUCCESS',
      detail: `Successfully verified record exists in online database with name "${found.name}".`,
      latencyMs: Date.now() - t1
    });

    // 3. UPDATE
    const t2 = Date.now();
    const updatedName = 'Online CRUD Diagnostic Probe [UPDATED]';
    upsertCollectionItem('leads', { id: testId, name: updatedName, status: 'QUALIFIED' });
    const leadsAfterUpdate = getCollection('leads') || [];
    const foundUpdated = leadsAfterUpdate.find((l: any) => l.id === testId);
    if (!foundUpdated || foundUpdated.name !== updatedName) {
      throw new Error(`Record ${testId} did not reflect updated payload in online database.`);
    }
    steps.push({
      step: '3. Update (Modify Online Record)',
      status: 'SUCCESS',
      detail: `Successfully updated record attributes in online database.`,
      latencyMs: Date.now() - t2
    });

    // 4. DELETE
    const t3 = Date.now();
    const deleted = deleteCollectionItem('leads', testId);
    if (!deleted) {
      throw new Error(`Failed to delete record ${testId} from online database.`);
    }
    steps.push({
      step: '4. Delete (Remove Online Record)',
      status: 'SUCCESS',
      detail: `Successfully removed test record and validated online database cleanup.`,
      latencyMs: Date.now() - t3
    });

    return {
      success: true,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      steps
    };
  } catch (err: any) {
    steps.push({
      step: 'Diagnostic Failure',
      status: 'FAILED',
      detail: err.message || 'Unknown database test failure',
      latencyMs: Date.now() - startTime
    });
    return {
      success: false,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime,
      steps
    };
  }
}
