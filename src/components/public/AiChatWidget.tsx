import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ArrowRight, 
  ExternalLink, 
  MessageCircle, 
  Calculator, 
  FileText,
  Minimize2,
  Maximize2,
  HelpCircle,
  Mic,
  MicOff,
  CheckCircle2,
  TrendingUp,
  Target,
  Eye,
  MousePointerClick,
  ShoppingBag,
  Zap,
  Phone
} from 'lucide-react';
import { aiService, AiChatResponse } from '../../services/aiService';
import { storageService } from '../../services/storageService';
import { AIMessage, InChatPredictionData, InChatLeadCardData } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface AiChatWidgetProps {
  onOpenLeadForm: () => void;
  onScrollToCalculator: () => void;
  onScrollToResults: () => void;
}

export const AiChatWidget: React.FC<AiChatWidgetProps> = ({
  onOpenLeadForm,
  onScrollToCalculator,
  onScrollToResults
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [conversationId, setConversationId] = useState<string>('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(false);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  
  // In-chat lead capture form state
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadCategory, setLeadCategory] = useState<string>('Fashion');
  const [leadSubmittedForMsgId, setLeadSubmittedForMsgId] = useState<Record<string, boolean>>({});
  const [leadSubmitting, setLeadSubmitting] = useState<boolean>(false);

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

  const quickPrompts = language === 'en' 
    ? [
        "What is the recommended budget for TikTok Ads?",
        "I need a Free Website & Pixel Audit",
        "How does Pixel & CAPI tracking work?",
        "View verified Case Studies & ROAS",
        "Rules to set up a TikTok Ads account?",
        "What are your service management fees?"
      ]
    : [
        "টিকটক অ্যাডে কেমন বাজেট লাগে?",
        "আমার ওয়েবসাইটের জন্য ফ্রি অডিট চাই",
        "পিক্সেল ও CAPI ট্র্যাকিং কীভাবে কাজ করে?",
        "রিসেন্ট কেস স্টাডি দেখতে চাই",
        "অ্যাড অ্যাকাউন্ট সেটআপের নিয়ম কী?",
        "সার্ভিস চার্জ ও ম্যানেজমেন্ট ফি কত?"
      ];

  // Initialize Speech Recognition (Client-side native Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = language === 'en' ? 'en-US' : 'bn-BD';

        recognition.onstart = () => {
          setIsListening(true);
          setVoiceNotice(language === 'en' ? '🎙️ Listening... Speak now.' : '🎙️ শুনছি... স্পষ্ট করে কথা বলুন।');
        };

        recognition.onend = () => {
          setIsListening(false);
          setTimeout(() => setVoiceNotice(null), 1200);
        };

        recognition.onerror = (event: any) => {
          setIsListening(false);
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            showVoiceNotice(
              language === 'en'
                ? '⚠️ Microphone permission denied. Please allow microphone access in browser settings.'
                : '⚠️ মাইক্রোফোন পারমিশন বন্ধ আছে। অনুগ্রহ করে ব্রাউজারে মাইক্রোফোন অন করুন।'
            );
          } else if (event.error === 'no-speech') {
            showVoiceNotice(
              language === 'en'
                ? 'ℹ️ No speech detected. Please try tapping the mic again.'
                : 'ℹ️ কোনো শব্দ শোনা যায়নি। পুনরায় মাইক চেপে কথা বলুন।'
            );
          }
        };

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript.trim()) {
            setInputMessage(transcript);
          }
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn('Speech recognition init warning:', err);
      }
    } else {
      setSpeechSupported(false);
    }

    return () => {
      if (voiceTimeoutRef.current) clearTimeout(voiceTimeoutRef.current);
    };
  }, [language]);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showVoiceNotice(
        language === 'en'
          ? 'Voice recognition is supported in Google Chrome, Microsoft Edge, and modern mobile browsers.'
          : 'ভয়েস ইনপুট Google Chrome, Microsoft Edge বা মোবাইল ব্রাউজারে ব্যবহার করুন।'
      );
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
          rec.lang = language === 'en' ? 'en-US' : 'bn-BD';
          rec.onstart = () => setIsListening(true);
          rec.onend = () => setIsListening(false);
          rec.onerror = () => setIsListening(false);
          rec.onresult = (ev: any) => {
            let t = '';
            for (let i = ev.resultIndex; i < ev.results.length; ++i) {
              t += ev.results[i][0].transcript;
            }
            if (t.trim()) setInputMessage(t);
          };
          recognitionRef.current = rec;
        }
        recognitionRef.current.lang = language === 'en' ? 'en-US' : 'bn-BD';
        recognitionRef.current.start();
      } catch (err) {
        console.warn('Speech recognition start fallback:', err);
        showVoiceNotice(
          language === 'en' 
            ? 'Please grant microphone permission to use voice input.' 
            : 'ভয়েস ইনপুটের জন্য মাইক্রোফোন অ্যাক্সেসের অনুমতি দিন।'
        );
      }
    }
  };

  // Initialize conversation session
  useEffect(() => {
    let convId = '';
    try {
      if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
        convId = localStorage.getItem('active_ai_conv_id') || '';
        if (!convId) {
          convId = `conv_${Date.now()}`;
          localStorage.setItem('active_ai_conv_id', convId);
        }
      } else {
        convId = `conv_${Date.now()}`;
      }
    } catch {
      convId = `conv_${Date.now()}`;
    }
    setConversationId(convId);

    // Initial greeting based on active language
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: language === 'en'
          ? "Hello! I am Sonjoy Sarkar's AI Ads Specialist. Ask me anything regarding TikTok & Facebook campaigns, pixel tracking, budget forecasts, or pricing."
          : 'নমস্কার! আমি সঞ্জয় সরকারের অফিশিয়াল এআই অ্যাসিস্ট্যান্ট। টিকটক বা ফেসবুক অ্যাড ক্যাম্পেইন, পিক্সেল ট্র্যাকিং, বাজেট ক্যালকুলেশন ও প্রাইসিং নিয়ে যে কোনো প্রশ্ন করতে পারেন।',
        timestamp: new Date().toISOString(),
        suggestedCtas: language === 'en'
          ? [
              { label: 'View Ads Prediction', action: 'CALCULATOR' },
              { label: 'Claim Free Strategy Audit', action: 'LEAD_FORM' },
              { label: 'Direct WhatsApp', action: 'WHATSAPP' }
            ]
          : [
              { label: 'টিকটক অ্যাডে কেমন বাজেট লাগে?', action: 'CALCULATOR' },
              { label: 'ফ্রি অডিট বুক করুন', action: 'LEAD_FORM' },
              { label: 'WhatsApp-এ আলোচনা', action: 'WHATSAPP' }
            ]
      }
    ]);
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }

    const userMsg: AIMessage = {
      id: `msg_${Date.now()}_u`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const history = messages.map(m => ({ sender: m.sender, text: m.text }));
      const response: AiChatResponse = await aiService.sendMessage({
        message: query,
        conversationId,
        history
      });

      const aiMsg: AIMessage = {
        id: `msg_${Date.now()}_a`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toISOString(),
        suggestedCtas: response.suggestedCtas as any,
        knowledgeBaseItemIds: response.sourceItemIds,
        isFallback: response.isKnowledgeGap,
        predictionData: response.predictionData,
        leadFormCard: response.leadFormCard
      };

      setMessages(prev => [...prev, aiMsg]);

      // Record conversation in storage
      storageService.saveAIConversation({
        id: conversationId,
        visitorId: storageService.getVisitorId(),
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        messages: [...messages, userMsg, aiMsg],
        topics: [query],
        knowledgeGapsIdentified: response.isKnowledgeGap ? [query] : [],
        calculatorUsed: !!response.predictionData,
        leadSubmitted: false,
        status: 'active'
      });

    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_${Date.now()}_err`,
          sender: 'ai',
          text: language === 'en'
            ? 'Connection temporary interruption. Please message Sonjoy directly on WhatsApp.'
            : 'দুঃখিত, সংযোগে সাময়িক ত্রুটি হয়েছে। অনুগ্রহ করে সরাসরি WhatsApp-এ কথা বলুন।',
          timestamp: new Date().toISOString(),
          suggestedCtas: [{ label: language === 'en' ? 'Direct WhatsApp' : 'WhatsApp-এ কথা বলুন', action: 'WHATSAPP' }]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCtaClick = (action: string) => {
    if (action === 'LEAD_FORM') {
      onOpenLeadForm();
    } else if (action === 'CALCULATOR') {
      onScrollToCalculator();
    } else if (action === 'CASE_STUDIES') {
      onScrollToResults();
    } else if (action === 'WHATSAPP') {
      window.open('https://wa.me/8801815124970', '_blank');
    }
  };

  const handleInChatLeadSubmit = async (msgId: string, prefilledBudget?: string) => {
    if (!leadName.trim() || !leadPhone.trim() || leadSubmitting) return;

    setLeadSubmitting(true);
    try {
      storageService.saveLeadSubmission({
        name: leadName.trim(),
        phone: leadPhone.trim(),
        businessType: leadCategory,
        monthlyBudget: prefilledBudget || '৳১৫,০০০ - ৳৩০,০০০',
        websiteUrl: '',
        notes: `Submitted via In-Chat AI Assistant. Conv ID: ${conversationId}`
      });

      setLeadSubmittedForMsgId(prev => ({ ...prev, [msgId]: true }));

      // Add instant AI confirmation message
      const confirmMsg: AIMessage = {
        id: `msg_${Date.now()}_conf`,
        sender: 'ai',
        text: language === 'en'
          ? `Thank you ${leadName}! Your strategy request has been submitted directly to Sonjoy Sarkar's team. We will contact you on WhatsApp (${leadPhone}) within 30 minutes.`
          : `ধন্যবাদ ${leadName}! আপনার ফ্রি স্ট্র্যাটেজি রিকোয়েস্ট সঞ্জয় সরকারের টিমের কাছে সংরক্ষিত হয়েছে। আমরা ৩০ মিনিটের মধ্যে আপনার WhatsApp (${leadPhone}) এ যোগাযোগ করবো।`,
        timestamp: new Date().toISOString(),
        suggestedCtas: [
          { label: language === 'en' ? 'Chat Instantly on WhatsApp' : 'সরাসরি WhatsApp-এ কথা বলুন', action: 'WHATSAPP' },
          { label: language === 'en' ? 'Open Calculator' : 'ফুল ক্যালকুলেটর দেখুন', action: 'CALCULATOR' }
        ]
      };
      setMessages(prev => [...prev, confirmMsg]);
    } catch (err) {
      console.error('Lead submit error:', err);
    } finally {
      setLeadSubmitting(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-40">
      
      {/* Floating Action Button / Launcher */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group border border-[#D9DED1]/30"
          id="ai-chat-launcher"
          aria-label="Open AI Assistant"
        >
          <div className="relative">
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#E2725B] rounded-full ring-2 ring-[#4A5D3B]"></span>
          </div>
          <span className="text-xs font-bold pr-1 hidden sm:inline-block">
            {language === 'en' ? 'AI Ads Specialist' : 'AI Assistant'}
          </span>
        </button>
      )}

      {/* Floating Chat Modal / Drawer */}
      {isOpen && (
        <div className="bg-[#FFFFFF] rounded-[32px] border border-[#D9DED1] shadow-2xl w-[360px] sm:w-[420px] h-[580px] max-h-[88vh] flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Top Bar */}
          <div className="bg-[#2C3327] text-[#FDFCF8] p-4 px-5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#4A5D3B] flex items-center justify-center text-[#FDFCF8] shadow-inner">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>{language === 'en' ? "Sonjoy's AI Specialist" : 'সঞ্জয়ের এআই বিশেষজ্ঞ'}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </div>
                <div className="text-[10px] text-[#8A957F]">
                  {language === 'en' ? 'Knowledge Grounded & ROI Predictor' : 'ভেরিফায়েড নলেজ ও প্রেডিকশন ইঞ্জিন'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-full hover:bg-[#3A4533] text-[#8A957F] hover:text-[#FDFCF8] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Stream */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FDFCF8]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#4A5D3B] text-[#FDFCF8] rounded-br-xs'
                      : 'bg-[#FFFFFF] text-[#2C3327] border border-[#D9DED1] shadow-xs rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* In-Chat Prediction Card */}
                {msg.predictionData && (
                  <div className="mt-2.5 max-w-[95%] bg-[#FFFFFF] border-2 border-[#4A5D3B]/30 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between border-b border-[#D9DED1] pb-2">
                      <div className="flex items-center gap-1.5 text-[#4A5D3B] font-bold text-xs">
                        <TrendingUp className="w-4 h-4" />
                        <span>{language === 'en' ? 'TikTok Ads Prediction Preview' : 'টিকটক পারফরম্যান্স প্রজেকশন'}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-[#4A5D3B]/10 text-[#4A5D3B] text-[10px] font-bold">
                        {msg.predictionData.category}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-center">
                      <div className="p-2 rounded-xl bg-[#F5F1EB] border border-[#D9DED1]">
                        <div className="text-[10px] text-[#5C6652]">{language === 'en' ? 'Ad Budget' : 'অ্যাড বাজেট'}</div>
                        <div className="text-xs font-bold text-[#2C3327]">৳{msg.predictionData.budgetBDT.toLocaleString('en-IN')} (${msg.predictionData.budgetUSD})</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F5F1EB] border border-[#D9DED1]">
                        <div className="text-[10px] text-[#5C6652]">{language === 'en' ? 'Est. Purchases' : 'সম্ভাব্য সেলস'}</div>
                        <div className="text-xs font-bold text-[#4A5D3B]">{msg.predictionData.estimatedResults} {language === 'en' ? 'Orders' : 'টি'}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F5F1EB] border border-[#D9DED1]">
                        <div className="text-[10px] text-[#5C6652]">{language === 'en' ? 'Impressions' : 'ইমপ্রেশন'}</div>
                        <div className="text-xs font-bold text-[#2C3327]">{msg.predictionData.impressions}</div>
                      </div>
                      <div className="p-2 rounded-xl bg-[#F5F1EB] border border-[#D9DED1]">
                        <div className="text-[10px] text-[#5C6652]">{language === 'en' ? 'Est. ROAS' : 'সম্ভাব্য ROAS'}</div>
                        <div className="text-xs font-bold text-[#E2725B]">{msg.predictionData.estimatedRoas}</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#5C6652] leading-tight bg-[#FDFCF8] p-2 rounded-lg border border-[#D9DED1]">
                      {msg.predictionData.verdict}
                    </div>

                    <button
                      onClick={onScrollToCalculator}
                      className="w-full py-2 bg-[#4A5D3B] hover:bg-[#3A4533] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Customize in Full Calculator' : 'সম্পূর্ণ ক্যালকুলেটরে কাস্টমাইজ করুন'}</span>
                    </button>
                  </div>
                )}

                {/* In-Chat Lead Form Card */}
                {msg.leadFormCard && !leadSubmittedForMsgId[msg.id] && (
                  <div className="mt-2.5 max-w-[95%] bg-[#FFFFFF] border-2 border-[#E2725B]/40 rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center gap-1.5 text-[#E2725B] font-bold text-xs border-b border-[#D9DED1] pb-2">
                      <Zap className="w-4 h-4" />
                      <span>{language === 'en' ? 'Get Instant Strategy & Free Audit' : 'ফ্রি স্ট্র্যাটেজি ও অডিট পেতে তথ্য দিন'}</span>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-bold text-[#5C6652] block mb-1">
                          {language === 'en' ? 'Your Name' : 'আপনার নাম'}
                        </label>
                        <input
                          type="text"
                          value={leadName}
                          onChange={(e) => setLeadName(e.target.value)}
                          placeholder={language === 'en' ? 'e.g. Tanvir Ahmed' : 'যেমন: তানভীর আহমেদ'}
                          className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#5C6652] block mb-1">
                          {language === 'en' ? 'WhatsApp / Phone' : 'হোয়াটসঅ্যাপ বা ফোন নম্বর'}
                        </label>
                        <input
                          type="tel"
                          value={leadPhone}
                          onChange={(e) => setLeadPhone(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-[#5C6652] block mb-1">
                          {language === 'en' ? 'Business Category' : 'ব্যবসার ক্যাটাগরি'}
                        </label>
                        <select
                          value={leadCategory}
                          onChange={(e) => setLeadCategory(e.target.value)}
                          className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-1.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                        >
                          <option value="Fashion">Fashion & Apparel (পোশাক)</option>
                          <option value="Cosmetics">Cosmetics & Beauty (কসমেটিক্স)</option>
                          <option value="Electronics">Electronics & Gadgets (গ্যাজেট)</option>
                          <option value="Food">Food & Organic (খাবার ও অর্গানিক)</option>
                          <option value="General">General E-commerce (অন্যান্য)</option>
                        </select>
                      </div>

                      <button
                        onClick={() => handleInChatLeadSubmit(msg.id, msg.leadFormCard?.budget)}
                        disabled={leadSubmitting || !leadName.trim() || !leadPhone.trim()}
                        className="w-full mt-1 py-2 bg-[#E2725B] hover:bg-[#D0604A] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{leadSubmitting ? 'সেভ হচ্ছে...' : (language === 'en' ? 'Submit Strategy Request' : 'সাবমিট করুন')}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* In-Chat Lead Form Success Confirmation */}
                {leadSubmittedForMsgId[msg.id] && (
                  <div className="mt-2.5 max-w-[95%] bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{language === 'en' ? 'Information received! We will contact you shortly.' : 'তথ্য সফলভাবে সংরক্ষিত হয়েছে!'}</span>
                  </div>
                )}

                {/* Suggested CTAs */}
                {msg.suggestedCtas && msg.suggestedCtas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[90%]">
                    {msg.suggestedCtas.map((cta, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCtaClick(cta.action)}
                        className="px-3 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] border border-[#D9DED1] rounded-full text-[10px] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        {cta.action === 'CALCULATOR' && <Calculator className="w-3 h-3 text-[#4A5D3B]" />}
                        {cta.action === 'LEAD_FORM' && <FileText className="w-3 h-3 text-[#4A5D3B]" />}
                        {cta.action === 'WHATSAPP' && <MessageCircle className="w-3 h-3 text-emerald-600" />}
                        <span>{cta.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#FFFFFF] border border-[#D9DED1] rounded-2xl max-w-[65%] shadow-2xs">
                <div className="w-2 h-2 rounded-full bg-[#4A5D3B] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#4A5D3B] animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-[#4A5D3B] animate-bounce [animation-delay:0.4s]"></div>
                <span className="text-[11px] text-[#8A957F] font-medium ml-1">
                  {language === 'en' ? 'Formulating insight...' : 'উত্তর তৈরি হচ্ছে...'}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-3 py-2 bg-[#F5F1EB]/80 border-t border-[#D9DED1] flex gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(qp)}
                className="whitespace-nowrap px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#E8EAE2] text-[#5C6652] text-[10px] font-medium rounded-lg border border-[#D9DED1] shrink-0 transition-colors shadow-2xs"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Voice status or error notice */}
          {voiceNotice && (
            <div className="px-3 py-1.5 bg-amber-50 border-t border-amber-200 text-[11px] text-amber-900 flex items-center justify-between gap-2 shrink-0 animate-fadeIn">
              <span className="truncate">{voiceNotice}</span>
              <button 
                onClick={() => setVoiceNotice(null)}
                className="text-amber-700 hover:text-amber-900 font-bold text-xs"
              >
                ✕
              </button>
            </div>
          )}

          {/* Chat Input Bar with Bengali/English Voice Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#FFFFFF] border-t border-[#D9DED1] flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={
                  isListening
                    ? (language === 'en' ? 'Listening... Speak now...' : 'শুনছি... মুখে বলুন...')
                    : (language === 'en' ? 'Ask question or enter budget (e.g. ৳30,000)...' : 'প্রশ্ন লিখুন বা বাজেট বলুন (e.g. বাজেট ৩০,০০০ টাকা)...')
                }
                className={`w-full bg-[#FDFCF8] border rounded-xl pl-3.5 pr-9 py-2.5 text-xs text-[#2C3327] focus:outline-none transition-all ${
                  isListening 
                    ? 'border-[#E2725B] ring-2 ring-[#E2725B]/20 bg-rose-50/30' 
                    : 'border-[#D9DED1] focus:border-[#4A5D3B]'
                }`}
              />

              {/* Voice Input Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
                  isListening 
                    ? 'bg-[#E2725B] text-white animate-pulse' 
                    : 'text-[#8A957F] hover:text-[#4A5D3B] hover:bg-[#E8EAE2]'
                }`}
                title={language === 'en' ? 'Voice Input (Bangla/English)' : 'ভয়েস ইনপুট (বাংলা/ইংরেজি)'}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-[#4A5D3B] hover:bg-[#3A4533] disabled:opacity-50 text-[#FDFCF8] rounded-xl transition-colors shrink-0 shadow-xs"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

        </div>
      )}

    </div>
  );
};

