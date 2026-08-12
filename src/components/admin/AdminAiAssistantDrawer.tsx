import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  ArrowRight, 
  Compass, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Settings, 
  Calculator, 
  Users, 
  FileText, 
  Tag, 
  Database, 
  Layout, 
  KeyRound, 
  RefreshCw,
  Sliders,
  Maximize2,
  Minimize2,
  Trash2,
  Mic,
  MicOff
} from 'lucide-react';
import { 
  AdminTab, 
  AdminAiMessage, 
  AdminAiAction, 
  SiteSettings, 
  CaseStudy, 
  CalculatorBenchmark, 
  KnowledgeBaseItem, 
  KnowledgeGapItem 
} from '../../types';
import { storageService } from '../../services/storageService';

interface AdminAiAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AdminTab, params?: any) => void;
  settings: SiteSettings;
}

const INITIAL_MESSAGES: AdminAiMessage[] = [
  {
    id: 'msg-admin-welcome',
    sender: 'assistant',
    text: `স্বাগতম অ্যাডমিন স্টুডিওতে! আমি আপনার **Admin AI Assistant**।

আমি আপনাকে অ্যাডমিন প্যানেলের যেকোনো সেটিংস, ফিচার ও কনফিগারেশন খুঁজে পেতে এবং কাজ দ্রুত সম্পন্ন করতে সাহায্য করব:

- 🧭 **সরাসরি নেভিগেশন**: "WhatsApp নাম্বার পরিবর্তন করব কীভাবে?", "Calculator benchmark কোথায়?", "Header logo show/hide করব কীভাবে?" বললে সরাসরি সেই সেটিংসে নিয়ে যাব।
- 🔍 **কনটেন্ট সার্চ**: যেকোনো প্রশ্ন, কেস স্টাডি বা বেঞ্চমার্ক খোঁজার জন্য সার্চ করতে পারেন।
- 🧹 **সিস্টেম অডিট**: কোনো অসম্পূর্ণ, ড্রাফট বা অপ্রয়োজনীয় তথ্য রয়েছে কি না তা স্ক্যান করতে পারেন।`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'WhatsApp number কোথা থেকে পরিবর্তন করব?',
      'Calculator-এর benchmark কোথায় পরিবর্তন করব?',
      'Header-এর logo এবং company name কীভাবে পরিবর্তন করব?',
      'TikTok Pixel ও GTM কোথায় সেট করব?',
      'সিস্টেমের অসম্পূর্ণ বা ড্রাফট তথ্য স্ক্যান করুন'
    ]
  }
];

export const AdminAiAssistantDrawer: React.FC<AdminAiAssistantDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  settings
}) => {
  const [messages, setMessages] = useState<AdminAiMessage[]>(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        const saved = localStorage.getItem('st_admin_ai_chat_history');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      }
    } catch (e) {
      // fallback to initial
    }
    return INITIAL_MESSAGES;
  });

  const [inputQuery, setInputQuery] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceTimeoutRef = useRef<any>(null);

  const showVoiceNotice = (msg: string) => {
    setVoiceNotice(msg);
    if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    voiceTimeoutRef.current = setTimeout(() => {
      setVoiceNotice(null);
    }, 4000);
  };

  // Initialize Speech Recognition for Admin Assistant (zero API key - browser native)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = true;
        rec.lang = 'bn-BD'; // Supports Bangla/English recognition

        rec.onstart = () => {
          setIsListening(true);
          setVoiceNotice('🎙️ অ্যাডমিন সহকারী শুনছে... মুখে বলুন (বাংলা বা English)');
        };

        rec.onend = () => {
          setIsListening(false);
          setTimeout(() => setVoiceNotice(null), 1200);
        };

        rec.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            showVoiceNotice('⚠️ মাইক্রোফোন পারমিশন অন করুন (Browser Settings -> Permissions)');
          } else if (event.error === 'no-speech') {
            showVoiceNotice('ℹ️ কোনো শব্দ শোনা যায়নি। পুনরায় মাইক আইকনে ক্লিক করুন।');
          } else {
            showVoiceNotice('ভয়েস রিকগনিশনে সাময়িক সমস্যা হয়েছে।');
          }
        };

        rec.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setInputQuery(transcript);
          }
        };

        recognitionRef.current = rec;
      } catch (e) {
        console.warn('Admin voice init warning:', e);
      }
    }

    return () => {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showVoiceNotice('ভয়েস ইনপুট Chrome, Edge বা আধুনিক ব্রাউজারে সমর্থিত।');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
      setIsListening(false);
    } else {
      try {
        if (!recognitionRef.current) {
          const rec = new SpeechRecognition();
          rec.continuous = false;
          rec.interimResults = true;
          rec.lang = 'bn-BD';
          rec.onstart = () => setIsListening(true);
          rec.onend = () => setIsListening(false);
          rec.onerror = () => setIsListening(false);
          rec.onresult = (ev: any) => {
            let t = '';
            for (let i = ev.resultIndex; i < ev.results.length; ++i) {
              t += ev.results[i][0].transcript;
            }
            if (t.trim()) setInputQuery(t);
          };
          recognitionRef.current = rec;
        }
        recognitionRef.current.start();
      } catch (err) {
        showVoiceNotice('মাইক্রোফোন চালু করা যায়নি। পারমিশন চেক করুন।');
      }
    }
  };

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.setItem('st_admin_ai_chat_history', JSON.stringify(messages));
      }
    } catch (e) {}
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [isOpen, messages, isThinking]);

  if (!isOpen) return null;

  const handleClearHistory = () => {
    setMessages(INITIAL_MESSAGES);
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        localStorage.removeItem('st_admin_ai_chat_history');
      }
    } catch (e) {}
  };

  const handleActionClick = (action: AdminAiAction) => {
    onNavigateTab(action.tab, {
      subTab: action.subTab,
      elementId: action.elementId,
      ...action.params
    });
    onClose();
  };

  const processAdminQuery = (rawQuery: string) => {
    const query = rawQuery.trim();
    if (!query) return;

    const userMsg: AdminAiMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsThinking(true);

    setTimeout(() => {
      const qLower = query.toLowerCase();
      let responseText = '';
      let actions: AdminAiAction[] = [];
      let suggestions: string[] = [];

      // 1. WHATSAPP / CONTACT SETTINGS
      if (qLower.includes('whatsapp') || qLower.includes('হোয়াটসঅ্যাপ') || qLower.includes('নাম্বার') || qLower.includes('phone') || qLower.includes('ফোন')) {
        responseText = `**WhatsApp নম্বর ও মেসেজ পরিবর্তন:**

হোয়াটসঅ্যাপ নম্বর পরিবর্তন করতে আপনি **সাইট ও সিস্টেম সেটিংস** ট্যাবের অধীনে **হোয়াটসঅ্যাপ ও এসইও (WHATSAPP_SEO)** সাব-ট্যাব ব্যবহার করতে পারেন।

সেখানে আপনি:
1. সরাসরি ফোন নম্বর (যেমন: \`+8801815124970\`)
2. ভিজিটরের জন্য ডিফল্ট প্রি-ফিল মেসেজ
3. ফ্লোটিং চ্যাট উইজেট অন/অফ

কাস্টমাইজ করতে পারবেন। নিচের বাটনে ক্লিক করলে আমি আপনাকে সরাসরি সেখানে নিয়ে যাব:`;
        actions = [
          {
            id: 'act-nav-whatsapp',
            label: 'Go to WhatsApp & SEO Settings',
            labelBn: 'WhatsApp Settings-এ যান',
            tab: 'SETTINGS',
            subTab: 'WHATSAPP_SEO',
            elementId: 'setting-whatsapp-input',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'Header-এ WhatsApp বাটন দেখাব কীভাবে?',
          'Calculator-এর benchmark কোথায় পরিবর্তন করব?'
        ];
      }

      // 2. CALCULATOR BENCHMARKS
      else if (
        qLower.includes('calculator') || 
        qLower.includes('benchmark') || 
        qLower.includes('ক্যালকুলেটর') || 
        qLower.includes('বেঞ্চমার্ক') || 
        qLower.includes('cpc') || 
        qLower.includes('cpm') || 
        qLower.includes('cvr') || 
        qLower.includes('roi') ||
        qLower.includes('price range')
      ) {
        responseText = `**TikTok & Facebook Ads Calculator Benchmarks:**

ক্যালকুলেটরের ইন্ডাস্ট্রি-ভিত্তিক বেঞ্চমার্ক ডেটা (যেমন: CPC, CPM, CTR, CVR, ডলার কনভার্সন রেট) পরিচালনা করতে **ক্যালকুলেটর বেঞ্চমার্ক** সেকশনে যান।

এখানে আপনি:
- বিভিন্ন ইন্ডাস্ট্রির মেট্রিকস (E-commerce, Fashion, Gadgets, etc.) এডিট বা নতুন যোগ করতে পারেন
- প্রোডাক্ট প্রাইস রেঞ্জ (টায়ার) কনফিগার করতে পারেন
- ড্রপডাউন ক্যাটাগরি সাজাতে পারেন

নিচের বাটনে ক্লিক করে সরাসরি ক্যালকুলেটর বেঞ্চমার্ক প্যানেলে প্রবেশ করুন:`;
        actions = [
          {
            id: 'act-nav-calculator-benchmarks',
            label: 'Open Calculator Benchmarks',
            labelBn: 'ক্যালকুলেটর বেঞ্চমার্কে যান',
            tab: 'CALCULATOR_BENCHMARKS',
            subTab: 'BENCHMARKS_TABLE',
            elementId: 'benchmarks-table-view',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'ডলার এক্সচেঞ্জ রেট (USD to BDT) পরিবর্তন কোথায়?',
          'অপ্রয়োজনীয় বা শূন্য বেঞ্চমার্ক ডেটা স্ক্যান করুন'
        ];
      }

      // 3. HEADER LOGO & COMPANY NAME VISIBILITY (NEW)
      else if (
        qLower.includes('header') || 
        qLower.includes('logo') || 
        qLower.includes('লোগো') || 
        qLower.includes('হেডার') || 
        qLower.includes('company name') || 
        qLower.includes('কোম্পানির নাম') || 
        qLower.includes('visibility') || 
        qLower.includes('brand name') ||
        qLower.includes('tagline')
      ) {
        responseText = `**হেডার লোগো এবং কোম্পানির নাম কন্ট্রোল:**

হেডারের ভিজিবিলিটি এবং লেআউট পুরোপুরি ব্যাকএন্ড কন্ট্রোল্ড করা হয়েছে। আপনি **সাইট ও সিস্টেম সেটিংস** ট্যাবের অধীনে **হেডার ও লোগো কন্ট্রোল (HEADER_MANAGEMENT)** সেকশন থেকে পরিবর্তন করতে পারেন:

- **ডেস্কটপ লোগো ডিসপ্লে মোড**: লোগো + নাম (Both), শুধুমাত্র লোগো (Logo Only), শুধুমাত্র নাম (Name Only), অথবা গোপন (Hidden)।
- **মোবাইল লোগো মোড**: মোবাইলের জন্য আলাদা ডিসপ্লে মোড নির্ধারণ।
- **লোগো টাইপ**: টেক্সট ব্যাজ (ST) অথবা নিজস্ব ইমেজ আপলোড/URL।
- **ট্যাগলাইন ও ব্র্যান্ড নেম**: বাংলা ও ইংরেজিতে কাস্টমাইজেশন।
- **হেডার মেনু ও CTA বাটন**: নতুন লিঙ্ক যোগ, অন/অফ এবং বাটন অ্যাকশন।

নিচের বাটনে ক্লিক করলে সরাসরি হেডার সেটিংস খুলে যাবে:`;
        actions = [
          {
            id: 'act-nav-header-settings',
            label: 'Open Header & Logo Settings',
            labelBn: 'হেডার ও লোগো সেটিংসে যান',
            tab: 'SETTINGS',
            subTab: 'HEADER_MANAGEMENT',
            elementId: 'header-management-panel',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'মোবাইলে শুধুমাত্র লোগো দেখাব কীভাবে?',
          'হেডারের Book Free Audit বাটনের লিংক পরিবর্তন কীভাবে করব?'
        ];
      }

      // 4. GTM, TIKTOK PIXEL, META PIXEL
      else if (
        qLower.includes('gtm') || 
        qLower.includes('pixel') || 
        qLower.includes('পিক্সেল') || 
        qLower.includes('tag manager') || 
        qLower.includes('tiktok pixel') || 
        qLower.includes('meta pixel') || 
        qLower.includes('analytics') || 
        qLower.includes('ট্র্যাকিং')
      ) {
        responseText = `**Google Tag Manager ও পিক্সেল ট্র্যাকিং কনফিগারেশন:**

GTM কন্টেইনার আইডি, TikTok Pixel ID, Meta Pixel ID এবং Google Analytics 4 আইডি বসানোর জন্য অ্যাডমিনের **GTM ও পিক্সেল ট্র্যাকিং (GTM_TRACKING)** ট্যাব ব্যবহার করুন।

- সব স্ক্রিপ্ট স্বয়ংক্রিয়ভাবে ডিডুপ্লিকেশন গার্ডের মাধ্যমে রান হয়।
- কাস্টম Head ও Body স্ক্রিপ্টও এখানে বসাতে পারেন।

সরাসরি যেতে নিচের অ্যাকশন বাটনে ক্লিক করুন:`;
        actions = [
          {
            id: 'act-nav-gtm-pixels',
            label: 'Open GTM & Pixels Settings',
            labelBn: 'GTM ও পিক্সেল সেটিংসে যান',
            tab: 'GTM_TRACKING',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'পিক্সেল আইডি ডুপ্লিকেট হচ্ছে কি না কীভাবে বুঝব?',
          'Google Analytics আইডি কোথায় বসাব?'
        ];
      }

      // 5. CASE STUDIES
      else if (
        qLower.includes('case study') || 
        qLower.includes('কেস স্টাডি') || 
        qLower.includes('proof') || 
        qLower.includes('প্রুফ') || 
        qLower.includes('client result') ||
        qLower.includes('পাবলিশ')
      ) {
        responseText = `**কেস স্টাডি ও ভেরিফাইড ফলাফল ম্যানেজমেন্ট:**

নতুন কেস স্টাডি যোগ করতে, এক্সিস্টিং কেস স্টাডি এডিট করতে বা ড্রাফট থেকে লাইভে পাবলিশ করতে **কেস স্টাডি ও প্রুফ (CASE_STUDIES)** সেকশনে যান।

সেখানে আপনি:
- ক্লায়েন্টের নাম, ইন্ডাস্ট্রি ও স্পেন্ড/রিটার্ন (ROAS)
- রেজাল্ট স্ক্রিনশট ও মিডিয়া
- ড্রাফট বনাম লাইভ স্ট্যাটাস

ম্যানেজ করতে পারবেন। সরাসরি যেতে নিচের বাটন ব্যবহার করুন:`;
        actions = [
          {
            id: 'act-nav-case-studies',
            label: 'Open Case Studies Manager',
            labelBn: 'কেস স্টাডি ম্যানেজমেন্টে যান',
            tab: 'CASE_STUDIES',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'ড্রাফট কেস স্টাডি লাইভ করব কীভাবে?',
          'নতুন কেস স্টাডি কীভাবে যোগ করব?'
        ];
      }

      // 6. KNOWLEDGE BASE & KNOWLEDGE GAPS
      else if (
        qLower.includes('knowledge base') || 
        qLower.includes('নলেজ বেস') || 
        qLower.includes('প্রশ্ন') || 
        qLower.includes('উত্তর') || 
        qLower.includes('gap') || 
        qLower.includes('গ্যাপ') || 
        qLower.includes('অজানা') ||
        qLower.includes('ai chat')
      ) {
        responseText = `**এআই নলেজ বেস ও অজানা প্রশ্ন (Knowledge Gaps):**

- **নলেজ বেস (KNOWLEDGE_BASE)**: এখানে আপনার এজেন্সির সেবা, বাজেট পলিসি ও কাজের ধাপের অফিশিয়াল প্রশ্নোত্তর সাজানো থাকে।
- **নলেজ গ্যাপ (KNOWLEDGE_GAPS)**: ওয়েবসাইট ভিজিটররা এআই চ্যাটে এমন কোনো প্রশ্ন করলে যার উত্তর পূর্বে সেভ ছিল না, তা স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত হয়।

কোথায় যেতে চান বেছে নিন:`;
        actions = [
          {
            id: 'act-nav-kb',
            label: 'Open Knowledge Base',
            labelBn: 'নলেজ বেসে যান',
            tab: 'KNOWLEDGE_BASE',
            type: 'NAVIGATE'
          },
          {
            id: 'act-nav-gaps',
            label: 'Open Knowledge Gaps',
            labelBn: 'নলেজ গ্যাপ পেজে যান',
            tab: 'KNOWLEDGE_GAPS',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'ভিজিটরদের অজানা প্রশ্নের উত্তর কীভাবে যোগ করব?',
          'নতুন প্রশ্ন-উত্তর যোগ করার নিয়ম কী?'
        ];
      }

      // 7. LEADS & CLIENT CRM
      else if (
        qLower.includes('lead') || 
        qLower.includes('লিড') || 
        qLower.includes('ক্লায়েন্ট') || 
        qLower.includes('inquiry') || 
        qLower.includes('অডিট রিকোয়েস্ট') ||
        qLower.includes('crm')
      ) {
        responseText = `**লিড ও ক্লায়েন্ট CRM:**

ল্যান্ডিং পেজের লিড ফর্ম, ক্যালকুলেটরের অডিট রিকোয়েস্ট এবং এআই চ্যাট থেকে সংগৃহীত সব লিড **লিড ও ক্লায়েন্ট CRM (LEADS)** ট্যাবে স্বয়ংক্রিয়ভাবে জমা হয়।

এখানে আপনি:
- নতুন (NEW), যোগাযোগকৃত (CONTACTED) বা কনভার্টেড (CLOSED) স্ট্যাটাস আপডেট করতে পারেন
- ১-ক্লিকে ক্লায়েন্টের সাথে হোয়াটসঅ্যাপ চ্যাট শুরু করতে পারেন
- সব লিড এক ক্লিকে গুগল শিট বা CSV ফাইলে এক্সপোর্ট করতে পারেন

সরাসরি যেতে নিচের অ্যাকশনে ক্লিক করুন:`;
        actions = [
          {
            id: 'act-nav-leads',
            label: 'Open Lead CRM',
            labelBn: 'লিড ম্যানেজমেন্টে যান',
            tab: 'LEADS',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'গুগল শিটে কীভাবে লিড অটোমেটিক যাবে?',
          'লিড স্ট্যাটাস পরিবর্তন করব কীভাবে?'
        ];
      }

      // 8. SECURITY & PASSCODE
      else if (
        qLower.includes('passcode') || 
        qLower.includes('পাসকোড') || 
        qLower.includes('password') || 
        qLower.includes('পাসওয়ার্ড') || 
        qLower.includes('security') || 
        qLower.includes('সিকিউরিটি') ||
        qLower.includes('লগইন')
      ) {
        responseText = `**অ্যাডমিন সিকিউরিটি ও পাসকোড পরিবর্তন:**

অ্যাডমিন প্যানেলে প্রবেশের পাসকোড পরিবর্তন করতে **সাইট ও সিস্টেম সেটিংস** ট্যাবের অধীনে **সিকিউরিটি ও পাসকোড (SECURITY)** সাব-সেকশনে যান।

সেখানে বর্তমান পাসকোডটি ভেরিফাই করে আপনার পছন্দের নতুন পাসকোড সেট করতে পারবেন। সরাসরি যেতে নিচের বাটন ব্যবহার করুন:`;
        actions = [
          {
            id: 'act-nav-security',
            label: 'Go to Security & Passcode',
            labelBn: 'সিকিউরিটি ও পাসকোড সেটিংসে যান',
            tab: 'SETTINGS',
            subTab: 'SECURITY',
            elementId: 'setting-security-passcode-form',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'পাসকোড ভুলে গেলে কী করব?',
          'লগআউট করার নিয়ম কী?'
        ];
      }

      // 9. SYSTEM AUDIT & IRRELEVANT / OUTDATED INFO CLEANUP
      else if (
        qLower.includes('audit') || 
        qLower.includes('অডিট') || 
        qLower.includes('স্ক্যান') || 
        qLower.includes('অসম্পূর্ণ') || 
        qLower.includes('অপ্রয়োজনীয়') || 
        qLower.includes('ড্রাফট') || 
        qLower.includes('clean') ||
        qLower.includes('ভুল')
      ) {
        const caseStudies = storageService.getCaseStudies(true);
        const benchmarks = storageService.getBenchmarks(true);
        const gaps = storageService.getKnowledgeGaps().filter(g => g.status !== 'resolved');
        const draftStudies = caseStudies.filter(c => !c.isPublished);
        const missingMetrics = benchmarks.filter(b => !b.cpcBDT || !b.cvrPercent || b.cvrPercent <= 0);

        responseText = `**সিস্টেম অডিট ও কন্টেন্ট স্ক্যান ফলাফল:**

সিস্টেমের ডেটাবেস স্ক্যান করে নিচের পয়েন্টগুলো পাওয়া গেছে:
- 📝 **ড্রাফট কেস স্টাডি**: ${draftStudies.length}টি অপ্রকাশিত ড্রাফট রয়েছে${draftStudies.length > 0 ? ` (যেমন: "${draftStudies[0].title}")` : ''}।
- 📊 **অসম্পূর্ণ ক্যালকুলেটর বেঞ্চমার্ক**: ${missingMetrics.length}টি ক্যাটাগরির CVR বা CTR ডেটা শূন্য বা অসম্পূর্ণ।
- ❓ **অমীমাংসিত নলেজ গ্যাপ**: ${gaps.length}টি ভিজিটর প্রশ্নের উত্তর নলেজ বেসে দেওয়া বাকি।
- 🌐 **হেডার কনফিগারেশন**: ${settings.header?.logoDisplayMode ? `সক্রিয় (${settings.header.logoDisplayMode})` : 'ডিফল্ট'}।

সরাসরি সমাধান করতে সংশ্লিষ্ট সেকশনে যান:`;

        if (draftStudies.length > 0) {
          actions.push({
            id: 'act-audit-drafts',
            label: 'Review Draft Case Studies',
            labelBn: 'ড্রাফট কেস স্টাডি দেখুন',
            tab: 'CASE_STUDIES',
            type: 'NAVIGATE'
          });
        }

        if (missingMetrics.length > 0) {
          actions.push({
            id: 'act-audit-benchmarks',
            label: 'Fix Benchmark Metrics',
            labelBn: 'বেঞ্চমার্ক মেট্রিকস ঠিক করুন',
            tab: 'CALCULATOR_BENCHMARKS',
            type: 'NAVIGATE'
          });
        }

        if (gaps.length > 0) {
          actions.push({
            id: 'act-audit-gaps',
            label: 'Resolve Knowledge Gaps',
            labelBn: 'নলেজ গ্যাপ সমাধান করুন',
            tab: 'KNOWLEDGE_GAPS',
            type: 'NAVIGATE'
          });
        }

        suggestions = [
          'হেডার লোগো এবং নাম সেটিংস চেক করুন',
          'ডলার এক্সচেঞ্জ রেট চেক করুন'
        ];
      }

      // 10. GOOGLE SHEETS & WORKSPACE SYNC
      else if (
        qLower.includes('google sheet') || 
        qLower.includes('শিট') || 
        qLower.includes('drive') || 
        qLower.includes('workspace') || 
        qLower.includes('ড্রাইভ') || 
        qLower.includes('export')
      ) {
        responseText = `**Google Workspace ও স্প্রেডশিট সিঙ্ক:**

নতুন লিড জমা পড়লে সাথে সাথে গুগল শিটে অটো-ব্যাকআপ পেতে **ক্লাউড ও ওয়ার্কস্পেস (WORKSPACE_SYNC)** ট্যাবে যান। 

এখানে আপনি আপনার Google Sheet ID লিঙ্ক করতে পারেন। সরাসরি যেতে নিচের বাটন ক্লিক করুন:`;
        actions = [
          {
            id: 'act-nav-workspace',
            label: 'Go to Workspace Sync',
            labelBn: 'Google Workspace Sync-এ যান',
            tab: 'WORKSPACE_SYNC',
            type: 'NAVIGATE'
          }
        ];
        suggestions = [
          'লিড কীভাবে এক্সপোর্ট করব?',
          'ব্যাকআপ ফাইল ডাউনলোড করব কীভাবে?'
        ];
      }

      // 11. GENERAL / SEARCH FALLBACK
      else {
        // Search across knowledge base & case studies
        const allKb = storageService.getKnowledgeBase(false);
        const matchedKb = allKb.filter(item => 
          item.question.toLowerCase().includes(qLower) || 
          item.answer.toLowerCase().includes(qLower)
        );

        if (matchedKb.length > 0) {
          responseText = `আপনার অনুসন্ধানের সাথে প্রাসঙ্গিক **${matchedKb.length}টি নলেজ বেস এন্ট্রি** পাওয়া গেছে:

${matchedKb.slice(0, 2).map((item, idx) => `**${idx + 1}. ${item.question}**\n${item.answer.substring(0, 140)}...`).join('\n\n')}

এটি এডিট বা ম্যানেজ করতে নলেজ বেস সেকশনে যেতে পারেন:`;
          actions = [
            {
              id: 'act-nav-kb-search',
              label: 'Open Knowledge Base',
              labelBn: 'নলেজ বেস সেকশনে যান',
              tab: 'KNOWLEDGE_BASE',
              type: 'NAVIGATE'
            }
          ];
        } else {
          responseText = `আমি আপনার প্রশ্নটি পেয়েছি। অ্যাডমিন প্যানেলে এই সংক্রান্ত কাজগুলো সহজে সম্পন্ন করার জন্য নিচের নেভিগেশন শর্টকাটগুলো ব্যবহার করতে পারেন:`;
          actions = [
            {
              id: 'act-nav-settings',
              label: 'General & Site Settings',
              labelBn: 'সাইট ও সিস্টেম সেটিংসে যান',
              tab: 'SETTINGS',
              type: 'NAVIGATE'
            },
            {
              id: 'act-nav-dashboard',
              label: 'Dashboard Overview',
              labelBn: 'ড্যাশবোর্ডে ফিরে যান',
              tab: 'DASHBOARD',
              type: 'NAVIGATE'
            }
          ];
        }

        suggestions = [
          'WhatsApp number কোথা থেকে পরিবর্তন করব?',
          'Header-এর logo এবং company name কীভাবে পরিবর্তন করব?',
          'Calculator-এর benchmark কোথায় পরিবর্তন করব?'
        ];
      }

      const botReply: AdminAiMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions,
        suggestions
      };

      setMessages(prev => [...prev, botReply]);
      setIsThinking(false);
    }, 350);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processAdminQuery(inputQuery);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C3327]/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Assistant Panel Drawer */}
      <div 
        className={`bg-[#FFFFFF] h-full shadow-2xl flex flex-col justify-between border-l border-[#D9DED1] transition-all duration-300 ${
          isExpanded ? 'w-full max-w-4xl' : 'w-full max-w-xl'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-5 border-b border-[#D9DED1] bg-[#FDFCF8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-[#2C3327]">
                  Admin AI Assistant
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8EAE2] text-[#4A5D3B] border border-[#D9DED1]">
                  Admin & Editor Copilot
                </span>
              </div>
              <p className="text-xs text-[#5C6652]">
                সেটিংস গাইডেন্স, ১-ক্লিক ডিরেক্ট নেভিগেশন ও সিস্টেম ম্যানেজমেন্ট
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] rounded-xl transition-colors hidden sm:flex"
              title={isExpanded ? "স্ক্রিন ছোট করুন" : "স্ক্রিন বড় করুন"}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={handleClearHistory}
              className="p-2 text-[#5C6652] hover:text-[#E2725B] hover:bg-red-50 rounded-xl transition-colors"
              title="চ্যাট হিস্ট্রি মুছে ফেলুন"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] rounded-xl transition-colors"
              title="বন্ধ করুন"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-[#FDFCF8]">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center shrink-0 mt-1 shadow-2xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div className={`max-w-[85%] space-y-2.5 ${isUser ? 'items-end' : 'items-start'}`}>
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#4A5D3B] text-[#FDFCF8] rounded-tr-none font-medium'
                        : 'bg-[#FFFFFF] text-[#2C3327] border border-[#D9DED1] shadow-2xs rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Interactive Action Buttons for Navigation */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8A957F]">
                        সরাসরি অ্যাকশন ও নেভিগেশন:
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {msg.actions.map((act) => (
                          <button
                            key={act.id}
                            onClick={() => handleActionClick(act)}
                            className="px-3.5 py-2 bg-[#4A5D3B] hover:bg-[#3D4D30] text-[#FDFCF8] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-2 group hover:scale-[1.02]"
                          >
                            <span>{act.labelBn || act.label}</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => processAdminQuery(sug)}
                          className="text-[11px] bg-[#E8EAE2] hover:bg-[#D9DED1] text-[#2C3327] px-3 py-1 rounded-full font-medium transition-colors text-left"
                        >
                          {sug}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="text-[9px] text-[#8A957F] px-1">
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isThinking && (
            <div className="flex gap-3 justify-start items-center text-xs text-[#5C6652] py-2">
              <div className="w-8 h-8 rounded-xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center shrink-0 shadow-2xs">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-[#FFFFFF] p-3.5 rounded-2xl border border-[#D9DED1] shadow-2xs flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D3B] animate-bounce" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D3B] animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D3B] animate-bounce [animation-delay:0.4s]" />
                <span className="font-semibold text-xs ml-1">তথ্য ও নেভিগেশন রুট লোড হচ্ছে...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-[#D9DED1] bg-[#FFFFFF]">
          {/* Quick Shortcuts Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 text-xs no-scrollbar">
            <button
              onClick={() => processAdminQuery('WhatsApp number কোথা থেকে পরিবর্তন করব?')}
              className="px-2.5 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
            >
              WhatsApp নম্বর
            </button>
            <button
              onClick={() => processAdminQuery('Calculator-এর benchmark কোথায় পরিবর্তন করব?')}
              className="px-2.5 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
            >
              ক্যালকুলেটর বেঞ্চমার্ক
            </button>
            <button
              onClick={() => processAdminQuery('Header-এর logo এবং company name কীভাবে পরিবর্তন করব?')}
              className="px-2.5 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
            >
              হেডার ও লোগো
            </button>
            <button
              onClick={() => processAdminQuery('TikTok Pixel ও GTM কোথায় সেট করব?')}
              className="px-2.5 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
            >
              GTM ও পিক্সেল
            </button>
            <button
              onClick={() => processAdminQuery('সিস্টেমের অসম্পূর্ণ বা ড্রাফট তথ্য স্ক্যান করুন')}
              className="px-2.5 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-amber-700 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-600" />
              <span>অডিট ও স্ক্যান</span>
            </button>
          </div>

          {/* Voice status or error notice */}
          {voiceNotice && (
            <div className="mb-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900 flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
              <span className="truncate">{voiceNotice}</span>
              <button 
                onClick={() => setVoiceNotice(null)}
                className="text-amber-700 hover:text-amber-900 font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isListening
                    ? "শুনছি... মুখে বলুন (বাংলা / English)..."
                    : "যেকোনো সেটিংস, ফিচার বা প্রশ্নের জন্য এখানে লিখুন (বাংলা / English)..."
                }
                className={`w-full bg-[#FDFCF8] border rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-[#2C3327] outline-none transition-all ${
                  isListening
                    ? 'border-[#E2725B] ring-2 ring-[#E2725B]/20 bg-rose-50/30'
                    : 'border-[#D9DED1] focus:border-[#4A5D3B]'
                }`}
              />
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-[#E2725B] text-white animate-pulse'
                    : 'text-[#8A957F] hover:text-[#4A5D3B] hover:bg-[#E8EAE2]'
                }`}
                title="ভয়েস ইনপুট (বাংলা / English)"
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={() => processAdminQuery(inputQuery)}
              disabled={!inputQuery.trim() || isThinking}
              className="p-2.5 bg-[#4A5D3B] hover:bg-[#3D4D30] disabled:bg-[#8A957F] text-white rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0"
              title="মেসেজ পাঠান"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
