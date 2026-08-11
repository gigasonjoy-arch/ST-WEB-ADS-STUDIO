import { 
  AdminTask, 
  Lead,
  LeadSubmission, 
  KnowledgeGapItem, 
  AIConversation, 
  CaseStudy, 
  CalculatorBenchmark, 
  ProductPriceRange, 
  SiteSettings,
  AdminTab
} from '../types';

export class AutomationTaskService {
  /**
   * Evaluates all data sources and generates intelligent, prioritized tasks for the Admin
   */
  public static generateTasks(params: {
    leads: Lead[] | LeadSubmission[];
    knowledgeGaps: KnowledgeGapItem[];
    conversations: AIConversation[];
    caseStudies: CaseStudy[];
    benchmarks: CalculatorBenchmark[];
    priceRanges: ProductPriceRange[];
    siteSettings: SiteSettings;
    isFirebaseWorking?: boolean;
    firebaseErrorDetails?: string;
  }): AdminTask[] {
    const {
      leads = [],
      knowledgeGaps = [],
      caseStudies = [],
      benchmarks = [],
      priceRanges = [],
      siteSettings,
      isFirebaseWorking,
      firebaseErrorDetails
    } = params;

    const tasks: AdminTask[] = [];
    const now = new Date().toISOString();

    // 1. LEAD MANAGEMENT TASKS
    const newLeads = (leads as any[]).filter(l => l.status === 'NEW');
    if (newLeads.length > 0) {
      const urgentLead = newLeads[0];
      const serviceName = urgentLead.interestedService || urgentLead.calculatorSummary || 'TikTok/Facebook Ads Consultation';
      const phone = urgentLead.phone || urgentLead.whatsapp || 'WhatsApp Client';
      tasks.push({
        id: 'task-new-leads',
        title: `${newLeads.length} New Lead(s) Awaiting Follow-Up`,
        titleBn: `${newLeads.length}টি নতুন লিড দ্রুত যোগাযোগ ও রেসপন্সের অপেক্ষায় রয়েছে`,
        description: `You have ${newLeads.length} uncontacted inquiry/audit request(s). Latest from "${urgentLead.name}" (${phone} - ${serviceName}).`,
        descriptionBn: `সর্বশেষ লিড জমা দিয়েছেন "${urgentLead.name}" (${urgentLead.businessType || 'বিজনেস'} - ${phone})। ক্লায়েন্টকে দ্রুত হোয়াটসঅ্যাপে রিপ্লাই দিয়ে কনভার্ট করুন।`,
        reason: 'Responding to leads within 15 minutes increases closing conversion by over 70%.',
        reasonBn: 'নতুন লিড জমা পড়ার ১৫ মিনিটের মধ্যে রেসপন্স করলে কনভার্সন রেট ৭০% এর বেশি বৃদ্ধি পায়।',
        priority: 'CRITICAL',
        category: 'LEAD',
        targetTab: 'LEADS',
        actionLabel: 'Open Lead Management',
        actionLabelBn: 'লিড ম্যানেজমেন্টে যান',
        iconName: 'Users',
        createdAt: now,
        metadata: { count: newLeads.length, latestLeadId: urgentLead.id }
      });
    }

    // 2. KNOWLEDGE GAP TASKS
    const unresolvedGaps = knowledgeGaps.filter(g => !g.resolved && g.status !== 'resolved');
    if (unresolvedGaps.length > 0) {
      const topGap = unresolvedGaps.sort((a, b) => (b.frequency || b.count || 0) - (a.frequency || a.count || 0))[0];
      const gapQuery = topGap.query || topGap.question || 'Unknown visitor inquiry';
      const gapFrequency = topGap.frequency || topGap.count || 1;
      tasks.push({
        id: 'task-knowledge-gaps',
        title: `${unresolvedGaps.length} Unanswered Visitor Query in Knowledge Gap`,
        titleBn: `${unresolvedGaps.length}টি অজানা কাস্টমার প্রশ্নের উত্তর নলেজ বেসে অনুপস্থিত`,
        description: `Visitors frequently ask: "${gapQuery}" (Asked ${gapFrequency} times).`,
        descriptionBn: `ভিজিটররা এআই চ্যাটে এমন কিছু জানতে চেয়েছেন যার উত্তর স্টোরে নেই। যেমন: "${gapQuery}" (জিজ্ঞেস করেছে ${gapFrequency} বার)।`,
        reason: 'Adding answers to the Knowledge Base equips the AI Specialist to close client objections automatically.',
        reasonBn: 'এই প্রশ্নের উত্তর নলেজ বেসে যুক্ত করলে এআই স্বয়ংক্রিয়ভাবে ক্লায়েন্টকে বুঝিয়ে অডিট বুকিংয়ের দিকে নিয়ে যাবে।',
        priority: 'HIGH',
        category: 'KNOWLEDGE_GAP',
        targetTab: 'KNOWLEDGE_GAPS',
        actionLabel: 'Resolve Knowledge Gaps',
        actionLabelBn: 'নলেজ গ্যাপ সমাধান করুন',
        iconName: 'AlertCircle',
        createdAt: now,
        metadata: { gapId: topGap.id, query: gapQuery }
      });
    }

    // 3. ADS CALCULATOR BENCHMARK AUDIT
    const missingMetrics = benchmarks.filter(
      b => !b.cpcBDT || !b.ctrPercent || !b.cpmBDT || !b.cvrPercent || b.ctrPercent <= 0 || b.cvrPercent <= 0
    );
    if (missingMetrics.length > 0) {
      const sampleCategory = missingMetrics[0].productCategory || 'E-commerce';
      tasks.push({
        id: 'task-missing-benchmarks',
        title: `Audit Missing Benchmark Metrics in ${missingMetrics.length} Industry Row(s)`,
        titleBn: `ক্যালকুলেটরের ${missingMetrics.length}টি ইন্ডাস্ট্রির বেঞ্চমার্ক ডেটা অসম্পূর্ণ`,
        description: `Industries like "${sampleCategory}" have missing or zero CTR/CVR/CPM values.`,
        descriptionBn: `"${sampleCategory}" সহ ${missingMetrics.length}টি ক্যাটাগরির CTR, CVR অথবা CPM ডেটা শূন্য বা অসম্পূর্ণ। এতে ক্যালকুলেটরে ভুল হিসাব আসতে পারে।`,
        reason: 'Incomplete benchmarks will cause the Ads ROI calculator to return inaccurate projections to visitors.',
        reasonBn: 'বেঞ্চমার্ক অপূর্ণ থাকলে পাবলিক ক্যালকুলেটরে সম্ভাব্য সেলস ও ক্লিকের ভুল প্রেডিকশন প্রদর্শিত হবে।',
        priority: 'HIGH',
        category: 'BENCHMARK',
        targetTab: 'CALCULATOR_BENCHMARKS',
        actionLabel: 'Update Calculator Benchmarks',
        actionLabelBn: 'বেঞ্চমার্ক ডেটা ঠিক করুন',
        iconName: 'Calculator',
        createdAt: now,
        metadata: { missingCount: missingMetrics.length }
      });
    }

    // 4. PRODUCT PRICE TIERS AUDIT
    if (priceRanges.length < 3) {
      tasks.push({
        id: 'task-price-ranges',
        title: 'Add Standard Product Price Tiers for Accurate ROI Calculation',
        titleBn: 'ক্যালকুলেটরে বিভিন্ন প্রোডাক্ট প্রাইস রেঞ্জ (টায়ার) যুক্ত করুন',
        description: 'You currently have fewer than 3 product price tiers configured.',
        descriptionBn: 'বর্তমানে ৩টির কম প্রাইস রেঞ্জ কনফিগার করা আছে। কম ও বেশি দামের প্রোডাক্টের জন্য আলাদা CVR রেট সেট করা জরুরি।',
        reason: 'Visitors sell products ranging from ৳300 to ৳10,000+. Price tiers scale the CVR dynamically.',
        reasonBn: 'ক্লায়েন্টদের প্রোডাক্টের দাম অনুযায়ী সেলস কনভার্সন রেট ভিন্ন হয়, তাই প্রাইস টায়ার থাকা আবশ্যক।',
        priority: 'MEDIUM',
        category: 'BENCHMARK',
        targetTab: 'CALCULATOR_BENCHMARKS',
        actionLabel: 'Configure Price Tiers',
        actionLabelBn: 'প্রাইস রেঞ্জ কনফিগার করুন',
        iconName: 'TrendingUp',
        createdAt: now
      });
    }

    // 5. UNPUBLISHED DRAFT CONTENT / CASE STUDIES
    const draftCaseStudies = caseStudies.filter(c => !c.isPublished);
    if (draftCaseStudies.length > 0) {
      tasks.push({
        id: 'task-draft-case-studies',
        title: `${draftCaseStudies.length} Case Study in Draft Status`,
        titleBn: `${draftCaseStudies.length}টি কেস স্টাডি ড্রাফট (অপ্রকাশিত) অবস্থায় আছে`,
        description: `"${draftCaseStudies[0].title}" is currently saved as draft and hidden from landing page visitors.`,
        descriptionBn: `"${draftCaseStudies[0].title}" ড্রাফট হিসেবে সেভ করা রয়েছে এবং পাবলিক ল্যান্ডিং পেজে শো করছে না।`,
        reason: 'Publishing verified case studies builds social proof and drives organic consultation inquiries.',
        reasonBn: 'লাইভ কেস স্টাডি ক্লায়েন্টদের বিশ্বাসযোগ্যতা ও ক্যাম্পেইন বুকিংয়ের সিদ্ধান্ত দ্রুত নিতে সাহায্য করে।',
        priority: 'MEDIUM',
        category: 'CONTENT',
        targetTab: 'CASE_STUDIES',
        actionLabel: 'Review & Publish Case Studies',
        actionLabelBn: 'কেস স্টাডি পাবলিশ করুন',
        iconName: 'Sparkles',
        createdAt: now,
        metadata: { draftCount: draftCaseStudies.length }
      });
    }

    // 6. FIREBASE & CLOUD INFRASTRUCTURE STATUS
    if (isFirebaseWorking === false) {
      tasks.push({
        id: 'task-firebase-connection',
        title: 'Initialize Firestore Database in Firebase Console',
        titleBn: 'ফায়ারবেস ক্লাউড ডেটাবেস ইনিশিয়ালাইজ / একটিভ করুন',
        description: firebaseErrorDetails || 'Firestore database (default) is not yet initialized in project gen-lang-client-0372508566.',
        descriptionBn: 'প্রজেক্টে ফায়ারবেস অথ চালু থাকলেও ফায়ারস্টোর ডেটাবেস ইনস্ট্যান্স এখনো তৈরি করা হয়নি (404 Not Found)। লাইভ ডেটা সেভ করার জন্য ডেটাবেস ক্রিয়েট করা প্রয়োজন।',
        reason: 'Without Firestore provisioned, app operates in secure local persistence and cannot sync across external cloud terminals.',
        reasonBn: 'ক্লাউড ডেটাবেস ছাড়া লিড বা সেটিংস ক্লাউড ব্যাকআপ সিঙ্কে যাবে না, শুধুমাত্র ব্রাউজার লোকাল মেমরিতে থাকবে।',
        priority: 'CRITICAL',
        category: 'FIREBASE',
        targetTab: 'SETTINGS',
        actionLabel: 'Run Firebase Diagnostics & Setup',
        actionLabelBn: 'ফায়ারবেস টেস্ট ও গাইড দেখুন',
        iconName: 'Database',
        createdAt: now
      });
    }

    // 7. GOOGLE WORKSPACE SPREADSHEET SYNC
    const hasGoogleSheetLinked = Boolean(
      (siteSettings as any)?.googleSheetId || 
      (typeof window !== 'undefined' && window.localStorage?.getItem('st_google_sheet_id'))
    );

    if (!hasGoogleSheetLinked) {
      tasks.push({
        id: 'task-google-sheets-sync',
        title: 'Connect Google Sheets for Real-Time Lead Auto-Export',
        titleBn: 'গুগল শিট কানেক্ট করুন (লিড অটো-এক্সপোর্ট ও ব্যাকআপের জন্য)',
        description: 'No Google Sheet ID linked. Incoming leads are currently only saved locally in the dashboard.',
        descriptionBn: 'কোনো গুগল শিট লিঙ্ক করা নেই। নতুন লিড সরাসরি গুগল শিটে অটোমেটিক জমা করতে ইন্টিগ্রেশন চালু করুন।',
        reason: 'Instant spreadsheet backup protects lead data and lets your sales team receive notifications on phone.',
        reasonBn: 'গুগল শিট থাকলে মোবাইলে নোটিফিকেশন পাওয়া ও ক্লায়েন্ট টিম ম্যানেজ করা সহজ হয়।',
        priority: 'MEDIUM',
        category: 'SYSTEM',
        targetTab: 'WORKSPACE_SYNC',
        actionLabel: 'Setup Google Sheets Sync',
        actionLabelBn: 'গুগল শিট সিঙ্ক চালু করুন',
        iconName: 'Sheet',
        createdAt: now
      });
    }

    // 8. EXCHANGE RATE / CURRENCY CHECK
    if (!siteSettings?.exchangeRateUsdToBdt || siteSettings.exchangeRateUsdToBdt < 100) {
      tasks.push({
        id: 'task-currency-rate',
        title: 'Verify USD to BDT Conversion Rate Setting',
        titleBn: 'USD থেকে BDT ডলার এক্সচেঞ্জ রেট যাচাই করুন',
        description: `Current exchange rate is set to ৳${siteSettings?.exchangeRateUsdToBdt || 150}/USD.`,
        descriptionBn: `বর্তমান ডলার এক্সচেঞ্জ রেট ৳${siteSettings?.exchangeRateUsdToBdt || 150} সেট করা। বর্তমান ব্যাংক বা কার্ড রেটের সাথে সামঞ্জস্য রাখুন।`,
        reason: 'Accurate exchange rates ensure TikTok ad spend projections in BDT match actual bank billing.',
        reasonBn: 'ডলার রেট সঠিক থাকলে ক্যালকুলেটরে ভ্যাট ও কার্ডের প্রকৃত খরচের সঠিক হিসাব আসবে।',
        priority: 'LOW',
        category: 'SETTINGS',
        targetTab: 'SETTINGS',
        actionLabel: 'Adjust Exchange Rate',
        actionLabelBn: 'এক্সচেঞ্জ রেট আপডেট করুন',
        iconName: 'DollarSign',
        createdAt: now
      });
    }

    return tasks;
  }
}
