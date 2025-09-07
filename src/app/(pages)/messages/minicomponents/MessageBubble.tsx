import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Check, CheckCheck, Loader2 } from 'lucide-react';
import { Message } from '@/types/Message';

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  if (diff < 604800000) return `${Math.floor(diff / 86400000)}d`;
  return date.toLocaleDateString();
};

export default function MessageBubble({
  message,
  isOwn,
  showAvatar,
  isGrouped = false,
  isFirst = true,
  isLast = true,
  isSending = false, // <-- New prop
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  isGrouped?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
  isSending?: boolean; // <-- New prop
}) {
  const [showReactions, setShowReactions] = useState(false);
   if (!message.sender) {
     return (
       <div className="text-xs text-muted-foreground">
         Message sender not available.
       </div>
     );
   }

  // Compute dynamic bubble classes for grouping
  const bubbleRadius = isGrouped
    ? isOwn
      ? `${isFirst ? 'rounded-tr-2xl' : 'rounded-tr-md'} ${isLast ? 'rounded-br-2xl' : 'rounded-br-md'} rounded-tl-2xl rounded-bl-2xl`
      : `${isFirst ? 'rounded-tl-2xl' : 'rounded-tl-md'} ${isLast ? 'rounded-bl-2xl' : 'rounded-bl-md'} rounded-tr-2xl rounded-br-2xl`
    : 'rounded-2xl';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
    >
      {/* Avatar Spacer (always present for alignment, even if avatar is hidden) */}
      {!isOwn && (
        <div className="w-10 flex-shrink-0 flex items-start">
          {showAvatar && (
            <Avatar className="h-8 w-8 mt-1">
              <AvatarImage
                src={message.sender.profilePictureUrl || ''}
                alt={message.sender.displayName || message.sender.username}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {message.sender.displayName?.charAt(0) ||
                  message.sender.username.charAt(0)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      )}

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}
      >
        {/* Sender Name */}
        {/* {showAvatar && !isOwn && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.displayName || message.sender.username}
          </span>
        )} */}

        {/* Message Bubble */}
        <div
          className={`relative group px-4 py-2 ${bubbleRadius} ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          } ${isSending ? 'opacity-70' : ''}`} // <-- Dim while sending
          onDoubleClick={() => setShowReactions(!showReactions)}
        >
          {/* Reply Context */}
          {message.replyTo && (
            <div
              className={`mb-2 p-2 rounded-lg border-l-4 ${
                isOwn
                  ? 'bg-primary-foreground/20 border-primary-foreground'
                  : 'bg-muted-foreground/10 border-muted-foreground'
              }`}
            >
              <p className="text-xs font-medium">
                {message.replyTo.senderName}
              </p>
              <p className="text-xs truncate">{message.replyTo.content}</p>
            </div>
          )}

          {/* Message Content */}
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>

          {/* Message Status */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs opacity-70">
              {formatTime(message.createdAt)}
            </span>
            {isOwn && (
              <div className="flex items-center">
                {isSending ? (
                  <Loader2 className="w-3 h-3 animate-spin" /> // <-- Spinner while sending
                ) : (message.readBy?.length ?? 0) > 1 ? (
                  <CheckCheck className="w-3 h-3" />
                ) : (
                  <Check className="w-3 h-3" />
                )}
              </div>
            )}
            {message.isEdited && (
              <span className="text-xs opacity-70 italic">edited</span>
            )}
          </div>

          {/* Reactions */}
          {message.reactions.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {message.reactions.map((reaction, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant="ghost"
                  className="h-6 px-2 text-xs"
                  onClick={() => {
                    /* Handle reaction */
                  }}
                >
                  {reaction.emoji} {reaction.count}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
