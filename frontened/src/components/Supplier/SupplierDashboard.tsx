import React, { useState } from 'react';
import { LayoutDashboard, Package, ShoppingBag, Settings, GraduationCap, Library } from 'lucide-react';
import { Sidebar } from '../shared/Sidebar';
import { NotificationCenter } from '../shared/NotificationCenter';
import { ChatWidget } from '../shared/ChatWidget';
import { SupplierHome } from './SupplierHome';
import { ProductManagement } from './ProductManagement';
import { OrderManagement } from './OrderManagement';
import { SettingsPage } from '../Entrepreneur/SettingsPage';
import { MentorshipMarketplace } from '../shared/MentorshipMarketplace';
import { ResourceLibrary } from '../shared/ResourceLibrary';

interface SupplierDashboardProps {
  userName: string;
  onLogout: () => void;
}

export const SupplierDashboard = ({ userName, onLogout }: SupplierDashboardProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'products', label: 'Product Management', icon: <Package className="w-5 h-5" /> },
    { id: 'orders', label: 'Order Management', icon: <ShoppingBag className="w-5 h-5" /> },
    { id: 'mentorship', label: 'Mentorship', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'resources', label: 'Resource Library', icon: <Library className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <SupplierHome onNavigate={setCurrentPage} />;
      case 'products':
        return <ProductManagement />;
      case 'orders':
        return <OrderManagement />;
      case 'mentorship':
        return <MentorshipMarketplace />;
      case 'resources':
        return <ResourceLibrary />;
      case 'settings':
        return <SettingsPage userName={userName} />;
      default:
        return <SupplierHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-cyan-50 via-white to-violet-50">
      <Sidebar
        role="Supplier"
        userName={userName}
        currentPage={currentPage}
        menuItems={menuItems}
        onNavigate={setCurrentPage}
        onLogout={onLogout}
      />

      <div className="lg:ml-64 flex-1 w-full">
        {/* Top Bar */}
        <div className="bg-white/85 backdrop-blur-xl border-b border-cyan-100 pl-16 pr-4 lg:pl-8 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-teal-600">Supplier Portal</div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 truncate">
              {menuItems.find((item) => item.id === currentPage)?.label}
            </h1>
          </div>
          <NotificationCenter />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">{renderPage()}</div>
      </div>

      <ChatWidget currentUserRole="Supplier" />
    </div>
  );
};
