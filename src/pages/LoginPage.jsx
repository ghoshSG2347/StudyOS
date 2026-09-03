import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && profile) navigate('/', { replace: true });
  }, [user, profile, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !password) {
      setError('Please enter your email and password.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      if (authError) {
        const message = authError.message.toLowerCase();
        if (message.includes('invalid login credentials') || message.includes('email not confirmed')) {
          throw new Error('Email or password is incorrect.');
        }
        throw new Error('Something went wrong. Please try again.');
      }
    } catch (authError) {
      setError(authError.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthFrame label="SECURE LOGIN">
      <div ref={(node) => node && gsap.fromTo(node, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7 })}>
        <h1 className="font-display font-black text-2xl text-white mb-1 tracking-tight">Welcome back</h1>
        <p className="text-slate-400 text-sm">Sign in to continue your syllabus study session</p>
      </div>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <form onSubmit={handleSubmit} className="space-y-4 mt-6">
        <Field label="Email address" id="login-email" icon={<Mail />} value={email} onChange={setEmail} type="email" autoComplete="email" />
        <div className="space-y-1.5">
          <label htmlFor="login-password" className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input id="login-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required className={inputClass('pl-10 pr-11')} />
            <button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 cursor-pointer">
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold">Forgot Password?</Link>
        </div>
        <SubmitButton loading={loading} label="Sign In" />
      </form>
      <p className="text-center text-sm text-slate-400 mt-6">Don't have an account? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-bold">Register</Link></p>
    </AuthFrame>
  );
}

function AuthFrame({ label, children }) {
  return <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100"><Ambient /><div className="relative w-full max-w-md z-10"><div className="flex items-center justify-center gap-2.5 mb-8"><img src="/logo-cropped.png" alt="StudyOS" className="w-10 h-10 rounded-2xl object-contain shadow-lg shadow-indigo-500/30" /><span className="font-display font-black text-2xl tracking-tight text-white">Study<span className="text-indigo-400">OS</span></span><span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold border border-indigo-500/30">{label}</span></div><div className="bg-white/[0.04] border border-white/10 rounded-3xl p-7 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">{children}</div></div></div>;
}
function Ambient() { return <><div className="absolute inset-0 pointer-events-none"><div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full bg-indigo-600/20 blur-[120px]" /><div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/15 blur-[120px]" /></div><div className="absolute inset-0 opacity-[0.025] pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(99,102,241,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,.6) 1px, transparent 1px)', backgroundSize: '44px 44px' }} /></>; }
function ErrorMessage({ children }) { return <div className="flex items-start gap-3 mt-5 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm"><AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" /><span>{children}</span></div>; }
function Field({ label, id, icon, value, onChange, type = 'text', autoComplete }) { return <div className="space-y-1.5"><label htmlFor={id} className="block text-[11px] font-bold text-slate-400 uppercase tracking-widest font-mono">{label}</label><div className="relative">{React.cloneElement(icon, { className: 'absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500' })}<input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required className={inputClass('pl-10 pr-4')} /></div></div>; }
function inputClass(padding) { return `w-full ${padding} py-3 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white/[0.08] transition-all`; }
function SubmitButton({ loading, label }) { return <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">{loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Please wait…</> : <><ArrowRight className="w-4 h-4" /> {label}</>}</button>; }

export { AuthFrame, ErrorMessage, Field, SubmitButton, inputClass };
