import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import {
  BookOpen, Mail, Lock, Eye, EyeOff, ArrowRight,
  Sparkles, CheckCircle2, AlertCircle, Loader2, User
} from 'lucide-react';

/**
 * AuthPage — full-screen Login / Sign Up screen.
 * Shown by main.jsx whenever no Supabase session exists.
 */
export default function AuthPage() {
  const [mode, setMode]           = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const isSignUp = mode === 'signup';

  const resetMessages = () => { setError(''); setSuccess(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    resetMessages();

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess(
          'Account created! Check your email for a confirmation link, then sign in.'
        );
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // onAuthStateChange in AuthContext will update user state → main.jsx shows App
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(m => m === 'signin' ? 'signup' : 'signin');
    resetMessages();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient background glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-indigo-500/10 blur-[80px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Card */}
      <div className="relative w-full max-w-md">

        {/* Wordmark */}
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">
            Study<span className="text-indigo-400">OS</span>
          </span>
          <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">
            BETA
          </span>
        </div>

        {/* Glass Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">

          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-black text-white tracking-tight mb-1.5">
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p className="text-slate-400 text-sm">
              {isSignUp
                ? 'Start tracking your syllabus mastery'
                : 'Sign in to continue your study session'}
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="flex items-start gap-3 mb-5 px-4 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm">
              <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{success}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="auth-email" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="auth-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@university.edu"
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="auth-password" className="block text-xs font-bold text-slate-400 uppercase tracking-widest">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="auth-password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  required
                  className="w-full pl-10 pr-11 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-[11px] text-slate-600 font-mono pl-1">
                  At least 6 characters required
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm
                bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500
                text-white shadow-lg shadow-indigo-500/25 transition-all
                disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
                active:scale-[0.98]"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : isSignUp ? (
                <><User className="w-4 h-4" /> Create Account</>
              ) : (
                <><ArrowRight className="w-4 h-4" /> Sign In</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-white/[0.07]" />
            <span className="text-slate-600 text-[11px] font-mono">OR</span>
            <div className="flex-1 h-px bg-white/[0.07]" />
          </div>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-slate-400">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={toggleMode}
              className="text-indigo-400 hover:text-indigo-300 font-bold transition-colors cursor-pointer underline-offset-2 hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>

        {/* Footer tagline */}
        <div className="flex items-center justify-center gap-1.5 mt-6 text-slate-600 text-[11px] font-mono">
          <Sparkles className="w-3 h-3" />
          <span>AI-Powered Syllabus Mastery Engine</span>
        </div>
      </div>
    </div>
  );
}
