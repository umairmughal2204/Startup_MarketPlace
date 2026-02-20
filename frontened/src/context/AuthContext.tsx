import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type UserRole = 'Entrepreneur' | 'Supplier' | 'Investor' | 'Admin';

export interface NotificationPreferences {
  orderUpdates: boolean;
  investorFeedback: boolean;
  newMessages: boolean;
  marketingEmails: boolean;
}

export interface ProfessionalDetails {
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

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  professionalDetails?: ProfessionalDetails;
  isVerified?: boolean;
  status?: 'Active' | 'Suspended';
  createdAt?: string;
  phone?: string;
  notificationPreferences?: NotificationPreferences;
  profileVisibility?: 'Public' | 'Private';
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, professionalDetails?: ProfessionalDetails) => Promise<void>;
  logout: () => void;
  approveUser: (userId: string, isVerified: boolean) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
  updateProfile: (payload: {
    name: string;
    email: string;
    phone?: string;
    profileVisibility?: 'Public' | 'Private';
  }) => Promise<void>;
  updatePassword: (currentPassword: string, nextPassword: string) => Promise<void>;
  updateNotifications: (preferences: NotificationPreferences) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const ADMIN_EMAIL = 'admin@gmail.com';
  const ADMIN_PASSWORD = 'admin123';
  const CURRENT_USER_KEY = 'slm_current_user';

  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Load current user from localStorage on mount
  useEffect(() => {
    const loadCurrentUser = () => {
      try {
        const raw = window.localStorage?.getItem(CURRENT_USER_KEY);
        if (raw) {
          const loadedUser = JSON.parse(raw);
          setUser(loadedUser);
        }
      } catch (err) {
        console.error('Failed to load current user:', err);
      }
    };
    loadCurrentUser();
    setLoading(false);
  }, []);

  // Fetch all users for admin dashboard
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_URL}/auth/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const saveCurrentUser = (current: User | null) => {
    if (!current) {
      window.localStorage?.removeItem(CURRENT_USER_KEY);
      return;
    }
    window.localStorage?.setItem(CURRENT_USER_KEY, JSON.stringify(current));
  };

  const login = async (email: string, password: string, role: UserRole) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      const loggedInUser: User = {
        id: data.user._id,
        ...data.user,
      };
      setUser(loggedInUser);
      saveCurrentUser(loggedInUser);
    } finally {
      setLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    professionalDetails?: ProfessionalDetails
  ) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          professionalDetails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }

      // Refresh users list
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  const updateProfile = async (payload: {
    name: string;
    email: string;
    phone?: string;
    profileVisibility?: 'Public' | 'Private';
  }) => {
    if (!user?.id) throw new Error('Not authenticated');

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/users/${user.id}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await response.json();
      const updatedUser: User = {
        ...user,
        ...data.user,
        id: data.user._id,
      };
      setUser(updatedUser);
      saveCurrentUser(updatedUser);
      await fetchUsers();
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (currentPassword: string, nextPassword: string) => {
    if (!user?.id) throw new Error('Not authenticated');

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/users/${user.id}/password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword: nextPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update password');
      }
    } finally {
      setLoading(false);
    }
  };

  const updateNotifications = async (preferences: NotificationPreferences) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`${API_URL}/auth/users/${user.id}/notifications`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationPreferences: preferences }),
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser: User = {
          ...user,
          ...data.user,
          id: data.user._id,
        };
        setUser(updatedUser);
        saveCurrentUser(updatedUser);
        await fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const approveUser = async (userId: string, isVerified: boolean) => {
    try {
      const response = await fetch(`${API_URL}/auth/users/${userId}/verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified }),
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Failed to approve user:', error);
    }
  };

  const toggleUserStatus = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        await fetchUsers();
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        login,
        register,
        logout,
        approveUser,
        toggleUserStatus,
        updateProfile,
        updatePassword,
        updateNotifications,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};