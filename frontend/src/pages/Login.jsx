// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Terminal, ShieldCheck, Activity, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
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
      const response = await login({ email, password });
      const user = response?.data?.user;
      const redirectPath = user?.is_admin || user?.isAdmin ? '/admin' : '/';
      navigate(redirectPath);
    } catch (err) {
      const message = err.errors
        ? err.errors.map((item) => item.message).join(' | ')
        : err.message || 'Đăng nhập thất bại';
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
            Orchestrate your <span className="text-blue-300">infrastructure</span> with surgical precision.
          </motion.h1>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-12 max-w-lg text-lg text-slate-300">
            Access the industry-leading dashboard for high-stakes enterprise management and real-time operational authority.
          </motion.p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-700/40 bg-slate-800 p-6">
              <div className="mb-2 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-300" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Security Protocol</span>
              </div>
              <div className="text-2xl font-bold text-white">L-3 Encrypted</div>
            </div>
            <div className="rounded-xl border border-slate-700/40 bg-slate-800 p-6">
              <div className="mb-2 flex items-center gap-2">
                <Activity className="h-4 w-4 text-blue-300" />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Network Status</span>
              </div>
              <div className="text-2xl font-bold text-white">99.9% Uptime</div>
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
            <h2 className="mb-2 text-3xl font-bold text-white">System Access</h2>
            <p className="text-slate-400">Enter your credentials to manage authority.</p>
          </motion.div>

          {error && <div className="mb-4 rounded-lg bg-red-900/70 p-3 text-red-100">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block px-1 text-xs font-semibold uppercase tracking-widest text-slate-400" htmlFor="email">Institutional Email</label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-slate-500 group-focus-within:text-blue-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border-none bg-slate-800 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="name@organization.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between px-1">
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400" htmlFor="password">Secret Key</label>
                <button type="button" className="text-[10px] font-bold uppercase tracking-wider text-blue-300 hover:opacity-80">Reset Sequence</button>
              </div>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border-none bg-slate-800 py-4 pl-12 pr-12 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  placeholder="••••••••••••"
                  required
                />
                <button className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-slate-200" type="button" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <label className="flex cursor-pointer items-center gap-3 py-2">
              <input className="h-4 w-4 rounded border-none bg-slate-800 text-blue-400 focus:ring-blue-500/30" id="remember" type="checkbox" />
              <span className="text-sm text-slate-400">Maintain session for 24 hours</span>
            </label>

            <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-auth py-4 font-bold text-slate-950 shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30 active:scale-[0.98]" type="submit" disabled={loading}>
              {loading ? 'Đang đăng nhập...' : 'Initialize Dashboard'}
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </form>

          <div className="mt-10 border-t border-slate-700/30 pt-8 text-center">
            <p className="text-sm text-slate-400">
              New terminal operative?
              <Link to="/register" className="ml-1 font-bold text-blue-300 hover:underline">Request Authorization</Link>
            </p>
          </div>
        </div>

        <div className="absolute bottom-6 hidden w-full max-w-md text-center md:block">
          <p className="text-[10px] uppercase tracking-widest text-slate-600">© 2024 Digital Command. End-to-End Encryption Enabled.</p>
        </div>
      </main>
    </div>
  );
};

export default Login;
