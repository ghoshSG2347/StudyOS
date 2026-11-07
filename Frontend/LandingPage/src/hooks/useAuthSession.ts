import { authClient } from '@/lib/auth';
import type { AuthSession } from '@/lib/auth';

export type SessionState = 'loading' | 'authenticated' | 'unauthenticated';

// Reactive Better Auth session hook.
// Uses authClient.useSession() so it automatically updates on sign-in and sign-out
// without requiring a page reload. The crossDomainClient plugin keeps session
// tokens in localStorage and signals changes via nanostores.
export function useAuthSession(): { state: SessionState; session: AuthSession | null } {
  const { data, isPending } = authClient.useSession();

  if (isPending) {
    return { state: 'loading', session: null };
  }

  if (data?.session && data?.user) {
    return {
      state: 'authenticated',
      session: {
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
      },
    };
  }

  return { state: 'unauthenticated', session: null };
}
