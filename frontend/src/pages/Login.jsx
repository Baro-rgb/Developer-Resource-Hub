// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6">Đăng nhập</h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900 text-red-100">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-slate-200">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-white"
              placeholder="you@example.com"
              required
            />
          </label>
          <label className="block text-slate-200">
            Mật khẩu
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-white"
              placeholder="••••••••"
              required
            />
          </label>
          <button
            type="submit"
            className="w-full btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-sky-300 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
