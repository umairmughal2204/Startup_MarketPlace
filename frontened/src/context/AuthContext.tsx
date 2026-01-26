import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  profileVisibility?: 'Public' | 'Private';
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, professionalDetails?: ProfessionalDetails) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (email: string, password: string, role: UserRole) => {
    // Mock login - in real app, this would call your backend
    // For demo purposes, create mock professional details
    let mockProfessionalDetails: ProfessionalDetails | undefined;
    let isVerified = true; // Mock users are verified by default
    
    if (role === 'Entrepreneur') {
      mockProfessionalDetails = {
        companyName: 'TechStartup Inc.',
        industry: 'Technology',
        businessStage: 'Early Stage',
        foundedYear: '2024',
      };
    } else if (role === 'Supplier') {
      mockProfessionalDetails = {
        businessName: 'Supply Solutions LLC',
        businessType: 'Software Provider',
        productsServices: 'Cloud hosting, SaaS solutions, and enterprise software',
        yearsInBusiness: '5',
      };
    } else if (role === 'Investor') {
      mockProfessionalDetails = {
        investmentFirm: 'Venture Capital Partners',
        investmentRange: '$250K - $1M',
        focusAreas: 'Technology, Healthcare, SaaS',
        investmentStage: 'Seed',
      };
    }

    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0],
      email,
      role,
      professionalDetails: mockProfessionalDetails,
      isVerified,
      profileVisibility: 'Public', // Default visibility for mock users
    };
    setUser(mockUser);
  };

  const register = async (name: string, email: string, password: string, role: UserRole, professionalDetails?: ProfessionalDetails) => {
    // Mock registration - new users are not verified by default
    const mockUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      role,
      professionalDetails,
      isVerified: false, // New registrations need admin verification
      profileVisibility: 'Public', // Default visibility
    };
    setUser(mockUser);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
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