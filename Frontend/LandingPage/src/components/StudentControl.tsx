import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Pencil, Plus, Trash2, ArrowUpDown, FolderInput, ChevronsUpDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const actions = [
  { icon: Pencil, label: 'Rename', from: 'Data Structures', to: 'DS & Algorithms' },
  { icon: Plus, label: 'Add a topic', from: 'Trees', to: 'AVL Trees' },
  { icon: Trash2, label: 'Remove', from: 'Graphs', to: null },
  { icon: ArrowUpDown, label: 'Reorder', from: 'Arrays', to: 'moved up' },
  { icon: FolderInput, label: 'Move', from: 'Calculus', to: 'Mathematics III' },
  { icon: ChevronsUpDown, label: 'Expand / collapse', from: 'Trees', to: null },
];

export function StudentControl() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-sc]', { opacity: 1, y: 0 });
        return;
      }
      gsap.from('[data-sc="head"]', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      });
      gsap.from('[data-sc="action"]', {
        opacity: 0,
        x: -20,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-sc="list"]', start: 'top 80%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % actions.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <section ref={rootRef} className="relative py-28 sm:py-36">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
          <div>
            <div data-sc="head" className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-4">
              Your structure
            </div>
            <h2 data-sc="head" className="font-display font-light text-display-md text-ink text-balance">
              Your syllabus. Your structure.
            </h2>
            <p data-sc="head" className="mt-5 text-[1.05rem] text-ink-secondary leading-relaxed max-w-lg">
              Importing gives you a starting point — not a verdict. Every item is
              editable. Add what your professor actually covered. Remove what you
              will skip. Move things around so the tree matches how you study.
            </p>

            <div data-sc="list" className="mt-8 flex flex-col gap-1.5">
              {actions.map((a, i) => (
                <button
                  key={a.label}
                  data-sc="action"
                  onClick={() => setActive(i)}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-300 ${
                    active === i
                      ? 'border-accent/40 bg-accent-soft/50'
                      : 'border-line bg-surface hover:bg-hover'
                  }`}
                >
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      active === i ? 'bg-accent text-white' : 'bg-bg text-ink-secondary'
                    }`}
                  >
                    <a.icon className="h-4 w-4" strokeWidth={1.8} />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[0.9rem] text-ink font-medium">{a.label}</span>
                    {active === i && (
                      <span className="block text-[0.76rem] text-ink-secondary mt-0.5">
                        {a.from}
                        {a.to && <span className="text-accent"> → {a.to}</span>}
                      </span>
                    )}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div className="rounded-2.5xl border border-line bg-surface p-5 sm:p-7 shadow-[0_2px_8px_rgba(41,48,71,0.06),0_24px_50px_-24px_rgba(41,48,71,0.18)]">
              <div className="text-[0.7rem] uppercase tracking-[0.16em] text-ink-secondary mb-3">
                Before / after
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-line bg-bg/50 p-3">
                  <div className="text-[0.66rem] uppercase tracking-[0.14em] text-ink-secondary/70 mb-2">
                    Imported
                  </div>
                  <ul className="text-[0.8rem] space-y-1.5">
                    <li className="text-ink-secondary">Data Structures</li>
                    <li className="pl-4 text-ink-secondary/80">Arrays</li>
                    <li className="pl-4 text-ink-secondary/80">Linked Lists</li>
                    <li className="pl-4 text-ink-secondary/80">Trees</li>
                    <li className="text-ink-secondary/60 line-through">Graphs</li>
                    <li className="text-ink-secondary">Calculus</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-accent/40 bg-accent-soft/30 p-3">
                  <div className="text-[0.66rem] uppercase tracking-[0.14em] text-accent mb-2">
                    Yours
                  </div>
                  <ul className="text-[0.8rem] space-y-1.5">
                    <li className="text-ink font-medium">DS & Algorithms</li>
                    <li className="pl-4 text-ink-secondary">Arrays</li>
                    <li className="pl-4 text-ink-secondary">Linked Lists</li>
                    <li className="pl-4 text-ink-secondary">Trees</li>
                    <li className="pl-8 text-accent">+ AVL Trees</li>
                    <li className="text-ink-secondary">Mathematics III</li>
                    <li className="pl-4 text-ink-secondary">Calculus</li>
                  </ul>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-lg bg-hover/60 px-3 py-2 text-[0.8rem] text-ink-secondary">
                <span className="font-medium text-ink">{actions[active].label}</span>
                <span>applied to the tree</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
