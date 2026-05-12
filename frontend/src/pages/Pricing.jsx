import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, Sparkles, Zap, Shield, ArrowLeft, Loader2, QrCode } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { createPaymentLink, checkPaymentStatus } from '../services/api';

const Pricing = () => {
  const { user, checkAuth } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Payment states
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [orderCode, setOrderCode] = useState(null);
  const [amount, setAmount] = useState(null);
  const [description, setDescription] = useState(null);
  
  const isPro = user?.subscription_plan === 'pro';

  const handleUpgrade = async () => {
    if (isPro) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await createPaymentLink('pro');
      if (response.success && response.data.checkoutUrl) {
        setQrCodeUrl(response.data.checkoutUrl);
        setOrderCode(response.data.orderCode);
        setAmount(response.data.amount);
        setDescription(response.data.description);
      } else {
        setError('Không thể tạo mã thanh toán, vui lòng thử lại.');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi kết nối thanh toán.');
    } finally {
      setLoading(false);
    }
  };

  // Poll for payment status every 3 seconds if an order is active
  useEffect(() => {
    let intervalId;

    if (orderCode && !isPro) {
      intervalId = setInterval(async () => {
        try {
          const res = await checkPaymentStatus(orderCode);
          if (res.success && res.data.status === 'PAID') {
            clearInterval(intervalId);
            // Refresh auth to get new subscription plan
            if (checkAuth) await checkAuth();
            navigate('/payment/success');
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);
        }
      }, 3000); // 3 seconds
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [orderCode, isPro, navigate, checkAuth]);

  return (
    <div className="min-h-screen bg-slate-950 py-20 px-4">
      <div className="max-w-7xl mx-auto relative">
        <Link 
          to="/" 
          className="absolute top-0 left-0 flex items-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          <span>Trở về Bảng điều khiển</span>
        </Link>
        <div className="text-center mb-16 mt-12 md:mt-0">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Nâng tầm hiệu suất của bạn
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Chọn gói phù hợp với nhu cầu của bạn. Nâng cấp bất cứ lúc nào để mở khóa toàn bộ sức mạnh của Developer Resource Hub.
          </p>
        </div>

        {error && (
          <div className="mb-8 max-w-md mx-auto bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-center animate-[slideIn_0.3s_ease-out]">
            {error}
          </div>
        )}

        {/* If QR Code is generated, show the Checkout UI instead of Pricing tables */}
        {qrCodeUrl ? (
          <div className="max-w-xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden text-center animate-[slideIn_0.5s_ease-out]">
            <h3 className="text-2xl font-bold text-white mb-2">Thanh toán Gói Pro</h3>
            <p className="text-slate-400 mb-6">Mở ứng dụng ngân hàng và quét mã QR bên dưới để thanh toán.</p>
            
            <div className="bg-white p-4 rounded-2xl inline-block mb-6 shadow-2xl shadow-emerald-500/10">
              <img src={qrCodeUrl} alt="VietQR Payment" className="w-64 h-64 object-contain" />
            </div>

            <div className="bg-slate-950 rounded-xl p-4 mb-8 text-left space-y-3 border border-slate-800">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Số tiền:</span>
                <span className="text-white font-bold text-lg">{amount?.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Nội dung chuyển khoản:</span>
                <span className="bg-amber-500/20 text-amber-400 font-mono font-bold px-2 py-1 rounded">
                  {description}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-emerald-400 font-medium animate-pulse">
              <Loader2 className="w-5 h-5 animate-spin" />
              Đang chờ thanh toán...
            </div>
            <p className="text-xs text-slate-500 mt-4">
              Hệ thống sẽ tự động cập nhật ngay sau khi bạn chuyển khoản thành công.
            </p>

            <button
              onClick={() => {
                setQrCodeUrl(null);
                setOrderCode(null);
              }}
              className="mt-8 text-slate-400 hover:text-white transition-colors text-sm"
            >
              Hủy và quay lại
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden transition-all hover:border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-2">Gói Cơ Bản (Free)</h3>
              <p className="text-slate-400 mb-6">Dành cho cá nhân mới bắt đầu quản lý tài nguyên.</p>
              <div className="mb-8">
                <span className="text-4xl font-extrabold text-white">0đ</span>
                <span className="text-slate-500"> / vĩnh viễn</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-slate-300">
                  <Check className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                  <span>Tối đa 5 Danh mục</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                  <span>Tối đa 30 Tài nguyên</span>
                </li>
                <li className="flex items-center text-slate-300">
                  <Check className="h-5 w-5 text-emerald-500 mr-3 shrink-0" />
                  <span>Tính năng tìm kiếm cơ bản</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-4 rounded-xl font-bold text-slate-400 bg-slate-800 cursor-not-allowed"
              >
                Gói hiện tại
              </button>
            </div>

            {/* Pro Plan */}
            <div className="bg-gradient-to-b from-slate-800 to-slate-900 border border-amber-500/30 rounded-3xl p-8 relative overflow-hidden transform transition-all hover:scale-105 hover:border-amber-500/50 shadow-2xl shadow-amber-500/10">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" /> Đề xuất
                </span>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-2">Gói Chuyên Nghiệp (Pro)</h3>
              <p className="text-slate-400 mb-6">Mở khóa sức mạnh không giới hạn cho các chuyên gia.</p>
              <div className="mb-8 flex items-end">
                <span className="text-4xl font-extrabold text-white">199.000đ</span>
                <span className="text-slate-500 ml-2"> / vĩnh viễn</span>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center text-white">
                  <Zap className="h-5 w-5 text-amber-500 mr-3 shrink-0" />
                  <span className="font-medium">Không giới hạn Danh mục</span>
                </li>
                <li className="flex items-center text-white">
                  <Zap className="h-5 w-5 text-amber-500 mr-3 shrink-0" />
                  <span className="font-medium">Không giới hạn Tài nguyên</span>
                </li>
                <li className="flex items-center text-white">
                  <Shield className="h-5 w-5 text-amber-500 mr-3 shrink-0" />
                  <span className="font-medium">Hỗ trợ kỹ thuật ưu tiên</span>
                </li>
                <li className="flex items-center text-white">
                  <Sparkles className="h-5 w-5 text-amber-500 mr-3 shrink-0" />
                  <span className="font-medium">Sử dụng mọi tính năng mới trong tương lai</span>
                </li>
              </ul>

              <button
                onClick={handleUpgrade}
                disabled={loading || isPro}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-all ${
                  isPro 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {isPro ? (
                  'Đã sở hữu gói Pro'
                ) : loading ? (
                  <><Loader2 className="mr-2 w-5 h-5 animate-spin" /> Đang tạo mã QR...</>
                ) : (
                  <>
                    Mua Ngay <QrCode className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
              <p className="text-center text-xs text-slate-500 mt-4">
                Thanh toán 1 lần duy nhất qua mã QR (VietQR)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
