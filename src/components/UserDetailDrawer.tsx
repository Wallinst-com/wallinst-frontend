import React, { type ComponentType, useState, useMemo, useCallback } from 'react';
import { X, TrendingUp, Activity, Target, ThumbsUp, User, Send, Loader2 } from 'lucide-react';
import type { EngagerDetail } from '../lib/mappers/engager-detail-mapper';
import { Button } from './ui/button';
import { SendDMDialog } from './SendDMDialog';
import api from '../lib/api';
import { toast } from 'sonner';
import { MAX_MESSAGE_LENGTH, MESSAGE_WARNING_THRESHOLD, ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '../lib/constants';

interface UserDetailDrawerProps {
  engager: EngagerDetail;
  onClose: () => void;
  platform?: 'instagram' | 'facebook';
}

// Safe defaults so we never crash on missing fields
function getDrawerData(engager: EngagerDetail) {
  const score = engager.aiIntentScore ?? 0;
  const intent = engager.aiIntentLabel ?? 'Low';
  const persona = engager.aiPersona ?? 'Other';
  const firstEngagement = engager.firstEngagedAt ?? '—';
  const lastActive = engager.lastEngagedAt ?? '—';
  const flags = Array.isArray(engager.flags) ? engager.flags : [];
  const history = Array.isArray(engager.engagementHistory) ? engager.engagementHistory : [];
  const insights = engager.aiInsights ?? {
    recommendedActions: [],
    bestTimeToReach: '—',
    interests: [],
    conversionProbability: 0,
    similarUsers: [],
  };
  const actions = Array.isArray(insights.recommendedActions) ? insights.recommendedActions : [];
  const interests = Array.isArray(insights.interests) ? insights.interests : [];

  // Derive score breakdown from intent score when backend doesn't provide it
  const intentSignal = Math.min(100, Math.round(score));
  const engagementQuality = engager.aiEngagementQuality === 'High' ? 85 : engager.aiEngagementQuality === 'Medium' ? 60 : 40;
  const scoreBreakdown = {
    engagementQuality,
    intentSignal,
    activityLevel: 50,
    sentiment: 70,
    profileCompleteness: 60,
  };

  const avatar = engager.profilePictureUrl ?? null;
  const displayName = engager.fullName ?? engager.username;
  const initials = (engager.username || '@?').replace('@', '').slice(0, 2).toUpperCase();

  return {
    score,
    intent,
    persona,
    firstEngagement,
    lastActive,
    flags,
    history,
    insights,
    actions,
    interests,
    scoreBreakdown,
    avatar,
    displayName,
    initials,
  };
}

export function UserDetailDrawer({ engager, onClose, platform = 'instagram' }: UserDetailDrawerProps) {
  // Guard clause: if engager is null/undefined, don't render
  if (!engager) {
    console.error('UserDetailDrawer: engager is null or undefined');
    return null;
  }

  // Safely get drawer data with error handling
  let d;
  try {
    d = getDrawerData(engager);
  } catch (error) {
    return (
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6 max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Drawer</h2>
          <p className="text-gray-600 mb-4">Failed to load engager details. Please try again.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const [showDMDialog, setShowDMDialog] = useState(false);
  const [dmMessage, setDmMessage] = useState('');
  const [isSendingDM, setIsSendingDM] = useState(false);

  // Get the first comment interaction for DM (memoized)
  const firstCommentInteraction = useMemo(
    () => engager.recentInteractions?.find(
      (interaction) => interaction.type === 'COMMENT' && interaction.id
    ),
    [engager.recentInteractions]
  );


  const handleSendDM = useCallback(async () => {
    if (!firstCommentInteraction) {
      toast.error(VALIDATION_MESSAGES.NO_COMMENT_INTERACTION);
      return;
    }

    if (!dmMessage.trim()) {
      toast.error(VALIDATION_MESSAGES.MESSAGE_REQUIRED);
      return;
    }

    if (dmMessage.length > MAX_MESSAGE_LENGTH) {
      toast.error(VALIDATION_MESSAGES.MESSAGE_TOO_LONG);
      return;
    }

    setIsSendingDM(true);
    try {
      await api.replyToEngager(String(engager.id), {
        interactionId: firstCommentInteraction.id,
        replyContent: dmMessage.trim(),
      }, platform);

      toast.success(SUCCESS_MESSAGES.DM_SENT);
      setShowDMDialog(false);
      setDmMessage('');
      // Optionally refresh engager data or close drawer
      onClose();
    } catch (error: any) {
      // Extract error message from API error
      let errorMessage = ERROR_MESSAGES.DM_SEND_FAILED;
      if (error?.message) {
        errorMessage = error.message;
      } else if (error?.details?.message) {
        errorMessage = error.details.message;
      } else if (error?.details?.error?.message) {
        errorMessage = error.details.error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      toast.error(errorMessage);
    } finally {
      setIsSendingDM(false);
    }
  }, [firstCommentInteraction, dmMessage, engager.id, onClose]);

  const getIntentColor = (intent: string) => {
    switch (intent) {
      case 'High': return 'bg-green-100 text-green-700 border-green-300';
      case 'Medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Low': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  // recommendedActions can be string[] (mapper) or Array<{ action, reason?, ... }>
  const actionLabel = (a: string | { action?: string; reason?: string }) =>
    typeof a === 'string' ? a : (a?.action ?? '—');
  const actionReason = (a: string | { action?: string; reason?: string }) =>
    typeof a === 'string' ? null : (a?.reason ?? null);

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 animate-in fade-in duration-300"
        onClick={onClose}
        aria-hidden="true"
        style={{ display: 'block' }}
      />
      <div
        className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-white shadow-2xl z-50 overflow-y-auto animate-in slide-in-from-right duration-300"
        style={{ display: 'block', visibility: 'visible', opacity: 1 }}
      >
        <div className="sticky top-0 bg-white border-b-2 border-gray-200 p-6 z-10">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0 overflow-hidden">
              {d.avatar ? (
                <img src={d.avatar} alt="" className="w-full h-full object-cover" />
              ) : (
                d.initials
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-1 truncate">{engager.username || 'Unknown User'}</h2>
              {d.displayName && d.displayName !== engager.username && (
                <p className="text-sm text-gray-600 truncate">{d.displayName}</p>
              )}
              <p className="text-sm text-gray-600">First engagement: {d.firstEngagement}</p>
              <p className="text-sm text-gray-600">Last active: {d.lastActive}</p>
            </div>
          </div>

          <div className="mt-4">
            <div className="text-5xl font-bold text-gray-900">{d.score ?? 0}</div>
            <p className="text-sm text-gray-600 font-medium">AI Intent Score</p>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Score Breakdown</h3>
            <div className="space-y-4">
              <ScoreItem label="Engagement Quality" score={d.scoreBreakdown.engagementQuality} weight="40%" icon={Activity} />
              <ScoreItem label="Intent Signal" score={d.scoreBreakdown.intentSignal} weight="30%" icon={Target} />
              <ScoreItem label="Activity Level" score={d.scoreBreakdown.activityLevel} weight="10%" icon={TrendingUp} />
              <ScoreItem label="Sentiment Score" score={d.scoreBreakdown.sentiment} weight="10%" icon={ThumbsUp} />
              <ScoreItem label="Profile Completeness" score={d.scoreBreakdown.profileCompleteness} weight="10%" icon={User} />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Persona & Intent</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Detected Persona</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-300">
                  {d.persona}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Intent Level</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getIntentColor(d.intent)}`}>
                  {d.intent}
                </span>
              </div>
              {engager.aiRecommendedAction && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-gray-700">Recommended action</span>
                  <span className="text-sm text-gray-900 font-medium text-right">{engager.aiRecommendedAction}</span>
                </div>
              )}
              {d.flags.length > 0 && (
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium text-gray-700">Flags</span>
                  <div className="flex flex-wrap gap-2 justify-end">
                    {d.flags.map((flag, idx) => (
                      <span key={idx} className="px-2 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700 border border-red-300">
                        {flag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Engagement History</h3>
            <p className="text-sm font-semibold text-gray-600 mb-4">{d.history.length} interaction{d.history.length !== 1 ? 's' : ''}</p>
            <div className="space-y-4">
              {d.history.length === 0 ? (
                <p className="text-sm font-medium text-gray-500">No engagement history available.</p>
              ) : (
                d.history.map((item: any, idx: number) => (
                  <div key={item?.id ?? idx} className="border-l-2 border-indigo-300 pl-4 py-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-gray-700">
                        {item?.date ?? '—'} {item?.time ? `at ${item.time}` : ''}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 uppercase">
                        {(item?.type ?? 'comment').toString().replace('_', ' ')}
                      </span>
                    </div>
                    {(item?.post || item?.content) && (
                      <p className="text-sm text-gray-900 mb-1">
                        {item?.post && <><span className="font-bold">On: </span><span className="font-semibold">"{item.post}"</span></>}
                        {item?.post && item?.content && ' '}
                        {item?.content && <span className="font-bold italic">"{item.content}"</span>}
                      </p>
                    )}
                    {item?.aiNote && (
                      <p className="text-sm text-purple-700 mt-1"><span className="font-bold">AI: </span><span className="font-semibold">{item.aiNote}</span></p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">AI Insights</h3>

            {d.actions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-3">Recommended Actions</h4>
                <div className="space-y-3">
                  {d.actions.map((a, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4">
                      <p className="font-bold text-gray-900 mb-1">{idx + 1}. {actionLabel(a)}</p>
                      {actionReason(a) && <p className="text-sm text-gray-700">Reason: {actionReason(a)}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <h4 className="text-sm font-bold text-gray-700 mb-2">Best Time to Reach</h4>
              <p className="text-sm text-gray-900 font-semibold">{d.insights.bestTimeToReach}</p>
            </div>

            {d.interests.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-bold text-gray-700 mb-2">Interests Detected</h4>
                <div className="flex flex-wrap gap-2">
                  {d.interests.map((interest, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold border border-purple-300">
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg p-4">
              <h4 className="text-sm font-bold text-gray-700 mb-2">Conversion Probability</h4>
              <div className="text-4xl font-bold text-green-700 mb-2">{d.insights.conversionProbability}%</div>
              <p className="text-sm text-gray-700">Based on AI analysis</p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={() => {
                if (!firstCommentInteraction) {
                  toast.error(VALIDATION_MESSAGES.NO_COMMENT_INTERACTION);
                  return;
                }
                setShowDMDialog(true);
              }}
              disabled={!firstCommentInteraction}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {platform === 'facebook' ? 'Reply to Comment' : 'Send DM'}
            </button>
            <button type="button" className="w-full bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-bold hover:border-indigo-400 hover:bg-indigo-50 transition-all">
              Add to Campaign
            </button>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" className="bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                Export Profile
              </button>
              <button type="button" className="bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:border-indigo-400 hover:bg-indigo-50 transition-all">
                Mark Contacted
              </button>
            </div>
          </div>
        </div>
      </div>

      <SendDMDialog
        isOpen={showDMDialog}
        onClose={() => setShowDMDialog(false)}
        engager={engager}
        platform={platform}
        interactionId={firstCommentInteraction?.id}
        originalComment={firstCommentInteraction?.content}
        aiSuggestion={typeof engager.aiInsights?.privateReplySuggestion === 'string' ? engager.aiInsights.privateReplySuggestion : null}
      />
    </>
  );
}

interface ScoreItemProps {
  label: string;
  score: number;
  weight: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

function ScoreItem({ label, score, weight, icon: Icon }: ScoreItemProps) {
  const pct = Math.min(100, Math.max(0, Number(score)));
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-indigo-600" />
          <span className="text-sm font-semibold text-gray-700">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium">{weight}</span>
          <span className="text-sm font-bold text-gray-900">{pct}</span>
        </div>
      </div>
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
