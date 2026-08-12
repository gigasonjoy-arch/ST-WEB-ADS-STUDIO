import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { 
  loadDatabase, 
  saveDatabase, 
  getCollection, 
  saveCollection, 
  upsertCollectionItem, 
  deleteCollectionItem, 
  runServerCrudTest,
  getInitialDatabaseDefaults
} from './server/onlineDb';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // CORS middleware for cross-origin Netlify, custom domain, and mobile preview access
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cache-Control, Pragma');
    res.header('Access-Control-Allow-Credentials', 'true');
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    next();
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'ST Web & Ads Studio API', timestamp: new Date().toISOString() });
  });

// =========================================================================
// ONLINE DATABASE REST API ENDPOINTS
// =========================================================================

// Database Health & Overview Stats
app.get('/api/db/health', (_req, res) => {
  try {
    const db = loadDatabase();
    const collectionsCount: Record<string, number> = {};
    let totalRecords = 0;

    Object.keys(db).forEach((key) => {
      if (key.startsWith('_')) return;
      const val = (db as any)[key];
      if (Array.isArray(val)) {
        collectionsCount[key] = val.length;
        totalRecords += val.length;
      } else if (val && typeof val === 'object') {
        collectionsCount[key] = 1;
        totalRecords += 1;
      }
    });

    res.json({
      status: 'online',
      connected: true,
      engine: 'Cloud Server Persistent JSON Storage',
      storagePath: '/data/online_db.json',
      totalCollections: Object.keys(collectionsCount).length,
      totalRecords,
      collections: collectionsCount,
      lastUpdated: db._lastUpdated || new Date().toISOString()
    });
  } catch (err: any) {
    res.status(500).json({ status: 'error', connected: false, error: err.message });
  }
});

// Get Entire Online Database State
app.get('/api/db/all', (_req, res) => {
  try {
    const db = loadDatabase();
    res.json({ success: true, data: db });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Batch Sync / Replace Online Database State
app.post('/api/db/sync', (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }
    const updated = saveDatabase(payload);
    res.json({ success: true, message: 'Online database synchronized successfully', lastUpdated: updated._lastUpdated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Specific Collection
app.get('/api/db/collection/:collection', (req, res) => {
  try {
    const { collection } = req.params;
    const data = getCollection(collection);
    res.json({ success: true, collection, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Upsert Item or Update Collection
app.post('/api/db/collection/:collection', (req, res) => {
  try {
    const { collection } = req.params;
    const item = req.body;
    const result = upsertCollectionItem(collection, item);
    res.json({ success: true, message: 'Item saved to online database', data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Item by ID in Collection
app.put('/api/db/collection/:collection/:id', (req, res) => {
  try {
    const { collection, id } = req.params;
    const item = { ...req.body, id };
    const result = upsertCollectionItem(collection, item);
    res.json({ success: true, message: `Item ${id} updated in online database`, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Item by ID from Collection
app.delete('/api/db/collection/:collection/:id', (req, res) => {
  try {
    const { collection, id } = req.params;
    const deleted = deleteCollectionItem(collection, id);
    res.json({ success: deleted, message: deleted ? `Item ${id} removed` : `Item ${id} not found` });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Live Server CRUD Diagnostics Test
app.post('/api/db/test-crud', async (_req, res) => {
  try {
    const result = await runServerCrudTest();
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset Database to Fresh Defaults
app.post('/api/db/reset', (_req, res) => {
  try {
    const defaults = getInitialDatabaseDefaults();
    saveDatabase(defaults);
    res.json({ success: true, message: 'Database reset to initial defaults successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Export / Download Backup
app.get('/api/db/backup', (_req, res) => {
  try {
    const db = loadDatabase();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=stweb_online_backup_${Date.now()}.json`);
    res.send(JSON.stringify(db, null, 2));
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Restore Backup
app.post('/api/db/restore', (req, res) => {
  try {
    const backupData = req.body;
    if (!backupData || typeof backupData !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid backup file format' });
    }
    const updated = saveDatabase(backupData);
    res.json({ success: true, message: 'Database restored successfully', lastUpdated: updated._lastUpdated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Autonomous grounded AI Chat endpoint (100% Free, Instant & No API Key Required)
app.post('/api/ai/chat', async (req, res) => {
  const { message, knowledgeContext, hasDirectKnowledge } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // Extract direct grounded answer helper from knowledgeContext
  if (knowledgeContext && knowledgeContext.trim().length > 0) {
    const parts = knowledgeContext.split(/A:\s*/g);
    let reply = "";
    if (parts.length > 1) {
      reply = parts[1].split(/\n\nQ:/g)[0].trim();
    } else {
      reply = knowledgeContext.trim();
    }
    return res.json({
      reply,
      isKnowledgeGap: false
    });
  }

  // Knowledge gap fallback
  return res.json({
    reply: "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে। আপনি চাইলে সরাসরি কথা বলতে WhatsApp বা Lead Form ব্যবহার করতে পারেন।",
    isKnowledgeGap: true
  });
});

// Dynamic SEO robots.txt endpoint
app.get('/robots.txt', (_req, res) => {
  try {
    const db = loadDatabase();
    const robots = db.siteSettings?.robots?.content;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (robots && robots.trim().length > 0) {
      return res.send(robots);
    }
  } catch (e) {}

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*

Sitemap: https://stwebads.com/sitemap.xml`);
});

// Dynamic XML Sitemap endpoint
app.get('/sitemap.xml', (_req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  try {
    const db = loadDatabase();
    const baseUrl = (db.siteSettings?.sitemap?.baseUrl || 'https://stwebads.com').replace(/\/$/, '');
    const customPages = Array.isArray(db.customPages) ? db.customPages.filter((p: any) => p.status === 'published') : [];
    const caseStudies = Array.isArray(db.caseStudies) ? db.caseStudies : [];

    let urlsXml = `  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/case-studies</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/media-gallery</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/tiktok-ads</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/facebook-ads</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;

    customPages.forEach((p: any) => {
      const slug = (p.slug || '').replace(/^\/+/, '');
      if (slug && !['services', 'case-studies', 'media-gallery', 'tiktok-ads', 'facebook-ads', 'contact'].includes(slug)) {
        urlsXml += `\n  <url>\n    <loc>${baseUrl}/${slug}</loc>\n    <lastmod>${p.updatedAt ? p.updatedAt.split('T')[0] : today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
      }
    });

    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlsXml}
</urlset>`);
  } catch (e) {
    return res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://stwebads.com/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://stwebads.com/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://stwebads.com/case-studies</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://stwebads.com/media-gallery</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>`);
  }
});

  // Vite middleware for development vs static asset serving for production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
