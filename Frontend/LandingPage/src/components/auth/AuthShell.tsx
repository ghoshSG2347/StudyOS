import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandMark, BackToHome } from './BrandMark';
import { BrandPanel } from './BrandPanel';
import { AuthForm } from './AuthForm';
import { useAuthSession } from '@/hooks/useAuthSession';
import { hasCompletedOnboarding } from '@/lib/profile';

type Mode = 'sign-in' | 'sign-up';

type Props = {
  mode?: Mode;
};

export function AuthShell({ mode = 'sign-in' }: Props) {
  const navigate = useNavigate();
  const session = useAuthSession();

  // If already authenticated, redirect to workspace or onboarding
  useEffect(() => {
    if (session.state === 'authenticated') {
      const onboarded = hasCompletedOnboarding(session.session?.userId);
      navigate(onboarded ? '/workspace' : '/auth/onboarding', { replace: true });
    }
  }, [session.state, session.session?.userId, navigate]);

  const handleBackToLanding = () => navigate('/');
  const handleAuthenticated = (options?: { isNewUser?: boolean }) => {
    if (options?.isNewUser || mode === 'sign-up') {
      navigate('/auth/onboarding', { replace: true });
    } else {
      // For sign-in, go to workspace directly; onboarding can be detected there.
      // hasCompletedOnboarding reads localStorage which may not be set for new devices;
      // the ProtectedRoute and workspace will handle the redirect if needed.
      navigate('/workspace', { replace: true });
    }
  };

  if (session.state === 'loading') {
    return (
      <AuthLayout onBackToLanding={handleBackToLanding}>
        <div className="flex items-center justify-center py-24" aria-live="polite">
          <div className="flex flex-col items-center gap-3 text-ink-500">
            <span className="h-6 w-6 rounded-full border-2 border-line-strong border-t-sage-500 animate-spin-slow" aria-hidden />
            <span className="text-sm">Checking your session…</span>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Don't render the form at all while authenticated (navigation is in progress)
  if (session.state === 'authenticated') {
    return (
      <AuthLayout onBackToLanding={handleBackToLanding}>
        <div className="flex items-center justify-center py-24" aria-live="polite">
          <div className="flex flex-col items-center gap-3 text-ink-500">
            <span className="h-6 w-6 rounded-full border-2 border-line-strong border-t-sage-500 animate-spin-slow" aria-hidden />
            <span className="text-sm">Redirecting to your workspace…</span>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout onBackToLanding={handleBackToLanding}>
      <AuthForm initialMode={mode} onAuthenticated={handleAuthenticated} />
    </AuthLayout>
  );
}

function AuthLayout({ onBackToLanding, children }: { onBackToLanding?: () => void; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg transition-colors duration-500">
      <div className="mx-auto grid min-h-screen lg:grid-cols-[1fr_1fr] xl:grid-cols-[1.05fr_1fr]">
        <BrandPanel onBackToLanding={onBackToLanding} />
        <main className="flex flex-col px-6 py-8 sm:px-10 lg:px-14 lg:py-12 bg-bg transition-colors duration-500">
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
