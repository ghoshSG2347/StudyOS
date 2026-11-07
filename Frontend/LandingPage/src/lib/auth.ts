// StudyOS authentication boundary.
//
// The backend is Better Auth. This module is the single, isolated integration
// point the UI talks to. It is intentionally written so that wiring the real
// Better Auth client only requires replacing the adapter implementation below
// — no component needs to change.
//
// Until Better Auth is connected this adapter is in "not configured" mode and
// every action throws AuthNotConfiguredError. The UI surfaces a clear,
// non-faked error. Nothing here pretends a sign-in succeeded.

export type AuthSession = {
  userId: string;
  email: string;
  name?: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
  name?: string;
};

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'account_not_found'
  | 'account_exists'
  | 'google_cancelled'
  | 'google_failed'
  | 'network'
  | 'server'
  | 'session_failed'
  | 'not_configured'
  | 'unknown';

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? authMessageFor(code));
    this.code = code;
    this.name = 'AuthError';
  }
}

export class AuthNotConfiguredError extends AuthError {
  constructor() {
    super('not_configured');
  }
}

export function authMessageFor(code: AuthErrorCode): string {
  switch (code) {
    case 'invalid_credentials':
      return "That email and password combination didn't work. Please try again.";
    case 'account_not_found':
      return "We couldn't find an account with that email. You can create one instead.";
    case 'account_exists':
      return "An account with that email already exists. Try signing in instead.";
    case 'google_cancelled':
      return "Google sign-in was cancelled.";
    case 'google_failed':
      return "Google sign-in didn't complete. Please try again.";
    case 'network':
      return "Couldn't reach StudyOS. Check your connection and try again.";
    case 'server':
      return "StudyOS is having trouble right now. Please try again in a moment.";
    case 'session_failed':
      return "We couldn't start your session. Please try again.";
    case 'not_configured':
      return "Authentication isn't connected yet. Ask your administrator to finish the StudyOS setup.";
    case 'unknown':
    default:
      return "Something went wrong. Please try again.";
  }
}

// ---------------------------------------------------------------------------
// Adapter contract
// ---------------------------------------------------------------------------
//
// Replace this object's implementation with calls to your Better Auth client
// (e.g. `authClient.signIn.email(...)`, `authClient.signUp.email(...)`,
// `authClient.signIn.social({ provider: 'google' })`, `authClient.getSession()`,
// `authClient.signOut()`, `authClient.forgetPassword(...)`). The signatures are
// kept close to Better Auth's client API on purpose.

export type AuthAdapter = {
  getSession(): Promise<AuthSession | null>;
  signInWithPassword(credentials: AuthCredentials): Promise<AuthSession>;
  signUpWithPassword(credentials: AuthCredentials): Promise<AuthSession>;
  signInWithGoogle(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  signOut(): Promise<void>;
};

import { createAuthClient } from 'better-auth/react';
import { convexClient, crossDomainClient } from '@convex-dev/better-auth/client/plugins';

const convexSiteUrl = import.meta.env.VITE_CONVEX_SITE_URL || 'https://quaint-poodle-413.ap-southeast-2.convex.site';

// In browser development, using current window origin allows the Vite proxy to handle
// requests, avoiding CORS origin mismatches across localhost, 127.0.0.1, or custom ports.
const authBaseUrl = typeof window !== 'undefined' && import.meta.env.DEV
  ? window.location.origin
  : convexSiteUrl;

export const authClient = createAuthClient({
  baseURL: authBaseUrl,
  plugins: [convexClient(), crossDomainClient()],
});

export const betterAuthAdapter: AuthAdapter = {
  async getSession(): Promise<AuthSession | null> {
    try {
      const { data } = await authClient.getSession();
      if (!data?.session || !data?.user) return null;
      return {
        userId: data.user.id,
        email: data.user.email,
        name: data.user.name,
      };
    } catch {
      return null;
    }
  },

  async signInWithPassword({ email, password }: AuthCredentials): Promise<AuthSession> {
    try {
      const res = await authClient.signIn.email({ email, password });
      if (res?.error) {
        const msg = res.error.message || 'Invalid credentials';
        if (res.error.status === 401 || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('credential')) {
          throw new AuthError('invalid_credentials', "That email and password combination didn't work. Please try again.");
        }
        if (res.error.status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('no user')) {
          throw new AuthError('account_not_found', "We couldn't find an account with that email. You can create one instead.");
        }
        throw new AuthError('unknown', msg);
      }
      if (res?.data?.user) {
        return {
          userId: res.data.user.id,
          email: res.data.user.email,
          name: res.data.user.name,
        };
      }
      const session = await this.getSession();
      if (!session) throw new AuthError('session_failed');
      return session;
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
        throw new AuthError('network', 'Unable to reach the authentication service. Check your connection and try again.');
      }
      throw new AuthError('unknown', msg || 'Something went wrong. Please try again.');
    }
  },

  async signUpWithPassword({ email, password, name }: AuthCredentials): Promise<AuthSession> {
    try {
      const res = await authClient.signUp.email({
        email,
        password,
        name: name || email.split('@')[0],
      });
      if (res?.error) {
        const msg = res.error.message || 'Sign up failed';
        if (
          res.error.status === 422 ||
          res.error.code === 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL' ||
          msg.toLowerCase().includes('already') ||
          msg.toLowerCase().includes('exists')
        ) {
          throw new AuthError('account_exists', 'An account with that email already exists. Try signing in instead.');
        }
        throw new AuthError('unknown', msg);
      }
      if (res?.data?.user) {
        return {
          userId: res.data.user.id,
          email: res.data.user.email,
          name: res.data.user.name,
        };
      }
      const session = await this.getSession();
      if (!session) throw new AuthError('session_failed');
      return session;
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      const msg = err?.message || '';
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('network')) {
        throw new AuthError('network', 'Unable to reach the authentication service. Check your connection and try again.');
      }
      throw new AuthError('unknown', msg || 'Something went wrong. Please try again.');
    }
  },

  async signInWithGoogle(): Promise<void> {
    try {
      const res = await authClient.signIn.social({
        provider: 'google',
        callbackURL: `${window.location.origin}/workspace`,
      });
      if (res?.error) {
        const msg = res.error.message || '';
        if (res.error.status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('provider')) {
          throw new AuthError('not_configured', 'Google Sign-In is not configured yet. Please use email and password.');
        }
        throw new AuthError('google_failed', msg || 'Google sign-in did not complete.');
      }
      if (res?.data?.url) {
        window.location.href = res.data.url;
      }
    } catch (err: any) {
      if (err instanceof AuthError) throw err;
      const msg = err?.message || '';
      // Only show "not enabled" if truly a 404/provider-not-found error.
      // Generic network failures get a more helpful retry message.
      if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('provider not')) {
        throw new AuthError('not_configured', 'Google Sign-In is not configured on this deployment. Please use email and password.');
      }
      if (msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror')) {
        throw new AuthError('network', 'Unable to reach the sign-in service. Check your connection and try again.');
      }
      throw new AuthError('google_failed', msg || 'Google sign-in did not complete. Please try again.');
    }
  },

  async resetPassword(email: string): Promise<void> {
    try {
      if (typeof (authClient as any).forgetPassword === 'function') {
        await (authClient as any).forgetPassword({
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
      } else if (typeof (authClient as any).resetPassword === 'function') {
        await (authClient as any).resetPassword({
          email,
          redirectTo: `${window.location.origin}/auth/reset-password`,
        });
      }
    } catch (err: any) {
      throw new AuthError('server', err?.message);
    }
  },

  async signOut(): Promise<void> {
    try {
      await authClient.signOut();
    } catch (err) {
      console.warn('Sign out error:', err);
    }
  },
};

let currentAdapter: AuthAdapter = betterAuthAdapter;

export function configureAuth(adapter: AuthAdapter) {
  currentAdapter = adapter;
}

export function auth(): AuthAdapter {
  return currentAdapter;
}
