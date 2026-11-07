import { Navigate, useLocation } from 'react-router-dom';
import { useAuthSession } from '@/hooks/useAuthSession';
import { IS_DEMO_MODE } from '@/lib/demo';

// Shows a minimal loading indicator while session is being determined.
// When unauthenticated:
// - If IS_DEMO_MODE is true, safely redirects to /workspace/demo
// - Otherwise, redirects to /auth/sign-in
// Renders children if authenticated.
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { state } = useAuthSession();
  const location = useLocation();

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#f3f0e7' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', color: '#77796f' }}>
          <span
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              border: '2px solid #dcd8cc',
              borderTopColor: '#6268c9',
              animation: 'spin 0.7s linear infinite',
              display: 'block',
            }}
          />
          <span style={{ fontSize: '13px' }}>Loading your workspace…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (state === 'unauthenticated') {
    // In demo mode, redirect unauthenticated workspace visits to the explicit demo route
    if (IS_DEMO_MODE) {
      const demoTarget = location.pathname.startsWith('/workspace/')
        ? `/workspace/demo${location.pathname.replace('/workspace', '')}`
        : '/workspace/demo';
      return <Navigate to={demoTarget} replace />;
    }
    return <Navigate to="/auth/sign-in" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
