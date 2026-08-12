import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { 
  loadDatabase, 
  saveDatabase, 
  getCollection, 
  upsertCollectionItem, 
  deleteCollectionItem, 
  runServerCrudTest,
  getInitialDatabaseDefaults 
} from './server/onlineDb';

dotenv.config();

function parseJsonBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve) => {
    let body = '';
    let isResolved = false;

    const safeResolve = (val: any) => {
      if (!isResolved) {
        isResolved = true;
        resolve(val);
      }
    };

    const timeout = setTimeout(() => {
      safeResolve({});
    }, 5000);

    req.on('data', (chunk: any) => {
      body += chunk;
      if (body.length > 50 * 1024 * 1024) {
        clearTimeout(timeout);
        safeResolve({});
      }
    });

    req.on('end', () => {
      clearTimeout(timeout);
      try {
        safeResolve(JSON.parse(body || '{}'));
      } catch {
        safeResolve({});
      }
    });

    req.on('error', () => {
      clearTimeout(timeout);
      safeResolve({});
    });
  });
}

function apiPlugin() {
  return {
    name: 'api-server-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const rawUrl = req.url || '';
        const url = rawUrl.split('?')[0];
        const method = req.method || 'GET';

        // Health check
        if (url === '/api/health' && method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ status: 'ok', service: 'ST Web & Ads Studio API' }));
        }

        // DB Health
        if (url === '/api/db/health' && method === 'GET') {
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

            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              status: 'online',
              connected: true,
              engine: 'Cloud Server Persistent JSON Storage',
              storagePath: '/data/online_db.json',
              totalCollections: Object.keys(collectionsCount).length,
              totalRecords,
              collections: collectionsCount,
              lastUpdated: db._lastUpdated || new Date().toISOString()
            }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ status: 'error', connected: false, error: err.message }));
          }
        }

        // DB Get All
        if (url === '/api/db/all' && method === 'GET') {
          try {
            const db = loadDatabase();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, data: db }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // DB Sync / Batch Update
        if (url === '/api/db/sync' && method === 'POST') {
          const body = await parseJsonBody(req);
          try {
            const updated = saveDatabase(body);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, message: 'Online database synchronized successfully', lastUpdated: updated._lastUpdated }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // DB CRUD Test
        if (url === '/api/db/test-crud' && method === 'POST') {
          try {
            const result = await runServerCrudTest();
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(result));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // DB Reset
        if (url === '/api/db/reset' && method === 'POST') {
          try {
            const defaults = getInitialDatabaseDefaults();
            saveDatabase(defaults);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, message: 'Database reset to initial defaults successfully' }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // DB Backup
        if (url === '/api/db/backup' && method === 'GET') {
          try {
            const db = loadDatabase();
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=stweb_online_backup_${Date.now()}.json`);
            return res.end(JSON.stringify(db, null, 2));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // DB Restore
        if (url === '/api/db/restore' && method === 'POST') {
          const body = await parseJsonBody(req);
          try {
            const updated = saveDatabase(body);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, message: 'Database restored successfully', lastUpdated: updated._lastUpdated }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: false, error: err.message }));
          }
        }

        // Collection endpoints: /api/db/collection/:name
        if (url.startsWith('/api/db/collection/')) {
          const pathParts = url.replace('/api/db/collection/', '').split('?')[0].split('/');
          const collectionName = pathParts[0];
          const itemId = pathParts[1];

          if (method === 'GET' && collectionName && !itemId) {
            const data = getCollection(collectionName);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, collection: collectionName, data }));
          }

          if (method === 'POST' && collectionName && !itemId) {
            const body = await parseJsonBody(req);
            const data = upsertCollectionItem(collectionName, body);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, data }));
          }

          if (method === 'PUT' && collectionName && itemId) {
            const body = await parseJsonBody(req);
            const data = upsertCollectionItem(collectionName, { ...body, id: itemId });
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: true, data }));
          }

          if (method === 'DELETE' && collectionName && itemId) {
            const deleted = deleteCollectionItem(collectionName, itemId);
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ success: deleted, message: deleted ? 'Deleted' : 'Not found' }));
          }
        }

        // AI Chat
        if (url === '/api/ai/chat' && method === 'POST') {
          const data = await parseJsonBody(req);
          const { message, knowledgeContext } = data;

          if (!message) {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({ error: 'Message is required' }));
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
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify({
              reply,
              isKnowledgeGap: false
            }));
          }

          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({
            reply: "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে। সরাসরি আলোচনা করতে WhatsApp ব্যবহার করতে পারেন।",
            isKnowledgeGap: true
          }));
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
  };
});

