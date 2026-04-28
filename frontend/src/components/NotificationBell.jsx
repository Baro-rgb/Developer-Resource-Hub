// src/components/NotificationBell.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, X, Loader2 } from 'lucide-react';
import { getNotifications, respondToNotification } from '../services/api';
const NotificationBell = ({ onResourceAdded }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotifications();
      setNotifications(res.data || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optional: Polling every 1 minute
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRespond = async (e, id, action) => {
    e.stopPropagation();
    try {
      setProcessingId(id);
      await respondToNotification(id, action);
      
      // Remove from list
      setNotifications(prev => prev.filter(n => n.id !== id));
      
      if (action === 'accept' && onResourceAdded) {
        onResourceAdded();
      }
    } catch (error) {
      console.error('Failed to respond:', error);
      alert(error.message || 'Có lỗi xảy ra!');
    } finally {
      setProcessingId(null);
    }
  };

  const pendingCount = notifications.length;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
      >
        <Bell className="h-5 w-5" />
        {pendingCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-slate-950 animate-pulse">
            {pendingCount > 9 ? '9+' : pendingCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden z-50">
          <div className="flex items-center justify-between border-b border-slate-800 bg-slate-800/50 px-4 py-3">
            <h3 className="font-bold text-slate-100">Thông báo</h3>
            <span className="text-xs font-medium text-slate-400">{pendingCount} mới</span>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 text-slate-500 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-sm">
                Không có thông báo nào
              </div>
            ) : (
              <div className="divide-y divide-slate-800">
                {notifications.map(notif => (
                  <div key={notif.id} className="p-4 hover:bg-slate-800/30 transition-colors">
                    <p className="text-sm text-slate-300 mb-2">
                      <span className="font-bold text-blue-400">{notif.sender?.name || notif.sender?.email || 'Ai đó'}</span>{' '}
                      đã gửi cho bạn một tài nguyên:
                    </p>
                    <div className="rounded border border-slate-700/50 bg-slate-950 p-3 mb-3">
                      <h4 className="font-semibold text-slate-200 text-sm">{notif.resource?.title}</h4>
                      <p className="text-xs text-slate-500 truncate">{notif.resource?.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => handleRespond(e, notif.id, 'accept')}
                        disabled={processingId === notif.id}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-600/20 py-1.5 text-xs font-semibold hover:bg-emerald-600 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {processingId === notif.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                        Chấp nhận
                      </button>
                      <button
                        onClick={(e) => handleRespond(e, notif.id, 'reject')}
                        disabled={processingId === notif.id}
                        className="flex items-center justify-center rounded-lg bg-slate-800 text-slate-400 px-3 py-1.5 text-xs font-semibold hover:bg-red-500/20 hover:text-red-400 transition-colors disabled:opacity-50"
                        title="Từ chối"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
