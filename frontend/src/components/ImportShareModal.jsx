// src/components/ImportShareModal.jsx
import React, { useState } from 'react';
import { X, Search, Download } from 'lucide-react';
import { previewShareLink, importShareLink } from '../services/api';

const ImportShareModal = ({ onClose, onSuccess }) => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);

  const handlePreview = async (e) => {
    e.preventDefault();
    if (!token.trim()) return;

    try {
      setLoading(true);
      setError(null);
      // Clean token if user pastes full URL
      const cleanToken = token.split('/').pop().trim();
      const res = await previewShareLink(cleanToken);
      setPreviewData(res.data);
      setToken(cleanToken); // Update to clean token
    } catch (err) {
      setError(err.message || 'Không tìm thấy tài nguyên. Mã không hợp lệ hoặc đã hết hạn.');
      setPreviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    try {
      setLoading(true);
      setError(null);
      await importShareLink(token);
      onSuccess('Nhận tài nguyên thành công! Nó đã được thêm vào kho của bạn.');
      onClose();
    } catch (err) {
      setError(err.message || 'Lỗi khi nhận tài nguyên');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-emerald-400" />
            Nhận tài nguyên chia sẻ
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {!previewData ? (
            <form onSubmit={handlePreview}>
              <p className="text-slate-400 text-sm mb-4">
                Nhập Mã chia sẻ hoặc dán Link bạn nhận được vào ô bên dưới:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="VD: a1b2c3d4..."
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={loading || !token.trim()}
                  className="flex shrink-0 items-center justify-center px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg font-medium transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
              {error && <p className="mt-3 text-red-400 text-sm">{error}</p>}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-800 border border-slate-700">
                <div className="mb-2 flex items-center gap-2">
                  <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                    Sắp nhận
                  </span>
                  {previewData.category && (
                    <span className="rounded bg-blue-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-300">
                      {previewData.category}
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-white mb-1">{previewData.title}</h4>
                <p className="text-xs text-blue-400 truncate mb-3">{previewData.url}</p>
                <p className="text-sm text-slate-400 line-clamp-2">{previewData.description || 'Không có mô tả'}</p>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button
                onClick={handleImport}
                disabled={loading}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2 mt-4"
              >
                {loading ? 'Đang lưu...' : 'Lưu vào Kho của tôi'}
              </button>
              <button
                onClick={() => { setPreviewData(null); setError(null); setToken(''); }}
                className="w-full py-2 px-4 bg-transparent hover:bg-slate-800 text-slate-400 rounded-lg text-sm transition-colors mt-2"
              >
                Hủy bỏ
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportShareModal;
