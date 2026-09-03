import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage({ mode }) {
  const isRegister = mode === 'register';
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.email || !form.password || (isRegister && (!form.name || form.password !== form.confirm))) {
      setError(isRegister && form.password !== form.confirm ? 'Passwords do not match.' : 'Please complete all fields.');
      return;
    }
    setBusy(true);
    const result = isRegister
      ? await signUp(form.email, form.password, form.name)
      : await signIn(form.email, form.password);
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
        {isRegister && <input required placeholder="Full name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" />}
        <input required type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        <input required type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" />
        {isRegister && <input required type="password" placeholder="Confirm password" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3" />}
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button disabled={busy} className="w-full rounded-xl bg-indigo-600 py-3 font-bold text-white disabled:opacity-60">{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</button>
        <p className="text-center text-sm text-slate-500">{isRegister ? 'Already have an account?' : 'Need an account?'} <Link className="font-bold text-indigo-600" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Register'}</Link></p>
      </form>
    </main>
  );
}
