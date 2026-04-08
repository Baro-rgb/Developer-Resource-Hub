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
      } catch (error) {
        logout();
      } finally {
        setLoading(false);
      }
    };

    initialize();
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
