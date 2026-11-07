import { useEffect, useState } from 'react';
import { auth, type AuthSession } from '@/lib/auth';

export type SessionState = 'loading' | 'authenticated' | 'unauthenticated';

// Resolves any existing Better Auth session once on mount. The UI uses this
// to skip showing the login form to an already-signed-in user.
export function useAuthSession() {
  const [state, setState] = useState<SessionState>('loading');
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const s = await auth().getSession();
        if (cancelled) return;
        if (s) {
          setSession(s);
          setState('authenticated');
        } else {
          setState('unauthenticated');
        }
      } catch {
        if (cancelled) return;
        // Session check should never block the auth page; treat as unauthenticated.
        setState('unauthenticated');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { state, session };
}
