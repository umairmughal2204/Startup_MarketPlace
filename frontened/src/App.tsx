import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/Auth/AuthPage';
import { AdminLoginPage } from './components/Auth/AdminLoginPage';
import { EntrepreneurDashboard } from './components/Entrepreneur/EntrepreneurDashboard';
import { SupplierDashboard } from './components/Supplier/SupplierDashboard';
import { InvestorDashboard } from './components/Investor/InvestorDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';

function AppContent() {
  const { user, login, register, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const LAST_PATH_KEY = 'slm_last_path';

  useEffect(() => {
    if (!user) return;
    const target = user.role === 'Admin' ? '/admin' : `/${user.role.toLowerCase()}`;
    const storedPath = typeof window !== 'undefined'
      ? window.sessionStorage.getItem(LAST_PATH_KEY)
      : null;

    if (location.pathname === '/' || location.pathname === '/auth') {
      if (storedPath && storedPath.startsWith(target)) {
        navigate(storedPath, { replace: true });
        return;
      }
      navigate(target, { replace: true });
      return;
    }

    if (!location.pathname.startsWith(target)) {
      if (storedPath && storedPath.startsWith(target)) {
        navigate(storedPath, { replace: true });
        return;
      }
      navigate(target, { replace: true });
    }
  }, [user, location.pathname, navigate]);

  useEffect(() => {
    if (!user) return;
    if (typeof window === 'undefined') return;
    const target = user.role === 'Admin' ? '/admin' : `/${user.role.toLowerCase()}`;
    if (location.pathname.startsWith(target)) {
      window.sessionStorage.setItem(LAST_PATH_KEY, location.pathname);
    }
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage onGetStarted={() => navigate('/auth')} />}
      />
      <Route
        path="/auth"
        element={
          <AuthPage
            onLogin={login}
            onRegister={register}
            onBack={() => navigate('/')}
          />
        }
      />
      <Route
        path="/admin"
        element={
          user?.role === 'Admin' ? (
            <AdminDashboard userName={user.name} onLogout={handleLogout} />
          ) : (
            <AdminLoginPage onLogin={(email, password) => login(email, password, 'Admin')} />
          )
        }
      />
      <Route
        path="/entrepreneur"
        element={
          user?.role === 'Entrepreneur' ? (
            <EntrepreneurDashboard userName={user.name} onLogout={handleLogout} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/supplier"
        element={
          user?.role === 'Supplier' ? (
            <SupplierDashboard userName={user.name} onLogout={handleLogout} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route
        path="/investor"
        element={
          user?.role === 'Investor' ? (
            <InvestorDashboard userName={user.name} onLogout={handleLogout} />
          ) : (
            <Navigate to="/auth" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ChatProvider>
          <ConfirmProvider>
            <Toaster richColors closeButton position="top-right" />
            <AppContent />
          </ConfirmProvider>
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}