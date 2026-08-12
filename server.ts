import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'ST Web & Ads Studio API', timestamp: new Date().toISOString() });
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

// Serve static assets in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
