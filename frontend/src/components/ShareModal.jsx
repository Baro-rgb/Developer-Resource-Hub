// src/components/ShareModal.jsx
import React, { useState } from 'react';
import { X, Copy, Check, Share2, Mail, Send } from 'lucide-react';
import { generateShareLink, sendNotification } from '../services/api';
const ShareModal = ({ resource, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('link'); // 'link' or 'email'
  const [shareLink, setShareLink] = useState('');
  const [shareToken, setShareToken] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await generateShareLink(resource.id);
      
      // Build full link (e.g. http://localhost:3000/shared/xxxx)
      const fullUrl = `${window.location.origin}${res.data.link}`;
      setShareLink(fullUrl);
      setShareToken(res.data.token);
    } catch (err) {
      setError(err.message || 'Failed to generate link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!recipientEmail.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await sendNotification(recipientEmail, resource.id);
      setSendSuccess(true);
      setRecipientEmail('');
      setTimeout(() => {
        setSendSuccess(false);
        onClose(); // Optional: close after success
      }, 2000);
    } catch (err) {
      setError(err.message || 'Không thể gửi tài nguyên này.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-6 py-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-400" />
            Chia sẻ tài nguyên
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 flex rounded-lg bg-slate-800 p-1">
            <button
              onClick={() => { setActiveTab('link'); setError(null); }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${activeTab === 'link' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Lấy Link
            </button>
            <button
              onClick={() => { setActiveTab('email'); setError(null); }}
              className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${activeTab === 'email' ? 'bg-slate-700 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              Gửi trực tiếp
            </button>
          </div>

          <div className="mb-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50">
            <h4 className="font-semibold text-slate-200 mb-1">{resource.title}</h4>
            <p className="text-sm text-slate-400 truncate">{resource.url}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-900/50 text-red-200 text-sm border border-red-800/50">
              {error}
            </div>
          )}

          {activeTab === 'link' && (
            <>
              {!shareLink ? (
                <div className="text-center py-4">
                  <p className="text-slate-400 text-sm mb-4">
                    Tạo một đường link bảo mật để gửi tài nguyên này cho người khác.
                  </p>
                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    {loading ? 'Đang tạo...' : 'Tạo Link Chia Sẻ'}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Link Chia Sẻ
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={shareLink}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500"
                      />
                      <button
                        onClick={handleCopy}
                        className="flex shrink-0 items-center justify-center w-10 h-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-colors"
                        title="Copy Link"
                      >
                        {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center pt-2">
                    <p className="text-xs text-slate-500">
                      Người nhận có thể click vào link hoặc nhập Mã: <span className="text-blue-400 font-mono font-bold bg-slate-950 px-2 py-0.5 rounded">{shareToken}</span>
                    </p>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'email' && (
            <form onSubmit={handleSendEmail} className="space-y-4">
              {sendSuccess ? (
                <div className="py-6 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 mb-3">
                    <Check className="h-6 w-6 text-emerald-400" />
                  </div>
                  <p className="text-emerald-400 font-medium">Gửi tài nguyên thành công!</p>
                  <p className="text-slate-400 text-sm mt-1">Người nhận sẽ thấy thông báo ở cái Chuông.</p>
                </div>
              ) : (
                <>
                  <p className="text-slate-400 text-sm mb-4">
                    Gửi thẳng tài nguyên này vào hòm thư (Chuông thông báo) của người dùng khác bằng Email của họ.
                  </p>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">
                      Email người nhận
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        type="email"
                        required
                        value={recipientEmail}
                        onChange={(e) => setRecipientEmail(e.target.value)}
                        placeholder="VD: banbe@gmail.com"
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !recipientEmail.trim()}
                    className="w-full mt-4 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 disabled:text-slate-400 text-white rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
                  >
                    {loading ? 'Đang gửi...' : <><Send className="w-4 h-4" /> Gửi Ngay</>}
                  </button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
