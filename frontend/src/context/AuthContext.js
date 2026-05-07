// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister, getProfile } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const saveSession = (token, userData) => {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('last_activity', Date.now().toString());
    setUser({ ...userData, isAdmin: userData?.is_admin || false });
  };

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
  }, []);

  const login = async (credentials) => {
    const response = await apiLogin(credentials);
    saveSession(response.data.token, response.data.user);
    return response;
  };

  const register = async (credentials) => {
    const response = await apiRegister(credentials);
    saveSession(response.data.token, response.data.user);
    return response;
  };

  useEffect(() => {
    const initialize = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profileResponse = await getProfile();
        setUser({ ...profileResponse.data, isAdmin: profileResponse.data?.is_admin || false });
        localStorage.setItem('last_activity', Date.now().toString());
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, [logout]);

  // Session Timeout Logic (30 minutes of inactivity)
  useEffect(() => {
    const INACTIVITY_LIMIT_MS = 30 * 60 * 1000;

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('last_activity');
      if (lastActivity && Date.now() - parseInt(lastActivity, 10) > INACTIVITY_LIMIT_MS) {
        if (localStorage.getItem('auth_token')) {
          logout();
          setSessionExpired(true);
        }
      }
    };

    const updateActivity = () => {
      // Allow debouncing memory setting so we aren't writing on every single mousemove
      if (localStorage.getItem('auth_token')) {
        localStorage.setItem('last_activity', Date.now().toString());
      }
    };

    // Run initial check
    checkInactivity();

    // Only attach events if we actually are using the app
    const events = ['mousemove', 'keydown', 'scroll', 'click'];
    events.forEach(evt => window.addEventListener(evt, updateActivity, { passive: true }));

    // Real-time background checker every 1 minute
    const intervalId = setInterval(checkInactivity, 60000);

    return () => {
      events.forEach(evt => window.removeEventListener(evt, updateActivity));
      clearInterval(intervalId);
    };
  }, [logout]);

  const isAdmin = Boolean(user?.isAdmin || user?.is_admin);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isAdmin,
        login,
        register,
        logout,
      }}
    >
      {children}
      {sessionExpired && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-800">
              <span className="text-2xl">⏳</span>
            </div>
            <h3 className="mb-2 text-xl font-bold text-white">Đã hết phiên làm việc</h3>
            <p className="mb-6 text-sm text-slate-400">
              Vì lý do bảo mật, tài khoản của bạn đã được tự động đăng xuất do không có hoạt động nào trong 30 phút.
            </p>
            <button 
              onClick={() => { setSessionExpired(false); window.location.href = '/login'; }}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-500"
            >
              Đăng nhập lại
            </button>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};
