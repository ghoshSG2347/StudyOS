import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Hero3D from './Hero3D';
import { ArrowRight, Sparkles, CheckCircle2, FileText, ChevronDown, Zap, ShieldCheck } from 'lucide-react';

export default function Hero({ onOpenDemo }) {
  const containerRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      tl.fromTo('.hero-badge',
        { opacity: 0, y: 30, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'back.out(1.7)' }
      )
      .fromTo('.hero-headline-1',
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.hero-headline-drama',
        { opacity: 0, y: 45, rotate: -2 },
        { opacity: 1, y: 0, rotate: 0, duration: 0.9, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.hero-subtext',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
        '-=0.5'
      )
      .fromTo('.hero-actions',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' },
        '-=0.4'
      )
      .fromTo('.hero-floating-card',
        { opacity: 0, x: 40, scale: 0.92 },
        { opacity: 1, x: 0, scale: 1, stagger: 0.15, duration: 0.8, ease: 'power2.out' },
        '-=0.4'
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative min-h-[100dvh] w-full flex items-center justify-center overflow-hidden pt-28 pb-16 px-4 sm:px-8 lg:px-16"
    >
      {/* 3D Knowledge Polyhedron Canvas */}
      <Hero3D />

      {/* Atmospheric Background Gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-[#FAFAFD] pointer-events-none z-0" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-200/40 via-purple-200/30 to-amber-200/20 blur-3xl rounded-full pointer-events-none z-0 animate-glow" />

      {/* Hero Content Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        
        {/* Left / Main Typography Column */}
        <div ref={contentRef} className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Top Pill Badge */}
          <div className="hero-badge inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 shadow-sm text-indigo-700 text-xs sm:text-sm font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-ping" />
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>AI Document Intelligence &bull; Human Verified</span>
          </div>

          {/* Line 1: Bold Action Headline */}
          <h1 className="hero-headline-1 font-display font-extrabold tracking-tight text-slate-900 text-4xl sm:text-6xl lg:text-[4.2rem] leading-[1.08] mb-1">
            Turn Chaos Into
          </h1>

          {/* Line 2: The Drama Line (Massive Serif Italic) */}
          <div className="hero-headline-drama font-drama font-normal text-4xl sm:text-6xl lg:text-[4.6rem] leading-[1.05] tracking-normal mb-6 text-slate-900">
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500 bg-clip-text text-transparent underline decoration-amber-400 decoration-wavy decoration-2">
              Living Mastery.
            </span>
          </div>

          {/* Line 3: Exact Brand Description */}
          <p className="hero-subtext text-slate-600 text-base sm:text-lg lg:text-xl font-normal leading-relaxed max-w-xl mb-8">
            Upload any messy syllabus PDF or scanned photo. Our structure-aware AI instantly constructs your hierarchical learning tree — with human-in-the-loop editing and real-time mathematical rollups.
          </p>

          {/* CTA Button Row */}
          <div className="hero-actions flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <a
              href="#simulator"
              className="relative group inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/45 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 w-full sm:w-auto text-center"
            >
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>

            <button
              onClick={onOpenDemo}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-800 font-semibold text-base shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Watch 60s Demo</span>
            </button>
          </div>

          {/* Micro Trust Indicators */}
          <div className="hero-actions flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-slate-200/60 text-xs sm:text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span>Supports PDFs, Photos & Digital Docs</span>
            </div>
          </div>
        </div>

        {/* Right / Interactive Micro-Card Preview */}
        <div className="lg:col-span-5 flex flex-col gap-4 relative">
          
          {/* Floating Card 1: Document Parsing Card */}
          <div className="hero-floating-card glass-card p-5 rounded-3xl shadow-xl shadow-slate-200/60 border border-white/80 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  PDF
                </div>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">Quantum_Chem_Syllabus.pdf</h2>
                  <p className="text-[10px] text-slate-400 font-mono">14 Pages &bull; Scanned &amp; Digital</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-mono font-bold">
                PARSED 100%
              </span>
            </div>

            {/* Hierarchical Tree Preview */}
            <div className="mt-3 space-y-2 text-xs">
              <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="font-semibold text-slate-800">⚛️ Physical Chemistry</span>
                <span className="text-[11px] font-mono font-bold text-indigo-600">3 Modules</span>
              </div>
              <div className="pl-4 space-y-1.5 border-l-2 border-indigo-200 ml-2">
                <div className="p-1.5 rounded-lg bg-indigo-50/70 text-indigo-950 flex items-center justify-between text-[11px]">
                  <span>├─ Module 1: Atomic Structure</span>
                  <span className="font-mono text-[10px] bg-white px-1.5 py-0.5 rounded text-indigo-600 font-bold">85%</span>
                </div>
                <div className="pl-4 text-[10px] text-slate-500 font-mono space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Bohr's Postulates &amp; Spectra</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <div className="w-3 h-3 rounded border border-slate-300 bg-white" />
                    <span>Schrödinger Wave Equation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Card 2: Real-Time Aggregate Mastery Gauge */}
          <div className="hero-floating-card glass-card p-4 rounded-3xl shadow-lg border border-white/80 flex items-center justify-between bg-gradient-to-r from-white to-indigo-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/30">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-mono text-slate-500 font-medium uppercase tracking-wider">Overall Academic Velocity</p>
                <h2 className="text-sm font-bold text-slate-900">4.2x Faster Onboarding</h2>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-display font-black text-indigo-600">82.4%</span>
              <p className="text-[10px] text-emerald-600 font-semibold font-mono">↑ 14% this week</p>
            </div>
          </div>

        </div>
      </div>

      {/* Scroll Indicator */}
      <a
        href="#social-proof"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-slate-400 hover:text-indigo-600 transition-colors pointer-events-auto"
        aria-label="Scroll to next section"
      >
        <span className="text-[10px] font-mono font-medium tracking-widest uppercase">Explore Engine</span>
        <ChevronDown className="w-4 h-4 animate-bounce" />
      </a>
    </section>
  );
}
