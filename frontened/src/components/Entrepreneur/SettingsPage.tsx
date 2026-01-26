import React, { useState } from 'react';
import { User, Mail, Lock, Bell, Shield, Building2, Briefcase, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SettingsPageProps {
  userName: string;
}

export const SettingsPage = ({ userName }: SettingsPageProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  const [notifications, setNotifications] = useState({
    orderUpdates: true,
    investorFeedback: true,
    newMessages: true,
    marketingEmails: false,
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Professional Details */}
      {user?.professionalDetails && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-[#0066cc]">
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
                    <div className="font-semibold text-gray-900">{user.professionalDetails.yearsInBusiness} years</div>
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
          <div className="mt-4 text-xs text-blue-700 bg-blue-50 rounded p-3 border border-blue-200">
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

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <User className="w-6 h-6 text-[#0066cc]" />
          Profile Settings
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              defaultValue={userName}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              defaultValue={`${userName.toLowerCase()}@example.com`}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>
          <button className="bg-[#0066cc] text-white px-6 py-2 rounded-lg hover:bg-[#004080] transition">
            Save Changes
          </button>
        </div>
      </div>

      {/* Password Settings */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Lock className="w-6 h-6 text-[#0066cc]" />
          Change Password
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>
          <button className="bg-[#0066cc] text-white px-6 py-2 rounded-lg hover:bg-[#004080] transition">
            Update Password
          </button>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Bell className="w-6 h-6 text-[#0066cc]" />
          Notification Preferences
        </h2>
        <div className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <label key={key} className="flex items-center justify-between cursor-pointer">
              <span className="text-gray-700">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </span>
              <input
                type="checkbox"
                checked={value}
                onChange={(e) =>
                  setNotifications({ ...notifications, [key]: e.target.checked })
                }
                className="w-5 h-5 text-[#0066cc] focus:ring-[#0066cc] rounded"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Privacy & Security */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#0066cc]" />
          Privacy & Security
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">Two-Factor Authentication</div>
              <div className="text-sm text-gray-600">Add an extra layer of security</div>
            </div>
            <button className="text-[#0066cc] hover:underline font-semibold">
              Enable
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900">Profile Visibility</div>
              <div className="text-sm text-gray-600">Control who can see your profile</div>
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc]">
              <option>Public</option>
              <option>Private</option>
              <option>Investors Only</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};