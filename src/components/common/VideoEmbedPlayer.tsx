import React, { useState } from 'react';
import { Play, ExternalLink, Video, AlertCircle } from 'lucide-react';

interface VideoEmbedPlayerProps {
  url?: string;
  embedCode?: string;
  title?: string;
  thumbnailUrl?: string;
  aspectRatio?: '16:9' | '9:16' | 'auto';
  className?: string;
}

export const VideoEmbedPlayer: React.FC<VideoEmbedPlayerProps> = ({
  url = '',
  embedCode = '',
  title = 'Video Player',
  thumbnailUrl,
  aspectRatio = '16:9',
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);

  // 1. Check if raw iframe embed code was provided
  const hasRawEmbed = Boolean(embedCode && embedCode.trim().includes('<iframe') || embedCode.trim().includes('blockquote'));

  // 2. Extract YouTube Video ID from various URL patterns
  const extractYouTubeId = (rawUrl: string): string | null => {
    if (!rawUrl) return null;
    const cleanUrl = rawUrl.trim();
    
    // Check if embed code contains src
    const srcMatch = cleanUrl.match(/src=["'](?:https?:)?\/\/www\.youtube\.com\/embed\/([^"'\?]+)/i);
    if (srcMatch && srcMatch[1]) return srcMatch[1];

    // Standard YouTube URL formats
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
    const match = cleanUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // 3. Extract TikTok Video ID from URL patterns
  const extractTikTokId = (rawUrl: string): string | null => {
    if (!rawUrl) return null;
    const cleanUrl = rawUrl.trim();
    const match = cleanUrl.match(/\/video\/(\d+)/);
    return match ? match[1] : null;
  };

  const ytId = extractYouTubeId(url) || extractYouTubeId(embedCode);
  const ttId = extractTikTokId(url) || extractTikTokId(embedCode);

  const effectiveAspectRatio = aspectRatio === 'auto' 
    ? (ttId || (url && url.includes('tiktok.com')) ? '9:16' : '16:9') 
    : aspectRatio;

  const containerAspectClass = effectiveAspectRatio === '9:16' 
    ? 'aspect-[9/16] max-w-[340px] mx-auto' 
    : 'aspect-video w-full';

  // If raw embed code is supplied and no simple ID matched
  if (hasRawEmbed && !ytId && !ttId) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-black border border-[#D9DED1] shadow-md ${containerAspectClass} ${className}`}>
        <div 
          className="w-full h-full flex items-center justify-center [&>iframe]:w-full [&>iframe]:h-full [&>iframe]:border-0"
          dangerouslySetInnerHTML={{ __html: embedCode }}
        />
      </div>
    );
  }

  // YouTube Player
  if (ytId) {
    const embedUrl = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=${isPlaying ? 1 : 0}&rel=0&modestbranding=1`;

    if (!isPlaying && thumbnailUrl) {
      return (
        <div className={`relative rounded-2xl overflow-hidden bg-[#1E251B] border border-[#D9DED1] group shadow-md cursor-pointer ${containerAspectClass} ${className}`}
             onClick={() => setIsPlaying(true)}>
          <img 
            src={thumbnailUrl || `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Fallback to hqdefault if maxres not available
              (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex flex-col items-center justify-center p-4 text-center">
            <div className="w-14 h-14 rounded-full bg-[#E2725B] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
              <Play className="w-6 h-6 fill-current ml-0.5" />
            </div>
            {title && (
              <span className="mt-3 text-xs font-bold text-white max-w-[85%] line-clamp-2 drop-shadow-md">
                {title}
              </span>
            )}
            <span className="mt-1 text-[10px] uppercase tracking-wider font-semibold text-white/80 bg-black/50 px-2 py-0.5 rounded-full">
              YouTube Video
            </span>
          </div>
        </div>
      );
    }

    return (
      <div className={`relative rounded-2xl overflow-hidden bg-black border border-[#D9DED1] shadow-md ${containerAspectClass} ${className}`}>
        <iframe
          src={embedUrl}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="w-full h-full border-0"
        />
      </div>
    );
  }

  // TikTok Player
  if (ttId || (url && url.includes('tiktok.com'))) {
    const videoId = ttId;
    const ttEmbedUrl = videoId ? `https://www.tiktok.com/embed/v2/${videoId}` : url;

    return (
      <div className={`relative rounded-2xl overflow-hidden bg-[#010101] border border-[#3A4533] shadow-lg ${containerAspectClass} ${className}`}>
        {videoId ? (
          <iframe
            src={ttEmbedUrl}
            title={title || "TikTok Video"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full border-0"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center text-[#FDFCF8]">
            <Video className="w-10 h-10 text-[#FE2C55] mb-3" />
            <h4 className="font-bold text-sm text-[#FDFCF8] mb-1">{title}</h4>
            <p className="text-xs text-[#8A957F] mb-4">TikTok Short Video Creative</p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#FE2C55] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-[#E0264B] transition-colors"
            >
              <span>টিকটকে ভিডিও দেখুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        )}
      </div>
    );
  }

  // Generic or Direct Video URL Fallback
  if (url && (url.endsWith('.mp4') || url.endsWith('.webm'))) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-black border border-[#D9DED1] shadow-md ${containerAspectClass} ${className}`}>
        <video 
          src={url} 
          controls 
          poster={thumbnailUrl} 
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // If no valid URL or embed
  return (
    <div className={`relative rounded-2xl bg-[#E8EAE2]/60 border-2 border-dashed border-[#D9DED1] flex flex-col items-center justify-center p-6 text-center ${containerAspectClass} ${className}`}>
      <Video className="w-8 h-8 text-[#8A957F] mb-2" />
      <span className="text-xs font-bold text-[#5C6652]">{title || 'ভিডিও লিংক সেট করা হয়নি'}</span>
      <span className="text-[11px] text-[#8A957F] mt-1 max-w-[80%]">
        ইউটিউব বা টিকটক ভিডিওর URL বা Embed Code প্রদান করুন।
      </span>
      {url && (
        <a 
          href={url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="mt-3 text-[11px] text-[#4A5D3B] font-bold underline flex items-center gap-1"
        >
          <span>লিংক ভিজিট করুন</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};
