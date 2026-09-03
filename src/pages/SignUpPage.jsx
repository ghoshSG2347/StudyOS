import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight,
  Loader2, AlertCircle, CheckCircle2, AtSign, Check, X, ShieldCheck
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

/* ─── Password strength rules & calculator ───────────────────────────── */
const STRENGTH_RULES = [
  { label: 'Min. 8 characters',    test: (p) => p.length >= 8 },
  { label: 'Uppercase letter (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { label: 'Number (0-9)',          test: (p) => /[0-9]/.test(p) },
  { label: 'Special symbol (!@#$%)', test: (p) => /[^A-Za-z0-9]/.test(p) },
];

function getStrength(password) {
  if (!password) return { score: 0, label: '', color: '', textClass: '' };
  const passed = STRENGTH_RULES.filter((r) => r.test(password)).length;
  if (passed <= 1) {
    return { score: 1, label: 'Weak', color: 'bg-red-500', textClass: 'text-red-400' };
  }
  if (passed <= 3) {
    return { score: 2, label: 'Medium', color: 'bg-amber-400', textClass: 'text-amber-400' };
  }
  return { score: 3, label: 'Strong', color: 'bg-emerald-500', textClass: 'text-emerald-400' };
}

/* ─── Username availability hook (debounced) ────────────────────────── */
function useUsernameCheck(username) {
  const [status, setStatus] = useState('idle'); // 'idle'|'checking'|'available'|'taken'|'invalid'
  const timerRef = useRef(null);

  useEffect(() => {
    clearTimeout(timerRef.current);
    const trimmed = username.trim();
    if (!trimmed) { setStatus('idle'); return; }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) { setStatus('invalid'); return; }

    setStatus('checking');
    timerRef.current = setTimeout(async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .ilike('username', trimmed)
          .maybeSingle();

        if (error) {
          console.warn('[UsernameCheck] error:', error.message);
          setStatus('idle');
          return;
        }
        setStatus(data ? 'taken' : 'available');
      } catch (err) {
        setStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [username]);

  return status;
}

/* ─── Main SignUpPage Component ──────────────────────────────────────── */
export default function SignUpPage() {
  const navigate   = useNavigate();
  const { user, profile }   = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [done, setDone]         = useState(false); // "Check your email" verification screen

  const usernameStatus = useUsernameCheck(username);
  const strength       = getStrength(password);
  const cardRef        = useRef(null);

  // Redirect if already logged in with complete profile
  useEffect(() => {
    if (user && profile) {
      navigate('/', { replace: true });
    }
  }, [user, profile, navigate]);

  // GSAP entrance stagger animation matching established design
  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll('[data-anim]');
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }
    );
  }, [done]);

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Pre-submit client validation checks
    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim();

    if (!trimmedUsername) {
      setError('Please enter a username.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('That username is already taken. Please choose another.');
      return;
    }
    if (usernameStatus === 'invalid') {
      setError('Username must be 3–20 characters and contain only letters, numbers, and underscores.');
      return;
    }
    if (usernameStatus === 'checking') {
      setError('Checking username availability... Please wait a second.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }
    if (strength.score < 2) {
      setError('Password is too weak. Please include at least 8 characters, numbers, or special symbols.');
      return;
    }

    setLoading(true);

    try {
      // 1. Call supabase.auth.signUp() with email, password, and options.data.username
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            username: trimmedUsername,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      // 2. Insert row into public.profiles table
      if (signUpData?.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: signUpData.user.id,
            username: trimmedUsername,
            email: trimmedEmail,
          });

        if (profileError) {
          console.warn('[SignUp] Profile insert warning:', profileError.message);
          // If error is duplicate username constraint violation from DB
          if (profileError.code === '23505') {
            throw new Error('That username is already taken. Please try a different username.');
          }
        }
      }

      // 3. Show "Check your email to verify your account" screen
      setDone(true);
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('email address is already in use')) {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (msg.toLowerCase().includes('username') && msg.toLowerCase().includes('taken')) {
        setError('That username is already taken. Please pick another.');
      } else if (msg.toLowerCase().includes('password')) {
        setError('Password does not meet security requirements: ' + msg);
      } else {
        setError(msg || 'An error occurred during sign up. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ── "Check your email to verify your account" Screen ── */
  if (done) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
        <AmbientGlows />
        <NoiseGrid />

        <div ref={cardRef} className="relative w-full max-w-md text-center space-y-6 z-10">
          <div data-anim className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>

          <div data-anim>
            <h1 className="font-display font-black text-3xl text-white mb-2 tracking-tight">
              Check your inbox
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto">
              We sent a verification link to{' '}
              <span className="text-indigo-400 font-semibold font-mono">{email}</span>.
              Click the link in your email to confirm your account and get started.
            </p>
          </div>

          <div data-anim className="pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl
                bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm
                transition-all shadow-lg shadow-indigo-500/25 cursor-pointer active:scale-[0.98]"
            >
              Go to Sign In <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <p data-anim className="text-xs text-slate-600 font-mono">
            Didn't receive an email? Check your spam folder or try signing up again.
          </p>
        </div>
      </div>
    );
  }

  /* ── Main Sign Up Form ── */
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
            SIGN UP
          </span>
        </div>

        {/* Glass Card Container */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div data-anim className="mb-6">
            <h1 className="font-display font-black text-2xl text-white mb-1 tracking-tight">
              Create your account
            </h1>
            <p className="text-slate-400 text-sm">
              Start tracking your academic syllabus mastery
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div data-anim className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-in fade-in">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Username Field */}
            <div data-anim className="space-y-1.5">
              <label htmlFor="su-username" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Username <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="su-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alex_master"
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all"
                />
                {/* Live Availability Indicator */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking'  && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
                  {usernameStatus === 'available' && <Check   className="w-4 h-4 text-emerald-400" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X className="w-4 h-4 text-red-400" />}
                </div>
              </div>
              {/* Dynamic Username Helper Messages */}
              {usernameStatus === 'taken' && (
                <p className="text-[11px] text-red-400 font-mono pl-1">Username is already taken</p>
              )}
              {usernameStatus === 'invalid' && (
                <p className="text-[11px] text-amber-400 font-mono pl-1">3–20 characters, letters/numbers/underscores</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-[11px] text-emerald-400 font-mono pl-1">Username is available!</p>
              )}
            </div>

            {/* 2. Email Field */}
            <div data-anim className="space-y-1.5">
              <label htmlFor="su-email" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Email Address <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="su-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            {/* 3. Password Field + Live Strength Meter */}
            <div data-anim className="space-y-2">
              <label htmlFor="su-password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Password <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="su-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create password"
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

              {/* Live Password Strength Meter */}
              {password && (
                <div className="space-y-2 pt-1">
                  {/* Visual Bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden flex gap-1">
                      {[1, 2, 3].map((step) => (
                        <div
                          key={step}
                          className={`flex-1 h-full rounded-full transition-all duration-300 ${
                            (step === 1 && strength.score >= 1) ? strength.color :
                            (step === 2 && strength.score >= 2) ? strength.color :
                            (step === 3 && strength.score >= 3) ? strength.color : 'bg-transparent'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-[11px] font-mono font-bold w-14 text-right ${strength.textClass}`}>
                      {strength.label}
                    </span>
                  </div>

                  {/* Criteria Checklist */}
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 pt-0.5">
                    {STRENGTH_RULES.map((rule) => {
                      const met = rule.test(password);
                      return (
                        <div key={rule.label} className={`flex items-center gap-1.5 text-[10px] font-mono transition-colors ${
                          met ? 'text-emerald-400' : 'text-slate-600'
                        }`}>
                          <span className={`w-3 h-3 rounded-full flex-shrink-0 flex items-center justify-center ${
                            met ? 'bg-emerald-500/20' : 'bg-white/[0.05]'
                          }`}>
                            {met && <Check className="w-2 h-2" />}
                          </span>
                          {rule.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div data-anim className="pt-2">
              <button
                id="signup-submit-btn"
                type="submit"
                disabled={loading || usernameStatus === 'taken' || usernameStatus === 'invalid' || usernameStatus === 'checking'}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm
                  bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                  text-white shadow-lg shadow-indigo-500/25 transition-all
                  disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account…</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Link to Login */}
          <p data-anim className="text-center text-sm text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors underline-offset-2 hover:underline">
              Sign In
            </Link>
          </p>
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
