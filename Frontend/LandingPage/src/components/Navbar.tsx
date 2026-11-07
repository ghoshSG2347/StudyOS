import { useEffect, useState } from 'react';
import { Menu, X, BookMarked, Sun, Moon } from 'lucide-react';
import { scrollToId } from '@/hooks/useSmoothScroll';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/Button';
import { IS_DEMO_MODE } from '@/lib/demo';

const links = [
  { label: 'Why StudyOS', id: 'problem' },
  { label: 'How it works', id: 'how' },
  { label: 'Workspace', id: 'features' },
  { label: 'AI', id: 'ai' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const nav = (id: string) => {
    setOpen(false);
    scrollToId(id);
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-bg/85 backdrop-blur-md border-b border-line/70'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <nav className="mx-auto max-w-8xl px-5 sm:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-4">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 group"
          aria-label="StudyOS home"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink text-bg transition-transform duration-300 group-hover:rotate-[-4deg]">
            <BookMarked className="h-[18px] w-[18px]" strokeWidth={1.8} />
          </span>
          <span className="font-display text-[1.35rem] font-medium tracking-tight text-ink">
            Study<span className="text-accent">OS</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => nav(l.id)}
              className="relative px-4 py-2 text-[0.92rem] text-ink-secondary hover:text-ink transition-colors duration-300"
            >
              {l.label}
            </button>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:bg-hover transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          {IS_DEMO_MODE && (
            <Button
              as="a"
              href="/workspace/demo"
              variant="ghost"
              size="sm"
              className="border border-dashed border-accent/40 text-accent hover:border-accent hover:bg-accent/5 text-[0.82rem] px-3 font-normal"
              title="Temporary demo: open workspace without authentication"
            >
              Open Demo Workspace
            </Button>
          )}
          <Button as="a" href="/auth/sign-in" variant="ghost" size="sm">
            Sign in
          </Button>
          <Button as="a" href="/auth/sign-up" variant="primary" size="sm">
            Get started
          </Button>
        </div>

        <div className="md:hidden flex items-center gap-2.5">
          <button
            onClick={toggle}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink hover:bg-hover transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-lg text-ink"
            onClick={() => setOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile sheet */}
      <div
        className={`md:hidden overflow-hidden transition-[max-height,opacity] duration-400 bg-bg/95 backdrop-blur-md border-b border-line ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-5 py-5 flex flex-col gap-1">
          {links.map((l) => (
            <button
              key={l.id}
              onClick={() => nav(l.id)}
              className="text-left py-3 px-2 text-ink-secondary hover:text-ink border-b border-line/60"
            >
              {l.label}
            </button>
          ))}
          <div className="flex flex-col gap-2.5 pt-4">
            {IS_DEMO_MODE && (
              <Button
                as="a"
                href="/workspace/demo"
                variant="secondary"
                size="md"
                className="border-dashed border-accent/40 text-accent hover:border-accent hover:bg-accent/5 text-sm"
              >
                Open Demo Workspace
              </Button>
            )}
            <Button as="a" href="/auth/sign-in" variant="secondary" size="md">
              Sign in
            </Button>
            <Button as="a" href="/auth/sign-up" variant="primary" size="md">
              Get started
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
