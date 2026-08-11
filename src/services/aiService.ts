import { storageService } from './storageService';
import { AIMessage, KnowledgeBaseItem } from '../types';

export interface AiChatRequest {
  message: string;
  conversationId: string;
  history?: Array<{ sender: 'user' | 'ai'; text: string }>;
}

export interface AiChatResponse {
  reply: string;
  suggestedCtas?: Array<{
    label: string;
    action: 'LEAD_FORM' | 'CALCULATOR' | 'WHATSAPP' | 'CASE_STUDIES';
    url?: string;
  }>;
  isKnowledgeGap?: boolean;
  sourceItemIds?: string[];
}

class AiService {
  /**
   * Evaluates if a query matches any published Knowledge Base item.
   */
  private findMatchingKnowledge(query: string): { matches: KnowledgeBaseItem[]; topMatch: KnowledgeBaseItem | null } {
    const published = storageService.getKnowledgeBase(true);
    const q = query.toLowerCase().trim();
    const queryWords = q.split(/\s+/).filter(w => w.length > 2);

    const scored = published.map(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const qLower = item.question.toLowerCase();
      const aLower = item.answer.toLowerCase();

      // Check keywords
      item.keywords.forEach(kw => {
        if (q.includes(kw.toLowerCase())) score += 5;
      });

      // Check words in title and question
      queryWords.forEach(word => {
        if (titleLower.includes(word)) score += 3;
        if (qLower.includes(word)) score += 4;
        if (aLower.includes(word)) score += 1;
      });

      // Priority boost
      score += (item.priority || 5) * 0.5;

      return { item, score };
    });

    const relevant = scored.filter(s => s.score >= 5).sort((a, b) => b.score - a.score);
    return {
      matches: relevant.map(r => r.item),
      topMatch: relevant.length > 0 ? relevant[0].item : null
    };
  }

  /**
   * Process user chat query with server-side Gemini API or Knowledge Base grounding.
   */
  public async sendMessage(req: AiChatRequest): Promise<AiChatResponse> {
    const aiSettings = storageService.getAISettings();
    const visitorId = storageService.getVisitorId();

    if (!aiSettings.enabled) {
      return {
        reply: "আমাদের এআই অ্যাসিস্ট্যান্ট সাময়িকভাবে অফলাইনে রয়েছে। সরাসরি কথা বলতে WhatsApp বাটনে ক্লিক করুন অথবা Lead Form পূরণ করুন।",
        suggestedCtas: [
          { label: "WhatsApp-এ কথা বলুন", action: "WHATSAPP" },
          { label: "Lead Form পূরণ করুন", action: "LEAD_FORM" }
        ]
      };
    }

    const { matches, topMatch } = this.findMatchingKnowledge(req.message);

    // Try calling server-side API endpoint `/api/ai/chat`
    try {
      const payload = {
        message: req.message,
        conversationId: req.conversationId,
        history: req.history,
        knowledgeContext: matches.map(m => `Q: ${m.question}\nA: ${m.answer}`).join('\n\n'),
        hasDirectKnowledge: !!topMatch,
        model: aiSettings.primaryModel || 'gemini-3.6-flash',
        temperature: aiSettings.temperature || 0.2
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply) {
          // Check if server indicated a knowledge gap
          if (data.isKnowledgeGap) {
            storageService.logKnowledgeGap(req.message, data.reply, visitorId);
          }
          return {
            reply: data.reply,
            suggestedCtas: data.suggestedCtas || this.getDefaultCtas(req.message),
            isKnowledgeGap: data.isKnowledgeGap,
            sourceItemIds: matches.map(m => m.id)
          };
        }
      }
    } catch (err) {
      // In case server API is offline or rate-limited, use safe client KB resolver
      console.warn('Server AI route fallback to client KB engine:', err);
    }

    // Client-side Safe Knowledge Engine (Strict anti-hallucination)
    if (topMatch) {
      const ctas = this.getDefaultCtas(req.message);
      return {
        reply: topMatch.answer,
        suggestedCtas: ctas,
        isKnowledgeGap: false,
        sourceItemIds: [topMatch.id]
      };
    } else {
      // Knowledge Gap Detected!
      const fallbackReply = "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে। আপনি চাইলে সরাসরি কথা বলতে WhatsApp বা Lead Form ব্যবহার করতে পারেন।";
      storageService.logKnowledgeGap(req.message, fallbackReply, visitorId);

      return {
        reply: fallbackReply,
        suggestedCtas: [
          { label: "Lead Form পূরণ করুন", action: "LEAD_FORM" },
          { label: "WhatsApp-এ কথা বলুন", action: "WHATSAPP" },
          { label: "Ads Prediction দেখুন", action: "CALCULATOR" }
        ],
        isKnowledgeGap: true
      };
    }
  }

  private getDefaultCtas(query: string): AiChatResponse['suggestedCtas'] {
    const q = query.toLowerCase();
    if (q.includes('budget') || q.includes('cost') || q.includes('খরচ') || q.includes('বাজেট') || q.includes('calculator') || q.includes('prediction')) {
      return [
        { label: "Ads Prediction Tool", action: "CALCULATOR" },
        { label: "Lead Form পূরণ করুন", action: "LEAD_FORM" }
      ];
    }
    if (q.includes('contact') || q.includes('phone') || q.includes('কথা') || q.includes('মেসেজ') || q.includes('whatsapp')) {
      return [
        { label: "WhatsApp-এ কথা বলুন", action: "WHATSAPP" },
        { label: "Lead Form পূরণ করুন", action: "LEAD_FORM" }
      ];
    }
    return [
      { label: "Lead Form পূরণ করুন", action: "LEAD_FORM" },
      { label: "Ads Prediction দেখুন", action: "CALCULATOR" },
      { label: "WhatsApp-এ কথা বলুন", action: "WHATSAPP" }
    ];
  }
}

export const aiService = new AiService();
