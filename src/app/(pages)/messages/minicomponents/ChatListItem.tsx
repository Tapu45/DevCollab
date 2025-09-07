import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Pin,
  PinOff,
  Shield,
  ShieldOff,
  Archive,
  Trash2,
  MoreVertical,
  Users,
  Hash,
  MessageCircle,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';

const getChatTypeIcon = (type: string) => {
  switch (type) {
    case 'DIRECT':
      return <MessageCircle className="w-4 h-4" />;
    case 'GROUP':
      return <Users className="w-4 h-4" />;
    case 'PROJECT':
      return <Hash className="w-4 h-4" />;
    default:
      return <MessageCircle className="w-4 h-4" />;
  }
};

export default function ChatListItem({
  chat,
  isSelected,
  onSelect,
  onPin,
  onArchive,
  onMute,
  currentUserId,
}: {
  chat: any;
  isSelected: boolean;
  onSelect: () => void;
  onPin: () => void;
  onArchive: () => void;
  onMute: () => void;
  currentUserId: string | undefined;
}) {
  const otherParticipant = chat.participants.find(
    (p: any) => p.id !== currentUserId,
  );

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'bg-primary/10 border-l-4 border-primary'
          : 'hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
            <AvatarImage
              src={chat.avatarUrl || otherParticipant?.profilePictureUrl || ''}
              alt={
                chat.name ||
                otherParticipant?.displayName ||
                otherParticipant?.username ||
                ''
              }
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {chat.name
                ? chat.name.charAt(0).toUpperCase()
                : otherParticipant?.displayName?.charAt(0).toUpperCase() ||
                  otherParticipant?.username?.charAt(0).toUpperCase() ||
                  '?'}
            </AvatarFallback>
          </Avatar>
          {otherParticipant?.isOnline && (
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-background rounded-full"></div>
          )}
        </div>

        {/* Chat Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-foreground truncate">
                {chat.name ||
                  otherParticipant?.displayName ||
                  otherParticipant?.username}
              </h3>
              {chat.isPinned && <Pin className="w-3 h-3 text-primary" />}
              {chat.isMuted && (
                <Shield className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <div className="flex items-center gap-1">
              {/* {chat.lastMessage && (
                <span className="text-xs text-muted-foreground">
                  {chat.lastMessage.createdAt}
                </span>
              )} */}
              {chat.unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className="text-sm text-muted-foreground truncate">
              {chat.lastMessage ? (
                <>
                  <span className="font-medium">
                    {chat.lastMessage.senderName}:
                  </span>{' '}
                  {chat.lastMessage.content}
                </>
              ) : (
                'No messages yet'
              )}
            </p>
            <div className="flex items-center gap-1">
              {getChatTypeIcon(chat.type)}
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    size="sm"
                    variant="ghost"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onPin}>
                    {chat.isPinned ? (
                      <PinOff className="w-4 h-4 mr-2" />
                    ) : (
                      <Pin className="w-4 h-4 mr-2" />
                    )}
                    {chat.isPinned ? 'Unpin' : 'Pin'} Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMute}>
                    {chat.isMuted ? (
                      <ShieldOff className="w-4 h-4 mr-2" />
                    ) : (
                      <Shield className="w-4 h-4 mr-2" />
                    )}
                    {chat.isMuted ? 'Unmute' : 'Mute'} Chat
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onArchive}>
                    <Archive className="w-4 h-4 mr-2" />
                    Archive Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-destructive">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Chat
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}