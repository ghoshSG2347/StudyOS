import { ArrowLeft, BookOpenText } from 'lucide-react';

type Props = {
  onBackToLanding?: () => void;
  className?: string;
};

// StudyOS wordmark + small mark. Clicking it returns to the landing page.
export function BrandMark({ onBackToLanding, className = '' }: Props) {
  const Tag = onBackToLanding ? 'button' : 'div';
  return (
    <Tag
      type={onBackToLanding ? 'button' : undefined}
      onClick={onBackToLanding}
      className={`group inline-flex items-center gap-2 ${onBackToLanding ? 'focus-ring rounded' : ''} ${className}`}
      aria-label={onBackToLanding ? 'StudyOS — back to home' : 'StudyOS'}
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-ink-900 text-paper-50 shadow-soft transition group-hover:scale-[1.03]">
        <BookOpenText className="h-4 w-4" aria-hidden />
      </span>
      <span className="font-serif text-[19px] font-semibold tracking-tight text-ink-900">StudyOS</span>
    </Tag>
  );
}

export function BackToHome({ onBackToLanding }: { onBackToLanding?: () => void }) {
  if (!onBackToLanding) return null;
  return (
    <button
      type="button"
      onClick={onBackToLanding}
      className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-ink-800 transition focus-ring rounded"
    >
      <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
      Back to home
    </button>
  );
}
