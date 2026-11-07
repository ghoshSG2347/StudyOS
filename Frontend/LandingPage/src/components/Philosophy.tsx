import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function Philosophy() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-phil]', { opacity: 1, y: 0 });
        return;
      }
      gsap.from('[data-phil]', {
        opacity: 0,
        y: 40,
        duration: 1,
        stagger: 0.15,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 70%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative py-32 sm:py-44 bg-manifesto-bg text-manifesto-text overflow-hidden"
    >
      {/* subtle texture */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <div className="relative mx-auto max-w-5xl px-5 sm:px-8 text-center">
        <div data-phil className="text-[0.78rem] uppercase tracking-[0.2em] text-accent/90 font-medium mb-6">
          Philosophy
        </div>

        <p data-phil className="font-display font-light text-manifesto-muted text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto">
          Most study tools organize information.
        </p>

        <h2 data-phil className="mt-6 font-display font-light text-[clamp(2rem,6vw,4.5rem)] leading-[1.05] text-balance text-manifesto-text">
          StudyOS organizes the syllabus
          <br className="hidden sm:block" />{' '}
          <span className="italic text-accent">around which</span> the information belongs.
        </h2>

        <div data-phil className="mt-10 h-px w-24 mx-auto bg-manifesto-text/20" />

        <p data-phil className="mt-10 font-display text-lg sm:text-xl text-manifesto-muted leading-relaxed max-w-xl mx-auto">
          Your files shouldn't be the starting point.
          <br />
          Your syllabus should.
        </p>
      </div>
    </section>
  );
}
