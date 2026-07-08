import React, { useMemo, useState } from 'react';
import { Search, UserCheck, UserX, Mail, Shield, X, Building2, Briefcase, Calendar, Eye, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { UserRole, ProfessionalDetails, useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { ApiError } from '../../api/apiError';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: 'Active' | 'Suspended';
  professionalDetails?: ProfessionalDetails;
  isVerified?: boolean;
  createdAt?: string;
}

interface UserDetailsModal {
  isOpen: boolean;
  user: User | null;
}

export const ManageUsers = () => {
  const { addNotification } = useNotifications();
  const { users, approveUser, toggleUserStatus } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [userDetailsModal, setUserDetailsModal] = useState<UserDetailsModal>({
    isOpen: false,
    user: null,
  });
  
  const handleToggleStatus = async (userId: string, name: string, currentStatus?: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      await toggleUserStatus(userId);
      toast.success(`${name} has been ${nextStatus.toLowerCase()}.`);
      addNotification({
        type: 'general',
        title: `User ${nextStatus}`,
        message: `${name} has been ${nextStatus.toLowerCase()}.`,
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to ${nextStatus === 'Suspended' ? 'suspend' : 'activate'} ${name}.`);
    }
  };

  const handleToggleVerification = async (userId: string, name: string, isVerified?: boolean) => {
    const willBeVerified = !isVerified;
    try {
      await approveUser(userId, willBeVerified);
      toast.success(`${name}'s professional details have been ${willBeVerified ? 'verified' : 'unverified'}.`);
      addNotification({
        type: 'general',
        title: willBeVerified ? 'User Verified' : 'Verification Revoked',
        message: `${name}'s professional details have been ${willBeVerified ? 'verified' : 'unverified'}.`,
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : `Failed to update verification for ${name}.`);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'All' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter(u => u.status === 'Active').length,
      suspended: users.filter(u => u.status === 'Suspended').length,
      entrepreneurs: users.filter(u => u.role === 'Entrepreneur').length,
      suppliers: users.filter(u => u.role === 'Supplier').length,
      investors: users.filter(u => u.role === 'Investor').length,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-green-600 mb-1">{stats.active}</div>
          <div className="text-sm text-gray-600">Active Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-red-600 mb-1">{stats.suspended}</div>
          <div className="text-sm text-gray-600">Suspended</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-3xl font-bold text-blue-600 mb-1">{stats.entrepreneurs}</div>
          <div className="text-sm text-gray-600">Entrepreneurs</div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
            />
          </div>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0066cc] focus:border-transparent"
          >
            <option value="All">All Roles</option>
            <option value="Entrepreneur">Entrepreneurs</option>
            <option value="Supplier">Suppliers</option>
            <option value="Investor">Investors</option>
            <option value="Admin">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Verified</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Active</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#0066cc] text-white rounded-full flex items-center justify-center font-semibold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Entrepreneur' ? 'bg-blue-100 text-blue-800' :
                      user.role === 'Supplier' ? 'bg-green-100 text-green-800' :
                      user.role === 'Investor' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      (user.status || 'Active') === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {user.status || 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      user.isVerified
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.isVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUserDetailsModal({ isOpen: true, user })}
                        className="px-3 py-1 bg-[#0066cc] text-white rounded-lg text-sm font-semibold hover:bg-[#004080] transition flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        Details
                      </button>
                      {user.role !== 'Admin' && (
                        <button
                          onClick={() => handleToggleVerification(user.id, user.name, user.isVerified)}
                          className={`px-3 py-1 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${
                            user.isVerified
                              ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {user.isVerified ? (
                            <>
                              <XCircle className="w-4 h-4" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-4 h-4" />
                              Verify
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleToggleStatus(user.id, user.name, user.status || 'Active')}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                          (user.status || 'Active') === 'Active'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {(user.status || 'Active') === 'Active' ? 'Suspend' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">No users found matching your criteria.</p>
        </div>
      )}

      {/* User Details Modal */}
      {userDetailsModal.isOpen && userDetailsModal.user && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-[#0066cc] to-[#008b8b] text-white p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Details</h2>
              <button
                onClick={() => setUserDetailsModal({ isOpen: false, user: null })}
                className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#0066cc]" />
                  Basic Information
                </h3>
                <div className="grid md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Full Name</div>
                    <div className="font-semibold text-gray-900">{userDetailsModal.user.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Email Address</div>
                    <div className="font-semibold text-gray-900">{userDetailsModal.user.email}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Role</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      userDetailsModal.user.role === 'Entrepreneur' ? 'bg-blue-100 text-blue-800' :
                      userDetailsModal.user.role === 'Supplier' ? 'bg-green-100 text-green-800' :
                      userDetailsModal.user.role === 'Investor' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {userDetailsModal.user.role}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Account Status</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      (userDetailsModal.user.status || 'Active') === 'Active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {userDetailsModal.user.status || 'Active'}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Joined Date</div>
                    <div className="font-semibold text-gray-900">
                      {userDetailsModal.user.createdAt
                        ? new Date(userDetailsModal.user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Last Active</div>
                    <div className="font-semibold text-gray-900">
                      {userDetailsModal.user.createdAt
                        ? new Date(userDetailsModal.user.createdAt).toLocaleDateString()
                        : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Professional Details */}
              {userDetailsModal.user.professionalDetails && (
                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-900 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-[#0066cc]" />
                    Professional Information
                  </h3>
                  <div className={`rounded-lg border-2 p-4 ${
                    userDetailsModal.user.role === 'Entrepreneur' ? 'bg-blue-50 border-blue-200' :
                    userDetailsModal.user.role === 'Supplier' ? 'bg-green-50 border-green-200' :
                    'bg-purple-50 border-purple-200'
                  }`}>
                    <div className="grid md:grid-cols-2 gap-4">
                      {/* Entrepreneur Details */}
                      {userDetailsModal.user.role === 'Entrepreneur' && (
                        <>
                          {userDetailsModal.user.professionalDetails.companyName && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Company Name</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.companyName}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.industry && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Industry</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.industry}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.businessStage && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Business Stage</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.businessStage}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.foundedYear && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Founded Year</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.foundedYear}</div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Supplier Details */}
                      {userDetailsModal.user.role === 'Supplier' && (
                        <>
                          {userDetailsModal.user.professionalDetails.businessName && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Business Name</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.businessName}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.businessType && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Business Type</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.businessType}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.productsServices && (
                            <div className="bg-white rounded-lg p-3 md:col-span-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Products/Services</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.productsServices}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.yearsInBusiness && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Years in Business</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.yearsInBusiness} years</div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Investor Details */}
                      {userDetailsModal.user.role === 'Investor' && (
                        <>
                          {userDetailsModal.user.professionalDetails.investmentFirm && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Building2 className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Investment Firm</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.investmentFirm}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.investmentRange && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Investment Range</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.investmentRange}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.focusAreas && (
                            <div className="bg-white rounded-lg p-3 md:col-span-2">
                              <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Focus Areas</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.focusAreas}</div>
                            </div>
                          )}
                          {userDetailsModal.user.professionalDetails.investmentStage && (
                            <div className="bg-white rounded-lg p-3">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-gray-600" />
                                <span className="text-sm font-semibold text-gray-600">Investment Stage</span>
                              </div>
                              <div className="font-semibold text-gray-900">{userDetailsModal.user.professionalDetails.investmentStage}</div>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {userDetailsModal.user.isVerified && (
                      <div className="mt-4 text-xs text-green-700 bg-green-50 rounded p-3 border border-green-200">
                        ✓ <strong>Verified:</strong> Professional details have been verified by admin team.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                <button
                  onClick={() => setUserDetailsModal({ isOpen: false, user: null })}
                  className="bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Close
                </button>
                
                {userDetailsModal.user.professionalDetails && (
                  <button
                    onClick={() => {
                      handleToggleVerification(
                        userDetailsModal.user!.id,
                        userDetailsModal.user!.name,
                        userDetailsModal.user!.isVerified
                      );
                    }}
                    className={`flex-1 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                      userDetailsModal.user.isVerified
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {userDetailsModal.user.isVerified ? (
                      <>
                        <XCircle className="w-5 h-5" />
                        Revoke Verification
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5" />
                        Verify Professional Details
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={() => {
                    handleToggleStatus(
                      userDetailsModal.user!.id,
                      userDetailsModal.user!.name,
                      userDetailsModal.user!.status || 'Active'
                    );
                    setUserDetailsModal({ isOpen: false, user: null });
                  }}
                  className={`py-3 px-6 rounded-lg font-semibold transition ${
                    (userDetailsModal.user.status || 'Active') === 'Active'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {(userDetailsModal.user.status || 'Active') === 'Active' ? 'Suspend User' : 'Activate User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};