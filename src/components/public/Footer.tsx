import React from 'react';
import { 
  Lock, 
  MessageCircle, 
  ArrowUp, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Heart,
  Share2,
  ExternalLink,
  Globe,
  Video
} from 'lucide-react';
import { SiteSettings } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface FooterProps {
  settings: SiteSettings;
  onOpenLeadForm: () => void;
  onNavigateSection: (id: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  settings,
  onOpenLeadForm,
  onNavigateSection,
  onOpenAdmin
}) => {
  const { language, t } = useLanguage();
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#2C3327] text-[#FDFCF8] border-t border-[#3A4533] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-[#3A4533]">
          
          {/* Brand Col */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#4A5D3B] text-[#FDFCF8] flex items-center justify-center font-serif text-lg font-bold">
                ST
              </div>
              <div>
                <div className="font-serif text-xl font-bold tracking-tight text-[#FDFCF8]">
                  {settings.brandName}
                </div>
                <div className="text-[11px] text-[#8A957F] uppercase tracking-widest font-semibold">
                  {settings.personalName} • Performance Marketing
                </div>
              </div>
            </div>

            <p className="text-xs text-[#D9DED1] leading-relaxed max-w-md">
              {language === 'en'
                ? 'High-performance TikTok & Facebook ads management for scalable e-commerce brands in Bangladesh and global markets. Powered by granular tracking, creative testing, and measurable ROAS.'
                : 'বাংলাদেশে ই-কমার্স ও গ্রোথ ব্র্যান্ডগুলোর জন্য নির্ভরযোগ্য TikTok এবং Facebook বিজ্ঞাপন ব্যবস্থাপনা। ডেটা, ট্র্যাকিং ও ক্রিয়েটিভ ফানেলের সমন্বয়ে বাস্তব ফলাফল।'}
            </p>

            <div className="flex items-center gap-4 text-xs text-[#8A957F] pt-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#E2725B]" />
                <span>{language === 'en' ? 'Dhaka, Bangladesh' : 'ঢাকা, বাংলাদেশ'}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#4A5D3B]" />
                <span>{language === 'en' ? 'Verified Ads Specialist' : 'ভেরিফাইড অ্যাডস স্পেশালিস্ট'}</span>
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F]">
              {language === 'en' ? 'Quick Pages & Resources' : 'পেজ ও রিসোর্স সমূহ'}
            </div>
            <ul className="space-y-2 text-xs text-[#D9DED1]">
              <li>
                <button onClick={() => onNavigateSection('/services')} className="hover:text-[#FDFCF8] transition-colors text-left">
                  {language === 'en' ? 'Performance Services' : 'অ্যাড সার্ভিসেস'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('/case-studies')} className="hover:text-[#FDFCF8] transition-colors text-left">
                  {language === 'en' ? 'Case Studies Archive' : 'কেস স্টাডিজ আর্কাইভ'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('/media-gallery')} className="hover:text-[#FDFCF8] transition-colors text-left font-medium text-emerald-400">
                  {language === 'en' ? 'Media Gallery (3 Columns)' : 'মিডিয়া গ্যালারি (ভিডিও ও ইমেজ)'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('/tiktok-ads')} className="hover:text-[#FDFCF8] transition-colors text-left">
                  {language === 'en' ? 'TikTok Ads Playbook' : 'টিকটক অ্যাডস প্লেবুক'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('/facebook-ads')} className="hover:text-[#FDFCF8] transition-colors text-left">
                  {language === 'en' ? 'Facebook Ads Architecture' : 'ফেসবুক অ্যাডস স্ট্র্যাটেজি'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('/#calculator')} className="hover:text-[#FDFCF8] transition-colors text-left">
                  {language === 'en' ? 'Ads Feasibility Calculator' : 'অ্যাড ক্যালকুলেটর'}
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateSection('/contact')} className="hover:text-[#FDFCF8] transition-colors text-left">
                  {language === 'en' ? 'Book 1-on-1 Consultation' : 'যোগাযোগ ও কনসাল্টেশন'}
                </button>
              </li>
            </ul>
          </div>

          {/* Direct Connect */}
          <div className="md:col-span-4 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#8A957F]">
              {language === 'en' ? 'Direct Communication' : 'সরাসরি যোগাযোগ'}
            </div>
            
            <p className="text-xs text-[#D9DED1]">
              {language === 'en'
                ? 'Get in touch for a comprehensive campaign audit or custom marketing roadmap:'
                : 'আপনার ক্যাম্পেইন বা প্রোডাক্ট অডিট নিয়ে সরাসরি কথা বলতে মেসেজ দিন:'}
            </p>

            <div className="space-y-2">
              {(() => {
                const rawNumber = settings?.whatsapp?.number || (settings as any)?.whatsappNumber || '+8801815124970';
                const cleanNumber = rawNumber ? rawNumber.replace(/\D/g, '') : '8801815124970';
                return (
                  <a
                    href={`https://wa.me/${cleanNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#3A4533] hover:bg-[#4A5D3B] text-[#FDFCF8] rounded-xl text-xs font-semibold transition-colors border border-[#4A5D3B]/40"
                  >
                    <MessageCircle className="w-4 h-4 text-[#25D366]" />
                    <span>WhatsApp: {rawNumber}</span>
                  </a>
                );
              })()}
            </div>

            {/* Social Media Links from Settings */}
            {settings?.socialLinks && (
              <div className="pt-2 space-y-2">
                <div className="text-[11px] font-semibold text-[#8A957F] uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5 text-[#E2725B]" />
                  <span>{language === 'en' ? 'Official Social Profiles' : 'সোশ্যাল মিডিয়া প্রোফাইল'}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {settings.socialLinks.facebook && (
                    <a
                      href={settings.socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#3A4533] hover:bg-[#1877F2] text-[#FDFCF8] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-[#4A5D3B]/40 hover:border-[#1877F2]"
                      title="Facebook Page"
                    >
                      <span className="font-bold text-[11px]">Facebook</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {settings.socialLinks.tiktok && (
                    <a
                      href={settings.socialLinks.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#3A4533] hover:bg-[#FE2C55] text-[#FDFCF8] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-[#4A5D3B]/40 hover:border-[#FE2C55]"
                      title="TikTok Account"
                    >
                      <span className="font-bold text-[11px]">TikTok</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {settings.socialLinks.youtube && (
                    <a
                      href={settings.socialLinks.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#3A4533] hover:bg-[#FF0000] text-[#FDFCF8] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-[#4A5D3B]/40 hover:border-[#FF0000]"
                      title="YouTube Channel"
                    >
                      <span className="font-bold text-[11px]">YouTube</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {settings.socialLinks.linkedin && (
                    <a
                      href={settings.socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#3A4533] hover:bg-[#0A66C2] text-[#FDFCF8] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-[#4A5D3B]/40 hover:border-[#0A66C2]"
                      title="LinkedIn Profile"
                    >
                      <span className="font-bold text-[11px]">LinkedIn</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {settings.socialLinks.instagram && (
                    <a
                      href={settings.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#3A4533] hover:bg-[#E4405F] text-[#FDFCF8] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-[#4A5D3B]/40 hover:border-[#E4405F]"
                      title="Instagram"
                    >
                      <span className="font-bold text-[11px]">Instagram</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {settings.socialLinks.xTwitter && (
                    <a
                      href={settings.socialLinks.xTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#3A4533] hover:bg-slate-700 text-[#FDFCF8] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-[#4A5D3B]/40"
                      title="X / Twitter"
                    >
                      <span className="font-bold text-[11px]">X / Twitter</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {settings.socialLinks.telegram && (
                    <a
                      href={settings.socialLinks.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#3A4533] hover:bg-[#229ED9] text-[#FDFCF8] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-[#4A5D3B]/40 hover:border-[#229ED9]"
                      title="Telegram"
                    >
                      <span className="font-bold text-[11px]">Telegram</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  )}
                  {settings.socialLinks.customLinks?.map((item) => (
                    <a
                      key={item.id}
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#3A4533] hover:bg-[#4A5D3B] text-[#FDFCF8] rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5 border border-[#4A5D3B]/40"
                    >
                      <span className="font-bold text-[11px]">{item.label}</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={onOpenLeadForm}
                className="px-5 py-2 bg-[#E2725B] hover:bg-[#c95d46] text-[#FDFCF8] rounded-xl text-xs font-bold transition-colors"
              >
                {language === 'en' ? 'Book Free Strategy Audit' : 'ফ্রি অডিট বুক করুন'}
              </button>
            </div>
          </div>

        </div>

        {/* Legal & Trademarks Disclaimer */}
        <div className="py-6 border-b border-[#3A4533] text-[10px] text-[#8A957F] leading-relaxed space-y-1.5">
          <p>
            <strong>Disclaimer:</strong> This site is not a part of the TikTok website, ByteDance, Facebook website, or Meta Platforms, Inc. Additionally, this site is NOT endorsed by TikTok or Meta in any way. TikTok is a trademark of ByteDance Ltd. Facebook is a trademark of Meta Platforms, Inc.
          </p>
          <p>
            {language === 'en'
              ? '*Reported figures reflect historical campaign benchmarks. Performance varies across creative velocity, offer conversion, and platform inventory.'
              : '*প্রদর্শিত ফলাফলগুলো বাস্তব ঐতিহাসিক ক্যাম্পেইনের তথ্য। কোনো নির্দিষ্ট আরওআই বা আয়ের নিশ্চিত গ্যারান্টি হিসেবে এটিকে বিবেচনা করবেন না।'}
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8A957F]">
          <div>
            © {new Date().getFullYear()} {settings.brandName}. All rights reserved. Managed by {settings.personalName}.
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 text-[11px] text-[#8A957F] hover:text-[#FDFCF8] transition-colors p-1"
              id="admin-portal-link"
              title="Admin Studio Portal"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin Studio</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-2 rounded-xl bg-[#3A4533] text-[#FDFCF8] hover:bg-[#4A5D3B] transition-colors"
              aria-label="Scroll to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

