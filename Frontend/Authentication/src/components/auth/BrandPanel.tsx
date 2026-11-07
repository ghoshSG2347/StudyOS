import { BookOpen } from 'lucide-react';
import { BrandMark } from './BrandMark';

type Props = {
  onBackToLanding?: () => void;
  tagline?: string;
};

// The quiet brand area on the left. On mobile it collapses into a compact
// header handled by AuthShell.
export function BrandPanel({ onBackToLanding, tagline = 'Your syllabus. Organized for studying.' }: Props) {
  return (
    <aside className="relative hidden lg:flex flex-col justify-between bg-paper-100 p-10 xl:p-14 overflow-hidden">
      <BrandMark onBackToLanding={onBackToLanding} />

      <div className="max-w-sm">
        <h2 className="font-serif text-3xl xl:text-[2rem] leading-[1.15] text-ink-900 tracking-tight">
          {tagline}
        </h2>
        <p className="mt-4 text-[15px] leading-relaxed text-ink-600">
          A calm place to keep every syllabus, deadline, and reading in one view — built for students who study deeply.
        </p>
      </div>

      {/* Extremely subtle decorative treatment: a faint open-book motif,
          derived from StudyOS language rather than a stock illustration. */}
      <div className="pointer-events-none absolute -bottom-24 -right-16 opacity-[0.07]" aria-hidden>
        <BookOpen className="h-[22rem] w-[22rem] text-ink-900" strokeWidth={1} />
      </div>

      <p className="relative text-xs text-ink-500">
        © {new Date().getFullYear()} StudyOS
      </p>
    </aside>
  );
}
