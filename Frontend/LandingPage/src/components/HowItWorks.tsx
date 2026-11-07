import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, ListTree, GraduationCap } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const steps = [
  {
    num: '01',
    title: 'Bring your syllabus',
    desc: 'Upload a supported file, paste the text, or create the structure yourself. Nothing is locked in yet.',
    icon: FileText,
  },
  {
    num: '02',
    title: 'Make it yours',
    desc: 'Review the proposed structure and edit the tree — rename, add, remove and reorder until it is actually yours.',
    icon: ListTree,
  },
  {
    num: '03',
    title: 'Study from it',
    desc: 'Track completion, keep materials and notes nearby, and use optional assistance only when you need it.',
    icon: GraduationCap,
  },
];

export function HowItWorks() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-hw]', { opacity: 1, y: 0, scaleX: 1 });
        return;
      }
      gsap.from('[data-hw="head"]', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      });
      gsap.from('[data-hw="step"]', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.18,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-hw="steps"]', start: 'top 75%' },
      });
      // Draw the connecting line as the visitor scrolls
      gsap.fromTo(
        '[data-hw="line"]',
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-hw="steps"]',
            start: 'top 70%',
            end: 'bottom 70%',
            scrub: 1,
          },
        }
      );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="how" className="relative py-28 sm:py-36 bg-surface/60 border-y border-line">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="max-w-2xl">
          <div data-hw="head" className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-4">
            How StudyOS works
          </div>
          <h2 data-hw="head" className="font-display font-light text-display-md text-ink text-balance">
            Three steps. Then the syllabus is yours.
          </h2>
        </div>

        <div data-hw="steps" className="relative mt-16">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-7 left-[16.66%] right-[16.66%] h-px bg-line">
            <div
              data-hw="line"
              className="h-full origin-left bg-gradient-to-r from-accent via-accent to-done"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-10 md:gap-6">
            {steps.map((s) => (
              <div key={s.num} data-hw="step" className="relative flex flex-col items-start">
                <div className="relative z-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-line bg-surface text-accent shadow-[0_4px_18px_-10px_rgba(98,104,201,0.4)]">
                  <s.icon className="h-6 w-6" strokeWidth={1.6} />
                </div>
                <div className="mt-5 font-display text-[0.78rem] text-ink-secondary tabular-nums">
                  {s.num}
                </div>
                <h3 className="mt-1 font-display text-xl sm:text-2xl text-ink leading-tight">
                  {s.title}
                </h3>
                <p className="mt-2.5 text-[0.92rem] text-ink-secondary leading-relaxed max-w-xs">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
