import { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { Dialog, DialogContent } from './ui/dialog';
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


    // Initialize with AI suggestion if available
    // Initialize with AI suggestion if available
    useEffect(() => {
        if (isOpen && aiSuggestion) {
            setMessage(aiSuggestion.trim());
        } else if (isOpen) {
            setMessage('');
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
            let errorMessage: string = ERROR_MESSAGES.DM_SEND_FAILED;
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
        }
    };

    const characterCount = message.length;
    const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;
    const isNearLimit = characterCount > MESSAGE_WARNING_THRESHOLD;

    // Derive display values
    const avatarUrl = engager.profilePictureUrl;
    const initials = (engager.username || '??').slice(0, 2).toUpperCase();

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden border border-gray-100 shadow-2xl rounded-2xl bg-white ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200">

                {/* Header - Ultra Minimal & Airy */}
                <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={engager.username}
                                    className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold ring-2 ring-white shadow-sm">
                                    {initials}
                                </div>
                            )}
                            {platform === 'instagram' ? (
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-1 rounded-full border-2 border-white">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0" />
                                </div>
                            ) : (
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1 rounded-full border-2 border-white">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-gray-900 leading-tight">
                                {engager.username || 'Unknown User'}
                            </h2>
                            <p className="text-xs text-gray-400 font-medium">
                                via {platform === 'facebook' ? 'Facebook' : 'Instagram'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-6 space-y-5">
                    {/* Context (Replying to) - Subtle Linear Style */}
                    {originalComment && (
                        <div className="relative pl-4 py-1">
                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-indigo-100 rounded-full"></div>
                            <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Replying to</p>
                            <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 italic">
                                "{originalComment}"
                            </p>
                        </div>
                    )}

                    {/* Message Input - Frameless Feel */}
                    <div className="relative group">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                            placeholder={`Reply to ${engager.username}...`}
                            className="min-h-[140px] w-full resize-none border-0 bg-gray-50/50 rounded-xl p-4 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-2 focus-visible:ring-indigo-500/20 focus-visible:bg-white transition-all duration-200"
                        />

                        {/* Floating Actions inside Input */}
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            {/* AI Suggestion Button */}
                            {aiSuggestion && message !== aiSuggestion.trim() && (
                                <button
                                    onClick={handleUseAi}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-all text-xs font-semibold shadow-sm border border-indigo-100 group/ai"
                                >
                                    <Sparkles size={12} className="group-hover/ai:animate-spin-slow transition-transform" />
                                    <span>Use AI Suggestion</span>
                                </button>
                            )}

                            {/* Char Count */}
                            <span className={`text-[10px] font-medium px-2 py-1 rounded-full bg-white/80 ${isOverLimit ? 'text-red-500' : isNearLimit ? 'text-orange-500' : 'text-gray-300'
                                }`}>
                                {characterCount}/{MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer - Clean Actions */}
                <div className="px-6 py-6 flex items-center justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSending}
                        className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg px-4 h-10 text-sm font-medium transition-colors"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isSending || !message.trim() || isOverLimit}
                        className="bg-black hover:bg-gray-800 text-white rounded-lg h-10 px-6 text-sm font-semibold transition-all shadow-lg shadow-gray-200 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 disabled:shadow-none disabled:translate-y-0"
                    >
                        {isSending ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Sending...</span>
                            </div>
                        ) : (
                            <span>Send Reply</span>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
