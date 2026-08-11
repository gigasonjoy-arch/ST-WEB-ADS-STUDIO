import React from 'react';
import { MessageCircle } from 'lucide-react';
import { SiteSettings } from '../../types';
import { trackingService } from '../../services/trackingService';

interface WhatsAppFloatingProps {
  settings: SiteSettings;
}

export const WhatsAppFloating: React.FC<WhatsAppFloatingProps> = ({ settings }) => {
  const rawNumber = settings?.whatsapp?.number || (settings as any)?.whatsappNumber || '+8801815124970';
  const cleanNumber = rawNumber ? rawNumber.replace(/\D/g, '') : '8801815124970';
  const defaultMsg = settings?.whatsapp?.defaultMessage || 'Hello Sonjoy, I want to inquire about TikTok and Facebook ads growth for my business.';
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(defaultMsg)}`;

  const handleClick = () => {
    trackingService.pushEvent('whatsapp_click', {
      position: 'floating_widget',
      phone: cleanNumber
    });
  };

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="fixed bottom-6 left-6 z-40 bg-[#25D366] hover:bg-[#1EBE5D] text-white p-3.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2 group border border-white/20"
      id="floating-whatsapp-btn"
      aria-label="Direct WhatsApp Chat"
      title="WhatsApp এ মেসেজ দিন"
    >
      <MessageCircle className="w-6 h-6 fill-current" />
      <span className="text-xs font-bold pr-1 hidden md:inline-block">
        WhatsApp
      </span>
    </a>
  );
};
