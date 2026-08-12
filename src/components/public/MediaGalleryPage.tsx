import React, { useState, useEffect, useMemo } from 'react';
import { MediaItem, SiteSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { VideoEmbedPlayer } from '../common/VideoEmbedPlayer';
import { 
  ArrowLeft, 
  Image as ImageIcon, 
  Youtube, 
  Video, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  ExternalLink, 
  Maximize2, 
  Play, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  MessageCircle,
  PhoneCall,
  Eye,
  CheckCircle2,
  RefreshCw,
  FolderOpen
} from 'lucide-react';

interface MediaGalleryPageProps {
  onBackToHome: () => void;
  onOpenLeadForm?: (context?: string) => void;
  onNavigateToPage?: (slug: string) => void;
}

export const MediaGalleryPage: React.FC<MediaGalleryPageProps> = ({
  onBackToHome,
  onOpenLeadForm,
  onNavigateToPage
}) => {
  const { language } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => storageService.getMedia(false));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => storageService.getSiteSettings());
  
  // Filtering & View state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedPlacement, setSelectedPlacement] = useState<string>('ALL');
  const [activeMobileColumn, setActiveMobileColumn] = useState<'ALL' | 'IMAGES' | 'YOUTUBE' | 'TIKTOK'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modals
  const [activeImageLightbox, setActiveImageLightbox] = useState<MediaItem | null>(null);
  const [activeVideoModal, setActiveVideoModal] = useState<MediaItem | null>(null);

  // Real-time synchronization
  const refreshMedia = () => {
    setMediaList(storageService.getMedia(false));
    setSiteSettings(storageService.getSiteSettings());
  };

  useEffect(() => {
    refreshMedia();
    const unsubscribe = storageService.subscribe(refreshMedia);
    return () => unsubscribe();
  }, []);

  const handleCopyLink = (url: string, id: string) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenWhatsApp = () => {
    const phone = (siteSettings?.whatsapp?.number || siteSettings?.whatsappNumber || '+8801815124970').replace(/[^0-9+]/g, '');
    const msg = encodeURIComponent(`Hello Sonjoy, I visited your Media Gallery and would like to discuss video ads & creative strategy for my brand.`);
    window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
  };

  // Filtered lists for each column
  const filteredItems = useMemo(() => {
    return mediaList.filter((item) => {
      // Must be enabled
      if (item.isEnabled === false) return false;

      // Placement filter
      if (selectedPlacement !== 'ALL') {
        if ((item.placement || 'general') !== selectedPlacement) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = (item.title || '').toLowerCase().includes(q);
        const matchesDesc = (item.description || '').toLowerCase().includes(q);
        const matchesAlt = (item.altText || '').toLowerCase().includes(q);
        const matchesPlacement = (item.placement || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesAlt && !matchesPlacement) {
          return false;
        }
      }

      return true;
    });
  }, [mediaList, selectedPlacement, searchQuery]);

  // Column 1: Images
  const imageItems = useMemo(() => {
    return filteredItems.filter(item => item.type === 'image' || (item.url && !item.type));
  }, [filteredItems]);

  // Column 2: YouTube Videos
  const youtubeItems = useMemo(() => {
    return filteredItems.filter(item => {
      if (item.type === 'youtube') return true;
      if (item.type === 'video_embed' && (item.videoUrl?.includes('youtube') || item.embedCode?.includes('youtube'))) return true;
      return false;
    });
  }, [filteredItems]);

  // Column 3: TikTok Videos
  const tiktokItems = useMemo(() => {
    return filteredItems.filter(item => {
      if (item.type === 'tiktok') return true;
      if (item.type === 'video_embed' && (item.videoUrl?.includes('tiktok') || item.embedCode?.includes('tiktok'))) return true;
      return false;
    });
  }, [filteredItems]);

  // General other video embeds if any
  const otherVideoItems = useMemo(() => {
    return filteredItems.filter(item => {
      if (item.type === 'video_embed' && 
          !item.videoUrl?.includes('youtube') && 
          !item.embedCode?.includes('youtube') && 
          !item.videoUrl?.includes('tiktok') && 
          !item.embedCode?.includes('tiktok')) {
        return true;
      }
      return false;
    });
  }, [filteredItems]);

  return (
    <div id="media-gallery-page-container" className="min-h-screen bg-[var(--theme-bg,#FDFCF8)] text-[var(--theme-text,#2C3327)] py-6 sm:py-10 animate-fadeIn">
      
      {/* Top Header & Breadcrumb Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[var(--theme-border,#D9DED1)]">
          <button
            id="back-to-home-from-gallery"
            onClick={onBackToHome}
            className="flex items-center gap-2 text-xs font-bold text-[#4A5D3B] hover:text-[#2C3327] transition-colors py-2 px-3.5 rounded-xl hover:bg-[var(--theme-section-bg,#F5F1EB)]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'en' ? 'Back to Home' : 'মূল পেজে ফিরে যান'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              id="gallery-whatsapp-cta"
              onClick={handleOpenWhatsApp}
              className="px-4 py-2 rounded-full bg-[#25D366] text-white text-xs font-bold hover:bg-[#1EBE5D] transition-all flex items-center gap-1.5 shadow-xs"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'WhatsApp Chat' : 'হোয়াটসঅ্যাপে যোগাযোগ'}</span>
            </button>
            <button
              id="gallery-book-audit-cta"
              onClick={() => onOpenLeadForm?.('Media Gallery Consultation')}
              className="px-5 py-2 rounded-full bg-[var(--theme-btn-bg,#4A5D3B)] text-[var(--theme-btn-text,#FFFFFF)] text-xs font-bold hover:bg-[var(--theme-btn-hover,#3A4533)] transition-all shadow-xs flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Book Creative Strategy' : 'ক্রিয়েটিভ স্ট্র্যাটেজি বুক করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Page Hero Title & Highlights */}
        <div className="space-y-4 max-w-4xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-badge-bg,#E8EAE2)] text-[var(--theme-badge-text,#4A5D3B)] text-xs font-bold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-[#4A5D3B]" />
              {language === 'en' ? 'Official Media Hub & Creative Vault' : 'অফিসিয়াল মিডিয়া গ্যালারি ও ভিডিও হাব'}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {language === 'en' ? `${mediaList.length} Verified Media Items` : `${mediaList.length}টি লাইভ মিডিয়া কনটেন্ট`}
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-[var(--theme-heading,#2C3327)] tracking-tight leading-tight">
            {language === 'en' 
              ? 'Multi-Format Media Gallery & Video Hub' 
              : 'মিডিয়া গ্যালারি ও ভিডিও হাব (ইমেজ, ইউটিউব ও টিকটক)'}
          </h1>

          <p className="text-sm sm:text-base text-[var(--theme-text,#2C3327)]/80 leading-relaxed max-w-3xl">
            {language === 'en'
              ? 'Explore our 3-column media collection: verified campaign analytics screenshots, full YouTube advertising masterclasses, and high-converting TikTok UGC short video breakdowns.'
              : 'এখানে ৩টি পৃথক কলামে আমাদের সকল মিডিয়া কনটেন্ট সাজানো রয়েছে: ক্যাম্পেইন অ্যানালিটিক্স ও রেজাল্ট প্রুফ ইমেজ, ইউটিউব স্ট্র্যাটেজি মাস্টারক্লাস এবং টিকটক শর্ট ভিডিও কেস স্টাডি।'}
          </p>
        </div>

        {/* Global Stats Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-[#4A5D3B]/10 flex items-center justify-center text-[#4A5D3B]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[var(--theme-heading,#2C3327)]">{filteredItems.length}</div>
              <div className="text-[11px] font-medium text-[var(--theme-text,#2C3327)]/70">{language === 'en' ? 'Total Media' : 'মোট মিডিয়া'}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[var(--theme-heading,#2C3327)]">{imageItems.length}</div>
              <div className="text-[11px] font-medium text-[var(--theme-text,#2C3327)]/70">{language === 'en' ? 'Images & Proofs' : 'ইমেজ ও প্রুফ'}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-600">
              <Youtube className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[var(--theme-heading,#2C3327)]">{youtubeItems.length}</div>
              <div className="text-[11px] font-medium text-[var(--theme-text,#2C3327)]/70">{language === 'en' ? 'YouTube Videos' : 'ইউটিউব ভিডিও'}</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] flex items-center gap-3 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-600">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xl font-black text-[var(--theme-heading,#2C3327)]">{tiktokItems.length}</div>
              <div className="text-[11px] font-medium text-[var(--theme-text,#2C3327)]/70">{language === 'en' ? 'TikTok Videos' : 'টিকটক ভিডিও'}</div>
            </div>
          </div>
        </div>

        {/* Search, Placement Filter & Mobile Column Selector */}
        <div className="p-4 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] space-y-4 shadow-xs">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text,#2C3327)]/40" />
              <input
                id="media-gallery-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={language === 'en' ? 'Search images, YouTube masterclasses, TikToks...' : 'ইমেজ, ইউটিউব ও টিকটক ভিডিও খুঁজুন...'}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--theme-section-bg,#F5F1EB)]/60 border border-[var(--theme-border,#D9DED1)] focus:outline-hidden focus:border-[#4A5D3B]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--theme-text,#2C3327)]/50 hover:text-[var(--theme-text,#2C3327)]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Placement Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <span className="text-xs font-semibold text-[var(--theme-text,#2C3327)]/60 flex items-center gap-1 whitespace-nowrap">
                <Filter className="w-3.5 h-3.5" />
                {language === 'en' ? 'Placement:' : 'প্লেসমেন্ট:'}
              </span>
              {[
                { id: 'ALL', label: language === 'en' ? 'All' : 'সকল' },
                { id: 'hero', label: 'Hero' },
                { id: 'tiktok_education', label: 'TikTok Playbook' },
                { id: 'case_studies', label: 'Case Studies' },
                { id: 'media_gallery', label: 'Gallery' },
                { id: 'general', label: 'General' }
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPlacement(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    selectedPlacement === p.id
                      ? 'bg-[var(--theme-btn-bg,#4A5D3B)] text-white shadow-xs'
                      : 'bg-[var(--theme-section-bg,#F5F1EB)] text-[var(--theme-text,#2C3327)] hover:bg-[var(--theme-border,#D9DED1)]/50'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Column View Switcher (Visible on mobile/tablet) */}
          <div className="flex items-center gap-2 lg:hidden pt-2 border-t border-[var(--theme-border,#D9DED1)]/60">
            <span className="text-xs font-semibold text-[var(--theme-text,#2C3327)]/60">{language === 'en' ? 'Column Focus:' : 'কলাম ভিউ:'}</span>
            <div className="grid grid-cols-4 gap-1.5 flex-1">
              {[
                { id: 'ALL', label: language === 'en' ? 'All 3 Columns' : 'সব কলাম' },
                { id: 'IMAGES', label: `Images (${imageItems.length})` },
                { id: 'YOUTUBE', label: `YouTube (${youtubeItems.length})` },
                { id: 'TIKTOK', label: `TikTok (${tiktokItems.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMobileColumn(tab.id as any)}
                  className={`px-2 py-1.5 rounded-lg text-[11px] font-bold text-center transition-all ${
                    activeMobileColumn === tab.id
                      ? 'bg-[#2C3327] text-white shadow-xs'
                      : 'bg-[var(--theme-section-bg,#F5F1EB)] text-[var(--theme-text,#2C3327)]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3-COLUMN MEDIA GALLERY CORE LAYOUT */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* ----------------------------------------------------------------------- */}
          {/* COLUMN 1 — IMAGES */}
          {/* ----------------------------------------------------------------------- */}
          <div 
            id="column-1-images" 
            className={`space-y-4 ${activeMobileColumn !== 'ALL' && activeMobileColumn !== 'IMAGES' ? 'hidden lg:block' : 'block'}`}
          >
            {/* Column Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-[var(--theme-heading,#2C3327)]">
                      {language === 'en' ? 'Column 1 — Images' : 'কলাম ১ — ইমেজ ও ব্যানার'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold">
                      {imageItems.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--theme-text,#2C3327)]/70">
                    {language === 'en' ? 'Visual proof, ad creatives & reports' : 'ক্যাম্পেইন প্রুফ ও হাই-রেজোলিউশন ছবি'}
                  </p>
                </div>
              </div>
            </div>

            {/* Images List */}
            {imageItems.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-dashed border-[var(--theme-border,#D9DED1)] text-center space-y-2">
                <FolderOpen className="w-8 h-8 text-[var(--theme-text,#2C3327)]/30 mx-auto" />
                <p className="text-xs font-medium text-[var(--theme-text,#2C3327)]/60">
                  {language === 'en' ? 'No images match the current filter.' : 'এই ফিল্টারে কোনো ইমেজ পাওয়া যায়নি।'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {imageItems.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    {/* Image Preview Container */}
                    <div 
                      className="relative aspect-16/10 bg-[var(--theme-section-bg,#F5F1EB)] overflow-hidden cursor-pointer"
                      onClick={() => setActiveImageLightbox(item)}
                    >
                      <img
                        src={item.url}
                        alt={item.altText || item.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImageLightbox(item);
                          }}
                          className="p-2.5 rounded-full bg-white text-black text-xs font-bold hover:scale-110 transition-transform shadow-md flex items-center gap-1.5"
                          title="Open Fullscreen Lightbox"
                        >
                          <Maximize2 className="w-4 h-4" />
                          <span>{language === 'en' ? 'Zoom' : 'বড় করে দেখুন'}</span>
                        </button>
                      </div>

                      {/* Placement Badge */}
                      {item.placement && (
                        <div className="absolute top-3 left-3">
                          <span className="px-2.5 py-1 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                            {item.placement}
                          </span>
                        </div>
                      )}

                      {/* Dimensions / Size Badge */}
                      {(item.dimensions || item.fileSize) && (
                        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                          {item.dimensions && (
                            <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-black text-[10px] font-mono font-medium">
                              {item.dimensions}
                            </span>
                          )}
                          {item.fileSize && (
                            <span className="px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-xs text-black text-[10px] font-mono font-medium">
                              {item.fileSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Image Details */}
                    <div className="p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-[var(--theme-heading,#2C3327)] leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-[var(--theme-text,#2C3327)]/75 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Card Action Footer */}
                      <div className="pt-2 border-t border-[var(--theme-border,#D9DED1)]/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[var(--theme-text,#2C3327)]/50 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {item.uploadedAt}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopyLink(item.url || '', item.id)}
                            className="p-1.5 rounded-lg text-[var(--theme-text,#2C3327)]/70 hover:bg-[var(--theme-section-bg,#F5F1EB)] hover:text-[var(--theme-text,#2C3327)] transition-colors flex items-center gap-1"
                            title="Copy Image URL"
                          >
                            {copiedId === item.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px] text-emerald-600 font-bold">{language === 'en' ? 'Copied' : 'কপি হয়েছে'}</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="text-[10px]">{language === 'en' ? 'Copy URL' : 'লিংক'}</span>
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setActiveImageLightbox(item)}
                            className="px-2.5 py-1 rounded-lg bg-[var(--theme-section-bg,#F5F1EB)] text-[var(--theme-text,#2C3327)] hover:bg-[#4A5D3B] hover:text-white transition-colors text-[11px] font-semibold flex items-center gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>{language === 'en' ? 'Preview' : 'দেখুন'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* COLUMN 2 — YOUTUBE VIDEOS */}
          {/* ----------------------------------------------------------------------- */}
          <div 
            id="column-2-youtube-videos" 
            className={`space-y-4 ${activeMobileColumn !== 'ALL' && activeMobileColumn !== 'YOUTUBE' ? 'hidden lg:block' : 'block'}`}
          >
            {/* Column Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-red-500/10 to-rose-500/10 border border-red-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-xs">
                  <Youtube className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-[var(--theme-heading,#2C3327)]">
                      {language === 'en' ? 'Column 2 — YouTube Videos' : 'কলাম ২ — ইউটিউব ভিডিও'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-800 text-xs font-bold">
                      {youtubeItems.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--theme-text,#2C3327)]/70">
                    {language === 'en' ? 'Masterclasses, strategies & walkthroughs' : 'স্ট্র্যাটেজি মাস্টারক্লাস ও টিউটোরিয়াল'}
                  </p>
                </div>
              </div>
            </div>

            {/* YouTube List */}
            {youtubeItems.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-dashed border-[var(--theme-border,#D9DED1)] text-center space-y-2">
                <Youtube className="w-8 h-8 text-[var(--theme-text,#2C3327)]/30 mx-auto" />
                <p className="text-xs font-medium text-[var(--theme-text,#2C3327)]/60">
                  {language === 'en' ? 'No YouTube videos match the current filter.' : 'এই ফিল্টারে কোনো ইউটিউব ভিডিও পাওয়া যায়নি।'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {youtubeItems.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    {/* Responsive 16:9 Video Embed or Player */}
                    <div className="relative aspect-video bg-black overflow-hidden">
                      {item.embedCode ? (
                        <div 
                          className="w-full h-full [&>iframe]:w-full [&>iframe]:h-full"
                          dangerouslySetInnerHTML={{ __html: item.embedCode }}
                        />
                      ) : item.videoUrl ? (
                        <VideoEmbedPlayer
                          url={item.videoUrl}
                          title={item.title}
                          className="w-full h-full"
                        />
                      ) : (
                        <div 
                          className="w-full h-full relative cursor-pointer group"
                          onClick={() => setActiveVideoModal(item)}
                        >
                          <img
                            src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 ml-0.5 fill-white" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* YouTube Platform Badge */}
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-md bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Youtube className="w-3 h-3" />
                          YouTube
                        </span>
                      </div>
                    </div>

                    {/* Video Details */}
                    <div className="p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-[var(--theme-heading,#2C3327)] leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-[var(--theme-text,#2C3327)]/75 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* Video Footer Actions */}
                      <div className="pt-2 border-t border-[var(--theme-border,#D9DED1)]/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[var(--theme-text,#2C3327)]/50 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {item.uploadedAt}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.videoUrl && (
                            <a
                              href={item.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{language === 'en' ? 'Watch on YouTube' : 'ইউটিউবে দেখুন'}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ----------------------------------------------------------------------- */}
          {/* COLUMN 3 — TIKTOK VIDEOS */}
          {/* ----------------------------------------------------------------------- */}
          <div 
            id="column-3-tiktok-videos" 
            className={`space-y-4 ${activeMobileColumn !== 'ALL' && activeMobileColumn !== 'TIKTOK' ? 'hidden lg:block' : 'block'}`}
          >
            {/* Column Header */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-xs">
                  <Video className="w-5 h-5 text-pink-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-extrabold text-[var(--theme-heading,#2C3327)]">
                      {language === 'en' ? 'Column 3 — TikTok Videos' : 'কলাম ৩ — টিকটক ভিডিও'}
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-800 text-xs font-bold">
                      {tiktokItems.length}
                    </span>
                  </div>
                  <p className="text-[11px] text-[var(--theme-text,#2C3327)]/70">
                    {language === 'en' ? 'UGC hooks, viral creatives & Spark Ads' : 'UGC ক্রিয়েটিভ হুক ও স্পার্ক অ্যাডস কেস স্টাডি'}
                  </p>
                </div>
              </div>
            </div>

            {/* TikTok List */}
            {tiktokItems.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-dashed border-[var(--theme-border,#D9DED1)] text-center space-y-2">
                <Video className="w-8 h-8 text-[var(--theme-text,#2C3327)]/30 mx-auto" />
                <p className="text-xs font-medium text-[var(--theme-text,#2C3327)]/60">
                  {language === 'en' ? 'No TikTok videos match the current filter.' : 'এই ফিল্টারে কোনো টিকটক ভিডিও পাওয়া যায়নি।'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {tiktokItems.map((item) => (
                  <div
                    key={item.id}
                    className="group rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] overflow-hidden hover:shadow-md transition-all duration-300"
                  >
                    {/* Vertical 9:16 or Styled Player Container */}
                    <div className="relative aspect-4/5 bg-black overflow-hidden flex items-center justify-center">
                      {item.embedCode ? (
                        <div 
                          className="w-full h-full overflow-hidden flex items-center justify-center [&>blockquote]:m-0 [&>blockquote]:w-full"
                          dangerouslySetInnerHTML={{ __html: item.embedCode }}
                        />
                      ) : item.videoUrl ? (
                        <VideoEmbedPlayer
                          url={item.videoUrl}
                          title={item.title}
                          className="w-full h-full"
                        />
                      ) : (
                        <div 
                          className="w-full h-full relative cursor-pointer group"
                          onClick={() => setActiveVideoModal(item)}
                        >
                          <img
                            src={item.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80'}
                            alt={item.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-black/80 border border-pink-500 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                              <Play className="w-5 h-5 ml-0.5 text-pink-400 fill-pink-400" />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TikTok Platform Tag */}
                      <div className="absolute top-3 left-3 pointer-events-none">
                        <span className="px-2.5 py-1 rounded-md bg-black/80 border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
                          TikTok Video
                        </span>
                      </div>
                    </div>

                    {/* Video Details */}
                    <div className="p-4 space-y-2.5">
                      <h3 className="text-sm font-bold text-[var(--theme-heading,#2C3327)] leading-snug line-clamp-2">
                        {item.title}
                      </h3>

                      {item.description && (
                        <p className="text-xs text-[var(--theme-text,#2C3327)]/75 leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}

                      {/* TikTok Footer Actions */}
                      <div className="pt-2 border-t border-[var(--theme-border,#D9DED1)]/60 flex items-center justify-between text-xs">
                        <span className="text-[10px] text-[var(--theme-text,#2C3327)]/50 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          {item.uploadedAt}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.videoUrl && (
                            <a
                              href={item.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg text-pink-600 hover:bg-pink-50 transition-colors flex items-center gap-1 text-[11px] font-bold"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>{language === 'en' ? 'Open on TikTok' : 'টিকটকে দেখুন'}</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Other Embeds if any */}
        {otherVideoItems.length > 0 && (
          <div className="pt-8 border-t border-[var(--theme-border,#D9DED1)] space-y-4">
            <h3 className="text-lg font-bold text-[var(--theme-heading,#2C3327)]">
              {language === 'en' ? 'Additional Video Embeds' : 'অন্যান্য ভিডিও কনটেন্ট'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherVideoItems.map(item => (
                <div key={item.id} className="p-4 rounded-2xl bg-[var(--theme-card-bg,#FFFFFF)] border border-[var(--theme-border,#D9DED1)] space-y-3">
                  <div className="aspect-video bg-black rounded-xl overflow-hidden">
                    <VideoEmbedPlayer url={item.videoUrl} embedCode={item.embedCode} title={item.title} className="w-full h-full" />
                  </div>
                  <h4 className="font-bold text-sm text-[var(--theme-heading,#2C3327)]">{item.title}</h4>
                  {item.description && <p className="text-xs text-[var(--theme-text,#2C3327)]/75">{item.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA Conversion Card */}
        <div className="p-8 sm:p-10 rounded-3xl bg-[var(--theme-section-bg,#F5F1EB)] border border-[var(--theme-border,#D9DED1)] relative overflow-hidden">
          <div className="max-w-3xl space-y-4 relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-badge-bg,#E8EAE2)] text-[var(--theme-badge-text,#4A5D3B)] text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              {language === 'en' ? 'Scalable Ads Infrastructure' : 'উচ্চ-কনভার্সন ভিডিও ও ক্রিয়েটিভ প্রোডাকশন'}
            </div>

            <h3 className="text-xl sm:text-3xl font-extrabold text-[var(--theme-heading,#2C3327)]">
              {language === 'en'
                ? 'Ready to Deploy High-Converting TikTok & Meta Video Ads?'
                : 'আপনার ব্র্যান্ডের জন্য লাভজনক ভিডিও অ্যাডস ও ক্রিয়েটিভ বানাতে চান?'}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--theme-text,#2C3327)]/80 leading-relaxed">
              {language === 'en'
                ? 'Let Sonjoy Sarkar engineer high-velocity creative hooks, UGC scripts, and full-funnel media buying architecture tailored to Bangladeshi buyers.'
                : 'সঞ্জয় সরকারের সঙ্গে সরাসরি ১-অন-১ ফ্রি অডিট সেশনে আপনার বর্তমান অ্যাডস ক্রিয়েটিভ, ফানেল এবং স্কেলিং প্ল্যান রিভিউ করুন।'}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                id="gallery-bottom-book-audit"
                onClick={() => onOpenLeadForm?.('Media Gallery Bottom CTA')}
                className="px-6 py-3 rounded-full bg-[var(--theme-btn-bg,#4A5D3B)] text-[var(--theme-btn-text,#FFFFFF)] text-xs sm:text-sm font-bold hover:bg-[var(--theme-btn-hover,#3A4533)] transition-all shadow-md flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{language === 'en' ? 'Schedule Free Strategy Audit' : 'ফ্রি স্ট্র্যাটেজি অডিট বুক করুন'}</span>
              </button>

              <button
                id="gallery-bottom-whatsapp"
                onClick={handleOpenWhatsApp}
                className="px-5 py-3 rounded-full bg-[#25D366] text-white text-xs sm:text-sm font-bold hover:bg-[#1EBE5D] transition-all shadow-xs flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'en' ? 'Direct WhatsApp Chat' : 'সরাসরি হোয়াটসঅ্যাপ'}</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* FULLSCREEN IMAGE LIGHTBOX MODAL */}
      {/* ========================================================================= */}
      {activeImageLightbox && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveImageLightbox(null)}
        >
          <div 
            className="relative max-w-5xl w-full max-h-[90vh] bg-[var(--theme-card-bg,#FFFFFF)] rounded-2xl overflow-hidden flex flex-col shadow-2xl border border-white/20 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-[var(--theme-border,#D9DED1)] flex items-center justify-between bg-[var(--theme-section-bg,#F5F1EB)]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[var(--theme-heading,#2C3327)] line-clamp-1">
                    {activeImageLightbox.title}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-[var(--theme-text,#2C3327)]/60 font-mono">
                    <span>{activeImageLightbox.dimensions || 'High-Resolution'}</span>
                    <span>•</span>
                    <span>{activeImageLightbox.fileSize || 'Image Asset'}</span>
                    <span>•</span>
                    <span className="uppercase">{activeImageLightbox.placement || 'General'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopyLink(activeImageLightbox.url || '', activeImageLightbox.id)}
                  className="px-3 py-1.5 rounded-lg bg-white border border-[var(--theme-border,#D9DED1)] text-xs font-semibold hover:bg-gray-50 flex items-center gap-1.5"
                >
                  {copiedId === activeImageLightbox.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-600 font-bold">{language === 'en' ? 'Copied' : 'কপি হয়েছে'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>{language === 'en' ? 'Copy URL' : 'লিংক কপি'}</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setActiveImageLightbox(null)}
                  className="w-8 h-8 rounded-lg bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Image View */}
            <div className="flex-1 bg-black/95 flex items-center justify-center p-4 overflow-auto max-h-[70vh]">
              <img
                src={activeImageLightbox.url}
                alt={activeImageLightbox.altText || activeImageLightbox.title}
                referrerPolicy="no-referrer"
                className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
              />
            </div>

            {/* Modal Description Footer */}
            {activeImageLightbox.description && (
              <div className="p-4 bg-[var(--theme-card-bg,#FFFFFF)] border-t border-[var(--theme-border,#D9DED1)] text-xs text-[var(--theme-text,#2C3327)]/80">
                <p>{activeImageLightbox.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* POPUP VIDEO MODAL */}
      {/* ========================================================================= */}
      {activeVideoModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setActiveVideoModal(null)}
        >
          <div 
            className="relative max-w-4xl w-full bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20 animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between text-white">
              <h3 className="text-sm font-bold line-clamp-1">{activeVideoModal.title}</h3>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="w-8 h-8 rounded-lg bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="aspect-video bg-black">
              <VideoEmbedPlayer
                url={activeVideoModal.videoUrl}
                embedCode={activeVideoModal.embedCode}
                title={activeVideoModal.title}
                className="w-full h-full"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
