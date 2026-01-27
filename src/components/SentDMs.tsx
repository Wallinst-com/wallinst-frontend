import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { MessageSquare, ArrowLeft, Calendar, FileText, CheckCircle2, Loader2, Clock } from 'lucide-react';
import api from '../lib/api';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { InteractionItem } from '../lib/types';
import { DEFAULT_PAGE_SIZE, QUERY_STALE_TIME, QUERY_RETRY_ATTEMPTS, ERROR_MESSAGES } from '../lib/constants';

interface SentDMsProps {
  onBack: () => void;
}


export function SentDMs({ onBack }: SentDMsProps) {
  const [page, setPage] = useState(1);
  const [platform, setPlatform] = useState<'instagram' | 'facebook'>(() => {
    const saved = window.localStorage.getItem('wallinst-platform');
    return saved === 'facebook' ? 'facebook' : 'instagram';
  });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sentDMs', page, platform],
    queryFn: () => api.getSentDMs({ page, limit: DEFAULT_PAGE_SIZE, platform }),
    retry: QUERY_RETRY_ATTEMPTS,
    staleTime: QUERY_STALE_TIME,
  });

  const sentDMs = useMemo(
    () => data?.interactions || data?.data?.interactions || [],
    [data]
  );
  const pagination = useMemo(
    () => data?.pagination || data?.data?.pagination || { page: 1, limit: DEFAULT_PAGE_SIZE, total: 0 },
    [data]
  );

  const totalPages = useMemo(() => {
    if (pagination.totalPages) return pagination.totalPages;
    return Math.ceil(pagination.total / DEFAULT_PAGE_SIZE);
  }, [pagination.total, pagination.totalPages]);

  const formatDate = useCallback((dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      // Relative time for recent messages
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays < 7) return `${diffDays}d ago`;

      // Full date for older messages
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }, []);

  const handlePreviousPage = useCallback(() => {
    setPage((p) => Math.max(1, p - 1));
  }, []);

  const handleNextPage = useCallback(() => {
    setPage((p) => Math.min(totalPages, p + 1));
  }, [totalPages]);

  // Error handling
  useEffect(() => {
    if (error) {
      toast.error(ERROR_MESSAGES.LOAD_FAILED);
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {platform === 'facebook' ? 'Sent Replies' : 'Sent Direct Messages'}
                </h1>
                <p className="text-sm text-gray-600">
                  {isLoading ? 'Loading...' : `${pagination.total} message${pagination.total !== 1 ? 's' : ''} sent`}
                </p>
              </div>
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2">
              <div className="inline-flex rounded-lg border border-gray-300 bg-white overflow-hidden">
                <button
                  onClick={() => {
                    setPlatform('instagram');
                    window.localStorage.setItem('wallinst-platform', 'instagram');
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold ${
                    platform === 'instagram' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Instagram
                </button>
                <button
                  onClick={() => {
                    setPlatform('facebook');
                    window.localStorage.setItem('wallinst-platform', 'facebook');
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold ${
                    platform === 'facebook' ? 'bg-indigo-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mb-4" />
            <p className="text-gray-600">Loading sent messages...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Messages</h3>
            <p className="text-gray-600 mb-4">Unable to load your sent messages. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : sentDMs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <MessageSquare size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Sent Messages</h3>
            <p className="text-gray-600">
              {platform === 'facebook'
                ? "You haven't replied to any comments yet. Start engaging with your engagers from the dashboard."
                : "You haven't sent any direct messages yet. Start engaging with your engagers from the dashboard."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {sentDMs.map((dm: InteractionItem) => (
                <div
                  key={dm.id}
                  className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center text-white font-semibold shrink-0">
                      {dm.engagerUsername?.charAt(0)?.toUpperCase() || 'U'}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              @{dm.engagerUsername}
                            </h3>
                            <CheckCircle2 size={16} className="text-green-600 shrink-0" title="Message sent" />
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} />
                              <span>{formatDate(dm.repliedAt || dm.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Reply Content */}
                      {dm.replyContent && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <MessageSquare size={14} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Your Reply
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                              {dm.replyContent}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Original Comment */}
                      {dm.content && (
                        <div className="mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <FileText size={14} className="text-gray-500" />
                            <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                              Original Comment
                            </span>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <p className="text-sm text-gray-700 leading-relaxed">"{dm.content}"</p>
                          </div>
                        </div>
                      )}

                      {/* Post Caption */}
                      {dm.postCaption && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-500 line-clamp-2">
                            <span className="font-medium">Post:</span>{' '}
                            {dm.postCaption.length > 150
                              ? `${dm.postCaption.substring(0, 150)}...`
                              : dm.postCaption}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 pt-8 mt-8 border-t border-gray-200">
                <button
                  onClick={handlePreviousPage}
                  disabled={page === 1 || isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={page >= totalPages || isLoading}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
