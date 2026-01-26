import React, { useState } from 'react';
import { LayoutDashboard, Lightbulb, Package, Users, BarChart3, Settings } from 'lucide-react';
import { Sidebar } from '../shared/Sidebar';
import { NotificationCenter } from '../shared/NotificationCenter';
import { AdminHome } from './AdminHome';
import { ReviewIdeas } from './ReviewIdeas';
import { ReviewProducts } from './ReviewProducts';
import { ManageUsers } from './ManageUsers';
import { Analytics } from './Analytics';
import { SettingsPage } from '../Entrepreneur/SettingsPage';

interface AdminDashboardProps {
  userName: string;
  onLogout: () => void;
}

export const AdminDashboard = ({ userName, onLogout }: AdminDashboardProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'ideas', label: 'Review Ideas', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'products', label: 'Review Products', icon: <Package className="w-5 h-5" /> },
    { id: 'users', label: 'Manage Users', icon: <Users className="w-5 h-5" /> },
    { id: 'analytics', label: 'View Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <AdminHome />;
      case 'ideas':
        return <ReviewIdeas />;
      case 'products':
        return <ReviewProducts />;
      case 'users':
        return <ManageUsers />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <SettingsPage userName={userName} />;
      default:
        return <AdminHome />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        role="Admin"
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
    </div>
  );
};