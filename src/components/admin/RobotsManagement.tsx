import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Save, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ExternalLink, 
  Copy, 
  Check, 
  Download,
  Eye,
  Shield,
  Search,
  Sparkles
} from 'lucide-react';
import { RobotsSettings } from '../../types';
import { storageService } from '../../services/storageService';

export const RobotsManagement: React.FC = () => {
  const [settings, setSettings] = useState<RobotsSettings>({
    content: "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\n\nSitemap: https://stwebads.com/sitemap.xml",
    allowAll: true,
    disallowAdmin: true,
    sitemapUrl: "https://stwebads.com/sitemap.xml",
    customRules: "",
    lastUpdated: new Date().toISOString().split('T')[0]
  });

  const [activeMode, setActiveMode] = useState<'VISUAL' | 'RAW'>('VISUAL');
  const [successMessage, setSuccessMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [testPath, setTestPath] = useState('/');
  const [testResult, setTestResult] = useState<{ allowed: boolean; rule: string } | null>(null);

  useEffect(() => {
    loadSettings();
    const unsubscribe = storageService.subscribe(() => {
      loadSettings();
    });
    return unsubscribe;
  }, []);

  const loadSettings = () => {
    setSettings(storageService.getRobotsSettings());
  };

  const showNotification = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  const handleSave = () => {
    if (activeMode === 'VISUAL') {
      let generated = 'User-agent: *\n';
      if (settings.allowAll) generated += 'Allow: /\n';
      if (settings.disallowAdmin) {
        generated += 'Disallow: /admin\nDisallow: /admin/*\n';
      }
      if (settings.customRules && settings.customRules.trim()) {
        generated += settings.customRules.trim() + '\n';
      }
      if (settings.sitemapUrl) {
        generated += `\nSitemap: ${settings.sitemapUrl.trim()}`;
      }
      const updated = {
        ...settings,
        content: generated.trim()
      };
      setSettings(updated);
      storageService.saveRobotsSettings(updated);
    } else {
      storageService.saveRobotsSettings(settings);
    }
    showNotification('robots.txt configuration saved successfully');
  };

  const handleResetDefault = () => {
    const defaultSettings: RobotsSettings = {
      content: "User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\n\nSitemap: https://stwebads.com/sitemap.xml",
      allowAll: true,
      disallowAdmin: true,
      sitemapUrl: "https://stwebads.com/sitemap.xml",
      customRules: "",
      lastUpdated: new Date().toISOString().split('T')[0]
    };
    setSettings(defaultSettings);
    storageService.saveRobotsSettings(defaultSettings);
    showNotification('Reset robots.txt to standard agency SEO defaults');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(settings.content || storageService.generateRobotsTxt());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const text = settings.content || storageService.generateRobotsTxt();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTestBotPath = () => {
    const cleanPath = testPath.trim() || '/';
    const content = settings.content || storageService.generateRobotsTxt();
    const lines = content.split('\n').map(l => l.trim()).filter(Boolean);

    let isDisallowed = false;
    let matchedRule = 'Default Allowed';

    for (const line of lines) {
      if (line.toLowerCase().startsWith('disallow:')) {
        const pattern = line.substring(9).trim();
        if (pattern === '') continue;
        if (pattern.endsWith('*')) {
          const prefix = pattern.slice(0, -1);
          if (cleanPath.startsWith(prefix)) {
            isDisallowed = true;
            matchedRule = line;
            break;
          }
        } else if (cleanPath.startsWith(pattern) || cleanPath === pattern) {
          isDisallowed = true;
          matchedRule = line;
          break;
        }
      }
    }

    setTestResult({
      allowed: !isDisallowed,
      rule: isDisallowed ? `Blocked by rule: "${matchedRule}"` : 'Allowed for crawler indexing'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-white shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold">Robots.txt Crawler Management</h2>
          </div>
          <p className="text-sm text-slate-400">
            Control search engine crawlers (Googlebot, Bingbot, TikTok Bot) and protect administrative routes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>

          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold shadow-md transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Directives</span>
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

      {/* Mode Switcher */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-2 rounded-xl">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveMode('VISUAL')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeMode === 'VISUAL'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Visual Builder
          </button>
          <button
            onClick={() => setActiveMode('RAW')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
              activeMode === 'RAW'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Raw Editor (robots.txt)
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pr-2">
          <span>Last modified: <strong>{settings.lastUpdated || 'Today'}</strong></span>
          <button
            onClick={handleResetDefault}
            className="text-indigo-400 hover:underline flex items-center gap-1 ml-2"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor */}
        <div className="lg:col-span-2 space-y-6">
          {activeMode === 'VISUAL' ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                Crawler Access Rules
              </h3>

              <div className="space-y-4">
                {/* Allow All Public Pages */}
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Allow Public Pages Indexing</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Enables <code className="text-indigo-300">Allow: /</code> directive for search engines to index all public landing pages.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowAll}
                    onChange={(e) => setSettings({ ...settings, allowAll: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Disallow Admin Dashboard */}
                <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Protect Admin & Security Routes</h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Adds <code className="text-indigo-300">Disallow: /admin</code> and <code className="text-indigo-300">Disallow: /admin/*</code> to prevent crawlers from indexing management screens.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.disallowAdmin}
                    onChange={(e) => setSettings({ ...settings, disallowAdmin: e.target.checked })}
                    className="w-5 h-5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                {/* Sitemap URL Directive */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    XML Sitemap Directive Location
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://stwebads.com/sitemap.xml"
                      value={settings.sitemapUrl}
                      onChange={(e) => setSettings({ ...settings, sitemapUrl: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Points Googlebot, Bingbot, and other web crawlers directly to your XML sitemap.
                  </p>
                </div>

                {/* Custom Rules */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Additional Custom Directives
                  </label>
                  <textarea
                    rows={4}
                    placeholder={"Disallow: /tmp/\nDisallow: /private/\nUser-agent: BadBot\nDisallow: /"}
                    value={settings.customRules}
                    onChange={(e) => setSettings({ ...settings, customRules: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Add custom rules for specific user agents, crawl-delay, or special paths.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Direct robots.txt Content
                </h3>
                <span className="text-xs text-slate-400 font-mono">/robots.txt</span>
              </div>

              <textarea
                rows={12}
                value={settings.content}
                onChange={(e) => setSettings({ ...settings, content: e.target.value })}
                className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-sm text-indigo-300 font-mono focus:outline-none focus:border-indigo-500 leading-relaxed"
                placeholder="User-agent: *\nAllow: /\n..."
              />
            </div>
          )}

          {/* Crawler Tester Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <Search className="w-4 h-4 text-indigo-400" />
              Live URL Crawler Path Tester
            </h3>
            <p className="text-xs text-slate-400">
              Test whether a specific path on your site will be permitted or blocked for crawlers based on your active directives.
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. /page/about or /admin/settings"
                value={testPath}
                onChange={(e) => setTestPath(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={handleTestBotPath}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Test Path
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3.5 rounded-lg border text-xs flex items-center gap-3 ${
                  testResult.allowed
                    ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                    : 'bg-red-950/70 border-red-800 text-red-300'
                }`}
              >
                {testResult.allowed ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <p className="font-bold text-sm">
                    {testResult.allowed ? 'Status: ALLOWED (Indexed)' : 'Status: DISALLOWED (Blocked)'}
                  </p>
                  <p className="opacity-90">{testResult.rule}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Preview Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Eye className="w-4 h-4 text-indigo-400" />
                <span>Live Output Preview</span>
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                Plain Text
              </span>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800/80 rounded-lg text-xs text-slate-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed max-h-72">
              {settings.content || storageService.generateRobotsTxt()}
            </pre>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Public endpoint:</span>
                <a
                  href="/robots.txt"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <span>/robots.txt</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Best Practice Guidelines */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3 text-xs text-slate-400">
            <h4 className="font-semibold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Agency SEO Recommendations
            </h4>
            <ul className="space-y-2 list-disc list-inside">
              <li>Keep public pages accessible so Google indexation occurs smoothly.</li>
              <li>Always protect backend administration paths to avoid indexing confidential screens.</li>
              <li>Ensure the <code className="text-slate-300">Sitemap:</code> directive points to your live HTTPS sitemap URL.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
