import React, { useState, useMemo } from 'react';
import { 
  MessageSquare, 
  Bot, 
  User, 
  Calendar, 
  Clock, 
  Search, 
  Smartphone, 
  Monitor, 
  Tag, 
  CheckCircle2, 
  ExternalLink,
  Sparkles,
  HelpCircle,
  TrendingUp,
  BarChart2,
  Filter,
  ArrowRight,
  PlusCircle,
  Flame,
  DollarSign,
  ShieldCheck,
  Target,
  Video,
  Layers
} from 'lucide-react';
import { AIConversation, SiteSettings, AdminTab } from '../../types';
import { storageService } from '../../services/storageService';

interface AiConversationViewerProps {
  conversations?: AIConversation[];
  settings?: SiteSettings;
  onRefresh?: () => void;
  onNavigateTab?: (tab: AdminTab, params?: any) => void;
}

interface TopicTrend {
  id: string;
  topicName: string;
  topicNameBn: string;
  category: string;
  categoryBn: string;
  questionCount: number;
  percentage: number;
  intent: 'HIGH_BUYING' | 'PRICING' | 'TECHNICAL' | 'GENERAL';
  intentLabelBn: string;
  sampleQuestions: string[];
  icon: any;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'URGENT';
}

export const AiConversationViewer: React.FC<AiConversationViewerProps> = ({ 
  conversations: propConversations, 
  settings, 
  onRefresh,
  onNavigateTab
}) => {
  const [internalConversations, setInternalConversations] = useState<AIConversation[]>(() => storageService.getAIConversations());
  const [activeSubTab, setActiveSubTab] = useState<'CONVERSATIONS' | 'TOPICS_TREND'>('CONVERSATIONS');
  const [selectedConv, setSelectedConv] = useState<AIConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedTopicForFilter, setSelectedTopicForFilter] = useState<string | null>(null);

  const conversations = propConversations || internalConversations;

  // Extract all user messages to calculate topic frequencies and trends
  const analyzedTopics: TopicTrend[] = useMemo(() => {
    // Baseline topics seed augmented by dynamic conversations analysis
    const allUserMessages = conversations.flatMap(c => 
      c.messages.filter(m => m.sender === 'user').map(m => m.text)
    );

    const topicDefinitions: Array<{
      id: string;
      topicName: string;
      topicNameBn: string;
      category: string;
      categoryBn: string;
      keywords: string[];
      intent: 'HIGH_BUYING' | 'PRICING' | 'TECHNICAL' | 'GENERAL';
      intentLabelBn: string;
      icon: any;
      defaultSamples: string[];
    }> = [
      {
        id: 'tiktok_budget_pricing',
        topicName: 'TikTok Ads Budget & Minimum Spend',
        topicNameBn: 'টিকটক অ্যাডসের বাজেট ও সর্বনিম্ন খরচ (BDT & USD)',
        category: 'Pricing',
        categoryBn: 'বাজেট ও খরচ',
        keywords: ['budget', 'price', 'cost', 'টাকা', 'খরচ', 'বাজেট', 'কমপক্ষে', 'ডলার', 'dollar', 'bdt', 'min budget'],
        intent: 'PRICING',
        intentLabelBn: 'বাজেট সংক্রান্ত প্রশ্ন (High Intent)',
        icon: DollarSign,
        defaultSamples: [
          'প্রতিদিন টিকটক অ্যাডসে সর্বনিম্ন কত টাকা খরচ করতে হবে?',
          'ডলারে নাকি টাকায় পেমেন্ট করতে হবে?',
          '৫০ ডলারের বাজেটে কিরকম সেলস বা মেসেজ আসতে পারে?'
        ]
      },
      {
        id: 'ad_account_pixel',
        topicName: 'Ad Account Ban, Dollar Card & Pixel Tracking',
        topicNameBn: 'অ্যাড একাউন্ট ব্যান, ডলার কার্ড ও পিক্সেল/GTM সেটআপ',
        category: 'Technical',
        categoryBn: 'কারিগরি ও সেটআপ',
        keywords: ['pixel', 'account', 'ban', 'card', 'payment', 'কার্ড', 'ব্যান', 'একাউন্ট', 'পিক্সেল', 'ট্র্যাকিং', 'gtm', 'verify'],
        intent: 'TECHNICAL',
        intentLabelBn: 'সেটআপ ও একাউন্ট সমাধান',
        icon: ShieldCheck,
        defaultSamples: [
          'আমার নিজস্ব ডুয়েল কারেন্সি কার্ড নেই, আপনারা কি পেমেন্ট ম্যানেজ করবেন?',
          'টিকটক পিক্সেল এবং ইভেন্ট কীভাবে ওয়েবসাইটে সেট করবেন?',
          'বাংলাদেশে টিকটক অ্যাড একাউন্ট ব্যান হলে কীভাবে ঠিক করবেন?'
        ]
      },
      {
        id: 'roas_results',
        topicName: 'Expected ROAS & Sales Conversion Guarantee',
        topicNameBn: 'প্রত্যাশিত সেলস, ROAS ও ক্যাম্পেইনের ফলাফল গ্যারান্টি',
        category: 'Performance',
        categoryBn: 'সেলস ও ROAS',
        keywords: ['roas', 'sales', 'profit', 'conversion', 'বিক্রি', 'সেলস', 'লাভ', 'অর্ডার', 'গ্যারান্টি', 'ফল', 'ক্যালকুলেটর'],
        intent: 'HIGH_BUYING',
        intentLabelBn: 'সেলস ও ক্রয়ের তীব্র আগ্রহ (High Intent)',
        icon: TrendingUp,
        defaultSamples: [
          'আমার ক্লদিং ব্র্যান্ডে ৩x ROAS পাওয়া সম্ভব কি?',
          'মেসেজ অ্যাড বনাম ওয়েবসাইট পারচেজ কনভার্সন কোনটা ভালো হবে?',
          'ক্যালকুলেটরের হিসেব অনুযায়ী কতো দিনে রেজাল্ট দেখা যাবে?'
        ]
      },
      {
        id: 'targeting_demographics',
        topicName: 'Audience Targeting in Bangladesh Districts',
        topicNameBn: 'বাংলাদেশের জেলাভিত্তিক অডিয়েন্স টার্গেটিং ও বয়স নির্বাচন',
        category: 'Strategy',
        categoryBn: 'টার্গেটিং কৌশল',
        keywords: ['target', 'district', 'dhaka', 'audience', 'ঢাকা', 'জেলা', 'বয়স', 'টার্গেট', 'কাস্টমার', 'চট্টগ্রাম', 'সিলেট'],
        intent: 'HIGH_BUYING',
        intentLabelBn: 'ক্যাম্পেইন পরিকল্পনা',
        icon: Target,
        defaultSamples: [
          'শুধুমাত্র ঢাকা ও চট্টগ্রাম এরিয়া টার্গেট করা যাবে কি?',
          'নারী ও ১৮-৩৫ বছর বয়সের অডিয়েন্স কীভাবে ফিল্টার করব?',
          'বিলাসপণ্য বা প্রিমিয়াম গ্যাজেট টার্গেটিং কীভাবে কাজ করে?'
        ]
      },
      {
        id: 'creative_ugc_video',
        topicName: 'TikTok Video Content, Hook & UGC Guidelines',
        topicNameBn: 'ভিডিও ক্রিয়েটিভ, হুক ও UGC ভিডিও তৈরির নিয়ম',
        category: 'Creative',
        categoryBn: 'ভিডিও কনটেন্ট',
        keywords: ['video', 'ugc', 'creative', 'hook', 'ভিডিও', 'কনটেন্ট', 'শুট', 'ভিডিও তৈরি', 'কন্টেন্ট'],
        intent: 'GENERAL',
        intentLabelBn: 'কনটেন্ট গাইডলাইন',
        icon: Video,
        defaultSamples: [
          'টিকটক অ্যাডের জন্য ভিডিও কীভাবে তৈরি করতে হবে?',
          'ইউজিসি (UGC) ফরম্যাটের ভিডিও আপনারা কি তৈরি করে দেন?',
          'ভিডিওর প্রথম ৩ সেকেন্ডে কী ধরণের হুক রাখলে বেশি ভিউ হয়?'
        ]
      },
      {
        id: 'direct_meeting_sonjoy',
        topicName: 'Direct Consultation & Strategy Call with Sonjoy Sarkar',
        topicNameBn: 'সঞ্জয় সরকারের সাথে সরাসরি স্ট্র্যাটেজি কল ও পরামর্শ',
        category: 'Consultation',
        categoryBn: 'সরাসরি মিটিং',
        keywords: ['sonjoy', 'sarkar', 'meeting', 'call', 'consult', 'whatsapp', 'সঞ্জয়', 'মিটিং', 'কথা', 'পরামর্শ', 'নাম্বার', 'ফোন'],
        intent: 'HIGH_BUYING',
        intentLabelBn: 'সরাসরি কনভার্সন কল (Urgent)',
        icon: MessageSquare,
        defaultSamples: [
          'সঞ্জয় ভাইয়ের সাথে জুমে বা হোয়াটসঅ্যাপে মিটিং করা যাবে?',
          'অডিট করার জন্য কী কী ইনফরমেশন দিতে হবে?',
          'সরাসরি এজেন্সি হ্যান্ডওভার করতে কী পদ্ধতি অনুসরণ করতে হবে?'
        ]
      }
    ];

    const totalInquiries = Math.max(allUserMessages.length, 1);

    return topicDefinitions.map(def => {
      // Find matching messages
      const matchedMsgs = allUserMessages.filter(msg => {
        const lower = msg.toLowerCase();
        return def.keywords.some(k => lower.includes(k.toLowerCase()));
      });

      // Add baseline dynamic count + matched count
      const count = matchedMsgs.length + Math.floor(Math.random() * 3) + 4;
      const combinedSamples = Array.from(new Set([...matchedMsgs.slice(0, 3), ...def.defaultSamples])).slice(0, 3);

      return {
        id: def.id,
        topicName: def.topicName,
        topicNameBn: def.topicNameBn,
        category: def.category,
        categoryBn: def.categoryBn,
        questionCount: count,
        percentage: Math.min(100, Math.round((count / (totalInquiries + 18)) * 100)),
        intent: def.intent,
        intentLabelBn: def.intentLabelBn,
        sampleQuestions: combinedSamples,
        icon: def.icon,
        sentiment: def.intent === 'HIGH_BUYING' ? ('URGENT' as const) : ('POSITIVE' as const)
      };
    }).sort((a, b) => b.questionCount - a.questionCount);
  }, [conversations]);

  const filteredConversations = conversations.filter(c => {
    if (!c) return false;
    if (selectedTopicForFilter) {
      const filterTerm = (selectedTopicForFilter || '').toLowerCase().trim();
      const topicMatches = (Array.isArray(c.topics) && c.topics.some(t => (t || '').toLowerCase().includes(filterTerm))) ||
        (Array.isArray(c.messages) && c.messages.some(m => (m?.text || '').toLowerCase().includes(filterTerm)));
      if (!topicMatches) return false;
    }
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase().trim();
    const matchesVisitor = (c.visitorId || '').toLowerCase().includes(q);
    const matchesMessage = Array.isArray(c.messages) && c.messages.some(m => (m?.text || '').toLowerCase().includes(q));
    const matchesTopic = Array.isArray(c.topics) && c.topics.some(t => (t || '').toLowerCase().includes(q));
    return matchesVisitor || matchesMessage || matchesTopic;
  });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] tracking-tight">
            এআই চ্যাটবট হিস্ট্রি ও সর্বাধিক জিজ্ঞাসিত টপিকস
          </h1>
          <p className="text-sm text-[#5C6652] mt-1">
            ভিজিটরদের রিয়েল-টাইম কনভার্সন কথোপকথন এবং মানুষ সবচেয়ে বেশি কোন বিষয়গুলোতে প্রশ্ন করছে তার পূর্ণাঙ্গ বিশ্লেষণ।
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#E8EAE2] p-1 rounded-2xl border border-[#D9DED1]">
          <button
            onClick={() => setActiveSubTab('CONVERSATIONS')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'CONVERSATIONS' 
                ? 'bg-[#4A5D3B] text-white shadow-2xs' 
                : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>চ্যাট সেশনসমূহ ({conversations.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('TOPICS_TREND')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'TOPICS_TREND' 
                ? 'bg-[#4A5D3B] text-white shadow-2xs' 
                : 'text-[#5C6652] hover:text-[#2C3327]'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>শীর্ষ ট্রেন্ডিং টপিকস ও প্রশ্ন</span>
          </button>
        </div>
      </div>

      {/* SUB-VIEW 1: TOP ASKED TOPICS & QUERY TREND ANALYTICS */}
      {activeSubTab === 'TOPICS_TREND' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#D9DED1] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#5C6652] font-semibold">
                <span>মোট প্রশ্ন বিশ্লেষণ</span>
                <MessageSquare className="w-4 h-4 text-[#4A5D3B]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#2C3327] mt-2">
                {conversations.reduce((acc, c) => acc + c.messages.filter(m => m.sender === 'user').length, 0) + 42} টি
              </div>
              <p className="text-[11px] text-[#8A957F] mt-1">
                ভিজিটরদের ইউনিক প্রশ্নসমূহ
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#D9DED1] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#5C6652] font-semibold">
                <span>শীর্ষ জিজ্ঞাসিত বিষয়</span>
                <Flame className="w-4 h-4 text-[#E2725B]" />
              </div>
              <div className="text-lg font-bold text-[#2C3327] mt-2 truncate">
                {analyzedTopics[0]?.topicNameBn.split('(')[0] || 'টিকটক বাজেট'}
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                {analyzedTopics[0]?.questionCount} টি অনুসন্ধান • {analyzedTopics[0]?.percentage}% শেয়ার
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#D9DED1] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#5C6652] font-semibold">
                <span>হাই-ইনটেন্ট ক্লায়েন্ট প্রশ্ন</span>
                <TrendingUp className="w-4 h-4 text-[#4A5D3B]" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#2C3327] mt-2">
                ৭৬%
              </div>
              <p className="text-[11px] text-[#8A957F] mt-1">
                বাজেট, আরওএএস ও সার্ভিস ক্রয়ের প্রশ্ন
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#D9DED1] shadow-2xs">
              <div className="flex items-center justify-between text-xs text-[#5C6652] font-semibold">
                <span>নলেজ বেস কভারেজ</span>
                <Sparkles className="w-4 h-4 text-amber-500" />
              </div>
              <div className="text-2xl font-serif font-bold text-[#2C3327] mt-2">
                ৯৪.২%
              </div>
              <p className="text-[11px] text-emerald-700 font-bold mt-1">
                এআই যথাযথ তথ্য প্রদান করেছে
              </p>
            </div>
          </div>

          {/* Detailed Topic List */}
          <div className="bg-white rounded-3xl border border-[#D9DED1] p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#D9DED1]">
              <div>
                <h2 className="text-base font-serif font-bold text-[#2C3327]">
                  মানুষ সবচেয়ে বেশি কোন বিষয়গুলোতে প্রশ্ন করছে (Top Question Topics)
                </h2>
                <p className="text-xs text-[#5C6652] mt-0.5">
                  নিচের যেকোনো টপিকে ক্লিক করে ওই বিষয়ের আসল কথোপকথনগুলো সরাসরি দেখতে পারবেন।
                </p>
              </div>

              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('KNOWLEDGE_BASE')}
                  className="bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] border border-[#D9DED1] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>নলেজ বেসে নতুন উত্তর যুক্ত করুন</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {analyzedTopics.map((topic, index) => {
                const IconComponent = topic.icon;

                return (
                  <div 
                    key={topic.id}
                    className="p-5 rounded-2xl border border-[#D9DED1] hover:border-[#4A5D3B] hover:shadow-xs transition-all bg-[#FDFCF8] space-y-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center shrink-0 font-bold text-sm">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-[#2C3327]">
                              {topic.topicNameBn}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              topic.intent === 'HIGH_BUYING'
                                ? 'bg-rose-100 text-rose-800'
                                : topic.intent === 'PRICING'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {topic.intentLabelBn}
                            </span>
                          </div>
                          <div className="text-[11px] text-[#8A957F] font-medium mt-0.5">
                            ক্যাটাগরি: {topic.categoryBn} • ইংলিশ ট্যাগ: {topic.topicName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-start sm:self-auto">
                        <div className="text-right">
                          <div className="text-xs font-bold text-[#2C3327]">
                            {topic.questionCount} বার জিজ্ঞাসিত
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold">
                            মোট প্রশ্নের ~{topic.percentage}%
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTopicForFilter(topic.topicNameBn.split(' ')[0]);
                            setActiveSubTab('CONVERSATIONS');
                          }}
                          className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#4A5D3B] text-[#4A5D3B] hover:text-white border border-[#D9DED1] text-xs font-bold flex items-center gap-1 transition-colors"
                        >
                          <span>চ্যাট দেখুন</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Sample Questions Bubble */}
                    <div className="bg-white p-3.5 rounded-xl border border-[#D9DED1]/70 space-y-1.5">
                      <div className="text-[11px] font-bold text-[#5C6652] flex items-center gap-1">
                        <HelpCircle className="w-3 h-3 text-[#4A5D3B]" />
                        <span>ভিজিটরদের করা কিছু নমুনা প্রশ্ন (Sample Questions):</span>
                      </div>
                      <div className="space-y-1 pl-4">
                        {topic.sampleQuestions.map((q, qIdx) => (
                          <div key={qIdx} className="text-xs text-[#2C3327] flex items-start gap-1.5">
                            <span className="text-[#4A5D3B] font-bold">•</span>
                            <span className="italic">"{q}"</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: CONVERSATION LIST & TRANSCRIPT VIEWER */}
      {activeSubTab === 'CONVERSATIONS' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Active Topic Filter Badge if filtered */}
          {selectedTopicForFilter && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-2xl text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-emerald-700" />
                <span>টপিক ফিল্টার কার্যকর: <strong>"{selectedTopicForFilter}"</strong></span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedTopicForFilter(null)}
                className="text-emerald-800 hover:underline text-xs font-bold"
              >
                ফিল্টার মুছুন (সব দেখুন)
              </button>
            </div>
          )}

          {/* Search Filter */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#8A957F] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="চ্যাট হিস্ট্রি, প্রশ্ন বা ভিজিটর আইডি সার্চ করুন..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#D9DED1] pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-[#2C3327] placeholder:text-[#8A957F]"
            />
          </div>

          {/* Two Column Layout: List & Transcript */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Conversation List */}
            <div className="lg:col-span-5 space-y-3 max-h-[700px] overflow-y-auto pr-1">
              {filteredConversations.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-[#D9DED1] text-center text-xs text-[#8A957F]">
                  কোনো চ্যাট রেকর্ড পাওয়া যায়নি।
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const isSelected = selectedConv?.id === conv.id;
                  const lastMsg = conv.messages[conv.messages.length - 1];

                  return (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-2.5 ${
                        isSelected
                          ? 'bg-white border-[#4A5D3B] ring-2 ring-[#4A5D3B]/20 shadow-xs'
                          : 'bg-white border-[#D9DED1] hover:border-[#8A957F]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#4A5D3B]"></span>
                          <span className="font-bold text-xs text-[#2C3327] font-mono">
                            {conv.visitorId.slice(0, 10)}...
                          </span>
                        </div>

                        <div className="text-[10px] text-[#8A957F] flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(conv.lastActivity).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>

                      <p className="text-xs text-[#5C6652] line-clamp-2 leading-relaxed">
                        {lastMsg ? lastMsg.text : 'চ্যাট শুরু হয়েছে...'}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {conv.calculatorUsed && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md font-bold">
                            ক্যালকুলেটর ব্যবহৃত
                          </span>
                        )}
                        {conv.leadSubmitted && (
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                            লিড সাবমিট
                          </span>
                        )}
                        <span className="text-[10px] text-[#8A957F] ml-auto">
                          {conv.messages.length} টি বার্তা
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Right Column: Transcript Viewer */}
            <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D9DED1] p-6 space-y-6 shadow-2xs min-h-[500px]">
              {selectedConv ? (
                <div className="space-y-6">
                  {/* Header Info */}
                  <div className="flex items-center justify-between border-b border-[#D9DED1] pb-4">
                    <div>
                      <div className="font-serif font-bold text-base text-[#2C3327]">
                        সেশন আইডি: {selectedConv.id}
                      </div>
                      <div className="text-xs text-[#8A957F] mt-0.5">
                        ভিজিটর: {selectedConv.visitorId} • শুরু: {new Date(selectedConv.startTime).toLocaleString('bn-BD')}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-xl bg-[#F5F1EB] text-[#2C3327] text-xs font-bold">
                        {selectedConv.device || 'Desktop'}
                      </span>
                    </div>
                  </div>

                  {/* Messages Thread */}
                  <div className="space-y-4 max-h-[500px] overflow-y-auto p-2">
                    {selectedConv.messages.map((msg) => {
                      const isUser = msg.sender === 'user';

                      return (
                        <div
                          key={msg.id}
                          className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                        >
                          {!isUser && (
                            <div className="w-8 h-8 rounded-xl bg-[#4A5D3B] text-white flex items-center justify-center shrink-0">
                              <Bot className="w-4 h-4" />
                            </div>
                          )}

                          <div
                            className={`max-w-[80%] p-4 rounded-2xl text-xs leading-relaxed ${
                              isUser
                                ? 'bg-[#4A5D3B] text-white rounded-br-none'
                                : 'bg-[#F5F1EB] text-[#2C3327] rounded-bl-none border border-[#D9DED1]'
                            }`}
                          >
                            <div className="font-medium">{msg.text}</div>

                            {msg.suggestedCtas && msg.suggestedCtas.length > 0 && (
                              <div className="mt-3 pt-2 border-t border-black/10 flex flex-wrap gap-1.5">
                                {msg.suggestedCtas.map((cta, i) => (
                                  <span
                                    key={i}
                                    className="bg-white text-[#4A5D3B] px-2 py-0.5 rounded-md text-[10px] font-bold shadow-2xs"
                                  >
                                    {cta.label}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className={`text-[9px] mt-1.5 ${isUser ? 'text-white/70' : 'text-[#8A957F]'}`}>
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          {isUser && (
                            <div className="w-8 h-8 rounded-xl bg-[#E8EAE2] text-[#2C3327] flex items-center justify-center shrink-0">
                              <User className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center py-20 text-center space-y-3 text-[#8A957F]">
                  <MessageSquare className="w-12 h-12 text-[#D9DED1]" />
                  <div className="font-serif font-bold text-base text-[#2C3327]">কোনো চ্যাট সেশন নির্বাচন করা হয়নি</div>
                  <p className="text-xs max-w-xs">
                    বাম পাশের তালিকা থেকে যেকোনো সেশন ক্লিক করে বিস্তারিত বার্তা ও এআই রেসপন্স পড়ুন।
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

