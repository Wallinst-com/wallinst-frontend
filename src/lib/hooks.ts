// src/lib/hooks.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import api, { ApiError } from './api';
import { authStorage } from './auth';

type QueryOptions = {
  enabled?: boolean;
  refetchIntervalMs?: number;
};

type QueryResult<T> = {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => Promise<{ data?: T; error?: unknown }>;
};

type MutationResult<TData, TVars> = {
  mutateAsync: (vars?: TVars) => Promise<TData>;
  isPending: boolean;
  isError: boolean;
  error: unknown;
};

function useStableFn<T extends (...args: any[]) => any>(fn: T): T {
  const ref = useRef(fn);
  ref.current = fn;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args: any[]) => ref.current(...args)) as T, []);
}

// Removed getApiBaseUrl - using apiClient baseUrl instead

/**
 * Normalize common backend list payload shapes into an array.
 * Accepts:
 * - Engager[]
 * - { items: Engager[] }
 * - { data: Engager[] }
 * - { data: { items: Engager[] } }
 */
function normalizeList<T>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.items)) return payload.items;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload.data && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

// Removed fetchWithAuth - using apiClient instead

function useQueryLike<T>(key: any[], fn: () => Promise<T>, options?: QueryOptions): QueryResult<T> {
  const enabled = options?.enabled ?? true;

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<unknown>(undefined);

  const fnStable = useStableFn(fn);
  const keyStable = useMemo(() => JSON.stringify(key ?? []), [key]);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(undefined);
    try {
      const res = await fnStable();
      setData(res);
      setIsLoading(false);
      return { data: res as T };
    } catch (e) {
      setError(e);
      setIsLoading(false);
      return { error: e };
    }
  }, [fnStable]);

  useEffect(() => {
    if (!enabled) return;
    void refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, keyStable]);

  useEffect(() => {
    const ms = options?.refetchIntervalMs;
    if (!enabled) return;
    if (!ms || ms <= 0) return;
    const id = window.setInterval(() => void refetch(), ms);
    return () => window.clearInterval(id);
  }, [enabled, options?.refetchIntervalMs, refetch]);

  return {
    data,
    isLoading,
    isError: !!error,
    error,
    refetch,
  };
}

function useMutationLike<TData, TVars>(fn: (vars?: TVars) => Promise<TData>): MutationResult<TData, TVars> {
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<unknown>(undefined);

  const fnStable = useStableFn(fn);

  const mutateAsync = useCallback(
    async (vars?: TVars) => {
      setIsPending(true);
      setError(undefined);
      try {
        const res = await fnStable(vars);
        setIsPending(false);
        return res;
      } catch (e) {
        setError(e);
        setIsPending(false);
        throw e;
      }
    },
    [fnStable]
  );

  return {
    mutateAsync,
    isPending,
    isError: !!error,
    error,
  };
}

// -----------------------------
// Auth / User
// -----------------------------

export function useCurrentUser(options?: QueryOptions) {
  const enabled = options?.enabled ?? !!authStorage.getAccessToken();
  return useQueryLike<any>(['me'], () => api.getCurrentUser(), { ...options, enabled });
}

// User hook with update functionality (for Settings component)
export function useUser() {
  const { data: user, isLoading, error, refetch } = useCurrentUser();
  
  const updateUser = async (data: Partial<any>) => {
    const updated = await api.updateUser(data);
    await refetch();
    return updated;
  };

  return {
    user,
    isLoading,
    error,
    refetch,
    updateUser,
  };
}

export function useLogout() {
  return useMutationLike<void, void>(async () => {
    try {
      await api.logout();
    } finally {
      authStorage.clearTokens();
    }
  });
}

// Re-export useAuth from context (for SignIn component compatibility)
export { useAuth } from '../context/AuthContext';

// -----------------------------
// Engagers (ALWAYS returns array)
// -----------------------------

export function useEngagers(
  params?: {
    page?: number;
    limit?: number;
    intentLabel?: string;
    leadStatus?: string;
    search?: string;
    tags?: string[];
    platform?: 'instagram' | 'facebook';
  },
  options?: QueryOptions
) {
  return useQueryLike<any[]>(
    ['engagers', params ?? {}],
    async () => {
      const res = await api.getEngagers(params);
      // Handle both wrapped response and direct response
      if (res && 'engagers' in res) {
        return res.engagers || [];
      }
      return normalizeList<any>(res);
    },
    options
  );
}

// -----------------------------
// Instagram hooks
// -----------------------------

export function useInstagramConnection(options?: QueryOptions) {
  return useQueryLike<any>(
    ['ig-connection'],
    async () => {
      try {
        return await api.getInstagramConnection();
      } catch (error: any) {
        // 404 means no connection exists - this is not an error, just return null
        // Note: Browser console will still show 404, but this is expected behavior
        // and the UI will handle null gracefully (showing "disconnected" state)
        if (error instanceof ApiError && (error.statusCode === 404 || error.code === 'NOT_FOUND')) {
          return null;
        }
        // Re-throw other errors (network issues, 500, etc.)
        throw error;
      }
    },
    options
  );
}

export function useFacebookConnection(options?: QueryOptions) {
  return useQueryLike<any>(
    ['fb-connection'],
    async () => {
      try {
        return await api.getFacebookConnection();
      } catch (error: any) {
        if (error instanceof ApiError && (error.statusCode === 404 || error.code === 'NOT_FOUND')) {
          return null;
        }
        throw error;
      }
    },
    options
  );
}

export function useInstagramAuthUrl(options?: QueryOptions & { enabled?: boolean }) {
  return useQueryLike<{ authUrl: string }>(
    ['ig-auth-url'],
    () => api.getInstagramAuthUrl(),
    { enabled: options?.enabled ?? true }
  );
}

export function useFacebookAuthUrl(options?: QueryOptions & { enabled?: boolean }) {
  return useQueryLike<{ authUrl: string }>(
    ['fb-auth-url'],
    () => api.getFacebookAuthUrl(),
    { enabled: options?.enabled ?? true }
  );
}

export function useConnectInstagram() {
  return useMutationLike<any, { code: string; state: string }>(async (vars) => {
    if (!vars?.code) throw new Error('Missing code');
    return api.connectInstagram(vars.code, vars.state || '');
  });
}

export function useConnectFacebook() {
  return useMutationLike<any, { code: string; state: string; pageId?: string | null }>(async (vars) => {
    if (!vars?.code) throw new Error('Missing code');
    return api.connectFacebook(vars.code, vars.state || '', vars.pageId || null);
  });
}

export function useDisconnectInstagram() {
  return useMutationLike<void, void>(async () => {
    await api.disconnectInstagram();
  });
}

export function useDisconnectFacebook() {
  return useMutationLike<void, void>(async () => {
    await api.disconnectFacebook();
  });
}

// -----------------------------
// Dashboard endpoints
// -----------------------------

export function useDashboardKPIs(
  params?: { dateRange?: string; startDate?: string; endDate?: string; platform?: 'instagram' | 'facebook' },
  options?: QueryOptions
) {
  return useQueryLike<any>(
    ['dashboard-kpis', params ?? {}],
    async () => api.getDashboardKPIs(params),
    options
  );
}

export function useEngagementTrend(
  params?: { dateRange?: string; granularity?: string; platform?: 'instagram' | 'facebook' },
  options?: QueryOptions
) {
  return useQueryLike<any>(
    ['dashboard-trend', params ?? {}],
    async () => api.getEngagementTrend(params),
    options
  );
}

export function useIntentDistribution(
  params?: { dateRange?: string; granularity?: string; platform?: 'instagram' | 'facebook' },
  options?: QueryOptions
) {
  return useQueryLike<any>(
    ['dashboard-intent', params ?? {}],
    async () => {
      try {
        return await api.getIntentDistribution(params);
      } catch (e: any) {
        if (e instanceof ApiError && (e.statusCode === 404 || e.code === 'NOT_FOUND')) {
          return { data: [] }; // Return empty data structure
        }
        throw e;
      }
    },
    options
  );
}

export function usePersonaBreakdown(
  params?: { dateRange?: string; granularity?: string; platform?: 'instagram' | 'facebook' },
  options?: QueryOptions
) {
  return useQueryLike<any>(
    ['dashboard-persona', params ?? {}],
    async () => {
      try {
        return await api.getPersonaBreakdown(params);
      } catch (e: any) {
        if (e instanceof ApiError && (e.statusCode === 404 || e.code === 'NOT_FOUND')) {
          return { data: [] }; // Return empty data structure
        }
        throw e;
      }
    },
    options
  );
}

// -----------------------------
// Sent DMs
// -----------------------------
export function useSentDMs(
  params?: { page?: number; limit?: number; platform?: 'instagram' | 'facebook' },
  options?: QueryOptions
) {
  return useQueryLike<any>(
    ['sent-dms', params ?? {}],
    async () => api.getSentDMs(params),
    options
  );
}

// -----------------------------
// Compatibility wrapper used by InstagramCallback.tsx
// -----------------------------
export function useInstagram() {
  const connectionQuery = useInstagramConnection();
  const authUrlQuery = useInstagramAuthUrl({ enabled: false });
  const connectMutation = useConnectInstagram();
  const disconnectMutation = useDisconnectInstagram();

  const connect = useCallback(async () => {
    const r = await authUrlQuery.refetch();
    const authUrl = (r.data as any)?.authUrl;
    return { authUrl };
  }, [authUrlQuery]);

  const completeConnect = useCallback(
    async ({ code, state }: { code: string; state: string }) => {
      const res = await connectMutation.mutateAsync({ code, state });
      await connectionQuery.refetch();
      return res;
    },
    [connectMutation, connectionQuery]
  );

  const disconnect = useCallback(async () => {
    await disconnectMutation.mutateAsync();
    await connectionQuery.refetch();
  }, [disconnectMutation, connectionQuery]);

  return {
    connection: connectionQuery.data,
    isLoading: connectionQuery.isLoading,
    error: connectionQuery.error,

    connect,
    completeConnect,
    disconnect,
  };
}

// -----------------------------
// Facebook compatibility wrapper
// -----------------------------
export function useFacebook() {
  const connectionQuery = useFacebookConnection();
  const authUrlQuery = useFacebookAuthUrl({ enabled: false });
  const connectMutation = useConnectFacebook();
  const disconnectMutation = useDisconnectFacebook();

  const connect = useCallback(async () => {
    const r = await authUrlQuery.refetch();
    const authUrl = (r.data as any)?.authUrl;
    return { authUrl };
  }, [authUrlQuery]);

  const completeConnect = useCallback(
    async ({ code, state, pageId }: { code: string; state: string; pageId?: string | null }) => {
      const res = await connectMutation.mutateAsync({ code, state, pageId });
      await connectionQuery.refetch();
      return res;
    },
    [connectMutation, connectionQuery]
  );

  const disconnect = useCallback(async () => {
    await disconnectMutation.mutateAsync();
    await connectionQuery.refetch();
  }, [disconnectMutation, connectionQuery]);

  return {
    connection: connectionQuery.data,
    isLoading: connectionQuery.isLoading,
    error: connectionQuery.error,

    connect,
    completeConnect,
    disconnect,
  };
}

// -----------------------------
// Admin: Users
// -----------------------------
export function useAdminUsers(options?: QueryOptions) {
  return useQueryLike<any[]>(['admin-users'], () => api.getAdminUsers(), options);
}

export function useAdminCreateUser() {
  return useMutationLike<any, { email: string; password: string; full_name?: string; role?: string }>(
    (vars) => api.adminCreateUser(vars!)
  );
}

export function useAdminDeleteUser() {
  return useMutationLike<void, { id: string }>(async (vars) => {
    await api.adminDeleteUser(vars!.id);
  });
}