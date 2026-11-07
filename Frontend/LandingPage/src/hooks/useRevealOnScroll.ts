import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Reveals child elements (scoped by selector) with a gentle stagger when the
 * container scrolls into view. Respects prefers-reduced-motion.
 */
export function useRevealOnScroll(
  containerRef: React.RefObject<HTMLElement | null>,
  selector: string,
  options?: {
    y?: number;
    duration?: number;
    stagger?: number;
    start?: string;
  }
) {
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const targets = el.querySelectorAll(selector);
    if (!targets.length) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      gsap.set(targets, { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      gsap.from(targets, {
        opacity: 0,
        y: options?.y ?? 28,
        duration: options?.duration ?? 0.9,
        ease: 'power3.out',
        stagger: options?.stagger ?? 0.08,
        scrollTrigger: {
          trigger: el,
          start: options?.start ?? 'top 82%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [containerRef, selector, options]);
}
