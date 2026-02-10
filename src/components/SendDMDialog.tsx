import React, { useState, useEffect } from 'react';
import { Send, Loader2, MessageSquare, Sparkles, X, Quote } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden border-0 shadow-2xl rounded-2xl bg-white/95 backdrop-blur-xl">
        {/* Header Background with Gradient */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 z-0 pointer-events-none" />
        
        {/* Header */}
        <div className="relative z-10 p-6 pb-2">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white">
                            <Send size={20} />
                        </div>
                        {platform === 'facebook' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-[10px] font-bold text-white">f</span>
                            </div>
                        )}
                         {platform === 'instagram' && (
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 rounded-full border-2 border-white flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">IG</span>
                            </div>
                        )}
                    </div>
                    <div>
                        <DialogTitle className="text-xl font-bold text-gray-900">
                            {platform === 'facebook' ? 'Reply to Comment' : 'Send Direct Message'}
                        </DialogTitle>
                        <DialogDescription className="text-sm text-gray-500 mt-1">
                            Replying to <span className="font-semibold text-indigo-600">@{engager.username}</span>
                        </DialogDescription>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full transition-colors"
                >
                    <X size={20} />
                </button>
            </div>
        </div>

        {/* Content */}
        <div className="relative z-10 px-6 py-4 space-y-6">
            
            {/* Context Card (Original Comment) */}
            {originalComment && (
                <div className="relative pl-4 border-l-4 border-indigo-200 py-1">
                     <div className="flex items-center gap-2 mb-1.5">
                        <MessageSquare size={14} className="text-indigo-500" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Their Comment</span>
                    </div>
                    <p className="text-sm text-gray-700 italic leading-relaxed">
                        "{originalComment}"
                    </p>
                </div>
            )}

            {/* Input Area */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold text-gray-900">Your Message</Label>
                    
                    {aiSuggestion && message !== aiSuggestion.trim() && (
                        <button 
                            onClick={handleUseAi}
                            className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-all"
                        >
                            <Sparkles size={12} className="group-hover:animate-pulse" />
                            Use AI Suggestion
                        </button>
                    )}
                     {usingAi && message === aiSuggestion?.trim() && (
                        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-purple-500/10 text-indigo-600 text-xs font-semibold">
                            <Sparkles size={12} />
                            AI Suggestion Applied
                        </span>
                    )}
                </div>

                <div className="relative group">
                    <Textarea 
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            if (usingAi && e.target.value !== aiSuggestion) setUsingAi(false);
                        }}
                        placeholder="Type your personal message here..."
                        className="min-h-[140px] resize-none text-base p-4 rounded-xl border-gray-200 bg-gray-50/50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-300"
                    />
                    
                    {/* Character Counter */}
                    <div className="absolute bottom-3 right-3 flex items-center gap-2 pointer-events-none">
                         <span className={`text-xs font-medium px-2 py-1 rounded-md transition-colors ${
                            isOverLimit ? 'bg-red-100 text-red-600' : 
                            isNearLimit ? 'bg-amber-100 text-amber-600' : 
                            'bg-gray-100 text-gray-500'
                        }`}>
                            {MAX_MESSAGE_LENGTH - characterCount}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 px-6 py-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between backdrop-blur-sm">
            <p className="text-xs text-gray-500 font-medium">
                <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-2" />
                Ready to send
            </p>
            <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    onClick={onClose}
                    disabled={isSending}
                    className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                    Cancel
                </Button>
                <Button 
                    onClick={handleSend}
                    disabled={isSending || !message.trim() || isOverLimit}
                    className="bg-gray-900 hover:bg-gray-800 text-white min-w-[120px] shadow-lg shadow-gray-900/20 active:scale-95 transition-all"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Now
                        </>
                    )}
                </Button>
            </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
