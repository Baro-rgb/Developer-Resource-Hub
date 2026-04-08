// src/pages/Welcome.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-3xl bg-slate-800 border border-slate-700 rounded-3xl p-10 shadow-2xl text-center">
        <h1 className="text-5xl font-bold text-white mb-6">Chào mừng đến Kho Tài Nguyên</h1>
        <p className="text-slate-300 text-lg mb-8">
          Bạn đang xem trang chào mừng. Đăng nhập hoặc đăng ký để xem và quản lý kho tài nguyên của bạn.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link to="/login" className="btn btn-primary px-10 py-4">
            Đăng nhập
          </Link>
          <Link to="/register" className="btn btn-secondary px-10 py-4">
            Đăng ký
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
