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
    let activityTimeout = null;

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('last_activity');
      if (lastActivity && Date.now() - parseInt(lastActivity, 10) > INACTIVITY_LIMIT_MS) {
        if (localStorage.getItem('auth_token')) {
          logout();
          alert('Phiên đăng nhập đã hết hạn do không hoạt động (30 phút). Vui lòng đăng nhập lại.');
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
    </AuthContext.Provider>
  );
};
