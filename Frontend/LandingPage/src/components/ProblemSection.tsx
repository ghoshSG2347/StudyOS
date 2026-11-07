import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { FileText, Image as ImageIcon, Presentation, Folder, ListChecks, MessagesSquare, StickyNote } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const scattered = [
  { label: 'Syllabus PDF', icon: FileText, x: -180, y: -90, rot: -8 },
  { label: 'Lecture slides', icon: Presentation, x: 150, y: -110, rot: 6 },
  { label: 'Screenshots', icon: ImageIcon, x: 220, y: 30, rot: -5 },
  { label: 'Random folder', icon: Folder, x: -210, y: 60, rot: 9 },
  { label: 'Checklist app', icon: ListChecks, x: -120, y: 150, rot: -4 },
  { label: 'AI chat history', icon: MessagesSquare, x: 160, y: 150, rot: 7 },
  { label: 'Handwritten notes', icon: StickyNote, x: 20, y: -150, rot: -3 },
];

export function ProblemSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-scatter]', { opacity: 1, x: 0, y: 0, rotate: 0 });
        gsap.set('[data-problem-text]', { opacity: 1, y: 0 });
        return;
      }

      // Cards reveal smoothly into their positions around the syllabus
      gsap.set('[data-scatter]', { opacity: 0, scale: 0.85 });
      gsap.to('[data-scatter]', {
        opacity: 1,
        scale: 1,
        duration: 0.7,
        stagger: 0.07,
        ease: 'power2.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%', once: true },
      });

      // Subtle parallax drift on scroll — keeping cards gracefully spaced around the syllabus without colliding
      gsap.to('[data-scatter]', {
        y: '+=25',
        ease: 'none',
        scrollTrigger: {
          trigger: cardsRef.current,
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1.2,
        },
      });

      gsap.from('[data-problem-text]', {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 70%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} id="problem" className="relative py-28 sm:py-36 overflow-hidden">
      <div className="mx-auto max-w-8xl px-5 sm:px-8">
        <div className="max-w-3xl">
          <div
            data-problem-text
            className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-4"
          >
            The problem
          </div>
          <h2 data-problem-text className="font-display font-light text-display-md text-ink text-balance">
            You know what to study. It's just scattered everywhere.
          </h2>
          <p data-problem-text className="mt-5 text-[1.05rem] text-ink-secondary leading-relaxed max-w-xl">
            Your syllabus is in a PDF. Your notes are in a folder. Your slides are
            in another. Your checklist is in an app. Your questions live in an AI
            chat you'll never find again.
          </p>
        </div>

        {/* Scattered → converging visualization */}
        <div
          ref={cardsRef}
          className="relative mt-16 sm:mt-24 h-[360px] sm:h-[440px] flex items-center justify-center"
        >
          {/* Center syllabus anchor */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="rounded-2xl border border-line bg-surface px-6 py-4 shadow-[0_8px_30px_-12px_rgba(41,48,71,0.25)]">
              <div className="text-[0.7rem] uppercase tracking-[0.18em] text-ink-secondary mb-1">
                Belongs around
              </div>
              <div className="font-display text-xl sm:text-2xl text-ink">
                Your syllabus
              </div>
            </div>
            <div className="mt-3 h-px w-32 bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
          </div>

          {/* Scattered cards */}
          {scattered.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                data-scatter
                className="absolute z-20 flex items-center gap-2 rounded-xl border border-line bg-surface/90 backdrop-blur px-3.5 py-2.5 shadow-[0_4px_20px_-8px_rgba(41,48,71,0.2)]"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%,-50%) translate(${s.x}px, ${s.y}px) rotate(${s.rot}deg)`,
                  ['--i' as string]: String(i),
                }}
              >
                <Icon className="h-4 w-4 text-ink-secondary" strokeWidth={1.7} />
                <span className="text-[0.82rem] text-ink whitespace-nowrap">{s.label}</span>
              </div>
            );
          })}
        </div>

        <p data-problem-text className="mt-12 max-w-2xl text-[1.05rem] text-ink-secondary leading-relaxed">
          The problem isn't a lack of information. It's that everything lives
          somewhere else — and none of it lives next to the thing you're actually
          studying.
        </p>
      </div>
    </section>
  );
}
