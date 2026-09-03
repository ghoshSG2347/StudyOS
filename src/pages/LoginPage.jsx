import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight,
  Loader2, AlertCircle, KeyRound, RefreshCw, ShieldCheck, UserCheck
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate   = useNavigate();
  const { user, profile }   = useAuth();

  // Form State
  const [identifier, setIdentifier] = useState(''); // Username or Email
  const [password, setPassword]     = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [step, setStep]             = useState('credentials'); // 'credentials' | 'otp'
  const [resolvedEmail, setResolvedEmail] = useState('');
  
  // OTP State (6 Digits)
  const [otpDigits, setOtpDigits]   = useState(['', '', '', '', '', '']);
  const otpInputRefs                = useRef([]);
  const [cooldown, setCooldown]     = useState(30);
  const [canResend, setCanResend]   = useState(false);

  // Status & Error
  const [loading, setLoading]             = useState(false);
  const [otpLoading, setOtpLoading]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError]                 = useState('');
  const [infoMessage, setInfoMessage]     = useState('');

  const cardRef = useRef(null);

  // Redirect if already logged in with complete profile
  useEffect(() => {
    if (user && profile) {
      navigate('/', { replace: true });
    }
  }, [user, profile, navigate]);

  // GSAP Entrance animation whenever step changes
  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll('[data-anim]');
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }
    );
  }, [step]);

  // Auto-focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // 30-Second Cooldown Timer for Resend OTP
  useEffect(() => {
    let timer = null;
    if (step === 'otp' && cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Step 1 Submit: Authenticate Password & Send OTP Code
  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const inputVal = identifier.trim();
    if (!inputVal || !password) {
      setError('Please enter your email or username and password.');
      return;
    }

    setLoading(true);

    try {
      let targetEmail = inputVal;

      // Detect if input is an email (contains '@') or a username
      if (!inputVal.includes('@')) {
        // Query profiles table to find matching email for username
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('email')
          .ilike('username', inputVal)
          .maybeSingle();

        if (profileErr || !profileData?.email) {
          throw new Error('No account found with that username. Please check your username or sign up.');
        }
        targetEmail = profileData.email;
      }

      setResolvedEmail(targetEmail);

      // Verify credentials with signInWithPassword
      const { error: authErr } = await supabase.auth.signInWithPassword({
        email: targetEmail,
        password,
      });

      if (authErr) {
        if (authErr.message.toLowerCase().includes('invalid login credentials')) {
          throw new Error('Invalid email/username or password. Please check your details.');
        }
        if (authErr.message.toLowerCase().includes('email not confirmed')) {
          throw new Error('Your email address has not been confirmed yet. Please check your inbox for the verification link.');
        }
        throw authErr;
      }

      // Credentials verified! Now trigger OTP send for 2FA
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: targetEmail,
      });

      if (otpErr) {
        console.warn('[Login] OTP send notice:', otpErr.message);
        // Even if signInWithOtp returns rate-limit or minor error, proceed to OTP step if email code was sent
      }

      // Transition to OTP verification step
      setStep('otp');
      setCooldown(30);
      setCanResend(false);
      setInfoMessage(`We've sent a 6-digit code to ${targetEmail}`);
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP Box Key & Input Handlers (Auto-focus & Paste Support)
  const handleOtpChange = (index, value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    // Handle single character or paste of multiple digits
    const updated = [...otpDigits];
    if (cleaned.length === 1) {
      updated[index] = cleaned;
      setOtpDigits(updated);
      if (index < 5) {
        otpInputRefs.current[index + 1]?.focus();
      }
    } else if (cleaned.length > 1) {
      // Pasted multi-digit token (e.g. "123456")
      const pastedDigits = cleaned.slice(0, 6).split('');
      pastedDigits.forEach((digit, idx) => {
        if (idx < 6) updated[idx] = digit;
      });
      setOtpDigits(updated);
      const nextFocus = Math.min(pastedDigits.length, 5);
      otpInputRefs.current[nextFocus]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (pastedText) {
      const digits = pastedText.slice(0, 6).split('');
      const updated = ['', '', '', '', '', ''];
      digits.forEach((d, idx) => { updated[idx] = d; });
      setOtpDigits(updated);
      const focusIdx = Math.min(digits.length, 5);
      otpInputRefs.current[focusIdx]?.focus();
    }
  };

  // Step 2 Submit: Verify 6-Digit OTP Token
  const handleVerifyOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const token = otpDigits.join('');
    if (token.length < 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setOtpLoading(true);

    try {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email: resolvedEmail,
        token,
        type: 'email',
      });

      if (verifyErr) {
        throw new Error('Invalid or expired OTP code. Please check the code or click Resend.');
      }

      // OTP verified successfully! Session established
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'OTP verification failed.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP Code Handler
  const handleResendCode = async () => {
    if (!canResend || resendLoading) return;

    setError('');
    setInfoMessage('');
    setResendLoading(true);

    try {
      const { error: resendErr } = await supabase.auth.signInWithOtp({
        email: resolvedEmail,
      });

      if (resendErr) throw resendErr;

      setInfoMessage(`A fresh 6-digit code has been sent to ${resolvedEmail}`);
      setCooldown(30);
      setCanResend(false);
      setOtpDigits(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } catch (err) {
      setError(err.message || 'Failed to resend code. Please try again in a few seconds.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      <AmbientGlows />
      <NoiseGrid />

      <div className="relative w-full max-w-md z-10" ref={cardRef}>
        {/* Brand Wordmark */}
        <div data-anim className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-display font-black text-2xl tracking-tight text-white">
            Study<span className="text-indigo-400">OS</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
            SECURE LOGIN
          </span>
        </div>

        {/* Glass Card Container */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          
          {/* STEP 1: CREDENTIALS INPUT FORM */}
          {step === 'credentials' && (
            <>
              <div data-anim className="mb-6">
                <h1 className="font-display font-black text-2xl text-white mb-1 tracking-tight">
                  Welcome back
                </h1>
                <p className="text-slate-400 text-sm">
                  Sign in to continue your syllabus study session
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div data-anim className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-in fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                {/* Single Input: Username or Email */}
                <div data-anim className="space-y-1.5">
                  <label htmlFor="login-identifier" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Username or Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="login-identifier"
                      type="text"
                      autoComplete="username"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="username or user@university.edu"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div data-anim className="space-y-1.5">
                  <label htmlFor="login-password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                    <input
                      id="login-password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <div data-anim className="pt-2">
                  <button
                    id="login-submit-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm
                      bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                      text-white shadow-lg shadow-indigo-500/25 transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials…</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4" />
                        <span>Sign In</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Link to Sign Up */}
              <p data-anim className="text-center text-sm text-slate-400 mt-6">
                Don't have an account?{' '}
                <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline-offset-2 hover:underline">
                  Create Account
                </Link>
              </p>
            </>
          )}

          {/* STEP 2: 2-STEP OTP CODE VERIFICATION SCREEN */}
          {step === 'otp' && (
            <>
              <div data-anim className="mb-6 text-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400 shadow-md shadow-indigo-500/10">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="font-display font-black text-2xl text-white mb-1 tracking-tight">
                  Security Code Verification
                </h1>
                <p className="text-slate-400 text-sm">
                  We've sent a 6-digit code to{' '}
                  <span className="text-indigo-300 font-mono font-semibold">{resolvedEmail}</span>
                </p>
              </div>

              {/* Info / Success Message */}
              {infoMessage && (
                <div data-anim className="flex items-center gap-2 mb-4 px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs">
                  <UserCheck className="w-4 h-4 flex-shrink-0" />
                  <span>{infoMessage}</span>
                </div>
              )}

              {/* Error Banner */}
              {error && (
                <div data-anim className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-in fade-in">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleVerifyOtpSubmit} className="space-y-6">
                {/* 6-Digit OTP Boxes */}
                <div data-anim className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputRefs.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6} // Allow paste of full code
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-11 sm:w-12 h-13 text-center text-xl font-mono font-bold rounded-xl bg-white/[0.06] border border-white/10 text-white focus:outline-none focus:border-indigo-500 focus:bg-white/[0.10] focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  ))}
                </div>

                {/* Submit Verification Button */}
                <div data-anim>
                  <button
                    id="verify-otp-btn"
                    type="submit"
                    disabled={otpLoading || otpDigits.join('').length < 6}
                    className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm
                      bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                      text-white shadow-lg shadow-indigo-500/25 transition-all
                      disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
                  >
                    {otpLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Code…</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>Verify & Open StudyOS</span>
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Resend Code Section with 30s Cooldown */}
              <div data-anim className="mt-6 text-center space-y-3 pt-2 border-t border-white/[0.06]">
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={!canResend || resendLoading}
                    className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors disabled:text-slate-600 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 underline-offset-2 hover:underline"
                  >
                    {resendLoading ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" /> Sending…
                      </>
                    ) : canResend ? (
                      <>
                        <RefreshCw className="w-3 h-3" /> Resend Code
                      </>
                    ) : (
                      <span>Resend code in {cooldown}s</span>
                    )}
                  </button>
                </div>

                {/* Back to credentials step */}
                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('credentials');
                      setError('');
                      setInfoMessage('');
                    }}
                    className="text-xs text-slate-500 hover:text-slate-300 font-mono transition-colors cursor-pointer"
                  >
                    ← Back to login options
                  </button>
                </div>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

/* ─── Ambient Glows Background ───────────────────────────────────────── */
function AmbientGlows() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
    </div>
  );
}

/* ─── Noise Grid Pattern ─────────────────────────────────────────────── */
function NoiseGrid() {
  return (
    <div
      className="absolute inset-0 opacity-[0.025] pointer-events-none"
      style={{
        backgroundImage: `linear-gradient(rgba(99,102,241,.6) 1px, transparent 1px),
                          linear-gradient(90deg, rgba(99,102,241,.6) 1px, transparent 1px)`,
        backgroundSize: '44px 44px',
      }}
    />
  );
}
