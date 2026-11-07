import { BookMarked } from 'lucide-react';
import { Link } from 'react-router-dom';
import { scrollToId } from '@/hooks/useSmoothScroll';

const columns = [
  {
    title: 'Product',
    links: [
      { label: 'Why StudyOS', id: 'problem' },
      { label: 'How it works', id: 'how' },
      { label: 'Workspace', id: 'features' },
      { label: 'AI', id: 'ai' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { label: 'Get started', href: '/auth/sign-up' },
      { label: 'Sign in', href: '/auth/sign-in' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-bg border-t border-line">
      <div className="mx-auto max-w-8xl px-5 sm:px-8 py-14 sm:py-16">
        <div className="grid md:grid-cols-[1.4fr_1fr_1fr] gap-10">
          <div>
            <a
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center gap-2.5"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-bg">
                <BookMarked className="h-[18px] w-[18px]" strokeWidth={1.8} />
              </span>
              <span className="font-display text-[1.35rem] font-medium tracking-tight text-ink">
                Study<span className="text-accent">OS</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-[0.9rem] text-ink-secondary leading-relaxed">
              A personal study workspace that turns your syllabus into an editable
              tree — with completion, materials, notes and optional AI help around it.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <div className="text-[0.72rem] uppercase tracking-[0.18em] text-ink-secondary mb-4">
                {col.title}
              </div>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    {'id' in l ? (
                      <button
                        onClick={() => scrollToId(l.id)}
                        className="text-[0.92rem] text-ink hover:text-accent transition-colors"
                      >
                        {l.label}
                      </button>
                    ) : l.href.startsWith('/') ? (
                      <Link
                        to={l.href}
                        className="text-[0.92rem] text-ink hover:text-accent transition-colors"
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <a
                        href={l.href}
                        className="text-[0.92rem] text-ink hover:text-accent transition-colors"
                      >
                        {l.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-line/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[0.82rem] text-ink-secondary">
            © {new Date().getFullYear()} StudyOS. Built for students.
          </p>
          <p className="text-[0.78rem] text-ink-secondary/70">
            Your syllabus, finally in one place.
          </p>
        </div>
      </div>
    </footer>
  );
}
