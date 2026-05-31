import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../services/api';
import type { User, LoginData, RegisterData } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAdmin: () => boolean;
  checkUser: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (data: LoginData) => {
    try {
      const response = await authAPI.login(data);
      const { token: newToken, user: newUser } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(newUser));

      setToken(newToken);
      setUser(newUser);
      setIsAuthenticated(true);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('登录失败，请检查用户名和密码');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      await authAPI.register(data);
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('注册失败，请稍后重试');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const checkAdmin = () => {
    return user?.role === 'admin';
  };

  const checkUser = () => {
    return user?.role === 'user';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        checkAdmin,
        checkUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
