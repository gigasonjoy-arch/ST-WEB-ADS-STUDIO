import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
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
app.post('/api/db/sync', async (req, res) => {
  try {
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    // Capture and notify for newly synchronized leads
    if (payload.leads && Array.isArray(payload.leads)) {
      try {
        const existingDb = loadDatabase();
        const existingLeads = existingDb.leads || [];
        const existingLeadIds = new Set(existingLeads.map((l: any) => l.id));
        
        // Find new leads that are not currently in the server database
        const newIncomingLeads = payload.leads.filter((l: any) => l && l.id && !existingLeadIds.has(l.id));

        if (newIncomingLeads.length > 0) {
          console.log(`Detected ${newIncomingLeads.length} newly synced leads via bulk upload.`);
          
          const siteSettings = payload.siteSettings || existingDb.siteSettings || {};
          const webhookUrl = siteSettings.googleSheetsWebhookUrl || 'https://script.google.com/macros/s/AKfycbwr4L1q1u_GogxSImbBaskpydhFsvzenjmElRHqCq8Uv2Kdg_lJJ93-JNmvxxzsmanG/exec';
          const telegramToken = siteSettings.fallbackTelegramToken || '';
          const telegramChatId = siteSettings.fallbackTelegramChatId || '';
          const notificationEnabled = siteSettings.fallbackNotificationEnabled !== false;

          for (const lead of newIncomingLeads) {
            // Forward to Sheets Webhook
            if (webhookUrl) {
              fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(lead)
              }).catch(err => console.error('Error sending synced lead to Webhook:', err.message));
            }

            // Send Telegram message
            if (notificationEnabled && telegramToken && telegramChatId) {
              const messageText = `🔔 *New Synced Lead Captured!* (Offline Sync)\n\n👤 *Name:* ${lead.name}\n📞 *WhatsApp/Phone:* ${lead.whatsapp || lead.phone}\n💼 *Business Type:* ${lead.businessType || 'N/A'}\n💰 *Budget:* ${lead.monthlyBudget || 'N/A'}\n📝 *Notes:* ${lead.notes || 'N/A'}`;
              
              fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  chat_id: telegramChatId,
                  text: messageText,
                  parse_mode: 'Markdown'
                })
              }).catch(err => console.error('Error sending synced Telegram message:', err.message));
            }
          }
        }
      } catch (err: any) {
        console.warn('Sync notification hook failed:', err.message);
      }
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

// Real-time Lead Fallback Submission & Alerts
app.post('/api/leads/fallback', async (req, res) => {
  try {
    const lead = req.body;
    if (!lead || !lead.name) {
      return res.status(400).json({ success: false, error: 'Name and basic info are required' });
    }

    console.log('Received lead via fallback API:', lead.name, lead.whatsapp || lead.phone);

    // 1. Save lead to the server-side persistent database
    const db = loadDatabase();
    if (!db.leads) db.leads = [];
    
    // Check if duplicate lead exists
    const cleanPhone = (lead.whatsapp || lead.phone || '').replace(/\D/g, '');
    const existingIndex = db.leads.findIndex((l: any) => {
      if (l.id === lead.id) return true;
      const lPhone = (l.whatsapp || l.phone || '').replace(/\D/g, '');
      return cleanPhone && lPhone === cleanPhone;
    });

    if (existingIndex >= 0) {
      db.leads[existingIndex] = {
        ...db.leads[existingIndex],
        ...lead,
        lastActivity: new Date().toISOString()
      };
    } else {
      db.leads.unshift(lead);
    }
    
    saveDatabase(db);

    // 2. Fetch fallback configuration from database
    const siteSettings = db.siteSettings || {};
    const webhookUrl = siteSettings.googleSheetsWebhookUrl || 'https://script.google.com/macros/s/AKfycbwr4L1q1u_GogxSImbBaskpydhFsvzenjmElRHqCq8Uv2Kdg_lJJ93-JNmvxxzsmanG/exec';
    const telegramToken = siteSettings.fallbackTelegramToken || '';
    const telegramChatId = siteSettings.fallbackTelegramChatId || '';
    const notificationEmail = siteSettings.fallbackNotificationEmail || 'sanjoybhootfm@gmail.com';
    const notificationEnabled = siteSettings.fallbackNotificationEnabled !== false;

    let webhookSuccess = false;
    let telegramSuccess = false;

    // 3. Push to Google Sheets Webhook
    if (webhookUrl) {
      try {
        console.log('Forwarding lead to Sheets Webhook:', webhookUrl);
        const webhookResponse = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(lead)
        });
        webhookSuccess = webhookResponse.ok;
      } catch (err: any) {
        console.error('Failed to push to Google Sheets Webhook:', err.message);
      }
    }

    // 4. Send Telegram Bot Alert
    if (notificationEnabled && telegramToken && telegramChatId) {
      try {
        console.log('Sending Telegram alert to chat ID:', telegramChatId);
        const messageText = `🔔 *New Lead Captured!* (Fallback System)\n\n👤 *Name:* ${lead.name}\n📞 *WhatsApp/Phone:* ${lead.whatsapp || lead.phone}\n✉️ *Social/Link:* ${lead.socialLink || 'N/A'}\n💼 *Business Type:* ${lead.businessType || 'N/A'}\n💰 *Budget:* ${lead.monthlyBudget || 'N/A'}\n📝 *Notes:* ${lead.notes || 'N/A'}\n🌐 *Calculator Used:* ${lead.calculatorUsed ? 'Yes' : 'No'}\n📊 *Details:* ${lead.calculatorSummary || 'N/A'}`;
        
        const tgResponse = await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: messageText,
            parse_mode: 'Markdown'
          })
        });
        telegramSuccess = tgResponse.ok;
      } catch (err: any) {
        console.error('Failed to send Telegram notification:', err.message);
      }
    }

    res.json({
      success: true,
      message: 'Lead saved and fallback notifications triggered',
      webhookSynced: webhookSuccess,
      telegramNotified: telegramSuccess
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Autonomous grounded AI Chat endpoint with Gemini & Multi-Turn History
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, history, knowledgeContext } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Precise Language Intent Detection Function
    const determineLanguage = (msg: string): 'ENGLISH' | 'BENGALI' => {
      if (!msg) return 'BENGALI';
      const text = msg.trim();
      const lower = text.toLowerCase();

      // 1. Explicit request for Bangla/Bengali (in English or Banglish script)
      const isBanglaRequest = /bangla|banglai|banglay|bengali|বাংলা/i.test(lower) && 
        /answer|reply|koro|bol|bolo|likh|likhe|likho|please|pls|say|write|dao|dhao|dekhao|translate|in|speak|korus|bal|lekho/i.test(lower);
      const isBanglaExplicitPhrase = /banglai\s*likhe\s*dao|banglay\s*lekho|bangla\s*e\s*answer|bangla\s*e\s*bolo|bangla\s*e\s*likho|bangla\s*please|bengali\s*please/i.test(lower);

      if (isBanglaRequest || isBanglaExplicitPhrase) {
        return 'BENGALI';
      }

      // 2. Explicit request for English
      const isEnglishRequest = /english\s*(?:e|ingyeji|ingreji)?\s*(?:answer|reply|koro|bol|bolo|please|pls|say|write)|in\s*english|translate\s*to\s*english|speak\s*english|say\s*in\s*english/i.test(lower);
      if (isEnglishRequest) {
        return 'ENGLISH';
      }

      // 3. Bengali script presence
      if (/[\u0980-\u09FF]/.test(text)) {
        return 'BENGALI';
      }

      // 4. Banglish words trigger
      const banglishWords = /\b(kivabe|koto|dibo|lagbe|kemon|bhai|bhaiya|bolo|koro|dhao|dao|amar|amr|apnar|korbo|paobo|hobe|paba|dekhao|bolun|korun|ki|kemne|koba|pabo|taka|bdt|dorkar)\b/i;
      if (banglishWords.test(lower)) {
        return 'BENGALI';
      }

      // 5. English phrases or pure English script
      const englishKeywords = /\b(what|how|why|when|where|which|who|can|is|are|the|this|that|need|audit|budget|recommended|rule|rules|account|pixel|capi|tracking|setup|facebook|tiktok|ads|service|services|package|cost|management|case|study|agency|crm|store|lead|leads)\b/i;
      if (englishKeywords.test(lower) || /^[a-zA-Z0-9\s,?.!/+=_\-()'&]+$/.test(text)) {
        return 'ENGLISH';
      }

      return 'BENGALI';
    };

    const targetLang = determineLanguage(message);
    const isUserMessageEnglish = targetLang === 'ENGLISH';

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });
        
        const systemInstruction = `
You are "Sonjoy's AI Specialist", the official AI Performance Marketing Specialist & Assistant for Sonjoy Sarkar and ST Web & Ads Studio in Bangladesh.
Your goal is to provide accurate, helpful, professional, and conversational guidance to website visitors asking about TikTok Ads, Facebook Ads, campaign budgets, Pixel & CAPI tracking, case studies, ad account setup rules, and marketing management services.

CRITICAL MANDATORY LANGUAGE DIRECTIVE:
${isUserMessageEnglish 
  ? 'THE USER IS ASKING OR REQUESTING A RESPONSE IN ENGLISH ("' + message + '"). YOUR RESPONSE MUST BE 100% IN ENGLISH. DO NOT USE ANY BENGALI SCRIPT AT ALL. ANSWER COMPLETELY IN ENGLISH.' 
  : 'THE USER IS ASKING OR REQUESTING A RESPONSE IN BENGALI/BANGLISH ("' + message + '"). YOUR RESPONSE MUST BE 100% IN CLEAR, NATURAL BENGALI SCRIPT (বাংলায় উত্তর দিন). DO NOT OUTPUT ENGLISH PARAGRAPHS. WRITE YOUR ENTIRE RESPONSE IN BENGALI.'}

CRITICAL LANGUAGE & CONVERSATION RULES:
1. STRICT LANGUAGE MATCHING & TRANSLATION:
   - Always respond in the EXACT language requested or used by the user!
   - If the user says "banglai likhe dao", "bangla e answer koro", "banglay bolo", "bangla please", "bengali please", "translate to bengali", "banglay lekho", or asks in Bengali/Banglish:
     Inspect the conversation history carefully! Identify the VERY LAST response or topic discussed (e.g. TikTok Ads account setup rules, Pixel & CAPI tracking, TikTok Ads budget, Facebook Ads budget, etc.) and RE-EXPLAIN or TRANSLATE that exact topic into CLEAR, NATURAL BENGALI (বাংলায়)!
     NEVER answer in English when the user says "banglai likhe dao" or requests Bengali!
   - If the user says "english e answer koro", "in english", "english please", "reply in english", "translate to english", or asks in English:
     Inspect the conversation history carefully! Identify the VERY LAST response or topic discussed and RE-EXPLAIN or TRANSLATE that exact topic in 100% ENGLISH!
   - Always honor the user's explicit language request immediately!

2. RECOMMENDED CAMPAIGN BUDGETS (Bangladesh E-Commerce):
   - TikTok Ads Test Budget: $10 - $20 / day (approx ৳1,500 - ৳3,000 / day) or $150 - $300 / month.
   - TikTok Ads Scaling Budget: $20 - $50+ / day (৳3,000 - ৳7,500+ / day).
   - TikTok BD Benchmarks: Avg CPM ৳55 (Range ৳40-৳65), Avg CTR 2.0% (1.8-2.2%), Avg CVR 2.6% (2.3-3.0%), Avg CPA ৳106 (৳90-৳125 BDT) per order with UGC video ads.
   - Facebook Ads Test Budget: $15 - $30 / day (approx ৳2,250 - ৳4,500 / day).
   - Facebook BD Benchmarks: Avg CPM ৳215 (Range ৳180-৳250), Avg CPA ৳600 (৳350-৳900 BDT).
   - Category Budgets:
     * Fashion/Clothing: $150–$500/mo (৳22,500–৳75,000)
     * Cosmetics/Beauty: $200–$600/mo (৳30,000–৳90,000)
     * Gadgets/Tech: $100–$400/mo (৳15,000–৳60,000)

3. SERVICES & FEES:
   - Campaign Management Fee: ৳15,000 - ৳25,000 / month depending on spend scale.
   - One-time Pixel & CAPI Setup Fee: ৳5,000 - ৳8,000.
   - Includes: Business Manager setup, Pixel/CAPI event deduplication (PageView, ViewContent, AddToCart, InitiateCheckout, Purchase), UGC video script hooks, CBO scaling, weekly analytics.

4. CONSOLIDATED CASE STUDY AUDIT METRICS:
   - Audited 126 TikTok Ad Groups, ৳1,16,619 total spend, 3.66M impressions, 18,698 customer conversations at ৳6.24/conv, and 1,316 website leads at ৳88.61/lead.

5. CONVERSATIONAL LEAD CAPTURE:
   - Do NOT output or render HTML lead forms.
   - Encourage visitors to share their WhatsApp number so Sonjoy's team can send a personalized strategy audit.
   - If the user provides a WhatsApp/phone number, acknowledge it warmly and ask for their Name and Business Category if not yet provided.
   - If Name and WhatsApp Number are provided, confirm that their details have been registered for a free strategy consultation on WhatsApp.

6. DIRECT RELEVANCE:
   - Answer the question directly! Do NOT output generic introductions or bios unless explicitly asked "Who is Sonjoy?".
`;

        // Sanitize multi-turn conversation history to ensure strictly alternating user and model roles for Gemini API
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          history.slice(-12).forEach((item: any) => {
            if (item.text && item.sender) {
              const role = item.sender === 'user' ? 'user' : 'model';
              if (contents.length > 0 && contents[contents.length - 1].role === role) {
                contents[contents.length - 1].parts[0].text += '\n' + item.text;
              } else {
                contents.push({
                  role,
                  parts: [{ text: item.text }]
                });
              }
            }
          });
        }

        // Add the current user query, combining if the last turn was also user
        if (contents.length > 0 && contents[contents.length - 1].role === 'user') {
          contents[contents.length - 1].parts[0].text += '\n' + message;
        } else {
          contents.push({
            role: 'user',
            parts: [{ text: message }]
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3.6-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.3
          }
        });

        const reply = response.text || '';
        if (reply.trim().length > 0) {
          return res.json({
            reply: reply.trim(),
            isKnowledgeGap: false,
            source: 'gemini'
          });
        }
      } catch (geminiErr: any) {
        console.warn('Gemini chat API call failed, falling back:', geminiErr?.message || geminiErr);
      }
    }

    // Fallback if no API key or Gemini error
    if (knowledgeContext && knowledgeContext.trim().length > 0) {
      const parts = knowledgeContext.split(/A:\s*/g);
      let reply = "";
      if (parts.length > 1) {
        reply = parts[1].split(/\n\nQ:/g)[0].trim();
      } else {
        reply = knowledgeContext.trim();
      }
      return res.json({ reply, isKnowledgeGap: false, source: 'grounded' });
    }

    return res.json({
      reply: "আমাদের সার্ভিস, টিকটক বা ফেসবুক অ্যাডস বাজেট সংক্রান্ত আপনার প্রশ্নের বিস্তারিত তথ্য পাওয়ার জন্য সরাসরি WhatsApp-এ যোগাযোগ করতে পারেন অথবা Lead Form পূরণ করে ফ্রি অডিট নিতে পারেন।",
      isKnowledgeGap: true,
      source: 'fallback'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Internal AI chat error' });
  }
});

// Dynamic SEO robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  try {
    const db = loadDatabase();
    const robots = db.siteSettings?.robots?.content;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    if (robots && robots.trim().length > 0) {
      return res.send(robots);
    }
  } catch (e) {}

  const host = req.get('host') || 'sonjoysarkar.netlify.app';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' || host.includes('netlify.app') ? 'https' : 'http';
  const siteUrl = `${protocol}://${host}`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin/*

Sitemap: https://sonjoysarkar.netlify.app/sitemap.xml`);
});

// Dynamic XML Sitemap endpoint
app.get('/sitemap.xml', (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  
  try {
    const db = loadDatabase();
    let baseUrl = (db.siteSettings?.sitemap?.baseUrl || '').replace(/\/$/, '');
    if (!baseUrl || baseUrl === 'https://stwebads.com') {
      baseUrl = 'https://sonjoysarkar.netlify.app';
    }
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
  </url>
  <url>
    <loc>${baseUrl}/privacy-policy</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`;

    customPages.forEach((p: any) => {
      const slug = (p.slug || '').replace(/^\/+/, '');
      if (slug && !['services', 'case-studies', 'media-gallery', 'tiktok-ads', 'facebook-ads', 'contact', 'privacy-policy', 'terms'].includes(slug)) {
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
    <loc>https://sonjoysarkar.netlify.app/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://sonjoysarkar.netlify.app/services</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sonjoysarkar.netlify.app/case-studies</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://sonjoysarkar.netlify.app/media-gallery</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sonjoysarkar.netlify.app/tiktok-ads</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sonjoysarkar.netlify.app/facebook-ads</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://sonjoysarkar.netlify.app/contact</loc>
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
