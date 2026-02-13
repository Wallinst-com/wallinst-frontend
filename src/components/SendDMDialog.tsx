import { useState, useEffect } from 'react';
import { Loader2, Sparkles, X, Send, User } from 'lucide-react';
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
            <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border border-gray-200 shadow-2xl rounded-xl bg-white focus:outline-none animate-in fade-in zoom-in-95 duration-200">

                {/* Header - Structure: Gray Background + Border */}
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {/* Avatar Ring */}
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-600 border border-gray-200 shadow-sm overflow-hidden">
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt={engager.username} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{initials}</span>
                                )}
                            </div>
                            {platform === 'instagram' ? (
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-1 rounded-full border-2 border-white" title="Instagram">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0" />
                                </div>
                            ) : (
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1 rounded-full border-2 border-white" title="Facebook">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0" />
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-tight">
                                {engager.username}
                            </h2>
                            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-0.5">
                                <span className={platform === 'instagram' ? 'text-pink-600' : 'text-blue-600'}>
                                    {platform === 'facebook' ? 'Facebook User' : 'Instagram User'}
                                </span>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content - Structure: Padding + Stack */}
                <div className="p-6 space-y-5 bg-white">

                    {/* Context Box - Structure: Defined Card */}
                    {originalComment && (
                        <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 flex gap-3 items-start">
                            <div className="mt-1 w-1 h-full min-h-[24px] bg-blue-400 rounded-full shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-blue-700 mb-1 uppercase tracking-wide">
                                    Replying to comment
                                </p>
                                <p className="text-sm text-gray-700 leading-relaxed font-medium">
                                    "{originalComment}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Editor Container - Structure: Bordered Input Box */}
                    <div className="flex flex-col border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm">

                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                            placeholder={`Write a public reply to ${engager.username}...`}
                            className="min-h-[140px] w-full resize-none border-0 bg-transparent p-4 text-base text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 leading-relaxed"
                            autoFocus
                        />

                        {/* Editor Toolbar - Structure: Gray Footer in Input */}
                        <div className="bg-gray-50 px-3 py-2 border-t border-gray-200 flex items-center justify-between">

                            {/* Left: Tools */}
                            <div className="flex items-center gap-2">
                                {aiSuggestion && message !== aiSuggestion.trim() ? (
                                    <button
                                        onClick={handleUseAi}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white border border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all text-xs font-semibold shadow-sm group"
                                    >
                                        <Sparkles size={14} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                                        <span>Insert AI Suggestion</span>
                                    </button>
                                ) : (
                                    <span className="text-xs text-gray-400 font-medium px-2">
                                        Type your message...
                                    </span>
                                )}
                            </div>

                            {/* Right: Counter */}
                            <span className={`text-xs font-semibold tabular-nums ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-400'
                                }`}>
                                {characterCount} / {MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer - Structure: Distinct Separation */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        disabled={isSending}
                        className="text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 font-semibold"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={isSending || !message.trim() || isOverLimit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 font-bold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:shadow-none disabled:translate-y-0 flex items-center gap-2"
                    >
                        {isSending ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Sending...</span>
                            </>
                        ) : (
                            <>
                                <span>Send Reply</span>
                                <Send size={16} className="ml-0.5 opacity-90" />
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
