import React, { useState, useEffect } from 'react';
import { 
  Bot, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Search,
  AlertCircle
} from 'lucide-react';
import { storageService } from '../../services/storageService';

interface RobotsTxtViewProps {
  onBackToHome?: () => void;
}

export const RobotsTxtView: React.FC<RobotsTxtViewProps> = ({ onBackToHome }) => {
  const [content, setContent] = useState('');
  const [copied, setCopied] = useState(false);
  const [testPath, setTestPath] = useState('/');
  const [testResult, setTestResult] = useState<{ allowed: boolean; rule: string } | null>(null);

  useEffect(() => {
    const robots = storageService.getRobotsSettings();
    const rawText = robots.content || storageService.generateRobotsTxt();
    setContent(rawText);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'robots.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTestPath = () => {
    const path = testPath.trim();
    if (!path) return;
    
    if (path.startsWith('/admin')) {
      setTestResult({
        allowed: false,
        rule: 'Blocked by directive: Disallow: /admin'
      });
    } else {
      setTestResult({
        allowed: true,
        rule: 'Allowed by directive: Allow: /'
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>মূল ওয়েবসাইটে ফিরে যান</span>
              </button>
            )}
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-indigo-400" />
              <h1 className="text-xl font-bold font-mono tracking-wide">/robots.txt</h1>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                HTTP 200 OK
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'কপি হয়েছে' : 'টেক্সট কপি'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ডাউনলোড (robots.txt)</span>
            </button>
          </div>
        </div>

        {/* Live File Content Display */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
          <div className="bg-slate-900/80 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>File: public/robots.txt</span>
            </div>
            <span>Content-Type: text/plain; charset=utf-8</span>
          </div>

          <pre className="p-6 text-sm text-indigo-200 font-mono leading-relaxed whitespace-pre-wrap selection:bg-indigo-500 selection:text-white">
            {content || 'User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: https://sonjoysarkar.netlify.app/sitemap.xml'}
          </pre>
        </div>

        {/* Interactive Crawler Path Tester */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Search className="w-4 h-4 text-indigo-400" />
            <span>Search Bot & Crawler Path Inspector</span>
          </div>
          <p className="text-xs text-slate-400">
            গুগলবট বা বিং ক্রলার আপনার ওয়েবসাইটের নির্দিষ্ট কোনো পেজ ইন্ডেক্স করতে পারবে কিনা তা যাচাই করুন।
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={testPath}
              onChange={(e) => setTestPath(e.target.value)}
              placeholder="e.g. /services or /admin/dashboard"
              className="flex-1 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
            />
            <button
              onClick={handleTestPath}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
            >
              Test Path
            </button>
          </div>

          {testResult && (
            <div className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
              testResult.allowed 
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300' 
                : 'bg-red-950/70 border-red-800 text-red-300'
            }`}>
              {testResult.allowed ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
              )}
              <span>
                <strong>{testResult.allowed ? 'ALLOWED (ইন্ডেক্সযোগ্য)' : 'BLOCKED (ব্লকড)'}</strong> — {testResult.rule}
              </span>
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
          <span>XML সাইটম্যাপ দেখুন:</span>
          <a
            href="/sitemap.xml"
            className="text-indigo-400 hover:underline flex items-center gap-1 font-mono"
          >
            <span>/sitemap.xml</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

      </div>
    </div>
  );
};
