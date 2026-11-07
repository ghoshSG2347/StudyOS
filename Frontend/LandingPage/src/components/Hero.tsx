import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ArrowRight, ArrowDown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SyllabusTree } from '@/components/SyllabusTree';
import { sampleTree } from '@/data/tree';
import { scrollToId } from '@/hooks/useSmoothScroll';

export function Hero() {
  const rootRef = useRef<HTMLDivElement>(null);
  const treeWrapRef = useRef<HTMLDivElement>(null);

  // Entrance choreography
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (prefersReduced) {
        gsap.set('[data-hero-anim]', { opacity: 1, y: 0 });
        return;
      }
      tl.from('[data-hero-anim="eyebrow"]', { opacity: 0, y: 12, duration: 0.6 })
        .from(
          '[data-hero-anim="word"]',
          { opacity: 0, y: 40, duration: 0.9, stagger: 0.12 },
          '-=0.3'
        )
        .from('[data-hero-anim="sub"]', { opacity: 0, y: 18, duration: 0.7 }, '-=0.4')
        .from(
          '[data-hero-anim="cta"]',
          { opacity: 0, y: 14, duration: 0.6, stagger: 0.08 },
          '-=0.3'
        )
        .from(
          '[data-hero-anim="tree"]',
          { opacity: 0, y: 30, duration: 1, ease: 'power2.out' },
          '-=0.5'
        );
    }, rootRef);
    return () => ctx.revert();
  }, []);

  // Subtle mouse parallax on the tree + background branches
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const wrap = treeWrapRef.current;
    const root = rootRef.current;
    if (!wrap || !root) return;

    const onMove = (e: MouseEvent) => {
      const rect = root.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(wrap, { x: x * 14, y: y * 10, duration: 1.2, ease: 'power2.out' });
      gsap.to('[data-bg-branch]', {
        x: x * -22,
        y: y * -14,
        duration: 1.4,
        ease: 'power2.out',
      });
    };
    root.addEventListener('mousemove', onMove);
    return () => root.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <section
      ref={rootRef}
      className="relative min-h-[100svh] pt-24 sm:pt-28 pb-16 sm:pb-24 overflow-hidden"
      id="hero"
    >
      {/* Background — faint branching lines drawn in SVG */}
      <BackgroundBranches />

      <div className="relative mx-auto max-w-8xl px-5 sm:px-8">
        <div className="grid lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-12 items-center">
          {/* Left — copy */}
          <div className="flex flex-col items-start">
            <div
              data-hero-anim="eyebrow"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/70 px-3.5 py-1.5 text-[0.78rem] text-ink-secondary"
            >
              <Sparkles className="h-3.5 w-3.5 text-accent" strokeWidth={1.8} />
              A study workspace, not another chatbot
            </div>

            <h1 className="mt-5 font-display font-light text-display-xl text-ink text-balance">
              <span data-hero-anim="word" className="inline-block">
                From syllabus
              </span>
              <br />
              <span data-hero-anim="word" className="inline-block">
                to{' '}
              </span>
              <span data-hero-anim="word" className="inline-block italic text-accent">
                study space
              </span>
              <span data-hero-anim="word" className="inline-block">
                .
              </span>
            </h1>

            <p
              data-hero-anim="sub"
              className="mt-6 max-w-xl text-[1.05rem] sm:text-[1.1rem] leading-relaxed text-ink-secondary"
            >
              Turn your syllabus into an editable study tree. Track what you've
              finished, keep your notes and materials beside it, and use AI only
              when you need it.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span data-hero-anim="cta">
                <Button as="a" href="/auth/sign-up" variant="primary" size="lg">
                  Get started
                  <ArrowRight className="h-4 w-4" strokeWidth={2} />
                </Button>
              </span>
              <span data-hero-anim="cta">
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={() => scrollToId('how')}
                >
                  See how it works
                  <ArrowDown className="h-4 w-4" strokeWidth={2} />
                </Button>
              </span>
            </div>

            <div
              data-hero-anim="cta"
              className="mt-8 flex items-center gap-5 text-[0.8rem] text-ink-secondary"
            >
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-done" />
                Works without AI
              </span>
              <span className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Your structure, your control
              </span>
            </div>
          </div>

          {/* Right — product tree visualization */}
          <div ref={treeWrapRef} data-hero-anim="tree" className="lg:pl-4">
            <SyllabusTree data={sampleTree} />
          </div>
        </div>
      </div>
    </section>
  );
}

function BackgroundBranches() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 1440 900"
      fill="none"
      aria-hidden="true"
    >
      <g data-bg-branch stroke="var(--ink)" strokeOpacity="0.06" strokeWidth="1.2">
        <path d="M-40 120 C 200 140, 320 60, 520 180 S 880 360, 1120 240" />
        <path d="M120 -20 C 220 160, 360 220, 480 360 S 720 640, 860 540" />
        <path d="M1320 80 C 1180 180, 1040 200, 980 340 S 920 620, 760 700" />
      </g>
      <g data-bg-branch stroke="var(--accent)" strokeOpacity="0.05" strokeWidth="1">
        <path d="M80 760 C 280 700, 420 640, 620 680 S 980 760, 1180 660" />
        <circle cx="80" cy="760" r="3" />
        <circle cx="380" cy="700" r="3" />
        <circle cx="660" cy="690" r="3" />
        <circle cx="940" cy="740" r="3" />
        <circle cx="1180" cy="660" r="3" />
      </g>
    </svg>
  );
}
