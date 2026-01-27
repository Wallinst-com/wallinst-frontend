/**
 * Complete TypeScript types for Wallinst Frontend
 */

// ============================================================================
// Response Wrapper Types
// ============================================================================

export interface ApiMeta {
  timestamp: string; // ISO 8601 format
  requestId: string;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta: ApiMeta;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ErrorResponse {
  success: false;
  error: ErrorDetail;
  meta: ApiMeta;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ============================================================================
// Error Codes
// ============================================================================

export enum ApiErrorCode {
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR = 'AUTHORIZATION_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
}

// ============================================================================
// Auth Types
// ============================================================================

export interface RegisterRequest {
  email: string;
  password: string; // min 12, max 128 chars
  fullName?: string | null;
  company?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface UserPublic {
  id: string;
  email: string;
  fullName: string | null;
  company: string | null;
  planType: string | null;
}

export interface AuthResponse {
  user: UserPublic;
  accessToken: string;
  refreshToken: string;
}

// ============================================================================
// User Types
// ============================================================================

export interface MeResponse {
  id: string;
  email: string;
  fullName: string | null;
  role: string;
  company: string | null;
  website: string | null;
  timezone: string;
  avatarUrl: string | null;
  planType: string;
  planExpiresAt: string | null; // ISO datetime
  createdAt: string; // ISO datetime
}

export interface UpdateMeRequest {
  fullName?: string | null;
  company?: string | null;
  website?: string | null;
  timezone?: string | null;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string; // min 12, max 128 chars
}

// ============================================================================
// Dashboard Types
// ============================================================================

export type IntentLabel = 'High' | 'Medium' | 'Low' | 'Unknown';
export type Platform = 'instagram' | 'facebook';
export type Persona = 
  | 'Buyer' 
  | 'Researcher' 
  | 'PriceSeeker' 
  | 'ProblemAware' 
  | 'Fan' 
  | 'Competitor' 
  | 'Partner' 
  | 'Other' 
  | 'Unknown';

export interface KpisResponse {
  totalEngagersAnalyzed: number;
  highIntentUsersCount: number;
  highIntentUsersPercent: number; // 0-100
  leadsGenerated: number;
  dmsSent: number;
  avgConversionScore: number; // 0-100
  avgAiConfidenceScore: number; // 0-1
}

export interface QualityTrendPoint {
  date: string; // ISO datetime
  high: number;
  medium: number;
  low: number;
}

export interface EngagementQualityTrendResponse {
  data: QualityTrendPoint[];
}

export interface IntentBucket {
  label: IntentLabel;
  value: number;
  percentage: number; // 0-100
}

export interface IntentDistributionResponse {
  data: IntentBucket[];
}

export interface PersonaBucket {
  label: Persona;
  value: number;
  percentage: number; // 0-100
}

export interface PersonaBreakdownResponse {
  data: PersonaBucket[];
}

export interface TopPostItem {
  id: string;
  caption: string | null;
  thumbnailUrl: string | null;
  engagementRate: number | null;
  commentCount: number;
  likeCount: number;
  postedAt: string | null; // ISO datetime
}

export interface TopPostsResponse {
  data: TopPostItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string; // ISO datetime
  metadata: Record<string, any> | null;
}

export interface ActivityFeedResponse {
  items: ActivityItem[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// Engager Types
// ============================================================================

export type EngagementQuality = 'High' | 'Medium' | 'Low';
export type RecommendedAction = 
  | 'Send DM' 
  | 'Reply Publicly' 
  | 'Ask Qualification Question' 
  | 'Offer Demo' 
  | 'Share Pricing' 
  | 'Nurture' 
  | 'Ignore';

export interface TopComment {
  text: string;
  reason: string;
  score: number; // 0-100
}

export interface AiSignals {
  containsQuestion: boolean;
  containsPurchaseIntent: boolean;
  keyPhrases: string[];
  commentsAnalyzed: number;
  confidence: number | null; // 0-1
}

export interface EngagerAiSummary {
  intentScore: number; // 0-100
  intentLabel: IntentLabel;
  confidence: number; // 0-1
  persona: Persona;
  engagementQuality: EngagementQuality;
  recommendedAction: RecommendedAction;
  topComments: TopComment[];
  suggestedReply: string | null;
  privateReplySuggestion: string | null;
  reason: string;
  signals: AiSignals;
}

export interface EngagerListItem {
  id: string;
  username: string;
  fullName: string | null;
  profilePictureUrl: string | null;
  followerCount: number | null;
  isVerified: boolean;
  isBusinessAccount: boolean;
  totalEngagements: number;
  commentCount: number;
  likeCount: number;
  aiIntentScore: number | null; // 0-100
  aiIntentLabel: IntentLabel | null;
  aiConfidenceScore: number | null; // 0-1
  persona: Persona | null;
  engagementQuality: EngagementQuality | null;
  recommendedAction: RecommendedAction | null;
  leadStatus: string;
  tags: string[] | null;
  firstEngagedAt: string | null; // ISO datetime
  lastEngagedAt: string | null; // ISO datetime
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EngagersListResponse {
  engagers: EngagerListItem[];
  pagination: Pagination;
}

export interface InteractionPreview {
  id: string;
  type: string; // "COMMENT"
  content: string | null;
  postCaption: string | null;
  sentiment: string | null;
  containsQuestion: boolean;
  containsPurchaseIntent: boolean;
  createdAt: string; // ISO datetime
}

export interface EngagerDetailResponse {
  id: string;
  username: string;
  fullName: string | null;
  profilePictureUrl: string | null;
  followerCount: number | null;
  followingCount: number | null;
  isVerified: boolean;
  isBusinessAccount: boolean;
  biography: string | null;
  website: string | null;
  email: string | null;
  city: string | null;
  country: string | null;
  totalEngagements: number;
  commentCount: number;
  likeCount: number;
  shareCount: number;
  saveCount: number;
  ai: EngagerAiSummary | null;
  leadStatus: string;
  tags: string[] | null;
  notes: string | null;
  assignedTo: string | null;
  firstEngagedAt: string | null; // ISO datetime
  lastEngagedAt: string | null; // ISO datetime
  recentInteractions: InteractionPreview[];
  engagementTimeline: any[]; // Reserved for future use
  aiInsights?: {
    recommendedActions: string[];
    bestTimeToReach: string;
    interests: string[];
    conversionProbability: number;
    similarUsers: string[];
    privateReplySuggestion?: string | null;
  };
}

export interface EngagerUpdateRequest {
  leadStatus?: string | null;
  tags?: string[] | null;
  notes?: string | null;
  assignedTo?: string | null;
}

export interface ReplyRequest {
  interactionId: string;
  replyContent: string; // min 1, max 1500 chars
}

export interface BulkUpdateRequest {
  engagerIds: string[]; // min 1 item
  updates: EngagerUpdateRequest;
}

// ============================================================================
// Instagram / Facebook Types
// ============================================================================

export type SyncStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface InstagramAuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface InstagramConnectRequest {
  code: string;
  state: string;
}

export interface FacebookAuthUrlResponse {
  authUrl: string;
  state: string;
}

export interface FacebookConnectRequest {
  code: string;
  state: string;
  pageId?: string | null;
}

export interface InstagramConnectionResponse {
  id: string;
  instagramUserId: string;
  instagramUsername: string;
  accountType: string | null;
  profilePictureUrl: string | null;
  followersCount: number | null;
  status: string;
  lastSyncAt: string | null; // ISO datetime
  createdAt: string | null; // ISO datetime
}

export interface FacebookConnectionResponse {
  id: string;
  facebookPageId: string;
  facebookPageName: string;
  pageCategory: string | null;
  profilePictureUrl: string | null;
  followersCount: number | null;
  status: string;
  lastSyncAt: string | null; // ISO datetime
  createdAt: string | null; // ISO datetime
}

export interface SyncStartResponse {
  message: string;
  jobId: string;
}

export interface SyncStatusResponse {
  jobId: string;
  status: SyncStatus;
  progress: number | null; // 0-100
  message: string | null;
}

// ============================================================================
// Export Types
// ============================================================================

export interface ExportRequest {
  format: 'csv' | 'excel' | 'json';
  filters?: Record<string, any> | null;
  fields?: string[] | null;
}

export interface ExportCreateResponse {
  exportId: string;
  message: string;
  estimatedTime: string | null;
}

export interface ExportStatusResponse {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  expiresAt?: string | null; // ISO datetime
  fileSize?: number | null;
  progress?: number | null; // 0-100
  errorMessage?: string | null;
}

// ============================================================================
// Notification Types
// ============================================================================

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string | null;
  isRead: boolean;
  createdAt: string; // ISO datetime
}

export interface NotificationsListResponse {
  notifications: NotificationItem[];
  unreadCount: number;
  total: number;
}

// ============================================================================
// Settings Types
// ============================================================================

export interface NotificationSettingsResponse {
  emailHighIntent: boolean;
  emailDailySummary: boolean;
  emailWeeklyReport: boolean;
  pushHighIntent: boolean;
  pushNewEngager: boolean;
  pushConnectionIssues: boolean;
}

export interface NotificationSettingsUpdateRequest {
  emailHighIntent?: boolean | null;
  emailDailySummary?: boolean | null;
  emailWeeklyReport?: boolean | null;
  pushHighIntent?: boolean | null;
  pushNewEngager?: boolean | null;
  pushConnectionIssues?: boolean | null;
}

// ============================================================================
// Interaction Types
// ============================================================================

export type InteractionType = 'COMMENT';

export interface InteractionItem {
  repliedAt?: string | null; // ISO datetime when reply was sent
  replyContent?: string | null; // The actual reply message content
  id: string;
  engagerId: string;
  engagerUsername: string;
  postId: string;
  postCaption: string | null;
  type: InteractionType;
  content: string | null;
  sentiment: string | null;
  containsQuestion: boolean;
  containsPurchaseIntent: boolean;
  replied: boolean;
  createdAt: string; // ISO datetime
}

export interface InteractionsListResponse {
  interactions: InteractionItem[];
  pagination: Pagination;
}

// ============================================================================
// Legacy/Compatibility Types (for backward compatibility)
// ============================================================================

export interface User extends MeResponse {}
export interface Engager extends EngagerListItem {}
export interface Notification extends NotificationItem {}
export interface InstagramConnection extends InstagramConnectionResponse {}
