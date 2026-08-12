import React, { useState, useEffect } from 'react';
import { CustomPage, PageType, PageTemplate, PageStatus, HomePageSettings } from '../../types';
import { storageService } from '../../services/storageService';
import { 
  FileText, 
  Plus, 
  Edit3, 
  Trash2, 
  Eye, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Sliders, 
  Globe, 
  Layers, 
  Save, 
  X,
  Sparkles,
  ArrowRight,
  Shield,
  Layout,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';

interface PageManagementProps {
  onPreviewPage?: (page: CustomPage) => void;
}

export const PageManagement: React.FC<PageManagementProps> = ({ onPreviewPage }) => {
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [homeSettings, setHomeSettings] = useState<HomePageSettings>(storageService.getHomePageSettings());
  const [activeTab, setActiveTab] = useState<'ALL_PAGES' | 'HOME_PAGE_RULES' | 'CREATE_EDIT'>('ALL_PAGES');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'DISABLED'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPage, setEditingPage] = useState<CustomPage | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadPages();
    setHomeSettings(storageService.getHomePageSettings());
  }, []);

  const loadPages = () => {
    const all = storageService.getCustomPages(true);
    setPages(all);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCreateNew = () => {
    const newPage: CustomPage = {
      id: `page-${Date.now()}`,
      titleEn: '',
      titleBn: '',
      slug: '',
      contentEn: '',
      contentBn: '',
      excerptEn: '',
      excerptBn: '',
      featuredImage: '',
      pageType: 'CUSTOM_CONTENT',
      template: 'CONTAINED',
      status: 'DRAFT',
      seoTitle: '',
      seoDescription: '',
      seoKeywords: '',
      showInHeaderNav: false,
      showInFooterNav: true,
      sortOrder: pages.length + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEditingPage(newPage);
    setActiveTab('CREATE_EDIT');
  };

  const handleEdit = (page: CustomPage) => {
    setEditingPage({ ...page });
    setActiveTab('CREATE_EDIT');
  };

  const handleSavePage = () => {
    if (!editingPage) return;
    if (!editingPage.titleEn && !editingPage.titleBn) {
      showToast('অনুগ্রহ করে পেজের টাইটেল লিখুন', 'error');
      return;
    }
    if (!editingPage.slug) {
      // Auto-generate slug from English title
      const genSlug = (editingPage.titleEn || editingPage.titleBn || 'page')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      editingPage.slug = genSlug || `page-${Date.now()}`;
    }

    storageService.saveCustomPage(editingPage);
    loadPages();
    showToast(`পেজ "${editingPage.titleEn || editingPage.titleBn}" সফলভাবে সংরক্ষিত হয়েছে (${editingPage.status})!`);
    setActiveTab('ALL_PAGES');
    setEditingPage(null);
  };

  const handleDelete = (id: string, isSystemPage?: boolean) => {
    if (isSystemPage) {
      alert('সিস্টেম পেজগুলো মুছে ফেলা যাবে না। তবে আপনি চাইলে স্ট্যাটাস পরিবর্তন করে Disabled রাখতে পারেন।');
      return;
    }
    if (window.confirm('আপনি কি নিশ্চিত যে এই পেজটি মুছে ফেলতে চান?')) {
      storageService.deleteCustomPage(id);
      loadPages();
      showToast('পেজটি মুছে ফেলা হয়েছে।');
    }
  };

  const handleDuplicate = (page: CustomPage) => {
    const duplicate: CustomPage = {
      ...page,
      id: `page-${Date.now()}`,
      titleEn: `${page.titleEn} (Copy)`,
      titleBn: `${page.titleBn} (কপি)`,
      slug: `${page.slug}-copy`,
      status: 'DRAFT',
      isSystemPage: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    storageService.saveCustomPage(duplicate);
    loadPages();
    showToast('পেজটি ডুপ্লিকেট করা হয়েছে (Draft মোডে)');
  };

  const handleSaveHomeSettings = () => {
    storageService.saveHomePageSettings(homeSettings);
    showToast('হোমপেজ কনটেন্ট ডিসপ্লে রুলস আপডেট হয়েছে!');
  };

  const filteredPages = pages.filter((p) => {
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const term = (searchTerm || '').toLowerCase().trim();
    if (!term) return matchesStatus;

    const matchesSearch = 
      (p.titleEn || '').toLowerCase().includes(term) ||
      (p.titleBn || '').toLowerCase().includes(term) ||
      (p.slug || '').toLowerCase().includes(term);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Toast Notification */}
      {notification && (
        <div 
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold text-white transition-all ${
            notification.type === 'success' ? 'bg-[#4A5D3B]' : 'bg-[#E2725B]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4A5D3B]">
            <FileText className="w-4 h-4" />
            <span>ওয়ার্ডপ্রেস-স্টাইল পেজ ও কনটেন্ট ম্যানেজমেন্ট (Pages & Archives)</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2C3327] mt-1">
            Page Engine & Home Content Rules
          </h2>
          <p className="text-xs sm:text-sm text-[#5C6652] mt-1">
            নতুন পেজ তৈরি করুন, ড্রাফট ও পাবলিশ নিয়ন্ত্রণ করুন, এবং হোমপেজের জন্য নির্ধারিত কেস স্টাডি সংখ্যা সীমিত রাখুন।
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleCreateNew}
            className="px-5 py-2.5 rounded-xl bg-[#4A5D3B] text-[#FFFFFF] text-xs font-bold hover:bg-[#3A4533] transition-all flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন পেজ তৈরি করুন</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#D9DED1] pb-2">
        <button
          onClick={() => setActiveTab('ALL_PAGES')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ALL_PAGES'
              ? 'bg-[#4A5D3B] text-[#FFFFFF] shadow-2xs'
              : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F4F6F0]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>সকল পেজসমূহ ({pages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('HOME_PAGE_RULES')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'HOME_PAGE_RULES'
              ? 'bg-[#4A5D3B] text-[#FFFFFF] shadow-2xs'
              : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F4F6F0]'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>হোমপেজ কেস স্টাডি ও আর্কাইভ কন্ট্রোল</span>
        </button>

        {editingPage && (
          <button
            onClick={() => setActiveTab('CREATE_EDIT')}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'CREATE_EDIT'
                ? 'bg-[#4A5D3B] text-[#FFFFFF] shadow-2xs'
                : 'bg-[#FFFFFF] text-[#5C6652] border border-[#D9DED1] hover:bg-[#F4F6F0]'
            }`}
          >
            <Edit3 className="w-4 h-4" />
            <span>পেজ এডিটর ({editingPage.titleEn || editingPage.titleBn || 'নতুন পেজ'})</span>
          </button>
        )}
      </div>

      {/* TAB 1: ALL PAGES LIST */}
      {activeTab === 'ALL_PAGES' && (
        <div className="space-y-6">
          
          {/* Filter and Search Bar */}
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9DED1] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#8A957F] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="পেজ বা স্লাগ খুঁজুন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-[#D9DED1] text-xs text-[#2C3327] bg-[#FDFCF8] outline-hidden focus:ring-2 focus:ring-[#4A5D3B]"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              {(['ALL', 'PUBLISHED', 'DRAFT', 'DISABLED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    statusFilter === st
                      ? 'bg-[#4A5D3B] text-[#FFFFFF]'
                      : 'bg-[#F4F6F0] text-[#5C6652] hover:bg-[#E8EAE2]'
                  }`}
                >
                  {st === 'ALL' && 'সবগুলো'}
                  {st === 'PUBLISHED' && 'পাবলিশড'}
                  {st === 'DRAFT' && 'ড্রাফট'}
                  {st === 'DISABLED' && 'ডিজেবল্ড'}
                </button>
              ))}
            </div>
          </div>

          {/* Pages Table */}
          <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#2C3327]">
                <thead className="bg-[#F4F6F0] border-b border-[#D9DED1] text-[#5C6652] font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="px-6 py-4">পেজের নাম ও স্লাগ (Title & Slug)</th>
                    <th className="px-4 py-4">পেজ টাইপ</th>
                    <th className="px-4 py-4">টেমপ্লেট</th>
                    <th className="px-4 py-4">স্ট্যাটাস</th>
                    <th className="px-4 py-4">নেভিগেশন</th>
                    <th className="px-6 py-4 text-right">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#D9DED1]/60">
                  {filteredPages.map((page) => (
                    <tr key={page.id} className="hover:bg-[#FDFCF8] transition-colors">
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="font-bold text-sm text-[#2C3327] flex items-center gap-2">
                            <span>{page.titleBn || page.titleEn}</span>
                            {page.isSystemPage && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                                Core System
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-[#5C6652] font-sans">
                            {page.titleEn}
                          </div>
                          <div className="text-[11px] font-mono text-[#4A5D3B]">
                            /page/{page.slug}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-full bg-[#E8EAE2] text-[#4A5D3B] font-semibold text-[10px]">
                          {page.pageType}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span className="text-[#5C6652] font-medium">
                          {page.template}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            page.status === 'PUBLISHED'
                              ? 'bg-[#25D366]/15 text-[#25D366]'
                              : page.status === 'DRAFT'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {page.status === 'PUBLISHED' ? 'পাবলিশড (Live)' : page.status === 'DRAFT' ? 'ড্রাফট (Draft)' : 'ডিজেবল্ড'}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1.5 text-[10px]">
                          <span className={`px-2 py-0.5 rounded-md ${page.showInHeaderNav ? 'bg-[#4A5D3B]/10 text-[#4A5D3B] font-bold' : 'text-gray-400'}`}>
                            Header: {page.showInHeaderNav ? 'Yes' : 'No'}
                          </span>
                          <span className={`px-2 py-0.5 rounded-md ${page.showInFooterNav ? 'bg-[#4A5D3B]/10 text-[#4A5D3B] font-bold' : 'text-gray-400'}`}>
                            Footer: {page.showInFooterNav ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => onPreviewPage && onPreviewPage(page)}
                            title="লাইভ প্রিভিউ দেখুন"
                            className="p-2 rounded-xl bg-[#F4F6F0] hover:bg-[#E8EAE2] text-[#4A5D3B] transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleEdit(page)}
                            title="এডিট করুন"
                            className="p-2 rounded-xl bg-[#F4F6F0] hover:bg-[#E8EAE2] text-[#2C3327] transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicate(page)}
                            title="ডুপ্লিকেট"
                            className="p-2 rounded-xl bg-[#F4F6F0] hover:bg-[#E8EAE2] text-[#5C6652] transition-colors"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {!page.isSystemPage && (
                            <button
                              onClick={() => handleDelete(page.id, page.isSystemPage)}
                              title="মুছে ফেলুন"
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HOME PAGE CONTENT RULES (ARCHIVE VS FEATURED) */}
      {activeTab === 'HOME_PAGE_RULES' && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
          <div className="pb-4 border-b border-[#D9DED1]">
            <h3 className="font-serif text-lg font-bold text-[#2C3327] flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#4A5D3B]" />
              <span>হোমপেজ কেস স্টাডি ও কনটেন্ট ডিসপ্লে রুলস</span>
            </h3>
            <p className="text-xs text-[#5C6652] mt-0.5">
              হোমপেজে ১০০+ কেস স্টাডির ভিড় না করে শুধুমাত্র নির্বাচিত ৩টি বা ৪টি ফিচার্ড রিপোর্ট দেখান এবং পূর্ণাঙ্গ রিপোর্টের জন্য পৃথক <code className="font-mono bg-[#F4F6F0] px-1 py-0.5 rounded">/page/case-studies</code> পেজ ব্যবহার করুন।
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Rule 1: Limit count */}
            <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-3">
              <label className="text-xs font-bold text-[#2C3327] block">
                হোমপেজে সর্বোচ্চ কতটি কেস স্টাডি প্রদর্শিত হবে?
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={homeSettings.featuredCaseStudiesLimit || 3}
                onChange={(e) => setHomeSettings({ ...homeSettings, featuredCaseStudiesLimit: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-sm font-bold text-[#2C3327]"
              />
              <p className="text-[11px] text-[#5C6652]">
                প্রস্তাবিত: ৩টি বা ৪টি কার্ড (যাতে হোমপেজের স্পিড ও লোডিং দ্রুত থাকে)।
              </p>
            </div>

            {/* Rule 2: Show only featured toggle */}
            <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-3">
              <label className="text-xs font-bold text-[#2C3327] block">
                শুধুমাত্র 'Featured on Home' মার্ক করা কেস স্টাডি দেখান:
              </label>
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setHomeSettings({ ...homeSettings, showOnlyFeaturedCaseStudies: !homeSettings.showOnlyFeaturedCaseStudies })}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    homeSettings.showOnlyFeaturedCaseStudies
                      ? 'bg-[#4A5D3B] text-white'
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {homeSettings.showOnlyFeaturedCaseStudies ? 'সক্রিয় (Featured Only)' : 'সকল কেস স্টাডি দেখাবে'}
                </button>
              </div>
              <p className="text-[11px] text-[#5C6652]">
                চালু রাখলে শুধুমাত্র এডমিনের স্টার বা ফিচার্ড মার্ক করা রিপোর্ট হোমপেজে থাকবে।
              </p>
            </div>

            {/* Rule 3: Headline BN & EN */}
            <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-3">
              <label className="text-xs font-bold text-[#2C3327] block">
                কেস স্টাডি সেকশন হেডলাইন (বাংলা):
              </label>
              <input
                type="text"
                value={homeSettings.caseStudiesHeadlineBn || ''}
                onChange={(e) => setHomeSettings({ ...homeSettings, caseStudiesHeadlineBn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs"
              />
            </div>

            <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-3">
              <label className="text-xs font-bold text-[#2C3327] block">
                কেস স্টাডি সেকশন হেডলাইন (English):
              </label>
              <input
                type="text"
                value={homeSettings.caseStudiesHeadlineEn || ''}
                onChange={(e) => setHomeSettings({ ...homeSettings, caseStudiesHeadlineEn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs"
              />
            </div>

            {/* Rule 4: CTA View All Button Text */}
            <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-3">
              <label className="text-xs font-bold text-[#2C3327] block">
                "সকল কেস স্টাডি দেখুন" বাটন টেক্সট (বাংলা):
              </label>
              <input
                type="text"
                value={homeSettings.viewAllCaseStudiesButtonTextBn || 'সকল কেস স্টাডি ও ভেরিফায়েড রিপোর্ট দেখুন →'}
                onChange={(e) => setHomeSettings({ ...homeSettings, viewAllCaseStudiesButtonTextBn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs"
              />
            </div>

            <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-3">
              <label className="text-xs font-bold text-[#2C3327] block">
                "View All Case Studies" Button Text (English):
              </label>
              <input
                type="text"
                value={homeSettings.viewAllCaseStudiesButtonTextEn || 'View All 100+ Case Studies & Reports →'}
                onChange={(e) => setHomeSettings({ ...homeSettings, viewAllCaseStudiesButtonTextEn: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-[#D9DED1] flex justify-end">
            <button
              onClick={handleSaveHomeSettings}
              className="px-6 py-2.5 rounded-xl bg-[#4A5D3B] text-white text-xs font-bold hover:bg-[#3A4533] transition-all flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>হোমপেজ সেটিংস সেভ করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 3: CREATE / EDIT PAGE (WORDPRESS-LIKE EDITOR) */}
      {activeTab === 'CREATE_EDIT' && editingPage && (
        <div className="bg-[#FFFFFF] p-6 sm:p-8 rounded-3xl border border-[#D9DED1] shadow-2xs space-y-6">
          
          <div className="flex items-center justify-between pb-4 border-b border-[#D9DED1]">
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C3327] flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-[#4A5D3B]" />
                <span>{editingPage.titleBn || editingPage.titleEn || 'নতুন পেজ তৈরি করুন'}</span>
              </h3>
              <p className="text-xs text-[#5C6652]">
                ওয়ার্ডপ্রেসের মতোই টাইটেল, স্লাগ, কনটেন্ট, মেটা এসইও এবং পাবলিশিং স্ট্যাটাস কনফিগার করুন।
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('ALL_PAGES')}
                className="px-4 py-2 rounded-xl border border-[#D9DED1] text-xs font-semibold text-[#5C6652] hover:bg-[#F4F6F0]"
              >
                বাতিল করুন
              </button>

              <button
                onClick={() => onPreviewPage && onPreviewPage(editingPage)}
                className="px-4 py-2 rounded-xl bg-[#F4F6F0] hover:bg-[#E8EAE2] text-[#4A5D3B] text-xs font-bold flex items-center gap-1.5"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>প্রিভিউ</span>
              </button>

              <button
                onClick={handleSavePage}
                className="px-6 py-2 rounded-xl bg-[#4A5D3B] text-white text-xs font-bold hover:bg-[#3A4533] flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>সেভ ও পাবলিশ</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Titles and Rich Content */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Titles (EN & BN) */}
              <div className="space-y-4 p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1]">
                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1">
                    পেজের নাম (বাংলা - Page Title Bangla)*
                  </label>
                  <input
                    type="text"
                    value={editingPage.titleBn}
                    onChange={(e) => setEditingPage({ ...editingPage, titleBn: e.target.value })}
                    placeholder="যেমন: সকল কেস স্টাডিজ ও ভেরিফায়েড রিপোর্ট"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DED1] text-sm font-bold text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1">
                    Page Title (English)*
                  </label>
                  <input
                    type="text"
                    value={editingPage.titleEn}
                    onChange={(e) => {
                      const val = e.target.value;
                      const autoSlug = editingPage.slug || val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
                      setEditingPage({ ...editingPage, titleEn: val, slug: autoSlug });
                    }}
                    placeholder="e.g. Verified ROAS Case Studies Archive"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#D9DED1] text-sm font-bold text-[#2C3327]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1">
                    URL Slug (পারমালিংক - Permalinks)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#8A957F]">/page/</span>
                    <input
                      type="text"
                      value={editingPage.slug}
                      onChange={(e) => setEditingPage({ ...editingPage, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                      placeholder="case-studies"
                      className="flex-1 px-3 py-2 rounded-xl border border-[#D9DED1] font-mono text-xs text-[#4A5D3B] font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Main Content (Bilingual) */}
              <div className="space-y-4 p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1]">
                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1">
                    মূল কনটেন্ট বিবরণ (বাংলা - Rich Markdown Support)
                  </label>
                  <textarea
                    rows={8}
                    value={editingPage.contentBn}
                    onChange={(e) => setEditingPage({ ...editingPage, contentBn: e.target.value })}
                    placeholder="পেজের বিস্তারিত বিবরণ, প্যারাগ্রাফ বা ইনফরমেশন লিখুন..."
                    className="w-full p-4 rounded-xl border border-[#D9DED1] text-xs text-[#2C3327] leading-relaxed"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1">
                    Page Content Body (English - Markdown Support)
                  </label>
                  <textarea
                    rows={8}
                    value={editingPage.contentEn}
                    onChange={(e) => setEditingPage({ ...editingPage, contentEn: e.target.value })}
                    placeholder="Write detailed markdown content for this page..."
                    className="w-full p-4 rounded-xl border border-[#D9DED1] text-xs text-[#2C3327] leading-relaxed"
                  />
                </div>
              </div>

              {/* SEO Meta Box */}
              <div className="p-5 rounded-2xl bg-[#F4F6F0] border border-[#D9DED1] space-y-4">
                <div className="text-xs font-bold text-[#2C3327] flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-[#4A5D3B]" />
                  <span>সার্চ ইঞ্জিন অপটিমাইজেশন (SEO Meta Settings)</span>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5C6652] block mb-1">Meta SEO Title:</label>
                  <input
                    type="text"
                    value={editingPage.seoTitle || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seoTitle: e.target.value })}
                    placeholder="e.g. Verified Case Studies | Sonjoy Sarkar"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5C6652] block mb-1">Meta Description:</label>
                  <textarea
                    rows={2}
                    value={editingPage.seoDescription || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seoDescription: e.target.value })}
                    placeholder="Short snippet for Google search previews (150-160 chars)"
                    className="w-full p-3 rounded-xl border border-[#D9DED1] text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#5C6652] block mb-1">Meta Keywords (কমা দিয়ে আলাদা করুন):</label>
                  <input
                    type="text"
                    value={editingPage.seoKeywords || ''}
                    onChange={(e) => setEditingPage({ ...editingPage, seoKeywords: e.target.value })}
                    placeholder="tiktok ads bangladesh, roas case studies, performance marketing dhaka"
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs bg-white"
                  />
                </div>
              </div>

            </div>

            {/* Right Sidebar: Publishing Attributes & Controls */}
            <div className="space-y-6">
              
              {/* Publish Box */}
              <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-[#2C3327] pb-2 border-b border-[#D9DED1]">
                  পাবলিশিং স্ট্যাটাস ও ভিজিবিলিটি
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1.5">
                    স্ট্যাটাস (Page Status):
                  </label>
                  <select
                    value={editingPage.status}
                    onChange={(e) => setEditingPage({ ...editingPage, status: e.target.value as PageStatus })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs font-bold text-[#2C3327] bg-white"
                  >
                    <option value="PUBLISHED">🟢 Published (সরাসরি লাইভ)</option>
                    <option value="DRAFT">🟡 Draft (খসড়া / প্রিভিউ মোড)</option>
                    <option value="DISABLED">🔴 Disabled (বন্ধ থাকবে)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1.5">
                    পেজ টাইপ (Functional Layout Engine):
                  </label>
                  <select
                    value={editingPage.pageType}
                    onChange={(e) => setEditingPage({ ...editingPage, pageType: e.target.value as PageType })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs font-bold text-[#2C3327] bg-white"
                  >
                    <option value="CUSTOM_CONTENT">📄 Custom Content Article</option>
                    <option value="CASE_STUDIES_ARCHIVE">📊 Full Case Studies Archive</option>
                    <option value="SERVICES_ARCHIVE">💼 Performance Services Catalog</option>
                    <option value="TIKTOK_PLAYBOOK">📱 TikTok Ads Playbook</option>
                    <option value="FACEBOOK_ADS">🎯 Meta & Facebook Ads Guide</option>
                    <option value="CONTACT_STANDALONE">📞 Contact & Strategy Booking</option>
                    <option value="ABOUT_SONJOY">👤 About Sonjoy Sarkar Bio</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1.5">
                    পেজ টেমপ্লেট:
                  </label>
                  <select
                    value={editingPage.template}
                    onChange={(e) => setEditingPage({ ...editingPage, template: e.target.value as PageTemplate })}
                    className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs bg-white"
                  >
                    <option value="CONTAINED">Contained Layout (Clean)</option>
                    <option value="FULL_WIDTH">Full Width Layout</option>
                    <option value="LANDING">High-Converting Landing Page</option>
                  </select>
                </div>

                {/* Nav Visibility Toggles */}
                <div className="pt-2 border-t border-[#D9DED1] space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPage.showInHeaderNav}
                      onChange={(e) => setEditingPage({ ...editingPage, showInHeaderNav: e.target.checked })}
                      className="rounded border-[#D9DED1] text-[#4A5D3B] focus:ring-[#4A5D3B]"
                    />
                    <span className="text-xs text-[#2C3327] font-medium">হেডার নেভিগেশন বারে দেখান</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingPage.showInFooterNav}
                      onChange={(e) => setEditingPage({ ...editingPage, showInFooterNav: e.target.checked })}
                      className="rounded border-[#D9DED1] text-[#4A5D3B] focus:ring-[#4A5D3B]"
                    />
                    <span className="text-xs text-[#2C3327] font-medium">ফুটার লিংক মেন্যুতে দেখান</span>
                  </label>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327] block mb-1">
                    সর্ট অর্ডার (Sort Order):
                  </label>
                  <input
                    type="number"
                    value={editingPage.sortOrder}
                    onChange={(e) => setEditingPage({ ...editingPage, sortOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-1.5 rounded-xl border border-[#D9DED1] text-xs bg-white"
                  />
                </div>
              </div>

              {/* Featured Image Box */}
              <div className="p-5 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-[#2C3327]">
                  ফিচার্ড ইমেজ (Banner Image)
                </div>

                <input
                  type="url"
                  value={editingPage.featuredImage || ''}
                  onChange={(e) => setEditingPage({ ...editingPage, featuredImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl border border-[#D9DED1] text-xs font-mono bg-white"
                />

                {editingPage.featuredImage && (
                  <div className="rounded-xl overflow-hidden border border-[#D9DED1] h-32 bg-[#F4F6F0]">
                    <img
                      src={editingPage.featuredImage}
                      alt="Featured Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
