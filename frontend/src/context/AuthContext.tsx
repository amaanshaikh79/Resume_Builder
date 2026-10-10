import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import apiService from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const userData = await apiService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
    setLoading(false);
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with:', { email });
      const response = await apiService.login({ email, password });
      console.log('Login successful:', response);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      const userData = await apiService.getCurrentUser();
      console.log('User data fetched:', userData);
      setUser(userData);
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    try {
      console.log('Attempting registration with:', { name: name || email.split('@')[0], email });
      const response = await apiService.register({ name: name || email.split('@')[0], email, password });
      console.log('Registration successful:', response);
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      const userData = await apiService.getCurrentUser();
      console.log('User data fetched:', userData);
      setUser(userData);
    } catch (error: any) {
      console.error('Registration error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
