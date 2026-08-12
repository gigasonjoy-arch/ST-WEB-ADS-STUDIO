import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  Globe, 
  FileCode, 
  ListChecks, 
  Calendar, 
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { SitemapSettings, CustomPage, CaseStudy } from '../../types';
import { storageService } from '../../services/storageService';

export const SitemapManagement: React.FC = () => {
  const [settings, setSettings] = useState<SitemapSettings>({
    baseUrl: "https://sonjoysarkar.netlify.app",
    includeCustomPages: true,
    includeServices: true,
    includeCaseStudies: true,
    changefreq: "weekly",
    priority: 0.8,
    lastGenerated: new Date().toISOString().split('T')[0]
  });

  const [customPages, setCustomPages] = useState<CustomPage[]>([]);
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [xmlPreview, setXmlPreview] = useState('');

  useEffect(() => {
    loadData();
    const unsubscribe = storageService.subscribe(() => {
      loadData();
    });
    return unsubscribe;
  }, []);

  const loadData = () => {
    setSettings(storageService.getSitemapSettings());
    setCustomPages(storageService.getCustomPages(false));
    setCaseStudies(storageService.getCaseStudies());
    setXmlPreview(storageService.generateSitemapXml());
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSave = () => {
    storageService.saveSitemapSettings(settings);
    setXmlPreview(storageService.generateSitemapXml());
    showNotification('Sitemap settings and XML schema updated successfully');
  };

  const handleCopy = () => {
    const xml = storageService.generateSitemapXml();
    navigator.clipboard.writeText(xml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const xml = storageService.generateSitemapXml();
    const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate stats
  const totalUrls = useMemo(() => {
    let count = 1; // Core homepage
    if (settings.includeCustomPages) {
      count += customPages.length;
    }
    if (settings.includeCaseStudies) {
      count += caseStudies.length;
    }
    return count;
  }, [settings, customPages, caseStudies]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-teal-500/10 text-teal-400 rounded-lg border border-teal-500/20">
              <Network className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold">XML Sitemap Management</h2>
          </div>
          <p className="text-sm text-slate-400">
            Generate and maintain clean, search-engine-ready XML sitemaps for fast Google, Bing, and Meta crawling.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied XML' : 'Copy XML'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download XML</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save & Regenerate</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-950/70 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-lg flex items-center gap-3 animate-fadeIn text-sm font-medium">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalUrls}</div>
            <div className="text-xs text-slate-400">Total Indexed URLs</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{customPages.length}</div>
            <div className="text-xs text-slate-400">Published Custom Pages</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-white">{settings.lastGenerated || 'Today'}</div>
            <div className="text-xs text-slate-400">Last Generated Date</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" />
              Sitemap Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Canonical Base URL *
                </label>
                <input
                  type="url"
                  placeholder="https://sonjoysarkar.netlify.app"
                  value={settings.baseUrl}
                  onChange={(e) => setSettings({ ...settings, baseUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  The primary domain used for all canonical URL tags.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Change Frequency
                </label>
                <select
                  value={settings.changefreq}
                  onChange={(e) => setSettings({ ...settings, changefreq: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500"
                >
                  <option value="always">Always</option>
                  <option value="hourly">Hourly</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly (Recommended)</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Default Page Priority (0.1 - 1.0)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="1.0"
                  value={settings.priority}
                  onChange={(e) => setSettings({ ...settings, priority: parseFloat(e.target.value) || 0.8 })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-teal-500 font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300">Sections Included in XML</h4>

                <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                  <span className="text-xs text-white">Custom Pages ({customPages.length})</span>
                  <input
                    type="checkbox"
                    checked={settings.includeCustomPages}
                    onChange={(e) => setSettings({ ...settings, includeCustomPages: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg cursor-pointer">
                  <span className="text-xs text-white">Case Studies ({caseStudies.length})</span>
                  <input
                    type="checkbox"
                    checked={settings.includeCaseStudies}
                    onChange={(e) => setSettings({ ...settings, includeCaseStudies: e.target.checked })}
                    className="w-4 h-4 accent-teal-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Search Engine Quick Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs text-slate-400">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Search Engine Submission
            </h4>
            <p className="leading-relaxed">
              Once deployed, submit your sitemap URL directly to Google Search Console and Bing Webmaster Tools:
            </p>
            <div className="space-y-1.5 pt-1">
              <a
                href="https://search.google.com/search-console"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 bg-slate-950 hover:bg-slate-800 rounded text-slate-300 font-medium transition-colors"
              >
                <span>Google Search Console</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-teal-400" />
              </a>
              <a
                href="https://www.bing.com/webmasters"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between p-2 bg-slate-950 hover:bg-slate-800 rounded text-slate-300 font-medium transition-colors"
              >
                <span>Bing Webmaster Tools</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-teal-400" />
              </a>
            </div>
          </div>
        </div>

        {/* XML Preview Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <FileCode className="w-4 h-4 text-teal-400" />
                <span>Live Generated XML Payload</span>
              </div>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                standard sitemap 0.9 schema
              </span>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg text-xs text-teal-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-[500px]">
              {xmlPreview || storageService.generateSitemapXml()}
            </pre>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs text-slate-400">
              <span>Public Live Endpoint:</span>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:underline flex items-center gap-1 font-mono"
              >
                <span>/sitemap.xml</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
