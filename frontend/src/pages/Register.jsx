// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, ShieldCheck, Activity, User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register({ name, email, password });
      navigate('/');
    } catch (err) {
      const message = err.errors
        ? err.errors.map((item) => item.message).join(' | ')
        : err.message || 'Đăng ký thất bại';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-hidden bg-slate-950 selection:bg-blue-400 selection:text-slate-950 md:flex">
      <div className="relative hidden items-center justify-center overflow-hidden border-r border-slate-700/30 bg-slate-950 md:flex md:w-1/2 lg:w-3/5">
        <div className="pointer-events-none absolute inset-0 opacity-20">
          <div className="absolute -left-[10%] -top-[10%] h-[600px] w-[600px] rounded-full bg-blue-400/20 blur-[120px]" />
          <div className="absolute -bottom-[10%] -right-[10%] h-[500px] w-[500px] rounded-full bg-amber-300/10 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl px-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-auth shadow-lg shadow-blue-500/20">
              <Terminal className="h-7 w-7 text-slate-950" />
            </div>
            <span className="text-3xl font-bold tracking-tight text-blue-300">CommandCenter</span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 text-5xl font-extrabold leading-tight text-white lg:text-6xl">
            Create your <span className="text-blue-300">authority</span> in minutes.
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 max-w-lg text-lg text-slate-300">
            Enroll your account to access enterprise resource management and operational command workflows.
          </motion.p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700/40 bg-slate-800 p-6">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-300" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Security Layer</span>
              </div>
              <div className="text-2xl font-bold text-white">Hardened Access</div>
            </div>
            <div className="rounded-xl border border-slate-700/40 bg-slate-800 p-6">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-300" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Provisioning</span>
              </div>
              <div className="text-2xl font-bold text-white">Instant Ready</div>
            </div>
          </div>
        </div>
      </div>

      <main className="relative flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="mb-12 flex items-center gap-3 md:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-auth">
              <Terminal className="h-6 w-6 text-slate-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-blue-300">CommandCenter</span>
          </div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mb-10">
            <h2 className="mb-2 text-3xl font-bold text-white">Create Authority</h2>
            <p className="text-slate-400">Register your credentials to initialize access.</p>
          </motion.div>

          {error && <div className="mb-4 rounded-lg bg-red-900/70 p-3 text-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-widest text-slate-400" htmlFor="name">Display Name</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-xl border-none bg-slate-800 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="Operator name" required />
              </div>
            </div>
            <div>
              <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-widest text-slate-400" htmlFor="email">Institutional Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-slate-500" />
                </div>
                <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-xl border-none bg-slate-800 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="name@organization.com" required />
              </div>
            </div>
            <div>
              <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-widest text-slate-400" htmlFor="password">Secret Key</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input id="password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border-none bg-slate-800 py-4 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30" placeholder="••••••••••••" required />
                <button className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-200" type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-auth py-4 font-bold text-slate-950 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 active:scale-[0.98]" type="submit" disabled={loading}>
              {loading ? 'Đang tạo tài khoản...' : 'Initialize Authority'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </form>

          <div className="mt-10 border-t border-slate-700/30 pt-8 text-center">
            <p className="text-sm text-slate-400">
              Existing operator?
              <Link to="/login" className="ml-1 font-bold text-blue-300 hover:underline">Sign in now</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
