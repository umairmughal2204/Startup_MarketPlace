import React, { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
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

  useEffect(() => {
    if (!user) return;
    const target = user.role === 'Admin' ? '/admin' : `/${user.role.toLowerCase()}`;
    if (location.pathname === '/' || location.pathname === '/auth') {
      navigate(target, { replace: true });
    }
  }, [user, location.pathname, navigate]);

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
          <AppContent />
        </ChatProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}