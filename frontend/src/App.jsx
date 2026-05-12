// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ResourceProvider } from './context/ResourceContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Welcome from './pages/Welcome';

import Admin from './pages/Admin';
import Pricing from './pages/Pricing';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancel from './pages/PaymentCancel';
import './styles/index.css';

/**
 * App Component
 * Root component của ứng dụng
 * - Routes setup
 * - Context provider
 */
const HomeRoute = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white text-lg">Đang tải...</p>
      </div>
    );
  }

  return isAuthenticated ? <Dashboard /> : <Welcome />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ResourceProvider>
          <Routes>
            <Route path="/" element={<HomeRoute />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/welcome" element={<Welcome />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/cancel" element={<PaymentCancel />} />
            {/* Catch all - redirect to home */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </ResourceProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
