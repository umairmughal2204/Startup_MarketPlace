import React, { useEffect, useState } from 'react';
import { User, Lock, Shield, Building2, Briefcase, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isValidEmail, isValidPhone } from '../../utils/validation';

interface SettingsPageProps {
  userName: string;
}

const settingsThemes: Record<string, {
  panel: string;
  icon: string;
  button: string;
  input: string;
  info: string;
  link: string;
}> = {
  Entrepreneur: {
    panel: 'from-pink-50 to-violet-50 border-pink-200',
    icon: 'text-pink-600',
    button: 'bg-gradient-aurora-entrepreneur hover:shadow-pink-500/25',
    input: 'focus:ring-pink-200 focus:border-pink-400',
    info: 'text-pink-700 bg-pink-50 border-pink-200',
    link: 'text-pink-600',
  },
  Supplier: {
    panel: 'from-cyan-50 to-violet-50 border-cyan-200',
    icon: 'text-teal-600',
    button: 'bg-gradient-aurora-supplier hover:shadow-cyan-500/25',
    input: 'focus:ring-cyan-200 focus:border-cyan-400',
    info: 'text-teal-700 bg-cyan-50 border-cyan-200',
    link: 'text-teal-600',
  },
  Investor: {
    panel: 'from-blue-50 to-pink-50 border-violet-200',
    icon: 'text-violet-600',
    button: 'bg-gradient-aurora-investor hover:shadow-violet-500/25',
    input: 'focus:ring-violet-200 focus:border-violet-400',
    info: 'text-violet-700 bg-violet-50 border-violet-200',
    link: 'text-violet-600',
  },
};

export const SettingsPage = ({ userName }: SettingsPageProps) => {
  const { user, updateProfile, updatePassword } = useAuth();
  const theme = settingsThemes[user?.role || 'Entrepreneur'] || settingsThemes.Entrepreneur;
  const [profileForm, setProfileForm] = useState({
    name: user?.name || userName,
    email: user?.email || '',
    phone: user?.phone || '',
    profileVisibility: user?.profileVisibility || 'Public',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    setProfileForm({
      name: user?.name || userName,
      email: user?.email || '',
      phone: user?.phone || '',
      profileVisibility: user?.profileVisibility || 'Public',
    });
  }, [user, userName]);

  const handleSaveProfile = async () => {
    setStatusMessage(null);
    setStatusError(null);

    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      setStatusError('Name and email are required.');
      return;
    }

    if (!isValidEmail(profileForm.email)) {
      setStatusError('Please enter a valid email address.');
      return;
    }

    if (profileForm.phone.trim() && !isValidPhone(profileForm.phone)) {
      setStatusError('Please enter a valid phone number.');
      return;
    }

    try {
      await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
        phone: profileForm.phone.trim(),
        profileVisibility: profileForm.profileVisibility,
      });
      setStatusMessage('Profile updated successfully.');
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Unable to update profile.');
    }
  };

  const handleUpdatePassword = async () => {
    setStatusMessage(null);
    setStatusError(null);

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setStatusError('Please complete all password fields.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setStatusError('New passwords do not match.');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setStatusError('New password must be at least 6 characters.');
      return;
    }

    try {
      await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setStatusMessage('Password updated successfully.');
    } catch (err) {
      setStatusError(err instanceof Error ? err.message : 'Unable to update password.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {user?.professionalDetails && (
        <div className={`bg-gradient-to-r ${theme.panel} border rounded-2xl shadow-sm p-6`}>
          <h2 className={`text-xl font-bold mb-6 flex items-center gap-2 ${theme.icon}`}>
            <Building2 className="w-6 h-6" />
            Professional Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {user.role === 'Entrepreneur' && (
              <>
                {user.professionalDetails.companyName && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Company Name</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.companyName}</div>
                  </div>
                )}
                {user.professionalDetails.industry && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Industry</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.industry}</div>
                  </div>
                )}
                {user.professionalDetails.businessStage && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Business Stage</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.businessStage}</div>
                  </div>
                )}
                {user.professionalDetails.foundedYear && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Founded Year</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.foundedYear}</div>
                  </div>
                )}
              </>
            )}

            {user.role === 'Supplier' && (
              <>
                {user.professionalDetails.businessName && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Business Name</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.businessName}</div>
                  </div>
                )}
                {user.professionalDetails.businessType && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Business Type</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.businessType}</div>
                  </div>
                )}
                {user.professionalDetails.productsServices && (
                  <div className="bg-white rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Products/Services</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.productsServices}</div>
                  </div>
                )}
                {user.professionalDetails.yearsInBusiness && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Years in Business</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.yearsInBusiness}</div>
                  </div>
                )}
              </>
            )}

            {user.role === 'Investor' && (
              <>
                {user.professionalDetails.investmentFirm && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Investment Firm</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.investmentFirm}</div>
                  </div>
                )}
                {user.professionalDetails.investmentRange && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Investment Range</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.investmentRange}</div>
                  </div>
                )}
                {user.professionalDetails.focusAreas && (
                  <div className="bg-white rounded-lg p-4 md:col-span-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Focus Areas</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.focusAreas}</div>
                  </div>
                )}
                {user.professionalDetails.investmentStage && (
                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-600">Investment Stage</span>
                    </div>
                    <div className="font-semibold text-gray-900">{user.professionalDetails.investmentStage}</div>
                  </div>
                )}
              </>
            )}
          </div>
          <div className={`mt-4 text-xs rounded-xl p-3 border ${theme.info}`}>
            {user.isVerified ? (
              <>
                <strong>✓ Verified Account:</strong> Your professional details have been verified by our admin team.
              </>
            ) : (
              <>
                <strong>⏳ Pending Verification:</strong> Your professional details are pending admin verification.
              </>
            )}
          </div>
        </div>
      )}

      {(statusError || statusMessage) && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            statusError
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-green-200 bg-green-50 text-green-700'
          }`}
        >
          {statusError || statusMessage}
        </div>
      )}

      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <User className={`w-6 h-6 ${theme.icon}`} />
          Profile Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
            <input
              type="text"
              value={profileForm.name}
              onChange={(event) => setProfileForm({ ...profileForm, name: event.target.value })}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 ${theme.input}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
            <input
              type="email"
              value={profileForm.email}
              onChange={(event) => setProfileForm({ ...profileForm, email: event.target.value })}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 ${theme.input}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
            <input
              type="tel"
              value={profileForm.phone}
              onChange={(event) => setProfileForm({ ...profileForm, phone: event.target.value })}
              placeholder="+1 (555) 000-0000"
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 ${theme.input}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Profile Visibility</label>
            <select
              value={profileForm.profileVisibility}
              onChange={(event) =>
                setProfileForm({ ...profileForm, profileVisibility: event.target.value as 'Public' | 'Private' })
              }
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 ${theme.input}`}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
          <button
            onClick={handleSaveProfile}
            className={`${theme.button} text-white px-6 py-2 rounded-xl hover:shadow-lg transition`}
          >
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lock className={`w-6 h-6 ${theme.icon}`} />
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, currentPassword: event.target.value })
              }
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 ${theme.input}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(event) => setPasswordForm({ ...passwordForm, newPassword: event.target.value })}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 ${theme.input}`}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(event) =>
                setPasswordForm({ ...passwordForm, confirmPassword: event.target.value })
              }
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 ${theme.input}`}
            />
          </div>
          <button
            onClick={handleUpdatePassword}
            className={`${theme.button} text-white px-6 py-2 rounded-xl hover:shadow-lg transition`}
          >
            Update Password
          </button>
        </div>
      </div>

      <div className="bg-white/90 rounded-2xl border border-pink-100 shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className={`w-6 h-6 ${theme.icon}`} />
          Privacy & Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-600">Add an extra layer of security</div>
            </div>
            <button className={`${theme.link} hover:underline font-semibold`}>Enable</button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">Profile Visibility</div>
              <div className="text-sm text-gray-600">Control who can see your profile</div>
            </div>
            <select
              value={profileForm.profileVisibility}
              onChange={(event) =>
                setProfileForm({ ...profileForm, profileVisibility: event.target.value as 'Public' | 'Private' })
              }
              className={`px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 ${theme.input}`}
            >
              <option value="Public">Public</option>
              <option value="Private">Private</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
