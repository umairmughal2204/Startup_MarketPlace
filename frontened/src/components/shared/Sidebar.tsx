import React, { useState } from 'react';
import { LogOut, X, Menu, BadgeCheck, Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: string;
  userName: string;
  currentPage: string;
  menuItems: MenuItem[];
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export const Sidebar = ({ role, userName, currentPage, menuItems, onNavigate, onLogout }: SidebarProps) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const roleColors: { [key: string]: { bg: string; text: string; gradient: string } } = {
    Entrepreneur: {
      bg: 'bg-[#0066cc]',
      text: 'text-[#0066cc]',
      gradient: 'from-[#0066cc] to-[#004080]',
    },
    Supplier: {
      bg: 'bg-[#0088cc]',
      text: 'text-[#0088cc]',
      gradient: 'from-[#0088cc] to-[#0066aa]',
    },
    Investor: {
      bg: 'bg-[#0099dd]',
      text: 'text-[#0099dd]',
      gradient: 'from-[#0099dd] to-[#0077bb]',
    },
    Admin: {
      bg: 'bg-gray-700',
      text: 'text-gray-700',
      gradient: 'from-gray-700 to-gray-900',
    },
  };

  const colors = roleColors[role] || roleColors.Entrepreneur;

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed top-4 left-4 z-50 lg:hidden ${colors.bg} text-white p-2 rounded-lg shadow-lg`}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`w-64 ${colors.bg} text-white h-screen fixed left-0 top-0 flex flex-col z-40 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <Rocket className="w-8 h-8 text-white" />
            <div>
              <div className="font-bold text-xl text-white">LaunchPad</div>
              <div className="text-xs text-white/80">{role} Portal</div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-lg text-white">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center gap-1.5 text-white truncate">
                {userName}
              </div>
              <div className="text-xs text-white/80">{role}</div>
              {role !== 'Admin' && user?.profileVisibility && (
                <div className="text-xs text-white/70 mt-0.5">• {user.profileVisibility}</div>
              )}
            </div>
          </div>
          {user?.isVerified && role !== 'Admin' && (
            <div className="mt-3 text-xs bg-white/20 rounded-lg px-2 py-1.5 text-center text-white">
              ✓ Verified Professional
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    currentPage === item.id
                      ? `bg-white ${colors.text}`
                      : 'hover:bg-white/10 text-white'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-white/10 transition text-white"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};