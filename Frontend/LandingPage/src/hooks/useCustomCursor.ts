import { useEffect } from 'react';

/**
 * Interactive selectors across StudyOS (Landing, Auth, Workspace) that trigger
 * the expanded cursor-hover ring.
 */
const INTERACTIVE_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[data-cursor-hover]',
  'input[type="button"]',
  'input[type="submit"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'label',
  'select',
  'summary',
  '.syllabus-row',
  '.tree-row',
  '.catalogue-item',
  '.checklist-row',
  '.upload-area',
  '.activity-button',
  '.icon-button',
  '.tree-action',
  '.tab-button',
  '.topbar-help',
  '.topbar-theme-btn',
].join(', ');

/**
 * Text-entry selectors where native caret / text-selection behavior must be preserved.
 */
const TEXT_INPUT_SELECTOR = [
  'input:not([type="button"]):not([type="submit"]):not([type="checkbox"]):not([type="radio"]):not([type="range"])',
  'textarea',
  '[contenteditable="true"]',
].join(', ');

/**
 * Subtle custom cursor for desktop pointer-fine devices (mouse & laptop touchpad).
 * Works globally across Landing, Auth, and Workspace without layout blocking or text interference.
 */
export function useCustomCursor() {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || prefersReduced) return;

    // Reuse existing DOM elements if already created to prevent duplication
    let dot = document.querySelector<HTMLDivElement>('.cursor-dot');
    let ring = document.querySelector<HTMLDivElement>('.cursor-ring');

    if (!dot) {
      dot = document.createElement('div');
      dot.className = 'cursor-dot cursor-hidden';
      document.body.appendChild(dot);
    }
    if (!ring) {
      ring = document.createElement('div');
      ring.className = 'cursor-ring cursor-hidden';
      document.body.appendChild(ring);
    }

    document.body.classList.add('custom-cursor-active');

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let raf = 0;
    let hasMoved = false;

    const setPos = (el: HTMLElement, x: number, y: number) => {
      el.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;

      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!hasMoved) {
        hasMoved = true;
        ringX = mouseX;
        ringY = mouseY;
        setPos(dot!, mouseX, mouseY);
        setPos(ring!, ringX, ringY);
        dot!.classList.remove('cursor-hidden');
        ring!.classList.remove('cursor-hidden');
      } else {
        setPos(dot!, mouseX, mouseY);
      }
    };

    const tick = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      if (ring) {
        setPos(ring, ringX, ringY);
      }
      raf = requestAnimationFrame(tick);
    };

    const onPointerOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Text input detection -> hide custom cursor to allow native text selection
      if (target.closest(TEXT_INPUT_SELECTOR)) {
        dot?.classList.add('cursor-hidden');
        ring?.classList.add('cursor-hidden');
        ring?.classList.remove('cursor-hover');
        return;
      } else if (hasMoved) {
        dot?.classList.remove('cursor-hidden');
        ring?.classList.remove('cursor-hidden');
      }

      // Interactive hover detection -> expand ring
      if (target.closest(INTERACTIVE_SELECTOR)) {
        ring?.classList.add('cursor-hover');
      }
    };

    const onPointerOut = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return;
      const target = e.target as HTMLElement | null;
      if (!target) return;

      if (target.closest(INTERACTIVE_SELECTOR)) {
        ring?.classList.remove('cursor-hover');
      }
      if (target.closest(TEXT_INPUT_SELECTOR) && hasMoved) {
        dot?.classList.remove('cursor-hidden');
        ring?.classList.remove('cursor-hidden');
      }
    };

    const onWindowLeave = () => {
      dot?.classList.add('cursor-hidden');
      ring?.classList.add('cursor-hidden');
    };

    const onWindowEnter = () => {
      if (hasMoved) {
        dot?.classList.remove('cursor-hidden');
        ring?.classList.remove('cursor-hidden');
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerover', onPointerOver, { passive: true });
    document.addEventListener('pointerout', onPointerOut, { passive: true });
    document.addEventListener('mouseleave', onWindowLeave);
    document.addEventListener('mouseenter', onWindowEnter);
    window.addEventListener('blur', onWindowLeave);
    window.addEventListener('focus', onWindowEnter);

    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
      document.removeEventListener('mouseleave', onWindowLeave);
      document.removeEventListener('mouseenter', onWindowEnter);
      window.removeEventListener('blur', onWindowLeave);
      window.removeEventListener('focus', onWindowEnter);
      cancelAnimationFrame(raf);
      dot?.remove();
      ring?.remove();
      document.body.classList.remove('custom-cursor-active');
    };
  }, []);
}
