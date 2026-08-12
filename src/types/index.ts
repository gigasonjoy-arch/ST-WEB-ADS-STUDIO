export type Role = 'admin' | 'editor';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: 'ADMIN' | 'EDITOR';
  status: 'ACTIVE' | 'DISABLED';
  passwordHash?: string;
  password?: string;
  passcode?: string;
  createdAt: string;
  lastLogin?: string;
  avatarUrl?: string;
}

export interface ProductPriceRange {
  id: string;
  labelEn: string;
  labelBn: string;
  minPriceBDT?: number;
  maxPriceBDT?: number;
  cvrMultiplier?: number;
  cpcMultiplier?: number;
  recommendedGoal?: 'Purchase' | 'Messages' | 'Lead';
  averageTicketBDT?: number;
  active: boolean;
  sortOrder?: number;
  minPrice?: number;
  maxPrice?: number;
  tier?: string;
  expectedCVR?: number;
  notes?: string;
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
  status?: 'PUBLISHED' | 'DRAFT';
  sortOrder: number;
  isVerifiedReport?: boolean;
  isFeaturedOnHome?: boolean;
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
  keywords?: string | string[];
  metaTitle?: string;
  metaDescription?: string;
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

export type LogoDisplayMode = 'BOTH' | 'LOGO_ONLY' | 'NAME_ONLY' | 'NONE';

export interface HeaderNavLink {
  id: string;
  labelEn: string;
  labelBn: string;
  sectionId: string;
  route?: string;
  pageSlug?: string;
  enabled: boolean;
  sortOrder: number;
}

export interface HeaderSettings {
  logoDisplayMode: LogoDisplayMode;
  mobileLogoDisplayMode: LogoDisplayMode;
  showLogo: boolean;
  showBrandName: boolean;
  showPersonalName: boolean;
  showTagline: boolean;
  logoType: 'TEXT_BADGE' | 'IMAGE_URL';
  logoText: string;
  logoImageUrl?: string;
  logoWidth?: number;
  logoHeight?: number;
  customTaglineEn?: string;
  customTaglineBn?: string;
  sticky: boolean;
  showLanguageSwitcher: boolean;
  showAdminButton: boolean;
  showWhatsAppButton: boolean;
  ctaEnabled: boolean;
  ctaTextEn: string;
  ctaTextBn: string;
  ctaAction: 'LEAD_FORM' | 'WHATSAPP' | 'CALCULATOR' | 'CUSTOM_URL';
  ctaCustomUrl?: string;
  navLinks: HeaderNavLink[];
}

export interface SectionVisibility {
  hero: boolean;
  results: boolean;
  services: boolean;
  audience: boolean;
  process: boolean;
  tiktokEducation: boolean;
  tiktokGuide?: boolean;
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

export interface ColorPalette {
  id: string;
  nameEn: string;
  nameBn: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonHoverBgColor: string;
  accentColor: string;
  linkColor: string;
  borderColor: string;
  cardBgColor: string;
  sectionBgColor: string;
  headerBgColor: string;
  headerTextColor: string;
  footerBgColor: string;
  footerTextColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
}

export interface SiteThemeSettings {
  activePaletteId: string;
  backgroundColor: string;
  textColor: string;
  headingColor: string;
  buttonBgColor: string;
  buttonTextColor: string;
  buttonHoverBgColor: string;
  accentColor: string;
  linkColor: string;
  borderColor: string;
  cardBgColor: string;
  sectionBgColor: string;
  headerBgColor: string;
  headerTextColor: string;
  footerBgColor: string;
  footerTextColor: string;
  badgeBgColor: string;
  badgeTextColor: string;
  customCss?: string;
}

export interface FaviconSettings {
  faviconUrl: string;
  appleTouchIconUrl?: string;
  faviconType: 'URL' | 'EMOJI' | 'SVG_TEXT';
  faviconEmoji?: string;
  badgeText?: string;
}

export interface ServicePackage {
  id: string;
  title: string;
  titleEn: string;
  titleBn: string;
  platform: string;
  pricingModel: string;
  description?: string;
  descriptionEn: string;
  descriptionBn: string;
  features: string[];
  active?: boolean;
}

export type PageStatus = 'PUBLISHED' | 'DRAFT' | 'DISABLED';

export type PageType = 
  | 'CUSTOM_CONTENT' 
  | 'CASE_STUDIES_ARCHIVE' 
  | 'SERVICES_ARCHIVE' 
  | 'TIKTOK_PLAYBOOK' 
  | 'FACEBOOK_ADS' 
  | 'MEDIA_GALLERY'
  | 'CALCULATOR_STANDALONE' 
  | 'CONTACT_STANDALONE'
  | 'ABOUT_SONJOY';

export type PageTemplate = 'DEFAULT' | 'FULL_WIDTH' | 'CONTAINED' | 'LANDING';

export interface CustomPage {
  id: string;
  titleEn: string;
  titleBn: string;
  slug: string;
  contentEn: string;
  contentBn: string;
  excerptEn?: string;
  excerptBn?: string;
  featuredImage?: string;
  pageType: PageType;
  template: PageTemplate;
  status: PageStatus;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  showInHeaderNav: boolean;
  showInFooterNav: boolean;
  sortOrder: number;
  isSystemPage?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface HomePageSettings {
  featuredCaseStudiesLimit: number;
  showOnlyFeaturedCaseStudies: boolean;
  caseStudiesHeadlineEn?: string;
  caseStudiesHeadlineBn?: string;
  caseStudiesSubheadlineEn?: string;
  caseStudiesSubheadlineBn?: string;
  viewAllCaseStudiesButtonTextEn?: string;
  viewAllCaseStudiesButtonTextBn?: string;
  viewAllCaseStudiesUrl?: string;
  featuredServicesLimit?: number;
  showServicesViewAll?: boolean;
}

export interface SocialLinkItem {
  id: string;
  platform: 'facebook' | 'tiktok' | 'youtube' | 'linkedin' | 'whatsapp' | 'instagram' | 'x' | 'telegram' | 'github' | 'custom';
  label: string;
  url: string;
  enabled: boolean;
  username?: string;
  sortOrder: number;
}

export interface SocialLinksSettings {
  facebook?: string;
  tiktok?: string;
  youtube?: string;
  linkedin?: string;
  whatsapp?: string;
  instagram?: string;
  xTwitter?: string;
  telegram?: string;
  github?: string;
  customLinks?: SocialLinkItem[];
  showInHeader?: boolean;
  showInFooter?: boolean;
  showInContactPage?: boolean;
}

export interface SchemaAddress {
  streetAddress?: string;
  addressLocality?: string;
  addressRegion?: string;
  postalCode?: string;
  addressCountry?: string;
}

export interface SchemaGeo {
  latitude?: string;
  longitude?: string;
}

export interface SchemaMarkupSettings {
  enabled: boolean;
  schemaType: 'ProfessionalService' | 'LocalBusiness' | 'Organization' | 'Person';
  name: string;
  alternateName?: string;
  description: string;
  url: string;
  logoUrl?: string;
  imageUrl?: string;
  telephone?: string;
  email?: string;
  address?: SchemaAddress;
  geo?: SchemaGeo;
  priceRange?: string;
  openingHours?: string;
  sameAs: string[];
  founderName?: string;
  founderJobTitle?: string;
  serviceOffered?: string[];
  customJsonLd?: string;
  includeFaqSchema?: boolean;
  includeBreadcrumbSchema?: boolean;
  lastUpdated?: string;
}

export interface SiteSettings {
  brandName: string;
  brandNameBn?: string;
  personalName: string;
  personalNameBn?: string;
  titleBadge: string;
  titleBadgeEn?: string;
  titleBadgeBn?: string;
  designation?: string;
  designationBn?: string;
  heroHeadline: string;
  heroHeadlineEn?: string;
  heroHeadlineBn?: string;
  heroSubheadline: string;
  heroSubheadlineEn?: string;
  heroSubheadlineBn?: string;
  primaryCtaText: string;
  primaryCtaTextEn?: string;
  primaryCtaTextBn?: string;
  secondaryCtaText: string;
  secondaryCtaTextEn?: string;
  secondaryCtaTextBn?: string;
  exchangeRateUsdToBdt: number;
  minAdBudgetUSD?: number;
  minAdBudgetBDT?: number;
  minMonthlyBudgetUSD?: number;
  minMonthlyBudgetBDT?: number;
  sonjoyBio: string;
  sonjoyBioEn?: string;
  sonjoyBioBn?: string;
  sonjoyRole: string;
  sonjoyRoleEn?: string;
  sonjoyRoleBn?: string;
  sonjoyImage: string;
  sonjoyDetailedBio?: string;
  sonjoyDetailedBioEn?: string;
  sonjoyDetailedBioBn?: string;
  sonjoyExperienceYears?: number;
  sonjoyTotalAdSpendManaged?: string;
  sonjoyCampaignsCount?: string;
  heroBadgeText?: string;
  heroBadgeTextEn?: string;
  heroBadgeTextBn?: string;
  heroStatAdGroups?: string;
  heroStatAdGroupsBn?: string;
  heroStatImpressions?: string;
  heroStatImpressionsBn?: string;
  heroStatConversations?: string;
  heroStatConversationsBn?: string;
  heroStatLeads?: string;
  heroStatLeadsBn?: string;
  heroPrimaryPlatform?: string;
  heroPrimaryPlatformBn?: string;
  heroSecondaryPlatform?: string;
  heroSecondaryPlatformBn?: string;
  heroTargetRegion?: string;
  heroTargetRegionBn?: string;
  heroSpecialistFocusTitle?: string;
  heroSpecialistFocusTitleEn?: string;
  heroSpecialistFocusTitleBn?: string;
  googleSheetsWebhookUrl?: string;
  email?: string;
  phone?: string;
  whatsappNumber?: string;
  officeLocation?: string;
  sectionVisibility: SectionVisibility;
  whatsapp: WhatsAppSettings;
  seo: SeoSettings;
  gtm: GtmSettings;
  header?: HeaderSettings;
  theme?: SiteThemeSettings;
  favicon?: FaviconSettings;
  homePage?: HomePageSettings;
  heroVideoMediaId?: string;
  tiktokEducationVideoMediaId?: string;
  robots?: RobotsSettings;
  sitemap?: SitemapSettings;
  socialLinks?: SocialLinksSettings;
  schemaMarkup?: SchemaMarkupSettings;
}

export interface RobotsSettings {
  content: string;
  allowAll: boolean;
  disallowAdmin: boolean;
  sitemapUrl: string;
  customRules: string;
  lastUpdated: string;
}

export interface SitemapSettings {
  baseUrl: string;
  includeCustomPages: boolean;
  includeServices: boolean;
  includeCaseStudies: boolean;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  priority: number;
  lastGenerated: string;
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
  | 'ONLINE_DATABASE'
  | 'USERS'
  | 'PAGES'
  | 'THEME_COLORS'
  | 'LEADS'
  | 'CASE_STUDIES'
  | 'CALCULATOR_BENCHMARKS'
  | 'WORKSPACE_SYNC'
  | 'PROFILE'
  | 'SOCIAL_MEDIA'
  | 'MEDIA'
  | 'KNOWLEDGE_BASE'
  | 'KNOWLEDGE_GAPS'
  | 'AI_CONVERSATIONS'
  | 'ANALYTICS'
  | 'GTM_TRACKING'
  | 'SCHEMA_MARKUP'
  | 'FIREBASE_STATUS'
  | 'ROBOTS_TXT'
  | 'SITEMAP'
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
  targetSubTab?: string;
  targetElementId?: string;
  targetParams?: Record<string, any>;
  actionLabel: string;
  actionLabelBn: string;
  iconName?: string;
  createdAt: string;
  isCompleted?: boolean;
  isDismissed?: boolean;
  metadata?: Record<string, any>;
}

export type AdminAiActionType = 
  | 'BULK_CREATE_CASE_STUDIES'
  | 'PUBLISH_DRAFT_CASE_STUDIES'
  | 'BULK_ADD_KNOWLEDGE_BASE'
  | 'RESOLVE_KNOWLEDGE_GAPS'
  | 'UPDATE_CALCULATOR_BENCHMARK'
  | 'UPDATE_EXCHANGE_RATE'
  | 'UPDATE_SITE_SETTINGS'
  | 'UPDATE_HEADER_SETTINGS'
  | 'UPDATE_WHATSAPP_SETTINGS'
  | 'UPDATE_GTM_PIXELS'
  | 'BATCH_UPDATE_LEADS'
  | 'TRIGGER_CLOUD_SYNC'
  | 'CUSTOM_EXECUTION';

export interface AdminAiActionProposal {
  id: string;
  actionType: AdminAiActionType;
  titleEn: string;
  titleBn: string;
  summaryEn: string;
  summaryBn: string;
  targetTab: AdminTab;
  targetSubTab?: string;
  dataCount?: number;
  payload: any;
  status: 'PENDING_CONFIRMATION' | 'EXECUTING' | 'COMPLETED' | 'REJECTED';
  executionResult?: {
    success: boolean;
    messageEn: string;
    messageBn: string;
    details?: string[];
  };
}

export interface AdminAiAction {
  id: string;
  label: string;
  labelBn: string;
  tab: AdminTab;
  subTab?: string;
  elementId?: string;
  params?: Record<string, any>;
  description?: string;
  descriptionBn?: string;
  type: 'NAVIGATE' | 'OPEN_MODAL' | 'EXECUTE_QUERY' | 'CONFIRM_ACTION';
}

export interface AdminAiMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  actions?: AdminAiAction[];
  suggestions?: string[];
  proposal?: AdminAiActionProposal;
  meta?: Record<string, any>;
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
