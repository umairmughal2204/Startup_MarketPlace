import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Rocket, ShoppingBag, Sparkles, TrendingUp } from 'lucide-react';
import { UserRole } from '../../context/AuthContext';

interface AuthPageProps {
  onLogin: (email: string, password: string, role: UserRole) => Promise<void>;
  onRegister: (name: string, email: string, password: string, role: UserRole, professionalDetails: ProfessionalDetails) => Promise<void>;
  onBack: () => void;
}

interface ProfessionalDetails {
  companyName?: string;
  industry?: string;
  businessStage?: string;
  foundedYear?: string;
  businessName?: string;
  businessType?: string;
  productsServices?: string;
  yearsInBusiness?: string;
  investmentFirm?: string;
  investmentRange?: string;
  focusAreas?: string;
  investmentStage?: string;
}

const roleThemes = {
  Entrepreneur: {
    label: 'Entrepreneur',
    icon: <Rocket className="w-6 h-6" />,
    description: 'Build, validate, and fund your startup.',
    gradientClass: 'bg-gradient-aurora-entrepreneur',
    softClass: 'bg-pink-50',
    borderClass: 'border-pink-200',
    textClass: 'text-pink-600',
    selectedClass: 'border-pink-400 bg-pink-50 shadow-pink-500/15',
  },
  Supplier: {
    label: 'Supplier',
    icon: <ShoppingBag className="w-6 h-6" />,
    description: 'Offer tools, services, and solutions.',
    gradientClass: 'bg-gradient-aurora-supplier',
    softClass: 'bg-cyan-50',
    borderClass: 'border-cyan-200',
    textClass: 'text-teal-600',
    selectedClass: 'border-cyan-400 bg-cyan-50 shadow-cyan-500/15',
  },
  Investor: {
    label: 'Investor',
    icon: <TrendingUp className="w-6 h-6" />,
    description: 'Review ventures and discover deals.',
    gradientClass: 'bg-gradient-aurora-investor',
    softClass: 'bg-violet-50',
    borderClass: 'border-violet-200',
    textClass: 'text-violet-600',
    selectedClass: 'border-violet-400 bg-violet-50 shadow-violet-500/15',
  },
} satisfies Record<'Entrepreneur' | 'Supplier' | 'Investor', {
  label: string;
  icon: React.ReactNode;
  description: string;
  gradientClass: string;
  softClass: string;
  borderClass: string;
  textClass: string;
  selectedClass: string;
}>;

const roleOptions = Object.entries(roleThemes).map(([value, theme]) => ({
  value: value as UserRole,
  ...theme,
}));

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100';
const labelClass = 'block text-sm font-semibold text-slate-700 mb-2';

export const AuthPage = ({ onLogin, onRegister, onBack }: AuthPageProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [professionalDetails, setProfessionalDetails] = useState<ProfessionalDetails>({});

  const selectedTheme = selectedRole && selectedRole in roleThemes
    ? roleThemes[selectedRole as keyof typeof roleThemes]
    : null;

  const handleModeChange = (loginMode: boolean) => {
    setIsLogin(loginMode);
    setAuthError(null);
    setAuthMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    setAuthError(null);
    setAuthMessage(null);

    try {
      if (isLogin) {
        await onLogin(formData.email, formData.password, selectedRole);
      } else {
        await onRegister(formData.name, formData.email, formData.password, selectedRole, professionalDetails);
        setAuthMessage('Registration submitted. Wait for admin approval.');
        setIsLogin(true);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Authentication failed');
    }
  };

  const updateDetails = (key: keyof ProfessionalDetails, value: string) => {
    setProfessionalDetails({ ...professionalDetails, [key]: value });
  };

  const renderProfessionalFields = () => {
    if (isLogin || !selectedRole || !selectedTheme) return null;

    const panelClass = `space-y-4 rounded-2xl border ${selectedTheme.borderClass} ${selectedTheme.softClass} p-5`;

    switch (selectedRole) {
      case 'Entrepreneur':
        return (
          <div className={panelClass}>
            <h3 className={`text-sm font-bold ${selectedTheme.textClass}`}>Verification Details</h3>
            <div>
              <label className={labelClass}>Company/Startup Name *</label>
              <input type="text" value={professionalDetails.companyName || ''} onChange={(e) => updateDetails('companyName', e.target.value)} className={inputClass} required placeholder="e.g., TechStartup Inc." />
            </div>
            <div>
              <label className={labelClass}>Industry *</label>
              <select value={professionalDetails.industry || ''} onChange={(e) => updateDetails('industry', e.target.value)} className={inputClass} required>
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
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Business Stage *</label>
                <select value={professionalDetails.businessStage || ''} onChange={(e) => updateDetails('businessStage', e.target.value)} className={inputClass} required>
                  <option value="">Select Stage</option>
                  <option value="Idea">Idea Stage</option>
                  <option value="MVP">MVP/Prototype</option>
                  <option value="Early Stage">Early Stage</option>
                  <option value="Growth">Growth Stage</option>
                  <option value="Established">Established</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Founded Year *</label>
                <input type="number" value={professionalDetails.foundedYear || ''} onChange={(e) => updateDetails('foundedYear', e.target.value)} className={inputClass} required min="1900" max={new Date().getFullYear()} placeholder="2024" />
              </div>
            </div>
          </div>
        );

      case 'Supplier':
        return (
          <div className={panelClass}>
            <h3 className={`text-sm font-bold ${selectedTheme.textClass}`}>Verification Details</h3>
            <div>
              <label className={labelClass}>Business Name *</label>
              <input type="text" value={professionalDetails.businessName || ''} onChange={(e) => updateDetails('businessName', e.target.value)} className={inputClass} required placeholder="e.g., Supply Solutions LLC" />
            </div>
            <div>
              <label className={labelClass}>Business Type *</label>
              <select value={professionalDetails.businessType || ''} onChange={(e) => updateDetails('businessType', e.target.value)} className={inputClass} required>
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
              <label className={labelClass}>Products/Services Offered *</label>
              <textarea value={professionalDetails.productsServices || ''} onChange={(e) => updateDetails('productsServices', e.target.value)} className={`${inputClass} min-h-24 resize-none`} required placeholder="Briefly describe your products or services..." />
            </div>
            <div>
              <label className={labelClass}>Years in Business *</label>
              <input type="number" value={professionalDetails.yearsInBusiness || ''} onChange={(e) => updateDetails('yearsInBusiness', e.target.value)} className={inputClass} required min="0" max="100" placeholder="5" />
            </div>
          </div>
        );

      case 'Investor':
        return (
          <div className={panelClass}>
            <h3 className={`text-sm font-bold ${selectedTheme.textClass}`}>Verification Details</h3>
            <div>
              <label className={labelClass}>Investment Firm/Name *</label>
              <input type="text" value={professionalDetails.investmentFirm || ''} onChange={(e) => updateDetails('investmentFirm', e.target.value)} className={inputClass} required placeholder="e.g., Venture Capital Partners" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Investment Range *</label>
                <select value={professionalDetails.investmentRange || ''} onChange={(e) => updateDetails('investmentRange', e.target.value)} className={inputClass} required>
                  <option value="">Select Range</option>
                  <option value="$10K - $50K">$10K - $50K</option>
                  <option value="$50K - $250K">$50K - $250K</option>
                  <option value="$250K - $1M">$250K - $1M</option>
                  <option value="$1M - $5M">$1M - $5M</option>
                  <option value="$5M+">$5M+</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Preferred Stage *</label>
                <select value={professionalDetails.investmentStage || ''} onChange={(e) => updateDetails('investmentStage', e.target.value)} className={inputClass} required>
                  <option value="">Select Stage</option>
                  <option value="Seed">Seed Stage</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Series C+">Series C+</option>
                  <option value="All Stages">All Stages</option>
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>Focus Areas *</label>
              <textarea value={professionalDetails.focusAreas || ''} onChange={(e) => updateDetails('focusAreas', e.target.value)} className={`${inputClass} min-h-24 resize-none`} required placeholder="e.g., Technology, Healthcare, SaaS..." />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1b3a] px-4 py-8 text-slate-900">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '36px 36px' }}></div>
      <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-pink-500/20 blur-[120px]"></div>
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-[140px]"></div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <div className="w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl">
          <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
            <aside className={`relative overflow-hidden p-8 text-white sm:p-10 ${selectedTheme?.gradientClass || 'bg-gradient-aurora-base'}`}>
              <button onClick={onBack} className="mb-10 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
                <ArrowLeft className="w-4 h-4" />
                Back to Home
              </button>

              <div className="max-w-sm">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h1 className="text-4xl font-bold leading-tight text-white">
                  {isLogin ? 'Welcome back to LaunchPad.' : 'Create your verified LaunchPad profile.'}
                </h1>
                <p className="mt-5 text-sm leading-6 text-white/82">
                  One account, three connected paths: founders building traction, suppliers powering growth, and investors finding vetted opportunities.
                </p>
              </div>

              <div className="mt-10 space-y-3">
                {roleOptions.map((role) => (
                  <div key={role.value} className="flex items-center gap-3 rounded-2xl bg-white/12 p-3 ring-1 ring-white/15">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/18">
                      {role.icon}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white">{role.label}</div>
                      <div className="text-xs text-white/75">{role.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </aside>

            <main className="p-6 sm:p-10 lg:p-12">
              <div className="mb-8">
                <div className="inline-grid grid-cols-2 rounded-xl bg-slate-100 p-1">
                  <button onClick={() => handleModeChange(true)} className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${isLogin ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    Login
                  </button>
                  <button onClick={() => handleModeChange(false)} className={`rounded-lg px-5 py-2.5 text-sm font-bold transition ${!isLogin ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>
                    Register
                  </button>
                </div>

                <h2 className="mt-8 text-3xl font-bold text-slate-950">
                  {isLogin ? 'Sign in to your portal' : 'Choose your role and apply'}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {isLogin ? 'Select the role tied to your account before signing in.' : 'Verification details help the admin approve the right access.'}
                </p>
              </div>

              {authError && (
                <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {authError}
                </div>
              )}

              {authMessage && (
                <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
                  {authMessage}
                </div>
              )}

              <div className="mb-6">
                <label className={labelClass}>Select Your Role</label>
                <div className="grid gap-3 sm:grid-cols-3">
                  {roleOptions.map((role) => (
                    <button
                      key={role.value}
                      type="button"
                      onClick={() => setSelectedRole(role.value)}
                      className={`rounded-2xl border p-4 text-left shadow-lg shadow-transparent transition hover:-translate-y-0.5 hover:border-slate-300 ${
                        selectedRole === role.value ? role.selectedClass : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl text-white ${role.gradientClass}`}>
                        {selectedRole === role.value ? <CheckCircle2 className="w-6 h-6" /> : role.icon}
                      </div>
                      <div className="text-sm font-bold text-slate-950">{role.label}</div>
                      <div className="mt-1 text-xs leading-5 text-slate-500">{role.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <div>
                    <label className={labelClass}>Full Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required={!isLogin} placeholder="Your name" />
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className={labelClass}>Email Address</label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className={inputClass} required placeholder="you@example.com" />
                  </div>
                  <div>
                    <label className={labelClass}>Password</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className={inputClass} required placeholder="Enter password" />
                  </div>
                </div>

                {renderProfessionalFields()}

                <button
                  type="submit"
                  disabled={!selectedRole}
                  className={`w-full rounded-xl py-3.5 font-bold text-white transition ${
                    selectedRole && selectedTheme
                      ? `${selectedTheme.gradientClass} shadow-lg hover:-translate-y-0.5`
                      : 'cursor-not-allowed bg-slate-300 text-slate-500'
                  }`}
                >
                  {isLogin ? 'Sign In' : 'Create Account'}
                </button>
              </form>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
