import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FileText,
  Presentation,
  StickyNote,
  Image as ImageIcon,
  Check,
  ChevronRight,
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export function MaterialsSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-mat]', { opacity: 1, y: 0, x: 0 });
        return;
      }
      gsap.from('[data-mat="head"]', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      });
      gsap.from('[data-mat="attach"]', {
        opacity: 0,
        x: 24,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: '[data-mat="visual"]', start: 'top 75%' },
      });
      gsap.from('[data-mat="node"]', {
        opacity: 0,
        y: 14,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-mat="visual"]', start: 'top 70%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative py-28 sm:py-36 bg-surface/60 border-y border-line">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Visual first on large screens */}
          <div data-mat="visual" className="relative order-2 lg:order-1">
            <div className="rounded-2.5xl border border-line bg-surface p-5 sm:p-6 shadow-[0_2px_8px_rgba(41,48,71,0.06),0_24px_50px_-24px_rgba(41,48,71,0.18)]">
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-secondary mb-3">
                Tree
              </div>
              <ul className="flex flex-col gap-1">
                <li data-mat="node" className="flex items-center gap-2 py-1 text-[0.88rem] font-medium text-ink">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-done text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  Data Structures
                </li>
                <li data-mat="node" className="flex items-center gap-2 py-1 pl-6 text-[0.86rem] text-ink-secondary">
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-done text-white">
                    <Check className="h-2.5 w-2.5" strokeWidth={3} />
                  </span>
                  Arrays
                  <ChevronRight className="h-3.5 w-3.5 ml-1 text-ink-secondary/60" />
                </li>

                {/* Attached materials */}
                <li className="pl-12 flex flex-col gap-1.5 py-1">
                  <div data-mat="attach" className="flex items-center gap-2 rounded-lg border border-line bg-bg/50 px-2.5 py-1.5 text-[0.78rem] text-ink">
                    <StickyNote className="h-3.5 w-3.5 text-progress" strokeWidth={1.7} />
                    Notes — index math
                  </div>
                  <div data-mat="attach" className="flex items-center gap-2 rounded-lg border border-line bg-bg/50 px-2.5 py-1.5 text-[0.78rem] text-ink">
                    <FileText className="h-3.5 w-3.5 text-accent" strokeWidth={1.7} />
                    Lecture.pdf
                  </div>
                  <div data-mat="attach" className="flex items-center gap-2 rounded-lg border border-line bg-bg/50 px-2.5 py-1.5 text-[0.78rem] text-ink">
                    <Presentation className="h-3.5 w-3.5 text-progress" strokeWidth={1.7} />
                    Week 7 slides
                  </div>
                  <div data-mat="attach" className="flex items-center gap-2 rounded-lg border border-line bg-bg/50 px-2.5 py-1.5 text-[0.78rem] text-ink">
                    <ImageIcon className="h-3.5 w-3.5 text-done" strokeWidth={1.7} />
                    board-screenshot.png
                  </div>
                </li>

                <li data-mat="node" className="flex items-center gap-2 py-1 pl-6 text-[0.86rem] text-ink-secondary">
                  <span className="h-4 w-4 rounded-full border-2 border-progress" />
                  Linked Lists
                </li>
                <li data-mat="node" className="flex items-center gap-2 py-1 pl-6 text-[0.86rem] text-ink-secondary">
                  <span className="h-4 w-4 rounded-full border-2 border-line" />
                  Trees
                </li>
              </ul>
            </div>
          </div>

          {/* Copy */}
          <div className="order-1 lg:order-2">
            <div data-mat="head" className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-4">
              Materials & notes
            </div>
            <h2 data-mat="head" className="font-display font-light text-display-md text-ink text-balance">
              Resources belong next to the topic, not in a folder you'll forget.
            </h2>
            <p data-mat="head" className="mt-5 text-[1.05rem] text-ink-secondary leading-relaxed max-w-lg">
              Attach a PDF, a slide deck, a photo of the board, a screenshot, or
              your own notes to the syllabus item they are actually about. A big
              resource doesn't need to be broken into tiny files just to fit your
              study plan.
            </p>
            <p data-mat="head" className="mt-4 text-[0.92rem] text-ink-secondary leading-relaxed max-w-lg">
              Uploads are optional. Nothing is analyzed automatically just because
              you attached it — your files stay yours.
            </p>

            <div data-mat="head" className="mt-7 flex flex-wrap gap-2">
              {['PDF', 'Slides', 'Notes', 'Photos', 'Screenshots', 'Text'].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-line bg-bg px-3 py-1.5 text-[0.78rem] text-ink-secondary"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
