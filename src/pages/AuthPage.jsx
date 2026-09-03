import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email.trim() || !form.password || (isRegister && !form.name.trim())) {
      setError('Please complete all fields.');
      return;
    }
    if (isRegister && !form.confirm) {
      setError('Please confirm your password.');
      return;
    }
    if (isRegister && form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    const result = isRegister
      ? await signUp(form.email.trim(), form.password, form.name.trim())
      : await signIn(form.email.trim(), form.password);
    setBusy(false);
    if (result.error) {
      setError(isRegister ? result.error.message : 'Email or password is incorrect.');
      return;
    }
    if (isRegister && !result.data.session) {
      setError('Check your email to confirm your account, then sign in.');
      return;
    }
    navigate(location.state?.from || '/');
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-5">
        <div>
          <h1 className="font-display text-3xl font-black text-slate-900">Study<span className="text-indigo-600">OS</span></h1>
          <p className="text-sm text-slate-500 mt-2">{isRegister ? 'Create your account' : 'Sign in to sync your syllabuses'}</p>
        </div>
        {isRegister && <input id="full-name" name="name" autoComplete="name" required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" />}
        <input id="email" name="email" autoComplete="email" required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        <div className="relative">
          <input id="password" name="password" autoComplete={isRegister ? 'new-password' : 'current-password'} required type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12" />
          <button type="button" onClick={() => setShowPassword(value => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {isRegister && <div className="relative">
          <input id="confirm-password" name="confirm-password" autoComplete="new-password" required type={showConfirmPassword ? 'text' : 'password'} placeholder="Confirm password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className={`w-full rounded-xl border px-4 py-3 pr-12 ${form.confirm && form.confirm !== form.password ? 'border-rose-400' : 'border-slate-200'}`} />
          <button type="button" onClick={() => setShowConfirmPassword(value => !value)} aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer">
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</button>
        <p className="text-center text-sm text-slate-500">{isRegister ? 'Already have an account?' : 'Need an account?'} <Link className="font-bold text-indigo-600" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Register'}</Link></p>
      </form>
    </main>
  );
}
