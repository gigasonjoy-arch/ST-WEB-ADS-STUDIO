import { storageService } from './storageService';
import { onlineDbClient } from './onlineDatabaseClient';
import { KnowledgeBaseItem, InChatPredictionData, CalculatorInput } from '../types';

export interface AiChatRequest {
  message: string;
  conversationId: string;
  history?: Array<{ sender: 'user' | 'ai' | 'system'; text: string }>;
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
  predictionData?: InChatPredictionData;
}

class AiService {
  /**
   * Robust detection whether user input should be treated as English
   */
  public isEnglishText(text: string): boolean {
    if (!text) return false;
    const trimmed = text.trim();
    const lower = trimmed.toLowerCase();

    // 1. Explicit request for Bangla/Bengali
    const isBanglaRequest = /bangla|banglai|banglay|bengali|বাংলা/i.test(lower) && 
      /answer|reply|koro|bol|bolo|likh|likhe|likho|please|pls|say|write|dao|dhao|dekhao|translate|in|speak|korus|bal|lekho/i.test(lower);
    const isBanglaExplicitPhrase = /banglai\s*likhe\s*dao|banglay\s*lekho|bangla\s*e\s*answer|bangla\s*e\s*bolo|bangla\s*e\s*likho|bangla\s*please|bengali\s*please/i.test(lower);

    if (isBanglaRequest || isBanglaExplicitPhrase || /[\u0980-\u09FF]/.test(trimmed)) {
      return false;
    }

    // 2. Explicit request for English
    const isEnglishRequest = /english\s*(?:e|ingyeji|ingreji)?\s*(?:answer|reply|koro|bol|bolo|please|pls|say|write)|in\s*english|translate\s*to\s*english|speak\s*english|say\s*in\s*english/i.test(lower);
    if (isEnglishRequest) {
      return true;
    }

    // 3. Banglish words trigger
    const banglishWords = /\b(kivabe|koto|dibo|lagbe|kemon|bhai|bhaiya|bolo|koro|dhao|dao|amar|amr|apnar|korbo|paobo|hobe|paba|dekhao|bolun|korun|ki|kemne|koba|pabo|taka|bdt|dorkar)\b/i;
    if (banglishWords.test(lower)) {
      return false;
    }

    // 4. Default to true if has English words or standard Latin script
    const englishKeywords = /\b(what|how|why|when|where|which|who|can|is|are|the|this|that|need|audit|budget|recommended|rule|rules|account|pixel|capi|tracking|setup|facebook|tiktok|ads|service|services|package|cost|management|case|study|agency|crm|store|lead|leads)\b/i;
    if (englishKeywords.test(lower) || /^[a-zA-Z0-9\s,?.!/+=_\-()'&]+$/.test(trimmed)) {
      return true;
    }

    return false;
  }

  /**
   * Helper to extract name from user message
   */
  private extractName(text: string): string | null {
    const t = text.trim();
    const namePatterns = [
      /(?:my name is|amr nam|nam|name|আমি|আমার নাম)\s*[:\-]?\s*([a-zA-Z\u0980-\u09FF\s]{2,25})/i,
      /([a-zA-Z\u0980-\u09FF]{2,15}(?:\s+[a-zA-Z\u0980-\u09FF]{2,15}){1,2})/
    ];
    
    for (const pat of namePatterns) {
      const m = t.match(pat);
      if (m && m[1]) {
        const candidate = m[1].trim();
        if (
          !/^\d+$/.test(candidate) && 
          candidate.length >= 2 && 
          !/budget|tiktok|facebook|audit|hi|hello|ke|kemon|01[3-9]|whatsapp/i.test(candidate)
        ) {
          return candidate;
        }
      }
    }
    return null;
  }

  /**
   * Helper to extract business category
   */
  private extractCategory(text: string): string {
    const q = text.toLowerCase();
    if (/fashion|clothing|পোশাক|শাড়ি|থ্রি-পিস|পাঞ্জাবি|টি-শার্ট|dress|জামাকাপড়/i.test(q)) return 'Fashion';
    if (/cosmetics|beauty|কসমেটিক্স|স্কিনকেয়ার|লোশন|ক্রিম|makeup|মেকআপ/i.test(q)) return 'Cosmetics';
    if (/gadget|electronics|phone|মোবাইল|ঘড়ি|watch|headphone|টেক|গ্যাজেট/i.test(q)) return 'Electronics';
    if (/food|খাবার|রেস্তোরাঁ|মধু|ঘি|oil|তেল/i.test(q)) return 'Food & Organic';
    if (/real estate|property|ফ্ল্যাট|জমি/i.test(q)) return 'Real Estate';
    if (/course|education|কোর্স|শিক্ষা/i.test(q)) return 'Education';
    return 'E-commerce';
  }

  /**
   * Advanced semantic & keyword matching against the published Knowledge Base.
   * Stop words are excluded and kb-1 (identity) is strictly guarded.
   */
  private findMatchingKnowledge(query: string): { matches: KnowledgeBaseItem[]; topMatch: KnowledgeBaseItem | null } {
    const published = storageService.getKnowledgeBase(true);
    const q = query.toLowerCase().trim();

    const stopWords = new Set([
      'what', 'is', 'the', 'for', 'are', 'how', 'why', 'and', 'does', 'do', 'with',
      'your', 'about', 'can', 'give', 'tell', 'me', 'want', 'need', 'please', 'a',
      'an', 'in', 'on', 'to', 'of', 'i', 'my', 'we', 'our', 'you', 'it', 'this', 'that'
    ]);

    const allWords = q.split(/[\s,?.!/+=_\-()]+/).filter(w => w.length >= 2);
    const keyWords = allWords.filter(w => !stopWords.has(w));

    // Special check for identity query
    const isExplicitIdentityQuery = /who\s*(?:is|are|r)\s*(?:sonjoy|sarkar|you|u)|tumi\s*ke|apni\s*ke|আপনি\s*কে|তুমি\s*কে|পরিচয়|about\s*sonjoy/i.test(q);

    const scored = published.map(item => {
      let score = 0;

      // Penalize kb-1 if not an explicit identity query
      if (item.id === 'kb-1' && !isExplicitIdentityQuery) {
        return { item, score: -100 };
      }

      const titleLower = (item.title || '').toLowerCase();
      const qLower = (item.question || '').toLowerCase();
      const aLower = (item.answer || '').toLowerCase();
      const catLower = (item.category || '').toLowerCase();

      // Title or Question exact substring match
      if (qLower.includes(q) || q.includes(qLower)) {
        score += 30;
      }
      if (titleLower.includes(q) || q.includes(titleLower)) {
        score += 25;
      }

      // Check keywords list
      if (Array.isArray(item.keywords)) {
        item.keywords.forEach(kw => {
          const kwLower = kw.toLowerCase().trim();
          if (kwLower && q.includes(kwLower)) {
            score += 15;
          }
        });
      }

      // Key words match against question, title, category, answer
      keyWords.forEach(word => {
        if (qLower.includes(word)) score += 10;
        if (titleLower.includes(word)) score += 8;
        if (catLower.includes(word)) score += 5;
        if (aLower.includes(word)) score += 1.5;
      });

      // Domain topic boost
      if (/budget|বাজেট|খরচ|cost|price|টাকা/i.test(q)) {
        if (/budget|বাজেট|খরচ|cost|price/i.test(titleLower + ' ' + qLower)) {
          score += 20;
        }
      }

      return { item, score };
    });

    const relevant = scored.filter(s => s.score >= 20).sort((a, b) => b.score - a.score);
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

    let amount = 0;
    const isDollar = /dollar|\$|usd|ডলার/i.test(normalized);

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

    const category = this.extractCategory(q);

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
   * Process user chat query with Gemini API integration + context-aware fallback.
   */
  public async sendMessage(req: AiChatRequest): Promise<AiChatResponse> {
    const aiSettings = storageService.getAISettings();
    const visitorId = storageService.getVisitorId();

    if (!aiSettings.enabled) {
      return {
        reply: "আমাদের এআই অ্যাসিস্ট্যান্ট সাময়িকভাবে অফলাইনে রয়েছে। সরাসরি কথা বলতে WhatsApp বাটনে ক্লিক করুন অথবা মেসেজে আপনার নম্বর লিখে দিন।",
        suggestedCtas: [
          { label: "WhatsApp-এ কথা বলুন", action: "WHATSAPP" }
        ]
      };
    }

    const q = req.message.trim();
    const qLower = q.toLowerCase();
    const isEnglish = this.isEnglishText(q);

    // 1. In-Chat Lead Extraction & Conversational Lead Collection
    const phoneRegex = /(?:(?:\+?88)?01[3-9]\d{8}|\b01[3-9]\d{8}\b|\b\d{10,11}\b)/;
    const phoneMatch = q.match(phoneRegex);
    const savedLeadInfo = storageService.getSavedLeadInfo();

    if (phoneMatch) {
      const foundPhone = phoneMatch[0];
      const extractedName = this.extractName(q);
      const extractedCat = this.extractCategory(q);
      const finalName = extractedName || savedLeadInfo?.name;

      if (finalName && finalName.length >= 2) {
        // Save Lead directly into storage & Firestore
        storageService.saveLead({
          id: 'LD-' + Date.now(),
          name: finalName,
          phone: foundPhone,
          businessType: extractedCat,
          interestedService: 'TIKTOK_ADS',
          monthlyBudget: '$150-$300',
          status: 'NEW',
          createdAt: new Date().toISOString(),
          notes: `Captured automatically via AI Chat. Session: ${req.conversationId}`
        });

        storageService.setSavedLeadInfo({
          name: finalName,
          whatsapp: foundPhone,
          location: 'Bangladesh'
        });

        return {
          reply: isEnglish
            ? `Thank you ${finalName}! Your name and WhatsApp number (${foundPhone}) have been successfully saved in our lead database. Our marketing team will connect with you shortly on WhatsApp to provide a custom strategy for your ${extractedCat} business!`
            : `ধন্যবাদ ${finalName}! আপনার নাম ও WhatsApp নম্বরটি (${foundPhone}) আমাদের লিড সিস্টেমে সফলভাবে সেভ করা হয়েছে। খুব শীঘ্রই আমাদের টিম আপনার ${extractedCat} ব্যবসার জন্য কাস্টম স্ট্র্যাটেজি প্ল্যান নিয়ে WhatsApp-এ যোগাযোগ করবে।`,
          suggestedCtas: [
            { label: isEnglish ? "View Ads Prediction" : "Ads Prediction দেখুন", action: "CALCULATOR" },
            { label: isEnglish ? "Direct WhatsApp" : "WhatsApp-এ কথা বলুন", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      } else {
        // Save phone number temporarily and request Name & Category
        storageService.setSavedLeadInfo({
          name: '',
          whatsapp: foundPhone,
          location: 'Bangladesh'
        });

        return {
          reply: isEnglish
            ? `Thank you! We received your WhatsApp number (${foundPhone}). To help Sonjoy Sarkar's team prepare your custom audit, please reply with your **Name** and **Business Category** (e.g., Tanvir - Fashion House).`
            : `ধন্যবাদ! আপনার WhatsApp নম্বরটি (${foundPhone}) পেয়েছি। আপনার জন্য সুনির্দিষ্ট ফ্রি স্ট্র্যাটেজি প্ল্যান তৈরি করতে অনুগ্রহ করে মেসেজে আপনার **নাম** এবং **ব্যবসা/প্রোডাক্ট ক্যাটাগরি** টি বলুন (যেমন: তানভীর - ফ্যাশন হাউজ)।`,
          suggestedCtas: [
            { label: isEnglish ? "Direct WhatsApp" : "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      }
    } else if (savedLeadInfo?.whatsapp && !savedLeadInfo?.name) {
      // User previously provided phone number, now answering with their Name
      const extractedName = this.extractName(q) || q.replace(/[^a-zA-Z\u0980-\u09FF\s]/g, '').trim();
      if (extractedName && extractedName.length >= 2) {
        const extractedCat = this.extractCategory(q);
        const phone = savedLeadInfo.whatsapp;

        storageService.saveLead({
          id: 'LD-' + Date.now(),
          name: extractedName,
          phone: phone,
          businessType: extractedCat,
          interestedService: 'TIKTOK_ADS',
          monthlyBudget: '$150-$300',
          status: 'NEW',
          createdAt: new Date().toISOString(),
          notes: `Captured automatically via AI Chat follow-up.`
        });

        storageService.setSavedLeadInfo({
          name: extractedName,
          whatsapp: phone,
          location: 'Bangladesh'
        });

        return {
          reply: isEnglish
            ? `Thank you ${extractedName}! Your name and WhatsApp number (${phone}) are now fully registered. Our team will reach out to you shortly!`
            : `ধন্যবাদ ${extractedName}! আপনার নাম ও WhatsApp নম্বরটি (${phone}) সফলভাবে লিড সিস্টেমে রেজিস্টার্ড হয়েছে। আমরা খুব শীঘ্রই আপনার ${extractedCat} ব্যবসার জন্য কাস্টম অডিট নিয়ে যোগাযোগ করব।`,
          suggestedCtas: [
            { label: isEnglish ? "View Ads Prediction" : "Ads Prediction দেখুন", action: "CALCULATOR" },
            { label: isEnglish ? "Direct WhatsApp" : "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      }
    }

    // 2. Primary Execution: Call server-side Gemini AI model with multi-turn history
    try {
      const serverRes = await fetch(onlineDbClient.getFullUrl('/api/ai/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: q,
          history: req.history || [],
          conversationId: req.conversationId
        })
      });

      if (serverRes.ok) {
        const data = await serverRes.json();
        if (data.reply && data.source === 'gemini') {
          return {
            reply: data.reply,
            suggestedCtas: this.getDefaultCtas(q),
            isKnowledgeGap: false
          };
        }
      }
    } catch (e) {
      console.warn('AI Server API fetch error, using local fallback engine:', e);
    }

    // 3. Local Fallback Engine (when Gemini API is unavailable or offline)
    let historyContext = '';
    let lastAiMsgText = '';
    if (Array.isArray(req.history) && req.history.length > 0) {
      const lastTurns = req.history.slice(-4);
      historyContext = lastTurns.map(m => m.text).join(' ').toLowerCase();
      const aiMsgs = req.history.filter(m => m.sender === 'ai' || (m as any).sender === 'model');
      if (aiMsgs.length > 0) {
        lastAiMsgText = aiMsgs[aiMsgs.length - 1].text.toLowerCase();
      }
    }

    // Language Switch Request Handler ("english e answer koro", "in english please")
    const isLanguageSwitchRequest = /english\s*(?:e|ingyeji|ingreji)?\s*(?:answer|reply|koro|bol|bolo|please|pls|say|write)|in\s*english|translate\s*to\s*english|speak\s*english|say\s*in\s*english/i.test(qLower);

    if (isLanguageSwitchRequest) {
      // Check last AI message or context topic
      if (lastAiMsgText.includes('pixel') || lastAiMsgText.includes('পিক্সেল') || lastAiMsgText.includes('capi') || lastAiMsgText.includes('ইভেন্ট') || lastAiMsgText.includes(' event') || lastAiMsgText.includes(' tracking')) {
        return {
          reply: `Without proper Pixel and Server-side CAPI event tracking, ad algorithms cannot identify high-intent buyers. By tracking ViewContent, AddToCart, InitiateCheckout, and Purchase events, you prevent wasted ad budget and maximize your ROAS through retargeting.`,
          suggestedCtas: [
            { label: "View Ads Prediction", action: "CALCULATOR" },
            { label: "Direct WhatsApp", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      } else if (lastAiMsgText.includes('tiktok') || lastAiMsgText.includes('টিকটক') || historyContext.includes('tiktok') || historyContext.includes('টিকটক')) {
        return {
          reply: `Here is the verified benchmark budget guide for TikTok Ads in Bangladesh:\n\n` +
            `📌 **Testing Phase (Recommended)**:\n` +
            `• **Daily Budget**: $10 – $20 / day (approx ৳1,500 – ৳3,000 / day)\n` +
            `• **Monthly Budget**: $150 – $300 / month (approx ৳22,500 – ৳45,000 / month)\n\n` +
            `📌 **Scaling Phase**:\n` +
            `• **Daily Budget**: $20 – $50+ / day (৳3,000 – ৳7,500+ / day)\n\n` +
            `📊 **Bangladesh TikTok Ads Benchmarks**:\n` +
            `• Average CPM: ৳40 – ৳65 (Avg ৳55)\n` +
            `• Average CTR: 1.8% – 2.2%\n` +
            `• Average CVR: 2.3% – 3.0%\n` +
            `• Average Cost per Order (CPA): ৳90 – ৳125 BDT with smartphone UGC video creatives.\n\n` +
            `Share your WhatsApp number here for a free custom audit!`,
          suggestedCtas: [
            { label: "View Ads Prediction", action: "CALCULATOR" },
            { label: "Direct WhatsApp", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      } else if (lastAiMsgText.includes('facebook') || lastAiMsgText.includes('ফেসবুক') || historyContext.includes('facebook') || historyContext.includes('ফেসবুক')) {
        return {
          reply: `Here is the benchmark budget guide for Facebook (Meta) Ads in Bangladesh:\n\n` +
            `📌 **Testing Phase**:\n` +
            `• **Daily Budget**: $15 – $30 / day (approx ৳2,250 – ৳4,500 / day)\n` +
            `• **Monthly Budget**: $200 – $500 / month (approx ৳30,000 – ৳75,000 / month)\n\n` +
            `📊 **Facebook Ads Benchmarks (Bangladesh)**:\n` +
            `• Average CPM: ৳180 – ৳250 (Avg ৳215)\n` +
            `• Average CPA (Cost Per Order): ৳350 – ৳900 BDT\n\n` +
            `Share your WhatsApp number here if you would like a custom campaign breakdown!`,
          suggestedCtas: [
            { label: "View Ads Prediction", action: "CALCULATOR" },
            { label: "Direct WhatsApp", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      } else {
        return {
          reply: `Sure! I am happy to answer your questions in English. What specific details would you like to know about TikTok Ads, Facebook Ads, Pixel tracking, or budget calculations?`,
          suggestedCtas: [
            { label: "View Ads Prediction", action: "CALCULATOR" },
            { label: "Direct WhatsApp", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      }
    }

    // Bangla Language Switch Request Handler ("banglai likhe dao", "bangla e answer koro")
    const isBanglaSwitchRequest = (/bangla|banglai|banglay|bengali|বাংলা/i.test(qLower) && 
      /answer|reply|koro|bol|bolo|likh|likhe|likho|please|pls|say|write|dao|dhao|dekhao|translate|in|speak|korus|bal|lekho/i.test(qLower)) ||
      qLower.includes('banglai likhe dao') || qLower.includes('banglay lekho');

    if (isBanglaSwitchRequest) {
      if (lastAiMsgText.includes('rule') || lastAiMsgText.includes('tiktok ads account') || lastAiMsgText.includes('requirement') || lastAiMsgText.includes('account setup') || lastAiMsgText.includes('spending cap')) {
        return {
          reply: `বাংলাদেশে টিকটক অ্যাড অ্যাকাউন্ট সেটআপের মূল শর্তাবলী নিচে দেওয়া হলো:\n\n` +
            `১. **অ্যাকাউন্ট টাইপ**: জিরো-ট্যাক্স সুবিধা ও স্পেন্ডিং ক্যাপ মুক্ত এজেন্সি অ্যাড অ্যাকাউন্ট।\n` +
            `২. **পেমেন্ট পদ্ধতি**: ডুয়াল কারেন্সি কার্ড (USD সমর্থিত) বা এজেন্সি ব্যালেন্স টপ-আপ।\n` +
            `৩. **ল্যান্ডিং পেজ**: সচল টিকটক প্রোফাইল বা স্পষ্ট পলিসি ও রিটার্ন রুলস যুক্ত ওয়েবসাইট।\n` +
            `৪. **প্রোডাক্ট রুলস**: কপিরাইট ও রেপ্লিকা প্রোডাক্ট কঠোরভাবে নিষিদ্ধ।\n\n` +
            `আপনার ব্যবসার জন্য ফ্রি অডিট ও অ্যাকাউন্ট সেটআপ গাইডলাইন পেতে আপনার WhatsApp নম্বরটি মেসেজে লিখুন!`,
          suggestedCtas: [
            { label: "Ads Prediction দেখুন", action: "CALCULATOR" },
            { label: "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      } else if (lastAiMsgText.includes('pixel') || lastAiMsgText.includes('capi') || lastAiMsgText.includes('tracking')) {
        return {
          reply: `সঠিক পিক্সেল ও সার্ভার-সাইড ইভেন্ট ট্র্যাকিং (ViewContent, AddToCart, InitiateCheckout, Purchase) ছাড়া অ্যাড অ্যালগরিদম আসল ক্রেতাদের চিনতে পারে না। ইভент ট্র্যাকিংয়ের মাধ্যমে অপ্রয়োজনীয় বাজেট অপচয় রোধ করা এবং রিটার্গেটিংয়ের মাধ্যমে সেলস বাড়ানো সম্ভব।`,
          suggestedCtas: [
            { label: "Ads Prediction দেখুন", action: "CALCULATOR" },
            { label: "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      } else if (lastAiMsgText.includes('tiktok') || historyContext.includes('tiktok')) {
        return {
          reply: `বাংলাদেশে টিকটক বিজ্ঞাপনের বেঞ্চমার্ক বাজেট রূপরেখা:\n\n` +
            `📌 **টেস্টিং ফেজ**: দৈনিক $১০ – $২০ / দিন (প্রায় ৳১,৫০০ – ৳৩,০০০ / দিন)\n` +
            `📌 **স্কেলিং ফেজ**: দৈনিক $২০ – $৫০+ / দিন (৳৩,০০০ – ৳৭,৫০০+ / দিন)\n\n` +
            `আপনার কাস্টম অডিটের জন্য WhatsApp নম্বরটি লিখুন।`,
          suggestedCtas: [
            { label: "Ads Prediction দেখুন", action: "CALCULATOR" },
            { label: "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      } else {
        return {
          reply: `অবশ্যই! আমি আপনাকে বাংলাতেই সব বুঝিয়ে বলছি। টিকটক ও ফেসবুক অ্যাডস, পিক্সেল ট্র্যাকিং বা বাজেট নিয়ে আপনার কি কোনো প্রশ্ন আছে?`,
          suggestedCtas: [
            { label: "Ads Prediction দেখুন", action: "CALCULATOR" },
            { label: "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
          ],
          isKnowledgeGap: false
        };
      }
    }

    // 5. Recommended TikTok / Facebook Budget Intent Handler
    const isTikTokBudgetQuery = /recommended\s*budget.*tiktok|tiktok.*recommended\s*budget|tiktok.*budget|টিকটক.*বাজেট|টিকটক.*অ্যাডে.*বাজেট|অ্যাডে.*বাজেট.*টিকটক/i.test(qLower);
    const isFacebookBudgetQuery = /recommended\s*budget.*facebook|facebook.*recommended\s*budget|facebook.*budget|ফেসবুক.*বাজেট|ফেসবুক.*অ্যাডে.*বাজেট|meta.*budget/i.test(qLower);

    const isFollowupFacebook = (qLower.includes('facebook') || qLower.includes('meta') || qLower.includes('ফেসবুক')) && 
      (historyContext.includes('tiktok') || historyContext.includes('টিকটক') || historyContext.includes('budget') || historyContext.includes('বাজেট'));

    if (isTikTokBudgetQuery || (qLower.includes('tiktok') && (qLower.includes('budget') || qLower.includes('বাজেট')))) {
      const replyText = isEnglish
        ? `Here is the verified benchmark budget guide for TikTok Ads in Bangladesh:\n\n` +
          `📌 **Testing Phase (Recommended)**:\n` +
          `• **Daily Budget**: $10 – $20 / day (approx ৳1,500 – ৳3,000 / day)\n` +
          `• **Monthly Budget**: $150 – $300 / month (approx ৳22,500 – ৳45,000 / month)\n\n` +
          `📌 **Scaling Phase**:\n` +
          `• **Daily Budget**: $20 – $50+ / day (৳3,000 – ৳7,500+ / day)\n\n` +
          `📊 **Bangladesh TikTok Ads Benchmarks**:\n` +
          `• Average CPM: ৳40 – ৳65 (Avg ৳55)\n` +
          `• Average CTR: 1.8% – 2.2%\n` +
          `• Average CVR: 2.3% – 3.0%\n` +
          `• Average Cost per Order (CPA): ৳90 – ৳125 BDT with smartphone UGC video creatives.\n\n` +
          `Share your WhatsApp number here for a free custom audit or click **"View Ads Prediction"** below.`
        : `বাংলাদেশে ই-কমার্স ও লোকাল ব্যবসার জন্য টিকটক অ্যাডসের সুনির্দিষ্ট বেঞ্চমার্ক বাজেট রূপরেখা নিচে দেওয়া হলো:\n\n` +
          `📌 **টেস্টিং ফেজ (Testing Phase)**:\n` +
          `• **দৈনিক বাজেট**: $১০ – $২০ / দিন (প্রায় ৳১,৫০০ – ৳৩,০০০ / দিন)\n` +
          `• **মাসিক বাজেট**: $১৫০ – $৩০০ / মাস (প্রায় ৳২২,৫০০ – ৳৪৫,০০০ / মাস)\n\n` +
          `📌 **স্কেলিং ফেজ (Scaling Phase)**:\n` +
          `• **দৈনিক বাজেট**: $২০ – $৫০+ / দিন (৳৩,০০০ – ৳৭,৫০০+ / দিন)\n\n` +
          `📊 **টিকটক বেঞ্চমার্ক ডেটা (বাংলাদেশ)**:\n` +
          `• গড় CPM (প্রতি হাজার ভিউ): ৳৪০ – ৳৬৫ (গড় ৳৫৫)\n` +
          `• গড় CTR (ক্লিক থ্রু রেট): ১.৮% – ২.২%\n` +
          `• গড় CPA (অর্ডারপ্রতি খরচ): ৳৯০ – ৳১২৫ BDT (স্মার্টফোন UGC ভিডিও কন্টেন্টে)\n\n` +
          `সহজ যোগাযোগের জন্য মেসেজে আপনার WhatsApp নম্বরটি লিখুন অথবা **"Ads Prediction দেখুন"** বাটনে ক্লিক করুন।`;

      return {
        reply: replyText,
        suggestedCtas: [
          { label: isEnglish ? "View Ads Prediction" : "Ads Prediction দেখুন", action: "CALCULATOR" },
          { label: isEnglish ? "Direct WhatsApp" : "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
        ],
        isKnowledgeGap: false
      };
    }

    if (isFacebookBudgetQuery || isFollowupFacebook) {
      const replyText = isEnglish
        ? `Here is the benchmark budget guide for Facebook (Meta) Ads in Bangladesh (2026 Benchmarks):\n\n` +
          `📌 **Testing Phase**:\n` +
          `• **Daily Budget**: $15 – $30 / day (approx ৳2,250 – ৳4,500 / day)\n` +
          `• **Monthly Budget**: $200 – $500 / month (approx ৳30,000 – ৳75,000 / month)\n\n` +
          `📊 **Facebook Ads Benchmarks (Bangladesh)**:\n` +
          `• Average CPM: ৳180 – ৳250 (Avg ৳215)\n` +
          `• Average CPA (Cost Per Order): ৳350 – ৳900 BDT\n\n` +
          `We recommend running TikTok and Facebook together in a dual-funnel strategy to lower your overall CPA by 30-40%. Leave your WhatsApp number here to get started!`
        : `বাংলাদেশে ফেসবুক (Meta) বিজ্ঞাপনের বেঞ্চমার্ক বাজেট রূপরেখা নিচে দেওয়া হলো:\n\n` +
          `📌 **টেস্টিং ফেজ (Testing Phase)**:\n` +
          `• **দৈনিক বাজেট**: $১৫ – $৩০ / দিন (প্রায় ৳২,২৫০ – ৳৪,৫০০ / দিন)\n` +
          `• **মাসিক বাজেট**: $২০০ – $৫০০ / মাস (প্রায় ৳৩০,০০০ – ৳৭৫,০০০ / মাস)\n\n` +
          `📊 **ফেসবুক বেঞ্চমার্ক ডেটা (বাংলাদেশ)**:\n` +
          `• গড় CPM: ৳১৮০ – ৳২৫০ (গড় ৳২১৫)\n` +
          `• গড় CPA (অর্ডারপ্রতি খরচ): ৳৩৫০ – ৳৯০০ BDT\n\n` +
          `টিকটক এবং ফেসবুক একসাথে ডুয়াল-ফানেল স্ট্র্যাটেজিতে রান করলে আপনার মোট কাস্টমার অ্যাকুইজিশন কস্ট ৩০%-৪০% কম হবে। বিস্তারিত জানতে আপনার WhatsApp নম্বরটি দিন!`;

      return {
        reply: replyText,
        suggestedCtas: [
          { label: isEnglish ? "View Ads Prediction" : "Ads Prediction দেখুন", action: "CALCULATOR" },
          { label: isEnglish ? "Direct WhatsApp" : "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
        ],
        isKnowledgeGap: false
      };
    }

    // 6. Check numeric budget prediction parsing
    const budgetPrediction = this.parseBudgetPrediction(q);
    if (budgetPrediction) {
      return {
        reply: isEnglish
          ? `Based on your budget of ৳${budgetPrediction.budgetBDT.toLocaleString('en-IN')} ($${budgetPrediction.budgetUSD}), here is your custom performance benchmark forecast for TikTok Ads in Bangladesh. Share your WhatsApp number to receive a full audit!`
          : `আপনার দেওয়া বাজেট (৳${budgetPrediction.budgetBDT.toLocaleString('en-IN')} / $${budgetPrediction.budgetUSD}) অনুযায়ী টিকটক পারফরম্যান্স বেঞ্চমার্ক হিসাব নিচে প্রিভিউ হিসেবে তৈরি করা হলো। আপনার প্রোডাক্টের জন্য কাস্টম প্ল্যান পেতে আপনার WhatsApp নম্বরটি দিন।`,
        suggestedCtas: [
          { label: isEnglish ? "Direct WhatsApp" : "WhatsApp-এ আলোচনা করুন", action: "WHATSAPP" },
          { label: isEnglish ? "Full Calculator" : "ফুল ক্যালকুলেটর ওপেন করুন", action: "CALCULATOR" }
        ],
        isKnowledgeGap: false,
        predictionData: budgetPrediction
      };
    }

    // 7. Conversational Intents (Greetings, Identity, Chit-chat)
    const hasDomainQuestion = /বাজেট|budget|খরচ|সেলস|বিক্রি|sell|order|অর্ডার|ডলার|টাকা|taka|bdt|usd|\$|৳|pixel|পিক্সেল|capi|case study|কেস স্টাডি|rules|নিয়ম|setup|সেটআপ|charge|চার্জ|fee|ফি|package|প্যাকেজ|agency|এজেন্সি/i.test(qLower);

    const isHowAreYou = /(?:kmn|kemon|kamon|keamon)\s*(?:aco|aso|achen|asen|achhen|acen|acho|achho)|কেমন\s*(?:আছেন|আছো|আছ)|কি\s*(?:অবস্থা|খবর)|কী\s*(?:অবস্থা|খবর)|ki\s*(?:obostha|khobor)|how\s*(?:are|r)\s*(?:you|u)|how\s*is\s*it\s*going|whats?\s*up|sup\b/i.test(qLower);
    if (isHowAreYou && !hasDomainQuestion) {
      return {
        reply: isEnglish
          ? "I am doing great! 😊 How can I assist you today regarding TikTok & Facebook Ads, Pixel tracking, or budget calculations?"
          : "আলহামদুলিল্লাহ, আমি ভালো আছি! 😊 আমি সঞ্জয় সরকারের AI অ্যাসিস্ট্যান্ট। টিকটক ও ফেসবুক অ্যাডস ম্যানেজমেন্ট, পারফরম্যান্স প্রেডিকশন, পিক্সেল ট্র্যাকিং বা ক্যাম্পেইন বাজেট নিয়ে আপনাকে কীভাবে সাহায্য করতে পারি?",
        suggestedCtas: this.getDefaultCtas(q),
        isKnowledgeGap: false
      };
    }

    const isIdentityIntent = /who\s*(?:are|r)\s*you|tumi\s*ke|tmi\s*ke|apni\s*ke|আপনি\s*ke|তুমি\s*কে|পরিচয়/i.test(qLower);
    if (isIdentityIntent) {
      return {
        reply: isEnglish
          ? "I am Sonjoy Sarkar's official AI Ads Specialist. I help businesses in Bangladesh optimize TikTok & Facebook ad campaigns, calculate ROI forecasts, setup Pixel & CAPI tracking, and scale sales."
          : "আমি সঞ্জয় সরকারের অফিশিয়াল AI অ্যাডস স্পেশালিস্ট। আমি আপনাকে টিকটক ও ফেসবুক বিজ্ঞাপনের বাজেট ক্যালকুলেশন, পিক্সেল ট্র্যাকিং, কেস স্টাডি এবং সার্ভিস সংক্রান্ত যেকোনো প্রশ্নের উত্তর দিতে পারি।",
        suggestedCtas: this.getDefaultCtas(q),
        isKnowledgeGap: false
      };
    }

    const isGreeting = /^(?:hi|hello|hey|helo|hwo|hiii|হাই|হ্যালো|হে|সালাম|আসসালামু\s*আলাইকুম|assalamu?\s*alaikum|salam|slaam|nomoshkar|namaskar)\b/i.test(qLower) || /^(?:hi|hello|hey|সালাম|হাই|হ্যালো)\s*(?:bro|brother|vai|bhai|sir|ভাই|স্যার)?$/i.test(qLower);
    if (isGreeting && !hasDomainQuestion) {
      return {
        reply: isEnglish
          ? "Hello! I am Sonjoy Sarkar's AI Assistant. How can I help you today with TikTok or Meta Ads?"
          : "আসসালামু আলাইকুম! আমি সঞ্জয় সরকারের AI অ্যাসিস্ট্যান্ট। টিকটক ও ফেসবুক অ্যাডস ম্যানেজমেন্ট, পারফরম্যান্স প্রেডিকশন, ক্যাম্পেইন বাজেট বা আমাদের সার্ভিস চার্জ সম্পর্কিত যেকোনো প্রশ্ন আমাকে করতে পারেন। আপনার WhatsApp নম্বর দিয়ে সরাসরি পরামর্শও নিতে পারেন।",
        suggestedCtas: this.getDefaultCtas(q),
        isKnowledgeGap: false
      };
    }

    // 8. Search Grounded Knowledge Base (Precision Filtered)
    const { matches, topMatch } = this.findMatchingKnowledge(q);

    if (topMatch) {
      const ctas = this.getDefaultCtas(q);
      let answer = '';
      if (isEnglish) {
        if (topMatch.answerEn && !/[\u0980-\u09FF]/.test(topMatch.answerEn)) {
          answer = topMatch.answerEn;
        } else if (topMatch.questionEn) {
          answer = `Regarding "${topMatch.questionEn}": ${topMatch.title || 'For custom details, please contact us on WhatsApp or request a free strategy audit.'}`;
        } else {
          answer = "Thank you for reaching out! For custom TikTok & Facebook Ads strategy, Pixel & CAPI tracking setup, or campaign budget recommendations, please connect with us directly on WhatsApp or leave your WhatsApp number here.";
        }
      } else {
        answer = topMatch.answerBn || topMatch.answer;
      }

      return {
        reply: answer,
        suggestedCtas: ctas,
        isKnowledgeGap: false,
        sourceItemIds: [topMatch.id]
      };
    }

    // 9. Knowledge Gap Fallback with direct guidance
    const fallbackReply = isEnglish
      ? "I don't have immediate details on this specific query. Please leave your WhatsApp number here, and Sonjoy Sarkar's team will connect with you directly!"
      : "এই বিষয়ে আমার কাছে তাৎক্ষণিক বিস্তারিত তথ্য নেই। অনুগ্রহ করে মেসেজে আপনার WhatsApp নম্বরটি দিন, সঞ্জয় সরকারের টিম সরাসরি আপনার সাথে যোগাযোগ করবে!";

    storageService.logKnowledgeGap(q, fallbackReply, visitorId);

    return {
      reply: fallbackReply,
      suggestedCtas: [
        { label: isEnglish ? "Direct WhatsApp" : "WhatsApp-এ কথা বলুন", action: "WHATSAPP" },
        { label: isEnglish ? "View Ads Prediction" : "Ads Prediction দেখুন", action: "CALCULATOR" }
      ],
      isKnowledgeGap: true
    };
  }

  private getDefaultCtas(query: string): AiChatResponse['suggestedCtas'] {
    const q = query.toLowerCase();
    const isEng = this.isEnglishText(query);

    if (q.includes('budget') || q.includes('cost') || q.includes('খরচ') || q.includes('বাজেট') || q.includes('calculator') || q.includes('prediction')) {
      return [
        { label: isEng ? "Ads Prediction Tool" : "Ads Prediction দেখুন", action: "CALCULATOR" },
        { label: isEng ? "Direct WhatsApp" : "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
      ];
    }
    return [
      { label: isEng ? "View Ads Prediction" : "Ads Prediction দেখুন", action: "CALCULATOR" },
      { label: isEng ? "Direct WhatsApp" : "WhatsApp-এ আলোচনা", action: "WHATSAPP" }
    ];
  }
}

export const aiService = new AiService();
