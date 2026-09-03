import React from 'react';
import { Award, BookOpen, CheckCircle, GraduationCap, Sparkles, TrendingUp, Users } from 'lucide-react';

export default function SocialProofBar() {
  const universities = [
    { name: 'MIT EECS', tag: 'B.S. & M.S. Curricula' },
    { name: 'Stanford Engineering', tag: 'CS & AI Tracks' },
    { name: 'IIT Bombay', tag: 'B.Tech / Dual Degree' },
    { name: 'Cambridge University', tag: 'Tripos Framework' },
    { name: 'UC Berkeley', tag: 'EECS 61A/B/C' },
    { name: 'ETH Zürich', tag: 'Master of Science' },
    { name: 'Oxford University', tag: 'Undergraduate Syllabus' },
    { name: 'NUS Singapore', tag: 'Computing Modular System' },
  ];

  const metrics = [
    { label: '50,000+ Syllabi Parsed', icon: BookOpen, highlight: '100% Automated' },
    { label: '99.4% Layout Accuracy', icon: Award, highlight: 'Structure-Aware' },
    { label: '4.92 / 5 Student Rating', icon: GraduationCap, highlight: 'Loved by 28k Students' },
    { label: '< 45s From PDF to Tracker', icon: TrendingUp, highlight: 'Instant Setup' },
    { label: 'Zero Manual Entry', icon: Sparkles, highlight: 'OCR + LLM Tree' },
  ];

  return (
    <section id="social-proof" className="relative w-full py-12 bg-white border-y border-slate-200/80 overflow-hidden">
      
      {/* Edge Gradient Masks for Smooth Infinite Flow */}
      <div className="absolute inset-y-0 left-0 w-24 sm:w-40 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 sm:w-40 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-mono font-semibold tracking-widest uppercase text-slate-400">
          PROVEN ON RIGOROUS ACADEMIC &amp; COMPETITIVE EXAM CURRICULA WORLDWIDE
        </p>
      </div>

      {/* Row 1: Universities Marquee */}
      <div className="relative w-full overflow-hidden mb-6 flex">
        <div className="animate-ticker flex items-center gap-8 whitespace-nowrap">
          {[...universities, ...universities].map((item, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/70 transition-colors"
            >
              <GraduationCap className="w-4 h-4 text-indigo-600 flex-shrink-0" />
              <span className="font-display font-bold text-slate-800 text-sm tracking-tight">
                {item.name}
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-white px-2 py-0.5 rounded-full border border-slate-200/60">
                {item.tag}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Metric Badges Marquee (Opposite Direction or Staggered) */}
      <div className="relative w-full overflow-hidden flex">
        <div className="animate-ticker flex items-center gap-8 whitespace-nowrap" style={{ animationDirection: 'reverse', animationDuration: '38s' }}>
          {[...metrics, ...metrics].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-gradient-to-r from-indigo-50/50 to-purple-50/40 border border-indigo-100"
              >
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {item.label}
                </span>
                <span className="text-[10px] font-mono font-bold text-indigo-600 bg-indigo-100/80 px-2 py-0.5 rounded-full">
                  {item.highlight}
                </span>
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
}
