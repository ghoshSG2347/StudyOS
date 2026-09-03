import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Sparkles, Layers } from 'lucide-react';

export default function PageLoader({ onComplete }) {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const barRef = useRef(null);
  const badgeRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          if (onComplete) onComplete();
        }
      });

      tl.fromTo(badgeRef.current,
        { scale: 0.8, opacity: 0, y: 15 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.7)' }
      )
      .fromTo('.loader-letter',
        { y: 35, opacity: 0, rotateX: -45 },
        { y: 0, opacity: 1, rotateX: 0, stagger: 0.04, duration: 0.6, ease: 'power3.out' },
        '-=0.2'
      )
      .fromTo(barRef.current,
        { scaleX: 0 },
        { scaleX: 1, duration: 0.7, ease: 'power2.inOut' },
        '-=0.3'
      )
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
        delay: 0.15
      });

    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  const brandName = "StudyOS";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#0F172A] text-white px-6 pointer-events-auto"
      style={{ willChange: 'transform' }}
    >
      <div className="flex flex-col items-center max-w-sm w-full text-center">
        {/* Top Badge */}
        <div
          ref={badgeRef}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-mono font-medium mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-400" />
          <span>INITIALIZING SYLLABUS ENGINE</span>
        </div>

        {/* Brand Letters */}
        <div ref={textRef} className="flex items-center justify-center gap-1.5 overflow-hidden py-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 mr-2">
            <Layers className="w-5 h-5 text-white" />
          </div>
          {brandName.split('').map((char, index) => (
            <span
              key={index}
              className="loader-letter font-display font-black text-4xl sm:text-5xl tracking-tight text-white inline-block"
            >
              {char}
            </span>
          ))}
        </div>

        <p className="text-slate-400 text-sm mt-3 font-sans">
          Curriculum Intelligence &bull; Hierarchical Tracking
        </p>

        {/* Loading Progress Line */}
        <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mt-8">
          <div
            ref={barRef}
            className="w-full h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-amber-400 origin-left"
          />
        </div>
      </div>
    </div>
  );
}
