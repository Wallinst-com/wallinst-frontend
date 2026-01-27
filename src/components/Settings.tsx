import { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Building2, 
  Globe, 
  Bell, 
  Shield, 
  Key, 
  CreditCard,
  Zap,
  Instagram,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useUser, useInstagramConnection, useFacebookConnection } from '../lib/hooks';
import { api } from '../lib/api';
import { handleApiError } from '../lib/error-handler';

interface SettingsProps {
  onClose: () => void;
  connectionStatus: {
    instagram: 'connected' | 'disconnected' | 'syncing';
    facebook: 'connected' | 'disconnected' | 'syncing';
  };
  onInstagramConnect: () => void;
  onInstagramDisconnect: () => void;
  onFacebookConnect: () => void;
  onFacebookDisconnect: () => void;
}

type SettingsTab = 'account' | 'notifications' | 'integrations' | 'security' | 'billing';

export function Settings({
  onClose,
  connectionStatus,
  onInstagramConnect,
  onInstagramDisconnect,
  onFacebookConnect,
  onFacebookDisconnect,
}: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load user data from API
  const { user: currentUser, isLoading: userLoading, updateUser } = useUser();
  const { data: instagramConnection, isLoading: instagramLoading } = useInstagramConnection();
  const { data: facebookConnection, isLoading: facebookLoading } = useFacebookConnection();

  // Account Settings State - initialized from API
  const [accountData, setAccountData] = useState({
    fullName: '',
    email: '',
    company: '',
    website: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [initialAccountData, setInitialAccountData] = useState({
    fullName: '',
    email: '',
    company: '',
    website: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  // Load user data when component mounts
  useEffect(() => {
    if (currentUser) {
      const next = {
        fullName: currentUser.fullName || '',
        email: currentUser.email || '',
        company: currentUser.company || '',
        website: currentUser.website || '',
        timezone: currentUser.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
      setAccountData(next);
      setInitialAccountData(next);
    }
  }, [currentUser]);

  // Notification Settings State - load from API
  const [notifications, setNotifications] = useState({
    emailHighIntent: true,
    emailDailySummary: true,
    emailWeeklyReport: false,
    pushHighIntent: true,
    pushNewEngager: false,
    pushConnectionIssues: true,
  });
  const [initialNotifications, setInitialNotifications] = useState({
    emailHighIntent: true,
    emailDailySummary: true,
    emailWeeklyReport: false,
    pushHighIntent: true,
    pushNewEngager: false,
    pushConnectionIssues: true,
  });

  // Load notification settings from API
  useEffect(() => {
    const loadNotificationSettings = async () => {
      try {
        const settings = await api.getNotificationSettings();
        setNotifications({
          emailHighIntent: settings.emailHighIntent,
          emailDailySummary: settings.emailDailySummary,
          emailWeeklyReport: settings.emailWeeklyReport,
          pushHighIntent: settings.pushHighIntent,
          pushNewEngager: settings.pushNewEngager,
          pushConnectionIssues: settings.pushConnectionIssues,
        });
        setInitialNotifications({
          emailHighIntent: settings.emailHighIntent,
          emailDailySummary: settings.emailDailySummary,
          emailWeeklyReport: settings.emailWeeklyReport,
          pushHighIntent: settings.pushHighIntent,
          pushNewEngager: settings.pushNewEngager,
          pushConnectionIssues: settings.pushConnectionIssues,
        });
      } catch (err) {
        // Use defaults if API fails
        console.error('Failed to load notification settings:', err);
      }
    };
    loadNotificationSettings();
  }, []);

  // Format last sync time
  const formatLastSync = (lastSyncAt: string | null) => {
    if (!lastSyncAt) return null;
    try {
      const date = new Date(lastSyncAt);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } catch {
      return null;
    }
  };

  const handleSaveAccount = async () => {
    setIsSaving(true);
    setError(null);
    setValidationError(null);
    try {
      if (accountData.website) {
        try {
          const url = new URL(accountData.website);
          if (!['http:', 'https:'].includes(url.protocol)) {
            setValidationError('Website must start with http:// or https://');
            return;
          }
        } catch {
          setValidationError('Please enter a valid website URL');
          return;
        }
      }
      await updateUser({
        fullName: accountData.fullName || null,
        company: accountData.company || null,
        website: accountData.website || null,
        timezone: accountData.timezone || null,
      });
      setInitialAccountData(accountData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await api.updateNotificationSettings(notifications);
      setInitialNotifications(notifications);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      const errorInfo = handleApiError(err);
      setError(errorInfo.userMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'integrations', label: 'Integrations', icon: Zap },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard },
  ] as const;

  const accountChanged = JSON.stringify(accountData) !== JSON.stringify(initialAccountData);
  const notificationsChanged = JSON.stringify(notifications) !== JSON.stringify(initialNotifications);

  if (userLoading) {
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose}></div>
        <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 flex items-center justify-center">
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Settings Panel */}
      <div className="fixed inset-4 md:inset-8 lg:inset-16 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b-2 border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
            <p className="text-sm text-gray-600 mt-1">Manage your account and preferences</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-64 border-r-2 border-gray-200 bg-gray-50 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-semibold text-sm ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-8">
            {/* Success Message */}
            {saved && (
              <div className="mb-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-3 animate-in slide-in-from-top duration-300">
                <CheckCircle2 className="text-green-600" size={20} />
                <p className="text-sm text-green-700 font-semibold">Settings saved successfully!</p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-red-600" size={20} />
                <p className="text-sm text-red-700 font-semibold">{error}</p>
              </div>
            )}
            {validationError && (
              <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="text-yellow-600" size={20} />
                <p className="text-sm text-yellow-800 font-semibold">{validationError}</p>
              </div>
            )}

            {/* Account Tab */}
            {activeTab === 'account' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Account Information</h3>
                  <p className="text-gray-600 mb-6">Update your personal and company details</p>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={accountData.fullName}
                        onChange={(e) => setAccountData({ ...accountData, fullName: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        value={accountData.email}
                        disabled
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-600 font-medium cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        value={accountData.company}
                        onChange={(e) => setAccountData({ ...accountData, company: e.target.value })}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="url"
                        value={accountData.website}
                        onChange={(e) => {
                          setAccountData({ ...accountData, website: e.target.value });
                          if (validationError) setValidationError(null);
                        }}
                        className="w-full pl-11 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Include http:// or https://</p>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Timezone
                    </label>
                    <select
                      value={accountData.timezone}
                      onChange={(e) => setAccountData({ ...accountData, timezone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 font-medium"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Jerusalem">Jerusalem (IST)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveAccount}
                    disabled={isSaving || !accountChanged}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save size={20} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={() => {
                      setAccountData(initialAccountData);
                      setValidationError(null);
                    }}
                    disabled={isSaving || !accountChanged}
                    className="px-5 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Discard Changes
                  </button>
                  {!accountChanged && <span className="text-sm text-gray-500">No changes to save</span>}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Notification Preferences</h3>
                  <p className="text-gray-600 mb-6">Choose how you want to be notified</p>
                </div>

                {/* Email Notifications */}
                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Mail size={20} className="text-indigo-600" />
                    Email Notifications
                  </h4>
                  <div className="space-y-4">
                    <ToggleSetting
                      label="High-Intent User Alerts"
                      description="Get notified when AI identifies a high-intent user"
                      checked={notifications.emailHighIntent}
                      onChange={(checked) => setNotifications({ ...notifications, emailHighIntent: checked })}
                    />
                    <ToggleSetting
                      label="Daily Summary"
                      description="Receive a daily digest of engagement metrics"
                      checked={notifications.emailDailySummary}
                      onChange={(checked) => setNotifications({ ...notifications, emailDailySummary: checked })}
                    />
                    <ToggleSetting
                      label="Weekly Report"
                      description="Comprehensive weekly analytics report"
                      checked={notifications.emailWeeklyReport}
                      onChange={(checked) => setNotifications({ ...notifications, emailWeeklyReport: checked })}
                    />
                  </div>
                </div>

                {/* Push Notifications */}
                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell size={20} className="text-indigo-600" />
                    Push Notifications
                  </h4>
                  <div className="space-y-4">
                    <ToggleSetting
                      label="High-Intent Users"
                      description="Real-time alerts for qualified leads"
                      checked={notifications.pushHighIntent}
                      onChange={(checked) => setNotifications({ ...notifications, pushHighIntent: checked })}
                    />
                    <ToggleSetting
                      label="New Engagers"
                      description="Notify when new users engage with content"
                      checked={notifications.pushNewEngager}
                      onChange={(checked) => setNotifications({ ...notifications, pushNewEngager: checked })}
                    />
                    <ToggleSetting
                      label="Connection Issues"
                      description="Alert when Instagram connection needs attention"
                      checked={notifications.pushConnectionIssues}
                      onChange={(checked) => setNotifications({ ...notifications, pushConnectionIssues: checked })}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveNotifications}
                    disabled={isSaving || !notificationsChanged}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save size={20} />
                    {isSaving ? 'Saving...' : 'Save Preferences'}
                  </button>
                  <button
                    onClick={() => setNotifications(initialNotifications)}
                    disabled={isSaving || !notificationsChanged}
                    className="px-5 py-3 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Discard Changes
                  </button>
                  {!notificationsChanged && <span className="text-sm text-gray-500">No changes to save</span>}
                </div>
              </div>
            )}

            {/* Integrations Tab - Only Instagram */}
            {activeTab === 'integrations' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Connected Integrations</h3>
                  <p className="text-gray-600 mb-6">Manage your Instagram connection</p>
                </div>

                <IntegrationCard
                  name="Instagram"
                  description="Connect your Instagram account via Graph API"
                  icon={Instagram}
                  connected={connectionStatus.instagram === 'connected'}
                  syncing={connectionStatus.instagram === 'syncing'}
                  account={instagramConnection && instagramConnection.instagramUsername ? `@${instagramConnection.instagramUsername}` : null}
                  lastSync={instagramConnection ? formatLastSync(instagramConnection.lastSyncAt || null) : null}
                  loading={instagramLoading}
                  iconColor="text-pink-600"
                  bgColor="from-pink-500 to-purple-500"
                  onConnect={onInstagramConnect}
                  onDisconnect={onInstagramDisconnect}
                />

                <IntegrationCard
                  name="Facebook Page"
                  description="Connect a Facebook Page to analyze comments and leads"
                  icon={Globe}
                  connected={connectionStatus.facebook === 'connected'}
                  syncing={connectionStatus.facebook === 'syncing'}
                  account={facebookConnection && facebookConnection.facebookPageName ? facebookConnection.facebookPageName : null}
                  lastSync={facebookConnection ? formatLastSync(facebookConnection.lastSyncAt || null) : null}
                  loading={facebookLoading}
                  iconColor="text-blue-600"
                  bgColor="from-blue-600 to-indigo-600"
                  onConnect={onFacebookConnect}
                  onDisconnect={onFacebookDisconnect}
                  connectLabel="Connect Facebook"
                />
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Security Settings</h3>
                  <p className="text-gray-600 mb-6">Keep your account secure</p>
                </div>

                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Key size={20} className="text-indigo-600" />
                    Password
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">Change your account password</p>
                  <button className="px-6 py-3 bg-white border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                    Change Password
                  </button>
                </div>

                <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield size={20} className="text-indigo-600" />
                    Two-Factor Authentication
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">Add an extra layer of security to your account</p>
                  <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-bold hover:shadow-lg transition-all">
                    Enable 2FA
                  </button>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Billing & Subscription</h3>
                  <p className="text-gray-600 mb-6">Manage your payment and plan</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border-2 border-indigo-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Current Plan</h4>
                    <span className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm font-bold">
                      {currentUser?.planType || 'Free'}
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {currentUser?.planType === 'free' ? 'Free Plan' : currentUser?.planType || 'Free Plan'}
                  </p>
                  {currentUser?.planExpiresAt && (
                    <p className="text-sm text-gray-600 mb-4">
                      Expires: {new Date(currentUser.planExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Helper Components
interface ToggleSettingProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function ToggleSetting({ label, description, checked, onChange }: ToggleSettingProps) {
  return (
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        role="switch"
        aria-checked={checked}
        className={`relative w-12 h-6 rounded-full transition-colors ${
          checked ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-300'
        } focus:outline-none focus:ring-2 focus:ring-indigo-500`}
      >
        <div
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-0'
          }`}
        ></div>
      </button>
    </div>
  );
}

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: React.ComponentType<{ size: number; className?: string }>;
  connected: boolean;
  syncing: boolean;
  loading?: boolean;
  account: string | null;
  lastSync: string | null;
  iconColor: string;
  bgColor: string;
  onConnect: () => void;
  onDisconnect: () => void;
  connectLabel?: string;
  disconnectLabel?: string;
}

function IntegrationCard({ 
  name, 
  description, 
  icon: Icon, 
  connected, 
  syncing,
  loading = false,
  account, 
  lastSync,
  iconColor,
  bgColor,
  onConnect,
  onDisconnect,
  connectLabel = 'Connect',
  disconnectLabel = 'Disconnect'
}: IntegrationCardProps) {
  const statusText = syncing ? 'Syncing' : connected ? 'Connected' : 'Disconnected';
  const statusColor = syncing ? 'bg-yellow-100 text-yellow-700' : connected ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700';
  const lastSyncLabel = lastSync || (connected ? 'Never' : null);

  return (
    <div className="bg-gray-50 rounded-xl border-2 border-gray-200 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4">
          <div className={`w-12 h-12 bg-gradient-to-br ${bgColor} rounded-xl flex items-center justify-center`}>
            <Icon className="text-white" size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-bold text-gray-900">{name}</h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>
                {statusText}
              </span>
            </div>
            <p className="text-sm text-gray-600">{description}</p>
            {loading && <p className="text-xs text-gray-500 mt-1">Loading connection status…</p>}
            {connected && account && (
              <div className="mt-2 space-y-1">
                <p className="text-sm font-semibold text-gray-700">Connected: {account}</p>
                {lastSyncLabel && <p className="text-xs text-gray-500">Last sync: {lastSyncLabel}</p>}
              </div>
            )}
            {syncing && (
              <div className="mt-2">
                <p className="text-sm font-semibold text-yellow-700">Syncing...</p>
              </div>
            )}
          </div>
        </div>
        {connected ? (
          <button 
            onClick={onDisconnect}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold text-sm hover:bg-red-200 transition-all border border-red-300"
          >
            {disconnectLabel}
          </button>
        ) : (
          <button 
            onClick={onConnect}
            disabled={syncing || loading}
            className={`px-4 py-2 bg-gradient-to-r ${bgColor} text-white rounded-lg font-semibold text-sm hover:shadow-lg transition-all ${syncing ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {syncing ? 'Connecting...' : loading ? 'Loading…' : connectLabel}
          </button>
        )}
      </div>
    </div>
  );
}
