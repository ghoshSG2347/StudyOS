import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Minus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const faqs = [
  {
    q: 'Can I create a syllabus manually?',
    a: 'Yes. You can build the structure from scratch, item by item, without importing anything.',
  },
  {
    q: 'Does StudyOS require AI?',
    a: 'No. The core — syllabus tree, completion tracking, materials and notes — works fully without AI. Assistance is an optional panel you open when you want it.',
  },
  {
    q: 'Can I edit an imported syllabus?',
    a: 'Yes. The imported structure is a starting point. You can rename, add, remove, reorder, expand and collapse any item before and after you start studying.',
  },
  {
    q: 'Do I have to upload study materials?',
    a: 'No. Uploads are optional. You can use StudyOS purely as a structure to track what you have finished.',
  },
  {
    q: 'Can I attach materials to any syllabus item?',
    a: 'Yes. PDFs, slides, text, photos and screenshots can be attached to any topic or subtopic in your tree.',
  },
  {
    q: 'Does StudyOS replace my existing notes?',
    a: 'No. It gives you a place to keep them connected to the syllabus item they belong to, so the context is never lost.',
  },
];

export function FAQ() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState<number | null>(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-faq]', { opacity: 1, y: 0 });
        return;
      }
      gsap.from('[data-faq="head"]', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 78%' },
      });
      gsap.from('[data-faq="item"]', {
        opacity: 0,
        y: 16,
        duration: 0.6,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-faq="list"]', start: 'top 80%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div className="text-center mb-12">
          <div data-faq="head" className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-4">
            FAQ
          </div>
          <h2 data-faq="head" className="font-display font-light text-display-md text-ink text-balance">
            Questions students ask.
          </h2>
        </div>

        <div data-faq="list" className="flex flex-col">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <div
                key={f.q}
                data-faq="item"
                className="border-b border-line first:border-t"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <span className={`text-[1rem] sm:text-[1.05rem] transition-colors ${isOpen ? 'text-accent' : 'text-ink'}`}>
                    {f.q}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink-secondary">
                    {isOpen ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  </span>
                </button>
                <div
                  className="grid transition-all duration-400 ease-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="pb-5 pr-10 text-[0.95rem] text-ink-secondary leading-relaxed">
                      {f.a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
