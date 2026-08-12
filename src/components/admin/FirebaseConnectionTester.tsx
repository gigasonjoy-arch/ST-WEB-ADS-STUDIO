import React, { useState, useEffect } from 'react';
import { FirebaseTestReport } from '../../types';
import { FirebaseDiagnosticService } from '../../services/firebaseDiagnosticService';
import { 
  Database, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  RefreshCw, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Server, 
  Key, 
  Lock,
  ArrowRight,
  Info,
  Layers
} from 'lucide-react';

interface FirebaseConnectionTesterProps {
  onTestComplete?: (report: FirebaseTestReport) => void;
}

export const FirebaseConnectionTester: React.FC<FirebaseConnectionTesterProps> = ({
  onTestComplete
}) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [report, setReport] = useState<FirebaseTestReport | null>(null);

  const runTest = async () => {
    setIsRunning(true);
    try {
      const result = await FirebaseDiagnosticService.runFullDiagnostic();
      setReport(result);
      if (onTestComplete) {
        onTestComplete(result);
      }
    } catch (err) {
      console.error('Firebase test runner error:', err);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    // Run an initial automated probe on mount
    runTest();
  }, []);

  return (
    <div className="bg-[#FFFFFF] rounded-3xl border border-[#D9DED1] p-6 sm:p-8 shadow-2xs space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#D9DED1]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C3327] flex items-center gap-2">
              <span>ফায়ারবেস ক্লাউড কানেকশন ও ডেটাবেস টেস্ট</span>
              {report && (
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-sans font-bold ${
                    report.isConnected
                      ? 'bg-[#25D366]/15 text-[#25D366]'
                      : 'bg-[#E2725B]/15 text-[#E2725B]'
                  }`}
                >
                  {report.isConnected ? 'কানেক্টেড (LIVE)' : 'অ্যাকশন প্রয়োজন'}
                </span>
              )}
            </h3>
            <p className="text-xs text-[#5C6652] mt-0.5">
              ফায়ারবেস অথ, প্রজেক্ট ক্রেডেনশিয়াল ও ফায়ারস্টোর লাইভ ডেটা রিড/রাইট ডায়াগনস্টিক
            </p>
          </div>
        </div>

        <button
          onClick={runTest}
          disabled={isRunning}
          className={`px-5 py-2.5 rounded-xl bg-[#4A5D3B] text-[#FDFCF8] text-xs font-semibold hover:bg-[#3A4533] transition-all flex items-center gap-2 shadow-xs shrink-0 ${
            isRunning ? 'opacity-60 cursor-not-allowed' : ''
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'টেস্ট চলছে...' : 'সম্পূর্ণ কানেকশন টেস্ট করুন'}</span>
        </button>
      </div>

      {/* Overview Status Banner */}
      {report && (
        <div
          className={`p-5 rounded-2xl border ${
            report.isConnected
              ? 'bg-[#E8EAE2]/60 border-[#4A5D3B]/40 text-[#2C3327]'
              : 'bg-[#E2725B]/5 border-[#E2725B]/20 text-[#2C3327]'
          }`}
        >
          <div className="flex items-start gap-3">
            {report.isConnected ? (
              <CheckCircle2 className="w-5 h-5 text-[#4A5D3B] shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-[#E2725B] shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="text-sm font-bold">
                {report.summaryBn}
              </div>
              <div className="text-xs text-[#5C6652]">
                {report.summaryEn}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step-by-Step Probe Results */}
      {report && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-[#8A957F] uppercase tracking-wider">
            স্টেপ-বাই-স্টেপ ভ্যালিডেশন রিপোর্ট (৪টি কোর স্টেপ)
          </div>

          <div className="grid grid-cols-1 gap-3">
            {report.steps.map((step, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#2C3327]">
                      {step.stepBn}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        step.status === 'SUCCESS'
                          ? 'bg-[#25D366]/15 text-[#25D366]'
                          : step.status === 'FAILED'
                          ? 'bg-[#E2725B]/15 text-[#E2725B]'
                          : 'bg-[#8A957F]/15 text-[#5C6652]'
                      }`}
                    >
                      {step.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5C6652]">
                    {step.detail}
                  </div>
                </div>

                {step.durationMs !== undefined && (
                  <div className="text-[10px] text-[#8A957F] font-mono shrink-0">
                    {step.durationMs}ms
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Root Cause & Step-by-Step Fix Action Plan (If Permission Denied) */}
      {report && !report.isConnected && report.overallStatus === 'PERMISSION_DENIED' && (
        <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <Lock className="w-5 h-5 text-amber-600" />
            <span>ফায়ারস্টোর সিকিউরিটি রুলস আপডেট প্রয়োজন (Rules Action Required):</span>
          </div>

          <div className="text-xs text-[#2C3327] space-y-1.5 leading-relaxed">
            <p>
              <strong>স্ট্যাটাস: </strong>
              ফায়ারস্টোর ডেটাবেস <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-[11px]">(default)</code> সফলভাবে সক্রিয় ও কানেক্টেড হয়েছে! কিন্তু ফায়ারবেস কনসোলের <strong>Rules</strong> বর্তমানে ডেটা রিড ও রাইট পারমিশন আটকে দিচ্ছে।
            </p>
            <p className="text-[#5C6652]">
              The Firestore database instance is reachable, but client read/write operations require updating the Security Rules in Firebase Console.
            </p>
          </div>

          {/* Copyable Rules Snippet */}
          <div className="space-y-2 pt-2 border-t border-amber-200/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900">
                ফায়ারবেস কনসোলের জন্য সিকিউরিটি রুলস কোড:
              </span>
              <button
                onClick={() => {
                  const rules = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n    match /{document=**} {\n      allow read, write: if true;\n    }\n  }\n}`;
                  navigator.clipboard.writeText(rules);
                  alert('রুলস কোড কপি করা হয়েছে! এখন ফায়ারবেস কনসোলের Rules ট্যাবে পেস্ট করে Publish বাটনে ক্লিক করুন।');
                }}
                className="px-3 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-semibold hover:bg-amber-700 transition-colors flex items-center gap-1.5"
              >
                <span>কপি করুন (Copy Rules)</span>
              </button>
            </div>

            <pre className="p-3 bg-[#2C3327] text-[#FDFCF8] rounded-xl font-mono text-[11px] overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`}
            </pre>
          </div>

          {/* Action Steps */}
          <div className="space-y-2 pt-2 border-t border-amber-200/80">
            <div className="text-xs font-bold text-amber-900">
              কীভাবে রুলস আপডেট করবেন (সহজ ৩টি ধাপ):
            </div>

            <ol className="space-y-2 text-xs text-[#2C3327] list-decimal list-inside leading-relaxed font-medium">
              {report.recommendedActionBn.map((action, i) => (
                <li key={i} className="pl-1">
                  {action}
                </li>
              ))}
            </ol>
          </div>

          {/* Quick Action Button to Firebase Console Rules */}
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={`https://console.firebase.google.com/project/${report.projectId}/firestore/rules`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>ফায়ারবেস কনসোলে Rules খুলুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={runTest}
              className="px-5 py-2.5 rounded-xl bg-[#FFFFFF] border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>পাবলিশ শেষে পুনরায় টেস্ট করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Root Cause & Step-by-Step Fix Action Plan (If Failed / Database Not Initialized) */}
      {report && !report.isConnected && report.overallStatus === 'DATABASE_NOT_INITIALIZED' && (
        <div className="p-6 rounded-3xl bg-amber-50/70 border border-amber-200 space-y-4">
          <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <span>সমস্যার মূল কারণ ও সমাধান (Root Cause Analysis & Fix):</span>
          </div>

          <div className="text-xs text-[#2C3327] space-y-2 leading-relaxed">
            <p>
              <strong>কারণ: </strong>
              {report.rootCauseBn}
            </p>
            <p className="text-[#5C6652]">
              {report.rootCauseEn}
            </p>
          </div>

          {/* Action Steps */}
          <div className="space-y-2 pt-2 border-t border-amber-200/80">
            <div className="text-xs font-bold text-amber-900">
              কীভাবে ফায়ারস্টোর চালু করবেন (সহজ ৩টি ধাপ):
            </div>

            <ol className="space-y-2 text-xs text-[#2C3327] list-decimal list-inside leading-relaxed font-medium">
              {report.recommendedActionBn.map((action, i) => (
                <li key={i} className="pl-1">
                  {action}
                </li>
              ))}
            </ol>
          </div>

          {/* Quick Action Button to Firebase Console */}
          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href={`https://console.firebase.google.com/project/${report.projectId}/firestore`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-amber-700 text-white text-xs font-semibold hover:bg-amber-800 transition-colors flex items-center gap-2 shadow-xs"
            >
              <span>ফায়ারবেস কনসোলে ডেটাবেস তৈরি করুন</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <button
              onClick={runTest}
              className="px-5 py-2.5 rounded-xl bg-[#FFFFFF] border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>তৈরি শেষে পুনরায় টেস্ট করুন</span>
            </button>
          </div>
        </div>
      )}

      {/* Technical Configuration Metadata */}
      {report && (
        <div className="p-4 rounded-2xl bg-[#FDFCF8] border border-[#D9DED1] text-xs space-y-2 text-[#5C6652]">
          <div className="font-bold text-[#2C3327] flex items-center gap-1.5">
            <Info className="w-4 h-4 text-[#4A5D3B]" />
            <span>প্রজেক্ট কনফিগারেশন বিবরণ</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono">
            <div>Project ID: <span className="text-[#2C3327] font-bold">{report.projectId}</span></div>
            <div>Auth Domain: <span className="text-[#2C3327]">{report.authDomain}</span></div>
          </div>
        </div>
      )}

    </div>
  );
};
