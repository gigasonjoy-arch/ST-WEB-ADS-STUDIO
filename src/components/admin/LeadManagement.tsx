import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Phone, 
  Mail, 
  ExternalLink, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  MessageCircle, 
  Plus, 
  Calendar,
  DollarSign,
  FileSpreadsheet,
  RefreshCw
} from 'lucide-react';
import { Lead, LeadSubmission } from '../../types';
import { storageService } from '../../services/storageService';
import { googleWorkspaceService } from '../../services/googleWorkspaceService';

interface LeadManagementProps {
  leads?: (Lead | LeadSubmission)[];
  initialStatusFilter?: string;
  highlightLeadId?: string;
  targetElementId?: string;
  onUpdateLead?: (lead: LeadSubmission) => void;
  onDeleteLead?: (leadId: string) => void;
  onAddLead?: (lead: LeadSubmission) => void;
  onRefresh?: () => void;
}

const normalizeLead = (l: Lead | LeadSubmission): LeadSubmission => {
  if ('phone' in l && 'interestedService' in l) {
    return l as LeadSubmission;
  }
  const rawLead = l as Lead;
  return {
    id: rawLead.id,
    name: rawLead.name,
    phone: rawLead.whatsapp || '',
    email: undefined,
    businessType: rawLead.businessType || 'General Business',
    interestedService: 'TIKTOK_ADS',
    monthlyBudget: rawLead.monthlyBudget,
    notes: rawLead.notes,
    status: (rawLead.status === 'NEW' ? 'NEW' : rawLead.status === 'CONTACTED' ? 'CONTACTED' : rawLead.status === 'QUALIFIED' ? 'QUALIFIED' : (rawLead.status as string) === 'WON' || rawLead.status === 'CONVERTED' ? 'CONVERTED' : 'NEW') as any,
    createdAt: rawLead.createdAt,
    visitorId: rawLead.visitorId
  };
};

export const LeadManagement: React.FC<LeadManagementProps> = ({
  leads: propLeads,
  initialStatusFilter,
  highlightLeadId,
  targetElementId,
  onUpdateLead,
  onDeleteLead,
  onAddLead,
  onRefresh
}) => {
  const [internalLeads, setInternalLeads] = useState<LeadSubmission[]>(() => {
    return storageService.getLeads().map(normalizeLead);
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(initialStatusFilter || 'ALL');
  const [serviceFilter, setServiceFilter] = useState<string>('ALL');

  useEffect(() => {
    if (initialStatusFilter) {
      setStatusFilter(initialStatusFilter);
    }
  }, [initialStatusFilter]);

  // Deep-linking scroll & highlight effect
  useEffect(() => {
    const targetId = targetElementId || (highlightLeadId ? `lead-card-${highlightLeadId}` : null);
    if (targetId) {
      setTimeout(() => {
        const el = document.getElementById(targetId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('bg-[#E8EAE2]/80', 'ring-2', 'ring-[#4A5D3B]', 'transition-all');
          setTimeout(() => {
            el.classList.remove('bg-[#E8EAE2]/80', 'ring-2', 'ring-[#4A5D3B]');
          }, 3500);
        }
      }, 250);
    }
  }, [targetElementId, highlightLeadId]);
  
  const leads = propLeads ? propLeads.map(normalizeLead) : internalLeads;

  const refreshData = () => {
    setInternalLeads(storageService.getLeads().map(normalizeLead));
    if (onRefresh) onRefresh();
  };
  
  // Modal / Drawer state for Lead Note editing
  const [selectedLead, setSelectedLead] = useState<LeadSubmission | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isExportingSheet, setIsExportingSheet] = useState(false);
  const [exportedSheetUrl, setExportedSheetUrl] = useState<string | null>(null);

  // New Lead Form state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newBusinessType, setNewBusinessType] = useState('Fashion & Apparel');
  const [newService, setNewService] = useState<'TIKTOK_ADS' | 'FACEBOOK_ADS' | 'BOTH'>('TIKTOK_ADS');
  const [newBudget, setNewBudget] = useState('৳২৫,০০০ - ৳৫০,০০০');

  const filteredLeads = leads.filter(l => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (serviceFilter !== 'ALL' && l.interestedService !== serviceFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (l.name || '').toLowerCase().includes(q);
      const matchPhone = (l.phone || (l as any).whatsapp || '').toLowerCase().includes(q);
      const matchEmail = (l.email || '').toLowerCase().includes(q);
      const matchBusiness = (l.businessType || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail && !matchBusiness) return false;
    }
    return true;
  });

  const handleExportToGoogleSheets = async () => {
    try {
      setIsExportingSheet(true);
      if (!googleWorkspaceService.isAuthenticated()) {
        await googleWorkspaceService.authorizeWithGoogle();
      }
      const res = await googleWorkspaceService.exportLeadsToSheet(filteredLeads);
      setExportedSheetUrl(res.spreadsheetUrl);
    } catch (e: any) {
      alert(`Google Sheets Export Notice: ${e.message}`);
    } finally {
      setIsExportingSheet(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Phone', 'Email', 'BusinessType', 'Service', 'MonthlyBudget', 'Status', 'CreatedAt', 'Notes'];
    const rows = filteredLeads.map(l => [
      l.id,
      `"${(l.name || '').replace(/"/g, '""')}"`,
      `"${l.phone || (l as any).whatsapp || ''}"`,
      `"${l.email || ''}"`,
      `"${l.businessType || ''}"`,
      `"${l.interestedService || ''}"`,
      `"${l.monthlyBudget || ''}"`,
      l.status || '',
      l.createdAt || '',
      `"${(l.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveNotes = () => {
    if (!selectedLead) return;
    const updated = { ...selectedLead, notes: editNotes };
    storageService.addLeadNote(selectedLead.id, editNotes);
    if (onUpdateLead) onUpdateLead(updated);
    refreshData();
    setSelectedLead(null);
  };

  const handleCreateNewLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    const lead: LeadSubmission = {
      id: `lead_${Date.now()}`,
      name: newName.trim(),
      phone: newPhone.trim(),
      email: newEmail.trim() || undefined,
      businessType: newBusinessType,
      interestedService: newService,
      monthlyBudget: newBudget,
      status: 'NEW',
      createdAt: new Date().toISOString()
    };

    storageService.captureLead({
      name: lead.name,
      whatsapp: lead.phone,
      businessType: lead.businessType,
      monthlyBudget: lead.monthlyBudget
    });

    if (onAddLead) onAddLead(lead);
    refreshData();
    setIsAddingNew(false);
    setNewName('');
    setNewPhone('');
    setNewEmail('');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      
      {/* Top Header & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#2C3327]">
            লিড ও ক্লায়েন্ট ম্যানেজমেন্ট (CRM)
          </h1>
          <p className="text-xs text-[#5C6652] mt-1">
            মোট {leads.length} টি জমা পড়া অডিট রিকোয়েস্ট ও বিজ্ঞাপন সংক্রান্ত এনকোয়ারি
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-3.5 py-2 bg-[#4A5D3B] text-[#FDFCF8] rounded-xl text-xs font-semibold hover:bg-[#3A4533] flex items-center gap-1.5 shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>ম্যানুয়াল লিড</span>
          </button>

          <button
            onClick={handleExportToGoogleSheets}
            disabled={isExportingSheet}
            className="px-3.5 py-2 bg-[#137333] hover:bg-[#0d5926] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <FileSpreadsheet className={`w-4 h-4 ${isExportingSheet ? 'animate-spin' : ''}`} />
            <span>{isExportingSheet ? 'Google Sheets এ যাচ্ছে...' : 'Google Sheets এ পাঠান'}</span>
          </button>

          {exportedSheetUrl && (
            <a
              href={exportedSheetUrl}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 bg-[#E6F4EA] border border-[#CEEAD6] text-[#137333] rounded-xl text-xs font-bold flex items-center gap-1 hover:bg-[#CEEAD6]"
            >
              <span>শিট ওপেন করুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}

          <button
            onClick={exportToCSV}
            className="px-3.5 py-2 bg-[#FFFFFF] border border-[#D9DED1] text-[#2C3327] rounded-xl text-xs font-semibold hover:bg-[#E8EAE2] flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#4A5D3B]" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#D9DED1] flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8A957F]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="নাম, ফোন নম্বর, ইমেইল বা ব্যবসার নাম দিয়ে খুঁজুন..."
            className="w-full pl-9 pr-4 py-2 bg-[#FDFCF8] border border-[#D9DED1] rounded-xl text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327] font-medium"
          >
            <option value="ALL">সব স্ট্যাটাস</option>
            <option value="NEW">NEW (নতুন)</option>
            <option value="CONTACTED">CONTACTED (যোগাযোগ হয়েছে)</option>
            <option value="QUALIFIED">QUALIFIED (কোয়ালিফাইড)</option>
            <option value="CONVERTED">CONVERTED (কনভার্টেড)</option>
            <option value="NOT_INTERESTED">NOT_INTERESTED</option>
          </select>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327] font-medium"
          >
            <option value="ALL">সব সার্ভিস</option>
            <option value="TIKTOK_ADS">TikTok Ads</option>
            <option value="FACEBOOK_ADS">Facebook Ads</option>
            <option value="BOTH">Dual Funnel</option>
          </select>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-[#2C3327]">
            <thead className="bg-[#F5F1EB] text-[11px] uppercase font-bold text-[#8A957F] border-b border-[#D9DED1]">
              <tr>
                <th className="py-3.5 px-4">নাম ও কন্টাক্ট</th>
                <th className="py-3.5 px-4">বিজনেস ও নিশ</th>
                <th className="py-3.5 px-4">সার্ভিস ও বাজেট</th>
                <th className="py-3.5 px-4">স্ট্যাটাস</th>
                <th className="py-3.5 px-4">তারিখ</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9DED1]">
              {filteredLeads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-xs text-[#8A957F]">
                    কোনো লিড পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredLeads.map((lead) => {
                  const rawPhone = lead.phone || (lead as any).whatsapp || '';
                  const cleanPhone = rawPhone ? rawPhone.replace(/\D/g, '') : '';
                  return (
                    <tr key={lead.id} id={`lead-card-${lead.id}`} className="hover:bg-[#FDFCF8] transition-all">
                      <td className="py-4 px-4">
                        <div className="font-bold text-[#2C3327]">{lead.name}</div>
                        <div className="text-[11px] text-[#5C6652]">{lead.phone}</div>
                        {lead.email && <div className="text-[10px] text-[#8A957F]">{lead.email}</div>}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-semibold text-[#2C3327]">{lead.businessType}</div>
                        {lead.websiteOrPage && (
                          <a
                            href={lead.websiteOrPage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-[#4A5D3B] hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <span>লিংক ভিজিট</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <div className="font-medium text-[#4A5D3B]">{lead.interestedService}</div>
                        <div className="text-[10px] text-[#8A957F]">{lead.monthlyBudget || 'N/A'}</div>
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={lead.status}
                          onChange={(e) => {
                            const newStatus = e.target.value as any;
                            storageService.updateLeadStatus(lead.id, newStatus);
                            if (onUpdateLead) onUpdateLead({ ...lead, status: newStatus });
                            refreshData();
                          }}
                          className={`text-[10px] font-bold rounded-lg px-2.5 py-1 border border-[#D9DED1] ${
                            lead.status === 'NEW'
                              ? 'bg-[#E2725B]/10 text-[#E2725B]'
                              : lead.status === 'CONVERTED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-[#F5F1EB] text-[#2C3327]'
                          }`}
                        >
                          <option value="NEW">NEW</option>
                          <option value="CONTACTED">CONTACTED</option>
                          <option value="QUALIFIED">QUALIFIED</option>
                          <option value="CONVERTED">CONVERTED</option>
                          <option value="NOT_INTERESTED">NOT_INTERESTED</option>
                        </select>
                      </td>

                      <td className="py-4 px-4 text-[11px] text-[#8A957F]">
                        {new Date(lead.createdAt).toLocaleDateString('bn-BD', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`নমস্কার ${lead.name}, আমি সঞ্জয় সরকার (ST Web & Ads Studio)। আপনার অডিট রিকোয়েস্টটি দেখেছি। আপনার ক্যাম্পেইন নিয়ে কথা বলতে পারি?`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366] hover:text-white transition-colors"
                            title="WhatsApp মেসেজ দিন"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => {
                              setSelectedLead(lead);
                              setEditNotes(lead.notes || '');
                            }}
                            className="p-1.5 rounded-lg bg-[#F5F1EB] text-[#5C6652] hover:bg-[#E8EAE2] transition-colors"
                            title="নোট ও বিস্তারিত"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`আপনি কি "${lead.name}" এর লিড মুছে ফেলতে চান?`)) {
                                storageService.deleteLead(lead.id);
                                if (onDeleteLead) onDeleteLead(lead.id);
                                refreshData();
                              }
                            }}
                            className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Notes Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 bg-[#2C3327]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-md w-full p-6 border border-[#D9DED1] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2C3327]">
              লিড নোট ও ফলোআপ আপডেট: {selectedLead.name}
            </h3>

            {selectedLead.calculatorSnapshot && (
              <div className="p-3 bg-[#E8EAE2]/50 rounded-xl text-[11px] text-[#4A5D3B] space-y-0.5">
                <div className="font-bold">ক্যালকুলেটর স্ন্যাপশট:</div>
                <div>বাজেট: ৳{selectedLead.calculatorSnapshot.budgetBDT} ({selectedLead.calculatorSnapshot.durationDays} দিন)</div>
                <div>সম্ভাব্য আউটপুট: {selectedLead.calculatorSnapshot.estimatedActions} টি • ROAS: {selectedLead.calculatorSnapshot.estimatedROAS}x</div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#2C3327]">ইন্টারনাল নোট / মিটিং সামারি:</label>
              <textarea
                rows={4}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl p-3 text-xs text-[#2C3327] focus:outline-none focus:border-[#4A5D3B]"
                placeholder="যেমন: ক্লায়েন্টের সাথে ৩টায় কথা হয়েছে, আগামী রবিবার ক্যাম্পেইন শুরু হবে..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 border border-[#D9DED1] text-xs font-semibold rounded-xl text-[#5C6652]"
              >
                বাতিল
              </button>
              <button
                onClick={handleSaveNotes}
                className="px-5 py-2 bg-[#4A5D3B] text-[#FDFCF8] text-xs font-semibold rounded-xl hover:bg-[#3A4533]"
              >
                সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual New Lead Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 bg-[#2C3327]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] rounded-3xl max-w-md w-full p-6 border border-[#D9DED1] shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-[#2C3327]">
              ম্যানুয়াল লিড এন্ট্রি
            </h3>

            <form onSubmit={handleCreateNewLead} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-[#2C3327]">ক্লায়েন্টের নাম *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  placeholder="নাম"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C3327]">হোয়াটসঅ্যাপ / ফোন নম্বর *</label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  placeholder="01712xxxxxx"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#2C3327]">ইমেইল (অপশনাল)</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  placeholder="email@domain.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#2C3327]">সার্ভিস</label>
                  <select
                    value={newService}
                    onChange={(e) => setNewService(e.target.value as any)}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  >
                    <option value="TIKTOK_ADS">TikTok Ads</option>
                    <option value="FACEBOOK_ADS">Facebook Ads</option>
                    <option value="BOTH">Dual Funnel</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#2C3327]">মাসিক বাজেট</label>
                  <select
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full bg-[#FDFCF8] border border-[#D9DED1] rounded-xl px-3 py-2 text-xs text-[#2C3327]"
                  >
                    <option value="৳১০,০০০ - ৳২৫,০০০">৳১০,০০০ - ৳২৫,০০০</option>
                    <option value="৳২৫,০০০ - ৳৫০,০০০">৳২৫,০০০ - ৳৫০,০০০</option>
                    <option value="৳৫০,০০০ - ৳১,০০,০০০">৳৫০,০০০ - ৳১,০০,০০০</option>
                    <option value="৳১,০০,০০০+">৳১,০০,০০০+</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 border border-[#D9DED1] text-xs font-semibold rounded-xl text-[#5C6652]"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4A5D3B] text-[#FDFCF8] text-xs font-semibold rounded-xl hover:bg-[#3A4533]"
                >
                  যোগ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
