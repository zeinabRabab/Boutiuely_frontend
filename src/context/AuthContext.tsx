import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, TokenResponse } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
  isCashier: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('boutiquely_token');
    const savedUser = localStorage.getItem('boutiquely_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('boutiquely_token');
        localStorage.removeItem('boutiquely_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authAPI.login({ email, password });
    const data: TokenResponse = res.data;

    localStorage.setItem('boutiquely_token', data.access_token);

    const loggedInUser: User = {
      id: data.user_id,
      name: data.name,
      email,
      role: data.role as 'admin' | 'cashier',
    };

    localStorage.setItem('boutiquely_user', JSON.stringify(loggedInUser));
    setToken(data.access_token);
    setUser(loggedInUser);
  };

  const logout = () => {
    localStorage.removeItem('boutiquely_token');
    localStorage.removeItem('boutiquely_user');
    setToken(null);
    setUser(null);
  };

  const isAdmin = user?.role === 'admin';
  const isCashier = user?.role === 'cashier';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAdmin, isCashier, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
