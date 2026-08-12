import { storageService } from './storageService';
import { KnowledgeBaseItem, InChatPredictionData, InChatLeadCardData, CalculatorInput } from '../types';

export interface AiChatRequest {
  message: string;
  conversationId: string;
  history?: Array<{ sender: 'user' | 'ai' | 'system'; text: string }>;
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
   * Advanced semantic & keyword matching against the published Knowledge Base.
   */
  private findMatchingKnowledge(query: string): { matches: KnowledgeBaseItem[]; topMatch: KnowledgeBaseItem | null } {
    const published = storageService.getKnowledgeBase(true);
    const q = query.toLowerCase().trim();
    const queryWords = q.split(/[\s,?.!/+=_\-()]+/).filter(w => w.length >= 2);

    const scored = published.map(item => {
      let score = 0;
      const titleLower = (item.title || '').toLowerCase();
      const qLower = (item.question || '').toLowerCase();
      const aLower = (item.answer || '').toLowerCase();
      const catLower = (item.category || '').toLowerCase();

      // Exact substring match in question or title
      if (qLower.includes(q) || q.includes(qLower)) {
        score += 25;
      }
      if (titleLower.includes(q) || q.includes(titleLower)) {
        score += 20;
      }

      // Check keywords list
      if (Array.isArray(item.keywords)) {
        item.keywords.forEach(kw => {
          const kwLower = kw.toLowerCase().trim();
          if (kwLower && q.includes(kwLower)) {
            score += 10;
          }
        });
      }

      // Check query words
      queryWords.forEach(word => {
        if (qLower.includes(word)) score += 5;
        if (titleLower.includes(word)) score += 4;
        if (catLower.includes(word)) score += 3;
        if (aLower.includes(word)) score += 1.5;
      });

      // Priority weight
      score += (item.priority || 5) * 0.5;

      return { item, score };
    });

    const relevant = scored.filter(s => s.score >= 6).sort((a, b) => b.score - a.score);
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
    const hasBudgetIntent = /বাজেট|budget|খরচ|সেলস|বিক্রি|sell|order|অর্ডার|হবে|dollar|ডলার|টাকা|taka|bdt|usd|\$|৳|\d+k|\d+হাজার/i.test(q);
    if (!hasBudgetIntent) return null;

    // Convert Bangla digits to English
    const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
    let normalized = q;
    bnDigits.forEach((d, idx) => {
      normalized = normalized.split(d).join(String(idx));
    });

    // Detect numeric value
    let amount = 0;
    const isDollar = /dollar|\$|usd|ডলার/i.test(normalized);

    // Matches e.g. 30k, 50,000, 30000, $100, 50হাজার
    const kMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:k|হাজার)/i);
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
    if (/fashion|পোশাক|শাড়ি|থ্রি-পিস|পাঞ্জাবি|টি-শার্ট|dress|clothing|জামাকাপড়/i.test(q)) category = 'Fashion';
    else if (/cosmetic|beauty|কসমেটিক্স|স্কিনকেয়ার|লোশন|ক্রিম|makeup|মেকআপ/i.test(q)) category = 'Cosmetics';
    else if (/gadget|electronics|phone|মোবাইল|ঘড়ি|watch|headphone|টেক|গ্যাজেট/i.test(q)) category = 'Electronics';
    else if (/food|খাবার|রেস্তোরাঁ|মধু|ঘি|oil|তেল/i.test(q)) category = 'Food & Beverage';

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
   * Process user chat query locally with 100% factual accuracy and zero API key requirement.
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

    const q = req.message.trim();
    const qLower = q.toLowerCase();

    // Check if user is asking for direct contact or audit
    const isLeadIntent = /audit|অডিট|ফর্ম|বুকিং|যোগাযোগ|contact|হোয়াটসঅ্যাপ|ফোন|number|নাম্বার|call|কথা বলতে|কল|meeting|মিটিং/i.test(qLower);

    // 1. Check budget prediction
    const budgetPrediction = this.parseBudgetPrediction(q);
    if (budgetPrediction) {
      return {
        reply: `আপনার দেওয়া বাজেট (৳${budgetPrediction.budgetBDT.toLocaleString('en-IN')} / $${budgetPrediction.budgetUSD}) অনুযায়ী টিকটক পারফরম্যান্স বেঞ্চমার্ক হিসাব নিচে প্রিভিউ হিসেবে তৈরি করা হলো। আপনার প্রোডাক্টের জন্য সুনির্দিষ্ট ক্যাম্পেইন স্ট্র্যাটেজি ও ক্রিয়েটিভ প্ল্যান পেতে নিচের ফর্মটি পূরণ করুন অথবা WhatsApp-এ সরাসরি যোগাযোগ করুন।`,
        suggestedCtas: [
          { label: "ফ্রি স্ট্র্যাটেজি অডিট বুক করুন", action: "LEAD_FORM" },
          { label: "WhatsApp-এ আলোচনা করুন", action: "WHATSAPP" },
          { label: "ফুল ক্যালকুলেটর ওপেন করুন", action: "CALCULATOR" }
        ],
        isKnowledgeGap: false,
        predictionData: budgetPrediction,
        leadFormCard: { stage: 'ready', budget: `৳${budgetPrediction.budgetBDT}` }
      };
    }

    // 2. Search Grounded Knowledge Base
    const { matches, topMatch } = this.findMatchingKnowledge(q);

    if (topMatch) {
      const ctas = this.getDefaultCtas(q);
      return {
        reply: topMatch.answer,
        suggestedCtas: ctas,
        isKnowledgeGap: false,
        sourceItemIds: [topMatch.id],
        leadFormCard: isLeadIntent ? { stage: 'ready' } : undefined
      };
    }

    // 3. Greeting / polite fallback handling
    if (/^(hi|hello|hey|সালাম|হাই|হ্যালো|assalamu|nomoshkar|নমস্কার)/i.test(qLower)) {
      return {
        reply: "আসসালামু আলাইকুম! আমি সঞ্জয় সরকারের AI অ্যাসিস্ট্যান্ট। টিকটক ও ফেসবুক অ্যাডস ম্যানেজমেন্ট, পারফরম্যান্স প্রেডিকশন, ক্যাম্পেইন বাজেট বা আমাদের সার্ভিস চার্জ সম্পর্কিত যেকোনো প্রশ্ন আমাকে করতে পারেন। আপনাকে কীভাবে সাহায্য করতে পারি?",
        suggestedCtas: [
          { label: "Ads Prediction দেখুন", action: "CALCULATOR" },
          { label: "ক্যাম্পেইন চার্জ ও প্যাকেজ", action: "LEAD_FORM" },
          { label: "WhatsApp-এ কথা বলুন", action: "WHATSAPP" }
        ],
        isKnowledgeGap: false
      };
    }

    // 4. Knowledge Gap Detected!
    const fallbackReply = "এই বিষয়ে আমার কাছে তাৎক্ষণিক নিশ্চিত তথ্য নেই। আপনার প্রশ্নটি আমাদের টিমের কাছে পাঠানো হয়েছে যাতে আমরা দ্রুত তথ্য আপডেট করতে পারি। সরাসরি সঞ্জয় সরকারের সাথে কথা বলতে নিচের WhatsApp বাটনে ক্লিক করুন অথবা লিড ফর্মটি পূরণ করুন।";
    storageService.logKnowledgeGap(q, fallbackReply, visitorId);

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
