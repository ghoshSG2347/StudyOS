import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

gsap.registerPlugin(ScrollTrigger);

export function FinalCTA() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (prefersReduced) {
        gsap.set('[data-cta]', { opacity: 1, y: 0 });
        return;
      }
      gsap.from('[data-cta]', {
        opacity: 0,
        y: 30,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: { trigger: rootRef.current, start: 'top 75%' },
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="relative py-28 sm:py-36 bg-surface/60 border-t border-line">
      <div className="mx-auto max-w-4xl px-5 sm:px-8 text-center">
        <div data-cta className="text-[0.78rem] uppercase tracking-[0.2em] text-accent font-medium mb-5">
          Start
        </div>
        <h2 data-cta className="font-display font-light text-display-lg text-ink text-balance">
          Start with your syllabus.
        </h2>
        <p data-cta className="mt-5 text-[1.1rem] text-ink-secondary leading-relaxed max-w-xl mx-auto">
          Build the workspace around the way you actually study.
        </p>

        <div data-cta className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <Button as="a" href="/auth/sign-up" variant="primary" size="lg">
            Get started
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </Button>
          <Button as="a" href="/auth/sign-in" variant="secondary" size="lg">
            Sign in
          </Button>
        </div>

        <p data-cta className="mt-6 text-[0.8rem] text-ink-secondary/80">
          No AI required. Your structure stays yours.
        </p>
      </div>
    </section>
  );
}
