import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { AuthFrame, ErrorMessage, inputClass } from './LoginPage';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event) => {
    event.preventDefault(); setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Please enter a valid email address.'); return; }
    setLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/reset-password` });
      if (resetError) throw resetError;
      setSent(true);
    } catch (resetError) { setError('Something went wrong. Please try again.'); }
    finally { setLoading(false); }
  };
  return <AuthFrame label="PASSWORD RESET"><h1 className="font-display font-black text-2xl text-white mb-1">Forgot Password?</h1><p className="text-slate-400 text-sm mb-6">Enter your email and we’ll send a secure reset link.</p>{sent ? <div className="space-y-5"><div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm"><CheckCircle2 className="w-5 h-5 flex-shrink-0" /><span>If an account exists for this email, we've sent you a password reset link.</span></div><Link to="/login" className="flex items-center justify-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 font-bold"><ArrowLeft className="w-4 h-4" /> Back to Login</Link></div> : <><form onSubmit={submit} className="space-y-5"><div className="space-y-1.5"><label htmlFor="reset-email" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Email address</label><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input id="reset-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputClass('pl-10 pr-4')} /></div></div>{error && <ErrorMessage>{error}</ErrorMessage>}<button disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg disabled:opacity-50">{loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</> : 'Send Reset Link'}</button></form><Link to="/login" className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-white"><ArrowLeft className="w-4 h-4" /> Back to Login</Link></>}</AuthFrame>;
}
