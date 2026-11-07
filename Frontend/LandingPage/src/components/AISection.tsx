import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Sparkles, CornerDownRight, Check } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const examples = [
  {
    selected: 'Binary Search',
    question: 'Explain this at my level.',
    answer:
      'Think of a sorted list. You check the middle, throw away the half that cannot contain your target, and repeat. Each step halves the search space.',
  },
  {
    selected: 'Differential Equations',
    question: 'Give me 5 practice questions.',
    answer: 'Five questions calibrated to first-order linear ODEs, with the answers hidden until you are ready.',
  },
];

export function AISection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-ai]', { opacity: 1, y: 0 });
        return;
      }
      gsap.from('[data-ai]', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="ai" className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_1.2fr] gap-12 lg:gap-16 items-center">
          <div>
            <div data-ai="head" className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-4">
              Optional AI
            </div>
            <h2 data-ai="head" className="font-display font-light text-display-md text-ink text-balance">
              AI when you need it. Not everywhere.
            </h2>
            <p data-ai="head" className="mt-5 text-[1.05rem] text-ink-secondary leading-relaxed max-w-lg">
              Select a syllabus item, ask a question, and get contextual
              assistance — an explanation at your level, a few practice questions,
              or feedback on your notes. The AI knows which topic you are on, and
              uses a material only when you choose to include it.
            </p>

            <ul data-ai="head" className="mt-7 flex flex-col gap-2.5">
              {[
                'StudyOS works fully without AI.',
                'Assistance is tied to the selected topic.',
                'No giant chatbot. No "AI brain." Just a small panel when you ask.',
              ].map((t) => (
                <li key={t} className="flex items-start gap-2.5 text-[0.92rem] text-ink">
                  <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-done/15 text-done">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
          </div>

          {/* Visual — quiet, small contextual panel */}
          <div data-ai="visual" className="relative">
            <div className="rounded-2.5xl border border-line bg-surface p-5 sm:p-6 shadow-[0_2px_8px_rgba(41,48,71,0.06),0_24px_50px_-24px_rgba(41,48,71,0.18)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[0.78rem] text-ink-secondary">
                  <span className="text-[0.7rem] uppercase tracking-[0.14em]">Selected</span>
                  <span className="rounded-md bg-accent-soft px-2 py-0.5 text-ink font-medium">
                    Binary Search
                  </span>
                </div>
                <span className="flex items-center gap-1 text-[0.7rem] text-accent">
                  <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} /> Ask
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {examples.map((ex) => (
                  <div key={ex.question} className="rounded-xl border border-line bg-bg/40 p-3.5">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ink text-white">
                        <Sparkles className="h-2.5 w-2.5" />
                      </span>
                      <p className="rounded-lg bg-hover px-2.5 py-1.5 text-[0.84rem] text-ink">
                        {ex.question}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent text-white">
                        <CornerDownRight className="h-2.5 w-2.5" />
                      </span>
                      <p className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[0.84rem] text-ink-secondary leading-relaxed">
                        {ex.answer}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-hover/50 px-3 py-2 text-[0.78rem] text-ink-secondary">
                <span>Context: Binary Search · Trees · Data Structures</span>
                <span className="text-accent">on topic</span>
              </div>
            </div>

            {/* Subtle note that AI is optional */}
            <div className="mt-4 text-center text-[0.8rem] text-ink-secondary/80">
              You can ignore this panel entirely. StudyOS still works.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
