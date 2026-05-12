import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PaymentSuccess = () => {
  const { checkAuth } = useAuth();

  useEffect(() => {
    // Refresh user profile to fetch new subscription_plan
    if (checkAuth) {
      checkAuth();
    }
  }, [checkAuth]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center animate-[slideIn_0.5s_ease-out]">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 bg-emerald-500/20 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-4">Thanh toán thành công!</h1>
        <p className="text-slate-400 mb-8 leading-relaxed">
          Cảm ơn bạn đã nâng cấp lên gói Pro. Hệ thống đã tự động nâng cấp tài khoản của bạn. Chúc bạn có trải nghiệm tuyệt vời cùng Developer Resource Hub.
        </p>

        <Link
          to="/"
          className="inline-flex items-center justify-center w-full py-4 rounded-xl font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
        >
          Trở về Bảng điều khiển <ArrowRight className="ml-2 w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default PaymentSuccess;
