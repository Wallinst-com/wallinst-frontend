/**
 * Authentication Service for Wallinst Frontend
 * Adapted from guidelines for Vite
 */

import { apiClient } from './api-client';
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  MeResponse,
} from './types';

const ACCESS_TOKEN_KEY = 'wallinst_access_token';
const REFRESH_TOKEN_KEY = 'wallinst_refresh_token';
const USER_KEY = 'wallinst_user';

export interface AuthState {
  user: MeResponse | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

class AuthService {
  private listeners: Set<(state: AuthState) => void> = new Set();
  private state: AuthState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
  };

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);

    if (accessToken && refreshToken) {
      this.state.accessToken = accessToken;
      this.state.refreshToken = refreshToken;
      apiClient.setTokens(accessToken, refreshToken);

      if (userStr) {
        try {
          this.state.user = JSON.parse(userStr);
          this.state.isAuthenticated = true;
        } catch {
          // Invalid user data, clear it
          this.clearAuth();
        }
      }
    }
  }

  private saveToStorage(accessToken: string, refreshToken: string, user: MeResponse) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  private clearStorage() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  private updateState(updates: Partial<AuthState>) {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  subscribe(listener: (state: AuthState) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.state));
  }

  getState(): AuthState {
    return { ...this.state };
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data, { skipAuth: true });
    // Set tokens first so fetchMe can use them
    apiClient.setTokens(response.accessToken, response.refreshToken);
    // Fetch full user profile
    const user = await this.fetchMe();
    this.setAuth(response.accessToken, response.refreshToken, user);
    return { ...response, user: { ...response.user, role: user.role } };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', data, { skipAuth: true });
    // Set tokens first so fetchMe can use them
    apiClient.setTokens(response.accessToken, response.refreshToken);
    // Fetch full user profile
    const user = await this.fetchMe();
    this.setAuth(response.accessToken, response.refreshToken, user);
    return { ...response, user: { ...response.user, role: user.role } };
  }

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout', undefined, { skipAuth: false });
    } catch (error) {
      // Continue with logout even if API call fails
      console.error('Logout API call failed:', error);
    } finally {
      this.clearAuth();
    }
  }

  async refresh(): Promise<void> {
    const refreshToken = this.state.refreshToken;
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{
      accessToken: string;
      refreshToken: string;
    }>('/auth/refresh', { refreshToken });

    this.setAuth(
      response.accessToken,
      response.refreshToken,
      this.state.user!
    );
  }

  async fetchMe(): Promise<MeResponse> {
    const user = await apiClient.get<MeResponse>('/users/me');
    this.updateState({ user });
    if (this.state.user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    return user;
  }

  private setAuth(
    accessToken: string,
    refreshToken: string,
    user: MeResponse
  ) {
    apiClient.setTokens(accessToken, refreshToken);
    this.saveToStorage(accessToken, refreshToken, user);
    this.updateState({
      accessToken,
      refreshToken,
      user,
      isAuthenticated: true,
    });
  }

  private clearAuth() {
    apiClient.setTokens(null, null);
    this.clearStorage();
    this.updateState({
      accessToken: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
    });
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated && !!this.state.accessToken;
  }

  getUser(): MeResponse | null {
    return this.state.user;
  }

  getRefreshToken(): string | null {
    return this.state.refreshToken;
  }

  // Expose private methods for legacy compatibility
  setAuthPublic(accessToken: string, refreshToken: string, user: MeResponse) {
    this.setAuth(accessToken, refreshToken, user);
  }

  clearAuthPublic() {
    this.clearAuth();
  }
}

export const authService = new AuthService();

// Legacy compatibility exports
export const authStorage = {
  getAccessToken: (): string | null => {
    return authService.getState().accessToken;
  },
  getRefreshToken: (): string | null => {
    return authService.getState().refreshToken;
  },
  setTokens: (accessToken: string, refreshToken: string): void => {
    const user = authService.getUser();
    if (user) {
      authService.setAuthPublic(accessToken, refreshToken, user);
    }
  },
  clearTokens: (): void => {
    authService.clearAuthPublic();
  },
  hasTokens: (): boolean => {
    return authService.isAuthenticated();
  },
};

export const isAuthenticated = (): boolean => authService.isAuthenticated();

/**
 * Sync tokens from auth state to apiClient. Call on app init and when auth state changes
 * so the API client always has the latest tokens before requests.
 */
export function syncTokensToApiClient(): void {
  const { accessToken, refreshToken } = authService.getState();
  apiClient.setTokens(accessToken, refreshToken);
}
