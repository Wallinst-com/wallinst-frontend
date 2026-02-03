// src/components/Dashboard.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Settings as SettingsIcon,
  ChevronDown,
  Home,
  Users,
  Target,
  MessageSquare,
  BarChart3,
  TrendingUp,
  Activity,
  AlertCircle,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { KPICard } from './KPICard';
import { EngagersTable, Engager as TableEngager } from './EngagersTable';
import { UserDetailDrawer } from './UserDetailDrawer';
import { Settings as SettingsPanel } from './Settings';

import api from '../lib/api';
import {
  useEngagers,
  useInstagramConnection,
  useInstagramAuthUrl,
  useDisconnectInstagram,
  useFacebookConnection,
  useFacebookAuthUrl,
  useDisconnectFacebook,
  useDashboardKPIs,
  useEngagementTrend,
  useIntentDistribution,
  usePersonaBreakdown,
  useCurrentUser,
  useLogout,
} from '../lib/hooks';

// Your mappers (you said you’ll add them to align FE/BE)
import { mapBackendEngagerToTable, mapBackendDetailToDrawer, type EngagerDetail } from '../lib/mappers/engager-detail-mapper';
import { mapDashboardKpisToCards, mapTrendToLine, mapIntentToBars, mapPersonaToPie } from '../lib/mappers/dashboard-mapper';
import { toast } from 'sonner';

interface DashboardProps {
  onSignOut: () => void;
}

// small util for charts
function formatShortDate(d: string | Date) {
  try {
    const dt = typeof d === 'string' ? new Date(d) : d;
    return dt.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
  } catch {
    return String(d);
  }
}

function computePercentChange(series: number[]): number | null {
  if (!Array.isArray(series) || series.length < 2) return null;
  const first = series[0];
  const last = series[series.length - 1];
  if (!Number.isFinite(first) || !Number.isFinite(last)) return null;
  if (first === 0) return last === 0 ? 0 : null;
  return Math.round(((last - first) / Math.abs(first)) * 100);
}

export function Dashboard({ onSignOut }: DashboardProps) {
  const navigate = useNavigate();
  const [dateRange] = useState('Last 30 days');
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>(() => {
    const saved = window.localStorage.getItem('wallinst-platform');
    return saved === 'facebook' ? 'facebook' : 'instagram';
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const [selectedEngager, setSelectedEngager] = useState<EngagerDetail | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const emptyDashboardData = {
    kpiCards: {
      totalEngagers: { value: '0' },
      highIntentPct: { value: '0%' },
      leads: { value: '0' },
      dms: { value: '0' },
      avgScore: { value: '0' },
      confidence: { value: '0%' },
    },
    kpiChanges: {
      totalEngagers: null,
      highIntentPct: null,
      leads: null,
      dms: null,
      avgScore: null,
      confidence: null,
    },
    engagementQualityData: [],
    intentDistributionData: [],
    personaBreakdownData: [],
    displayEngagers: [],
  };

  const lastGoodDataRef = useRef<{
    instagram: typeof emptyDashboardData;
    facebook: typeof emptyDashboardData;
  }>({
    instagram: emptyDashboardData,
    facebook: emptyDashboardData,
  });

  // ---- Auth/user
  const { data: me } = useCurrentUser();
  const logoutMutation = useLogout();

  // ---- Instagram
  // Note: 404 errors are handled gracefully - null means no connection exists
  const { data: instagramConnection, isLoading: instagramLoading, refetch: refetchInstagramConnection } = useInstagramConnection();
  const authUrlQuery = useInstagramAuthUrl({ enabled: false });
  const disconnectMutation = useDisconnectInstagram();

  // ---- Facebook
  const { data: facebookConnection, isLoading: facebookLoading, refetch: refetchFacebookConnection } = useFacebookConnection();
  const fbAuthUrlQuery = useFacebookAuthUrl({ enabled: false });
  const fbDisconnectMutation = useDisconnectFacebook();

  // Refetch Instagram connection on mount to ensure we have latest status after redirect
  useEffect(() => {
    // If redirected back from backend OAuth callback, translate query params into existing "just connected" behavior.
    try {
      const params = new URLSearchParams(window.location.search);
      const connected = params.get('connected');
      const status = params.get('status');
      if ((connected === 'instagram' || connected === 'facebook') && status === 'success') {
        window.localStorage.setItem('wallinst-just-connected', connected);
        window.localStorage.setItem('wallinst-platform', connected);
        setPlatform(connected);
        // Remove non-sensitive params from URL (prevents repeat on refresh)
        window.history.replaceState({}, '', window.location.pathname);
      }
    } catch {
      // ignore
    }

    // Refetch immediately on mount
    refetchInstagramConnection();
    refetchFacebookConnection();
    
    // Also refetch after a short delay to catch any async updates from redirect
    const timer = setTimeout(() => {
      refetchInstagramConnection();
      refetchFacebookConnection();
    }, 500);
    return () => clearTimeout(timer);
  }, [refetchInstagramConnection, refetchFacebookConnection]);

  // Check if Instagram is connected - only load data if connected
  const isInstagramConnected = instagramConnection && instagramConnection.status === 'connected';
  const isFacebookConnected = facebookConnection && facebookConnection.status === 'connected';
  const isPlatformConnected = platform === 'facebook' ? isFacebookConnected : isInstagramConnected;

  // ---- Data: Engagers + Dashboard (backend-native)
  // Only load data if Instagram is connected
  const {
    data: apiEngagers,
    isLoading: engagersLoading,
    refetch: refetchEngagers,
  } = useEngagers(
    {
      page: 1,
      limit: 200,
      platform,
    },
    { enabled: isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) }
  );

  const {
    data: kpisData,
    isLoading: kpisLoading,
    refetch: refetchKpis,
  } = useDashboardKPIs(
    { platform },
    { enabled: isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) }
  );
  const { data: trendData, refetch: refetchTrend } = useEngagementTrend(
    { dateRange: '30d', granularity: 'day', platform },
    { enabled: isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) }
  );
  const { data: intentData, refetch: refetchIntent } = useIntentDistribution(
    { platform },
    { enabled: isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) }
  );
  const { data: personaData, refetch: refetchPersona } = usePersonaBreakdown(
    { platform },
    { enabled: isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) }
  );

  const instagramStatus: 'connected' | 'disconnected' | 'syncing' =
    isRefreshing ? 'syncing' : isInstagramConnected ? 'connected' : 'disconnected';
  const facebookStatus: 'connected' | 'disconnected' | 'syncing' =
    isRefreshing ? 'syncing' : isFacebookConnected ? 'connected' : 'disconnected';

  const connectionStatus: 'connected' | 'disconnected' | 'syncing' =
    platform === 'facebook' ? facebookStatus : instagramStatus;

  const handleSignOut = async () => {
    try {
      await logoutMutation.mutateAsync();
    } finally {
      onSignOut();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-500';
      case 'disconnected':
        return 'bg-red-500';
      case 'syncing':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'syncing':
        return 'Syncing...';
      default:
        return 'Unknown';
    }
  };

  // ---- Map backend → UI
  const { kpiCards, kpiChanges, engagementQualityData, intentDistributionData, personaBreakdownData, displayEngagers } =
    useMemo(() => {
      if (!isPlatformConnected) {
        return lastGoodDataRef.current[platform];
      }

      const kpiCards = mapDashboardKpisToCards(kpisData);

      const engagementQualityRaw = mapTrendToLine(trendData) ?? [];
      const engagementQualityData =
        engagementQualityRaw.map((p: any) => ({
          ...p,
          date: formatShortDate(p.date),
        })) ?? [];

      const trendRows = Array.isArray(trendData?.data) ? trendData.data : [];
      const totalEngagersSeries = trendRows.map((p: any) => {
        const high = Number(p?.high ?? 0);
        const med = Number(p?.medium ?? 0);
        const low = Number(p?.low ?? 0);
        return high + med + low;
      });
      const highIntentPctSeries = trendRows.map((p: any) => {
        const high = Number(p?.high ?? 0);
        const med = Number(p?.medium ?? 0);
        const low = Number(p?.low ?? 0);
        const total = high + med + low;
        return total > 0 ? (high / total) * 100 : 0;
      });
      const avgScoreSeries = engagementQualityRaw.map((p: any) => Number(p?.score ?? 0));

      const kpiCardsWithSpark = {
        ...kpiCards,
        totalEngagers: { ...kpiCards.totalEngagers, spark: totalEngagersSeries },
        highIntentPct: { ...kpiCards.highIntentPct, spark: highIntentPctSeries },
        avgScore: { ...kpiCards.avgScore, spark: avgScoreSeries },
      };

      const kpiChanges = {
        totalEngagers: computePercentChange(totalEngagersSeries),
        highIntentPct: computePercentChange(highIntentPctSeries),
        leads: null,
        dms: null,
        avgScore: computePercentChange(avgScoreSeries),
        confidence: null,
      };

      const intentDistributionData = mapIntentToBars(intentData) ?? [];
      const personaBreakdownData = mapPersonaToPie(personaData) ?? [];

      const engagers = (apiEngagers ?? []) as any[];
      const displayEngagers = engagers.map(mapBackendEngagerToTable);

      const mapped = { kpiCards: kpiCardsWithSpark, kpiChanges, engagementQualityData, intentDistributionData, personaBreakdownData, displayEngagers };
      lastGoodDataRef.current[platform] = mapped;
      return mapped;
    }, [apiEngagers, kpisData, trendData, intentData, personaData, isPlatformConnected, platform]);

  // ---- Engager selection (row → drawer fallback → fetch detail)
  const handleSelectUser = async (row: TableEngager) => {
    try {
      // optimistic / instant drawer based on row
      const optimisticData = mapBackendDetailToDrawer(
        {
          username: row.username,
          aiIntentScore: row.score,
          aiIntentLabel: row.intent,
          aiPersona: row.persona,
        },
        row
      );
      
      // Ensure we have at least basic data before opening drawer
      if (!optimisticData || !optimisticData.username) {
        console.error('Invalid engager data', row);
        toast.error('Invalid engager data. Please try again.');
        return;
      }
      
      setSelectedEngager(optimisticData);

      // real backend fetch
      try {
        const detail = await api.getEngager(String(row.id), platform);
        const fullData = mapBackendDetailToDrawer(detail, row);
        if (fullData && fullData.username) {
          setSelectedEngager(fullData);
        }
      } catch (fetchError: any) {
        console.error('Failed to fetch full engager details', fetchError);
        // Keep the optimistic drawer open, but show a warning
        toast.warning('Showing limited data. Full details could not be loaded.');
      }
    } catch (e: any) {
      console.error('Failed to load engager details', e);
      toast.error('Failed to load user details. Please try again.');
      setSelectedEngager(null); // Ensure drawer is closed on error
    }
  };

  // ---- Instagram connect/disconnect/sync
  const handleInstagramConnect = async () => {
    try {
      const r = await authUrlQuery.refetch();
  
      // r = { data?: {authUrl,state} , error?: unknown }
      const authUrl = (r.data as any)?.authUrl;
  
      if (!authUrl) {
        const msg =
          (r as any)?.error?.message ||
          'Failed to get Instagram auth URL. Please try again.';
        console.error('getInstagramAuthUrl failed:', r.error);
        toast.error(msg);
        return;
      }
  
      window.location.href = authUrl;
    } catch (e: any) {
      console.error('Instagram connect error:', e);
      toast.error(e?.message || 'Failed to start Instagram connection');
    }
  };


  const handleInstagramDisconnect = async () => {
    await disconnectMutation.mutateAsync();
  };

  const handleFacebookDisconnect = async () => {
    await fbDisconnectMutation.mutateAsync();
  };

  const handleFacebookConnect = async () => {
    try {
      const r = await fbAuthUrlQuery.refetch();
      const authUrl = (r.data as any)?.authUrl;
      if (!authUrl) {
        const msg = (r as any)?.error?.message || 'Failed to get Facebook auth URL. Please try again.';
        console.error('getFacebookAuthUrl failed:', r.error);
        toast.error(msg);
        return;
      }
      window.location.href = authUrl;
    } catch (e: any) {
      console.error('Facebook connect error:', e);
      toast.error(e?.message || 'Failed to start Facebook connection');
    }
  };

  const handleSyncNow = async () => {
    try {
      setIsRefreshing(true);
      await api.refreshDashboard({ platform });
      await Promise.all([
        refetchEngagers(),
        refetchKpis(),
        refetchTrend(),
        refetchIntent(),
        refetchPersona(),
      ]);
      setLastRefreshedAt(new Date());
      toast.success('Dashboard refreshed');
    } catch (error: any) {
      console.error('Sync failed:', error);
      toast.error(error?.message || 'Failed to start sync. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  };

  const refreshQueries = async () => {
    await Promise.all([
      refetchEngagers(),
      refetchKpis(),
      refetchTrend(),
      refetchIntent(),
      refetchPersona(),
    ]);
    setLastRefreshedAt(new Date());
  };

  useEffect(() => {
    const justConnected = window.localStorage.getItem('wallinst-just-connected');
    if (!justConnected) return;
    if (!isPlatformConnected) return;
    if (justConnected !== platform) return;
    window.localStorage.removeItem('wallinst-just-connected');
    void refreshQueries();
  }, [isPlatformConnected, platform]);

  useEffect(() => {
    if (!isPlatformConnected) return;
    if (isRefreshing) return;
    const intervalMs = 60000;
    const id = window.setInterval(() => {
      if (!document.hidden) {
        void refreshQueries();
      }
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [isPlatformConnected, isRefreshing, platform]);

  const initials =
    (me?.fullName || me?.email || 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((s: string) => s[0]?.toUpperCase())
      .join('') || 'U';

  const loadingAny = (engagersLoading || kpisLoading || (platform === 'facebook' ? facebookLoading : instagramLoading)) && isPlatformConnected;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <header className="bg-white border-b-2 border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onSignOut} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Home className="text-white" size={20} />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Wallinst
                </h1>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg">
                <Calendar size={18} className="text-gray-600" />
                <span className="text-sm font-semibold text-gray-700">{dateRange}</span>
                <ChevronDown size={16} className="text-gray-600" />
              </div>

              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg border border-gray-300">
                <div
                  className={`w-2 h-2 rounded-full ${getStatusColor(connectionStatus)} ${
                    connectionStatus === 'syncing' ? 'animate-pulse' : ''
                  }`}
                />
                <span className="text-sm font-semibold text-gray-700">{getStatusText(connectionStatus)}</span>
              </div>

              {/* Sent DMs Button */}
              <button
                onClick={() => navigate('/sent-dms')}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                title={platform === 'facebook' ? 'View Sent Replies' : 'View Sent DMs'}
              >
                <MessageSquare size={18} className="text-indigo-600" />
                <span className="hidden sm:inline text-sm font-semibold text-indigo-700">
                  {platform === 'facebook' ? 'Sent Replies' : 'Sent DMs'}
                </span>
              </button>

              <button onClick={() => setShowSettings(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <SettingsIcon size={20} className="text-gray-600" />
              </button>

              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                {initials}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Show message if Instagram is not connected */}
          {!isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={24} />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">
                    {platform === 'facebook' ? 'Facebook Page Not Connected' : 'Instagram Not Connected'}
                  </h3>
                  <p className="text-yellow-800 mb-4">
                    {platform === 'facebook'
                      ? 'Connect your Facebook Page to start analyzing engagement and viewing dashboard data.'
                      : 'Connect your Instagram account to start analyzing engagement and viewing dashboard data.'}
                  </p>
                  <button
                    onClick={platform === 'facebook' ? handleFacebookConnect : handleInstagramConnect}
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all"
                  >
                    {platform === 'facebook' ? 'Connect Facebook' : 'Connect Instagram'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">KPI Overview</h2>

            <div className="mb-4 flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-gray-300 bg-white overflow-hidden">
                <button
                  onClick={() => {
                    setPlatform('instagram');
                    window.localStorage.setItem('wallinst-platform', 'instagram');
                  }}
                  className={`px-4 py-2 text-sm font-semibold ${
                    platform === 'instagram'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Instagram
                </button>
                <button
                  onClick={() => {
                    setPlatform('facebook');
                    window.localStorage.setItem('wallinst-platform', 'facebook');
                  }}
                  className={`px-4 py-2 text-sm font-semibold ${
                    platform === 'facebook'
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Facebook
                </button>
              </div>
              <span className="text-sm text-gray-500">Switch analytics source</span>
            </div>

            <div className="relative">
              <div className={`${!isPlatformConnected ? 'blur-sm pointer-events-none select-none' : ''}`}>
                {loadingAny && isPlatformConnected ? (
                  <div className="text-gray-600">Loading…</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <KPICard
                      title="Total Engagers Analyzed"
                      value={kpiCards.totalEngagers.value}
                      change={kpiChanges.totalEngagers}
                      icon={Users}
                      sparklineData={kpiCards.totalEngagers.spark}
                    />
                    <KPICard
                      title="High-Intent Users"
                      value={kpiCards.highIntentPct.value}
                      change={kpiChanges.highIntentPct}
                      icon={Target}
                      sparklineData={kpiCards.highIntentPct.spark}
                    />
                    <KPICard
                      title="Leads Generated"
                      value={kpiCards.leads.value}
                      change={kpiChanges.leads}
                      icon={TrendingUp}
                      sparklineData={kpiCards.leads.spark}
                    />
                    <KPICard
                      title="DMs Sent"
                      value={kpiCards.dms.value}
                      change={kpiChanges.dms}
                      icon={MessageSquare}
                      sparklineData={kpiCards.dms.spark}
                    />
                    <KPICard
                      title="Average Conversion Score"
                      value={kpiCards.avgScore.value}
                      change={kpiChanges.avgScore}
                      icon={BarChart3}
                      sparklineData={kpiCards.avgScore.spark}
                    />
                    <KPICard
                      title="AI Confidence Score"
                      value={kpiCards.confidence.value}
                      change={kpiChanges.confidence}
                      icon={Activity}
                      sparklineData={kpiCards.confidence.spark}
                    />
                  </div>
                )}
              </div>

              {!isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-300 bg-white/80 backdrop-blur-sm">
                  <p className="text-gray-700 font-semibold mb-3">
                    {platform === 'facebook' ? 'Connect Facebook to unlock analytics' : 'Connect Instagram to unlock analytics'}
                  </p>
                  <button
                    onClick={platform === 'facebook' ? handleFacebookConnect : handleInstagramConnect}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    {platform === 'facebook' ? 'Connect Facebook' : 'Connect Instagram'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h2>

            <div className="relative">
              <div className={`${!isPlatformConnected ? 'blur-sm pointer-events-none select-none' : ''}`}>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                <div className="lg:col-span-2 bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Engagement Quality Over Time</h3>
                  <div className="w-full h-[300px] relative">
                    {engagementQualityData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={engagementQualityData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#d1d5db" />
                          <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#d1d5db" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={{ fill: '#6366f1', r: 4 }}
                            name="Avg AI Score"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 blur-sm pointer-events-none">
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={[{ date: 'No Data', score: 0 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#d1d5db" />
                            <YAxis domain={[0, 100]} tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#d1d5db" />
                            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={3} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {engagementQualityData.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                        <p className="text-gray-500 font-semibold">No data available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Intent Distribution</h3>
                  <div className="w-full h-[300px] relative">
                    {intentDistributionData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={intentDistributionData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: '#6b7280', fontSize: 10 }}
                            stroke="#d1d5db"
                            angle={-15}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#d1d5db" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'white',
                              border: '2px solid #e5e7eb',
                              borderRadius: '8px',
                              fontSize: '12px',
                            }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                            {intentDistributionData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.fill || '#6b7280'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 blur-sm pointer-events-none">
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={[{ name: 'No Data', value: 0 }]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} stroke="#d1d5db" />
                            <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} stroke="#d1d5db" />
                            <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#6b7280" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {intentDistributionData.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                        <p className="text-gray-500 font-semibold">No data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Persona Breakdown</h3>
                  <div className="w-full h-[250px] relative">
                    {personaBreakdownData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={personaBreakdownData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }: any) => `${name} ${value}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {personaBreakdownData.map((entry: any, index: number) => (
                              <Cell key={`cell-${index}`} fill={entry.fill || '#8884d8'} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400 blur-sm pointer-events-none">
                        <ResponsiveContainer width="100%" height={250}>
                          <PieChart>
                            <Pie
                              data={[{ name: 'No Data', value: 100 }]}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            />
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {personaBreakdownData.length === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-lg">
                        <p className="text-gray-500 font-semibold">No data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              </div>

              {!isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-300 bg-white/80 backdrop-blur-sm">
                  <p className="text-gray-700 font-semibold mb-3">
                    {platform === 'facebook' ? 'Connect Facebook to unlock analytics' : 'Connect Instagram to unlock analytics'}
                  </p>
                  <button
                    onClick={platform === 'facebook' ? handleFacebookConnect : handleInstagramConnect}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    {platform === 'facebook' ? 'Connect Facebook' : 'Connect Instagram'}
                  </button>
                </div>
              )}
            </div>

              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl border-2 border-indigo-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">How Wallinst Works</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Analyze Engagers</h4>
                      <p className="text-sm text-gray-700">Instagram commenters are synced and scored by AI</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Review High-Quality Leads</h4>
                      <p className="text-sm text-gray-700">Filter by intent label, persona, and activity</p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Take Action</h4>
                      <p className="text-sm text-gray-700">Reply, qualify, and convert faster</p>
                    </div>
                  </div>
                </div>
              </div>
          </div>

          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">High-Quality Engagers</h2>
              <p className="text-gray-600">Review and engage with your most relevant leads.</p>
            </div>

            <div className="relative">
              <div className={`${!isPlatformConnected ? 'blur-sm pointer-events-none select-none' : ''}`}>
                <EngagersTable engagers={displayEngagers} onSelectUser={handleSelectUser} />
              </div>
              {!isPlatformConnected && !(platform === 'facebook' ? facebookLoading : instagramLoading) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-gray-300 bg-white/80 backdrop-blur-sm">
                  <p className="text-gray-700 font-semibold mb-3">
                    {platform === 'facebook' ? 'Connect Facebook to view engagers' : 'Connect Instagram to view engagers'}
                  </p>
                  <button
                    onClick={platform === 'facebook' ? handleFacebookConnect : handleInstagramConnect}
                    className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
                  >
                    {platform === 'facebook' ? 'Connect Facebook' : 'Connect Instagram'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSignOut}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 font-semibold"
            >
              Sign out
            </button>

            {connectionStatus === 'connected' && (
              <div className="flex flex-col items-end gap-1">
                <button
                  onClick={handleSyncNow}
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-semibold"
                  disabled={isRefreshing}
                >
                  {isRefreshing ? 'Refreshing…' : 'Refresh'}
                </button>
                {lastRefreshedAt && (
                  <span className="text-xs text-gray-500">
                    Updated {lastRefreshedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            )}

            {connectionStatus === 'syncing' && isRefreshing && (
              <span className="text-sm text-gray-600">Refreshing dashboard…</span>
            )}
          </div>
        </div>
      </main>

      {selectedEngager && (
        <UserDetailDrawer
          engager={selectedEngager}
          platform={platform}
          onClose={() => setSelectedEngager(null)}
        />
      )}

      {showSettings && (
        <SettingsPanel
          onClose={() => setShowSettings(false)}
          connectionStatus={{ instagram: instagramStatus, facebook: facebookStatus }}
          onInstagramConnect={handleInstagramConnect}
          onInstagramDisconnect={handleInstagramDisconnect}
          onFacebookConnect={handleFacebookConnect}
          onFacebookDisconnect={handleFacebookDisconnect}
        />
      )}
    </div>
  );
}



