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
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[520px] p-0 gap-0 overflow-hidden border border-gray-100 shadow-xl rounded-xl bg-white ring-1 ring-gray-100">

                {/* Header - Ultra Minimal */}
                <div className="px-6 pt-6 pb-2 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 overflow-hidden border border-gray-100">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={engager.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[10px] font-bold">{initials}</span>
                                )}
                            </div>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900 leading-none">
                                {engager.username}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {platform === 'facebook' ? 'via Facebook' : 'via Instagram'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="px-6 py-4 space-y-4">

                    {/* Quoted Comment - Clean Blockquote */}
                    {originalComment && (
                        <div className="pl-3 border-l-2 border-gray-200">
                            <p className="text-xs font-medium text-gray-400 mb-0.5">Replying to</p>
                            <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                                {originalComment}
                            </p>
                        </div>
                    )}

                    {/* Input Area - Clean Editor Style */}
                    <div className="relative group">
                        <Textarea
                            value={message}
                            onChange={(e) => {
                                setMessage(e.target.value);
                                if (usingAi && e.target.value !== aiSuggestion) setUsingAi(false);
                            }}
                            placeholder="Write your reply..."
                            className="min-h-[160px] w-full resize-none border-0 p-0 text-base text-gray-900 placeholder:text-gray-300 focus-visible:ring-0 leading-relaxed"
                            autoFocus
                        />

                        {/* AI Suggestion Button (Floating if suggestion exists) */}
                        {aiSuggestion && message !== aiSuggestion.trim() && (
                            <div className="absolute top-0 right-0">
                                <button
                                    onClick={handleUseAi}
                                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors text-xs font-medium"
                                >
                                    <Sparkles size={12} />
                                    <span>Use AI</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer - Minimal Actions */}
                <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-medium transition-colors ${isOverLimit ? 'text-red-500' :
                            isNearLimit ? 'text-amber-500' :
                                'text-gray-300'
                            }`}>
                            {characterCount} / {MAX_MESSAGE_LENGTH}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSending}
                            className="text-gray-500 hover:text-gray-900 hover:bg-transparent px-3 h-8 text-sm font-medium"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={isSending || !message.trim() || isOverLimit}
                            className="bg-gray-900 hover:bg-black text-white rounded-lg h-9 px-4 text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:shadow-none"
                        >
                            {isSending ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <span>Send Reply</span>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
