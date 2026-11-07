import { useState, useCallback, useEffect } from 'react';
import { AuthShell } from '@/components/auth/AuthShell';

// Light hash-based routing. The real StudyOS app may use react-router or its
// own router; this keeps the auth flow reachable without imposing a routing
// system on the existing project.
//
//   #/         → Landing (minimal stub, not a marketing page)
//   #/auth     → Authentication (the deliverable)
//   #/workspace→ Workspace (minimal stub)
type Route = 'landing' | 'auth' | 'workspace';

function parseHash(): Route {
  const h = window.location.hash.replace(/^#\/?/, '');
  if (h === 'auth') return 'auth';
  if (h === 'workspace') return 'workspace';
  return 'landing';
}

function useHashRoute(): [Route, (r: Route) => void] {
  const [route, setRoute] = useState<Route>(parseHash);
  useEffect(() => {
    const onHash = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const navigate = useCallback((r: Route) => {
    window.location.hash = r === 'landing' ? '/' : `/${r}`;
  }, []);
  return [route, navigate];
}

function App() {
  const [route, navigate] = useHashRoute();

  if (route === 'auth') {
    return <AuthShell onBackToLanding={() => navigate('landing')} onAuthenticated={() => navigate('workspace')} />;
  }

  if (route === 'workspace') {
    return <WorkspaceStub onSignOut={() => navigate('landing')} />;
  }

  return <LandingStub onSignIn={() => navigate('auth')} onGetStarted={() => navigate('auth')} />;
}

// Minimal landing entry point — NOT a marketing page. The real StudyOS
// Landing Page is a separate surface; this stub only wires the Sign in and
// Get started actions to the Authentication Page.
function LandingStub({ onSignIn, onGetStarted }: { onSignIn: () => void; onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-paper-50 flex flex-col">
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between">
        <span className="font-serif text-lg font-semibold text-ink-900">StudyOS</span>
        <nav className="flex items-center gap-4">
          <button onClick={onSignIn} className="text-sm text-ink-600 hover:text-ink-900 transition focus-ring rounded">
            Sign in
          </button>
          <button
            onClick={onGetStarted}
            className="rounded-md bg-ink-900 text-paper-50 px-4 py-2 text-sm font-medium hover:bg-ink-800 transition focus-ring"
          >
            Get started
          </button>
        </nav>
      </header>
      <main className="flex-1" />
    </div>
  );
}

// Minimal workspace entry point. The real StudyOS Workspace is a separate
// surface; this stub only confirms the post-authentication destination.
function WorkspaceStub({ onSignOut }: { onSignOut: () => void }) {
  return (
    <div className="min-h-screen bg-paper-50 flex flex-col">
      <header className="px-6 sm:px-10 py-6 flex items-center justify-between border-b border-line">
        <span className="font-serif text-lg font-semibold text-ink-900">StudyOS</span>
        <button onClick={onSignOut} className="text-sm text-ink-600 hover:text-ink-900 transition focus-ring rounded">
          Sign out
        </button>
      </header>
      <main className="flex-1" />
    </div>
  );
}

export default App;
