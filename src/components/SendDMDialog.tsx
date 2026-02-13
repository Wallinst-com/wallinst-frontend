import React, { useState, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Sparkles, X, User } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import api from '../lib/api';
import { MAX_MESSAGE_LENGTH, MESSAGE_WARNING_THRESHOLD, ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION_MESSAGES } from '../lib/constants';
import type { EngagerDetail } from '../lib/mappers/engager-detail-mapper';

interface SendDMDialogProps {
    isOpen: boolean;
    onClose: () => void;
    engager: EngagerDetail;
    platform?: 'instagram' | 'facebook';
    interactionId?: string;
    originalComment?: string | null;
    aiSuggestion?: string | null;
}

export function SendDMDialog({
    isOpen,
    onClose,
    engager,
    platform = 'instagram',
    interactionId,
    originalComment,
    aiSuggestion
}: SendDMDialogProps) {
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [usingAi, setUsingAi] = useState(false);

    // Initialize with AI suggestion if available
    useEffect(() => {
        if (isOpen && aiSuggestion) {
            setMessage(aiSuggestion.trim());
            setUsingAi(true);
        } else if (isOpen) {
            setMessage('');
            setUsingAi(false);
        }
    }, [isOpen, aiSuggestion]);

    const handleSend = async () => {
        if (!interactionId) {
            toast.error(VALIDATION_MESSAGES.NO_COMMENT_INTERACTION);
            return;
        }

        if (!message.trim()) {
            toast.error(VALIDATION_MESSAGES.MESSAGE_REQUIRED);
            return;
        }

        if (message.length > MAX_MESSAGE_LENGTH) {
            toast.error(VALIDATION_MESSAGES.MESSAGE_TOO_LONG);
            return;
        }

        setIsSending(true);
        try {
            await api.replyToEngager(String(engager.id), {
                interactionId: interactionId,
                replyContent: message.trim(),
            }, platform);

            toast.success(SUCCESS_MESSAGES.DM_SENT);
            onClose();
        } catch (error: any) {
            let errorMessage = ERROR_MESSAGES.DM_SEND_FAILED;
            if (error?.message) errorMessage = error.message;
            else if (error?.details?.message) errorMessage = error.details.message;
            else if (typeof error === 'string') errorMessage = error;

            toast.error(errorMessage);
        } finally {
            setIsSending(false);
        }
    };

    const handleUseAi = () => {
        if (aiSuggestion) {
            setMessage(aiSuggestion.trim());
            setUsingAi(true);
        }
    };

    const characterCount = message.length;
    const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;
    const isNearLimit = characterCount > MESSAGE_WARNING_THRESHOLD;

    // Derive display values
    const avatarUrl = engager.profilePictureUrl;
    const initials = (engager.username || '??').slice(0, 2).toUpperCase();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden border border-gray-100 shadow-2xl rounded-xl bg-white">

                {/* Header - Clean & Minimal */}
                <div className="relative px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-200">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={engager.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm font-bold">{initials}</span>
                                )}
                            </div>
                            {/* Platform Badge */}
                            <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${platform === 'facebook' ? 'bg-blue-600' : 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600'
                                }`}>
                                <span className="sr-only">{platform}</span>
                            </div>
                        </div>
                        <div>
                            <DialogTitle className="text-lg font-bold text-gray-900 leading-tight">
                                {platform === 'facebook' ? 'Reply to Comment' : 'Send Message'}
                            </DialogTitle>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="text-sm text-gray-500">To:</span>
                                <span className="text-sm font-semibold text-gray-900">@{engager.username}</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content Area */}
                <div className="p-6 space-y-6 bg-gray-50/30">

                    {/* Context Card (The Comment being replied to) */}
                    {originalComment && (
                        <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm relative overflow-hidden group">
                            {/* Decorative accent bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-lg" />

                            <div className="flex items-start gap-3 pl-2">
                                <MessageSquare size={16} className="text-indigo-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Replying to comment</p>
                                    <p className="text-sm text-gray-700 leading-relaxed line-clamp-3 italic">
                                        "{originalComment}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-sm font-semibold text-gray-700">Message</label>

                            {aiSuggestion && message !== aiSuggestion.trim() && (
                                <button
                                    onClick={handleUseAi}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                                >
                                    <Sparkles size={12} />
                                    Use AI Suggestion
                                </button>
                            )}
                        </div>

                        <div className="relative bg-white rounded-xl border border-gray-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
                            <Textarea
                                value={message}
                                onChange={(e) => {
                                    setMessage(e.target.value);
                                    if (usingAi && e.target.value !== aiSuggestion) setUsingAi(false);
                                }}
                                placeholder="Type your message..."
                                className="min-h-[140px] w-full resize-none border-0 bg-transparent p-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none text-base"
                            />

                            {/* Bottom Toolbar inside input */}
                            <div className="absolute bottom-2 right-2 flex items-center gap-2">
                                <span className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${isOverLimit ? 'bg-red-50 text-red-600' :
                                        isNearLimit ? 'bg-amber-50 text-amber-600' :
                                            'text-gray-400'
                                    }`}>
                                    {characterCount} / {MAX_MESSAGE_LENGTH}
                                </span>
                            </div>
                        </div>
                        {usingAi && message === aiSuggestion?.trim() && (
                            <p className="text-xs text-indigo-600 flex items-center gap-1 px-1">
                                <Sparkles size={10} /> AI suggestion applied
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isSending}
                        className="text-gray-700 border-gray-200 hover:bg-gray-50 hover:text-gray-900"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isSending || !message.trim() || isOverLimit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 active:scale-95 transition-all min-w-[100px]"
                    >
                        {isSending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <>
                                <Send className="w-4 h-4 mr-2" />
                                Send
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
