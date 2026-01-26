import React, { useState } from 'react';
import { 
  Lightbulb, 
  ShoppingCart, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  BadgeCheck
} from 'lucide-react';
import { Sidebar } from '../shared/Sidebar';
import { NotificationCenter } from '../shared/NotificationCenter';
import { ChatWidget } from '../shared/ChatWidget';
import { DashboardHome } from './DashboardHome';
import { SubmitIdea } from './SubmitIdea';
import { MarketPlace } from './MarketPlace';
import { MyOrders } from './MyOrders';
import { SettingsPage } from './SettingsPage';

interface EntrepreneurDashboardProps {
  userName: string;
  onLogout: () => void;
}

export const EntrepreneurDashboard = ({ userName, onLogout }: EntrepreneurDashboardProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'submit-idea', label: 'Submit Idea', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'market', label: 'Market', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'orders', label: 'My Orders', icon: <BadgeCheck className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome />;
      case 'submit-idea':
        return <SubmitIdea />;
      case 'market':
        return <MarketPlace />;
      case 'orders':
        return <MyOrders />;
      case 'settings':
        return <SettingsPage userName={userName} />;
      default:
        return <DashboardHome />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        role="Entrepreneur"
        userName={userName}
        currentPage={currentPage}
        menuItems={menuItems}
        onNavigate={setCurrentPage}
        onLogout={onLogout}
      />

      <div className="lg:ml-64 flex-1 w-full">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 pl-16 pr-4 lg:pl-8 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-30">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
            {menuItems.find((item) => item.id === currentPage)?.label}
          </h1>
          <NotificationCenter />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">{renderPage()}</div>
      </div>

      <ChatWidget currentUserRole="Entrepreneur" />
    </div>
  );
};