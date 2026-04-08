// src/pages/Register.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-6">Đăng ký</h1>
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-900 text-red-100">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-slate-200">
            Tên
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-600 bg-slate-950 px-4 py-3 text-white"
              placeholder="Tên của bạn"
              required
            />
          </label>
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
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
          </button>
        </form>
        <p className="mt-6 text-sm text-slate-400">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-sky-300 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
