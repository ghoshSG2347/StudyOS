import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Compass, Sparkles, Target, Zap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Philosophy() {
  const sectionRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Stagger reveal on the manifesto words
      gsap.fromTo('.manifesto-word',
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.035,
          duration: 0.6,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none none',
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const manifestoLead = "Most EdTech tools focus on:";
  const manifestoLeadBody = "flat checklists, generic pomodoro timers, and forcing students to spend entire weekends copy-pasting course pdfs into spreadsheets.";
  const manifestoCore = "We believe the syllabus itself is the operating system of your degree.";

  return (
    <section
      id="manifesto"
      ref={sectionRef}
      className="relative w-full py-28 px-4 sm:px-8 lg:px-16 bg-[#0F172A] text-white overflow-hidden"
    >
      {/* Background Decorative Rings */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-bold mb-8">
          <Compass className="w-3.5 h-3.5 text-indigo-400" />
          <span>OUR CORE PHILOSOPHY</span>
        </div>

        {/* Contrast Comparison Lead */}
        <div className="mb-10 max-w-2xl mx-auto">
          <p className="font-mono text-xs text-amber-400 uppercase tracking-widest mb-2 font-semibold">
            {manifestoLead}
          </p>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-sans line-through decoration-slate-600 decoration-2">
            {manifestoLeadBody}
          </p>
        </div>

        {/* The Massive Drama Core Headline */}
        <div ref={textRef} className="my-10">
          <p className="font-mono text-xs text-indigo-400 uppercase tracking-widest mb-4 font-semibold">
            WHAT WE BUILT INSTEAD:
          </p>
          <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.15] text-slate-100">
            {manifestoCore.split(' ').map((word, i) => {
              const isHighlight = word.toLowerCase().includes('operating') || word.toLowerCase().includes('system');
              return (
                <span
                  key={i}
                  className={`manifesto-word inline-block mr-3 ${
                    isHighlight
                      ? 'font-drama font-normal text-amber-400 underline decoration-indigo-500 decoration-wavy'
                      : ''
                  }`}
                >
                  {word}
                </span>
              );
            })}
          </h2>
        </div>

        {/* 3 Core Manifest Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
              01
            </div>
            <h3 className="font-display font-bold text-base text-white mb-1.5">No Generic AI Prose</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We don't summarize what you already know. We output strict mathematical JSON structures ready for instantaneous hierarchical tracking.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
              02
            </div>
            <h3 className="font-display font-bold text-base text-white mb-1.5">Zero Black Boxes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI shouldn't lock you in. You inspect the extracted tree, drag to reorder modules, and keep 100% human governance over your academic plan.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/80 backdrop-blur-md">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs mb-3">
              03
            </div>
            <h3 className="font-display font-bold text-base text-white mb-1.5">Deterministic Rollups</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Academic progress isn't a vague feeling. It's a calculated hierarchy where subtopic completion drives semester mastery mathematically.
            </p>
          </div>
        </div>

      </div>

    </section>
  );
}
