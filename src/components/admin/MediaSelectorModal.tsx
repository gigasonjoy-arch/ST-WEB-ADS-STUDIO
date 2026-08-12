import React, { useState } from 'react';
import { MediaItem } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  Image as ImageIcon, 
  Video, 
  Youtube, 
  Upload, 
  Link as LinkIcon, 
  Code, 
  X, 
  Check, 
  Search, 
  Plus 
} from 'lucide-react';

interface MediaSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: { url?: string; videoUrl?: string; embedCode?: string; type?: string; title?: string }) => void;
  allowedTypes?: Array<'image' | 'youtube' | 'tiktok' | 'video_embed'>;
  title?: string;
}

export const MediaSelectorModal: React.FC<MediaSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  allowedTypes = ['image', 'youtube', 'tiktok', 'video_embed'],
  title = 'মিডিয়া নির্বাচন বা যুক্ত করুন'
}) => {
  const [activeTab, setActiveTab] = useState<'LIBRARY' | 'URL' | 'UPLOAD' | 'EMBED'>('LIBRARY');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Custom inputs
  const [customUrl, setCustomUrl] = useState<string>('');
  const [customType, setCustomType] = useState<string>('image');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customEmbedCode, setCustomEmbedCode] = useState<string>('');

  if (!isOpen) return null;

  const mediaList = storageService.getMedia(false).filter(item => {
    if (allowedTypes && !allowedTypes.includes(item.type)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.title.toLowerCase().includes(q) ||
        item.altText?.toLowerCase().includes(q) ||
        (item.url || item.videoUrl || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleSelectExisting = (item: MediaItem) => {
    onSelect({
      url: item.url,
      videoUrl: item.videoUrl || item.url,
      embedCode: item.embedCode,
      type: item.type,
      title: item.title
    });
    onClose();
  };

  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const newMedia: MediaItem = {
        id: `media-${Date.now()}`,
        title: file.name.replace(/\.[^/.]+$/, ''),
        type: 'image',
        url: dataUrl,
        altText: file.name.replace(/\.[^/.]+$/, ''),
        placement: 'general',
        isEnabled: true,
        uploadedAt: new Date().toISOString()
      };
      storageService.saveMedia(newMedia);
      onSelect({
        url: dataUrl,
        type: 'image',
        title: newMedia.title
      });
      onClose();
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    let detectedType: 'image' | 'youtube' | 'tiktok' | 'video_embed' = 'image';
    if (customUrl.includes('youtube.com') || customUrl.includes('youtu.be')) {
      detectedType = 'youtube';
    } else if (customUrl.includes('tiktok.com')) {
      detectedType = 'tiktok';
    } else if (customUrl.endsWith('.mp4') || customUrl.endsWith('.webm')) {
      detectedType = 'video_embed';
    }

    const newMedia: MediaItem = {
      id: `media-${Date.now()}`,
      title: customTitle.trim() || 'Direct Media URL',
      type: detectedType,
      url: detectedType === 'image' ? customUrl.trim() : undefined,
      videoUrl: detectedType !== 'image' ? customUrl.trim() : undefined,
      altText: customTitle.trim() || 'Media URL',
      placement: 'general',
      isEnabled: true,
      uploadedAt: new Date().toISOString()
    };
    storageService.saveMedia(newMedia);

    onSelect({
      url: detectedType === 'image' ? customUrl.trim() : undefined,
      videoUrl: detectedType !== 'image' ? customUrl.trim() : undefined,
      type: detectedType,
      title: newMedia.title
    });
    onClose();
  };

  const handleApplyEmbed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmbedCode.trim()) return;

    const newMedia: MediaItem = {
      id: `media-${Date.now()}`,
      title: customTitle.trim() || 'Video Embed Player',
      type: 'video_embed',
      embedCode: customEmbedCode.trim(),
      altText: customTitle.trim() || 'Video Embed',
      placement: 'general',
      isEnabled: true,
      uploadedAt: new Date().toISOString()
    };
    storageService.saveMedia(newMedia);

    onSelect({
      embedCode: customEmbedCode.trim(),
      type: 'video_embed',
      title: newMedia.title
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[#D9DED1] flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#2C3327]">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-1.5 text-[#8A957F] hover:text-[#2C3327] rounded-lg hover:bg-[#F5F1EB] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-[#D9DED1] flex gap-2 overflow-x-auto no-scrollbar bg-[#FDFCF8]">
          <button
            onClick={() => setActiveTab('LIBRARY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'LIBRARY'
                ? 'bg-[#4A5D3B] text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>মিডিয়া লাইব্রেরি থেকে পছন্দ করুন ({mediaList.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('URL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'URL'
                ? 'bg-[#4A5D3B] text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            <span>সরাসরি লিঙ্ক (URL)</span>
          </button>
          <button
            onClick={() => setActiveTab('UPLOAD')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'UPLOAD'
                ? 'bg-[#4A5D3B] text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>ইমেজ আপলোড</span>
          </button>
          <button
            onClick={() => setActiveTab('EMBED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'EMBED'
                ? 'bg-[#4A5D3B] text-white shadow-2xs'
                : 'bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2]'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>এমবেড কোড</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          
          {/* 1. LIBRARY TAB */}
          {activeTab === 'LIBRARY' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8A957F]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="লাইব্রেরি থেকে খুঁজুন..."
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] pl-8 pr-3 py-2 rounded-xl text-xs text-[#2C3327] outline-none"
                />
              </div>

              {mediaList.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#8A957F]">
                  কোনো মিডিয়া পাওয়া যায়নি। URL বা Upload ট্যাব ব্যবহার করুন।
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mediaList.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleSelectExisting(item)}
                      className="group cursor-pointer rounded-2xl border border-[#D9DED1] overflow-hidden hover:border-[#4A5D3B] transition-all bg-[#FFFFFF] shadow-2xs"
                    >
                      <div className="aspect-video bg-neutral-900 relative overflow-hidden flex items-center justify-center">
                        {item.type === 'image' ? (
                          <img
                            src={item.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="text-white text-center p-2">
                            {item.type === 'youtube' && <Youtube className="w-6 h-6 text-red-500 mx-auto mb-1" />}
                            {item.type === 'tiktok' && <Video className="w-6 h-6 text-cyan-400 mx-auto mb-1" />}
                            {item.type === 'video_embed' && <Code className="w-6 h-6 text-emerald-400 mx-auto mb-1" />}
                            <span className="text-[9px] uppercase font-bold tracking-wider">{item.type}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-2.5">
                        <div className="text-xs font-bold text-[#2C3327] truncate group-hover:text-[#4A5D3B]">
                          {item.title}
                        </div>
                        <div className="text-[10px] text-[#8A957F] truncate">
                          {item.placement || 'general'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 2. DIRECT URL TAB */}
          {activeTab === 'URL' && (
            <form onSubmit={handleApplyCustomUrl} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">মিডিয়া বা ভিডিওর সরাসরি লিঙ্ক (URL) *</label>
                <input
                  type="url"
                  value={customUrl}
                  onChange={(e) => setCustomUrl(e.target.value)}
                  placeholder="https://... (Image URL, YouTube URL, TikTok URL, or MP4 URL)"
                  required
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">টাইটেল / নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="মিডিয়ার নাম..."
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4A5D3B] text-white rounded-xl text-xs font-semibold hover:bg-[#3A4533] transition-colors"
              >
                প্রয়োগ ও নির্বাচন করুন
              </button>
            </form>
          )}

          {/* 3. UPLOAD TAB */}
          {activeTab === 'UPLOAD' && (
            <div className="border-2 border-dashed border-[#D9DED1] rounded-2xl p-8 text-center bg-[#FDFCF8]">
              <input
                type="file"
                id="modal-media-upload"
                accept="image/*"
                onChange={handleUploadFile}
                className="hidden"
              />
              <label htmlFor="modal-media-upload" className="cursor-pointer space-y-2 block">
                <Upload className="w-8 h-8 text-[#4A5D3B] mx-auto" />
                <div className="text-xs font-bold text-[#2C3327]">ডিভাইস থেকে ছবি আপলোড করুন</div>
                <div className="text-[11px] text-[#5C6652]">JPG, PNG, WebP (Max 5MB)</div>
              </label>
            </div>
          )}

          {/* 4. EMBED CODE TAB */}
          {activeTab === 'EMBED' && (
            <form onSubmit={handleApplyEmbed} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">ভিডিও এমবেড কোড (iframe / blockquote) *</label>
                <textarea
                  rows={4}
                  value={customEmbedCode}
                  onChange={(e) => setCustomEmbedCode(e.target.value)}
                  placeholder='<iframe src="https://..." ...></iframe>'
                  required
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs font-mono text-[#2C3327] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#2C3327] mb-1">টাইটেল / নাম (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="ভিডিও টাইটেল..."
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] focus:border-[#4A5D3B] px-4 py-2.5 rounded-xl text-xs text-[#2C3327] outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#4A5D3B] text-white rounded-xl text-xs font-semibold hover:bg-[#3A4533] transition-colors"
              >
                এমবেড কোড সংরক্ষণ ও প্রয়োগ করুন
              </button>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
