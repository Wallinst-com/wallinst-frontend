import { useState, useEffect } from 'react';
import { Loader2, Sparkles, X, Send } from 'lucide-react';
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

const TEMPLATES = [
    { label: 'Introduction', content: "Hi {{name}}, I noticed you're interested in {{topic}}. I'd love to share more details!" },
    { label: 'Demo Offer', content: "Hey {{name}}, thanks for your comment! Would you be open to a quick demo of how this works?" },
    { label: 'Follow-up', content: "Hi {{name}}, just following up on your question about {{topic}}. Let me know if you need anything else!" },
    { label: 'Answer Question', content: "Great question, {{name}}! Regarding {{topic}}, the short answer is yes. Here are the details..." },
    { label: 'Pricing Info', content: "Hello {{name}}, I can definitely help with pricing for {{topic}}. Our plans start at..." },
];

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

    // Reset or Initialize
    useEffect(() => {
        if (isOpen) {
            setMessage('');
        }
    }, [isOpen]);

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

    const applyTemplate = (templateContent: string) => {
        const personalized = templateContent
            .replace('{{name}}', engager.username?.split(' ')[0] || engager.fullName?.split(' ')[0] || 'there')
            .replace('{{topic}}', 'your request'); // Placeholder topic
        setMessage(personalized);
    };

    const handleUseAi = () => {
        if (aiSuggestion) {
            setMessage(aiSuggestion.trim());
        }
    };

    const characterCount = message.length;
    const isOverLimit = characterCount > MAX_MESSAGE_LENGTH;
    const isNearLimit = characterCount > MESSAGE_WARNING_THRESHOLD;

    // Intents
    const intentColor =
        engager.aiIntentLabel === 'High' ? 'bg-green-100 text-green-700 border-green-200' :
            engager.aiIntentLabel === 'Medium' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                'bg-gray-100 text-gray-600 border-gray-200';

    return (
        <Dialog open={isOpen} onOpenChange={(open: boolean) => !open && onClose()}>
            <DialogContent className="sm:max-w-[650px] p-0 gap-0 overflow-hidden border border-gray-200 shadow-2xl rounded-xl bg-white focus:outline-none animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">

                {/* 1. HEADER (Fixed) */}
                <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img
                                src={engager.profilePictureUrl || `https://ui-avatars.com/api/?name=${engager.username}`}
                                alt={engager.username}
                                className="w-10 h-10 rounded-full object-cover ring-1 ring-gray-200"
                            />
                            {platform === 'instagram' ? (
                                <div className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-1 rounded-full border-2 border-slate-50" title="Instagram">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0" />
                                </div>
                            ) : (
                                <div className="absolute -bottom-1 -right-1 bg-blue-600 p-1 rounded-full border-2 border-slate-50" title="Facebook">
                                    <div className="w-1.5 h-1.5 bg-white rounded-full opacity-0" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-gray-900 leading-tight">Send Message</h2>
                            <p className="text-sm text-gray-600">@{engager.username}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200/50 rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* 2. ENGAGER INFO SECTION (Fixed) */}
                <div className="bg-gray-50/80 px-6 py-3 border-b border-gray-200 shrink-0 space-y-3">
                    <div className="flex items-center gap-2">
                        {engager.aiIntentLabel && (
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${intentColor}`}>
                                {engager.aiIntentLabel} Intent
                            </span>
                        )}
                        {engager.aiPersona && (
                            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
                                <Sparkles size={10} className="text-purple-500" />
                                {engager.aiPersona}
                            </span>
                        )}
                    </div>
                    {originalComment && (
                        <div className="bg-white border border-gray-200 rounded-md p-3 shadow-sm">
                            <p className="text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wider">Recent Comment:</p>
                            <p className="text-sm text-gray-700 italic leading-relaxed">"{originalComment}"</p>
                        </div>
                    )}
                </div>

                {/* 3. MAIN CONTENT (Scrollable) */}
                <div className="p-6 space-y-4 overflow-y-auto flex-1">
                    {/* A. AI Templates */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-2">
                            <Sparkles size={14} className="text-purple-600" />
                            <span className="text-sm font-semibold text-gray-900">AI Templates</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {aiSuggestion && (
                                <button
                                    onClick={handleUseAi}
                                    className="px-3 py-1.5 rounded-md text-xs font-medium border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors"
                                >
                                    Use AI Suggestion
                                </button>
                            )}
                            {TEMPLATES.map((t) => (
                                <button
                                    key={t.label}
                                    onClick={() => applyTemplate(t.content)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${message === t.content.replace('{{name}}', engager.username?.split(' ')[0] || engager.fullName?.split(' ')[0] || 'there').replace('{{topic}}', 'your request')
                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {t.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* B. Message Input */}
                    <div className="space-y-1">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value.slice(0, MAX_MESSAGE_LENGTH))}
                            placeholder={`Write your message to ${engager.username || 'User'}...`}
                            className="w-full h-48 resize-none border-gray-300 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 rounded-lg p-4 text-base text-gray-900 placeholder:text-gray-400"
                            autoFocus
                        />
                        <div className="flex justify-between items-center px-1">
                            <span className="text-xs text-gray-400">
                                Message will be sent as a private reply
                            </span>
                            <span className={`text-xs font-medium transition-colors ${isOverLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-gray-400'
                                }`}>
                                {characterCount} / {MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 4. FOOTER (Fixed) */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
                    <p className="text-xs text-gray-400 max-w-[200px] leading-tight hidden sm:block">
                        Messages are sent via {platform === 'facebook' ? 'Facebook' : 'Instagram'} Graph API.
                    </p>
                    <div className="flex gap-3 ml-auto">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            disabled={isSending}
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-200/50"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSend}
                            disabled={isSending || !message.trim() || isOverLimit}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 font-semibold shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:translate-y-0"
                        >
                            {isSending ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Sending...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span>Send Message</span>
                                    <Send size={16} />
                                </div>
                            )}
                        </Button>
                    </div>
                </div>

            </DialogContent>
        </Dialog>
    );
}
