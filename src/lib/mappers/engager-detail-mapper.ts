// src/lib/mappers/engager-detail-mapper.ts

// These types should match your UI components.
// If your components export their own types, you can import them instead.
export type TableEngager = {
  id: number | string;
  username: string;
  score: number;
  intent: 'High' | 'Medium' | 'Low';
  persona: string;
  engagementQuality: number;
  activityLevel: string;
  flags: string[];
};

export type EngagerDetail = {
  id: number | string;
  username: string;
  fullName?: string | null;
  profilePictureUrl?: string | null;

  aiIntentScore: number;
  aiIntentLabel: 'High' | 'Medium' | 'Low';
  aiPersona?: string | null;
  aiEngagementQuality?: 'High' | 'Medium' | 'Low' | null;
  aiRecommendedAction?: string | null;

  followerCount?: number | null;
  followingCount?: number | null;
  isVerified?: boolean | null;

  email?: string | null;
  phone?: string | null;
  website?: string | null;

  city?: string | null;
  country?: string | null;

  leadStatus?: string | null;
  tags?: string[] | null;
  notes?: string | null;

  lastEngagedAt?: string | null;
  firstEngagedAt?: string | null;

  engagementHistory?: any[];
  recentInteractions?: Array<{
    id: string;
    type: string;
    content: string | null;
    createdAt: string;
  }>;
  aiInsights?: {
    recommendedActions: string[];
    bestTimeToReach: string;
    interests: string[];
    conversionProbability: number;
    similarUsers: string[];
    privateReplySuggestion?: string | null;
  };
  flags: string[];
};

function asNumber(v: any, fallback = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

function normalizeIntent(label: any, score: number): 'High' | 'Medium' | 'Low' {
  const l = String(label ?? '').toLowerCase();
  if (l === 'high' || score >= 70) return 'High';
  if (l === 'medium' || (score >= 40 && score < 70)) return 'Medium';
  return 'Low';
}

function normalizeUsername(u: any) {
  const s = String(u ?? '').trim();
  if (!s) return '@unknown';
  return s.startsWith('@') ? s : `@${s}`;
}

// -------- Export 1: row mapping for table --------
export function mapBackendEngagerToTable(e: any): TableEngager {
  const score = asNumber(e?.aiIntentScore ?? e?.ai_intent_score ?? 0, 0);
  const intentLabel = e?.aiIntentLabel ?? e?.ai_intent_label;
  const intent = normalizeIntent(intentLabel, score);

  // Backend returns persona directly, not aiPersona
  const persona =
    String(e?.persona ?? e?.aiPersona ?? e?.ai_persona ?? '')
      .trim() || 'Other';

  const engagementQualityRaw = e?.aiEngagementQuality ?? e?.ai_engagement_quality;
  const engagementQuality =
    typeof engagementQualityRaw === 'string'
      ? engagementQualityRaw.toLowerCase() === 'high'
        ? 90
        : engagementQualityRaw.toLowerCase() === 'medium'
          ? 60
          : 30
      : Math.round(score);

  const id = e?.id ?? e?.instagramUserId ?? e?.instagram_user_id ?? 0;

  // Flags: if backend returns tags or warnings, surface them
  const tags = Array.isArray(e?.tags) ? e.tags : typeof e?.tags === 'string' ? [e.tags] : [];
  const flags: string[] = tags.map((t: any) => String(t));

  return {
    id: typeof id === 'string' || typeof id === 'number' ? id : String(id),
    username: normalizeUsername(e?.username),
    score: Math.round(score),
    intent,
    persona,
    engagementQuality: Math.max(0, Math.min(100, Math.round(engagementQuality))),
    activityLevel: 'Active',
    flags,
  };
}

// -------- Export 2: detail mapping for drawer --------
export function mapBackendDetailToDrawer(detail: any, row?: Partial<TableEngager>): EngagerDetail {
  const score = asNumber(detail?.aiIntentScore ?? detail?.ai_intent_score ?? row?.score ?? 0, 0);
  const intentLabel = detail?.aiIntentLabel ?? detail?.ai_intent_label ?? row?.intent;
  const intent = normalizeIntent(intentLabel, score);

  const id = detail?.id ?? row?.id ?? 0;

  const aiPersona = detail?.aiPersona ?? detail?.ai_persona ?? row?.persona ?? null;
  const aiEngagementQuality = detail?.aiEngagementQuality ?? detail?.ai_engagement_quality ?? null;
  const aiRecommendedAction = detail?.aiRecommendedAction ?? detail?.ai_recommended_action ?? null;

  const tags =
    Array.isArray(detail?.tags)
      ? detail.tags.map((t: any) => String(t))
      : typeof detail?.tags === 'string'
        ? [detail.tags]
        : null;

  const flags =
    Array.isArray(row?.flags) ? row!.flags! : tags ?? [];

  return {
    id,
    username: normalizeUsername(detail?.username ?? row?.username),
    fullName: detail?.fullName ?? detail?.full_name ?? null,
    profilePictureUrl: detail?.profilePictureUrl ?? detail?.profile_picture_url ?? null,

    aiIntentScore: Math.round(score),
    aiIntentLabel: intent,
    aiPersona: aiPersona ? String(aiPersona) : null,
    aiEngagementQuality: aiEngagementQuality ? String(aiEngagementQuality) : null,
    aiRecommendedAction: aiRecommendedAction ? String(aiRecommendedAction) : null,

    followerCount: detail?.followerCount ?? detail?.follower_count ?? null,
    followingCount: detail?.followingCount ?? detail?.following_count ?? null,
    isVerified: detail?.isVerified ?? detail?.is_verified ?? null,

    email: detail?.email ?? null,
    phone: detail?.phone ?? null,
    website: detail?.website ?? null,

    city: detail?.city ?? null,
    country: detail?.country ?? null,

    leadStatus: detail?.leadStatus ?? detail?.lead_status ?? null,
    tags,
    notes: detail?.notes ?? null,

    lastEngagedAt: detail?.lastEngagedAt ?? detail?.last_engaged_at ?? null,
    firstEngagedAt: detail?.firstEngagedAt ?? detail?.first_engaged_at ?? null,

    engagementHistory: Array.isArray(detail?.engagementHistory) ? detail.engagementHistory : [],
    recentInteractions: Array.isArray(detail?.recentInteractions) ? detail.recentInteractions : [],
    aiInsights: detail?.aiInsights ? {
      ...detail.aiInsights,
      privateReplySuggestion: detail.aiInsights.privateReplySuggestion ?? null,
    } : {
      recommendedActions: aiRecommendedAction ? [String(aiRecommendedAction)] : [],
      bestTimeToReach: '—',
      interests: [],
      conversionProbability: 0,
      similarUsers: [],
      privateReplySuggestion: null,
    },

    flags,
  };
}