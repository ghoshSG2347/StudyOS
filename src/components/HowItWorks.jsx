import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileSearch, Sparkles, Sliders, CheckCheck, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function HowItWorks() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.step-card',
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.2,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 75%',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const steps = [
    {
      num: '01',
      title: 'Upload Any Raw Syllabus',
      subtitle: 'PDFs, mobile camera photos, or scanned digital handouts.',
      desc: 'Our optical layout engine detects multi-column course guides, module headers, roman numerals, and messy tabular formats in under 5 seconds.',
      icon: FileSearch,
      accent: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      num: '02',
      title: 'AI Structures, You Verify',
      subtitle: 'Human-in-the-loop schema verification.',
      desc: 'The curriculum intelligence engine classifies Subjects, Modules, and Topics. You review the structured tree, reorder or rename with one click before locking.',
      icon: Sliders,
      accent: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    {
      num: '03',
      title: 'Track With Hierarchical Precision',
      subtitle: 'Micro-topic checks automatically roll up into mastery percentages.',
      desc: 'Eliminate flat todo lists. When you master a subtopic, watch your module, subject, and semester velocity update automatically with deterministic accuracy.',
      icon: CheckCheck,
      accent: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
  ];

  return (
    <section id="how-it-works" ref={containerRef} className="py-24 px-4 sm:px-8 lg:px-16 bg-white border-t border-slate-200/80 relative overflow-hidden">
      
      <div className="max-w-7xl mx-auto">
        
        {/* Section Header */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>THE THREE-STEP GOLDEN PATH</span>
          </div>
          <h2 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-900 tracking-tight leading-tight">
            From Messy Document to <span className="font-drama text-indigo-600 font-normal">Active Mastery</span> in 45 Seconds.
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 max-w-2xl">
            Never waste hours copying syllabus tables into Excel or Notion again. Let the engine do the tedious structural mapping.
          </p>
        </div>

        {/* 3 Steps Grid */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-1/3 inset-x-12 h-0.5 border-t-2 border-dashed border-indigo-200 -z-0" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="step-card glass-card rounded-[2.5rem] p-8 flex flex-col justify-between border border-slate-200/90 shadow-lg hover:shadow-xl transition-all duration-300 relative z-10 bg-white group hover:-translate-y-1"
              >
                <div>
                  {/* Big Monospace Decorative Number */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono font-black text-4xl text-indigo-600/80 tracking-tight">
                      {step.num}
                    </span>
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-xs ${step.accent}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-display font-bold text-xl text-slate-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs font-mono font-semibold text-indigo-600 mb-3">
                    {step.subtitle}
                  </p>
                  <p className="text-sm text-slate-600 leading-relaxed font-sans">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-mono font-semibold text-slate-400">
                  <span>PHASE {idx + 1}</span>
                  <span className="text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                    Next Step <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}

        </div>

      </div>

    </section>
  );
}
