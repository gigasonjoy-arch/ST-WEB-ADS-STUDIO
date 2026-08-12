import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

function apiPlugin() {
  return {
    name: 'api-server-middleware',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (req.url === '/api/health' && req.method === 'GET') {
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ status: 'ok', service: 'ST Web & Ads Studio API' }));
        }

        if (req.url === '/api/ai/chat' && req.method === 'POST') {
          let body = '';
          req.on('data', (chunk: any) => { body += chunk; });
          req.on('end', async () => {
            let data: any = {};
            try {
              data = JSON.parse(body || '{}');
            } catch {
              data = {};
            }

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
          });
          return;
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
