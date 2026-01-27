// src/context/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, syncTokensToApiClient, type AuthState } from '../lib/auth';
import type { MeResponse, LoginRequest, RegisterRequest } from '../lib/types';

interface AuthContextType {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    fullName: string;
    company?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(authService.getState());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Ensure apiClient has latest tokens before any API calls (e.g. after redirect, refresh)
    syncTokensToApiClient();

    // Subscribe to auth state changes and keep apiClient in sync
    const unsubscribe = authService.subscribe((next) => {
      setAuthState(next);
      syncTokensToApiClient();
    });

    const validateSession = async () => {
      try {
        if (authService.isAuthenticated()) {
          await authService.fetchMe();
        }
      } catch {
        // Invalid/expired token - clear session
        await authService.logout();
      } finally {
        setIsLoading(false);
      }
    };

    void validateSession();

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login({ email, password });
  };

  const register = async (data: {
    email: string;
    password: string;
    fullName: string;
    company?: string;
  }) => {
    await authService.register({
      email: data.email,
      password: data.password,
      fullName: data.fullName || null,
      company: data.company || null,
    });
  };

  const logout = async () => {
    await authService.logout();
  };

  const refreshUser = async () => {
    if (!authService.isAuthenticated()) {
      return;
    }
    await authService.fetchMe();
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isLoading,
        isAuthenticated: authState.isAuthenticated,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
