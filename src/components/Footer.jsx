import React from 'react';
import { Layers, Sparkles, Heart, Activity, Globe, Share2, ShieldCheck, ExternalLink } from 'lucide-react';


export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#0F172A] text-slate-400 rounded-t-[3.5rem] pt-16 pb-12 px-6 sm:px-12 lg:px-20 border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-12 border-b border-slate-800">
          
          {/* Column 1: Brand & Thesis (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-start">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-md shadow-indigo-500/20">
                <Layers className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="font-display font-black text-xl tracking-tight text-white">
                Study<span className="text-indigo-400">OS</span>
              </span>
            </div>

            <p className="text-sm text-slate-400 leading-relaxed max-w-sm font-sans mb-6">
              The AI-powered syllabus operating system. Reconstructing messy course documents into living, hierarchical learning progress engines with human-in-the-loop integrity.
            </p>

            {/* Live Operational Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono text-slate-300">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>SYSTEM OPERATIONAL &bull; 99.98% UPTIME</span>
            </div>
          </div>

          {/* Column 2: Capabilities (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
              Capabilities
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li><a href="#features" className="hover:text-white transition-colors">Layout-Aware OCR</a></li>
              <li><a href="#features" className="hover:text-white transition-colors">Hierarchy Classifier</a></li>
              <li><a href="#simulator" className="hover:text-white transition-colors">Human-in-the-Loop Gate</a></li>
              <li><a href="#simulator" className="hover:text-white transition-colors">Deterministic Rollups</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Export to Notion/CSV</a></li>
            </ul>
          </div>

          {/* Column 3: Navigation (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-xs font-sans">
              <li><a href="#simulator" className="hover:text-white transition-colors">Live Parser Demo</a></li>
              <li><a href="#manifesto" className="hover:text-white transition-colors">Brand Manifesto</a></li>
              <li><a href="#testimonials" className="hover:text-white transition-colors">Student Case Studies</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing &amp; Plans</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ &amp; Docs</a></li>
            </ul>
          </div>

          {/* Column 4: Institutional Standards & Trust (3 cols) */}
          <div className="lg:col-span-3 flex flex-col justify-between">
            <div>
              <h4 className="font-mono text-xs font-bold text-white uppercase tracking-wider mb-4">
                Architecture Standard
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed font-sans mb-4">
                Built on strict JSON schema trees to prevent AI hallucinations and keep academic progress user-owned.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <a href="#" aria-label="Website" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Share" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Documentation" className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors">
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

        </div>

        {/* Bottom Sub-bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
          <p>© {currentYear} StudyOS Technologies Inc. All academic rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Security Architecture</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
