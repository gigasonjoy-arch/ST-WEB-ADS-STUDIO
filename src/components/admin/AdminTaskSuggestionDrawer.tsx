import React, { useState } from 'react';
import { 
  AdminTask, 
  AdminTab, 
  TaskPriority, 
  TaskCategory 
} from '../../types';
import { 
  Sparkles, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw, 
  Users, 
  Calculator, 
  AlertCircle, 
  Database, 
  FileText, 
  TrendingUp, 
  Settings, 
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Clock,
  Check
} from 'lucide-react';

interface AdminTaskSuggestionDrawerProps {
  tasks: AdminTask[];
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: AdminTab, params?: any) => void;
  onRefreshScan: () => void;
  isScanning?: boolean;
}

export const AdminTaskSuggestionDrawer: React.FC<AdminTaskSuggestionDrawerProps> = ({
  tasks = [],
  isOpen,
  onClose,
  onNavigateTab,
  onRefreshScan,
  isScanning = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const activeTasks = tasks.filter(t => !completedTaskIds.includes(t.id));
  const criticalCount = activeTasks.filter(t => t.priority === 'CRITICAL').length;
  const highCount = activeTasks.filter(t => t.priority === 'HIGH').length;

  const filteredTasks = activeTasks.filter(t => {
    if (selectedCategory === 'ALL') return true;
    return t.category === selectedCategory;
  });

  const handleTaskClick = (task: AdminTask) => {
    onNavigateTab(task.targetTab, task.targetParams);
    onClose();
  };

  const handleToggleComplete = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedTaskIds(prev => 
      prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]
    );
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E2725B]/15 text-[#E2725B] border border-[#E2725B]/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E2725B] animate-ping" />
            <span>জরুরি (CRITICAL)</span>
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-700 border border-amber-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>উচ্চ অগ্রাধিকার (HIGH)</span>
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#4A5D3B]/15 text-[#4A5D3B] border border-[#4A5D3B]/30">
            মাঝারি (MEDIUM)
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8A957F]/15 text-[#5C6652] border border-[#8A957F]/30">
            পরামর্শ (INFO)
          </span>
        );
    }
  };

  const getCategoryIcon = (category: TaskCategory) => {
    switch (category) {
      case 'LEAD':
        return <Users className="w-4 h-4 text-[#4A5D3B]" />;
      case 'BENCHMARK':
        return <Calculator className="w-4 h-4 text-[#A69076]" />;
      case 'KNOWLEDGE_GAP':
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
      case 'CONTENT':
        return <FileText className="w-4 h-4 text-[#4A5D3B]" />;
      case 'FIREBASE':
        return <Database className="w-4 h-4 text-[#E2725B]" />;
      default:
        return <Settings className="w-4 h-4 text-[#5C6652]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C3327]/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      {/* Slide-over panel */}
      <div className="bg-[#FFFFFF] w-full max-w-2xl h-full shadow-2xl flex flex-col justify-between border-l border-[#D9DED1] animate-slideLeft">
        
        {/* Header */}
        <div className="p-6 border-b border-[#D9DED1] bg-[#FDFCF8]">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#2C3327] flex items-center gap-2">
                  <span>অটোমেশন ও টাস্ক সাজেশন</span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-sans font-bold bg-[#E8EAE2] text-[#4A5D3B]">
                    {activeTasks.length}টি পেন্ডিং
                  </span>
                </h2>
                <p className="text-xs text-[#5C6652]">
                  সিস্টেম অডিট ও কাস্টমার এনকোয়ারি ভিত্তিক স্মার্ট অ্যাকশন প্ল্যান
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onRefreshScan}
                disabled={isScanning}
                className={`p-2.5 rounded-xl border border-[#D9DED1] text-[#5C6652] hover:bg-[#F5F1EB] hover:text-[#2C3327] transition-all flex items-center gap-1.5 text-xs font-semibold ${
                  isScanning ? 'opacity-60 cursor-not-allowed' : ''
                }`}
                title="পুনরায় স্ক্যান করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">স্ক্যান রিফ্রেশ</span>
              </button>

              <button
                onClick={onClose}
                className="p-2.5 rounded-xl hover:bg-[#F5F1EB] text-[#8A957F] hover:text-[#2C3327] transition-colors"
                title="বন্ধ করুন"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3 mt-5">
            <div className="p-3 rounded-2xl bg-[#FFFFFF] border border-[#D9DED1]">
              <div className="text-[10px] uppercase font-bold text-[#8A957F]">পেন্ডিং কাজ</div>
              <div className="text-xl font-serif font-bold text-[#2C3327]">{activeTasks.length}</div>
            </div>

            <div className="p-3 rounded-2xl bg-[#E2725B]/5 border border-[#E2725B]/20">
              <div className="text-[10px] uppercase font-bold text-[#E2725B]">জরুরি অ্যাকশন</div>
              <div className="text-xl font-serif font-bold text-[#E2725B]">{criticalCount}</div>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200">
              <div className="text-[10px] uppercase font-bold text-amber-700">উচ্চ অগ্রাধিকার</div>
              <div className="text-xl font-serif font-bold text-amber-800">{highCount}</div>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 mt-4">
            {[
              { id: 'ALL', label: 'সবগুলো কাজ' },
              { id: 'LEAD', label: 'নতুন লিড' },
              { id: 'BENCHMARK', label: 'বেঞ্চমার্ক' },
              { id: 'KNOWLEDGE_GAP', label: 'নলেজ গ্যাপ' },
              { id: 'CONTENT', label: 'কেস স্টাডি/ড্রাফট' },
              { id: 'FIREBASE', label: 'ফায়ারবেস/ক্লাউড' }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-[#4A5D3B] text-[#FDFCF8]'
                    : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F5F1EB]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Task List Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#F5F1EB]/40">
          {filteredTasks.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#2C3327]">
                অসাধারণ! কোনো পেন্ডিং কাজ নেই
              </h3>
              <p className="text-xs text-[#5C6652] max-w-sm mx-auto">
                আপনার সিস্টেমের সব লিড, বেঞ্চমার্ক, নলেজ বেস এবং সেটিংস সম্পূর্ণ আপ-টু-ডেট আছে।
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleTaskClick(task)}
                className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] p-5 shadow-2xs hover:shadow-md hover:border-[#4A5D3B]/40 transition-all cursor-pointer group space-y-3"
              >
                {/* Card Top Meta */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-[#F5F1EB] flex items-center justify-center">
                      {getCategoryIcon(task.category)}
                    </div>
                    <span className="text-[11px] font-bold text-[#5C6652]">
                      {task.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(task.priority)}
                    <button
                      onClick={(e) => handleToggleComplete(task.id, e)}
                      className="p-1 rounded-lg text-[#8A957F] hover:text-[#4A5D3B] hover:bg-[#E8EAE2] transition-colors"
                      title="Mark as Done"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Task Title */}
                <div>
                  <h4 className="font-serif text-base font-bold text-[#2C3327] group-hover:text-[#4A5D3B] transition-colors">
                    {task.titleBn || task.title}
                  </h4>
                  <p className="text-xs text-[#5C6652] mt-1 leading-relaxed">
                    {task.descriptionBn || task.description}
                  </p>
                </div>

                {/* Why it is needed (কারণ) */}
                <div className="p-3 bg-[#FDFCF8] rounded-2xl border border-[#D9DED1]/70 text-[11px] space-y-1">
                  <div className="font-bold text-[#8A957F] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4A5D3B]" />
                    <span>কেন এই কাজটি করা প্রয়োজন:</span>
                  </div>
                  <p className="text-[#2C3327] leading-relaxed pl-3 font-medium">
                    {task.reasonBn || task.reason}
                  </p>
                </div>

                {/* Direct Jump Button */}
                <div className="pt-2 flex items-center justify-between border-t border-[#D9DED1]/60">
                  <span className="text-[10px] text-[#8A957F] font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>অটো-ডিটেক্টেড টাস্ক</span>
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                    className="px-4 py-1.5 bg-[#4A5D3B] text-[#FDFCF8] rounded-xl text-xs font-semibold group-hover:bg-[#3A4533] transition-colors flex items-center gap-1.5 shadow-2xs"
                  >
                    <span>{task.actionLabelBn || task.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#D9DED1] bg-[#FDFCF8] flex items-center justify-between text-xs text-[#5C6652]">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#4A5D3B]" />
            <span>অটোমেশন ইঞ্জিন লাইভ সক্রিয়</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-[#D9DED1] font-semibold text-[#2C3327] hover:bg-[#F5F1EB]"
          >
            প্যানেল বন্ধ করুন
          </button>
        </div>

      </div>
    </div>
  );
};
