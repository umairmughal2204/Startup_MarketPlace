import React, { useState } from 'react';
import { AuthProvider, useAuth, UserRole } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ChatProvider } from './context/ChatContext';
import { LandingPage } from './components/LandingPage';
import { AuthPage } from './components/Auth/AuthPage';
import { EntrepreneurDashboard } from './components/Entrepreneur/EntrepreneurDashboard';
import { SupplierDashboard } from './components/Supplier/SupplierDashboard';
import { InvestorDashboard } from './components/Investor/InvestorDashboard';
import { AdminDashboard } from './components/Admin/AdminDashboard';

function AppContent() {
  const { user, login, register, logout } = useAuth();
  const [showAuth, setShowAuth] = useState(false);

  if (!user && !showAuth) {
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  if (!user && showAuth) {
    return (
      <AuthPage
        onLogin={login}
        onRegister={register}
        onBack={() => setShowAuth(false)}
      />
    );
  }

  const handleLogout = () => {
    logout();
    setShowAuth(false);
  };

  // Render role-based dashboard
  if (user) {
    switch (user.role) {
      case 'Entrepreneur':
        return <EntrepreneurDashboard userName={user.name} onLogout={handleLogout} />;
      case 'Supplier':
        return <SupplierDashboard userName={user.name} onLogout={handleLogout} />;
      case 'Investor':
        return <InvestorDashboard userName={user.name} onLogout={handleLogout} />;
      case 'Admin':
        return <AdminDashboard userName={user.name} onLogout={handleLogout} />;
      default:
        return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    }
  }

  return null;
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