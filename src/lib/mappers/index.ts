// src/lib/mappers/index.ts
// Mapper functions for transforming backend data to frontend formats

import type { EngagerListItem, NotificationItem, EngagerDetailResponse } from '../types';

/**
 * Extract list from various backend response shapes
 */
export function extractList<T>(response: any): T[] {
  if (!response) return [];
  if (Array.isArray(response)) return response;
  if (Array.isArray(response.items)) return response.items;
  if (Array.isArray(response.data)) return response.data;
  if (Array.isArray(response.engagers)) return response.engagers;
  if (Array.isArray(response.notifications)) return response.notifications;
  if (response.data && Array.isArray(response.data.items)) return response.data.items;
  return [];
}

/**
 * Map backend engager to frontend Engager type
 */
export function mapEngager(backend: any): any {
  if (!backend) return null;

  return {
    id: backend.id || backend.instagramUserId || '',
    username: backend.username || '',
    fullName: backend.fullName || backend.full_name || null,
    profilePictureUrl: backend.profilePictureUrl || backend.profile_picture_url || null,
    followerCount: backend.followerCount ?? backend.follower_count ?? null,
    followingCount: backend.followingCount ?? backend.following_count ?? null,
    isVerified: backend.isVerified ?? backend.is_verified ?? false,
    isBusinessAccount: backend.isBusinessAccount ?? backend.is_business_account ?? false,
    biography: backend.biography || null,
    website: backend.website || null,
    email: backend.email || null,
    totalEngagements: backend.totalEngagements ?? backend.total_engagements ?? 0,
    commentCount: backend.commentCount ?? backend.comment_count ?? 0,
    likeCount: backend.likeCount ?? backend.like_count ?? 0,
    shareCount: backend.shareCount ?? backend.share_count ?? 0,
    saveCount: backend.saveCount ?? backend.save_count ?? 0,
    aiIntentScore: backend.aiIntentScore ?? backend.ai_intent_score ?? null,
    aiIntentLabel: backend.aiIntentLabel ?? backend.ai_intent_label ?? null,
    aiConfidenceScore: backend.aiConfidenceScore ?? backend.ai_confidence_score ?? null,
    // Backend returns persona directly from ai_persona field
    persona: backend.persona ?? backend.aiPersona ?? backend.ai_persona ?? null,
    engagementQuality: backend.engagementQuality ?? backend.engagement_quality ?? null,
    recommendedAction: backend.recommendedAction ?? backend.recommended_action ?? null,
    leadStatus: backend.leadStatus ?? backend.lead_status ?? 'new',
    tags: Array.isArray(backend.tags) ? backend.tags : null,
    notes: backend.notes || null,
    firstEngagedAt: backend.firstEngagedAt ?? backend.first_engaged_at ?? null,
    lastEngagedAt: backend.lastEngagedAt ?? backend.last_engaged_at ?? null,
  };
}

/**
 * Map backend notification to frontend Notification type
 */
export function mapNotification(backend: any): any {
  if (!backend) return null;

  return {
    id: backend.id || '',
    type: backend.type || '',
    title: backend.title || '',
    message: backend.message || '',
    link: backend.link || null,
    metadata: backend.metadata || null,
    isRead: backend.isRead ?? backend.is_read ?? false,
    readAt: backend.readAt ?? backend.read_at ?? null,
    createdAt: backend.createdAt ?? backend.created_at ?? new Date().toISOString(),
  };
}
