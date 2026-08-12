import { storageService } from './storageService';
import { AIMessage, KnowledgeBaseItem, InChatPredictionData, InChatLeadCardData, CalculatorInput } from '../types';

export interface AiChatRequest {
  message: string;
  conversationId: string;
  history?: Array<{ sender: 'user' | 'ai'; text: string }>;
}

export interface AiChatResponse {
  reply: string;
  suggestedCtas?: Array<{
    label: string;
    action: 'LEAD_FORM' | 'CALCULATOR' | 'WHATSAPP' | 'CASE_STUDIES' | 'IN_CHAT_LEAD';
    url?: string;
  }>;
  isKnowledgeGap?: boolean;
  sourceItemIds?: string[];
  predictionData?: InChatPredictionData;
  leadFormCard?: InChatLeadCardData;
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
   * Helper to detect and extract numbers for budget calculation from natural language queries.
   */
  public parseBudgetPrediction(query: string): InChatPredictionData | null {
    const q = query.toLowerCase();
    const hasBudgetIntent = /বাজেট|budget|খরচ|সেলস|বিক্রি|sell|order|অর্ডার|হবে|dollar|ডলার|টাকা|taka|bdt|usd|\$|৳|\d+k/i.test(q);
    if (!hasBudgetIntent) return null;

    // Convert Bangla digits to English
    const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    let normalized = q;
    bnDigits.forEach((d, idx) => {
      normalized = normalized.split(d).join(String(idx));
    });

    // Detect numeric value
    let amount = 0;
    let isDollar = /dollar|\$|usd|ডলার/i.test(normalized);

    // Matches e.g. 30k, 50,000, 30000, $100
    const kMatch = normalized.match(/(\d+(?:\.\d+)?)\s*k/i);
    const numMatch = normalized.match(/(\d[\d,.]*)/);

    if (kMatch) {
      amount = parseFloat(kMatch[1]) * 1000;
    } else if (numMatch) {
      const cleanNum = numMatch[1].replace(/,/g, '');
      const parsed = parseFloat(cleanNum);
      if (parsed > 0) amount = parsed;
    }

    if (amount <= 0) return null;

    // Determine exchange rate
    const settings = storageService.getSiteSettings();
    const rate = settings.exchangeRateUsdToBdt || 150;

    let budgetUSD = 0;
    let budgetBDT = 0;

    if (isDollar || amount <= 1000) {
      budgetUSD = Math.max(5, amount);
      budgetBDT = Math.round(budgetUSD * rate);
    } else {
      budgetBDT = Math.max(500, amount);
      budgetUSD = Math.round(budgetBDT / rate);
    }

    // Detect category
    let category = 'E-commerce';
    if (/fashion|পোশাক|শাড়ি|থ্রি-পিস|পাঞ্জাবি|টি-শার্ট|dress|clothing/i.test(q)) category = 'Fashion';
    else if (/cosmetic|beauty|কসমেটিক্স|স্কিনকেয়ার|লোশন|ক্রিম|makeup/i.test(q)) category = 'Cosmetics';
    else if (/gadget|electronics|phone|মোবাইল|ঘড়ি|watch|headphone|টেক/i.test(q)) category = 'Electronics';
    else if (/food|খাবার|রেস্তোরাঁ|মধু|ঘি|oil/i.test(q)) category = 'Food & Beverage';

    const input: CalculatorInput = {
      productCategory: category,
      productPriceBDT: category === 'Fashion' ? 1450 : category === 'Cosmetics' ? 950 : category === 'Electronics' ? 2200 : 1200,
      creativeType: 'UGC',
      adBudgetUSD: budgetUSD,
      location: 'All Bangladesh',
      platform: 'TikTok',
      conversionGoal: 'Purchase'
    };

    try {
      const prediction = storageService.calculatePrediction(input);
      const tt = prediction.tiktok;
      if (!tt) return null;

      return {
        budgetBDT,
        budgetUSD,
        category,
        platform: 'TikTok',
        impressions: tt.estimatedImpressions.formatted,
        reach: tt.estimatedReach.formatted,
        clicks: tt.estimatedClicks.formatted,
        estimatedResults: tt.estimatedResults.formatted,
        resultLabel: 'Est. Purchases',
        estimatedRoas: tt.estimatedRoas.formatted,
        avgCpa: tt.estimatedCostPerResult.formatted,
        verdict: `৳${budgetBDT.toLocaleString('en-IN')} ($${budgetUSD}) টেস্ট বাজেটে TikTok UGC ভিডিও ব্যবহার করলে আনুমানিক ${tt.estimatedResults.formatted} টি অর্ডার এবং ${tt.estimatedRoas.formatted} ROAS পাওয়া সম্ভব।`
      };
    } catch {
      return null;
    }
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

    // Check if query is asking for budget calculation
    const budgetPrediction = this.parseBudgetPrediction(req.message);

    // Check if query asks for audit, phone/contact, or booking
    const qLower = req.message.toLowerCase();
    const isLeadIntent = /audit|অডিট|ফর্ম|বুকিং|যোগাযোগ|contact|হোয়াটসঅ্যাপ|ফোন|number|number|call|কথা বলতে/i.test(qLower);

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
          if (data.isKnowledgeGap) {
            storageService.logKnowledgeGap(req.message, data.reply, visitorId);
          }
          return {
            reply: data.reply,
            suggestedCtas: data.suggestedCtas || this.getDefaultCtas(req.message),
            isKnowledgeGap: data.isKnowledgeGap,
            sourceItemIds: matches.map(m => m.id),
            predictionData: budgetPrediction || undefined,
            leadFormCard: isLeadIntent ? { stage: 'ready' } : undefined
          };
        }
      }
    } catch (err) {
      console.warn('Server AI route fallback to client KB engine:', err);
    }

    // Client-side Safe Knowledge Engine
    if (budgetPrediction) {
      return {
        reply: `আপনার দেওয়া বাজেট (৳${budgetPrediction.budgetBDT.toLocaleString('en-IN')} / $${budgetPrediction.budgetUSD}) অনুযায়ী টিকটক পারফরম্যান্স বেঞ্চমার্ক হিসাব নিচে প্রিভিউ হিসেবে তৈরি করা হলো। আপনার প্রোডাক্টের জন্য সুনির্দিষ্ট স্ট্র্যাটেজি পেতে নিচের ফর্মটি পূরণ করতে পারেন।`,
        suggestedCtas: [
          { label: "স্ট্র্যাটেজি অডিট বুক করুন", action: "LEAD_FORM" },
          { label: "WhatsApp-এ আলোচনা", action: "WHATSAPP" },
          { label: "ফুল ক্যালকুলেটর ওপেন করুন", action: "CALCULATOR" }
        ],
        isKnowledgeGap: false,
        predictionData: budgetPrediction,
        leadFormCard: { stage: 'ready', budget: `৳${budgetPrediction.budgetBDT}` }
      };
    }

    if (topMatch) {
      const ctas = this.getDefaultCtas(req.message);
      return {
        reply: topMatch.answer,
        suggestedCtas: ctas,
        isKnowledgeGap: false,
        sourceItemIds: [topMatch.id],
        leadFormCard: isLeadIntent ? { stage: 'ready' } : undefined
      };
    } else {
      // Knowledge Gap Detected!
      const fallbackReply = "এই বিষয়ে আমার কাছে পর্যাপ্ত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে। আপনি চাইলে সরাসরি কথা বলতে WhatsApp বা নিচের লিড কার্ডে তথ্য দিতে পারেন।";
      storageService.logKnowledgeGap(req.message, fallbackReply, visitorId);

      return {
        reply: fallbackReply,
        suggestedCtas: [
          { label: "Lead Form পূরণ করুন", action: "LEAD_FORM" },
          { label: "WhatsApp-এ কথা বলুন", action: "WHATSAPP" },
          { label: "Ads Prediction দেখুন", action: "CALCULATOR" }
        ],
        isKnowledgeGap: true,
        leadFormCard: { stage: 'ready' }
      };
    }
  }

  private getDefaultCtas(query: string): AiChatResponse['suggestedCtas'] {
    const q = query.toLowerCase();
    if (q.includes('budget') || q.includes('cost') || q.includes('খরচ') || q.includes('বাজেট') || q.includes('calculator') || q.includes('prediction')) {
      return [
        { label: "Ads Prediction Tool", action: "CALCULATOR" },
        { label: "Lead Form পূরণ করুন", action: "LEAD_FORM" },
        { label: "WhatsApp-এ কথা বলুন", action: "WHATSAPP" }
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

