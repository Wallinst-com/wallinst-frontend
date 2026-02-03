// src/lib/api.ts
// API wrapper using the new apiClient, maintaining backward compatibility

import { apiClient } from './api-client';
import { authService } from './auth';
import type {
  AuthResponse,
  MeResponse,
  EngagersListResponse,
  EngagerDetailResponse,
  KpisResponse,
  EngagementQualityTrendResponse,
  IntentDistributionResponse,
  PersonaBreakdownResponse,
  TopPostsResponse,
  ActivityFeedResponse,
  InstagramAuthUrlResponse,
  InstagramConnectionResponse,
  FacebookAuthUrlResponse,
  FacebookConnectionResponse,
  Platform,
  EngagerUpdateRequest,
  ReplyRequest,
  BulkUpdateRequest,
  UpdateMeRequest,
  ChangePasswordRequest,
  NotificationsListResponse,
  NotificationSettingsResponse,
  NotificationSettingsUpdateRequest,
} from './types';

// Re-export ApiError for backward compatibility
export { ApiError } from './api-client';

// Helper to build query strings
function buildQueryString(params?: Record<string, any>): string {
  if (!params) return '';
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
}

export const api = {
  // ---------- Health ----------
  health: () => apiClient.get<any>('/health'),

  // ---------- Auth ----------
  login: async (email: string, password: string): Promise<AuthResponse> => {
    // Use authService which handles token storage and user fetching
    return await authService.login({ email, password });
  },

  register: async (data: {
    email: string;
    password: string;
    fullName: string;
    company?: string;
  }): Promise<AuthResponse> => {
    // Use authService which handles token storage
    return await authService.register({
      email: data.email,
      password: data.password,
      fullName: data.fullName || null,
      company: data.company || null,
    });
  },

  logout: async () => {
    await authService.logout();
  },

  refresh: async () => {
    await authService.refresh();
    const state = authService.getState();
    return {
      accessToken: state.accessToken!,
      refreshToken: state.refreshToken!,
    };
  },

  // ---------- Users ----------
  getCurrentUser: async (): Promise<MeResponse> => {
    return await authService.fetchMe();
  },

  updateUser: (data: Partial<UpdateMeRequest>): Promise<MeResponse> => {
    return apiClient.patch<MeResponse>('/users/me', data);
  },

  changePassword: (data: ChangePasswordRequest): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/users/me/change-password', data);
  },

  // ---------- Instagram ----------
  getInstagramAuthUrl: (): Promise<InstagramAuthUrlResponse> => {
    return apiClient.get<InstagramAuthUrlResponse>('/oauth/instagram/start');
  },

  connectInstagram: (code: string, state: string): Promise<InstagramConnectionResponse> => {
    return apiClient.post<InstagramConnectionResponse>('/instagram/connect', { code, state });
  },

  getInstagramConnection: (): Promise<InstagramConnectionResponse> => {
    return apiClient.get<InstagramConnectionResponse>('/instagram/connection');
  },

  disconnectInstagram: (): Promise<void> => {
    return apiClient.delete<void>('/instagram/connection');
  },

  // ---------- Facebook ----------
  getFacebookAuthUrl: (): Promise<FacebookAuthUrlResponse> => {
    return apiClient.get<FacebookAuthUrlResponse>('/oauth/facebook/start');
  },

  connectFacebook: (code: string, state: string, pageId?: string | null): Promise<FacebookConnectionResponse> => {
    return apiClient.post<FacebookConnectionResponse>('/facebook/connect', { code, state, pageId });
  },

  getFacebookConnection: (): Promise<FacebookConnectionResponse> => {
    return apiClient.get<FacebookConnectionResponse>('/facebook/connection');
  },

  disconnectFacebook: (): Promise<void> => {
    return apiClient.delete<void>('/facebook/connection');
  },

  // ---------- Dashboard ----------
  getDashboardKPIs: (params?: {
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    platform?: Platform;
  }): Promise<KpisResponse> => {
    return apiClient.get<KpisResponse>(`/dashboard/kpis${buildQueryString(params)}`);
  },

  getEngagementTrend: (params?: {
    dateRange?: string;
    granularity?: string;
    platform?: Platform;
  }): Promise<EngagementQualityTrendResponse> => {
    return apiClient.get<EngagementQualityTrendResponse>(
      `/dashboard/charts/engagement-trend${buildQueryString(params)}`
    );
  },

  getIntentDistribution: (params?: {
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    platform?: Platform;
  }): Promise<IntentDistributionResponse> => {
    return apiClient.get<IntentDistributionResponse>(
      `/dashboard/charts/intent-distribution${buildQueryString(params)}`
    );
  },

  getPersonaBreakdown: (params?: {
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    platform?: Platform;
  }): Promise<PersonaBreakdownResponse> => {
    return apiClient.get<PersonaBreakdownResponse>(
      `/dashboard/charts/persona-breakdown${buildQueryString(params)}`
    );
  },

  getTopPosts: (params?: {
    limit?: number;
    sortBy?: string;
    dateRange?: string;
    startDate?: string;
    endDate?: string;
    platform?: Platform;
  }): Promise<TopPostsResponse> => {
    return apiClient.get<TopPostsResponse>(`/dashboard/charts/top-posts${buildQueryString(params)}`);
  },

  getActivityFeed: (params?: { limit?: number; offset?: number }): Promise<ActivityFeedResponse> => {
    return apiClient.get<ActivityFeedResponse>(`/dashboard/activity-feed${buildQueryString(params)}`);
  },

  refreshDashboard: (params?: { platform?: Platform }): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>(`/dashboard/refresh${buildQueryString(params)}`);
  },

  // ---------- Engagers ----------
  getEngagers: (params?: {
    page?: number;
    limit?: number;
    intentLabel?: string;
    leadStatus?: string;
    search?: string;
    tags?: string[];
    platform?: Platform;
  }): Promise<EngagersListResponse> => {
    // Filter out undefined sortBy/sortOrder if passed
    const cleanParams = { ...params };
    delete (cleanParams as any).sortBy;
    delete (cleanParams as any).sortOrder;
    return apiClient.get<EngagersListResponse>(`/engagers${buildQueryString(cleanParams)}`);
  },

  getEngager: (id: string, platform?: Platform): Promise<EngagerDetailResponse> => {
    return apiClient.get<EngagerDetailResponse>(`/engagers/${id}${buildQueryString({ platform })}`);
  },

  updateEngager: (id: string, data: Partial<EngagerUpdateRequest>, platform?: Platform): Promise<{ message: string }> => {
    return apiClient.patch<{ message: string }>(`/engagers/${id}${buildQueryString({ platform })}`, data);
  },

  replyToEngager: (
    id: string,
    data: ReplyRequest,
    platform?: Platform
  ): Promise<{ message: string; replyId: string }> => {
    return apiClient.post<{ message: string; replyId: string }>(`/engagers/${id}/reply${buildQueryString({ platform })}`, data);
  },

  bulkUpdateEngagers: (
    data: BulkUpdateRequest,
    platform?: Platform
  ): Promise<{ message: string; updated: number }> => {
    return apiClient.post<{ message: string; updated: number }>(`/engagers/bulk-update${buildQueryString({ platform })}`, data);
  },

  getEngagerInteractions: (id: string, params?: { limit?: number; platform?: Platform }): Promise<any> => {
    return apiClient.get<any>(`/engagers/${id}/interactions${buildQueryString(params)}`);
  },

  getSentDMs: (params?: { page?: number; limit?: number; platform?: Platform }): Promise<any> => {
    return apiClient.get<any>(`/interactions/sent-dms${buildQueryString(params)}`);
  },

  // ---------- Exports ----------
  exportEngagers: (data: {
    format?: 'csv' | 'json' | 'excel';
    filters?: Record<string, any>;
  }): Promise<{ exportId: string; message: string; estimatedTime?: string | null }> => {
    return apiClient.post<{ exportId: string; message: string; estimatedTime?: string | null }>(
      '/exports/export',
      data
    );
  },

  getExportStatus: (exportId: string): Promise<any> => {
    return apiClient.get<any>(`/exports/export/${exportId}`);
  },

  // ---------- Notifications ----------
  getNotifications: (params?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<NotificationsListResponse> => {
    return apiClient.get<NotificationsListResponse>(`/notifications${buildQueryString(params)}`);
  },

  markNotificationRead: (id: string): Promise<{ id: string; isRead: boolean; readAt: string }> => {
    return apiClient.patch<{ id: string; isRead: boolean; readAt: string }>(`/notifications/${id}/read`);
  },

  markAllNotificationsRead: (): Promise<{ message: string; updated: number }> => {
    return apiClient.post<{ message: string; updated: number }>('/notifications/mark-all-read');
  },

  // ---------- Settings ----------
  getNotificationSettings: (): Promise<NotificationSettingsResponse> => {
    return apiClient.get<NotificationSettingsResponse>('/settings/notifications');
  },

  updateNotificationSettings: (data: NotificationSettingsUpdateRequest): Promise<NotificationSettingsResponse> => {
    return apiClient.patch<NotificationSettingsResponse>('/settings/notifications', data);
  },

  // ---------- Admin ----------
  getAdminUsers: (): Promise<any[]> => {
    return apiClient.get<any[]>('/admin/users');
  },

  adminCreateUser: (payload: {
    email: string;
    password: string;
    full_name?: string;
    role?: string;
  }): Promise<any> => {
    return apiClient.post<any>('/admin/users', payload);
  },

  adminDeleteUser: (id: string): Promise<void> => {
    return apiClient.delete<void>(`/admin/users/${id}`);
  },
};

export default api;
