import React, { useState } from 'react';
import { BadgeCheck, Lightbulb, Settings, ShoppingCart, FileText, DollarSign, Target, Map, GraduationCap, BookOpen, Library } from 'lucide-react';
import { Sidebar } from '../shared/Sidebar';
import { NotificationCenter } from '../shared/NotificationCenter';
import { ChatWidget } from '../shared/ChatWidget';
import { DashboardHome } from './DashboardHome';
import { SubmitIdea } from './SubmitIdea';
import { MarketPlace } from './MarketPlace';
import { MyOrders } from './MyOrders';
import { SettingsPage } from './SettingsPage';
import { BusinessModelTemplates } from './BusinessModelTemplates';
import { CostEstimationTool } from './CostEstimationTool';
import { IdeaValidationTool } from './IdeaValidationTool';
import { StartupRoadmap } from './StartupRoadmap';
import { MentorshipMarketplace } from '../shared/MentorshipMarketplace';
import { WebinarsTraining } from '../shared/WebinarsTraining';
import { ResourceLibrary } from '../shared/ResourceLibrary';

interface EntrepreneurDashboardProps {
  userName: string;
  onLogout: () => void;
}

export const EntrepreneurDashboard = ({ userName, onLogout }: EntrepreneurDashboardProps) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Home', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'submit-idea', label: 'Submit Idea', icon: <Lightbulb className="w-5 h-5" /> },
    { id: 'validate-idea', label: 'Idea Validation', icon: <Target className="w-5 h-5" /> },
    { id: 'business-model', label: 'Business Model', icon: <FileText className="w-5 h-5" /> },
    { id: 'cost-estimation', label: 'Cost Estimator', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'roadmap', label: 'Startup Roadmap', icon: <Map className="w-5 h-5" /> },
    { id: 'mentorship', label: 'Mentorship', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'webinars', label: 'Webinars & Training', icon: <BookOpen className="w-5 h-5" /> },
    { id: 'resources', label: 'Resource Library', icon: <Library className="w-5 h-5" /> },
    { id: 'market', label: 'Market', icon: <ShoppingCart className="w-5 h-5" /> },
    { id: 'orders', label: 'My Orders', icon: <BadgeCheck className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardHome onNavigate={setCurrentPage} />;
      case 'submit-idea':
        return <SubmitIdea />;
      case 'validate-idea':
        return <IdeaValidationTool />;
      case 'business-model':
        return <BusinessModelTemplates />;
      case 'cost-estimation':
        return <CostEstimationTool />;
      case 'roadmap':
        return <StartupRoadmap />;
      case 'mentorship':
        return <MentorshipMarketplace />;
      case 'webinars':
        return <WebinarsTraining />;
      case 'resources':
        return <ResourceLibrary />;
      case 'market':
        return <MarketPlace />;
      case 'orders':
        return <MyOrders />;
      case 'settings':
        return <SettingsPage userName={userName} />;
      default:
        return <DashboardHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-pink-50 via-white to-violet-50">
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
        <div className="bg-white/85 backdrop-blur-xl border-b border-pink-100 pl-16 pr-4 lg:pl-8 sm:px-6 lg:px-8 py-4 flex justify-between items-center sticky top-0 z-30 shadow-sm">
          <div>
            <div className="text-xs font-bold uppercase tracking-[0.18em] text-pink-500">Entrepreneur Portal</div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950 truncate">
              {menuItems.find((item) => item.id === currentPage)?.label}
            </h1>
          </div>
          <NotificationCenter />
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 lg:p-8">{renderPage()}</div>
      </div>

      <ChatWidget currentUserRole="Entrepreneur" />
    </div>
  );
};
