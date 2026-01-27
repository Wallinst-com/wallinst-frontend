/**
 * Complete API Client for Wallinst Frontend
 * Adapted from guidelines for Vite (using import.meta.env instead of process.env)
 */

import type {
  ApiResponse,
  ErrorResponse,
  SuccessResponse,
  ApiErrorCode,
} from './types';

export class ApiError extends Error {
  constructor(
    public code: ApiErrorCode | string,
    public message: string,
    public statusCode: number,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseUrl: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private refreshPromise: Promise<string> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setTokens(accessToken: string | null, refreshToken: string | null) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async refreshAccessToken(): Promise<string> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    if (!this.refreshToken) {
      throw new ApiError(
        ApiErrorCode.AUTHENTICATION_ERROR,
        'No refresh token available',
        401
      );
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-ID': this.generateRequestId(),
          },
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          const error = data as ErrorResponse;
          this.setTokens(null, null);
          throw new ApiError(
            error.error.code as ApiErrorCode,
            error.error.message,
            response.status,
            error.error.details
          );
        }

        const success = data as SuccessResponse<{
          accessToken: string;
          refreshToken: string;
        }>;

        this.setTokens(success.data.accessToken, success.data.refreshToken);
        return success.data.accessToken;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit & { skipAuth?: boolean } = {}
  ): Promise<SuccessResponse<T>> {
    const requestId = this.generateRequestId();
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Request-ID': requestId,
      ...options.headers,
    };

    if (this.accessToken && !options.skipAuth) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${this.accessToken}`;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - try refresh token once
    if (response.status === 401 && this.refreshToken && !options.skipAuth) {
      try {
        const newAccessToken = await this.refreshAccessToken();
        headers['Authorization'] = `Bearer ${newAccessToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (refreshError) {
        // Refresh failed, clear tokens
        this.setTokens(null, null);
        throw refreshError;
      }
    }

    // Handle non-JSON responses (like CORS errors)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      if (response.status === 0 || response.status === 500) {
        throw new ApiError(
          ApiErrorCode.INTERNAL_ERROR,
          'Network error: Unable to connect to the server. Please check if the backend is running and CORS is configured.',
          response.status || 500
        );
      }
      if (response.status === 404) {
        throw new ApiError(
          ApiErrorCode.NOT_FOUND,
          'Resource not found',
          response.status
        );
      }
      throw new ApiError(
        ApiErrorCode.INTERNAL_ERROR,
        `Unexpected response format. Status: ${response.status}`,
        response.status
      );
    }

    const data = await response.json();

    // Handle 404 with JSON response
    if (response.status === 404) {
      const error = data as ErrorResponse;
      throw new ApiError(
        error.error?.code as ApiErrorCode || ApiErrorCode.NOT_FOUND,
        error.error?.message || 'Resource not found',
        response.status,
        error.error?.details
      );
    }

    if (!response.ok) {
      const error = data as ErrorResponse;
      throw new ApiError(
        error.error?.code as ApiErrorCode || ApiErrorCode.INTERNAL_ERROR,
        error.error?.message || 'Request failed',
        response.status,
        error.error?.details
      );
    }

    if (!data.success) {
      const error = data as ErrorResponse;
      throw new ApiError(
        error.error?.code as ApiErrorCode || ApiErrorCode.INTERNAL_ERROR,
        error.error?.message || 'Request failed',
        response.status,
        error.error?.details
      );
    }

    return data as SuccessResponse<T>;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
    return response.data;
  }

  async post<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body !== undefined && body !== null ? JSON.stringify(body) : undefined,
    });
    return response.data;
  }

  async patch<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.data;
  }

  async put<T>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
    return response.data;
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
    return response.data;
  }
}

// Singleton instance - adapted for Vite
const API_BASE_URL = 
  (import.meta.env?.VITE_API_URL?.replace(/\/$/, '') || 'http://localhost:8000') + '/api';

export const apiClient = new ApiClient(API_BASE_URL);
