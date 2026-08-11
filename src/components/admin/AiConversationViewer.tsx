import React, { useState } from 'react';
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
  HelpCircle
} from 'lucide-react';
import { AIConversation, SiteSettings } from '../../types';
import { storageService } from '../../services/storageService';

interface AiConversationViewerProps {
  conversations?: AIConversation[];
  settings?: SiteSettings;
  onRefresh?: () => void;
}

export const AiConversationViewer: React.FC<AiConversationViewerProps> = ({ 
  conversations: propConversations, 
  settings, 
  onRefresh 
}) => {
  const [internalConversations, setInternalConversations] = useState<AIConversation[]>(() => storageService.getAIConversations());
  const [selectedConv, setSelectedConv] = useState<AIConversation | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const conversations = propConversations || internalConversations;

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const matchesVisitor = c.visitorId.toLowerCase().includes(q);
    const matchesMessage = c.messages.some(m => m.text.toLowerCase().includes(q));
    const matchesTopic = c.topics.some(t => t.toLowerCase().includes(q));
    return matchesVisitor || matchesMessage || matchesTopic;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] tracking-tight">
            এআই চ্যাটবট হিস্ট্রি ও কনভার্সেশন
          </h1>
          <p className="text-sm text-[#5C6652] mt-1">
            ওয়েবসাইটে ভিজিটরদের সাথে এআই অ্যাসিস্ট্যান্টের রিয়েল-টাইম প্রশ্নোত্তর ও লিড কনভার্সন জার্নি পর্যবেক্ষণ করুন।
          </p>
        </div>

        <div className="text-xs text-[#5C6652] font-semibold">
          মোট চ্যাট সেশন: <span className="font-bold text-[#2C3327]">{conversations.length} টি</span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-[#8A957F] absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="চ্যাট হিস্ট্রি বা ভিজিটর আইডি সার্চ করুন..."
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
  );
};
