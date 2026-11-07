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
      return 'That email and password combination didn’t work. Please try again.';
    case 'account_not_found':
      return 'We couldn’t find an account with that email. You can create one instead.';
    case 'account_exists':
      return 'An account with that email already exists. Try signing in instead.';
    case 'google_cancelled':
      return 'Google sign-in was cancelled.';
    case 'google_failed':
      return 'Google sign-in didn’t complete. Please try again.';
    case 'network':
      return 'Couldn’t reach StudyOS. Check your connection and try again.';
    case 'server':
      return 'StudyOS is having trouble right now. Please try again in a moment.';
    case 'session_failed':
      return 'We couldn’t start your session. Please try again.';
    case 'not_configured':
      return 'Authentication isn’t connected yet. Ask your administrator to finish the StudyOS setup.';
    case 'unknown':
    default:
      return 'Something went wrong. Please try again.';
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

const notConfiguredAdapter: AuthAdapter = {
  async getSession() {
    return null;
  },
  async signInWithPassword() {
    throw new AuthNotConfiguredError();
  },
  async signUpWithPassword() {
    throw new AuthNotConfiguredError();
  },
  async signInWithGoogle() {
    throw new AuthNotConfiguredError();
  },
  async resetPassword() {
    throw new AuthNotConfiguredError();
  },
  async signOut() {
    /* no-op until configured */
  },
};

// Swap this for `createBetterAuthAdapter(authClient)` once Better Auth is wired.
let currentAdapter: AuthAdapter = notConfiguredAdapter;

export function configureAuth(adapter: AuthAdapter) {
  currentAdapter = adapter;
}

export function auth(): AuthAdapter {
  return currentAdapter;
}
