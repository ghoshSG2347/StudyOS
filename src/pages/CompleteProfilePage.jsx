import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  BookOpen, AtSign, Check, X, Loader2, AlertCircle, Sparkles, ArrowRight, Copy, LogOut
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

const PROFILES_SQL = `-- Run this in Supabase SQL Editor (SQL Editor -> New query)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);`;

/* ─── Username availability check hook ───────────────────────────────── */
function useUsernameCheck(username) {
  const [status, setStatus] = useState('idle');
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

        if (error) { setStatus('idle'); return; }
        setStatus(data ? 'taken' : 'available');
      } catch (err) {
        setStatus('idle');
      }
    }, 400);

    return () => clearTimeout(timerRef.current);
  }, [username]);

  return status;
}

export default function CompleteProfilePage() {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, signOut } = useAuth();

  const [username, setUsername] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [isTableMissing, setIsTableMissing] = useState(false);
  const [copied, setCopied]     = useState(false);

  const usernameStatus = useUsernameCheck(username);
  const cardRef        = useRef(null);

  // Pre-fill suggested username from Google metadata or email
  useEffect(() => {
    if (user && !username) {
      const metaName = user.user_metadata?.full_name || user.user_metadata?.name || user.user_metadata?.username || '';
      const emailPrefix = user.email ? user.email.split('@')[0] : '';
      const rawSuggestion = metaName || emailPrefix || '';
      const cleanSuggestion = rawSuggestion.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 20);
      if (cleanSuggestion.length >= 3) {
        setUsername(cleanSuggestion);
      }
    }
  }, [user, username]);

  // If user already has a profile in profiles table, redirect to app
  useEffect(() => {
    if (profile) {
      navigate('/', { replace: true });
    }
  }, [profile, navigate]);

  // GSAP Entrance animation
  useEffect(() => {
    if (!cardRef.current) return;
    const els = cardRef.current.querySelectorAll('[data-anim]');
    gsap.fromTo(
      els,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.08 }
    );
  }, []);

  const handleCopySql = () => {
    navigator.clipboard.writeText(PROFILES_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsTableMissing(false);

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError('Please choose a username.');
      return;
    }
    if (usernameStatus === 'taken') {
      setError('That username is taken. Please select another.');
      return;
    }
    if (usernameStatus === 'invalid') {
      setError('Username must be 3–20 characters and contain only letters, numbers, and underscores.');
      return;
    }

    if (!user) {
      setError('No active session found. Please sign in again.');
      return;
    }

    setLoading(true);

    try {
      // Insert profile row into profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          username: trimmedUsername,
          email: user.email || '',
        });

      if (profileError) {
        const msg = profileError.message || '';
        if (profileError.code === '23505') {
          throw new Error('That username is already taken. Please choose a different username.');
        }
        if (
          msg.toLowerCase().includes('could not find the table') ||
          msg.toLowerCase().includes('schema cache') ||
          msg.toLowerCase().includes('does not exist') ||
          profileError.code === '42P01' ||
          profileError.code === 'PGRST205'
        ) {
          setIsTableMissing(true);
          throw new Error("Table 'public.profiles' does not exist in your Supabase project yet.");
        }
        throw profileError;
      }

      // Update auth context profile state
      refreshProfile(user.id);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message || 'Could not save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px]" />
      </div>

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
            PROFILE SETUP
          </span>
        </div>

        {/* Glass Card */}
        <div className="bg-white/[0.04] border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div data-anim className="mb-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3 text-indigo-400">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="font-display font-black text-2xl text-white mb-1 tracking-tight">
              Choose a username
            </h1>
            <p className="text-slate-400 text-sm">
              Welcome! Complete your account profile to access StudyOS
            </p>
          </div>

          {/* User Email Badge */}
          {user?.email && (
            <div data-anim className="mb-5 px-3.5 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-center text-xs font-mono text-slate-300">
              Signed in as <span className="text-indigo-400 font-bold">{user.email}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div data-anim className="space-y-3 mb-5 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                <span className="font-semibold text-white">{error}</span>
              </div>

              {/* Special Diagnostic Box for Missing profiles Table */}
              {isTableMissing && (
                <div className="pt-2 border-t border-red-500/20 text-xs space-y-2.5 text-slate-300">
                  <p>
                    The <code className="text-indigo-300 font-mono">public.profiles</code> table has not been created in your Supabase database yet.
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Run this SQL in your Supabase Dashboard (<strong className="text-white">SQL Editor ➔ New query ➔ Run</strong>):
                  </p>
                  <div className="relative bg-slate-900/90 rounded-xl p-3 border border-white/10 font-mono text-[10px] text-indigo-200 overflow-x-auto">
                    <pre>{PROFILES_SQL}</pre>
                    <button
                      type="button"
                      onClick={handleCopySql}
                      className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      {copied ? 'Copied!' : 'Copy SQL'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div data-anim className="space-y-1.5">
              <label htmlFor="cp-username" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                Username <span className="text-indigo-400">*</span>
              </label>
              <div className="relative">
                <AtSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  id="cp-username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="alex_master"
                  required
                  autoFocus
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all"
                />
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                  {usernameStatus === 'checking'  && <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />}
                  {usernameStatus === 'available' && <Check   className="w-4 h-4 text-emerald-400" />}
                  {(usernameStatus === 'taken' || usernameStatus === 'invalid') && <X className="w-4 h-4 text-red-400" />}
                </div>
              </div>

              {usernameStatus === 'taken' && (
                <p className="text-[11px] text-red-400 font-mono pl-1">Username is already taken</p>
              )}
              {usernameStatus === 'invalid' && (
                <p className="text-[11px] text-amber-400 font-mono pl-1">3–20 characters, letters/numbers/underscores</p>
              )}
              {usernameStatus === 'available' && (
                <p className="text-[11px] text-emerald-400 font-mono pl-1">Available!</p>
              )}
            </div>

            <div data-anim className="pt-2">
              <button
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
                    <span>Saving Profile…</span>
                  </>
                ) : (
                  <>
                    <span>Complete Profile & Continue</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Sign Out Option */}
          <div data-anim className="mt-5 pt-4 border-t border-white/[0.06] text-center">
            <button
              type="button"
              onClick={signOut}
              className="text-xs text-slate-500 hover:text-red-400 font-mono transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out & use a different account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
