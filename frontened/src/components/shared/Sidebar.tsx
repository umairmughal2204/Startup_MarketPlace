import React, { useState } from 'react';
import { Check, LogOut, X, Menu, Rocket } from 'lucide-react';
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

const roleColors: { [key: string]: { bg: string; active: string; glow: string } } = {
  Entrepreneur: {
    bg: 'bg-gradient-aurora-entrepreneur',
    active: 'bg-white text-pink-600 shadow-lg shadow-pink-900/10',
    glow: 'shadow-pink-600/30',
  },
  Supplier: {
    bg: 'bg-gradient-aurora-supplier',
    active: 'bg-white text-teal-600 shadow-lg shadow-teal-900/10',
    glow: 'shadow-cyan-600/30',
  },
  Investor: {
    bg: 'bg-gradient-aurora-investor',
    active: 'bg-white text-violet-600 shadow-lg shadow-violet-900/10',
    glow: 'shadow-violet-600/30',
  },
  Admin: {
    bg: 'bg-gradient-to-br from-gray-700 to-gray-900',
    active: 'bg-white text-gray-700 shadow-lg shadow-gray-900/10',
    glow: 'shadow-gray-600/30',
  },
};

export const Sidebar = ({ role, userName, currentPage, menuItems, onNavigate, onLogout }: SidebarProps) => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const colors = roleColors[role] || roleColors.Entrepreneur;

  const handleNavigate = (page: string) => {
    onNavigate(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className={`fixed top-4 left-4 z-50 lg:hidden ${colors.bg} text-white p-2 rounded-xl shadow-lg ${colors.glow}`}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <div
        className={`w-64 ${colors.bg} text-white h-screen fixed left-0 top-0 flex flex-col z-40 transition-transform duration-300 shadow-2xl ${colors.glow} ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.28),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.16),transparent_36%)]" />

        <div className="relative p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-white/18 flex items-center justify-center ring-1 ring-white/25">
              <Rocket className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-xl text-white">LaunchPad</div>
              <div className="text-xs text-white/80">{role} Portal</div>
            </div>
          </div>
        </div>

        <div className="relative p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center flex-shrink-0 ring-1 ring-white/25">
              <span className="font-bold text-lg text-white">{userName.charAt(0).toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold flex items-center gap-1.5 text-white truncate">
                {userName}
              </div>
              <div className="text-xs text-white/80">{role}</div>
              {role !== 'Admin' && user?.profileVisibility && (
                <div className="text-xs text-white/70 mt-0.5">{user.profileVisibility}</div>
              )}
            </div>
          </div>
          {user?.isVerified && role !== 'Admin' && (
            <div className="mt-3 flex items-center justify-center gap-2 text-xs bg-white/20 rounded-xl px-2 py-1.5 text-white ring-1 ring-white/15">
              <Check className="w-3.5 h-3.5" />
              Verified Professional
            </div>
          )}
        </div>

        <nav className="relative flex-1 p-4 overflow-y-auto no-scrollbar">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
                    currentPage === item.id ? colors.active : 'hover:bg-white/10 text-white'
                  }`}
                >
                  {item.icon}
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="relative p-4 border-t border-white/20">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition text-white"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};
