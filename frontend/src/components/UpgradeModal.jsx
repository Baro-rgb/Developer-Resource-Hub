import React, { useState } from 'react';
import { X, Key, Crown, Sparkles, CheckCircle2 } from 'lucide-react';
import { applyUpgradeCode } from '../services/api';
import { useAuth } from '../context/AuthContext';

const UpgradeModal = ({ isOpen, onClose, message = 'Nâng cấp tài khoản của bạn để mở khóa giới hạn!' }) => {
  const { user, checkAuth } = useAuth(); // Để refresh lại user session sau khi upgrade
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  
  const isAlreadyPro = user?.subscription_plan === 'pro';

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await applyUpgradeCode(code.trim());
      setSuccess(true);
      
      // Update local auth context if needed
      if (checkAuth) {
        await checkAuth();
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
        setCode('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Mã nâng cấp không hợp lệ hoặc đã được sử dụng.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header Decor */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-amber-500/20 to-purple-600/20"></div>
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl"></div>

        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onClose();
          }}
          className="absolute right-4 top-4 z-50 rounded-full bg-slate-800/80 p-2 text-slate-300 shadow-lg transition-colors hover:bg-slate-700 hover:text-white cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 px-8 pb-8 pt-10">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg shadow-amber-500/30">
              <Crown className="h-10 w-10 text-white" />
            </div>
          </div>

          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold text-white">Nâng cấp lên Pro</h2>
            <p className="mb-6 text-sm text-slate-400">
              {message}
            </p>
          </div>

          {isAlreadyPro && !success ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
              <h3 className="text-xl font-bold text-white">Bạn đã là thành viên Pro!</h3>
              <p className="mt-2 text-sm text-slate-400">Bạn đã mở khóa không giới hạn tất cả các tính năng của hệ thống. Chúc bạn trải nghiệm tuyệt vời!</p>
            </div>
          ) : success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center animate-[slideIn_0.3s_ease-out]">
              <CheckCircle2 className="mb-4 h-16 w-16 text-emerald-500" />
              <h3 className="text-xl font-bold text-white">Thành công!</h3>
              <p className="text-slate-400">Tài khoản của bạn đã được nâng cấp. Chúc bạn sử dụng vui vẻ!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-center text-sm text-red-400">
                  {error}
                </div>
              )}
              
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Mã nâng cấp (Upgrade Code)</label>
                <div className="relative">
                  <Key className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="VD: PRO-XXXX-YYYY"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 py-3 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !code.trim()}
                className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
              >
                <span className="relative z-10">{loading ? 'Đang xử lý...' : 'Kích hoạt ngay'}</span>
                <Sparkles className="relative z-10 h-5 w-5" />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-amber-600 to-amber-400 opacity-0 transition-opacity group-hover:opacity-100"></div>
              </button>
            </form>
          )}

          {!success && !isAlreadyPro && (
            <p className="mt-6 text-center text-xs text-slate-500">
              Chưa có mã? Vui lòng liên hệ Admin để mua gói Nâng cấp.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
