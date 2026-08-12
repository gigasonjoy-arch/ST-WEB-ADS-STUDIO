import React, { useState, useEffect } from 'react';
import { 
  Network, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  ArrowLeft, 
  Globe, 
  Calendar, 
  FileCode, 
  Layers,
  Sparkles
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface SitemapXmlViewProps {
  onBackToHome?: () => void;
}

export const SitemapXmlView: React.FC<SitemapXmlViewProps> = ({ onBackToHome }) => {
  const [xmlContent, setXmlContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'VISUAL' | 'RAW_XML'>('VISUAL');
  const [urls, setUrls] = useState<Array<{ loc: string; lastmod: string; changefreq: string; priority: string }>>([]);

  useEffect(() => {
    const rawXml = storageService.generateSitemapXml();
    setXmlContent(rawXml);

    // Parse simple XML structure for visual list
    const parser = new DOMParser();
    try {
      const xmlDoc = parser.parseFromString(rawXml, 'text/xml');
      const urlNodes = xmlDoc.getElementsByTagName('url');
      const parsedUrls: Array<{ loc: string; lastmod: string; changefreq: string; priority: string }> = [];

      for (let i = 0; i < urlNodes.length; i++) {
        const node = urlNodes[i];
        const loc = node.getElementsByTagName('loc')[0]?.textContent || '';
        const lastmod = node.getElementsByTagName('lastmod')[0]?.textContent || '';
        const changefreq = node.getElementsByTagName('changefreq')[0]?.textContent || 'weekly';
        const priority = node.getElementsByTagName('priority')[0]?.textContent || '0.8';
        if (loc) {
          parsedUrls.push({ loc, lastmod, changefreq, priority });
        }
      }
      setUrls(parsedUrls);
    } catch (e) {
      console.warn('XML parse notice:', e);
    }
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(xmlContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>মূল ওয়েবসাইট</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <Network className="w-6 h-6 text-indigo-400" />
              <h1 className="text-xl font-bold font-mono tracking-wide">/sitemap.xml</h1>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {urls.length} Indexed URLs
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'XML কোড কপি'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড (sitemap.xml)</span>
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('VISUAL')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'VISUAL'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ইনডেক্সড পেজ লিস্ট (Visual URLs Table)</span>
          </button>

          <button
            onClick={() => setActiveTab('RAW_XML')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-colors ${
              activeTab === 'RAW_XML'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>র' XML ফাইল (Raw XML Schema)</span>
          </button>
        </div>

        {/* Visual Table */}
        {activeTab === 'VISUAL' && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-white">Googlebot ও সার্চ ক্রলারদের জন্য প্রস্তুত URL তালিকা</span>
              <span>XML Schema: sitemaps.org/schemas/sitemap/0.9</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                    <th className="p-3.5">URL Location (loc)</th>
                    <th className="p-3.5">Last Modified (lastmod)</th>
                    <th className="p-3.5">Change Freq</th>
                    <th className="p-3.5">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {urls.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-mono text-indigo-300">
                        <a
                          href={item.loc}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-1.5"
                        >
                          <Globe className="w-3.5 h-3.5 text-slate-500" />
                          <span>{item.loc}</span>
                          <ExternalLink className="w-3 h-3 text-slate-500" />
                        </a>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.lastmod || '2026-08-12'}</span>
                      </td>
                      <td className="p-3.5 text-slate-400 font-mono">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {item.changefreq}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono text-emerald-400 font-bold">
                        {item.priority}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raw XML View */}
        {activeTab === 'RAW_XML' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>File: public/sitemap.xml</span>
              <span>Content-Type: application/xml; charset=utf-8</span>
            </div>

            <pre className="p-6 text-xs text-emerald-300 font-mono leading-relaxed whitespace-pre-wrap overflow-x-auto selection:bg-emerald-700 selection:text-white">
              {xmlContent}
            </pre>
          </div>
        )}

        {/* Robots.txt link */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>Robots.txt ফাইল দেখুন:</span>
          <a
            href="/robots.txt"
            className="text-indigo-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>/robots.txt</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
