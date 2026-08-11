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
  HelpCircle
} from 'lucide-react';
import { aiService, AiChatResponse } from '../../services/aiService';
import { storageService } from '../../services/storageService';
import { AIMessage } from '../../types';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = language === 'en' 
    ? [
        "What is the recommended budget for TikTok Ads?",
        "What prerequisites are needed to launch?",
        "Show me the Ad Budget Calculator",
        "View verified Case Studies & ROAS"
      ]
    : [
        "টিকটক অ্যাডে কেমন বাজেট লাগে?",
        "ক্যাম্পেইন শুরু করতে কী কী প্রয়োজন?",
        "অ্যাড ক্যালকুলেটর দেখতে চাই",
        "কেস স্টাডি ও ফলাফল দেখতে চাই"
      ];

  // Initialize conversation session
  useEffect(() => {
    let convId = localStorage.getItem('active_ai_conv_id');
    if (!convId) {
      convId = `conv_${Date.now()}`;
      localStorage.setItem('active_ai_conv_id', convId);
    }
    setConversationId(convId);

    // Initial greeting based on active language
    setMessages([
      {
        id: 'msg_welcome',
        sender: 'ai',
        text: language === 'en'
          ? "Hello! I am Sonjoy Sarkar's AI Ads Specialist. Ask me anything regarding TikTok & Facebook ad campaigns, pixel tracking, budget projections, or scaling strategies."
          : 'নমস্কার! আমি সঞ্জয় সরকারের অফিশিয়াল এআই অ্যাসিস্ট্যান্ট। টিকটক বা ফেসবুক অ্যাড ক্যাম্পেইন, ট্র্যাকিং ও বাজেট নিয়ে আপনার যে কোনো প্রশ্ন করতে পারেন।',
        timestamp: new Date().toISOString(),
        suggestedCtas: language === 'en'
          ? [
              { label: 'View Ads Prediction', action: 'CALCULATOR' },
              { label: 'Claim Strategy Audit', action: 'LEAD_FORM' }
            ]
          : [
              { label: 'Ads Prediction দেখুন', action: 'CALCULATOR' },
              { label: 'Lead Form পূরণ করুন', action: 'LEAD_FORM' }
            ]
      }
    ]);
  }, [language]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || isLoading) return;

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
        isFallback: response.isKnowledgeGap
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
        calculatorUsed: false,
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
        <div className="bg-[#FFFFFF] rounded-[32px] border border-[#D9DED1] shadow-2xl w-[360px] sm:w-[410px] h-[540px] max-h-[85vh] flex flex-col overflow-hidden animate-fadeIn">
          
          {/* Top Bar */}
          <div className="bg-[#2C3327] text-[#FDFCF8] p-4 px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4A5D3B] flex items-center justify-center text-[#FDFCF8]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold flex items-center gap-1.5">
                  <span>{language === 'en' ? "Sonjoy's AI Specialist" : 'সঞ্জয়ের এআই বিশেষজ্ঞ'}</span>
                  <span className="w-2 h-2 rounded-full bg-[#E2725B]"></span>
                </div>
                <div className="text-[10px] text-[#8A957F]">
                  {language === 'en' ? 'Knowledge Base Grounded' : 'ভেরিফায়েড নলেজ গ্রাউন্ডেড'}
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
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-[#4A5D3B] text-[#FDFCF8] rounded-br-xs'
                      : 'bg-[#FFFFFF] text-[#2C3327] border border-[#D9DED1] shadow-xs rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Suggested CTAs */}
                {msg.suggestedCtas && msg.suggestedCtas.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2 max-w-[88%]">
                    {msg.suggestedCtas.map((cta, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleCtaClick(cta.action)}
                        className="px-3 py-1 bg-[#F5F1EB] hover:bg-[#E8EAE2] text-[#4A5D3B] border border-[#D9DED1] rounded-full text-[10px] font-bold transition-colors flex items-center gap-1"
                      >
                        {cta.action === 'CALCULATOR' && <Calculator className="w-3 h-3 text-[#4A5D3B]" />}
                        {cta.action === 'LEAD_FORM' && <FileText className="w-3 h-3 text-[#4A5D3B]" />}
                        {cta.action === 'WHATSAPP' && <MessageCircle className="w-3 h-3 text-[#4A5D3B]" />}
                        <span>{cta.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-3 bg-[#FFFFFF] border border-[#D9DED1] rounded-2xl max-w-[60%]">
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

          {/* Quick Prompts Bar (when only welcome message) */}
          {messages.length <= 2 && (
            <div className="px-3 py-2 bg-[#F5F1EB]/70 border-t border-[#D9DED1] flex gap-1.5 overflow-x-auto no-scrollbar">
              {quickPrompts.map((qp, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(qp)}
                  className="whitespace-nowrap px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#E8EAE2] text-[#5C6652] text-[10px] font-medium rounded-lg border border-[#D9DED1] shrink-0 transition-colors"
                >
                  {qp}
                </button>
              ))}
            </div>
          )}

          {/* Chat Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-[#FFFFFF] border-t border-[#D9DED1] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={language === 'en' ? 'Ask a question (e.g. budget, pixel requirements)...' : 'প্রশ্ন লিখুন (e.g. বাজেট, পিক্সেলে কী লাগবে?)...'}
              className="flex-1 bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
            />
            <button
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="p-2.5 bg-[#4A5D3B] hover:bg-[#3A4533] disabled:opacity-50 text-[#FDFCF8] rounded-xl transition-colors shrink-0"
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
