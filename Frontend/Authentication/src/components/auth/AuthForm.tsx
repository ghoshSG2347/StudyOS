import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { auth, AuthError } from '@/lib/auth';
import { EmailField, validateEmail } from './EmailField';
import { PasswordField } from './PasswordField';
import { Button } from './Button';
import { GoogleAuthButton } from './GoogleAuthButton';
import { AuthDivider } from './AuthDivider';
import { AuthError as AuthErrorBanner } from './AuthError';

type Mode = 'sign-in' | 'sign-up';
type ForgotView = 'idle' | 'form' | 'sent';
type SubmissionState = 'idle' | 'loading';

const MIN_PASSWORD_LENGTH = 8;

export function AuthForm({ onAuthenticated }: { onAuthenticated?: () => void }) {
  const [mode, setMode] = useState<Mode>('sign-in');
  const [submission, setSubmission] = useState<SubmissionState>('idle');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const [forgot, setForgot] = useState<ForgotView>('idle');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const isSignUp = mode === 'sign-up';

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setFormError(null);
    setEmailError(null);
    setPasswordError(null);
    setNameError(null);
    setConfirmError(null);
  };

  const validate = (): boolean => {
    let ok = true;
    const emailMsg = validateEmail(email);
    setEmailError(emailMsg);
    if (emailMsg) ok = false;

    if (!password) {
      setPasswordError('Enter your password.');
      ok = false;
    } else if (isSignUp && password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Use at least ${MIN_PASSWORD_LENGTH} characters.`);
      ok = false;
    } else {
      setPasswordError(null);
    }

    if (isSignUp) {
      if (!name.trim()) {
        setNameError('Enter your name.');
        ok = false;
      } else setNameError(null);

      if (!confirmPassword) {
        setConfirmError('Confirm your password.');
        ok = false;
      } else if (confirmPassword !== password) {
        setConfirmError('Passwords do not match.');
        ok = false;
      } else setConfirmError(null);
    }
    return ok;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submission === 'loading') return;
    setFormError(null);
    if (!validate()) return;
    setSubmission('loading');
    try {
      if (isSignUp) {
        await auth().signUpWithPassword({ email: email.trim(), password, name: name.trim() });
      } else {
        await auth().signInWithPassword({ email: email.trim(), password });
      }
      onAuthenticated?.();
      return;
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmission('idle');
    }
  };

  const handleGoogle = async () => {
    if (googleLoading) return;
    setFormError(null);
    setGoogleLoading(true);
    try {
      await auth().signInWithGoogle();
      onAuthenticated?.();
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotLoading) return;
    setForgotError(null);
    const msg = validateEmail(forgotEmail);
    if (msg) {
      setForgotError(msg);
      return;
    }
    setForgotLoading(true);
    try {
      await auth().resetPassword(forgotEmail.trim());
      setForgot('sent');
    } catch (err) {
      if (err instanceof AuthError && err.code === 'not_configured') {
        setForgotError('Password reset isn’t connected yet.');
      } else {
        setForgotError('Couldn’t send the reset email. Please try again.');
      }
    } finally {
      setForgotLoading(false);
    }
  };

  if (forgot === 'sent') {
    return (
      <div className="animate-fade-in">
        <h1 className="font-serif text-2xl font-semibold text-ink-900 tracking-tight">Check your email</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          If an account exists for <span className="font-medium text-ink-800">{forgotEmail}</span>, you’ll receive a link to reset your password.
        </p>
        <div className="mt-6">
          <Button
            variant="secondary"
            onClick={() => { setForgot('idle'); setForgotError(null); }}
          >
            Back to sign in
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" key={mode}>
      <div className="mb-7">
        <h1 className="font-serif text-[28px] leading-tight font-semibold text-ink-900 tracking-tight">
          {isSignUp ? 'Create your StudyOS account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-ink-600">
          {isSignUp
            ? 'Set up your workspace and keep your syllabuses organized.'
            : 'Sign in to continue to your study workspace.'}
        </p>
      </div>

      {formError && (
        <div className="mb-5">
          <AuthErrorBanner message={formError} onDismiss={() => setFormError(null)} />
        </div>
      )}

      <GoogleAuthButton onClick={handleGoogle} loading={googleLoading} />

      <AuthDivider />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {isSignUp && (
          <FieldGroup label="Name" htmlFor="signup-name" error={nameError}>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => { setName(e.target.value); if (nameError) setNameError(null); }}
              aria-invalid={!!nameError || undefined}
              aria-describedby={nameError ? 'signup-name-error' : undefined}
              className={inputClass(!!nameError)}
              disabled={submission === 'loading'}
            />
          </FieldGroup>
        )}

        <EmailField
          label="Email"
          value={email}
          onChange={(v) => setEmail(v)}
          error={emailError}
          autoComplete="email"
          disabled={submission === 'loading'}
        />

        <PasswordField
          label="Password"
          value={password}
          onChange={(v) => setPassword(v)}
          error={passwordError}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          hint={isSignUp ? `At least ${MIN_PASSWORD_LENGTH} characters` : undefined}
          disabled={submission === 'loading'}
        />

        {isSignUp && (
          <FieldGroup label="Confirm password" htmlFor="signup-confirm" error={confirmError}>
            <input
              id="signup-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); if (confirmError) setConfirmError(null); }}
              aria-invalid={!!confirmError || undefined}
              aria-describedby={confirmError ? 'signup-confirm-error' : undefined}
              className={inputClass(!!confirmError)}
              disabled={submission === 'loading'}
            />
          </FieldGroup>
        )}

        {!isSignUp && (
          <div className="flex justify-end -mt-1">
            <button
              type="button"
              onClick={() => { setForgot('form'); setForgotEmail(email); setForgotError(null); }}
              className="text-sm text-sage-600 hover:text-sage-700 transition focus-ring rounded"
            >
              Forgot password?
            </button>
          </div>
        )}

        <Button type="submit" loading={submission === 'loading'} className="w-full">
          {submission === 'loading'
            ? isSignUp ? 'Creating account…' : 'Signing in…'
            : isSignUp ? 'Create account' : 'Sign in'}
          {submission !== 'loading' && <ArrowRight className="h-4 w-4" aria-hidden />}
        </Button>
      </form>

      {forgot === 'form' && (
        <form
          onSubmit={handleForgotSubmit}
          className="mt-5 rounded-md border border-line bg-paper-100 p-4 animate-fade-in"
        >
          <h2 className="font-serif text-lg font-semibold text-ink-900 tracking-tight">Reset your password</h2>
          <p className="mt-1 text-sm leading-relaxed text-ink-600">
            Enter your account email and we’ll send you a reset link.
          </p>
          <div className="mt-3">
            <label htmlFor="forgot-email" className="text-sm font-medium text-ink-800">Email</label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              value={forgotEmail}
              onChange={(e) => { setForgotEmail(e.target.value); if (forgotError) setForgotError(null); }}
              aria-invalid={!!forgotError || undefined}
              aria-describedby={forgotError ? 'forgot-email-error' : undefined}
              className={`${inputClass(!!forgotError)} mt-1.5`}
              disabled={forgotLoading}
            />
            {forgotError && (
              <p id="forgot-email-error" className="mt-1.5 text-xs text-rose-600 animate-fade-in" role="alert">
                {forgotError}
              </p>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => { setForgot('idle'); setForgotError(null); }}
              className="text-sm text-ink-500 hover:text-ink-800 transition focus-ring rounded"
            >
              Cancel
            </button>
            <Button type="submit" variant="secondary" loading={forgotLoading}>
              {forgotLoading ? 'Sending…' : 'Send reset link'}
            </Button>
          </div>
        </form>
      )}

      <p className="mt-6 text-sm text-ink-600 text-center">
        {isSignUp ? 'Already have an account?' : 'New to StudyOS?'}{' '}
        <button
          type="button"
          onClick={() => switchMode(isSignUp ? 'sign-in' : 'sign-up')}
          className="font-medium text-ink-900 underline decoration-line-strong underline-offset-2 hover:decoration-ink-900 transition focus-ring rounded"
        >
          {isSignUp ? 'Sign in' : 'Create an account'}
        </button>
      </p>
    </div>
  );
}

function FieldGroup({ label, htmlFor, error, children }: { label: string; htmlFor: string; error?: string | null; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">{label}</label>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return [
    'w-full rounded-md border bg-paper-50 px-3 py-2.5 text-[15px] text-ink-900 placeholder:text-ink-400 transition duration-150 focus:outline-none',
    hasError ? 'border-rose-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200' : 'border-line-strong field-focus',
    'disabled:opacity-60 disabled:cursor-not-allowed',
  ].join(' ');
}
