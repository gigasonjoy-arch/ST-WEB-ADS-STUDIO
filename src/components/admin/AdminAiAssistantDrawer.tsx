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
  MicOff,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Layers,
  CheckSquare,
  Eye,
  ShieldCheck,
  Zap,
  Globe,
  ExternalLink
} from 'lucide-react';
import { 
  AdminTab, 
  AdminAiMessage, 
  AdminAiAction, 
  AdminAiActionProposal,
  SiteSettings, 
  CaseStudy, 
  CalculatorBenchmark, 
  KnowledgeBaseItem, 
  KnowledgeGapItem 
} from '../../types';
import { storageService } from '../../services/storageService';
import { AdminAgentEngine } from '../../services/adminAgentEngine';

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
    text: `স্বাগতম অ্যাডমিন স্টুডিওতে! আমি আপনার **Verified Admin AI Copilot**।

🛡️ **জিরো-হ্যালুসিনেশন ও হিউম্যান-ইন-দ্য-লুপ পলিসি**:
আমি আন্দাজে কোনো কাল্পনিক তথ্য বা ক্লায়েন্ট ডেটা তৈরি করি না। আপনি আমাকে যে তথ্য প্রদান করবেন, আমি তা সুশৃঙ্খলভাবে সাজিয়ে **অ্যাকশন প্রিভিউ কার্ড** প্রস্তুত করব। 

আপনার সরাসরি **"নিশ্চিত করুন ও সেভ করুন"** বাটনে ক্লিকের পূর্বে কোনো ডেটা সাইটে বা ডেটাবেসে যুক্ত বা পাবলিকলি প্রকাশিত হবে না।

📌 **কীভাবে ব্যবহার করবেন:**
- **কেস স্টাডি যোগ**: *"ক্লায়েন্ট: Silk Vogue, বাজেট: ৪০,০০০ টাকা, সেলস: ১,৬০,০০০ টাকা, অর্ডার: ৩১০টি, প্ল্যাটফর্ম: TikTok। কেস স্টাডি যোগ করো"*
- **প্রশ্নোত্তর যোগ**: *"প্রশ্ন: ডেলিভারি চার্জ কত? উত্তর: ঢাকা ৮০ টাকা, ঢাকার বাইরে ১৩০ টাকা। নলেজ বেসে যোগ করো"*
- **কনফিগারেশন**: *"ডলার এক্সচেঞ্জ রেট ১৩০ টাকা করো"* অথবা *"WhatsApp নম্বর 01815124970 সেট করো"*
- **ড্রাফট পাবলিশ**: *"সব ড্রাফট কেস স্টাডি লাইভে পাবলিশ করো"*`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'ক্লায়েন্ট: Aarong, বাজেট: 45000, সেলস: 180000, অর্ডার: 350, প্ল্যাটফর্ম: TikTok। কেস স্টাডি যোগ করো',
      'প্রশ্ন: ডেলিভারি সময় কতদিন? উত্তর: ঢাকা ২৪-৪৮ ঘণ্টা, ঢাকার বাইরে ৩-৪ দিন। নলেজ বেসে যোগ করো',
      'সব ড্রাফট কেস স্টাডি লাইভে পাবলিশ করো',
      'ডলার এক্সচেঞ্জ রেট পরিবর্তন করে ১৩০ টাকা করো'
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
  const [expandedPayloads, setExpandedPayloads] = useState<Record<string, boolean>>({});
  const [executingProposalId, setExecutingProposalId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const voiceTimeoutRef = useRef<any>(null);
  const hasPromptedKbRef = useRef(false);
  const [systemQuestions, setSystemQuestions] = useState<Array<{ id: string; category: string; question: string; reason: string; options?: string[] }>>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [isSystemInterviewing, setIsSystemInterviewing] = useState<boolean>(false);
  const [answeredQIds, setAnsweredQIds] = useState<string[]>([]);

  const startSystemInterview = () => {
    const questions = AdminAgentEngine.generateSystemInterviewQuestions(answeredQIds);
    setSystemQuestions(questions);
    setCurrentQuestionIdx(0);
    setIsSystemInterviewing(true);

    if (questions.length === 0) {
      setMessages(prev => [...prev, {
        id: `msg-sys-int-empty-${Date.now()}`,
        sender: 'assistant',
        text: '🎉 **সিস্টেম অ্যানালিসিস সম্পন্ন!**\n\nআপনার সিস্টেমে নলেজ বেস, কেস স্টাডি ও বেঞ্চমার্কের তথ্য পর্যাপ্ত রয়েছে। কোনো প্রশ্ন পেন্ডিং নেই। নতুন কোনো তথ্য যোগ বা পরিবর্তন করতে চাইলে সরাসরি আমাকে লিখে জানান।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

    const firstQ = questions[0];
    const suggestions = [...(firstQ.options || []), 'স্কিপ করুন', 'ইন্টারভিউ বন্ধ করো'];

    const welcomeMsg: AdminAiMessage = {
      id: `msg-sys-int-start-${Date.now()}`,
      sender: 'assistant',
      text: `🤖 **সিস্টেম ইন্টেলিজেন্ট সিঙ্ক ও ইন্টারভিউ শুরু করা হয়েছে**\n\nআমি আপনার ডাটাবেসের কাজ, কেস স্টাডি, বেঞ্চমার্ক ও ক্লায়েন্ট প্রশ্নোত্তর গ্যাপ বিশ্লেষণ করেছি। পর্যায়ক্রমে ১টি করে প্রশ্ন করছি। আপনি চাইলে প্রস্তাবিত উত্তর সিলেক্ট/এডিট করতে পারেন অথবা নিজস্ব উত্তর লিখতে পারেন।\n\n📌 **প্রশ্ন #1/মোট ${questions.length} [ক্যাটাগরি: ${firstQ.category}]**\n> ${firstQ.question}\n\n*(কারণ: ${firstQ.reason})*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions
    };
    setMessages(prev => [...prev, welcomeMsg]);
  };

  useEffect(() => {
    // Proactive interactive prompting loop on drawer open
    if (!hasPromptedKbRef.current && isOpen) {
      hasPromptedKbRef.current = true;
      setTimeout(() => {
        startSystemInterview();
      }, 400);
    }
  }, [isOpen]);

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
        rec.lang = 'bn-BD';

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

  const togglePayloadView = (proposalId: string) => {
    setExpandedPayloads(prev => ({
      ...prev,
      [proposalId]: !prev[proposalId]
    }));
  };

  const handleConfirmProposal = async (messageId: string, proposal: AdminAiActionProposal) => {
    setExecutingProposalId(proposal.id);

    // Update status to EXECUTING
    setMessages(prev => prev.map(m => {
      if (m.id === messageId && m.proposal) {
        return {
          ...m,
          proposal: { ...m.proposal, status: 'EXECUTING' }
        };
      }
      return m;
    }));

    try {
      const result = await AdminAgentEngine.executeProposal(proposal);

      // Update message with COMPLETED status and execution result
      setMessages(prev => prev.map(m => {
        if (m.id === messageId && m.proposal) {
          return {
            ...m,
            proposal: {
              ...m.proposal,
              status: result.success ? 'COMPLETED' : 'REJECTED',
              executionResult: result
            }
          };
        }
        return m;
      }));

      // Add assistant confirmation follow-up message
      const confirmMsg: AdminAiMessage = {
        id: `msg-confirm-${Date.now()}`,
        sender: 'assistant',
        text: result.success 
          ? `✅ **অ্যাকশন সফলভাবে এক্সিকিউট সম্পন্ন হয়েছে!**\n\n${result.messageBn}\n\nসংশ্লিষ্ট ডেটাবেস এবং লাইভ সাইটে এটি সাথে সাথে আপডেট হয়েছে। আপনি সরাসরি সংশ্লিষ্ট প্যানেলে গিয়ে পরিবর্তন দেখতে পারেন:`
          : `⚠️ **অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে:**\n\n${result.messageBn}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actions: [
          {
            id: `act-view-res-${Date.now()}`,
            label: `View ${proposal.targetTab}`,
            labelBn: `${proposal.titleBn.split(' ')[0]} তালিকায় দেখুন`,
            tab: proposal.targetTab,
            subTab: proposal.targetSubTab,
            type: 'NAVIGATE'
          }
        ]
      };

      setMessages(prev => [...prev, confirmMsg]);
    } catch (err: any) {
      setMessages(prev => prev.map(m => {
        if (m.id === messageId && m.proposal) {
          return {
            ...m,
            proposal: {
              ...m.proposal,
              status: 'REJECTED',
              executionResult: {
                success: false,
                messageEn: err?.message || 'Execution error',
                messageBn: 'অ্যাকশন সম্পন্ন করা যায়নি।'
              }
            }
          };
        }
        return m;
      }));
    } finally {
      setExecutingProposalId(null);
    }
  };

  const handleCancelProposal = (messageId: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id === messageId && m.proposal) {
        return {
          ...m,
          proposal: {
            ...m.proposal,
            status: 'REJECTED'
          }
        };
      }
      return m;
    }));
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
      // Check if triggering interview command explicitly
      if (query.includes('ইন্টারভিউ') || query.includes('প্রশ্ন কর') || query.includes('সিস্টেম সিঙ্ক') || query.toLowerCase().includes('interview')) {
        startSystemInterview();
        setIsThinking(false);
        return;
      }

      // Check if system interview is active
      if (isSystemInterviewing && systemQuestions.length > 0) {
        if (/বন্ধ|স্টপ|stop|exit|বাহির/i.test(query) && query.length < 15) {
          setIsSystemInterviewing(false);
          setMessages(prev => [...prev, {
            id: `msg-sys-int-stop-${Date.now()}`,
            sender: 'assistant',
            text: 'ইন্টারভিউ প্রক্রিয়া বন্ধ করা হয়েছে। যেকোনো প্রয়োজনে আবার ডাকতে পারেন।',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }]);
          setIsThinking(false);
          return;
        }

        const currentQ = systemQuestions[currentQuestionIdx];
        if (currentQ) {
          setAnsweredQIds(prev => [...prev, currentQ.id]);
        }

        const evalResult = AdminAgentEngine.processSystemInterviewAnswer(query, currentQ);

        const replyMsg: AdminAiMessage = {
          id: `msg-int-ans-${Date.now()}`,
          sender: 'assistant',
          text: evalResult.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          proposal: evalResult.proposal,
          suggestions: evalResult.suggestions
        };
        setMessages(prev => [...prev, replyMsg]);

        // Advance question
        const nextIdx = currentQuestionIdx + 1;
        if (nextIdx < systemQuestions.length) {
          setCurrentQuestionIdx(nextIdx);
          const nextQ = systemQuestions[nextIdx];
          const nextSuggestions = [...(nextQ.options || []), 'স্কিপ করুন', 'ইন্টারভিউ বন্ধ করো'];

          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: `msg-sys-int-next-${Date.now()}`,
              sender: 'assistant',
              text: `📌 **পরবর্তী প্রশ্ন #${nextIdx + 1}/মোট ${systemQuestions.length} [ক্যাটাগরি: ${nextQ.category}]**\n> ${nextQ.question}\n\n*(কারণ: ${nextQ.reason})*`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suggestions: nextSuggestions
            }]);
          }, 600);
        } else {
          setIsSystemInterviewing(false);
          setTimeout(() => {
            setMessages(prev => [...prev, {
              id: `msg-sys-int-done-${Date.now()}`,
              sender: 'assistant',
              text: `🎉 **ধন্যবাদ! সমস্ত সিস্টেম ইন্টেলিজেন্ট সিঙ্ক প্রশ্ন সম্পন্ন হয়েছে।**\n\nআপনার প্রস্তাবনা কার্ডগুলোতে 'অনুমোদন ও সেভ করুন' ক্লিক করলেই তা নলেজ বেসে সেভ হয়ে যাবে।`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
          }, 600);
        }

        setIsThinking(false);
        return;
      }

      // Process using our Zero-API-Key Autonomous Admin Agent Engine
      const result = AdminAgentEngine.processCommand(query, settings);

      const botReply: AdminAiMessage = {
        id: `msg-bot-${Date.now()}`,
        sender: 'assistant',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        proposal: result.proposal,
        actions: result.actions,
        suggestions: result.suggestions
      };

      setMessages(prev => [...prev, botReply]);
      setIsThinking(false);
    }, 280);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      processAdminQuery(inputQuery);
    }
  };

  const renderProposalBadge = (type: string) => {
    switch (type) {
      case 'BULK_CREATE_CASE_STUDIES':
      case 'PUBLISH_DRAFT_CASE_STUDIES':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>কেস স্টাডি অটোমেশন</span>
          </span>
        );
      case 'BULK_ADD_KNOWLEDGE_BASE':
      case 'RESOLVE_KNOWLEDGE_GAPS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
            <Layers className="w-3 h-3" />
            <span>নলেজ গ্রাফ ও কিউএ</span>
          </span>
        );
      case 'UPDATE_CALCULATOR_BENCHMARK':
      case 'UPDATE_EXCHANGE_RATE':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
            <Calculator className="w-3 h-3" />
            <span>ক্যালকুলেটর বেঞ্চমার্ক</span>
          </span>
        );
      case 'UPDATE_SITE_SETTINGS':
      case 'UPDATE_HEADER_SETTINGS':
      case 'UPDATE_WHATSAPP_SETTINGS':
      case 'UPDATE_GTM_PIXELS':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
            <Settings className="w-3 h-3" />
            <span>সিস্টেম কনফিগারেশন</span>
          </span>
        );
      case 'TRIGGER_CLOUD_SYNC':
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300 flex items-center gap-1">
            <Database className="w-3 h-3" />
            <span>ক্লাউড ডেটাবেস সিঙ্ক</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800 border border-neutral-300 flex items-center gap-1">
            <Zap className="w-3 h-3" />
            <span>অটোনোমাস অ্যাকশন</span>
          </span>
        );
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
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Action Engine Active (Zero API Key)</span>
                </span>
              </div>
              <p className="text-xs text-[#5C6652]">
                অটোনোমাস এক্সিকিউশন, প্রিভিউ ভেরিফিকেশন ও অ্যাডমিন কন্ট্রোল
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
            const proposal = msg.proposal;

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

                <div className={`max-w-[92%] space-y-3 ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Text Bubble */}
                  <div
                    className={`p-4 rounded-2xl text-xs leading-relaxed ${
                      isUser
                        ? 'bg-[#4A5D3B] text-[#FDFCF8] rounded-tr-none font-medium'
                        : 'bg-[#FFFFFF] text-[#2C3327] border border-[#D9DED1] shadow-2xs rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* ⚡ ACTION PREVIEW & PROPOSAL CARD (Human-in-the-loop Engine) */}
                  {proposal && (
                    <div className="rounded-2xl border border-neutral-200 bg-white shadow-sm overflow-hidden animate-fadeIn text-xs">
                      {/* Proposal Top Bar */}
                      <div className="p-3.5 bg-neutral-50/80 border-b border-neutral-200 flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          {renderProposalBadge(proposal.actionType)}
                          <span className="font-bold text-[#2C3327] text-xs">
                            {proposal.titleBn || proposal.titleEn}
                          </span>
                        </div>

                        {/* Status Chip */}
                        <div>
                          {proposal.status === 'PENDING_CONFIRMATION' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              <span>অনুমোদনের অপেক্ষায়</span>
                            </span>
                          )}
                          {proposal.status === 'EXECUTING' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300 flex items-center gap-1">
                              <RefreshCw className="w-3 h-3 animate-spin" />
                              <span>কার্যকর হচ্ছে...</span>
                            </span>
                          )}
                          {proposal.status === 'COMPLETED' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>সম্পন্ন হয়েছে</span>
                            </span>
                          )}
                          {proposal.status === 'REJECTED' && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-200 text-neutral-700 border border-neutral-300 flex items-center gap-1">
                              <X className="w-3 h-3" />
                              <span>বাতিলকৃত</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Proposal Body */}
                      <div className="p-4 space-y-3 bg-white">
                        <p className="text-neutral-700 leading-relaxed">
                          {proposal.summaryBn || proposal.summaryEn}
                        </p>

                        {/* Collapsible Payload Inspection */}
                        <div className="border border-neutral-200 rounded-xl overflow-hidden">
                          <button
                            type="button"
                            onClick={() => togglePayloadView(proposal.id)}
                            className="w-full px-3.5 py-2.5 bg-neutral-50 hover:bg-neutral-100/80 flex items-center justify-between text-neutral-700 text-[11px] font-bold transition-colors"
                          >
                            <span className="flex items-center gap-1.5">
                              <Eye className="w-3.5 h-3.5 text-neutral-500" />
                              <span>প্রস্তুতকৃত ডেটা পে-লোড দেখুন ({proposal.dataCount ? `${proposal.dataCount}টি আইটেম` : 'কনফিগারেশন'})</span>
                            </span>
                            {expandedPayloads[proposal.id] ? (
                              <ChevronUp className="w-4 h-4 text-neutral-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-neutral-500" />
                            )}
                          </button>

                          {expandedPayloads[proposal.id] && (
                            <div className="p-3 bg-neutral-50/50 border-t border-neutral-200 max-h-60 overflow-y-auto space-y-2 text-[11px]">
                              {/* Case studies preview */}
                              {proposal.payload?.caseStudies && (
                                <div className="space-y-2">
                                  {proposal.payload.caseStudies.map((cs: CaseStudy, idx: number) => (
                                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-neutral-200 shadow-2xs space-y-1">
                                      <div className="flex items-center justify-between font-bold text-neutral-900">
                                        <span>#{idx + 1} {cs.titleBn || cs.title}</span>
                                        <span className="text-emerald-700 font-bold">{cs.roas}x ROAS</span>
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-neutral-500 flex-wrap">
                                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded">ইন্ডাস্ট্রি: {cs.industryBn || cs.industry}</span>
                                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded">প্ল্যাটফর্ম: {cs.platform}</span>
                                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded">স্পেন্ড: ৳{cs.adSpendBDT?.toLocaleString('en-IN')}</span>
                                        <span className="bg-neutral-100 px-1.5 py-0.5 rounded">পারচেজ: {cs.purchases}+</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Knowledge items preview */}
                              {proposal.payload?.items && (
                                <div className="space-y-2">
                                  {proposal.payload.items.map((kb: KnowledgeBaseItem, idx: number) => (
                                    <div key={idx} className="p-2.5 bg-white rounded-lg border border-neutral-200 shadow-2xs space-y-1">
                                      <div className="font-bold text-neutral-900">
                                        Q{idx + 1}: {kb.questionBn || kb.question}
                                      </div>
                                      <p className="text-neutral-600 line-clamp-2">
                                        A: {kb.answerBn || kb.answer}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Benchmark preview */}
                              {proposal.payload?.benchmark && (
                                <div className="p-2.5 bg-white rounded-lg border border-neutral-200 shadow-2xs space-y-1.5">
                                  <div className="font-bold text-neutral-900">
                                    {proposal.payload.benchmark.productCategory} ({proposal.payload.benchmark.platform})
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="bg-neutral-100 p-1.5 rounded">CPM: ৳{proposal.payload.benchmark.cpmBDT}</div>
                                    <div className="bg-neutral-100 p-1.5 rounded">CVR: {proposal.payload.benchmark.cvrPercent}%</div>
                                    <div className="bg-neutral-100 p-1.5 rounded">CTR: {proposal.payload.benchmark.ctrPercent}%</div>
                                    <div className="bg-neutral-100 p-1.5 rounded">CPA: ৳{proposal.payload.benchmark.cpaBDT}</div>
                                  </div>
                                </div>
                              )}

                              {/* Generic payload fallback */}
                              {!proposal.payload?.caseStudies && !proposal.payload?.items && !proposal.payload?.benchmark && (
                                <pre className="text-[10px] text-neutral-700 bg-white p-2 rounded border border-neutral-200 overflow-x-auto">
                                  {JSON.stringify(proposal.payload, null, 2)}
                                </pre>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Execution Controls */}
                        {proposal.status === 'PENDING_CONFIRMATION' && (
                          <div className="pt-2 flex items-center gap-2 flex-wrap">
                            <button
                              type="button"
                              onClick={() => handleConfirmProposal(msg.id, proposal)}
                              disabled={executingProposalId === proposal.id}
                              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 hover:scale-[1.02] disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>নিশ্চিত করুন ও সেভ করুন</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCancelProposal(msg.id)}
                              disabled={executingProposalId === proposal.id}
                              className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-xl text-xs font-semibold transition-colors"
                            >
                              বাতিল করুন
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                onNavigateTab(proposal.targetTab, { subTab: proposal.targetSubTab });
                                onClose();
                              }}
                              className="px-3 py-2 text-neutral-600 hover:text-neutral-900 text-xs font-medium flex items-center gap-1 ml-auto"
                            >
                              <span>সংশ্লিষ্ট ট্যাবে যান</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Success banner if executed */}
                        {proposal.status === 'COMPLETED' && proposal.executionResult && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 space-y-1">
                            <div className="font-bold flex items-center gap-1.5 text-xs text-emerald-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>{proposal.executionResult.messageBn}</span>
                            </div>
                            {proposal.executionResult.details && (
                              <ul className="text-[10px] text-emerald-700 list-disc list-inside pt-1 space-y-0.5">
                                {proposal.executionResult.details.map((d, i) => (
                                  <li key={i}>{d}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

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

                  {/* Suggestion Chips & Answer Options */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {msg.suggestions.map((sug, idx) => {
                        const isControl = sug === 'স্কিপ করুন' || sug === 'ইন্টারভিউ বন্ধ করো' || sug === 'পরবর্তী প্রশ্ন' || sug === 'অনুমোদন ও সেভ করুন' || sug === 'পরবর্তী প্রশ্ন করুন';
                        return (
                          <button
                            key={idx}
                            onClick={() => {
                              if (isControl) {
                                processAdminQuery(sug);
                              } else {
                                setInputQuery(sug);
                              }
                            }}
                            className={`text-[11px] px-3 py-1.5 rounded-xl font-medium transition-all text-left flex items-center gap-1.5 border shadow-2xs ${
                              isControl 
                                ? 'bg-[#E8EAE2] hover:bg-[#D9DED1] text-[#2C3327] border-[#D9DED1]' 
                                : 'bg-purple-50 hover:bg-purple-100 text-purple-900 border-purple-200 hover:border-purple-300'
                            }`}
                          >
                            <Sparkles className={`w-3 h-3 shrink-0 ${isControl ? 'text-[#4A5D3B]' : 'text-purple-600'}`} />
                            <span className="line-clamp-2">{sug}</span>
                            {!isControl && (
                              <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-bold shrink-0 ml-1">
                                এডিট করুন
                              </span>
                            )}
                          </button>
                        );
                      })}
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
                <span className="font-semibold text-xs ml-1">অ্যাকশন প্ল্যান ও ডেটা পে-লোড প্রস্তুত হচ্ছে...</span>
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
              onClick={() => startSystemInterview()}
              className="px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-[11px] font-bold whitespace-nowrap transition-colors flex items-center gap-1 shadow-2xs"
            >
              <Bot className="w-3.5 h-3.5 text-purple-200 animate-pulse" />
              <span>🔄 সিঙ্ক ইন্টারভিউ রান করো</span>
            </button>
            <button
              onClick={() => processAdminQuery('ক্লায়েন্ট: Silk Craze, বাজেট: 35000, সেলস: 140000, অর্ডার: 280, প্ল্যাটফর্ম: TikTok। কেস স্টাডি যোগ করো')}
              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Zap className="w-3 h-3 text-emerald-600" />
              <span>+কেস স্টাডি ইনপুট</span>
            </button>
            <button
              onClick={() => processAdminQuery('প্রশ্ন: ক্যাম্পেইন অডিটের নিয়ম কী? উত্তর: আমাদের ফ্রি অডিট ফর্ম পূরণ করলে ২৪ ঘণ্টায় বিশদ রিপোর্ট পাঠানো হয়। নলেজ বেসে যোগ করো')}
              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Layers className="w-3 h-3 text-blue-600" />
              <span>+প্রশ্নোত্তর ইনপুট</span>
            </button>
            <button
              onClick={() => processAdminQuery('ড্রাফট কেস স্টাডিগুলো সব লাইভে পাবলিশ করো')}
              className="px-2.5 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
            >
              ড্রাফট পাবলিশ
            </button>
            <button
              onClick={() => processAdminQuery('ডলার এক্সচেঞ্জ রেট পরিবর্তন করে ১৩০ টাকা করো')}
              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors flex items-center gap-1"
            >
              <Calculator className="w-3 h-3 text-amber-600" />
              <span>ডলার রেট ১৩০ ৳</span>
            </button>
            <button
              onClick={() => processAdminQuery('সব পেন্ডিং নলেজ গ্যাপ সমাধান করো')}
              className="px-2.5 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors"
            >
              নলেজ গ্যাপ সমাধান
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
                    : "আপনার ডেটা লিখুন (যেমন: 'ক্লায়েন্ট: Aarong, বাজেট: 45000, সেলস: 180000, অর্ডার: 350। কেস স্টাডি যোগ করো')..."
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

