import React, { useState } from 'react';
import { Rocket, User, ShoppingBag, TrendingUp, Shield } from 'lucide-react';
import { UserRole } from '../../context/AuthContext';

interface AuthPageProps {
  onLogin: (email: string, password: string, role: UserRole) => void;
  onRegister: (name: string, email: string, password: string, role: UserRole, professionalDetails: ProfessionalDetails) => void;
  onBack: () => void;
}

interface ProfessionalDetails {
  // Entrepreneur fields
  companyName?: string;
  industry?: string;
  businessStage?: string;
  foundedYear?: string;
  
  // Supplier fields
  businessName?: string;
  businessType?: string;
  productsServices?: string;
  yearsInBusiness?: string;
  
  // Investor fields
  investmentFirm?: string;
  investmentRange?: string;
  focusAreas?: string;
  investmentStage?: string;
}

export const AuthPage = ({ onLogin, onRegister, onBack }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [professionalDetails, setProfessionalDetails] = useState<ProfessionalDetails>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;

    if (isLogin) {
      onLogin(formData.email, formData.password, selectedRole);
    } else {
      // Pass professional details to registration
      onRegister(formData.name, formData.email, formData.password, selectedRole, professionalDetails);
    }
  };

  // Filter roles based on login/register mode
  const availableRoles = isLogin 
    ? [
        {
          value: 'Entrepreneur' as UserRole,
          label: 'Entrepreneur',
          icon: <Rocket className="w-8 h-8" />,
          color: 'bg-[#0066cc]',
          description: 'Submit ideas and build your startup',
        },
        {
          value: 'Supplier' as UserRole,
          label: 'Supplier',
          icon: <ShoppingBag className="w-8 h-8" />,
          color: 'bg-[#008b8b]',
          description: 'Sell products and manage orders',
        },
        {
          value: 'Investor' as UserRole,
          label: 'Investor',
          icon: <TrendingUp className="w-8 h-8" />,
          color: 'bg-[#0066cc]',
          description: 'Discover and fund startups',
        },
        {
          value: 'Admin' as UserRole,
          label: 'Admin',
          icon: <Shield className="w-8 h-8" />,
          color: 'bg-gray-700',
          description: 'Manage platform and users',
        },
      ]
    : [
        {
          value: 'Entrepreneur' as UserRole,
          label: 'Entrepreneur',
          icon: <Rocket className="w-8 h-8" />,
          color: 'bg-[#0066cc]',
          description: 'Submit ideas and build your startup',
        },
        {
          value: 'Supplier' as UserRole,
          label: 'Supplier',
          icon: <ShoppingBag className="w-8 h-8" />,
          color: 'bg-[#008b8b]',
          description: 'Sell products and manage orders',
        },
        {
          value: 'Investor' as UserRole,
          label: 'Investor',
          icon: <TrendingUp className="w-8 h-8" />,
          color: 'bg-[#0066cc]',
          description: 'Discover and fund startups',
        },
      ];

  const renderProfessionalFields = () => {
    if (isLogin || !selectedRole) return null;

    switch (selectedRole) {
      case 'Entrepreneur':
        return (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm text-[#0066cc]">Professional Details (Required for Verification)</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Company/Startup Name *
              </label>
              <input
                type="text"
                value={professionalDetails.companyName || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, companyName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                required
                placeholder="e.g., TechStartup Inc."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Industry *
              </label>
              <select
                value={professionalDetails.industry || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, industry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                required
              >
                <option value="">Select Industry</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Finance">Finance</option>
                <option value="Sustainability">Sustainability</option>
                <option value="E-commerce">E-commerce</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Stage *
              </label>
              <select
                value={professionalDetails.businessStage || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, businessStage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                required
              >
                <option value="">Select Stage</option>
                <option value="Idea">Idea Stage</option>
                <option value="MVP">MVP/Prototype</option>
                <option value="Early Stage">Early Stage</option>
                <option value="Growth">Growth Stage</option>
                <option value="Established">Established</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Founded Year *
              </label>
              <input
                type="number"
                value={professionalDetails.foundedYear || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, foundedYear: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                required
                min="1900"
                max={new Date().getFullYear()}
                placeholder="e.g., 2024"
              />
            </div>
          </div>
        );

      case 'Supplier':
        return (
          <div className="space-y-4 p-4 bg-teal-50 rounded-lg border border-teal-200">
            <h3 className="font-semibold text-sm text-[#008b8b]">Professional Details (Required for Verification)</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Name *
              </label>
              <input
                type="text"
                value={professionalDetails.businessName || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, businessName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008b8b] focus:border-transparent"
                required
                placeholder="e.g., Supply Solutions LLC"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Business Type *
              </label>
              <select
                value={professionalDetails.businessType || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, businessType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008b8b] focus:border-transparent"
                required
              >
                <option value="">Select Business Type</option>
                <option value="Software Provider">Software Provider</option>
                <option value="Hardware Supplier">Hardware Supplier</option>
                <option value="Service Provider">Service Provider</option>
                <option value="Legal Services">Legal Services</option>
                <option value="Marketing Agency">Marketing Agency</option>
                <option value="Consulting Firm">Consulting Firm</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Products/Services Offered *
              </label>
              <textarea
                value={professionalDetails.productsServices || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, productsServices: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008b8b] focus:border-transparent"
                required
                rows={3}
                placeholder="Briefly describe your products or services..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Years in Business *
              </label>
              <input
                type="number"
                value={professionalDetails.yearsInBusiness || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, yearsInBusiness: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#008b8b] focus:border-transparent"
                required
                min="0"
                max="100"
                placeholder="e.g., 5"
              />
            </div>
          </div>
        );

      case 'Investor':
        return (
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm text-[#0066cc]">Professional Details (Required for Verification)</h3>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Investment Firm/Name *
              </label>
              <input
                type="text"
                value={professionalDetails.investmentFirm || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, investmentFirm: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                required
                placeholder="e.g., Venture Capital Partners"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Investment Range *
              </label>
              <select
                value={professionalDetails.investmentRange || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, investmentRange: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                required
              >
                <option value="">Select Investment Range</option>
                <option value="$10K - $50K">$10K - $50K</option>
                <option value="$50K - $250K">$50K - $250K</option>
                <option value="$250K - $1M">$250K - $1M</option>
                <option value="$1M - $5M">$1M - $5M</option>
                <option value="$5M+">$5M+</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Focus Areas *
              </label>
              <textarea
                value={professionalDetails.focusAreas || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, focusAreas: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                required
                rows={3}
                placeholder="e.g., Technology, Healthcare, SaaS..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Preferred Investment Stage *
              </label>
              <select
                value={professionalDetails.investmentStage || ''}
                onChange={(e) => setProfessionalDetails({ ...professionalDetails, investmentStage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                required
              >
                <option value="">Select Stage</option>
                <option value="Seed">Seed Stage</option>
                <option value="Series A">Series A</option>
                <option value="Series B">Series B</option>
                <option value="Series C+">Series C+</option>
                <option value="All Stages">All Stages</option>
              </select>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066cc] to-[#008b8b] flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Left Side - Branding */}
          <div className="bg-gradient-to-br from-[#0066cc] to-[#008b8b] text-white p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-6">
              <Rocket className="w-10 h-10" />
              <span className="text-3xl font-bold">LaunchPad</span>
            </div>
            <h2 className="text-3xl font-bold mb-4 text-white">
              {isLogin ? 'Welcome Back!' : 'Join Our Ecosystem'}
            </h2>
            <p className="text-blue-100 mb-8">
              Connect with entrepreneurs, suppliers, and investors in one unified platform.
            </p>
            <button
              onClick={onBack}
              className="text-white border border-white px-6 py-2 rounded-lg hover:bg-white hover:text-[#0066cc] transition w-fit"
            >
              ← Back to Home
            </button>
          </div>

          {/* Right Side - Form */}
          <div className="p-12">
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setIsLogin(true)}
                className={`flex-1 py-2 rounded-lg transition ${
                  isLogin
                    ? 'bg-[#0066cc] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Login
              </button>
              <button
                onClick={() => setIsLogin(false)}
                className={`flex-1 py-2 rounded-lg transition ${
                  !isLogin
                    ? 'bg-[#0066cc] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Register
              </button>
            </div>

            {/* Role Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Select Your Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setSelectedRole(role.value)}
                    className={`p-3 rounded-lg border-2 transition ${
                      selectedRole === role.value
                        ? 'border-[#0066cc] bg-[#e6f2ff]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`${role.color} text-white w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2`}>
                      {role.icon}
                    </div>
                    <div className="text-xs font-semibold text-gray-700">{role.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                    required={!isLogin}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
                  required
                />
              </div>

              {renderProfessionalFields()}

              <button
                type="submit"
                disabled={!selectedRole}
                className={`w-full py-3 rounded-lg font-semibold transition ${
                  selectedRole
                    ? 'bg-[#0066cc] text-white hover:bg-[#004080]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};