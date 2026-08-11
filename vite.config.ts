import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

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
            try {
              const data = JSON.parse(body || '{}');
              const { message, knowledgeContext, hasDirectKnowledge, model = 'gemini-3.6-flash', temperature = 0.2 } = data;

              if (!message) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({ error: 'Message is required' }));
              }

              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.setHeader('Content-Type', 'application/json');
                return res.end(JSON.stringify({
                  reply: knowledgeContext 
                    ? `আমাদের নলেজ বেস অনুযায়ী:\n\n${knowledgeContext}`
                    : "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে।",
                  isKnowledgeGap: !knowledgeContext
                }));
              }

              const ai = new GoogleGenAI({
                apiKey,
                httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
              });

              const prompt = `You are the official AI assistant for Sonjoy Sarkar and ST Web & Ads Studio (TikTok and Facebook Ads specialist in Bangladesh).

KNOWLEDGE BASE CONTEXT:
${knowledgeContext || "NO DIRECT KNOWLEDGE FOUND"}

USER QUERY:
${message}

STRICT INSTRUCTIONS:
1. Answer the user in natural, polite Bangla (mixing natural English marketing terms like TikTok Ads, ROAS, Pixel, CPA, UGC).
2. ONLY state facts present in the Knowledge Base Context above.
3. NEVER make up guarantees, prices, client numbers, or fake statistics.
4. If the Knowledge Base Context does NOT contain the answer, respond EXACTLY:
"এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে।"
5. Keep the response concise and helpful (2-4 sentences max), and conclude with an invitation to submit the Lead Form, use the Ads Prediction Calculator, or message on WhatsApp.`;

              const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: { temperature: Math.min(Math.max(temperature, 0), 1) }
              });

              const reply = response.text || "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে।";
              const isGap = reply.includes("পর্যাপ্ত তথ্য নেই");

              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ reply, isKnowledgeGap: isGap }));
            } catch (err) {
              console.error('Vite dev API error:', err);
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({
                reply: "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে। সরাসরি আলোচনা করতে WhatsApp ব্যবহার করতে পারেন।",
                isKnowledgeGap: true
              }));
            }
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
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
