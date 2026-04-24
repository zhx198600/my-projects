'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthUser, AuthContextType } from '@/types';
import { userApi } from '@/mock/api';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      try {
        const token = localStorage.getItem(TOKEN_KEY);
        const userStr = localStorage.getItem(USER_KEY);

        if (token && userStr) {
          const parsedUser = JSON.parse(userStr) as AuthUser;
          setUser(parsedUser);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to parse auth user:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const loggedInUser = await userApi.login(username, password);
      
      const authUser: AuthUser = {
        id: loggedInUser.id,
        username: loggedInUser.username,
        role: loggedInUser.role,
        status: loggedInUser.status,
      };

      const mockToken = `jwt_${Date.now()}_${authUser.id}`;
      
      localStorage.setItem(TOKEN_KEY, mockToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
      
      setUser(authUser);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
