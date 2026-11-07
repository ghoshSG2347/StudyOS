import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, ChevronRight, Check, Pencil, Plus, Trash2, Move } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const treeSteps = [
  { label: 'Data Structures', depth: 1, status: 'done' },
  { label: 'Arrays', depth: 2, status: 'done' },
  { label: 'Linked Lists', depth: 2, status: 'done' },
  { label: 'Trees', depth: 2, status: 'in-progress' },
  { label: 'Binary Search Trees', depth: 3, status: 'todo' },
  { label: 'Traversal', depth: 3, status: 'todo' },
];

const editActions = [
  { icon: Pencil, label: 'Rename' },
  { icon: Plus, label: 'Add' },
  { icon: Trash2, label: 'Remove' },
  { icon: Move, label: 'Reorder' },
];

export function TreeStory() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-ts]', { opacity: 1, y: 0, strokeDashoffset: 0 });
        return;
      }

      // Heading reveal
      gsap.from('[data-ts="head"]', {
        opacity: 0,
        y: 28,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      });

      // Tree rows reveal
      gsap.from('[data-ts="row"]', {
        opacity: 0,
        x: -16,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-ts="canvas"]', start: 'top 65%', once: true },
      });

      // Checkmark pop
      gsap.from('[data-ts="check"]', {
        scale: 0,
        duration: 0.4,
        ease: 'back.out(2)',
        stagger: 0.12,
        delay: 0.6,
        scrollTrigger: { trigger: '[data-ts="canvas"]', start: 'top 60%', once: true },
      });

      // Edit actions reveal
      gsap.from('[data-ts="action"]', {
        opacity: 0,
        y: 10,
        duration: 0.5,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: { trigger: '[data-ts="actions"]', start: 'top 85%', once: true },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative py-28 sm:py-36 bg-surface/60 border-y border-line">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1fr_1.1fr] gap-12 lg:gap-16 items-center">
          {/* Copy */}
          <div>
            <div data-ts="head" className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-4">
              The core idea
            </div>
            <h2 data-ts="head" className="font-display font-light text-display-md text-ink text-balance">
              Your syllabus becomes a tree you can edit.
            </h2>
            <p data-ts="head" className="mt-5 text-[1.05rem] text-ink-secondary leading-relaxed max-w-lg">
              Import a syllabus and StudyOS proposes a structure. Then it's yours
              — rename chapters, add the topics your professor actually covered,
              remove what you won't need, and reorganize until the tree matches
              how you study.
            </p>

            <div data-ts="actions" className="mt-8 flex flex-wrap gap-2.5">
              {editActions.map((a) => (
                <div
                  key={a.label}
                  data-ts="action"
                  className="flex items-center gap-2 rounded-full border border-line bg-bg px-3.5 py-2 text-[0.82rem] text-ink"
                >
                  <a.icon className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
                  {a.label}
                </div>
              ))}
            </div>

            <div data-ts="head" className="mt-8 flex items-start gap-3 rounded-xl border border-line bg-bg/60 p-4">
              <FileText className="h-5 w-5 text-ink-secondary shrink-0 mt-0.5" strokeWidth={1.7} />
              <p className="text-[0.9rem] text-ink-secondary leading-relaxed">
                The imported structure is a <span className="text-ink font-medium">starting point</span>,
                not a verdict. You review it before it becomes your workspace.
              </p>
            </div>
          </div>

          {/* Visual canvas */}
          <div data-ts="canvas" className="relative">
            {/* Transition flow: document → structure → tree */}
            <div className="flex items-center gap-3 mb-5 text-[0.78rem] text-ink-secondary">
              <span className="flex items-center gap-2 rounded-lg border border-line bg-bg px-2.5 py-1.5">
                <FileText className="h-3.5 w-3.5" /> Syllabus document
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="flex items-center gap-2 rounded-lg border border-line bg-bg px-2.5 py-1.5">
                Proposed structure
              </span>
              <ChevronRight className="h-4 w-4" />
              <span className="flex items-center gap-2 rounded-lg border border-accent/40 bg-accent-soft/60 px-2.5 py-1.5 text-ink">
                Your study tree
              </span>
            </div>

            <div className="relative rounded-2.5xl border border-line bg-surface p-5 sm:p-6 shadow-[0_2px_8px_rgba(41,48,71,0.06),0_24px_50px_-24px_rgba(41,48,71,0.18)] overflow-hidden">
              <div className="relative">
                <div className="mb-3 text-[0.7rem] uppercase tracking-[0.16em] text-ink-secondary flex items-center gap-2">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-accent" />
                  3rd Semester — CSE
                </div>
                <ul className="relative flex flex-col gap-1">
                  {treeSteps.map((n) => (
                    <li
                      key={n.label}
                      data-ts="row"
                      className="group relative flex items-center gap-2.5 rounded-lg py-1.5 px-2 transition-colors hover:bg-surface-elevated/40"
                      style={{ paddingLeft: `${(n.depth - 1) * 26 + 10}px` }}
                    >
                      {/* Tree branch connector lines */}
                      {n.depth > 1 && (
                        <span
                          aria-hidden
                          className="absolute pointer-events-none border-l border-b border-line"
                          style={{
                            left: `${(n.depth - 1) * 26 - 4}px`,
                            top: 0,
                            height: '50%',
                            width: '12px',
                            borderBottomLeftRadius: '4px',
                          }}
                        />
                      )}
                      {n.depth === 3 && (
                        <span
                          aria-hidden
                          className="absolute pointer-events-none border-l border-line"
                          style={{
                            left: '22px',
                            top: 0,
                            bottom: 0,
                          }}
                        />
                      )}

                      {n.status === 'done' ? (
                        <span
                          data-ts="check"
                          className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-done text-white shadow-xs"
                        >
                          <Check className="h-2.5 w-2.5" strokeWidth={3} />
                        </span>
                      ) : n.status === 'in-progress' ? (
                        <span className="relative z-10 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-progress bg-surface">
                          <span className="h-1.5 w-1.5 rounded-full bg-progress animate-pulse" />
                        </span>
                      ) : (
                        <span className="relative z-10 h-4 w-4 shrink-0 rounded-full border-2 border-line bg-surface" />
                      )}
                      <span
                        className={`text-[0.88rem] leading-snug transition-colors ${
                          n.depth === 1 ? 'font-semibold text-ink' : n.depth === 2 ? 'text-ink font-normal' : 'text-ink-secondary'
                        }`}
                      >
                        {n.label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
