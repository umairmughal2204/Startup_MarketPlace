import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type UserRole = 'Entrepreneur' | 'Supplier' | 'Investor' | 'Admin';

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
  id: string;
  name: string;
  email: string;
  role: UserRole;
  professionalDetails?: ProfessionalDetails;
  isVerified?: boolean;
  status?: 'Active' | 'Suspended';
  createdAt?: string;
  profileVisibility?: 'Public' | 'Private';
}

interface StoredUser extends User {
  password: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, professionalDetails?: ProfessionalDetails) => Promise<void>;
  logout: () => void;
  approveUser: (userId: string, isVerified: boolean) => void;
  toggleUserStatus: (userId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const ADMIN_EMAIL = 'admin@gmail.com';
  const ADMIN_PASSWORD = 'admin123';
  const USERS_KEY = 'slm_users';
  const CURRENT_USER_KEY = 'slm_current_user';

  const loadUsers = () => {
    if (typeof window === 'undefined') return [] as StoredUser[];
    try {
      const raw = window.localStorage.getItem(USERS_KEY);
      if (raw) return JSON.parse(raw) as StoredUser[];
    } catch (err) {
      return [] as StoredUser[];
    }
    return [] as StoredUser[];
  };

  const saveUsers = (usersToSave: StoredUser[]) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(USERS_KEY, JSON.stringify(usersToSave));
  };

  const loadCurrentUser = () => {
    if (typeof window === 'undefined') return null as User | null;
    try {
      const raw = window.localStorage.getItem(CURRENT_USER_KEY);
      if (raw) return JSON.parse(raw) as User;
    } catch (err) {
      return null as User | null;
    }
    return null as User | null;
  };

  const saveCurrentUser = (current: User | null) => {
    if (typeof window === 'undefined') return;
    if (!current) {
      window.localStorage.removeItem(CURRENT_USER_KEY);
      return;
    }
    window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(current));
  };

  const [user, setUser] = useState<User | null>(() => loadCurrentUser());
  const [storedUsers, setStoredUsers] = useState<StoredUser[]>(() => {
    const initial = loadUsers();
    const hasAdmin = initial.some((u) => u.email.toLowerCase() === ADMIN_EMAIL);
    if (hasAdmin) return initial;
    const adminUser: StoredUser = {
      id: 'admin-1',
      name: 'Super Admin',
      email: ADMIN_EMAIL,
      role: 'Admin',
      password: ADMIN_PASSWORD,
      isVerified: true,
      status: 'Active',
      createdAt: new Date().toISOString(),
      profileVisibility: 'Private',
    };
    const next = [...initial, adminUser];
    saveUsers(next);
    return next;
  });

  useEffect(() => {
    saveUsers(storedUsers);
  }, [storedUsers]);

  useEffect(() => {
    const current = loadCurrentUser();
    if (!current) return;
    const found = storedUsers.find((u) => u.id === current.id);
    if (!found) {
      saveCurrentUser(null);
      return;
    }
    if (found.status === 'Suspended') {
      saveCurrentUser(null);
      return;
    }
    if (!found.isVerified && found.role !== 'Admin') {
      saveCurrentUser(null);
      return;
    }
    const { password: _password, ...safeUser } = found;
    setUser(safeUser);
  }, [storedUsers]);

  useEffect(() => {
    saveCurrentUser(user);
  }, [user]);

  const login = async (email: string, password: string, role: UserRole) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = storedUsers.find(
      (u) => u.email.toLowerCase() === normalizedEmail && u.role === role
    );

    if (!found) {
      throw new Error('Account not found');
    }

    if (found.password !== password) {
      throw new Error('Invalid credentials');
    }

    if (found.role === 'Admin') {
      if (found.email.toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
        throw new Error('Invalid admin credentials');
      }
    }

    if (found.status === 'Suspended') {
      throw new Error('Account suspended');
    }

    if (!found.isVerified && found.role !== 'Admin') {
      throw new Error('Account pending admin approval');
    }

    const { password: _password, ...safeUser } = found;
    setUser(safeUser);
  };

  const register = async (name: string, email: string, password: string, role: UserRole, professionalDetails?: ProfessionalDetails) => {
    if (role === 'Admin') {
      throw new Error('Admin accounts cannot be created');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const exists = storedUsers.some((u) => u.email.toLowerCase() === normalizedEmail);
    if (exists) {
      throw new Error('Email already registered');
    }

    const newUser: StoredUser = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email: normalizedEmail,
      role,
      password,
      professionalDetails,
      isVerified: false,
      status: 'Active',
      createdAt: new Date().toISOString(),
      profileVisibility: 'Public',
    };

    setStoredUsers((prev) => [...prev, newUser]);
    setUser(null);
  };

  const logout = () => {
    setUser(null);
    saveCurrentUser(null);
  };

  const approveUser = (userId: string, isVerified: boolean) => {
    setStoredUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, isVerified } : u))
    );
  };

  const toggleUserStatus = (userId: string) => {
    setStoredUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'Suspended' ? 'Active' : 'Suspended' } : u
      )
    );
  };

  const users = useMemo(() => {
    return storedUsers.map(({ password: _password, ...rest }) => rest);
  }, [storedUsers]);

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, approveUser, toggleUserStatus }}>
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