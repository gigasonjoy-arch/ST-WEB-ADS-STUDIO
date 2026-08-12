import React, { useState, useEffect } from 'react';
import { MediaItem } from '../../types';
import { storageService } from '../../services/storageService';
import { useLanguage } from '../../context/LanguageContext';
import { VideoEmbedPlayer } from '../common/VideoEmbedPlayer';
import { 
  Sparkles, 
  ArrowRight, 
  Image as ImageIcon, 
  Youtube, 
  Video, 
  Play, 
  ExternalLink,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface FeaturedMediaPreviewProps {
  onNavigateToGallery: () => void;
}

export const FeaturedMediaPreview: React.FC<FeaturedMediaPreviewProps> = ({
  onNavigateToGallery
}) => {
  const { language } = useLanguage();
  const [mediaList, setMediaList] = useState<MediaItem[]>(() => storageService.getMedia(false));

  useEffect(() => {
    const refresh = () => setMediaList(storageService.getMedia(false));
    refresh();
    const unsubscribe = storageService.subscribe(refresh);
    return () => unsubscribe();
  }, []);

  const imagePreview = mediaList.find(m => m.type === 'image' && m.isEnabled !== false) || mediaList.find(m => m.type === 'image');
  const youtubePreview = mediaList.find(m => m.type === 'youtube' && m.isEnabled !== false) || mediaList.find(m => m.type === 'youtube');
  const tiktokPreview = mediaList.find(m => m.type === 'tiktok' && m.isEnabled !== false) || mediaList.find(m => m.type === 'tiktok');

  if (!imagePreview && !youtubePreview && !tiktokPreview) {
    return null;
  }

  return (
    <section id="featured-media-preview-section" className="py-12 sm:py-16 bg-[var(--theme-card-bg,#FFFFFF)] border-y border-[var(--theme-border,#D9DED1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--theme-badge-bg,#E8EAE2)] text-[var(--theme-badge-text,#4A5D3B)] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              {language === 'en' ? 'Live Proof & Media Showcase' : 'মিডিয়া গ্যালারি ও ভিডিও লাইব্রেরি'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[var(--theme-heading,#2C3327)] tracking-tight">
              {language === 'en' 
                ? 'High-Converting Ad Creatives & Video Vault' 
                : 'বাস্তব ক্যাম্পেইন ইমেজ, ইউটিউব মাস্টারক্লাস ও টিকটক ভিডিও'}
            </h2>
            <p className="text-xs sm:text-sm text-[var(--theme-text,#2C3327)]/75">
              {language === 'en'
                ? 'Browse our 3 distinct media formats: verified dashboard screenshots, YouTube strategy tutorials, and viral TikTok UGC breakdowns.'
                : 'আমাদের অফিসিয়াল ৩-কলাম মিডিয়া গ্যালারির একটি ঝলক: ক্যাম্পেইন প্রুফ, ইউটিউব গাইড ও টিকটক শর্ট ভিডিও।'}
            </p>
          </div>

          <button
            id="home-view-all-media-gallery-btn"
            onClick={onNavigateToGallery}
            className="self-start md:self-auto px-5 py-2.5 rounded-full bg-[var(--theme-btn-bg,#4A5D3B)] text-[var(--theme-btn-text,#FFFFFF)] text-xs font-bold hover:bg-[var(--theme-btn-hover,#3A4533)] transition-all shadow-xs flex items-center gap-2 group whitespace-nowrap"
          >
            <span>{language === 'en' ? 'Explore Full 3-Column Media Gallery' : 'পূর্ণাঙ্গ ৩-কলাম মিডিয়া গ্যালারি দেখুন'}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3 Featured Columns Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Image Preview */}
          {imagePreview && (
            <div 
              onClick={onNavigateToGallery}
              className="group cursor-pointer rounded-2xl bg-[var(--theme-section-bg,#F5F1EB)]/60 border border-[var(--theme-border,#D9DED1)] overflow-hidden hover:shadow-md hover:border-[#4A5D3B]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-blue-500/10 border-b border-blue-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    {language === 'en' ? 'Column 1 — Images' : 'কলাম ১ — ইমেজ'}
                  </span>
                  <span className="text-[10px] font-bold text-blue-600 uppercase">Screenshot Proof</span>
                </div>

                <div className="relative aspect-16/10 bg-black/5 overflow-hidden">
                  <img
                    src={imagePreview.url}
                    alt={imagePreview.altText || imagePreview.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <span className="px-3 py-1 rounded-full bg-white/90 text-black text-xs font-bold shadow-xs">
                      {language === 'en' ? 'View in Gallery' : 'গ্যালারিতে দেখুন'}
                    </span>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="text-sm font-bold text-[var(--theme-heading,#2C3327)] line-clamp-1">{imagePreview.title}</h3>
                  <p className="text-xs text-[var(--theme-text,#2C3327)]/70 line-clamp-2">{imagePreview.description || 'Verified campaign analytics dashboard'}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <span className="text-xs font-bold text-[#4A5D3B] flex items-center gap-1 group-hover:underline">
                  {language === 'en' ? 'Open Images Archive →' : 'সকল ইমেজ দেখুন →'}
                </span>
              </div>
            </div>
          )}

          {/* 2. YouTube Preview */}
          {youtubePreview && (
            <div 
              onClick={onNavigateToGallery}
              className="group cursor-pointer rounded-2xl bg-[var(--theme-section-bg,#F5F1EB)]/60 border border-[var(--theme-border,#D9DED1)] overflow-hidden hover:shadow-md hover:border-red-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-red-800 flex items-center gap-1.5">
                    <Youtube className="w-4 h-4 text-red-600" />
                    {language === 'en' ? 'Column 2 — YouTube' : 'কলাম ২ — ইউটিউব'}
                  </span>
                  <span className="text-[10px] font-bold text-red-600 uppercase">Masterclass</span>
                </div>

                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={youtubePreview.thumbnailUrl || 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80'}
                    alt={youtubePreview.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 ml-0.5 fill-white" />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="text-sm font-bold text-[var(--theme-heading,#2C3327)] line-clamp-1">{youtubePreview.title}</h3>
                  <p className="text-xs text-[var(--theme-text,#2C3327)]/70 line-clamp-2">{youtubePreview.description || 'Step-by-step advertising tutorial'}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <span className="text-xs font-bold text-red-600 flex items-center gap-1 group-hover:underline">
                  {language === 'en' ? 'Watch Full Masterclasses →' : 'সকল ইউটিউব ভিডিও দেখুন →'}
                </span>
              </div>
            </div>
          )}

          {/* 3. TikTok Preview */}
          {tiktokPreview && (
            <div 
              onClick={onNavigateToGallery}
              className="group cursor-pointer rounded-2xl bg-[var(--theme-section-bg,#F5F1EB)]/60 border border-[var(--theme-border,#D9DED1)] overflow-hidden hover:shadow-md hover:border-pink-500/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="p-3 bg-pink-500/10 border-b border-pink-500/20 flex items-center justify-between">
                  <span className="text-xs font-bold text-pink-800 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-pink-600" />
                    {language === 'en' ? 'Column 3 — TikTok' : 'কলাম ৩ — টিকটক'}
                  </span>
                  <span className="text-[10px] font-bold text-pink-600 uppercase">UGC Hook Demo</span>
                </div>

                <div className="relative aspect-video bg-black overflow-hidden">
                  <img
                    src={tiktokPreview.thumbnailUrl || 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80'}
                    alt={tiktokPreview.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-black/80 border border-pink-500 text-pink-400 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 ml-0.5 fill-pink-400" />
                    </div>
                  </div>
                </div>

                <div className="p-4 space-y-1">
                  <h3 className="text-sm font-bold text-[var(--theme-heading,#2C3327)] line-clamp-1">{tiktokPreview.title}</h3>
                  <p className="text-xs text-[var(--theme-text,#2C3327)]/70 line-clamp-2">{tiktokPreview.description || 'Viral TikTok hook breakdown'}</p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <span className="text-xs font-bold text-pink-600 flex items-center gap-1 group-hover:underline">
                  {language === 'en' ? 'Watch TikTok Breakdown →' : 'সকল টিকটক ভিডিও দেখুন →'}
                </span>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
