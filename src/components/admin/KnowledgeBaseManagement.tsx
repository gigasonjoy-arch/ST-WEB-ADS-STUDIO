import React, { useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  X, 
  Search, 
  Sparkles, 
  CheckCircle2, 
  Tag, 
  Layers, 
  Eye,
  SlidersHorizontal,
  Bot,
  ArrowRight
} from 'lucide-react';
import { KnowledgeBaseItem, KnowledgeCategory, KnowledgeStatus, SiteSettings } from '../../types';
import { storageService } from '../../services/storageService';

interface KnowledgeBaseManagementProps {
  settings?: SiteSettings;
  onRefresh?: () => void;
}

export const KnowledgeBaseManagement: React.FC<KnowledgeBaseManagementProps> = ({ settings, onRefresh }) => {
  const [items, setItems] = useState<KnowledgeBaseItem[]>(() => storageService.getKnowledgeBase(false));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [editingItem, setEditingItem] = useState<KnowledgeBaseItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [keywordInput, setKeywordInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Test playground state
  const [testQuery, setTestQuery] = useState('');
  const [testResult, setTestResult] = useState<KnowledgeBaseItem | null>(null);

  const categories: KnowledgeCategory[] = [
    'Business',
    'Sonjoy',
    'TikTok Ads',
    'Facebook Ads',
    'Services',
    'Process',
    'Case Studies',
    'Calculator',
    'Contact',
    'Policies',
    'General'
  ];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = (item: KnowledgeBaseItem) => {
    storageService.saveKnowledgeItem(item);
    setItems(storageService.getKnowledgeBase(false));
    setEditingItem(null);
    setIsCreating(false);
    showToast('নলেজ বেস আর্টিকেল সফলভাবে সংরক্ষণ করা হয়েছে!');
    if (onRefresh) onRefresh();
  };

  const handleDelete = (id: string) => {
    if (confirm('আপনি কি নিশ্চিত যে এই আর্টিকেলটি মুছে ফেলতে চান?')) {
      storageService.deleteKnowledgeItem(id);
      setItems(storageService.getKnowledgeBase(false));
      showToast('আর্টিকেল মুছে ফেলা হয়েছে।');
      if (onRefresh) onRefresh();
    }
  };

  const filteredItems = items.filter(item => {
    if (!item) return false;
    const q = (searchQuery || '').toLowerCase().trim();
    const matchesSearch = !q ||
      (item.title || '').toLowerCase().includes(q) ||
      (item.question || '').toLowerCase().includes(q) ||
      (item.answer || '').toLowerCase().includes(q) ||
      (Array.isArray(item.keywords) && item.keywords.some(k => (k || '').toLowerCase().includes(q)));
    
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleRunTest = () => {
    if (!testQuery.trim()) return;
    const q = testQuery.toLowerCase().trim();
    const words = q.split(/\s+/).filter(w => w.length > 2);

    let bestMatch: KnowledgeBaseItem | null = null;
    let highestScore = 0;

    items.filter(i => i && i.status === 'published').forEach(item => {
      let score = 0;
      const kws = Array.isArray(item.keywords) ? item.keywords : [];
      kws.forEach(kw => {
        if (kw && q.includes((kw || '').toLowerCase())) score += 5;
      });
      words.forEach(word => {
        if (item.title && item.title.toLowerCase().includes(word)) score += 3;
        if (item.question && item.question.toLowerCase().includes(word)) score += 4;
        if (item.answer && item.answer.toLowerCase().includes(word)) score += 1;
      });
      score += (item.priority || 5) * 0.5;

      if (score > highestScore && score >= 5) {
        highestScore = score;
        bestMatch = item;
      }
    });

    setTestResult(bestMatch);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D9DED1] pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327] tracking-tight">
            নলেজ বেস ও AI গ্রাউন্ডিং ডাটা
          </h1>
          <p className="text-sm text-[#5C6652] mt-1">
            এআই চ্যাটবটের অ্যান্টি-হ্যালুসিনেশন নলেজ ব্যাংক। এখানে যোগ করা তথ্যের বাইরে এআই কোনো মনগড়া উত্তর দেবে না।
          </p>
        </div>

        <button
          onClick={() => {
            const newItem: KnowledgeBaseItem = {
              id: 'kb-' + Date.now().toString(36),
              title: 'নতুন প্রশ্নোত্তর',
              category: 'Services',
              question: 'গ্রাহকের সম্ভাব্য প্রশ্ন কী?',
              answer: 'সোনজয় সরকার এবং এসটি ওয়েবের সঠিক উত্তর বিস্তারিত লিখুন...',
              keywords: ['ক্যাম্পেইন', 'টিকটক'],
              priority: 5,
              status: 'published',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            setEditingItem(newItem);
            setKeywordInput(newItem.keywords.join(', '));
            setIsCreating(true);
          }}
          className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>নতুন আর্টিকেল যোগ করুন</span>
        </button>
      </div>

      {toastMessage && (
        <div className="bg-[#4A5D3B] text-white px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* AI Grounding Simulator Card */}
      <div className="bg-gradient-to-r from-[#E8EAE2] to-[#F5F1EB] p-5 sm:p-6 rounded-3xl border border-[#D9DED1] space-y-4">
        <div className="flex items-center gap-2 text-[#4A5D3B]">
          <Bot className="w-5 h-5" />
          <h3 className="font-serif font-bold text-base text-[#2C3327]">এআই গ্রাউন্ডিং টেস্ট প্লে-গ্রাউন্ড</h3>
        </div>
        <p className="text-xs text-[#5C6652]">
          যেকোনো কাস্টমার প্রশ্ন লিখে টেস্ট করুন আপনার নলেজ বেস থেকে কোন আর্টিকেলটি ম্যাচ করে সঠিক উত্তর প্রদান করবে:
        </p>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="উদাঃ টিকটক অ্যাড রান করতে কি ওয়েবসাইট লাগবে?"
            value={testQuery}
            onChange={(e) => setTestQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunTest()}
            className="flex-1 bg-white border border-[#D9DED1] px-4 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327] placeholder:text-[#8A957F]"
          />
          <button
            onClick={handleRunTest}
            className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shrink-0"
          >
            <span>যাচাই করুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {testResult && (
          <div className="bg-white p-4 rounded-2xl border border-emerald-300 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>ম্যাচিং আর্টিকেল পাওয়া গেছে: <strong>{testResult.title}</strong> (ক্যাটাগরি: {testResult.category})</span>
            </div>
            <div className="text-xs text-[#2C3327] bg-[#FDFCF8] p-3 rounded-xl border border-[#D9DED1] leading-relaxed">
              <strong>এআই আউটপুট:</strong> {testResult.answer}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8A957F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="নলেজ বেস সার্চ করুন (প্রশ্ন, উত্তর বা কীওয়ার্ড)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-[#D9DED1] pl-10 pr-4 py-2.5 rounded-2xl text-xs font-semibold text-[#2C3327] placeholder:text-[#8A957F]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#4A5D3B] text-white'
                : 'bg-white border border-[#D9DED1] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            সব ({items.length})
          </button>
          {categories.map((cat) => {
            const count = items.filter(i => i.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#4A5D3B] text-white'
                    : 'bg-white border border-[#D9DED1] text-[#5C6652] hover:bg-[#E8EAE2]'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Knowledge Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            id={`kb-item-${item.id}`}
            className="bg-white p-5 rounded-3xl border border-[#D9DED1] space-y-3.5 shadow-2xs flex flex-col justify-between transition-all"
          >
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-[#E8EAE2] text-[#4A5D3B] text-[10px] font-bold">
                    {item.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                    item.status === 'published' 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-stone-100 text-stone-600'
                  }`}>
                    {item.status === 'published' ? 'লাইভ' : 'ড্রাফট'}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingItem(item);
                      setKeywordInput(item.keywords.join(', '));
                      setIsCreating(false);
                    }}
                    className="p-1.5 text-[#5C6652] hover:text-[#2C3327] hover:bg-[#E8EAE2] rounded-lg transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-serif font-bold text-sm text-[#2C3327] leading-snug">
                {item.question}
              </h3>

              <p className="text-xs text-[#5C6652] leading-relaxed line-clamp-4">
                {item.answer}
              </p>
            </div>

            <div className="pt-3 border-t border-[#D9DED1]/60 flex flex-wrap items-center gap-1.5">
              <Tag className="w-3 h-3 text-[#8A957F]" />
              {item.keywords.map((kw, i) => (
                <span key={i} className="text-[10px] bg-[#F5F1EB] text-[#5C6652] px-2 py-0.5 rounded-md font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* --- EDIT / CREATE MODAL --- */}
      {(editingItem || isCreating) && editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FDFCF8] w-full max-w-2xl rounded-3xl border border-[#D9DED1] p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#D9DED1] pb-4">
              <h2 className="font-serif font-bold text-xl text-[#2C3327]">
                {isCreating ? 'নতুন নলেজ আর্টিকেল যোগ করুন' : 'নলেজ আর্টিকেল এডিট করুন'}
              </h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setIsCreating(false);
                }}
                className="p-2 text-[#8A957F] hover:text-[#2C3327] rounded-xl hover:bg-[#E8EAE2] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const keywords = keywordInput.split(',').map(k => k.trim()).filter(Boolean);
                handleSave({ ...editingItem, keywords });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">আর্টিকেল শিরোনাম / রেফারেন্স</label>
                  <input
                    type="text"
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ক্যাটাগরি</label>
                  <select
                    value={editingItem.category}
                    onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">গ্রাহকের সম্ভাব্য প্রশ্ন (Question)</label>
                <input
                  type="text"
                  value={editingItem.question}
                  onChange={(e) => setEditingItem({ ...editingItem, question: e.target.value })}
                  className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">অনুমোদিত উত্তর (Grounded Answer)</label>
                <textarea
                  rows={5}
                  value={editingItem.answer}
                  onChange={(e) => setEditingItem({ ...editingItem, answer: e.target.value })}
                  className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327] leading-relaxed"
                  placeholder="এআই চ্যাটবট এই উত্তরটি গ্রাহকের কাছে উপস্থাপন করবে..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">ট্রিগার কী-ওয়ার্ডস (কমা দিয়ে আলাদা করুন)</label>
                <input
                  type="text"
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="টিকটক, খরচ, পিক্সেল, ROAS, বাজেট"
                  className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">স্ট্যাটাস</label>
                  <select
                    value={editingItem.status}
                    onChange={(e) => setEditingItem({ ...editingItem, status: e.target.value as any })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  >
                    <option value="published">Published (লাইভ এআই গ্রাউন্ডিং)</option>
                    <option value="draft">Draft (অপ্রকাশিত)</option>
                    <option value="disabled">Disabled (নিষ্ক্রিয়)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">অগ্রাধিকার (Priority 1-10)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={editingItem.priority}
                    onChange={(e) => setEditingItem({ ...editingItem, priority: Number(e.target.value) })}
                    className="w-full bg-white border border-[#D9DED1] px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#2C3327]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#D9DED1]">
                <button
                  type="button"
                  onClick={() => {
                    setEditingItem(null);
                    setIsCreating(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#5C6652] hover:bg-[#E8EAE2] transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="bg-[#4A5D3B] hover:bg-[#3D4D30] text-white px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>আর্টিকেল সেভ করুন</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
