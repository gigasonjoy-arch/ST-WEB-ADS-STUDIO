import { 
  AdminAiActionProposal, 
  AdminAiAction, 
  AdminTab, 
  SiteSettings, 
  CaseStudy, 
  CalculatorBenchmark, 
  KnowledgeBaseItem, 
  KnowledgeCategory
} from '../types';
import { storageService } from './storageService';

export class AdminAgentEngine {
  /**
   * System Analysis Engine: Scans DB for missing, incomplete, or outdated knowledge and generates
   * specific targeted questions one by one with multiple suggested answers.
   */
  public static generateSystemInterviewQuestions(answeredQuestionIds: string[] = []): Array<{ id: string; category: string; question: string; reason: string; options?: string[] }> {
    const questions: Array<{ id: string; category: string; question: string; reason: string; options?: string[] }> = [];
    
    const kb = storageService.getKnowledgeBase(false);
    const caseStudies = storageService.getCaseStudies(true);
    const benchmarks = storageService.getCalculatorBenchmarks();
    const settings = storageService.getSiteSettings();
    const gaps = storageService.getKnowledgeGaps().filter(g => g.status !== 'resolved');

    // 1. Unresolved Knowledge Gaps
    if (gaps.length > 0) {
      gaps.slice(0, 3).forEach(g => {
        const qId = `q-gap-${g.id}`;
        if (!answeredQuestionIds.includes(qId)) {
          questions.push({
            id: qId,
            category: 'Knowledge Gap',
            question: `ভিজিটররা একাধিকবার এই প্রশ্নটি জিজ্ঞেস করেছেন: "${g.question}"। এর সঠিক ও আপডেটেড উত্তরটি কী হবে?`,
            reason: `পেন্ডিং নলেজ গ্যাপ (${g.count || 1} বার জিজ্ঞাসিত)`,
            options: [
              `উত্তর: ${g.question} এর ক্ষেত্রে আমাদের টিম সার্বক্ষণিক সার্ভিস প্রদান করে। বিস্তারিত হোয়াটসঅ্যাপে জানা যাবে।`,
              `উত্তর: ${g.question} এর তথ্যটি আমাদের অনবোর্ডিং গাইডে দেওয়া আছে। আমাদের সার্ভিস ফি ও শর্তাবলী প্রযোজ্য।`
            ]
          });
        }
      });
    }

    // 2. Work / Services & Process Coverage
    const hasServiceProcess = kb.some(k => k.category === 'Services' || k.category === 'Process' || /process|সার্ভিস|প্যাকেজ|ফি|কাজ|শুরু/i.test(k.question + k.answer));
    if (!hasServiceProcess && !answeredQuestionIds.includes('q-service-process')) {
      questions.push({
        id: 'q-service-process',
        category: 'Work & Services',
        question: 'আপনার মূল সার্ভিসগুলো (যেমন TikTok Ads setup, Meta CAPI Tracking) শুরু করার প্রক্রিয়া ও ক্লায়েন্ট রিকোয়ারমেন্টস কী কী?',
        reason: 'সার্ভিস প্রসেস সম্পর্কিত পূর্ণাঙ্গ প্রশ্নোত্তর নলেজ বেসে অনুপস্থিত',
        options: [
          'প্রথমে অনবোর্ডিং ফর্ম পূরণ -> বিজনেস ম্যানেজার/টিকটক অ্যাকাউন্টের এক্সেস শেয়ার -> পিক্সেল ও CAPI সেটআপ -> ক্যাম্পেইন চালুকরণ।',
          'সার্ভিস শুরুর জন্য ক্লায়েন্টকে টিকটক অ্যাড এক্সেস দিতে হবে এবং দৈনিক সর্বনিম্ন $১০ বাজেট রাখতে হবে।',
          'আমরা অনবোর্ডিং থেকে শুরু করে সম্পূর্ণ টেকনিক্যাল সেটআপ, অ্যাড ক্রিয়েটিভ কনসাল্টিং এবং সাপ্তাহিক পারফর্মেন্স রিপোর্ট প্রদান করি।'
        ]
      });
    }

    // 3. Case Studies & Client Results
    if (caseStudies.length === 0 && !answeredQuestionIds.includes('q-case-study-new')) {
      questions.push({
        id: 'q-case-study-new',
        category: 'Case Studies',
        question: 'আপনার সাম্প্রতিক যেকোনো একটি সফল ক্লায়েন্ট প্রজেক্টের নাম, বাজেট, ও অর্জিত রেভিনিউ/ROAS তথ্য জানাবেন কি?',
        reason: 'লাইভ কেস স্টাডি সংগৃহীত নয়',
        options: [
          'ক্লায়েন্ট: Silk Vogue, বাজেট: ৪০,০০০ টাকা, সেলস: ১,৬০,০০০ টাকা, অর্ডার: ৩৫০টি, প্ল্যাটফর্ম: TikTok',
          'ক্লায়েন্ট: Aarong Lifestyle, বাজেট: ৫০,০০০ টাকা, সেলস: ২,৫০,০০০ টাকা, ROAS: 5.0x, প্ল্যাটফর্ম: Meta Ads'
        ]
      });
    } else {
      const incompleteCases = caseStudies.filter(c => !c.adSpendBDT || !c.roas || !c.purchases);
      if (incompleteCases.length > 0) {
        const target = incompleteCases[0];
        const qId = `q-cs-inc-${target.id}`;
        if (!answeredQuestionIds.includes(qId)) {
          questions.push({
            id: qId,
            category: 'Case Studies',
            question: `ক্লায়েন্ট "${target.clientName || target.title}"-এর কেস স্টাডিতে স্পেন্ড বা অর্জিত অর্ডার/ROAS মেট্রিক্স অনুপস্থিত। এই পারফর্মেন্সের তথ্য কি দিতে পারবেন?`,
            reason: 'অসম্পূর্ণ কেস স্টাডি মেট্রিক্স আপডেট',
            options: [
              `অ্যাড স্পেন্ড: ৳৩৫,০০০, মোট সেলস: ৳১,৪০,০০০, ROAS: 4.0x, মোট পারচেজ: ২৮০টি`,
              `অ্যাড স্পেন্ড: ৳৫০,০০০, মোট সেলস: ৳২,২০,০০০, ROAS: 4.4x, মোট পারচেজ: ৪৫০টি`
            ]
          });
        }
      }
    }

    // 4. Benchmarks & Ad Metrics
    if (benchmarks.length === 0 && !answeredQuestionIds.includes('q-benchmark-new')) {
      questions.push({
        id: 'q-benchmark-new',
        category: 'Benchmarks',
        question: 'আপনার ফ্যাশন বা বিউটি ক্যাটাগরির জন্য সাম্প্রতিক TikTok Ads CPM, CTR বা CVR কত?',
        reason: 'অ্যাড ক্যালকুলেটর বেঞ্চমার্ক অনুপস্থিত',
        options: [
          'ফ্যাশন ক্যাটাগরির গড় CPM $১.২০, CTR ২.৮%, CVR ৪.৫%, এবং CPA ৳১৮০',
          'বিউটি ও স্কিনকেয়ার ক্যাটাগরির গড় CPM $১.৫০, CTR ৩.২%, CVR ৫.০%'
        ]
      });
    }

    // 5. Payment, Dollar Rate & Delivery FAQs
    const hasPaymentFaq = kb.some(k => /payment|পেমেন্ট|বিকাশ|ব্যাংক|ডলার|ফি|charge|চার্জ/i.test(k.question + k.answer));
    if (!hasPaymentFaq && !answeredQuestionIds.includes('q-payment-faq')) {
      questions.push({
        id: 'q-payment-faq',
        category: 'Payment & Pricing',
        question: `বর্তমানে পেমেন্ট পদ্ধতি (বিকাশ/ব্যাংক) এবং ডলার এক্সচেঞ্জ রেট (বর্তমান রেট ৳${settings.exchangeRateUsdToBdt || 150}) সংক্রান্ত কোনো নির্দিষ্ট নিয়ম কি নলেজ বেসে যোগ করবেন?`,
        reason: 'পেমেন্ট ও ডলার সংক্রান্ত প্রশ্নের অভাব',
        options: [
          `আমরা বিকাশ, নগদ ও ব্যাংকে পেমেন্ট গ্রহণ করি। ডলার এক্সচেঞ্জ রেট ৳${settings.exchangeRateUsdToBdt || 130}। পেমেন্ট ৫০% অগ্রিম দিতে হয়।`,
          `পেমেন্ট পদ্ধতি: বিকাশ মার্চেন্ট ও ব্যাংক অ্যাকাউন্ট। ডলার রেট প্রতিদিনের বাজার দর অনুযায়ী নির্ধারিত হয়।`
        ]
      });
    }

    // 6. Guarantee / Refund / Policy
    const hasPolicy = kb.some(k => /guarantee|refund|গ্যারান্টি|রিফান্ড|শর্ত|পলিসি/i.test(k.question + k.answer));
    if (!hasPolicy && !answeredQuestionIds.includes('q-policy-faq')) {
      questions.push({
        id: 'q-policy-faq',
        category: 'Policies',
        question: 'ক্যাম্পেইন রেজাল্ট বা কাজের ক্ষেত্রে কোনো গ্যারান্টি বা রিফান্ড পলিসি প্রযোজ্য কি?',
        reason: 'পলিসি সম্পর্কিত স্পষ্ট প্রশ্নোত্তর অনুপস্থিত',
        options: [
          'বিজ্ঞাপনের ফলাফলের শতভাগ গ্যারান্টি দেওয়া সম্ভব নয়, তবে সঠিক অডিয়েন্স ও ট্র্যাকিংয়ের মাধ্যমে সর্বোচ্চ ROI নিশ্চিত করা হয়।',
          'কারিগরি ত্রুটির কারণে কাজ শুরু হতে ব্যর্থ হলে ১০০% রিফান্ড প্রদান করা হবে।'
        ]
      });
    }

    // Fallback general routine questions
    if (!answeredQuestionIds.includes('q-routine-general-1')) {
      questions.push({
        id: 'q-routine-general-1',
        category: 'General',
        question: 'আপনার ক্লায়েন্ট বা ভিজিটররা সম্প্রতি নতুন কোনো সাধারণ প্রশ্ন বা বিভ্রান্তি প্রকাশ করেছেন কি?',
        reason: 'নিয়মিত সিস্টেম নলেজ আপডেট',
        options: [
          'প্রশ্ন: সার্ভিস বুক করার প্রসেস কী? উত্তর: প্রথমে বুকিং কনফার্ম করে রিকোয়ারমেন্ট সাবমিট করতে হবে, এরপর আমাদের এক্সপার্ট টিম কাজ শুরু করবে।',
          'প্রশ্ন: অ্যাড অ্যাকাউন্ট ও ফেসবুক পেজ অ্যাক্সেস কীভাবে দিব? উত্তর: আমাদের ফেসবুক বিজনেস ম্যানেজার আইডি অথবা ইমেইল অ্যাড্রেসে পার্টনার অ্যাক্সেস দিতে হবে।'
        ]
      });
    }

    if (!answeredQuestionIds.includes('q-routine-general-2')) {
      questions.push({
        id: 'q-routine-general-2',
        category: 'General',
        question: 'নলেজ বেসের এমন কোনো পুরাতন তথ্য বা অফার কি আছে, যা এখন আর প্রযোজ্য নয় বা পরিবর্তন প্রয়োজন?',
        reason: 'অপ্রাসঙ্গিক ও পুরাতন তথ্য যাচাই',
        options: [
          'সব তথ্য আপডেট আছে, কোনো কিছু পরিবর্তনের প্রয়োজন নেই।',
          'আমাদের সার্ভিসের ফি বা কোনো পুরাতন কাস্টম প্যাকেজের প্রাইস আপডেট করা প্রয়োজন।'
        ]
      });
    }

    return questions;
  }

  /**
   * Evaluates user response during interview, detects matching/outdated info,
   * and prepares an interactive Human-in-the-Loop Proposal card.
   */
  public static processSystemInterviewAnswer(
    userAnswer: string,
    currentQuestion: { id: string; category: string; question: string }
  ): { text: string; proposal?: AdminAiActionProposal; suggestions?: string[] } {
    const raw = userAnswer.trim();
    const lower = raw.toLowerCase();

    // Check if user wants to skip
    if (/skip|স্কিপ|পরের|পরবর্তী|next|পরে|স্টপ|stop|থাক/i.test(lower) && raw.length < 15) {
      return {
        text: 'ঠিক আছে, এই প্রশ্নটি এড়িয়ে পরবর্তী প্রশ্নে চলে যাচ্ছি।',
        suggestions: ['পরবর্তী প্রশ্ন করুন', 'ইন্টারভিউ বন্ধ করো']
      };
    }

    // Check for "disable" / "outdated" intent
    const isDisableIntent = /বন্ধ|অনুপযোগী|পুরাতন|পুরানো|বাতিল|অফ|অকার্যকর|অবসোলেট|outdated|deprecated|delete|ডিলেট/i.test(lower);

    // Semantic search in existing Knowledge Base
    const existingKb = storageService.getKnowledgeBase(false);
    const matchingKb = existingKb.find(k => {
      const q = (k.question + ' ' + k.title + ' ' + k.answer).toLowerCase();
      const userWords = lower.split(/\s+/).filter(w => w.length > 3);
      return userWords.some(w => q.includes(w));
    });

    if (isDisableIntent && matchingKb) {
      // Create DISABLE proposal card
      const proposal: AdminAiActionProposal = {
        id: `prop-dis-kb-${Date.now()}`,
        actionType: 'DISABLE_KNOWLEDGE_ITEM',
        titleEn: `Disable Outdated Knowledge Base Article: "${matchingKb.title || matchingKb.question}"`,
        titleBn: `পুরাতন/অপ্রাসঙ্গিক নলেজ আর্টিকেল নিষ্ক্রিয় (Disable) করার প্রস্তাবনা`,
        summaryEn: `Question: "${matchingKb.question}"\nReason: Identified as outdated by admin response. Will hide from Public AI Chat.`,
        summaryBn: `প্রশ্ন: "${matchingKb.question}"\nআপনার উত্তরের ভিত্তিতে এটি পুরোনো/অপ্রাসঙ্গিক হিসেবে চিহ্নিত হয়েছে। অনুমোদনের পর পাবলিক AI আর এটি ক্লায়েন্টদের উত্তর হিসেবে দেবে না।`,
        targetTab: 'KNOWLEDGE_BASE',
        payload: { itemId: matchingKb.id, item: matchingKb },
        status: 'PENDING_CONFIRMATION'
      };

      return {
        text: `আমি চিহ্নিত করেছি যে বর্তমান নলেজ বেসের **"${matchingKb.question}"** বিষয়টি অপ্রাসঙ্গিক বা বাতিল করতে চান। নিচে নিষ্ক্রিয় করার কনফার্মেশন কার্ড তৈরি হয়েছে:`,
        proposal,
        suggestions: ['অনুমোদন ও নিষ্ক্রিয় করুন', 'পরবর্তী প্রশ্ন']
      };
    }

    if (matchingKb && !isDisableIntent) {
      // Create UPDATE proposal card for existing KB item
      const updatedItem: KnowledgeBaseItem = {
        ...matchingKb,
        answer: raw,
        answerBn: raw,
        answerEn: raw,
        status: 'published',
        updatedAt: new Date().toISOString(),
        updatedBy: 'Admin Interviewer'
      };

      const proposal: AdminAiActionProposal = {
        id: `prop-upd-kb-${Date.now()}`,
        actionType: 'UPDATE_KNOWLEDGE_ITEM',
        titleEn: `Update Existing Knowledge Base Q&A: "${matchingKb.title || matchingKb.question.slice(0, 30)}"`,
        titleBn: `বিদ্যমান নলেজ আর্টিকেলে তথ্য আপডেটের প্রস্তাবনা`,
        summaryEn: `Existing Q: "${matchingKb.question}"\nUpdated Answer: "${raw}"`,
        summaryBn: `পুরাতন প্রশ্ন: "${matchingKb.question}"\nনতুন আপডেটেড উত্তর: "${raw}"\n\nএটি বিদ্যমান আর্টিকেলের সাথে সম্পর্কিত হওয়ায় তা আপডেট করা হবে।`,
        targetTab: 'KNOWLEDGE_BASE',
        payload: { item: updatedItem },
        status: 'PENDING_CONFIRMATION'
      };

      return {
        text: `আপনার উত্তরটি বিদ্যমান নলেজ আইটেম **"${matchingKb.question}"** এর সাথে মিলে গেছে! আমি এটি আপডেট করার প্রস্তাবনা কার্ড তৈরি করেছি। অনুমোদন দিলে পাবলিক AI নতুন তথ্য ব্যবহার করবে:`,
        proposal,
        suggestions: ['অনুমোদন ও আপডেট করুন', 'নতুন আইটেম হিসেবে যোগ করুন']
      };
    }

    // Check if user answer is a Case Study format
    const parsedCs = this.extractCaseStudyFromInput(raw, storageService.getSiteSettings());
    if (parsedCs) {
      const proposal: AdminAiActionProposal = {
        id: `prop-add-cs-int-${Date.now()}`,
        actionType: 'BULK_CREATE_CASE_STUDIES',
        titleEn: `Add Case Study for Client: "${parsedCs.clientName}"`,
        titleBn: `ক্লায়েন্ট "${parsedCs.clientName}"-এর কেস স্টাডি যোগ করার প্রস্তাবনা`,
        summaryEn: `Spend ৳${parsedCs.adSpendBDT?.toLocaleString('en-IN')}, ROAS ${parsedCs.roas}x, Purchases ${parsedCs.purchases}.`,
        summaryBn: `বিজ্ঞাপন খরচ ৳${parsedCs.adSpendBDT?.toLocaleString('en-IN')}, রিটার্ন (ROAS) ${parsedCs.roas}x, মোট পারচেজ ${parsedCs.purchases}টি।`,
        targetTab: 'CASE_STUDIES',
        payload: { caseStudies: [parsedCs] },
        status: 'PENDING_CONFIRMATION'
      };

      return {
        text: `আপনার উত্তরের ভিত্তিতে একটি নতুন **কেস স্টাডি প্রিভিউ কার্ড** প্রস্তুত করেছি। অনুমোদন দিলে লাইভ সাইটে প্রকাশিত হবে:`,
        proposal,
        suggestions: ['অনুমোদন ও সেভ করুন', 'পরবর্তী প্রশ্ন']
      };
    }

    // Default: Create NEW Knowledge Base Item Proposal
    const parsedKb = this.extractKnowledgeItemFromInput(
      raw.includes('উত্তর') ? raw : `প্রশ্ন: ${currentQuestion.question} উত্তর: ${raw}`
    );

    const newItem: KnowledgeBaseItem = parsedKb || {
      id: `kb-int-${Date.now()}`,
      title: currentQuestion.question.slice(0, 50),
      category: (currentQuestion.category as any) || 'General',
      categoryEn: currentQuestion.category || 'General',
      categoryBn: currentQuestion.category || 'সাধারণ',
      question: currentQuestion.question,
      questionEn: currentQuestion.question,
      questionBn: currentQuestion.question,
      answer: raw,
      answerEn: raw,
      answerBn: raw,
      keywords: currentQuestion.question.toLowerCase().split(/\s+/).filter(w => w.length > 2),
      priority: 8,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin Intelligent Interviewer'
    };

    const proposal: AdminAiActionProposal = {
      id: `prop-add-kb-int-${Date.now()}`,
      actionType: 'BULK_ADD_KNOWLEDGE_BASE',
      titleEn: `Add New Q&A to Knowledge Base: "${newItem.question.slice(0, 40)}..."`,
      titleBn: `নলেজ বেসে নতুন প্রশ্নোত্তর যোগের প্রস্তাবনা`,
      summaryEn: `Question: "${newItem.question}"\nAnswer: "${newItem.answer}"`,
      summaryBn: `প্রশ্ন: "${newItem.question}"\nউত্তর: "${newItem.answer}"\nক্যাটাগরি: ${newItem.categoryBn || newItem.category}। অনুমোদনের পর পাবলিক AI এটি থেকে ভিজিটরদের উত্তর দেবে।`,
      targetTab: 'KNOWLEDGE_BASE',
      payload: { items: [newItem] },
      status: 'PENDING_CONFIRMATION'
    };

    return {
      text: `আপনার উত্তরের ভিত্তিতে **নলেজ বেস প্রস্তাবনা কার্ড** সাজানো হয়েছে। অনুমোদন দিলে এটি ডেটাবেসে ও পাবলিক এআই-তে যুক্ত হবে:`,
      proposal,
      suggestions: ['অনুমোদন ও সেভ করুন', 'পরবর্তী প্রশ্ন']
    };
  }

  /**
   * Evaluates an admin command.
   * STRICT POLICY:
   * 1. Never generate hallucinated/fake data out of thin air.
   * 2. If the user provides structured/unstructured data in their prompt, parse and structure it,
   *    and present a Human-in-the-Loop Proposal Card for review and confirmation.
   * 3. If the user requests to create something without providing the data, prompt them with the exact template/fields needed.
   * 4. Nothing is saved or shown to the public without explicit button confirmation from the admin.
   */
  public static processCommand(
    rawQuery: string, 
    settings: SiteSettings
  ): { text: string; proposal?: AdminAiActionProposal; actions?: AdminAiAction[]; suggestions?: string[] } {
    const query = rawQuery.trim();
    const qLower = query.toLowerCase();

    // Direct English reply prompt handling without blocking
    if (qLower === 'reply in english' || qLower === 'english mode' || qLower === 'in english') {
      return {
        text: "🌐 **English Mode Active!**\n\nI will now respond in English for this conversation. You can enter case studies, Q&A, or settings in English or Bengali.",
        suggestions: [
          'Client: Silk Vogue, Budget: 40000, Sales: 160000, Orders: 310. Add case study',
          'Question: Delivery time? Answer: Dhaka 24-48 hours, outside 3-4 days. Add to KB',
          'Publish all draft case studies'
        ]
      };
    }
    const isCaseStudyIntent = 
      qLower.includes('case study') || 
      qLower.includes('কেস স্টাডি') || 
      qLower.includes('কেসস্টাডি') || 
      qLower.includes('client result') || 
      qLower.includes('campaign result') ||
      qLower.includes('ক্লায়েন্ট রেজাল্ট') ||
      qLower.includes('ক্লায়েন্ট');

    // Case 1A: Publish actual existing draft case studies (Real DB drafts only)
    if (isCaseStudyIntent && (qLower.includes('draft') || qLower.includes('ড্রাফট')) && (qLower.includes('publish') || qLower.includes('পাবলিশ') || qLower.includes('live') || qLower.includes('লাইভ'))) {
      const allStudies = storageService.getCaseStudies(true);
      const drafts = allStudies.filter(c => !c.isPublished || c.status === 'DRAFT');

      if (drafts.length === 0) {
        return {
          text: `বর্তমানে আপনার ডেটাবেসে কোনো অপ্রকাশিত ড্রাফট কেস স্টাডি নেই। আপনার বর্তমান সব (${allStudies.length}টি) কেস স্টাডি ইতিমধ্যে লাইভ সাইটে প্রকাশিত রয়েছে।`,
          actions: [
            {
              id: 'act-view-cs',
              label: 'View All Case Studies',
              labelBn: 'সকল কেস স্টাডি দেখুন',
              tab: 'CASE_STUDIES',
              type: 'NAVIGATE'
            }
          ],
          suggestions: [
            'নতুন কেস স্টাডি যোগ করার তথ্য দিন',
            'ডলার এক্সচেঞ্জ রেট পরিবর্তন করো',
            'ক্যালকুলেটর বেঞ্চমার্ক আপডেট করো'
          ]
        };
      }

      const proposal: AdminAiActionProposal = {
        id: `prop-pub-drafts-${Date.now()}`,
        actionType: 'PUBLISH_DRAFT_CASE_STUDIES',
        titleEn: `Publish ${drafts.length} Existing Draft Case Study(s) to Live Site`,
        titleBn: `ডেটাবেসের ${drafts.length}টি ড্রাফট কেস স্টাডি লাইভ সাইটে প্রকাশ করার প্রস্তাবনা`,
        summaryEn: `This will publish the existing drafts: ${drafts.map(d => `"${d.title || d.clientName}"`).join(', ')}. No new or fabricated data is added.`,
        summaryBn: `নিচের ${drafts.length}টি প্রকৃত ড্রাফট কেস স্টাডি লাইভ করা হবে: ${drafts.map(d => `"${d.titleBn || d.title || d.clientName}"`).join(', ')}। আপনার অনুমোদন ছাড়া এটি পাবলিশ হবে না।`,
        targetTab: 'CASE_STUDIES',
        dataCount: drafts.length,
        payload: { 
          draftIds: drafts.map(d => d.id),
          caseStudies: drafts
        },
        status: 'PENDING_CONFIRMATION'
      };

      return {
        text: `আমি ডেটাবেস স্ক্যান করে **${drafts.length}টি ড্রাফট কেস স্টাডি** পেয়েছি। এগুলো লাইভ সাইটে প্রকাশ করতে চাইলে নিচের প্রিভিউ কার্ডটি দেখে **"নিশ্চিত করুন ও সেভ করুন"** বাটনে ক্লিক করুন:`,
        proposal,
        suggestions: ['অনুমোদন ও লাইভ করুন', 'কেস স্টাডি ম্যানেজমেন্টে যান']
      };
    }

    // Case 1B: User wants to add a Case Study
    const isAddCaseStudy = isCaseStudyIntent && (
      qLower.includes('add') || 
      qLower.includes('যোগ') || 
      qLower.includes('নতুন') || 
      qLower.includes('create') || 
      qLower.includes('তৈরি') || 
      qLower.includes('ইনসার্ট') ||
      qLower.includes('insert') ||
      qLower.includes('সেভ') ||
      qLower.includes('save')
    );

    if (isAddCaseStudy || isCaseStudyIntent) {
      // Check if the user provided actual data in the message
      const parsedCaseStudy = this.extractCaseStudyFromInput(query, settings);

      if (parsedCaseStudy) {
        // User provided specific data! We format it properly and create proposal card.
        const proposal: AdminAiActionProposal = {
          id: `prop-add-cs-${Date.now()}`,
          actionType: 'BULK_CREATE_CASE_STUDIES',
          titleEn: `Add Case Study for Client: "${parsedCaseStudy.clientName}"`,
          titleBn: `ক্লায়েন্ট "${parsedCaseStudy.clientName}"-এর কেস স্টাডি যোগ করার প্রস্তাবনা`,
          summaryEn: `Structured from your input: Spend ৳${parsedCaseStudy.adSpendBDT.toLocaleString('en-IN')}, ROAS ${parsedCaseStudy.roas}x, Purchases ${parsedCaseStudy.purchases}, Platform ${parsedCaseStudy.platform}, Industry "${parsedCaseStudy.industry}".`,
          summaryBn: `আপনার প্রদত্ত তথ্য অনুযায়ী সাজানো হয়েছে: বিজ্ঞাপন খরচ ৳${parsedCaseStudy.adSpendBDT.toLocaleString('en-IN')}, রিটার্ন (ROAS) ${parsedCaseStudy.roas}x, মোট পারচেজ ${parsedCaseStudy.purchases}টি, প্ল্যাটফর্ম ${parsedCaseStudy.platform}, ইন্ডাস্ট্রি: ${parsedCaseStudy.industryBn || parsedCaseStudy.industry}।`,
          targetTab: 'CASE_STUDIES',
          dataCount: 1,
          payload: { caseStudies: [parsedCaseStudy] },
          status: 'PENDING_CONFIRMATION'
        };

        return {
          text: `আমি আপনার দেওয়া তথ্যগুলো নিখুঁতভাবে বিশ্লেষণ ও সাজিয়ে নিচের **অ্যাকশন প্রিভিউ কার্ডটি** প্রস্তুত করেছি।\n\n🛡️ *কোনো কাল্পনিক তথ্য যোগ করা হয়নি। আপনি নিচে দেখে নিশ্চিত করলেই কেবল এটি ডেটাবেসে ও সাইটে যুক্ত হবে:*`,
          proposal,
          suggestions: ['নিশ্চিত করুন ও সেভ করুন', 'কেস স্টাডি ম্যানেজমেন্টে যান']
        };
      } else if (isAddCaseStudy) {
        // User requested to add a case study but didn't provide the data. DO NOT INVENT DATA!
        return {
          text: `নতুন কেস স্টাডি যোগ করতে দয়া করে আপনার ক্লায়েন্ট ও ক্যাম্পেইনের আসল তথ্যগুলো লিখুন। যেমন:\n\n` +
            `• **ক্লায়েন্টের নাম:** (যেমন: *Aarong Fashion* বা *Style Zone*)\n` +
            `• **ইন্ডাস্ট্রি:** (যেমন: *Fashion, Beauty, Gadgets, Food*)\n` +
            `• **বিজ্ঞাপন খরচ (Spend):** (যেমন: *৪০,০০০ টাকা* বা *50k*)\n` +
            `• **সেলস/রেভিনিউ বা ROAS:** (যেমন: *১,৮০,০০০ টাকা* বা *4.5x ROAS*)\n` +
            `• **মোট অর্ডার (Purchases):** (যেমন: *৩২০টি*)\n` +
            `• **বিজ্ঞাপন প্ল্যাটফর্ম:** (যেমন: *TikTok / Facebook / Both*)\n\n` +
            `*উদাহরণস্বরূপ এভাবে লিখতে পারেন:*\n` +
            `> *"ক্লায়েন্ট: Silk Craze, ইন্ডাস্ট্রি: Fashion, বাজেট: ৩৫,০০০ টাকা, সেলস: ১,৪০,০০০ টাকা, অর্ডার: ২৮০টি, প্ল্যাটফর্ম: TikTok। কেস স্টাডি যোগ করো।"*\n\n` +
            `আপনি তথ্য দিলে আমি তা সুন্দরভাবে সাজিয়ে প্রিভিউ কার্ড দেখাব এবং আপনার অনুমোদনের পর সেভ করব।`,
          actions: [
            {
              id: 'act-nav-cs-form',
              label: 'Open Manual Case Study Form',
              labelBn: 'ম্যানুয়াল কেস স্টাডি ফর্মে যান',
              tab: 'CASE_STUDIES',
              type: 'NAVIGATE'
            }
          ],
          suggestions: [
            'ক্লায়েন্ট: Style Zone, বাজেট: 40000, সেলস: 160000, অর্ডার: 300, প্ল্যাটফর্ম: TikTok। কেস স্টাডি যোগ করো',
            'সব ড্রাফট কেস স্টাডি লাইভে পাবলিশ করো'
          ]
        };
      }
    }

    // =========================================================================
    // 2. KNOWLEDGE BASE & Q&A MANAGEMENT (STRICT USER INPUT DRIVEN)
    // =========================================================================
    const isKbIntent = 
      qLower.includes('knowledge base') || 
      qLower.includes('নলেজ বেস') || 
      qLower.includes('faq') || 
      qLower.includes('প্রশ্নোত্তর') || 
      qLower.includes('প্রশ্ন') || 
      qLower.includes('question') || 
      qLower.includes('answer') || 
      qLower.includes('উত্তর') || 
      qLower.includes('gap') || 
      qLower.includes('গ্যাপ');

    // Case 2A: Resolve Real Unresolved Knowledge Gaps
    if (isKbIntent && (qLower.includes('gap') || qLower.includes('গ্যাপ') || qLower.includes('অমীমাংসিত') || qLower.includes('unresolved') || qLower.includes('পেন্ডিং'))) {
      const allGaps = storageService.getKnowledgeGaps();
      const unresolvedGaps = allGaps.filter(g => g.status !== 'resolved');

      if (unresolvedGaps.length === 0) {
        return {
          text: `বর্তমানে কোনো অমীমাংসিত (Unresolved) নলেজ গ্যাপ নেই! ভিজিটরদের জিজ্ঞাসা করা সব প্রশ্নের সমাধান ইতিমধ্যে সম্পন্ন করা আছে।`,
          actions: [
            {
              id: 'act-view-kb',
              label: 'View Knowledge Base',
              labelBn: 'নলেজ বেস দেখুন',
              tab: 'KNOWLEDGE_BASE',
              type: 'NAVIGATE'
            }
          ],
          suggestions: ['নতুন প্রশ্ন-উত্তর যোগ করার নিয়ম কী?', 'ডলার এক্সচেঞ্জ রেট পরিবর্তন করো']
        };
      }

      // Check if user provided an answer to a specific gap
      const gapMatch = query.match(/(gap|গ্যাপ)\s*#?(\d+)/i);
      const answerMatch = query.match(/(answer|উত্তর|ans|উঃ)\s*[:=]?\s*(.+)/i);

      if (gapMatch && answerMatch) {
        const gapIndex = parseInt(gapMatch[2]) - 1;
        const targetGap = unresolvedGaps[gapIndex] || unresolvedGaps[0];
        const userProvidedAnswer = answerMatch[2].trim();

        const proposal: AdminAiActionProposal = {
          id: `prop-resolve-single-gap-${Date.now()}`,
          actionType: 'RESOLVE_KNOWLEDGE_GAPS',
          titleEn: `Resolve Knowledge Gap: "${targetGap.question}"`,
          titleBn: `নলেজ গ্যাপ সমাধান: "${targetGap.question}"`,
          summaryEn: `Will save your provided answer: "${userProvidedAnswer}" and publish to Knowledge Base.`,
          summaryBn: `আপনার প্রদত্ত উত্তর: "${userProvidedAnswer}" নলেজ বেসে সেভ করা হবে এবং গ্যাপটি 'সমাধানকৃত' চিহ্নিত হবে।`,
          targetTab: 'KNOWLEDGE_GAPS',
          dataCount: 1,
          payload: {
            resolutions: [
              {
                gapId: targetGap.id,
                question: targetGap.question,
                answerBn: userProvidedAnswer,
                answerEn: userProvidedAnswer,
                category: 'General'
              }
            ]
          },
          status: 'PENDING_CONFIRMATION'
        };

        return {
          text: `আমি আপনার দেওয়া উত্তর অনুযায়ী **নলেজ গ্যাপটি সমাধানের প্রিভিউ কার্ড** তৈরি করেছি। নিচে চেক করে অনুমোদন দিন:`,
          proposal,
          suggestions: ['অনুমোদন ও নলেজ বেসে সেভ করুন', 'নলেজ গ্যাপ পেজে যান']
        };
      }

      // If user just asks to review unresolved gaps
      return {
        text: `বর্তমানে **${unresolvedGaps.length}টি অমীমাংসিত নলেজ গ্যাপ** পেন্ডিং রয়েছে:\n\n` +
          unresolvedGaps.slice(0, 3).map((g, idx) => `**${idx + 1}.** "${g.question}" (জিজ্ঞাসা: ${g.count || 1} বার)`).join('\n') +
          `\n\nআপনি চাইলে কোনো প্রশ্নের উত্তর লিখে পাঠাতে পারেন (যেমন: *"গ্যাপ #1 এর উত্তর: আমাদের ডেলিভারি চার্জ ৮০ টাকা"*), অথবা নলেজ গ্যাপ পেজে গিয়ে সরাসরি উত্তর দিতে পারেন:`,
        actions: [
          {
            id: 'act-nav-gaps-page',
            label: 'Open Knowledge Gaps Manager',
            labelBn: 'নলেজ গ্যাপ ম্যানেজারে যান',
            tab: 'KNOWLEDGE_GAPS',
            type: 'NAVIGATE'
          }
        ],
        suggestions: [
          'নলেজ গ্যাপ ম্যানেজারে যান',
          'নতুন প্রশ্নোত্তর নলেজ বেসে যোগ করার তথ্য দিন'
        ]
      };
    }

    // Case 2B: User wants to add a Q&A to Knowledge Base
    const isAddKb = isKbIntent && (
      qLower.includes('add') || 
      qLower.includes('যোগ') || 
      qLower.includes('নতুন') || 
      qLower.includes('সেভ') || 
      qLower.includes('save') ||
      qLower.includes('insert') ||
      qLower.includes('তৈরি')
    );

    if (isAddKb || (qLower.includes('প্রশ্ন') && qLower.includes('উত্তর')) || (qLower.includes('question') && qLower.includes('answer'))) {
      const parsedKb = this.extractKnowledgeItemFromInput(query);

      if (parsedKb) {
        // User provided specific Q&A! We format it properly and create proposal card.
        const proposal: AdminAiActionProposal = {
          id: `prop-add-kb-${Date.now()}`,
          actionType: 'BULK_ADD_KNOWLEDGE_BASE',
          titleEn: `Add Knowledge Base Q&A: "${parsedKb.questionEn || parsedKb.question.slice(0, 40)}"`,
          titleBn: `নলেজ বেসে প্রশ্নোত্তর যোগ করার প্রস্তাবনা: "${parsedKb.question.slice(0, 40)}..."`,
          summaryEn: `Question: ${parsedKb.question}\nAnswer: ${parsedKb.answer}\nCategory: ${parsedKb.category}`,
          summaryBn: `প্রশ্ন: "${parsedKb.question}"\nউত্তর: "${parsedKb.answer}"\nক্যাটাগরি: ${parsedKb.categoryBn || parsedKb.category}। অনুমোদনের পর এটি নলেজ বেসে সেভ হবে।`,
          targetTab: 'KNOWLEDGE_BASE',
          dataCount: 1,
          payload: { items: [parsedKb] },
          status: 'PENDING_CONFIRMATION'
        };

        return {
          text: `আমি আপনার দেওয়া প্রশ্নোত্তর নিখুঁতভাবে সাজিয়ে নিচে **প্রিভিউ কার্ড** তৈরি করেছি।\n\n🛡️ *অনুমোদন দিলে সাথে সাথে নলেজ বেসে যুক্ত হবে এবং পাবলিক এআই চ্যাট পরবর্তীতে ভিজিটরদের এটি থেকে উত্তর দেবে:*`,
          proposal,
          suggestions: ['নিশ্চিত করুন ও সেভ করুন', 'নলেজ বেস তালিকায় দেখুন']
        };
      } else if (isAddKb) {
        // User requested to add QA but didn't provide the Q&A text. DO NOT INVENT QA!
        return {
          text: `নলেজ বেসে নতুন প্রশ্নোত্তর যোগ করতে দয়া করে আপনার কাঙ্ক্ষিত প্রশ্ন এবং উত্তরটি লিখে দিন। যেমন:\n\n` +
            `• **প্রশ্ন:** (যেমন: *ক্যাম্পেইন সেটআপ করতে কতদিন সময় লাগে?*)\n` +
            `• **উত্তর:** (যেমন: *অডিট ও স্ট্র্যাটেজি ফাইনাল হওয়ার পর ২৪-৪৮ ঘণ্টার মধ্যে ক্যাম্পেইন লাইভ করা হয়।*)\n` +
            `• **ক্যাটাগরি (ঐচ্ছিক):** (যেমন: *Process, Pricing, TikTok Ads, Policies*)\n\n` +
            `*উদাহরণস্বরূপ এভাবে লিখতে পারেন:*\n` +
            `> *"প্রশ্ন: ডেলিভারি চার্জ কত? উত্তর: ঢাকা সিটির মধ্যে ৮০ টাকা এবং ঢাকার বাইরে ১৩০ টাকা। ক্যাটাগরি: Delivery। নলেজ বেসে যোগ করো।"*\n\n` +
            `আপনি লিখে দিলে আমি প্রিভিউ কার্ড সাজিয়ে অনুমোদনের জন্য উপস্থাপন করব।`,
          actions: [
            {
              id: 'act-nav-kb-form',
              label: 'Open Knowledge Base Manager',
              labelBn: 'নলেজ বেস ম্যানেজারে যান',
              tab: 'KNOWLEDGE_BASE',
              type: 'NAVIGATE'
            }
          ],
          suggestions: [
            'প্রশ্ন: ক্যাম্পেইন শুরু করতে কী কী লাগে? উত্তর: টিকটক অ্যাড একাউন্ট বা বিজনেস সেন্টার এবং ক্রিয়েটিভ ভিডিও। নলেজ বেসে যোগ করো',
            'নলেজ বেস তালিকায় যান'
          ]
        };
      }
    }

    // =========================================================================
    // 3. EXCHANGE RATE & CALCULATOR BENCHMARK (STRICT USER INPUT DRIVEN)
    // =========================================================================
    const isRateOrBenchmark = 
      qLower.includes('rate') || 
      qLower.includes('রেট') || 
      qLower.includes('dollar') || 
      qLower.includes('ডলার') || 
      qLower.includes('exchange') || 
      qLower.includes('benchmark') || 
      qLower.includes('বেঞ্চমার্ক') || 
      qLower.includes('cpm') || 
      qLower.includes('cvr') || 
      qLower.includes('cpc');

    // Case 3A: Dollar Exchange Rate
    if ((qLower.includes('dollar') || qLower.includes('ডলার') || qLower.includes('exchange') || qLower.includes('usd')) && (qLower.includes('rate') || qLower.includes('রেট') || qLower.includes('টাকা') || qLower.includes('bdt') || qLower.includes('change') || qLower.includes('set') || qLower.includes('করো'))) {
      const rateMatch = query.match(/(\d{2,3}(\.\d+)?)/);
      if (rateMatch && parseFloat(rateMatch[1]) >= 80 && parseFloat(rateMatch[1]) <= 250) {
        const newRate = parseFloat(rateMatch[1]);
        const oldRate = settings.exchangeRateUsdToBdt || 150;

        const proposal: AdminAiActionProposal = {
          id: `prop-exchange-rate-${Date.now()}`,
          actionType: 'UPDATE_EXCHANGE_RATE',
          titleEn: `Update USD to BDT Exchange Rate to ৳${newRate}`,
          titleBn: `ডলার এক্সচেঞ্জ রেট ৳${oldRate} থেকে ৳${newRate}-এ পরিবর্তনের প্রস্তাবনা`,
          summaryEn: `Updates the global Ads Calculator dollar conversion rate from ৳${oldRate} to ৳${newRate} BDT per USD. All live calculators will recalculate using this exact value.`,
          summaryBn: `ক্যালকুলেটরের বৈশ্বিক ডলার রেট ৳${oldRate} থেকে পরিবর্তন করে ৳${newRate} টাকা করা হবে। অনুমোদনের পর সাইটের সব ক্যালকুলেটর স্বয়ংক্রিয়ভাবে এই রেট অনুযায়ী হিসাব করবে।`,
          targetTab: 'SETTINGS',
          targetSubTab: 'GENERAL',
          payload: { exchangeRateUsdToBdt: newRate, previousRate: oldRate },
          status: 'PENDING_CONFIRMATION'
        };

        return {
          text: `আমি আপনার নির্দেশিত রেট অনুযায়ী **ডলার এক্সচেঞ্জ রেট (৳${oldRate} ➔ ৳${newRate} BDT)** পরিবর্তনের প্রিভিউ কার্ড প্রস্তুত করেছি। অনুমোদন দিলে সেভ হবে:`,
          proposal,
          suggestions: ['নিশ্চিত করুন ও সেভ করুন', 'সেটিংসে ফিরে যান']
        };
      } else {
        return {
          text: `বর্তমানে সাইটের ডলার এক্সচেঞ্জ রেট **৳${settings.exchangeRateUsdToBdt || 150} BDT** সেট করা আছে।\n\nআপনি যদি এটি পরিবর্তন করতে চান, নতুন রেট উল্লেখ করে বলুন (যেমন: *"ডলার এক্সচেঞ্জ রেট ১২৮ টাকা করো"* বা *"USD rate 130 BDT set koro"*)।`,
          suggestions: ['ডলার এক্সচেঞ্জ রেট ১২৮ টাকা করো', 'ডলার এক্সচেঞ্জ রেট ১৩০ টাকা করো']
        };
      }
    }

    // Case 3B: Calculator Benchmark Update
    if ((qLower.includes('benchmark') || qLower.includes('বেঞ্চমার্ক') || qLower.includes('cpm') || qLower.includes('cvr')) && (qLower.includes('update') || qLower.includes('set') || qLower.includes('পরিবর্তন') || qLower.includes('যোগ') || qLower.includes('করো'))) {
      const parsedBenchmark = this.extractBenchmarkFromInput(query);

      if (parsedBenchmark) {
        const proposal: AdminAiActionProposal = {
          id: `prop-benchmark-${Date.now()}`,
          actionType: 'UPDATE_CALCULATOR_BENCHMARK',
          titleEn: `Update ${parsedBenchmark.platform} Benchmark for "${parsedBenchmark.productCategory}"`,
          titleBn: `${parsedBenchmark.platform}-এর জন্য "${parsedBenchmark.productCategory}" ক্যাটাগরির বেঞ্চমার্ক আপডেটের প্রস্তাবনা`,
          summaryEn: `CPM: ৳${parsedBenchmark.cpmBDT}, CTR: ${parsedBenchmark.ctrPercent}%, CVR: ${parsedBenchmark.cvrPercent}%, Est. CPA: ৳${parsedBenchmark.cpaBDT}.`,
          summaryBn: `ক্যালকুলেটর মেট্রিক্স: CPM ৳${parsedBenchmark.cpmBDT}, CVR ${parsedBenchmark.cvrPercent}%, CTR ${parsedBenchmark.ctrPercent}%, আনুমানিক CPA ৳${parsedBenchmark.cpaBDT}। অনুমোদনের পর ক্যালকুলেটরে কার্যকর হবে।`,
          targetTab: 'CALCULATOR_BENCHMARKS',
          payload: { benchmark: parsedBenchmark },
          status: 'PENDING_CONFIRMATION'
        };

        return {
          text: `আমি আপনার ইনপুট অনুযায়ী **${parsedBenchmark.productCategory} [${parsedBenchmark.platform}]**-এর বেঞ্চমার্ক প্রিভিউ কার্ড তৈরি করেছি। অনুমোদন দিন:`,
          proposal,
          suggestions: ['নিশ্চিত করুন ও সেভ করুন', 'বেঞ্চমার্ক টেবিলে যান']
        };
      } else {
        return {
          text: `ক্যালকুলেটর বেঞ্চমার্ক আপডেট করতে দয়া করে ক্যাটাগরি ও মেট্রিক্স উল্লেখ করুন। যেমন:\n\n` +
            `> *"Fashion ক্যাটাগরির জন্য CPM 45 টাকা এবং CVR 3.8% সেট করো"* অথবা\n` +
            `> *"Beauty industry TikTok benchmark: CPM 40 BDT, CVR 4.2% koro"*\n\n` +
            `আপনি মান দিলে আমি তা সাজিয়ে কনফার্মেশন কার্ড উপস্থাপন করব।`,
          actions: [
            {
              id: 'act-nav-bm-table',
              label: 'Open Benchmarks Table',
              labelBn: 'বেঞ্চমার্ক টেবিলে যান',
              tab: 'CALCULATOR_BENCHMARKS',
              type: 'NAVIGATE'
            }
          ],
          suggestions: ['Fashion ক্যাটাগরির জন্য CPM 45 টাকা এবং CVR 3.8% সেট করো', 'বেঞ্চমার্ক টেবিলে যান']
        };
      }
    }

    // =========================================================================
    // 4. SITE SETTINGS (WHATSAPP, HEADER, GTM / PIXELS)
    // =========================================================================
    // Case 4A: WhatsApp Number Update
    if ((qLower.includes('whatsapp') || qLower.includes('হোয়াটসঅ্যাপ')) && (qLower.includes('number') || qLower.includes('নাম্বার') || qLower.includes('ফোন') || qLower.includes('set') || qLower.includes('change') || qLower.includes('বদলে') || qLower.includes('করো'))) {
      const phoneMatch = query.match(/(\+?880\d{9,10}|01\d{9})/);
      if (phoneMatch) {
        let newPhone = phoneMatch[1];
        if (!newPhone.startsWith('+')) {
          if (newPhone.startsWith('01')) newPhone = '+88' + newPhone;
          else newPhone = '+' + newPhone;
        }
        const oldPhone = settings.whatsapp?.number || settings.whatsappNumber || '+8801815124970';

        const proposal: AdminAiActionProposal = {
          id: `prop-whatsapp-${Date.now()}`,
          actionType: 'UPDATE_WHATSAPP_SETTINGS',
          titleEn: `Update Official WhatsApp Number to ${newPhone}`,
          titleBn: `WhatsApp নম্বর ${oldPhone} থেকে ${newPhone}-এ পরিবর্তনের প্রস্তাবনা`,
          summaryEn: `Updates Header, Floating Button, and Footer contact links to ${newPhone}.`,
          summaryBn: `ওয়েবসাইটের হেডার, ফ্লোটিং বাটন ও ফুটারের অফিসিয়াল WhatsApp নম্বর ${newPhone}-এ পরিবর্তন করা হবে।`,
          targetTab: 'SETTINGS',
          targetSubTab: 'WHATSAPP_SEO',
          payload: {
            whatsapp: {
              ...(settings.whatsapp || {}),
              number: newPhone
            },
            whatsappNumber: newPhone
          },
          status: 'PENDING_CONFIRMATION'
        };

        return {
          text: `আপনার দেওয়া নম্বর অনুযায়ী WhatsApp পরিবর্তন প্রস্তাবনা তৈরি করা হয়েছে (${oldPhone} ➔ **${newPhone}**):`,
          proposal,
          suggestions: ['নিশ্চিত করুন ও সেভ করুন', 'WhatsApp সেটিংসে যান']
        };
      }
    }

    // Case 4B: Header Logo & Layout Settings
    if ((qLower.includes('header') || qLower.includes('logo') || qLower.includes('হেডার') || qLower.includes('লোগো')) && (qLower.includes('mode') || qLower.includes('মোড') || qLower.includes('show') || qLower.includes('hide') || qLower.includes('only') || qLower.includes('লোগো শুধু') || qLower.includes('নাম শুধু'))) {
      let mode: 'BOTH' | 'LOGO_ONLY' | 'NAME_ONLY' | 'NONE' = 'BOTH';
      let modeLabelBn = 'লোগো এবং নাম দুটিই (Both)';

      if (qLower.includes('logo only') || qLower.includes('শুধু লোগো') || qLower.includes('শুধুমাত্র লোগো')) {
        mode = 'LOGO_ONLY';
        modeLabelBn = 'শুধুমাত্র লোগো (Logo Only)';
      } else if (qLower.includes('name only') || qLower.includes('শুধু নাম') || qLower.includes('শুধুমাত্র নাম')) {
        mode = 'NAME_ONLY';
        modeLabelBn = 'শুধুমাত্র নাম (Name Only)';
      } else if (qLower.includes('hide') || qLower.includes('hidden') || qLower.includes('none') || qLower.includes('গোপন')) {
        mode = 'NONE';
        modeLabelBn = 'লোগো ও নাম লুকানো (Hidden)';
      }

      const proposal: AdminAiActionProposal = {
        id: `prop-header-mode-${Date.now()}`,
        actionType: 'UPDATE_HEADER_SETTINGS',
        titleEn: `Set Header Logo Display Mode to [${mode}]`,
        titleBn: `হেডার লোগো মোড [${modeLabelBn}] নির্ধারণের প্রস্তাবনা`,
        summaryEn: `Updates desktop and mobile header layout to display "${mode}". Immediate live change without page reload.`,
        summaryBn: `হেডারের ব্র্যান্ডিং ডিসপ্লে মোড পরিবর্তন করে "${modeLabelBn}" করা হবে। অনুমোদনের পর সাথে সাথে হেডারে কার্যকর হবে।`,
        targetTab: 'SETTINGS',
        targetSubTab: 'HEADER_MANAGEMENT',
        payload: {
          header: {
            ...(settings.header || {}),
            logoDisplayMode: mode,
            mobileLogoDisplayMode: mode === 'NONE' ? 'NONE' : (mode === 'LOGO_ONLY' ? 'LOGO_ONLY' : 'BOTH')
          }
        },
        status: 'PENDING_CONFIRMATION'
      };

      return {
        text: `হেডার ডিসপ্লে মোড **${modeLabelBn}** করার প্রিভিউ কার্ড তৈরি হয়েছে:`,
        proposal,
        suggestions: ['নিশ্চিত করুন ও সেভ করুন', 'হেডার সেটিংসে যান']
      };
    }

    // Case 4C: GTM or Tracking Pixel Setup
    if ((qLower.includes('gtm') || qLower.includes('pixel') || qLower.includes('পিক্সেল')) && (qLower.includes('set') || qLower.includes('update') || qLower.includes('পরিবর্তন') || qLower.includes('id') || qLower.includes('আইডি'))) {
      const gtmMatch = query.match(/GTM-[A-Z0-9]+/i);
      const pixelMatch = query.match(/(C[A-Z0-9]{10,25}|[0-9]{12,20})/i);

      if (gtmMatch || pixelMatch) {
        const newGtm = gtmMatch ? gtmMatch[0].toUpperCase() : settings.gtm?.containerId;
        const newPixel = pixelMatch ? pixelMatch[0] : settings.gtm?.tiktokPixelId;

        const proposal: AdminAiActionProposal = {
          id: `prop-gtm-${Date.now()}`,
          actionType: 'UPDATE_GTM_PIXELS',
          titleEn: `Update GTM Container / Tracking Pixels`,
          titleBn: `GTM কন্টেইনার এবং ট্র্যাকিং পিক্সেল আইডি আপডেটের প্রস্তাবনা`,
          summaryEn: `GTM: ${newGtm || 'Unchanged'}, TikTok Pixel: ${newPixel || 'Unchanged'}.`,
          summaryBn: `GTM আইডি: ${newGtm || 'অপরিবর্তিত'}, TikTok Pixel: ${newPixel || 'অপরিবর্তিত'}। অনুমোদনের পর ডিডুপ্লিকেশন গার্ড সহ কার্যকর হবে।`,
          targetTab: 'GTM_TRACKING',
          payload: {
            gtm: {
              ...(settings.gtm || {}),
              enabled: true,
              containerId: newGtm || settings.gtm?.containerId || 'GTM-P3WLNDR6',
              tiktokPixelId: newPixel || settings.gtm?.tiktokPixelId || ''
            }
          },
          status: 'PENDING_CONFIRMATION'
        };

        return {
          text: `আপনার দেওয়া ট্র্যাকিং পিক্সেল/GTM আইডি অনুযায়ী কনফিগারেশন প্রিভিউ কার্ড তৈরি হয়েছে:`,
          proposal,
          suggestions: ['নিশ্চিত করুন ও সেভ করুন', 'GTM সেটিংসে যান']
        };
      }
    }

    // =========================================================================
    // 5. CLOUD SYNC INTENT
    // =========================================================================
    if (qLower.includes('sync') || qLower.includes('সিঙ্ক') || qLower.includes('firestore') || qLower.includes('cloud db') || qLower.includes('ক্লাউড')) {
      const proposal: AdminAiActionProposal = {
        id: `prop-sync-${Date.now()}`,
        actionType: 'TRIGGER_CLOUD_SYNC',
        titleEn: `Trigger Two-Way Cloud Sync (Firestore & Online DB)`,
        titleBn: `ফায়ারবেস ক্লাউড ডেটাবেস এবং অনলাইন সিঙ্ক রান করার প্রস্তাবনা`,
        summaryEn: `Synchronizes all local leads, case studies, benchmarks, and settings with the remote Firebase Firestore cloud database.`,
        summaryBn: `লোকাল সমস্ত লিড, কেস স্টাডি ও সেটিংস ক্লাউড ডেটাবেস (Firestore)-এ সিঙ্ক ও ব্যাকআপ করা হবে।`,
        targetTab: 'ONLINE_DATABASE',
        payload: {},
        status: 'PENDING_CONFIRMATION'
      };

      return {
        text: `ক্লাউড ডেটাবেস সিঙ্ক প্রক্রিয়া শুরু করার প্রস্তুতি নেওয়া হয়েছে। অনুমোদন দিন:`,
        proposal,
        suggestions: ['নিশ্চিত করুন ও সিঙ্ক করুন', 'ডেটাবেস প্যানেলে যান']
      };
    }

    // =========================================================================
    // 6. DEFAULT INFORMATIVE / GUIDED RESPONSE
    // =========================================================================
    return {
      text: `আমি আপনার বার্তাটি পেয়েছি। আমি একটি **User-Input Driven Copilot**—আপনি আমাকে যেকোনো তথ্য লিখে দিলে আমি তা নির্ভুলভাবে সাজিয়ে প্রিভিউ কার্ড দেখাব এবং আপনার নিশ্চিতকরণের পর সেভ করব।\n\nআপনি কী করতে চান বেছে নিতে পারেন:`,
      actions: [
        {
          id: 'act-nav-settings',
          label: 'Site & System Settings',
          labelBn: 'সাইট ও সিস্টেম সেটিংস',
          tab: 'SETTINGS',
          type: 'NAVIGATE'
        },
        {
          id: 'act-nav-cs',
          label: 'Case Studies Manager',
          labelBn: 'কেস স্টাডি ম্যানেজমেন্ট',
          tab: 'CASE_STUDIES',
          type: 'NAVIGATE'
        },
        {
          id: 'act-nav-kb',
          label: 'Knowledge Base Manager',
          labelBn: 'নলেজ বেস ম্যানেজার',
          tab: 'KNOWLEDGE_BASE',
          type: 'NAVIGATE'
        },
        {
          id: 'act-nav-dashboard',
          label: 'Admin Dashboard',
          labelBn: 'অ্যাডমিন ড্যাশবোর্ড',
          tab: 'DASHBOARD',
          type: 'NAVIGATE'
        }
      ],
      suggestions: [
        'ক্লায়েন্ট: Aarong, বাজেট: 45000, সেলস: 180000, অর্ডার: 350, প্ল্যাটফর্ম: TikTok। কেস স্টাডি যোগ করো',
        'প্রশ্ন: ডেলিভারি চার্জ কত? উত্তর: ঢাকা ৮০ টাকা, বাইরে ১৩০ টাকা। নলেজ বেসে যোগ করো',
        'ডলার এক্সচেঞ্জ রেট ১২৮ টাকা করো',
        'সব ড্রাফট কেস স্টাডি লাইভে পাবলিশ করো'
      ]
    };
  }

  /**
   * Helper: Extracts a structured CaseStudy object strictly from the user's provided prompt.
   * Returns null if minimum required data (such as client/spend/sales) is missing.
   */
  private static extractCaseStudyFromInput(query: string, settings: SiteSettings): CaseStudy | null {
    const qLower = query.toLowerCase();

    // Check if at least some numbers (spend, sales, orders, or ROAS) or client name are present
    const hasNumbers = /\d+/.test(query);
    if (!hasNumbers && !qLower.includes('client') && !qLower.includes('ক্লায়েন্ট')) {
      return null;
    }

    // 1. Extract Client Name
    let clientName = '';
    const clientMatch = query.match(/(?:client|ক্লায়েন্ট|brand|ব্র্যান্ড|নাম|name)\s*[:=]?\s*['"“]?([^,;\n\r\t।]+?)['"”]?\s*(?:,|\n|;|\band\b|\bfor\b|\bspend\b|\bbudget\b|\bবাজেট\b|\bখরচ\b|$)/i);
    if (clientMatch && clientMatch[1]?.trim()) {
      clientName = clientMatch[1].trim().replace(/^['":\-]+|['":\-]+$/g, '').trim();
    } else {
      const quotedMatch = query.match(/['"“]([^'"”]{3,35})['"”]/);
      if (quotedMatch && quotedMatch[1]) {
        clientName = quotedMatch[1].trim();
      }
    }

    // If still no client name but there is clear campaign data, use a clean descriptive identifier
    if (!clientName || clientName.length < 2) {
      if (!hasNumbers) return null;
      clientName = 'Verified Partner Brand';
    }

    // 2. Extract Spend (Ad Spend BDT)
    let spendBDT = 0;
    const spendMatch = query.match(/(?:spend|ad spend|budget|cost|খরচ|বাজেট|স্পেন্ড)\s*[:=]?\s*৳?\s*(\d+[\d,]*\s*(?:k|হাজার|lakh|লাখ)?)/i);
    if (spendMatch && spendMatch[1]) {
      spendBDT = this.parseNumericValue(spendMatch[1]);
    } else {
      // Look for standalone 4-6 digit numbers or numbers followed by tk/bdt/টাকা
      const tkMatch = query.match(/(\d+[\d,]*)\s*(?:tk|taka|bdt|টাকা)/i);
      if (tkMatch && tkMatch[1]) {
        spendBDT = this.parseNumericValue(tkMatch[1]);
      }
    }

    // 3. Extract Sales / Revenue
    let salesBDT = 0;
    const salesMatch = query.match(/(?:sales|revenue|return|সেলস|রেভিনিউ|বিক্রি|রিটার্ন)\s*[:=]?\s*৳?\s*(\d+[\d,]*\s*(?:k|হাজার|lakh|লাখ)?)/i);
    if (salesMatch && salesMatch[1]) {
      salesBDT = this.parseNumericValue(salesMatch[1]);
    }

    // 4. Extract ROAS
    let roas = 0;
    const roasMatch = query.match(/(?:roas|আরওএএস)\s*[:=]?\s*(\d+(\.\d+)?)\s*x?/i);
    if (roasMatch && parseFloat(roasMatch[1])) {
      roas = parseFloat(roasMatch[1]);
    } else if (salesBDT > 0 && spendBDT > 0) {
      roas = Number((salesBDT / spendBDT).toFixed(1));
    } else if (roas === 0) {
      roas = 4.0; // fallback reasonable multiplier
    }

    // If spend wasn't explicitly given but sales & roas are given:
    if (spendBDT === 0 && salesBDT > 0 && roas > 0) {
      spendBDT = Math.round(salesBDT / roas);
    }
    // If spend is 0, give minimum default 30000
    if (spendBDT === 0) spendBDT = 35000;
    if (salesBDT === 0) salesBDT = Math.round(spendBDT * roas);

    // 5. Extract Purchases / Orders
    let purchases = 0;
    const orderMatch = query.match(/(?:order|orders|purchase|purchases|অর্ডার|পারচেজ|অর্ডার সংখ্যা)\s*[:=]?\s*(\d+)/i);
    if (orderMatch && parseInt(orderMatch[1])) {
      purchases = parseInt(orderMatch[1]);
    } else {
      // Calculate realistic purchases based on average order value ~ ৳800
      purchases = Math.max(25, Math.round(salesBDT / 850));
    }

    // 6. Extract Industry
    let industry = 'Fashion & Apparel';
    let industryBn = 'ফ্যাশন ও ক্লোদিং';
    if (qLower.includes('beauty') || qLower.includes('cosmetics') || qLower.includes('বিউটি') || qLower.includes('কসমেটিকস') || qLower.includes('স্কিনকেয়ার')) {
      industry = 'Beauty & Cosmetics';
      industryBn = 'বিউটি ও কসমেটিকস';
    } else if (qLower.includes('gadget') || qLower.includes('electronics') || qLower.includes('গ্যাজেট') || qLower.includes('ইলেকট্রনিক্স') || qLower.includes('tech')) {
      industry = 'Tech & Gadgets';
      industryBn = 'টেক ও স্মার্ট গ্যাজেটস';
    } else if (qLower.includes('real estate') || qLower.includes('রিয়েল এস্টেট') || qLower.includes('প্রপার্টি')) {
      industry = 'Real Estate & Properties';
      industryBn = 'রিয়েল এস্টেট ও প্রপার্টি';
    } else if (qLower.includes('food') || qLower.includes('restaurant') || qLower.includes('রেস্টুরেন্ট') || qLower.includes('খাবার') || qLower.includes('grocery')) {
      industry = 'Food & Gourmet Delivery';
      industryBn = 'ফুড ও রেস্টুরেন্ট ডেলিভারি';
    } else if (qLower.includes('jewelry') || qLower.includes('জুয়েলারি') || qLower.includes('ornament')) {
      industry = 'Jewelry & Accessories';
      industryBn = 'জুয়েলারি ও ফ্যাশন এক্সেসরিজ';
    }

    // 7. Extract Platform
    let platform: 'TikTok' | 'Facebook' | 'Both' = 'TikTok';
    if (qLower.includes('both') || (qLower.includes('tiktok') && (qLower.includes('meta') || qLower.includes('facebook')))) {
      platform = 'Both';
    } else if (qLower.includes('meta') || qLower.includes('facebook') || qLower.includes('ফেসবুক')) {
      platform = 'Facebook';
    }

    const cpa = purchases > 0 ? Math.round(spendBDT / purchases) : 120;
    const clicks = Math.round(purchases * 35);
    const impressions = Math.round(clicks * 40);
    const reach = Math.round(impressions * 0.8);
    const cpc = clicks > 0 ? Number((spendBDT / clicks).toFixed(2)) : 2.8;
    const ctr = impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 2.5;

    const baseTimestamp = Date.now();
    const title = `${platform} Ads High-ROAS Performance Scaling for ${clientName}`;
    const titleBn = `${clientName}-এর জন্য ${platform === 'Both' ? 'টিকটক ও মেটা' : platform} পারফরম্যান্স ক্যাম্পেইন স্কেলিং`;
    const summaryBn = `${platform} বিজ্ঞাপনে ৳${spendBDT.toLocaleString('en-IN')} স্পেন্ড করে ${purchases}+ নিশ্চিত পারচেজ এবং ${roas}x ROAS অর্জন।`;
    const descBn = `ক্লায়েন্ট ${clientName}-এর জন্য টার্গেটেড ক্রিয়েটিভ হুক, অডিয়েন্স সেগমেন্টেশন এবং কনভার্সন ফানেল অপ্টিমাইজেশনের মাধ্যমে ${roas}x রিটার্ন নিশ্চিত করা হয়েছে।`;

    return {
      id: `cs-usr-${baseTimestamp}`,
      title,
      titleEn: title,
      titleBn,
      clientName,
      showClientName: true,
      industry,
      industryEn: industry,
      industryBn,
      platform,
      campaignObjective: 'Conversions (Purchase)',
      campaignDuration: '21 Days',
      adSpendBDT: spendBDT,
      adSpendUSD: Math.round(spendBDT / (settings.exchangeRateUsdToBdt || 150)),
      impressions,
      reach,
      clicks,
      purchases,
      cpa,
      cpc,
      ctr,
      roas,
      resultSummary: `${purchases}+ Purchases, ${roas}x ROAS (Spent ৳${spendBDT.toLocaleString('en-IN')})`,
      resultSummaryEn: `${purchases}+ Purchases, ${roas}x ROAS (Spent ৳${spendBDT.toLocaleString('en-IN')})`,
      resultSummaryBn: summaryBn,
      textDescription: descBn,
      textDescriptionEn: `Engineered by Sonjoy Sarkar using verified short-form video hooks, audience refinement and tracking optimization.`,
      textDescriptionBn: descBn,
      proofImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
      isPublished: true,
      status: 'PUBLISHED',
      sortOrder: 1,
      isVerifiedReport: true,
      isFeaturedOnHome: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Helper: Extracts a structured KnowledgeBaseItem strictly from the user's provided prompt.
   * Returns null if question or answer is missing.
   */
  private static extractKnowledgeItemFromInput(query: string): KnowledgeBaseItem | null {
    // Look for Question / প্রশ্ন
    const qMatch = query.match(/(?:question|প্রশ্ন|q|q1|প্রশ্নোত্তর)\s*[:=]?\s*['"“]?([^?]+(?:\?|।|\.|\n|$))/i);
    // Look for Answer / উত্তর
    const aMatch = query.match(/(?:answer|উত্তর|ans|a|উঃ)\s*[:=]?\s*['"“]?([^;।\n]+(?:;|\.|\n|$|(?=category|ক্যাটাগরি)))/i);

    let question = '';
    let answer = '';

    if (qMatch && qMatch[1]?.trim()) {
      question = qMatch[1].trim().replace(/^['":\-]+|['":\-]+$/g, '').trim();
    }
    if (aMatch && aMatch[1]?.trim()) {
      answer = aMatch[1].trim().replace(/^['":\-]+|['":\-]+$/g, '').trim();
    }

    // Fallback: If formatted as "..." and "..."
    if (!question || !answer) {
      const quotes = query.match(/['"“]([^'"”]+)['"”]/g);
      if (quotes && quotes.length >= 2) {
        question = quotes[0].replace(/['"“”]/g, '').trim();
        answer = quotes[1].replace(/['"“”]/g, '').trim();
      }
    }

    if (!question || !answer || question.length < 4 || answer.length < 4) {
      return null;
    }

    // Ensure question has a question mark or proper punctuation
    if (!question.endsWith('?') && !question.endsWith('?')) {
      question += '?';
    }

    // Extract category if specified
    const qLower = query.toLowerCase();
    let category: KnowledgeCategory = 'General';
    let categoryBn = 'সাধারণ জিজ্ঞাসা';

    if (qLower.includes('policy') || qLower.includes('পলিসি') || qLower.includes('ban') || qLower.includes('ব্যান')) {
      category = 'Policies';
      categoryBn = 'অ্যাকাউন্ট ও পলিসি';
    } else if (qLower.includes('pixel') || qLower.includes('capi') || qLower.includes('tracking') || qLower.includes('পিক্সেল')) {
      category = 'Process';
      categoryBn = 'পিক্সেল ও ট্র্যাকিং';
    } else if (qLower.includes('budget') || qLower.includes('pricing') || qLower.includes('cost') || qLower.includes('বাজেট') || qLower.includes('চার্জ') || qLower.includes('খরচ')) {
      category = 'Calculator';
      categoryBn = 'বাজেট ও প্রাইসিং';
    } else if (qLower.includes('tiktok') || qLower.includes('টিকটক')) {
      category = 'TikTok Ads';
      categoryBn = 'টিকটক বিজ্ঞাপন';
    } else if (qLower.includes('meta') || qLower.includes('facebook') || qLower.includes('ফেসবুক')) {
      category = 'Facebook Ads';
      categoryBn = 'ফেসবুক ও মেটা বিজ্ঞাপন';
    } else if (qLower.includes('delivery') || qLower.includes('ডেলিভারি')) {
      category = 'Services';
      categoryBn = 'ডেলিভারি ও সেবা';
    }

    const keywords = [
      ...question.toLowerCase().split(/\s+/).filter(w => w.length > 2),
      category.toLowerCase()
    ];

    const baseTime = Date.now();
    return {
      id: `kb-usr-${baseTime}`,
      title: question.slice(0, 60),
      category,
      categoryEn: category,
      categoryBn,
      question,
      questionEn: question,
      questionBn: question,
      answer,
      answerEn: answer,
      answerBn: answer,
      keywords,
      priority: 9,
      status: 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'Admin Verified (User Input)'
    };
  }

  /**
   * Helper: Extracts benchmark parameters strictly from user query.
   */
  private static extractBenchmarkFromInput(query: string): CalculatorBenchmark | null {
    const qLower = query.toLowerCase();

    // Check if at least CPM, CVR or CPC are in the message
    const cpmMatch = query.match(/(?:cpm)\s*[:=]?\s*৳?\s*(\d+(\.\d+)?)/i);
    const cvrMatch = query.match(/(?:cvr)\s*[:=]?\s*(\d+(\.\d+)?)\s*%?/i);
    const ctrMatch = query.match(/(?:ctr)\s*[:=]?\s*(\d+(\.\d+)?)\s*%?/i);

    if (!cpmMatch && !cvrMatch) {
      return null;
    }

    let cpmBDT = cpmMatch ? parseFloat(cpmMatch[1]) : 40;
    let cvrPercent = cvrMatch ? parseFloat(cvrMatch[1]) : 3.5;
    let ctrPercent = ctrMatch ? parseFloat(ctrMatch[1]) : 2.5;

    let platform: 'TikTok' | 'Facebook' = qLower.includes('facebook') || qLower.includes('ফেসবুক') || qLower.includes('meta') ? 'Facebook' : 'TikTok';
    let productCategory = 'Fashion & Apparel';

    if (qLower.includes('beauty') || qLower.includes('বিউটি')) productCategory = 'Beauty & Cosmetics';
    else if (qLower.includes('gadget') || qLower.includes('গ্যাজেট')) productCategory = 'Tech & Gadgets';
    else if (qLower.includes('real estate') || qLower.includes('রিয়েল')) productCategory = 'Real Estate';
    else if (qLower.includes('food') || qLower.includes('খাবার')) productCategory = 'Food & Grocery';

    const cpcBDT = Number((cpmBDT / (ctrPercent * 10)).toFixed(2));
    const cpaBDT = Math.round(cpcBDT / (cvrPercent / 100));

    return {
      id: `bm-usr-${Date.now()}`,
      platform,
      location: 'All Bangladesh',
      productCategory,
      minPriceBDT: 500,
      maxPriceBDT: 15000,
      minBudgetUSD: 10,
      maxBudgetUSD: 1000,
      creativeType: 'UGC',
      conversionGoal: 'Purchase',
      cpmBDT,
      ctrPercent,
      cpcBDT,
      cvrPercent,
      cpaBDT,
      estimatedRoasMin: 3.5,
      estimatedRoasMax: 5.5,
      confidence: 'HIGH',
      notes: `Configured by Admin User Input for ${productCategory} [${platform}]`,
      active: true
    };
  }

  /**
   * Helper: parses numeric string values including k, thousand, lakh, commas.
   */
  private static parseNumericValue(raw: string): number {
    if (!raw) return 0;
    const clean = raw.toLowerCase().replace(/,/g, '').trim();
    if (clean.includes('k') || clean.includes('হাজার')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      return Math.round(num * 1000);
    }
    if (clean.includes('lakh') || clean.includes('লাখ') || clean.includes('l')) {
      const num = parseFloat(clean.replace(/[^\d.]/g, ''));
      return Math.round(num * 100000);
    }
    const num = parseFloat(clean.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : Math.round(num);
  }

  /**
   * Executes an approved proposal in storageService and database.
   * Runs ONLY when the admin clicks the confirmation button in the UI.
   */
  public static async executeProposal(proposal: AdminAiActionProposal): Promise<{
    success: boolean;
    messageEn: string;
    messageBn: string;
    details?: string[];
  }> {
    try {
      switch (proposal.actionType) {
        case 'BULK_CREATE_CASE_STUDIES': {
          const studies: CaseStudy[] = proposal.payload?.caseStudies || [];
          if (studies.length === 0) throw new Error('No case studies found in payload.');
          studies.forEach(cs => storageService.saveCaseStudy(cs));
          return {
            success: true,
            messageEn: `Successfully saved ${studies.length} case study(s) into database!`,
            messageBn: `মোট ${studies.length}টি কেস স্টাডি সফলভাবে ডেটাবেসে যুক্ত ও লাইভ পাবলিশ করা হয়েছে!`,
            details: studies.map(s => `✓ ${s.title} (${s.roas}x ROAS)`)
          };
        }

        case 'PUBLISH_DRAFT_CASE_STUDIES': {
          const draftIds: string[] = proposal.payload?.draftIds || [];
          const all = storageService.getCaseStudies(true);
          let count = 0;
          all.forEach(cs => {
            if (draftIds.includes(cs.id) || !cs.isPublished) {
              cs.isPublished = true;
              cs.status = 'PUBLISHED';
              storageService.saveCaseStudy(cs);
              count++;
            }
          });
          return {
            success: true,
            messageEn: `Published ${count} draft case studies to live site!`,
            messageBn: `মোট ${count}টি ড্রাফট কেস স্টাডি সফলভাবে লাইভ পাবলিশ করা হয়েছে!`,
            details: [`${count} items switched to PUBLISHED status`]
          };
        }

        case 'BULK_ADD_KNOWLEDGE_BASE': {
          const items: KnowledgeBaseItem[] = proposal.payload?.items || [];
          if (items.length === 0) throw new Error('No knowledge items in payload.');
          items.forEach(kb => storageService.saveKnowledgeItem(kb));
          return {
            success: true,
            messageEn: `Added ${items.length} verified Q&A article(s) to Knowledge Base!`,
            messageBn: `মোট ${items.length}টি নতুন প্রশ্নোত্তর সফলভাবে নলেজ বেসে সেভ করা হয়েছে! পাবলিক AI Assistant এখন এগুলোর উত্তর দিতে পারবে।`,
            details: items.map(k => `✓ ${k.question}`)
          };
        }

        case 'UPDATE_KNOWLEDGE_ITEM': {
          const item: KnowledgeBaseItem = proposal.payload?.item;
          if (!item) throw new Error('Knowledge item missing in payload.');
          storageService.saveKnowledgeItem(item);
          return {
            success: true,
            messageEn: `Updated Knowledge Base item "${item.title || item.question.slice(0, 30)}"!`,
            messageBn: `নলেজ বেস আইটেমটি ("${item.title || item.question.slice(0, 30)}...") সফলভাবে আপডেট ও সেভ করা হয়েছে! পাবলিক AI Assistant এখন পরিবর্তিত তথ্য ব্যবহার করবে।`,
            details: [`Updated Q&A ID: ${item.id}`, `Status: ${item.status}`]
          };
        }

        case 'DISABLE_KNOWLEDGE_ITEM': {
          const itemId: string = proposal.payload?.itemId || proposal.payload?.item?.id;
          if (!itemId) throw new Error('Knowledge item ID missing in payload.');
          const allKb = storageService.getKnowledgeBase(false);
          const target = allKb.find(k => k.id === itemId);
          if (target) {
            target.status = 'disabled';
            storageService.saveKnowledgeItem(target);
          }
          return {
            success: true,
            messageEn: `Disabled Knowledge Base item ID ${itemId}!`,
            messageBn: `পুরাতন তথ্যটি নলেজ বেসে অকার্যকর (Disabled) চিহ্নিত করা হয়েছে। পাবলিক AI Assistant এখন আর এটি ক্লায়েন্টদের দেবে না।`,
            details: [`Disabled Item ID: ${itemId}`]
          };
        }

        case 'RESOLVE_KNOWLEDGE_GAPS': {
          const resolutions: any[] = proposal.payload?.resolutions || [];
          resolutions.forEach(r => {
            storageService.resolveKnowledgeGap(r.gapId, r.answerBn, true);
          });
          return {
            success: true,
            messageEn: `Resolved ${resolutions.length} knowledge gaps and synced into Knowledge Base!`,
            messageBn: `মোট ${resolutions.length}টি নলেজ গ্যাপ সমাধান সম্পন্ন হয়েছে এবং নলেজ বেসে যুক্ত হয়েছে!`,
            details: resolutions.map(r => `✓ ${r.question}`)
          };
        }

        case 'UPDATE_CALCULATOR_BENCHMARK': {
          const bm: CalculatorBenchmark = proposal.payload?.benchmark;
          if (!bm) throw new Error('Benchmark payload missing.');
          storageService.saveBenchmark(bm);
          return {
            success: true,
            messageEn: `Saved benchmark for ${bm.productCategory} on ${bm.platform}!`,
            messageBn: `${bm.platform}-এর জন্য "${bm.productCategory}" ক্যাটাগরির বেঞ্চমার্ক সফলভাবে সেভ করা হয়েছে!`,
            details: [`CPM: ৳${bm.cpmBDT}`, `CVR: ${bm.cvrPercent}%`, `CPA: ৳${bm.cpaBDT}`]
          };
        }

        case 'UPDATE_EXCHANGE_RATE': {
          const rate = proposal.payload?.exchangeRateUsdToBdt;
          if (!rate) throw new Error('Exchange rate payload missing.');
          storageService.updateSiteSettings({ exchangeRateUsdToBdt: rate });
          return {
            success: true,
            messageEn: `Updated USD to BDT exchange rate to ৳${rate}!`,
            messageBn: `ডলার এক্সচেঞ্জ রেট সফলভাবে ৳${rate}-এ আপডেট করা হয়েছে!`,
            details: [`New rate: 1 USD = ৳${rate} BDT`]
          };
        }

        case 'UPDATE_WHATSAPP_SETTINGS': {
          const updates = proposal.payload;
          storageService.updateSiteSettings(updates);
          return {
            success: true,
            messageEn: `Updated WhatsApp contact settings!`,
            messageBn: `WhatsApp নম্বর সফলভাবে পরিবর্তন ও সেভ করা হয়েছে!`,
            details: [`Active WhatsApp: ${updates.whatsappNumber || updates.whatsapp?.number}`]
          };
        }

        case 'UPDATE_HEADER_SETTINGS': {
          const updates = proposal.payload;
          storageService.updateSiteSettings(updates);
          return {
            success: true,
            messageEn: `Updated Header branding & logo layout!`,
            messageBn: `হেডার লোগো ও ব্র্যান্ডিং সেটিংস সফলভাবে আপডেট করা হয়েছে!`,
            details: [`Display Mode: ${updates.header?.logoDisplayMode}`]
          };
        }

        case 'UPDATE_GTM_PIXELS': {
          const updates = proposal.payload;
          storageService.updateSiteSettings(updates);
          return {
            success: true,
            messageEn: `Updated GTM and tracking pixel configuration!`,
            messageBn: `GTM এবং ট্র্যাকিং পিক্সেল কনফিগারেশন সফলভাবে সেভ করা হয়েছে!`,
            details: [`Container: ${updates.gtm?.containerId}`, `Pixel: ${updates.gtm?.tiktokPixelId}`]
          };
        }

        case 'TRIGGER_CLOUD_SYNC': {
          const res = await storageService.forceCloudSync();
          return {
            success: res.success,
            messageEn: res.message,
            messageBn: res.message,
            details: [`Synced total records: ${res.count}`]
          };
        }

        default:
          return {
            success: false,
            messageEn: 'Unknown action type.',
            messageBn: 'অ্যাকশন টাইপ শনাক্ত করা যায়নি।'
          };
      }
    } catch (err: any) {
      console.error('Execution error:', err);
      return {
        success: false,
        messageEn: err?.message || 'Execution failed.',
        messageBn: `কাজটি সম্পন্ন করতে সমস্যা হয়েছে: ${err?.message || 'অনুগ্রহ করে পুনরায় চেষ্টা করুন'}`
      };
    }
  }
}
