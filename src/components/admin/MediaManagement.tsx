import React, { useState, useEffect } from 'react';
import { 
  MediaItem, 
  SiteSettings 
} from '../../types';
import { storageService } from '../../services/storageService';
import { VideoEmbedPlayer } from '../common/VideoEmbedPlayer';
import { 
  Image as ImageIcon, 
  Video, 
  Youtube, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ExternalLink, 
  Play, 
  Upload, 
  Link as LinkIcon, 
  Code, 
  Eye, 
  Sparkles, 
  Filter, 
  Search, 
  Layers, 
  CheckCircle2, 
  X,
  AlertCircle,
  HelpCircle,
  FolderOpen
} from 'lucide-react';

interface MediaManagementProps {
  onNavigateToTab?: (tab: string) => void;
}

export const MediaManagement: React.FC<MediaManagementProps> = ({ onNavigateToTab }) => {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => storageService.getSiteSettings());
  const [activeTabFilter, setActiveTabFilter] = useState<'ALL' | 'IMAGE' | 'YOUTUBE' | 'TIKTOK' | 'VIDEO_EMBED'>('ALL');
  const [placementFilter, setPlacementFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);

  // Form State
  const [formType, setFormType] = useState<'image' | 'youtube' | 'tiktok' | 'video_embed'>('image');
  const [formInputMethod, setFormInputMethod] = useState<'URL' | 'UPLOAD' | 'EMBED_CODE'>('URL');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formUrl, setFormUrl] = useState<string>('');
  const [formVideoUrl, setFormVideoUrl] = useState<string>('');
  const [formEmbedCode, setFormEmbedCode] = useState<string>('');
  const [formThumbnailUrl, setFormThumbnailUrl] = useState<string>('');
  const [formAltText, setFormAltText] = useState<string>('');
  const [formPlacement, setFormPlacement] = useState<MediaItem['placement']>('general');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formIsEnabled, setFormIsEnabled] = useState<boolean>(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadMedia = () => {
    setMediaList(storageService.getMedia(true));
    setSiteSettings(storageService.getSiteSettings());
  };

  useEffect(() => {
    loadMedia();
    const unsubscribe = storageService.subscribe(loadMedia);
    return () => unsubscribe();
  }, []);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCopy = (text: string, id: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    showNotification('success', 'ক্লিপবোর্ডে কপি করা হয়েছে!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAddModal = (type: 'image' | 'youtube' | 'tiktok' | 'video_embed' = 'image') => {
    setEditingItem(null);
    setFormType(type);
    setFormInputMethod(type === 'image' ? 'URL' : (type === 'video_embed' ? 'EMBED_CODE' : 'URL'));
    setFormTitle('');
    setFormUrl('');
    setFormVideoUrl('');
    setFormEmbedCode('');
    setFormThumbnailUrl('');
    setFormAltText('');
    setFormPlacement('general');
    setFormDescription('');
    setFormIsEnabled(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: MediaItem) => {
    setEditingItem(item);
    setFormType(item.type);
    if (item.embedCode && !item.videoUrl && !item.url) {
      setFormInputMethod('EMBED_CODE');
    } else if (item.url && item.url.startsWith('data:')) {
      setFormInputMethod('UPLOAD');
    } else {
      setFormInputMethod('URL');
    }
    setFormTitle(item.title || '');
    setFormUrl(item.url || '');
    setFormVideoUrl(item.videoUrl || '');
    setFormEmbedCode(item.embedCode || '');
    setFormThumbnailUrl(item.thumbnailUrl || '');
    setFormAltText(item.altText || '');
    setFormPlacement(item.placement || 'general');
    setFormDescription(item.description || '');
    setFormIsEnabled(item.isEnabled !== false);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showNotification('error', 'ফাইলের সাইজ ৫MB-এর কম হতে হবে।');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormUrl(dataUrl);
      if (!formTitle) {
        setFormTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      if (!formAltText) {
        setFormAltText(file.name.replace(/\.[^/.]+$/, ''));
      }
      showNotification('success', 'ছবি সফলভাবে লোড হয়েছে!');
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formTitle.trim()) {
      showNotification('error', 'অনুগ্রহ করে মিডিয়া টাইটেল লিখুন।');
      return;
    }

    // Auto extract embed info if URL provided
    let finalVideoUrl = formVideoUrl.trim();
    let finalUrl = formUrl.trim();
    let finalEmbed = formEmbedCode.trim();

    if (formType === 'image' && !finalUrl) {
      showNotification('error', 'অনুগ্রহ করে ইমেজ আপলোড করুন অথবা ইমেজ URL দিন।');
      return;
    }

    if ((formType === 'youtube' || formType === 'tiktok' || formType === 'video_embed') && !finalVideoUrl && !finalEmbed && !finalUrl) {
      showNotification('error', 'অনুগ্রহ করে ভিডিও URL অথবা এমবেড কোড দিন।');
      return;
    }

    const itemToSave: MediaItem = {
      id: editingItem ? editingItem.id : `media-${Date.now()}`,
      title: formTitle.trim(),
      type: formType,
      url: finalUrl || undefined,
      videoUrl: finalVideoUrl || (formType !== 'image' && finalUrl ? finalUrl : undefined),
      embedCode: finalEmbed || undefined,
      thumbnailUrl: formThumbnailUrl.trim() || undefined,
      altText: formAltText.trim() || formTitle.trim(),
      placement: formPlacement,
      isEnabled: formIsEnabled,
      description: formDescription.trim() || undefined,
      uploadedAt: editingItem ? editingItem.uploadedAt : new Date().toISOString()
    };

    storageService.saveMedia(itemToSave);

    // If placement is 'hero' or 'tiktok_education', sync with SiteSettings
    if (formPlacement === 'hero') {
      const updatedSettings = { ...siteSettings, heroVideoMediaId: itemToSave.id };
      storageService.updateSiteSettings(updatedSettings);
    } else if (formPlacement === 'tiktok_education') {
      const updatedSettings = { ...siteSettings, tiktokEducationVideoMediaId: itemToSave.id };
      storageService.updateSiteSettings(updatedSettings);
    }

    setIsModalOpen(false);
    showNotification('success', editingItem ? 'মিডিয়া আপডেট হয়েছে!' : 'নতুন মিডিয়া সফলভাবে যুক্ত হয়েছে!');
  };

  const handleDelete = (id: string, title: string) => {
    if (window.confirm(`আপনি কি "${title}" মিডিয়া ফাইলটি মুছে ফেলতে চান?`)) {
      storageService.deleteMedia(id);
      showNotification('success', 'মিডিয়া ডিলিট করা হয়েছে।');
    }
  };

  const handleToggleStatus = (id: string) => {
    storageService.toggleMediaStatus(id);
  };

  const handleSetPrimaryPlacement = (item: MediaItem, targetPlacement: 'hero' | 'tiktok_education') => {
    const updatedItem = { ...item, placement: targetPlacement, isEnabled: true };
    storageService.saveMedia(updatedItem);

    if (targetPlacement === 'hero') {
      storageService.updateSiteSettings({ ...siteSettings, heroVideoMediaId: item.id });
      showNotification('success', `"${item.title}" হিরো সেকশনের প্রধান ভিডিও হিসেবে সেট হয়েছে!`);
    } else if (targetPlacement === 'tiktok_education') {
      storageService.updateSiteSettings({ ...siteSettings, tiktokEducationVideoMediaId: item.id });
      showNotification('success', `"${item.title}" টিকটক প্লেবুক সেকশনের প্রধান ভিডিও হিসেবে সেট হয়েছে!`);
    }
  };

  // Filter and Search logic
  const filteredList = mediaList.filter(item => {
    // Type filter
    if (activeTabFilter === 'IMAGE' && item.type !== 'image') return false;
    if (activeTabFilter === 'YOUTUBE' && item.type !== 'youtube') return false;
    if (activeTabFilter === 'TIKTOK' && item.type !== 'tiktok') return false;
    if (activeTabFilter === 'VIDEO_EMBED' && item.type !== 'video_embed') return false;

    // Placement filter
    if (placementFilter !== 'ALL' && item.placement !== placementFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title?.toLowerCase().includes(q);
      const matchAlt = item.altText?.toLowerCase().includes(q);
      const matchDesc = item.description?.toLowerCase().includes(q);
      const matchUrl = (item.url || item.videoUrl || '')?.toLowerCase().includes(q);
      return matchTitle || matchAlt || matchDesc || matchUrl;
    }

    return true;
  });

  const totalImages = mediaList.filter(m => m.type === 'image').length;
  const totalVideos = mediaList.filter(m => m.type === 'youtube' || m.type === 'tiktok' || m.type === 'video_embed').length;
  const totalActive = mediaList.filter(m => m.isEnabled !== false).length;

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Stats */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#D9DED1]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8EAE2] text-[#4A5D3B] text-xs font-semibold mb-2">
              <FolderOpen className="w-3.5 h-3.5" />
              <span>সেন্ট্রাল মিডিয়া ও এমবেড হাব</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3327]">
              ইমেজ, ইউটিউব ও টিকটক মিডিয়া লাইব্রেরি
            </h2>
            <p className="text-xs sm:text-sm text-[#5C6652] mt-1 max-w-2xl">
              সরাসরি ইমেজ আপলোড, এক্সটারনাল ইমেজ URL, ইউটিউব লিঙ্ক/এমবেড, টিকটক ভিডিও এবং কাস্টম ভিডিও এমবেড যুক্ত ও পরিচালনা করুন। প্রোফাইল, কেস স্টাডি ও কাস্টম পেজে সরাসরি ব্যবহার করুন।
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => handleOpenAddModal('image')}
              className="px-4 py-2.5 bg-[#4A5D3B] text-[#FDFCF8] rounded-xl text-xs font-semibold hover:bg-[#3A4533] transition-all flex items-center gap-2 shadow-xs"
            >
              <ImageIcon className="w-4 h-4" />
              <span>+ ইমেজ যোগ করুন</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('youtube')}
              className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-all flex items-center gap-2 shadow-xs"
            >
              <Youtube className="w-4 h-4" />
              <span>+ YouTube ভিডিও</span>
            </button>
            <button
              onClick={() => handleOpenAddModal('tiktok')}
              className="px-4 py-2.5 bg-black text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 transition-all flex items-center gap-2 shadow-xs"
            >
              <Video className="w-4 h-4" />
              <span>+ TikTok ভিডিও</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
          <div className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#D9DED1]">
            <span className="text-[11px] text-[#5C6652] font-medium block">মোট মিডিয়া ফাইল</span>
            <span className="font-serif text-2xl font-bold text-[#2C3327]">{mediaList.length} টি</span>
          </div>
          <div className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#D9DED1]">
            <span className="text-[11px] text-[#5C6652] font-medium block">ইমেজ ফাইল/URL</span>
            <span className="font-serif text-2xl font-bold text-[#4A5D3B]">{totalImages} টি</span>
          </div>
          <div className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#D9DED1]">
            <span className="text-[11px] text-[#5C6652] font-medium block">ভিডিও ও এমবেড</span>
            <span className="font-serif text-2xl font-bold text-red-600">{totalVideos} টি</span>
          </div>
          <div className="bg-[#FDFCF8] p-4 rounded-2xl border border-[#D9DED1]">
            <span className="text-[11px] text-[#5C6652] font-medium block">লাইভ সক্রিয়</span>
            <span className="font-serif text-2xl font-bold text-emerald-600">{totalActive} টি</span>
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all animate-fadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* Filter & Search Toolbar */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9DED1] flex flex-col md:flex-row items-center justify-between gap-4 shadow-2xs">
        
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
          <button
            onClick={() => setActiveTabFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTabFilter === 'ALL'
                ? 'bg-[#4A5D3B] text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            সব মিডিয়া ({mediaList.length})
          </button>
          <button
            onClick={() => setActiveTabFilter('IMAGE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTabFilter === 'IMAGE'
                ? 'bg-[#4A5D3B] text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>ইমেজ ({totalImages})</span>
          </button>
          <button
            onClick={() => setActiveTabFilter('YOUTUBE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTabFilter === 'YOUTUBE'
                ? 'bg-red-600 text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            <span>YouTube ({mediaList.filter(m => m.type === 'youtube').length})</span>
          </button>
          <button
            onClick={() => setActiveTabFilter('TIKTOK')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTabFilter === 'TIKTOK'
                ? 'bg-black text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>TikTok ({mediaList.filter(m => m.type === 'tiktok').length})</span>
          </button>
          <button
            onClick={() => setActiveTabFilter('VIDEO_EMBED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTabFilter === 'VIDEO_EMBED'
                ? 'bg-[#4A5D3B] text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>কাস্টম এমবেড</span>
          </button>
        </div>

        {/* Placement Filter & Search */}
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <select
            value={placementFilter}
            onChange={(e) => setPlacementFilter(e.target.value)}
            className="bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327] outline-none"
          >
            <option value="ALL">সকল প্লেসমেন্ট</option>
            <option value="hero">হিরো সেকশন (Hero)</option>
            <option value="tiktok_education">টিকটক গাইড (TikTok Playbook)</option>
            <option value="case_studies">কেস স্টাডিজ (Case Studies)</option>
            <option value="media_gallery">মিডিয়া গ্যালারি</option>
            <option value="general">সাধারণ (General)</option>
          </select>

          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A957F]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মিডিয়া খুঁজুন..."
              className="w-full bg-[#FDFCF8] border border-[#D9DED1] pl-8 pr-3 py-2 rounded-xl text-xs text-[#2C3327] outline-none focus:border-[#4A5D3B]"
            />
          </div>
        </div>

      </div>

      {/* Media Grid */}
      {filteredList.length === 0 ? (
        <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#F5F1EB] text-[#8A957F] flex items-center justify-center mx-auto">
            <FolderOpen className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#2C3327]">কোনো মিডিয়া ফাইল পাওয়া যায়নি</h3>
          <p className="text-xs text-[#5C6652] max-w-sm mx-auto">
            আপনার ফিল্টার অনুযায়ী কোনো মিডিয়া পাওয়া যায়নি। নতুন ইমেজ বা ভিডিও লিঙ্ক যোগ করতে উপরের বাটনে ক্লিক করুন।
          </p>
          <button
            onClick={() => handleOpenAddModal('image')}
            className="px-5 py-2.5 bg-[#4A5D3B] text-white rounded-xl text-xs font-semibold hover:bg-[#3A4533] transition-all"
          >
            + নতুন মিডিয়া যোগ করুন
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredList.map((item) => {
            const isHeroVideo = siteSettings.heroVideoMediaId === item.id || item.placement === 'hero';
            const isTikTokEdu = siteSettings.tiktokEducationVideoMediaId === item.id || item.placement === 'tiktok_education';

            return (
              <div
                key={item.id}
                className={`bg-[#FFFFFF] rounded-3xl border overflow-hidden transition-all shadow-2xs flex flex-col justify-between ${
                  item.isEnabled !== false ? 'border-[#D9DED1]' : 'border-dashed border-[#D9DED1] opacity-70 bg-[#FDFCF8]'
                }`}
              >
                
                {/* Media Preview Box */}
                <div className="relative bg-[#1E251B] aspect-video w-full overflow-hidden group">
                  {item.type === 'image' ? (
                    <img
                      src={item.url || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'}
                      alt={item.altText || item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoEmbedPlayer
                        url={item.videoUrl || item.url}
                        embedCode={item.embedCode}
                        title={item.title}
                        thumbnailUrl={item.thumbnailUrl}
                        aspectRatio="auto"
                        className="w-full h-full"
                      />
                    </div>
                  )}

                  {/* Type Badge */}
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                    {item.type === 'image' && (
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[10px] font-bold backdrop-blur-xs flex items-center gap-1">
                        <ImageIcon className="w-3 h-3 text-emerald-400" />
                        <span>IMAGE</span>
                      </span>
                    )}
                    {item.type === 'youtube' && (
                      <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Youtube className="w-3 h-3" />
                        <span>YOUTUBE</span>
                      </span>
                    )}
                    {item.type === 'tiktok' && (
                      <span className="px-2.5 py-1 rounded-lg bg-black text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Video className="w-3 h-3 text-cyan-400" />
                        <span>TIKTOK</span>
                      </span>
                    )}
                    {item.type === 'video_embed' && (
                      <span className="px-2.5 py-1 rounded-lg bg-[#4A5D3B] text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                        <Code className="w-3 h-3" />
                        <span>EMBED</span>
                      </span>
                    )}

                    {isHeroVideo && (
                      <span className="px-2 py-0.5 rounded-lg bg-amber-500 text-white text-[10px] font-bold shadow-xs">
                        HERO
                      </span>
                    )}
                    {isTikTokEdu && (
                      <span className="px-2 py-0.5 rounded-lg bg-cyan-600 text-white text-[10px] font-bold shadow-xs">
                        PLAYBOOK
                      </span>
                    )}
                  </div>

                  {/* Toggle Status switch */}
                  <button
                    onClick={() => handleToggleStatus(item.id)}
                    className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[10px] font-medium backdrop-blur-xs transition-colors"
                    title={item.isEnabled !== false ? 'ডিজেবল করুন' : 'এনাবল করুন'}
                  >
                    {item.isEnabled !== false ? (
                      <span className="text-emerald-400 font-bold">● Live</span>
                    ) : (
                      <span className="text-neutral-400">○ Hidden</span>
                    )}
                  </button>
                </div>

                {/* Media Details */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-serif font-bold text-sm text-[#2C3327] line-clamp-1">
                        {item.title}
                      </h4>
                      <span className="text-[10px] uppercase font-bold text-[#8A957F] bg-[#F5F1EB] px-2 py-0.5 rounded-md shrink-0">
                        {item.placement || 'general'}
                      </span>
                    </div>

                    {item.description && (
                      <p className="text-xs text-[#5C6652] line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {/* Media Resource URL or ID preview */}
                    <div className="bg-[#FDFCF8] p-2 rounded-xl border border-[#D9DED1] flex items-center justify-between text-[11px] text-[#5C6652] font-mono">
                      <span className="truncate pr-2 max-w-[200px]">
                        {item.url || item.videoUrl || (item.embedCode ? '<iframe embed>' : item.id)}
                      </span>
                      <button
                        onClick={() => handleCopy(item.url || item.videoUrl || item.embedCode || item.id, item.id)}
                        className="text-[#4A5D3B] hover:text-[#3A4533] p-1 rounded-md hover:bg-[#E8EAE2] transition-colors shrink-0"
                        title="URL বা এমবেড কপি করুন"
                      >
                        {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-3 border-t border-[#D9DED1] flex items-center justify-between gap-2">
                    {/* Fast Placement Assign */}
                    {(item.type === 'youtube' || item.type === 'tiktok' || item.type === 'video_embed') && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleSetPrimaryPlacement(item, 'hero')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            isHeroVideo 
                              ? 'bg-amber-100 text-amber-900 border border-amber-300' 
                              : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
                          }`}
                          title="হিরো সেকশনে প্রধান ভিডিও হিসেবে দেখান"
                        >
                          Hero ভিডিও
                        </button>
                        <button
                          onClick={() => handleSetPrimaryPlacement(item, 'tiktok_education')}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-colors ${
                            isTikTokEdu 
                              ? 'bg-cyan-100 text-cyan-900 border border-cyan-300' 
                              : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
                          }`}
                          title="টিকটক প্লেবুকে প্রধান ভিডিও হিসেবে দেখান"
                        >
                          Playbook ভিডিও
                        </button>
                      </div>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                      <button
                        onClick={() => handleOpenEditModal(item)}
                        className="p-2 text-[#5C6652] hover:text-[#4A5D3B] hover:bg-[#F5F1EB] rounded-xl transition-colors"
                        title="এডিট করুন"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="p-2 text-[#8A957F] hover:text-[#E2725B] hover:bg-rose-50 rounded-xl transition-colors"
                        title="ডিলিট করুন"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Media Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#D9DED1]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center">
                  {formType === 'image' ? <ImageIcon className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C3327]">
                    {editingItem ? 'মিডিয়া সম্পাদনা করুন' : 'নতুন মিডিয়া বা ভিডিও এমবেড যুক্ত করুন'}
                  </h3>
                  <p className="text-xs text-[#5C6652]">
                    ইমেজ URL, সরাসরি আপলোড, YouTube/TikTok লিঙ্ক বা এমবেড কোড প্রবেশ করান
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-[#8A957F] hover:text-[#2C3327] rounded-xl hover:bg-[#F5F1EB] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSave} className="space-y-5">
              
              {/* Media Type Selector */}
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-2">
                  মিডিয়া টাইপ নির্বাচন করুন
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => { setFormType('image'); setFormInputMethod('URL'); }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      formType === 'image'
                        ? 'border-[#4A5D3B] bg-[#E8EAE2] text-[#4A5D3B] shadow-2xs'
                        : 'border-[#D9DED1] hover:bg-[#FDFCF8] text-[#5C6652]'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span>ইমেজ / ছবি</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('youtube'); setFormInputMethod('URL'); }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      formType === 'youtube'
                        ? 'border-red-500 bg-red-50 text-red-700 shadow-2xs'
                        : 'border-[#D9DED1] hover:bg-[#FDFCF8] text-[#5C6652]'
                    }`}
                  >
                    <Youtube className="w-4 h-4 text-red-600" />
                    <span>YouTube ভিডিও</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('tiktok'); setFormInputMethod('URL'); }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      formType === 'tiktok'
                        ? 'border-black bg-neutral-100 text-black shadow-2xs'
                        : 'border-[#D9DED1] hover:bg-[#FDFCF8] text-[#5C6652]'
                    }`}
                  >
                    <Video className="w-4 h-4 text-black" />
                    <span>TikTok ভিডিও</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setFormType('video_embed'); setFormInputMethod('EMBED_CODE'); }}
                    className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                      formType === 'video_embed'
                        ? 'border-[#4A5D3B] bg-[#E8EAE2] text-[#4A5D3B] shadow-2xs'
                        : 'border-[#D9DED1] hover:bg-[#FDFCF8] text-[#5C6652]'
                    }`}
                  >
                    <Code className="w-4 h-4" />
                    <span>কাস্টম এমবেড / MP4</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                  মিডিয়া টাইটেল / নাম *
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="e.g. TikTok Ads Strategy Breakdown / Fashion E-commerce Proof"
                  required
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                />
              </div>

              {/* Input Method (Upload vs URL vs Embed) */}
              {formType === 'image' ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormInputMethod('URL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        formInputMethod === 'URL' ? 'bg-[#4A5D3B] text-white' : 'bg-[#F5F1EB] text-[#5C6652]'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>ইমেজ URL লিঙ্ক</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormInputMethod('UPLOAD')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        formInputMethod === 'UPLOAD' ? 'bg-[#4A5D3B] text-white' : 'bg-[#F5F1EB] text-[#5C6652]'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ডিভাইস থেকে আপলোড</span>
                    </button>
                  </div>

                  {formInputMethod === 'URL' ? (
                    <div>
                      <input
                        type="url"
                        value={formUrl}
                        onChange={(e) => setFormUrl(e.target.value)}
                        placeholder="https://images.unsplash.com/... or https://your-cdn.com/image.jpg"
                        className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#D9DED1] rounded-2xl p-6 text-center bg-[#FDFCF8] hover:bg-[#F5F1EB] transition-colors">
                      <input
                        type="file"
                        id="media-file-input"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <label htmlFor="media-file-input" className="cursor-pointer space-y-2 block">
                        <Upload className="w-8 h-8 text-[#4A5D3B] mx-auto" />
                        <div className="text-xs font-bold text-[#2C3327]">ছবি সিলেক্ট করতে ক্লিক করুন</div>
                        <div className="text-[11px] text-[#5C6652]">JPG, PNG, WebP (Max 5MB)</div>
                      </label>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setFormInputMethod('URL')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        formInputMethod === 'URL' ? 'bg-[#4A5D3B] text-white' : 'bg-[#F5F1EB] text-[#5C6652]'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" />
                      <span>সরাসরি ভিডিও লিঙ্ক (URL)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormInputMethod('EMBED_CODE')}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
                        formInputMethod === 'EMBED_CODE' ? 'bg-[#4A5D3B] text-white' : 'bg-[#F5F1EB] text-[#5C6652]'
                      }`}
                    >
                      <Code className="w-3.5 h-3.5" />
                      <span>এমবেড কোড (iframe / blockquote)</span>
                    </button>
                  </div>

                  {formInputMethod === 'URL' ? (
                    <div>
                      <input
                        type="text"
                        value={formVideoUrl}
                        onChange={(e) => setFormVideoUrl(e.target.value)}
                        placeholder={
                          formType === 'youtube'
                            ? "https://www.youtube.com/watch?v=XXXX or https://youtu.be/XXXX"
                            : formType === 'tiktok'
                            ? "https://www.tiktok.com/@username/video/1234567890"
                            : "https://your-domain.com/video.mp4"
                        }
                        className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                      />
                    </div>
                  ) : (
                    <div>
                      <textarea
                        rows={3}
                        value={formEmbedCode}
                        onChange={(e) => setFormEmbedCode(e.target.value)}
                        placeholder='<iframe width="560" height="315" src="https://www.youtube.com/embed/..." frameborder="0" allowfullscreen></iframe>'
                        className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs font-mono text-[#2C3327] outline-none"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Placement & Thumbnail */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                    ডিফল্ট প্লেসমেন্ট
                  </label>
                  <select
                    value={formPlacement}
                    onChange={(e) => setFormPlacement(e.target.value as any)}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                  >
                    <option value="general">সাধারণ (General)</option>
                    <option value="hero">হিরো সেকশন ভিডিও (Hero Section)</option>
                    <option value="tiktok_education">টিকটক প্লেবুক গাইড (TikTok Playbook)</option>
                    <option value="case_studies">কেস স্টাডি প্রমাণ (Case Studies)</option>
                    <option value="media_gallery">মিডিয়া গ্যালারি</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                    কাস্টম থাম্বনেইল URL (ঐচ্ছিক)
                  </label>
                  <input
                    type="url"
                    value={formThumbnailUrl}
                    onChange={(e) => setFormThumbnailUrl(e.target.value)}
                    placeholder="https://.../thumbnail.jpg"
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                  />
                </div>
              </div>

              {/* Alt Text & Description */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                    Alt Text (এসইও ও অ্যাক্সেসিবিলিটি)
                  </label>
                  <input
                    type="text"
                    value={formAltText}
                    onChange={(e) => setFormAltText(e.target.value)}
                    placeholder="e.g. Sonjoy Sarkar TikTok Ads Results"
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#2C3327] mb-1.5">
                    বিবরণ / নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="মিডিয়ার সংক্ষিপ্ত বিবরণ বা ক্যাম্পেইন নোট..."
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                  />
                </div>
              </div>

              {/* Live Preview Inside Modal */}
              {(formUrl || formVideoUrl || formEmbedCode) && (
                <div className="bg-[#F5F1EB] p-4 rounded-2xl border border-[#D9DED1] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A5D3B]">
                    <Eye className="w-3.5 h-3.5" />
                    <span>লাইভ প্রিভিউ:</span>
                  </div>
                  <div className="rounded-xl overflow-hidden bg-black max-w-md mx-auto aspect-video flex items-center justify-center">
                    {formType === 'image' ? (
                      <img src={formUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <VideoEmbedPlayer
                        url={formVideoUrl || formUrl}
                        embedCode={formEmbedCode}
                        title={formTitle || 'Preview'}
                        thumbnailUrl={formThumbnailUrl}
                        aspectRatio="auto"
                        className="w-full h-full"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#FDFCF8] rounded-xl border border-[#D9DED1]">
                <span className="text-xs font-bold text-[#2C3327]">পাবলিক ভিজিটরদের কাছে দৃশ্যমান রাখুন</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formIsEnabled}
                    onChange={(e) => setFormIsEnabled(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#4A5D3B]"></div>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D9DED1]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-[#D9DED1] text-xs font-semibold text-[#5C6652] hover:bg-[#F5F1EB] transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#4A5D3B] text-white text-xs font-semibold hover:bg-[#3A4533] transition-all shadow-xs"
                >
                  {editingItem ? 'আপডেট সম্পন্ন করুন' : 'সংরক্ষণ করুন'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
