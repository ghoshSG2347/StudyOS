import { useEffect } from 'react';
import { BrandMark, BackToHome } from './BrandMark';
import { BrandPanel } from './BrandPanel';
import { AuthForm } from './AuthForm';
import { useAuthSession } from '@/hooks/useAuthSession';

type Props = {
  onBackToLanding?: () => void;
  onAuthenticated?: () => void;
};

export function AuthShell({ onBackToLanding, onAuthenticated }: Props) {
  const session = useAuthSession();

  useEffect(() => {
    if (session.state === 'authenticated' && onAuthenticated) {
      onAuthenticated();
    }
  }, [session.state, onAuthenticated]);

  if (session.state === 'loading') {
    return (
      <AuthLayout onBackToLanding={onBackToLanding}>
        <div className="flex items-center justify-center py-24" aria-live="polite">
          <div className="flex flex-col items-center gap-3 text-ink-500">
            <span className="h-6 w-6 rounded-full border-2 border-line-strong border-t-sage-500 animate-spin-slow" aria-hidden />
            <span className="text-sm">Checking your session…</span>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout onBackToLanding={onBackToLanding}>
      <AuthForm onAuthenticated={onAuthenticated} />
    </AuthLayout>
  );
}

function AuthLayout({ onBackToLanding, children }: { onBackToLanding?: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-50">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_1fr]">
        <BrandPanel onBackToLanding={onBackToLanding} />
        <main className="flex flex-col px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          {/* Mobile: compact brand header. Desktop: subtle back link top-right. */}
          <div className="flex items-center justify-between lg:hidden">
            <BrandMark onBackToLanding={onBackToLanding} />
          </div>
          <div className="hidden lg:flex justify-end">
            <BackToHome onBackToLanding={onBackToLanding} />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-[400px] py-8 animate-fade-up">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
