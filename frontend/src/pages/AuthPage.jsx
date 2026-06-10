import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';


export default function AuthPage() {
  const { login, register } = useAuth();
  const [mode,     setMode]     = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [showPass, setShowPass] = useState(false);

  const set = (k, v) => { setForm((f) => ({ ...f, [k]: v })); setError(''); };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      if (!form.name.trim())              return setError('Name is required');
      if (form.password !== form.confirm) return setError('Passwords do not match');
      if (form.password.length < 6)      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => { setMode(m); setError(''); };

  return (
    <div className="min-h-screen bg-surface-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full -top-32 -left-24 bg-accent/10 blur-[100px] animate-pulse-slow" />
        <div className="absolute w-[400px] h-[400px] rounded-full bottom-0 -right-20 bg-emerald-500/8 blur-[90px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
      </div>

      {/* Brand */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8 relative z-10"
      >
        <span className="text-3xl text-accent" style={{ textShadow: '0 0 14px rgba(99,102,241,.7)' }}>⬡</span>
        <span className="text-2xl font-black text-white tracking-tight">TaskDash</span>
        <span className="text-[11px] font-semibold uppercase tracking-[2px] text-slate-600 border-l border-white/[0.08] pl-3">
          DevOps Suite
        </span>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
        className="glass rounded-2xl w-full max-w-md shadow-2xl overflow-hidden relative z-10"
      >
        {/* Tab switcher */}
        <div className="flex border-b border-white/[0.07]">
          {['login', 'register'].map((m) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`flex-1 py-4 text-sm font-bold capitalize transition-all border-b-2
                ${mode === m ? 'text-white border-accent' : 'text-slate-500 border-transparent hover:text-slate-300'}`}>
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="p-6 space-y-4">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{    opacity: 0, height: 0     }}
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm"
              >
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Name (register only) */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{    opacity: 0, height: 0     }}
              >
                <label className="label">Full Name</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">👤</span>
                  <input className="input pl-9" type="text" placeholder="Alex Kim"
                    value={form.name} onChange={(e) => set('name', e.target.value)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email */}
          <div>
            <label className="label">Email Address</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">✉</span>
              <input className="input pl-9" type="email" placeholder="you@company.io"
                value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="label">Password</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">🔒</span>
              <input className="input pl-9 pr-10" type={showPass ? 'text' : 'password'}
                placeholder="Min. 6 characters"
                value={form.password} onChange={(e) => set('password', e.target.value)} required />
              <button type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                onClick={() => setShowPass((v) => !v)}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Confirm password + role (register only) */}
          <AnimatePresence>
            {mode === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{    opacity: 0, height: 0     }}
                className="space-y-4"
              >
                <div>
                  <label className="label">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600">🔒</span>
                    <input className="input pl-9" type={showPass ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={form.confirm} onChange={(e) => set('confirm', e.target.value)} />
                  </div>
                </div>
           
              </motion.div>
            )}
          </AnimatePresence>

          <button type="submit" className="btn-primary w-full justify-center py-2.5 text-sm" disabled={loading}>
            {loading
              ? <span className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                </span>
              : mode === 'login' ? 'Sign In →' : 'Create Account →'
            }
          </button>
        </form>

        <div className="pb-5 text-center text-xs text-slate-600 border-t border-white/[0.07] pt-4 px-6 space-y-1">
          <p>
            {mode === 'login'
              ? <>New here? <button className="text-accent-400 hover:text-accent font-semibold" onClick={() => switchMode('register')}>Create an account</button></>
              : <>Have an account? <button className="text-accent-400 hover:text-accent font-semibold" onClick={() => switchMode('login')}>Sign in</button></>
            }
          </p>
          <p className="text-slate-700">💡 First registered account automatically receives Admin role.</p>
        </div>
      </motion.div>
    </div>
  );
}
