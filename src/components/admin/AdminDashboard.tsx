import React, { useState } from 'react';
import { 
  Users, 
  MessageSquare, 
  AlertCircle, 
  Calculator, 
  TrendingUp, 
  CheckCircle2, 
  ArrowRight, 
  ExternalLink, 
  Sparkles, 
  Phone, 
  Clock, 
  ShieldCheck, 
  RefreshCw, 
  Database, 
  FileText,
  Tag,
  User,
  Bot
} from 'lucide-react';
import { Lead, LeadSubmission, KnowledgeGapItem, AIConversation, AdminTab, AdminTask } from '../../types';
import { AutomationTaskService } from '../../services/automationTaskService';
import { storageService } from '../../services/storageService';

interface AdminDashboardProps {
  leads: Lead[] | LeadSubmission[];
  knowledgeGaps: KnowledgeGapItem[];
  conversations: AIConversation[];
  onNavigateTab: (tab: AdminTab, params?: any) => void;
  onUpdateLeadStatus: (leadId: string, status: any) => void;
  onOpenTaskDrawer?: () => void;
  onOpenAiAssistant?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  leads = [],
  knowledgeGaps = [],
  conversations = [],
  onNavigateTab,
  onUpdateLeadStatus,
  onOpenTaskDrawer,
  onOpenAiAssistant
}) => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [tasks, setTasks] = useState<AdminTask[]>(() => {
    return AutomationTaskService.generateTasks({
      leads,
      knowledgeGaps,
      conversations,
      caseStudies: storageService.getCaseStudies(true),
      benchmarks: storageService.getBenchmarks(true),
      priceRanges: storageService.getProductPriceRanges(),
      siteSettings: storageService.getSiteSettings(),
      isFirebaseWorking: false, // Default indicator triggers action task
      firebaseErrorDetails: 'Firestore Database (default) is not yet provisioned in Google Cloud console.'
    });
  });

  const handleRefreshScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const updated = AutomationTaskService.generateTasks({
        leads,
        knowledgeGaps,
        conversations,
        caseStudies: storageService.getCaseStudies(true),
        benchmarks: storageService.getBenchmarks(true),
        priceRanges: storageService.getProductPriceRanges(),
        siteSettings: storageService.getSiteSettings(),
        isFirebaseWorking: false,
        firebaseErrorDetails: 'Firestore Database (default) is not yet provisioned in Google Cloud console.'
      });
      setTasks(updated);
      setIsScanning(false);
    }, 400);
  };

  const newLeads = (leads || []).filter(l => l.status === 'NEW');
  const convertedLeads = (leads || []).filter(l => l.status === 'CONVERTED');
  const unresolvedGaps = (knowledgeGaps || []).filter(g => !g.resolved);
  const totalCalculations = (leads || []).filter(l => Boolean((l as any).calculatorSnapshot || (l as any).calculatorUsed)).length + 48; // Sample analytics baseline

  const criticalTasks = tasks.filter(t => t.priority === 'CRITICAL' || t.priority === 'HIGH');

  return (
    <div className="space-y-8 max-w-6xl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327]">
            পারফরম্যান্স ও লিড ওভারভিউ
          </h1>
          <p className="text-xs text-[#5C6652] mt-1">
            ST Web & Ads Studio ক্যাম্পেইন এনকোয়ারি, এআই চ্যাট ও কনভার্সন অ্যানালিটিক্স
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="px-4 py-2 bg-[#4A5D3B] text-[#FDFCF8] hover:bg-[#3D4D30] rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ring-2 ring-[#4A5D3B]/20"
              title="Admin AI Assistant খুলুন - সেটিংস ও কনফিগারেশন সার্চ করুন"
            >
              <Bot className="w-4 h-4" />
              <span>Admin AI Assistant</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('PROFILE')}
            className="px-4 py-2 bg-[#FFFFFF] border border-[#D9DED1] text-[#2C3327] hover:bg-[#E8EAE2] rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-2xs"
            title="আপনার প্রোফাইল, ছবি, বায়ো ও স্ট্যাটস সম্পাদনা করুন"
          >
            <User className="w-4 h-4 text-[#4A5D3B]" />
            <span>প্রোফাইল এডিট</span>
          </button>

          <button
            onClick={() => onNavigateTab('GTM_TRACKING')}
            className="px-4 py-2 bg-[#FFFFFF] border border-[#D9DED1] text-[#2C3327] hover:bg-[#E8EAE2] rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-2xs"
            title="Google Tag Manager ও পিক্সেল কনফিগারেশন"
          >
            <Tag className="w-4 h-4 text-[#4A5D3B]" />
            <span>GTM ও পিক্সেল</span>
          </button>

          {onOpenTaskDrawer && (
            <button
              onClick={onOpenTaskDrawer}
              className="px-4 py-2 bg-[#E8EAE2] border border-[#D9DED1] text-[#4A5D3B] hover:bg-[#D9DED1]/60 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-[#4A5D3B]" />
              <span>টাস্ক ({tasks.length})</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab('LEADS')}
            className="px-4 py-2 bg-[#2C3327] text-[#FDFCF8] rounded-xl text-xs font-semibold hover:bg-[#1f241b] transition-colors flex items-center gap-2 shadow-2xs"
          >
            <Users className="w-4 h-4" />
            <span>লিড ({newLeads.length})</span>
          </button>
        </div>
      </div>

      {/* SMART AUTOMATION & TASK SUGGESTION BANNER */}
      {criticalTasks.length > 0 && (
        <div className="bg-[#FFFFFF] rounded-3xl border-2 border-[#4A5D3B]/25 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#D9DED1]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center shadow-2xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-[#2C3327] flex items-center gap-2">
                  <span>অটোমেশন ও অ্যাকশন সাজেশন</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#E2725B] text-white">
                    {tasks.length}টি কাজ প্রয়োজন
                  </span>
                </h3>
                <p className="text-[11px] text-[#5C6652]">
                  সিস্টেমের বর্তমান স্ট্যাটাস অনুযায়ী নিচের কাজগুলো দ্রুত সম্পন্ন করার পরামর্শ দেওয়া হচ্ছে:
                </p>
              </div>
            </div>

            <button
              onClick={handleRefreshScan}
              disabled={isScanning}
              className="text-xs font-semibold text-[#5C6652] hover:text-[#2C3327] flex items-center gap-1 p-1.5 rounded-lg hover:bg-[#F5F1EB]"
              title="পুনরায় স্ক্যান করুন"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">রিফ্রেশ</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {criticalTasks.slice(0, 4).map((task) => (
              <div
                key={task.id}
                onClick={() => onNavigateTab(task.targetTab, task.targetParams)}
                className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] hover:border-[#4A5D3B] hover:shadow-2xs transition-all cursor-pointer group flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A957F]">
                      {task.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        task.priority === 'CRITICAL'
                          ? 'bg-[#E2725B]/15 text-[#E2725B]'
                          : 'bg-amber-500/15 text-amber-700'
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-[#2C3327] group-hover:text-[#4A5D3B] transition-colors mt-1">
                    {task.titleBn || task.title}
                  </h4>

                  <p className="text-[11px] text-[#5C6652] mt-0.5 line-clamp-2">
                    {task.reasonBn || task.reason}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#D9DED1]/60 flex items-center justify-between">
                  <span className="text-[10px] text-[#8A957F]">সরাসরি সেকশনে যান</span>
                  <span className="text-xs font-bold text-[#4A5D3B] group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    <span>{task.actionLabelBn || task.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D9DED1] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A957F] font-bold uppercase tracking-wider mb-2">
            <span>মোট লিড ও অডিট রিকোয়েস্ট</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#2C3327]">{leads.length}</div>
          <div className="text-[11px] text-[#4A5D3B] font-semibold mt-1 flex items-center gap-1">
            <span>{newLeads.length} টি অ্যাকশন বাকি (NEW)</span>
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D9DED1] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A957F] font-bold uppercase tracking-wider mb-2">
            <span>অ্যাড প্রেডিকশন ক্যালকুলেটর</span>
            <div className="w-8 h-8 rounded-xl bg-[#F5F1EB] text-[#A69076] flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#2C3327]">{totalCalculations}</div>
          <div className="text-[11px] text-[#8A957F] mt-1">
            ভিজিটররা বাজেট ও আউটপুট হিসাব করেছেন
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D9DED1] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A957F] font-bold uppercase tracking-wider mb-2">
            <span>এআই চ্যাট সেশন</span>
            <div className="w-8 h-8 rounded-xl bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-[#2C3327]">{conversations.length}</div>
          <div className="text-[11px] text-[#8A957F] mt-1">
            নলেজ বেস থেকে স্বয়ংক্রিয় উত্তর পেয়েছে
          </div>
        </div>

        <div className="bg-[#FFFFFF] p-5 rounded-3xl border border-[#D9DED1] shadow-2xs">
          <div className="flex items-center justify-between text-xs text-[#8A957F] font-bold uppercase tracking-wider mb-2">
            <span>অজানা প্রশ্ন (Knowledge Gaps)</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-serif font-bold text-amber-700">{unresolvedGaps.length}</div>
          <div className="text-[11px] text-amber-600 font-semibold mt-1">
            নলেজ বেসে যোগ করার প্রয়োজন
          </div>
        </div>

      </div>

      {/* Main Row: Recent Leads & Knowledge Gaps */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Recent Leads (Left 7 Cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9DED1]">
            <h3 className="font-serif text-lg font-bold text-[#2C3327]">
              সর্বশেষ লিড ও ক্লায়েন্ট এনকোয়ারি
            </h3>
            <button
              onClick={() => onNavigateTab('LEADS')}
              className="text-xs font-semibold text-[#4A5D3B] hover:underline flex items-center gap-1"
            >
              <span>সব দেখুন ({leads.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {leads.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#8A957F]">
              এখনো কোনো লিড জমা পড়েনি।
            </div>
          ) : (
            <div className="space-y-3">
              {leads.slice(0, 5).map((lead) => {
                const rawPhone = lead.phone || (lead as any).whatsapp || '';
                const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '') : '';
                return (
                  <div
                    key={lead.id}
                    className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#2C3327]">{lead.name}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                            lead.status === 'NEW'
                              ? 'bg-[#E2725B] text-[#FDFCF8]'
                              : lead.status === 'CONVERTED'
                              ? 'bg-[#25D366] text-[#FDFCF8]'
                              : 'bg-[#E8EAE2] text-[#4A5D3B]'
                          }`}
                        >
                          {lead.status}
                        </span>
                      </div>

                      <div className="text-[11px] text-[#5C6652] mt-0.5">
                        {lead.businessType} • {lead.interestedService} • {lead.monthlyBudget || 'বাজেট উল্লেখ নেই'}
                      </div>

                      {lead.calculatorSnapshot && (
                        <div className="text-[10px] text-[#4A5D3B] font-medium mt-0.5">
                          ক্যালকুলেটর ব্যবহারকারী: ৳{lead.calculatorSnapshot.budgetBDT} বাজেট
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`হ্যালো ${lead.name}, আমি সঞ্জয় সরকার (ST Web & Ads Studio)। আপনার অডিট রিকোয়েস্ট পেয়েছি।`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                        title="WhatsApp এ মেসেজ দিন"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </a>

                      <select
                        value={lead.status}
                        onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value)}
                        className="text-[11px] bg-[#FFFFFF] border border-[#D9DED1] rounded-lg px-2 py-1 font-medium text-[#2C3327]"
                      >
                        <option value="NEW">NEW</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="QUALIFIED">QUALIFIED</option>
                        <option value="CONVERTED">CONVERTED</option>
                        <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Knowledge Gaps Inbox (Right 5 Cols) */}
        <div className="lg:col-span-5 bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#D9DED1]">
            <h3 className="font-serif text-lg font-bold text-[#2C3327] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>নলেজ গ্যাপ ইনবক্স</span>
            </h3>
            <button
              onClick={() => onNavigateTab('KNOWLEDGE_GAPS')}
              className="text-xs font-semibold text-[#4A5D3B] hover:underline"
            >
              সব দেখুন
            </button>
          </div>

          <p className="text-[11px] text-[#5C6652]">
            ভিজিটররা এমন প্রশ্ন করেছেন যার তথ্য বর্তমানে নলেজ বেসে নেই:
          </p>

          {unresolvedGaps.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#4A5D3B] bg-[#E8EAE2]/40 rounded-2xl">
              অভিনন্দন! কোনো অমীমাংসিত নলেজ গ্যাপ নেই।
            </div>
          ) : (
            <div className="space-y-3">
              {unresolvedGaps.slice(0, 4).map((gap) => (
                <div key={gap.id} className="p-3.5 rounded-2xl bg-amber-50/50 border border-amber-200 text-xs">
                  <div className="font-semibold text-[#2C3327] mb-1">
                    "{gap.query}"
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[#8A957F]">
                    <span>জিজ্ঞেস করেছে {gap.frequency} বার</span>
                    <button
                      onClick={() => onNavigateTab('KNOWLEDGE_BASE')}
                      className="text-[#4A5D3B] font-bold hover:underline"
                    >
                      + নলেজ বেসে উত্তর লিখুন
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

