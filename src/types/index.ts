export type Role = 'admin' | 'editor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'EDITOR';
  status: 'ACTIVE' | 'DISABLED';
  passcode?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface ProductPriceRange {
  id: string;
  labelEn: string;
  labelBn: string;
  minPriceBDT: number;
  maxPriceBDT: number;
  cvrMultiplier: number;
  cpcMultiplier: number;
  recommendedGoal: 'Purchase' | 'Messages' | 'Lead';
  averageTicketBDT: number;
  active: boolean;
  sortOrder: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  createdAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'CONVERTED' | 'NOT_INTERESTED';

export interface LeadActivity {
  id: string;
  type: 'CALCULATOR_USED' | 'AI_CHAT_USED' | 'WHATSAPP_CLICKED' | 'CASE_STUDY_VIEWED' | 'FORM_SUBMITTED' | 'NOTE_ADDED' | 'STATUS_CHANGED';
  timestamp: string;
  description: string;
  metadata?: Record<string, any>;
}

export interface Lead {
  id: string;
  name: string;
  whatsapp: string;
  socialLink?: string; // Facebook or TikTok profile link
  location: string; // District/City in Bangladesh
  businessType?: string; // E-commerce, Fashion, Cosmetics, etc.
  monthlyBudget?: string;
  notes?: string;
  source: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  firstVisit: string;
  lastActivity: string;
  createdAt: string;
  status: LeadStatus;
  calculatorUsed: boolean;
  aiChatUsed: boolean;
  whatsappClicked: boolean;
  caseStudyViewed: boolean;
  calculatorSummary?: string;
  activities: LeadActivity[];
  visitorId: string;
}

export type PlatformType = 'TikTok' | 'Facebook' | 'Both';

export interface CaseStudy {
  id: string;
  title: string;
  titleEn?: string;
  titleBn?: string;
  clientName?: string;
  showClientName: boolean;
  industry: string;
  industryEn?: string;
  industryBn?: string;
  platform: 'TikTok' | 'Facebook' | 'Both';
  campaignObjective: string;
  campaignDuration?: string;
  adSpendBDT?: number;
  adSpendUSD?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  conversations?: number;
  leads?: number;
  purchases?: number;
  cpa?: number;
  cpl?: number;
  cpc?: number;
  ctr?: number;
  roas?: number;
  resultSummary: string;
  resultSummaryEn?: string;
  resultSummaryBn?: string;
  textDescription: string;
  textDescriptionEn?: string;
  textDescriptionBn?: string;
  proofImage?: string;
  additionalImages?: string[];
  videoUrl?: string;
  youtubeEmbed?: string;
  tiktokEmbed?: string;
  notes?: string;
  notesEn?: string;
  notesBn?: string;
  isPublished: boolean;
  sortOrder: number;
  isVerifiedReport?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreativeType = 'UGC' | 'Product Video' | 'Image' | 'Professional Video';
export type DurationOption = '7 days' | '14 days' | '30 days' | 'Custom';
export type ConversionGoal = 
  | 'Purchase'
  | 'Lead'
  | 'View Content'
  | 'Messages'
  | 'Link Clicks'
  | 'Video Views'
  | 'App Installs'
  | 'App Events'
  | 'Reach'
  | 'Post Engagement'
  | 'Follower Ads'
  | 'Calls'
  | 'Traffic';

export interface District {
  id: string;
  name: string;
  bnName: string;
  division: string;
  tier: 1 | 2 | 3;
  enabled: boolean;
}

export interface CalculatorBenchmark {
  id: string;
  platform: 'TikTok' | 'Facebook';
  location: string; // District or "All Bangladesh"
  productCategory: string;
  minPriceBDT: number;
  maxPriceBDT: number;
  minBudgetUSD: number;
  maxBudgetUSD: number;
  creativeType: CreativeType;
  conversionGoal: ConversionGoal;
  cpmBDT: number; // Cost per 1000 impressions in BDT
  ctrPercent: number; // Click through rate
  cpcBDT: number; // Cost per click
  cvrPercent: number; // Conversion rate %
  cpaBDT: number; // Cost per action/acquisition
  estimatedRoasMin: number;
  estimatedRoasMax: number;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  notes?: string;
  active: boolean;
}

export interface RecommendationRule {
  id: string;
  title: string;
  bnTitle: string;
  description: string;
  bnDescription: string;
  platform?: 'TikTok' | 'Facebook' | 'Both';
  productCategory?: string;
  creativeType?: CreativeType;
  minBudgetUSD?: number;
  maxBudgetUSD?: number;
  conversionGoal?: ConversionGoal;
  location?: string;
  priority: number;
  active: boolean;
}

export interface CalculatorInput {
  productCategory: string;
  productPriceBDT: number;
  creativeType: CreativeType;
  adBudgetUSD: number;
  duration?: DurationOption;
  customDays?: number;
  location: string;
  platform: 'TikTok' | 'Facebook' | 'Compare TikTok vs Facebook';
  conversionGoal: ConversionGoal;
  name?: string;
  whatsapp?: string;
  socialLink?: string;
}

export interface MetricRange {
  min: number;
  max: number;
  formatted: string;
}

export interface PlatformPrediction {
  platform: 'TikTok' | 'Facebook';
  estimatedReach: MetricRange;
  estimatedImpressions: MetricRange;
  estimatedClicks: MetricRange;
  estimatedResults: MetricRange; // Conversions/Leads/Messages
  resultLabel: string;
  estimatedCostPerResult: MetricRange; // CPA/CPL in BDT
  estimatedSalesValueBDT?: MetricRange;
  estimatedRoas: MetricRange;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceReason: string;
  benchmarkUsed: string;
}

export interface CalculatorOutput {
  inputs: CalculatorInput;
  adBudgetBDT: number;
  exchangeRate: number;
  tiktok?: PlatformPrediction;
  facebook?: PlatformPrediction;
  comparisonVerdict?: string;
  recommendations: RecommendationRule[];
  generatedAt: string;
}

export type KnowledgeCategory = 
  | 'Business'
  | 'Sonjoy'
  | 'TikTok Ads'
  | 'Facebook Ads'
  | 'Services'
  | 'Process'
  | 'Case Studies'
  | 'Calculator'
  | 'Contact'
  | 'Policies'
  | 'General';

export type KnowledgeStatus = 'published' | 'draft' | 'disabled';

export interface KnowledgeBaseItem {
  id: string;
  title: string;
  category: KnowledgeCategory;
  question: string;
  answer: string;
  questionEn?: string;
  questionBn?: string;
  answerEn?: string;
  answerBn?: string;
  categoryEn?: string;
  categoryBn?: string;
  keywords: string[];
  priority: number;
  status: KnowledgeStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
}

export interface KnowledgeGap {
  id: string;
  question: string;
  visitorId?: string;
  conversationId?: string;
  category?: string;
  aiResponseGiven?: string;
  count: number;
  lastAsked: string;
  suggestedAnswer?: string;
  adminAnswer?: string;
  status: 'unresolved' | 'resolved' | 'added_to_kb';
  createdAt: string;
}

export interface InChatPredictionData {
  budgetBDT: number;
  budgetUSD: number;
  category: string;
  platform: 'TikTok' | 'Facebook' | 'Both';
  impressions: string;
  reach: string;
  clicks: string;
  estimatedResults: string;
  resultLabel: string;
  estimatedRoas: string;
  avgCpa: string;
  verdict: string;
}

export interface InChatLeadCardData {
  stage: 'initial' | 'qualifying' | 'ready' | 'submitted';
  category?: string;
  budget?: string;
  submittedName?: string;
  submittedPhone?: string;
}

export interface AIMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  suggestedCtas?: Array<{
    label: string;
    action: 'LEAD_FORM' | 'CALCULATOR' | 'WHATSAPP' | 'CASE_STUDIES' | 'IN_CHAT_LEAD';
    url?: string;
  }>;
  knowledgeBaseItemIds?: string[];
  isFallback?: boolean;
  predictionData?: InChatPredictionData;
  leadFormCard?: InChatLeadCardData;
  isVoiceTranscript?: boolean;
}

export interface AIConversation {
  id: string;
  visitorId: string;
  startTime: string;
  lastActivity: string;
  messages: AIMessage[];
  topics: string[];
  knowledgeGapsIdentified: string[];
  calculatorUsed: boolean;
  leadSubmitted: boolean;
  device?: string;
  status: 'active' | 'closed';
}

export interface AISettings {
  enabled: boolean;
  provider: 'Gemini';
  primaryModel: string;
  backupModel: string;
  temperature: number;
  maxOutputTokens: number;
  systemInstruction: string;
  knowledgeRetrievalStrictness: 'STRICT_KB_ONLY' | 'ASSISTED';
  ctaStrategy: 'CONTEXTUAL' | 'SUBTLE' | 'DISABLED';
}

export interface AnalyticsEvent {
  id: string;
  visitorId: string;
  eventName: string;
  page: string;
  properties: Record<string, any>;
  timestamp: string;
}

export interface VisitorJourney {
  visitorId: string;
  firstSeen: string;
  lastSeen: string;
  sessionsCount: number;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser?: string;
  utmSource?: string;
  utmCampaign?: string;
  events: AnalyticsEvent[];
  associatedLeadId?: string;
}

export interface SocialLink {
  id: string;
  platform: 'Facebook' | 'LinkedIn' | 'YouTube' | 'TikTok' | 'WhatsApp' | 'Other';
  label: string;
  url: string;
  enabled: boolean;
  sortOrder: number;
}

export interface WhatsAppSettings {
  number: string;
  defaultMessage: string;
  enabled: boolean;
  floatingPosition: 'bottom-right' | 'bottom-left';
  ctaText: string;
}

export interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  robotsIndex: boolean;
}

export interface GtmSettings {
  enabled: boolean;
  containerId: string;
  tiktokPixelId?: string;
  metaPixelId?: string;
  googleAnalyticsId?: string;
  customHeadScript?: string;
  customBodyScript?: string;
}

export interface SectionVisibility {
  hero: boolean;
  results: boolean;
  services: boolean;
  audience: boolean;
  process: boolean;
  tiktokEducation: boolean;
  calculator: boolean;
  caseStudies: boolean;
  faq: boolean;
  leadForm: boolean;
  footer: boolean;
}

export interface ContentBlock {
  id: string;
  section: string;
  title: string;
  subtitle?: string;
  body: string;
  meta?: Record<string, any>;
}

export interface SiteSettings {
  brandName: string;
  personalName: string;
  titleBadge: string;
  designation?: string;
  heroHeadline: string;
  heroSubheadline: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  exchangeRateUsdToBdt: number;
  minAdBudgetUSD?: number;
  minAdBudgetBDT?: number;
  sonjoyBio: string;
  sonjoyRole: string;
  sonjoyImage: string;
  sonjoyDetailedBio?: string;
  sonjoyExperienceYears?: number;
  sonjoyTotalAdSpendManaged?: string;
  sonjoyCampaignsCount?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  officeLocation?: string;
  sectionVisibility: SectionVisibility;
  whatsapp: WhatsAppSettings;
  seo: SeoSettings;
  gtm: GtmSettings;
  heroVideoMediaId?: string;
  tiktokEducationVideoMediaId?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userName: string;
  userRole: Role;
  action: string;
  entity: string;
  details: string;
}

export interface MediaItem {
  id: string;
  title: string;
  url?: string;
  type: 'image' | 'video_embed' | 'youtube' | 'tiktok';
  embedCode?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  fileSize?: string;
  dimensions?: string;
  altText: string;
  placement?: 'hero' | 'tiktok_education' | 'case_studies' | 'media_gallery' | 'general' | 'none';
  isEnabled?: boolean;
  uploadedAt: string;
  description?: string;
}

export type AdminTab = 
  | 'DASHBOARD'
  | 'LEADS'
  | 'CASE_STUDIES'
  | 'CALCULATOR_BENCHMARKS'
  | 'WORKSPACE_SYNC'
  | 'PROFILE'
  | 'MEDIA'
  | 'USERS'
  | 'KNOWLEDGE_BASE'
  | 'KNOWLEDGE_GAPS'
  | 'AI_CONVERSATIONS'
  | 'ANALYTICS'
  | 'GTM_TRACKING'
  | 'SETTINGS';

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  questionEn?: string;
  questionBn?: string;
  answerEn?: string;
  answerBn?: string;
  categoryEn?: string;
  categoryBn?: string;
}

export interface LeadSubmission {
  id: string;
  name: string;
  phone: string;
  email?: string;
  businessType: string;
  interestedService: 'TIKTOK_ADS' | 'FACEBOOK_ADS' | 'BOTH';
  monthlyBudget?: string;
  websiteOrPage?: string;
  notes?: string;
  status: LeadStatus;
  createdAt: string;
  visitorId?: string;
  calculatorSnapshot?: {
    budgetBDT: number;
    durationDays?: number;
    estimatedActions?: number;
    estimatedROAS?: number;
    category?: string;
  };
}

export interface KnowledgeGapItem {
  id: string;
  question: string;
  query?: string;
  frequency?: number;
  resolved?: boolean;
  count?: number;
  lastAsked?: string;
  aiResponseGiven?: string;
  suggestedAnswer?: string;
  adminAnswer?: string;
  status?: 'unresolved' | 'resolved' | 'added_to_kb';
  createdAt?: string;
}

export type TaskPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type TaskCategory = 'BENCHMARK' | 'LEAD' | 'KNOWLEDGE_GAP' | 'CONTENT' | 'FIREBASE' | 'SETTINGS' | 'SYSTEM';

export interface AdminTask {
  id: string;
  title: string;
  titleBn: string;
  description: string;
  descriptionBn: string;
  reason: string;
  reasonBn: string;
  priority: TaskPriority;
  category: TaskCategory;
  targetTab: AdminTab;
  targetParams?: Record<string, any>;
  actionLabel: string;
  actionLabelBn: string;
  iconName?: string;
  createdAt: string;
  isCompleted?: boolean;
  isDismissed?: boolean;
  metadata?: Record<string, any>;
}

export interface FirebaseDiagnosticStep {
  step: string;
  stepBn: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'SKIPPED';
  detail: string;
  durationMs?: number;
}

export interface FirebaseTestReport {
  timestamp: string;
  isConnected: boolean;
  projectId: string;
  authDomain: string;
  steps: FirebaseDiagnosticStep[];
  overallStatus: 'OPERATIONAL' | 'DATABASE_NOT_INITIALIZED' | 'PERMISSION_DENIED' | 'CONFIG_ERROR' | 'NETWORK_ERROR';
  summaryEn: string;
  summaryBn: string;
  diagnosticDetail: string;
  rootCauseEn: string;
  rootCauseBn: string;
  recommendedActionEn: string[];
  recommendedActionBn: string[];
}
