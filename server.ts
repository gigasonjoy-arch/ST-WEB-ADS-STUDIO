import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google GenAI client lazily & safely
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ST Web & Ads Studio API', timestamp: new Date().toISOString() });
});

// Server-side AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, knowledgeContext, hasDirectKnowledge, model = 'gemini-3.6-flash', temperature = 0.2 } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If there is no knowledge context and client flagged no direct knowledge:
  if (!hasDirectKnowledge && (!knowledgeContext || knowledgeContext.trim().length === 0)) {
    return res.json({
      reply: "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে। আপনি চাইলে সরাসরি কথা বলতে WhatsApp বা Lead Form ব্যবহার করতে পারেন।",
      isKnowledgeGap: true
    });
  }

  const ai = getGenAI();
  if (!ai) {
    // Clean, instant grounded response when operating in standalone mode (no API key needed)
    let cleanReply = "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে। সরাসরি আলোচনা করতে Lead Form বা WhatsApp ব্যবহার করতে পারেন।";
    if (knowledgeContext && knowledgeContext.trim().length > 0) {
      // Extract answer parts cleanly
      const answers = knowledgeContext
        .split(/Q:/g)
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((chunk: string) => {
          const parts = chunk.split(/A:/g);
          return parts.length > 1 ? parts[1].trim() : chunk.trim();
        });
      
      if (answers.length > 0) {
        cleanReply = answers[0];
      }
    }

    return res.json({
      reply: cleanReply,
      isKnowledgeGap: !hasDirectKnowledge && (!knowledgeContext || knowledgeContext.trim().length === 0)
    });
  }

  try {
    const prompt = `You are the official AI assistant for Sonjoy Sarkar and ST Web & Ads Studio (TikTok and Facebook Ads specialist in Bangladesh).

KNOWLEDGE BASE CONTEXT:
${knowledgeContext || "NO DIRECT KNOWLEDGE FOUND"}

USER QUERY:
${message}

STRICT INSTRUCTIONS:
1. Answer the user in natural, friendly, polite Bangla (mixing common English ad terms like TikTok Ads, ROAS, Pixel, CPA, UGC where natural).
2. ONLY state facts present in the Knowledge Base Context above.
3. NEVER make up guarantees, prices, client numbers, or fake statistics.
4. If the Knowledge Base Context does NOT contain the answer, respond EXACTLY:
"এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে।"
5. Keep the response concise and helpful (2-4 sentences max), and conclude with an invitation to submit the Lead Form, use the Ads Prediction Calculator, or message on WhatsApp.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: Math.min(Math.max(temperature, 0), 1),
      }
    });

    const reply = response.text || "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে।";
    const isGap = reply.includes("পর্যাপ্ত তথ্য নেই");

    return res.json({
      reply,
      isKnowledgeGap: isGap
    });
  } catch (err: any) {
    console.warn('Gemini API notice - serving direct grounded response:', err?.message || err);
    let fallbackReply = "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে। সরাসরি আলোচনা করতে WhatsApp ব্যবহার করতে পারেন।";
    if (knowledgeContext && knowledgeContext.trim().length > 0) {
      const parts = knowledgeContext.split(/A:/g);
      if (parts.length > 1) {
        fallbackReply = parts[1].split(/Q:/g)[0].trim();
      }
    }
    return res.json({
      reply: fallbackReply,
      isKnowledgeGap: !knowledgeContext || knowledgeContext.trim().length === 0
    });
  }
});

// Serve static assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
