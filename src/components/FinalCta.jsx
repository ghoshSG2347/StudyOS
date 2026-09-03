import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';

gsap.registerPlugin(ScrollTrigger);

export default function FinalCta() {
  const containerRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.cta-box',
        { scale: 0.95, opacity: 0, y: 30 },
        {
          scale: 1,
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleCtaClick = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.6 }
    });
  };

  return (
    <section ref={containerRef} className="py-20 px-4 sm:px-8 lg:px-16 bg-[#FAFAFD]">
      <div className="max-w-6xl mx-auto">
        
        <div className="cta-box rounded-[3rem] bg-gradient-to-tr from-indigo-700 via-indigo-600 to-purple-600 text-white p-8 sm:p-16 lg:p-20 text-center relative overflow-hidden shadow-2xl shadow-indigo-600/30">
          
          {/* Background Ambient Glows */}
          <div className="absolute -top-24 -right-24 w-80 h-80 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-indigo-100 text-xs font-mono font-bold mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>TRANSFORM YOUR SEMESTER TODAY</span>
            </div>

            <h2 className="font-display font-black text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.1] text-white mb-6">
              Stop letting course PDFs <br />
              <span className="font-drama text-amber-300 font-normal">rule your schedule</span>.
            </h2>

            <p className="text-indigo-100 text-base sm:text-lg leading-relaxed max-w-xl mx-auto mb-10 font-sans">
              Drop your first syllabus document into StudyOS right now. Parse, verify, and start conquering topics in under 60 seconds.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button
                onClick={handleCtaClick}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
              >
                <span>Start Free Trial Now</span>
                <ArrowRight className="w-5 h-5 text-indigo-600" />
              </button>

              <a
                href="#simulator"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-indigo-800/60 hover:bg-indigo-800/80 border border-white/20 text-white font-semibold text-sm backdrop-blur transition-all text-center"
              >
                Test Interactive Simulator
              </a>
            </div>

            {/* Micro guarantees */}
            <div className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-indigo-200 font-sans">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-amber-300" />
                <span>100% Free Forever Tier</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-300" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-indigo-300" />
                <span>Supports Any Academic Format</span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
