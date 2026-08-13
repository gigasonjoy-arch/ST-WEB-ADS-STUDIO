import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, ShieldCheck, Sparkles, MessageCircle, AlertCircle } from 'lucide-react';
import { storageService } from '../../services/storageService';
import { trackingService } from '../../services/trackingService';
import { LeadSubmission } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<LeadSubmission>;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, initialData }) => {
  const { language, t } = useLanguage();
  const [name, setName] = useState(initialData?.name || '');
  const [phone, setPhone] = useState(initialData?.phone || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [businessType, setBusinessType] = useState(initialData?.businessType || 'Fashion & Apparel');
  const [interestedService, setInterestedService] = useState<'TIKTOK_ADS' | 'FACEBOOK_ADS' | 'BOTH'>(
    initialData?.interestedService || 'TIKTOK_ADS'
  );
  const [monthlyBudget, setMonthlyBudget] = useState(initialData?.monthlyBudget || (language === 'en' ? '$250 - $500' : '৳২৫,০০০ - ৳৫০,০০০'));
  const [websiteOrPage, setWebsiteOrPage] = useState('');
  const [notes, setNotes] = useState(initialData?.notes || '');
  const [honeypot, setHoneypot] = useState(''); // Anti-bot

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (honeypot) return; // Silent discard for bot

    if (!name.trim() || !phone.trim()) {
      setErrorMessage(language === 'en' ? 'Please enter your Name and WhatsApp / Phone Number.' : 'অনুগ্রহ করে আপনার নাম এবং মোবাইল/হোয়াটসঅ্যাপ নম্বর লিখুন।');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const visitorId = storageService.getVisitorId();
      const newLead: LeadSubmission = {
        id: `lead_${Date.now()}`,
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        businessType,
        interestedService,
        monthlyBudget,
        websiteOrPage: websiteOrPage.trim() || undefined,
        notes: notes.trim() || undefined,
        status: 'NEW',
        createdAt: new Date().toISOString(),
        visitorId,
        calculatorSnapshot: initialData?.calculatorSnapshot
      };

      storageService.saveLead(newLead);
      
      // Fire real-time server fallback to ensure Webhook and Telegram notifications are triggered
      fetch('/api/leads/fallback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newLead)
      }).catch(err => console.debug('Real-time fallback notice:', err));

      trackingService.pushEvent('generate_lead', {
        lead_id: newLead.id,
        business_type: newLead.businessType,
        interested_service: newLead.interestedService,
        monthly_budget: newLead.monthlyBudget
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error('Lead submission error:', err);
      setErrorMessage(language === 'en' ? 'Submission error. Please connect directly via WhatsApp.' : 'ফরম জমা দিতে সমস্যা হয়েছে। অনুগ্রহ করে হোয়াটসঅ্যাপে মেসেজ দিন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#2C3327]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#FFFFFF] rounded-[36px] max-w-xl w-full max-h-[92vh] overflow-y-auto border border-[#D9DED1] shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-[#F5F1EB] text-[#8A957F] hover:text-[#2C3327] transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSubmitted ? (
          <div>
            {/* Modal Header */}
            <div className="pr-8 mb-6">
              <div className="inline-block px-3 py-1 bg-[#E8EAE2] rounded-full text-[10px] uppercase tracking-[0.2em] text-[#4A5D3B] font-bold mb-2">
                {language === 'en' ? 'Free Strategic Audit' : 'Free Strategy Audit'}
              </div>
              <h3 className="text-2xl font-serif text-[#2C3327] font-bold">
                {language === 'en' ? 'Claim Your Ad & Growth Strategy Audit' : 'বিজ্ঞাপন ও পারফরম্যান্স অডিট শুরু করুন'}
              </h3>
              <p className="text-xs text-[#5C6652] mt-1 leading-relaxed">
                {language === 'en'
                  ? 'Share your business fundamentals. Sonjoy Sarkar will personally audit your ad account, creative angles, or landing pages and deliver a customized scaling roadmap within 24 hours.'
                  : 'আপনার বিজনেসের তথ্য শেয়ার করুন। সঞ্জয় সরকার স্বয়ং আপনার অ্যাড অ্যাকাউন্ট বা প্রোডাক্ট লাইন অডিট করে ২৪ ঘণ্টার মধ্যে উপযুক্ত স্ট্র্যাটেজি শেয়ার করবেন।'}
              </p>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Honeypot hidden input */}
              <input
                type="text"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{ display: 'none' }}
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Name & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C3327]">
                    {language === 'en' ? 'Full Name *' : 'আপনার নাম *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={language === 'en' ? 'John Doe' : 'সঞ্জয় কুমার'}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C3327]">
                    {language === 'en' ? 'WhatsApp / Phone Number *' : 'WhatsApp / মোবাইল নম্বর *'}
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={language === 'en' ? '+880 1712xxxxxx / Phone' : '01712xxxxxx'}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                </div>
              </div>

              {/* Email & Business Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C3327]">
                    {language === 'en' ? 'Email Address (Optional)' : 'ইমেইল (অপশনাল)'}
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C3327]">
                    {language === 'en' ? 'Business Niche / Category *' : 'বিজনেসের ধরন / ক্যাটাগরি *'}
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  >
                    <option value="Fashion & Apparel">{language === 'en' ? 'Fashion & Apparel' : 'ফ্যাশন ও ক্লথিং (Fashion & Apparel)'}</option>
                    <option value="Beauty & Cosmetics">{language === 'en' ? 'Beauty, Skincare & Cosmetics' : 'বিউটি ও স্কিনকেয়ার (Beauty & Cosmetics)'}</option>
                    <option value="Electronics & Gadgets">{language === 'en' ? 'Electronics & Gadgets' : 'ইলেকট্রনিক্স ও গ্যাজেট (Electronics)'}</option>
                    <option value="Food & Restaurant">{language === 'en' ? 'Food, Bakery & Restaurant' : 'ফুড ও রেস্টুরেন্ট (Food & Cafe)'}</option>
                    <option value="E-commerce (General)">{language === 'en' ? 'General E-commerce Store' : 'জেনারেল ই-কমার্স শপ (General E-com)'}</option>
                    <option value="Local Services">{language === 'en' ? 'Professional Services & Consulting' : 'সার্ভিস ও ট্রেনিং (Service / Agency)'}</option>
                    <option value="Other">{language === 'en' ? 'Other Category' : 'অন্যান্য (Other)'}</option>
                  </select>
                </div>
              </div>

              {/* Service Interest & Monthly Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C3327]">
                    {language === 'en' ? 'Primary Focus Channel *' : 'আগ্রহী বিজ্ঞাপন মাধ্যম *'}
                  </label>
                  <select
                    value={interestedService}
                    onChange={(e) => setInterestedService(e.target.value as any)}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  >
                    <option value="TIKTOK_ADS">TikTok Ads Management (Primary)</option>
                    <option value="FACEBOOK_ADS">Facebook Ads Management</option>
                    <option value="BOTH">TikTok & Facebook Dual Funnel</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#2C3327]">
                    {language === 'en' ? 'Monthly Ad Budget Estimate' : 'মাসিক বিজ্ঞাপনী বাজেট'}
                  </label>
                  <select
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                  >
                    {language === 'en' ? (
                      <>
                        <option value="$100 - $250">$100 - $250 / month</option>
                        <option value="$250 - $500">$250 - $500 / month</option>
                        <option value="$500 - $1,000">$500 - $1,000 / month</option>
                        <option value="$1,000+">$1,000+ / month</option>
                      </>
                    ) : (
                      <>
                        <option value="৳১০,০০০ - ৳২৫,০০০">৳১০,০০০ - ৳২৫,০০০</option>
                        <option value="৳২৫,০০০ - ৳৫০,০০০">৳২৫,০০০ - ৳৫০,০০০</option>
                        <option value="৳৫০,০০০ - ৳১,০০,০০০">৳৫০,০০০ - ৳১,০০,০০০</option>
                        <option value="৳১,০০,০০০+">৳১,০০,০০০ এর বেশি</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Page / Website Link */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C3327]">
                  {language === 'en' ? 'Website URL or Facebook / TikTok Page' : 'ফেসবুক পেজ বা ওয়েবসাইট লিংক'}
                </label>
                <input
                  type="text"
                  value={websiteOrPage}
                  onChange={(e) => setWebsiteOrPage(e.target.value)}
                  placeholder={language === 'en' ? 'https://yourwebsite.com or facebook.com/page' : 'https://facebook.com/yourpage বা yourwebsite.com'}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3.5 py-2.5 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                />
              </div>

              {/* Notes / Challenges */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#2C3327]">
                  {language === 'en' ? 'Key Growth Objective or Current Bottleneck' : 'বর্তমান চ্যালেঞ্জ বা বিশেষ কোনো লক্ষ্য'}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={language === 'en' ? 'e.g., High CPA on Facebook, looking to test TikTok UGC angles and scale purchase ROAS...' : 'যেমন: বর্তমানে বিজ্ঞাপনের CPA বেশি আসছে অথবা টিকটকে নতুন প্রোডাক্ট লঞ্চ করতে চাই...'}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl p-3 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#4A5D3B] hover:bg-[#3A4533] text-[#FDFCF8] py-3.5 rounded-full text-xs font-bold tracking-wide transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <span>{isSubmitting ? (language === 'en' ? 'Submitting...' : 'প্রসেসিং হচ্ছে...') : (language === 'en' ? 'Submit Strategy Audit Request' : 'অডিট রিকোয়েস্ট সাবমিট করুন')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Privacy assurance */}
              <div className="text-center pt-1">
                <p className="text-[10px] text-[#8A957F]">
                  🔒 {language === 'en' ? 'Your information is 100% confidential. No spam or third-party sharing.' : 'আপনার তথ্য ১০০% নিরাপদ ও গোপনীয় থাকবে। কোনো স্প্যাম মেসেজ পাঠানো হবে না।'}
                </p>
              </div>

            </form>
          </div>
        ) : (
          /* Submission Success State */
          <div className="py-8 text-center space-y-4 animate-fadeIn">
            <div className="w-14 h-14 rounded-full bg-[#E8EAE2] text-[#4A5D3B] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-serif font-bold text-[#2C3327]">
              {language === 'en' ? 'Audit Request Received Successfully!' : 'রিকোয়েস্ট সফলভাবে জমা হয়েছে!'}
            </h3>

            <p className="text-xs sm:text-sm text-[#5C6652] max-w-md mx-auto leading-relaxed">
              {language === 'en' 
                ? <>Thank you, <strong>{name}</strong>. Sonjoy Talukder is reviewing your business details and will reach out with actionable audit insights via WhatsApp / Phone shortly.</>
                : <>ধন্যবাদ <strong>{name}</strong>। সঞ্জয় সরকার আপনার তথ্যটি রিভিউ করছেন এবং খুব শীঘ্রই আপনার দেওয়া নম্বরে যোগাযোগ করবেন।</>}
            </p>

            <div className="p-4 bg-[#F5F1EB] rounded-2xl border border-[#D9DED1] text-xs text-[#2C3327] max-w-sm mx-auto">
              {language === 'en' ? 'For immediate consultation, connect directly with Sonjoy on WhatsApp:' : 'তাৎক্ষণিক উত্তরের জন্য এখনই সরাসরি WhatsApp-এ কানেক্ট হতে পারেন:'}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
              <a
                href={`https://wa.me/8801815124970?text=${encodeURIComponent(language === 'en' ? `Hello Sonjoy Talukder, I submitted a strategy audit request on your website. Name: ${name}, Niche: ${businessType}. Let's discuss!` : `হ্যালো সঞ্জয় সরকার, আমি লিড ফরম সাবমিট করেছি। নাম: ${name}, নিশ: ${businessType}। আমি বিস্তারিত আলোচনা করতে চাই।`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#4A5D3B] text-[#FDFCF8] rounded-full text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#3A4533]"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{language === 'en' ? 'Message on WhatsApp' : 'সরাসরি WhatsApp-এ কথা বলুন'}</span>
              </a>

              <button
                onClick={onClose}
                className="px-6 py-3 border border-[#D9DED1] rounded-full text-xs font-bold text-[#5C6652] hover:bg-[#F5F1EB]"
              >
                {language === 'en' ? 'Close' : 'বন্ধ করুন'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
