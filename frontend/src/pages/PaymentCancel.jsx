import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle, ArrowLeft } from 'lucide-react';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center animate-[slideIn_0.5s_ease-out]">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-red-500/20 rounded-full flex items-center justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Đã hủy thanh toán</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Bạn đã hủy quá trình thanh toán. Tài khoản của bạn vẫn được giữ nguyên gói hiện tại. Đừng ngần ngại quay lại nếu bạn đổi ý nhé!
        </p>

        <Link
          to="/pricing"
          className="inline-flex items-center justify-center w-full py-4 rounded-xl font-bold bg-slate-800 text-white hover:bg-slate-700 transition-colors"
        >
          <ArrowLeft className="mr-2 w-5 h-5" /> Thử lại
        </Link>
        <Link
          to="/"
          className="block mt-4 text-slate-500 hover:text-slate-300 text-sm transition-colors"
        >
          Trở về Bảng điều khiển
        </Link>
      </div>
    </div>
  );
};

export default PaymentCancel;
