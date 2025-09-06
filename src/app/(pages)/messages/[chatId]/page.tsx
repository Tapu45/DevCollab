'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Phone,
  Video,
  Info,
  MoreVertical,
  Search,
  Paperclip,
  Smile,
  Send,
  Mic,
  MicOff,
  Image,
  File,
  Code,
  X,
  Check,
  CheckCheck,
  Clock,
  User,
  Settings,
  Shield,
  ShieldOff,
  Archive,
  Trash2,
  Reply,
  Heart,
  ThumbsUp,
  Laugh,
  Angry,
  SmileIcon as Sad,
  SquareParking as Surprised,
  Edit,
  MessageCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Loader from '@/components/shared/Loader';
import { Copy } from 'phosphor-react';
// Add the MessageSearch import
import MessageSearch from '../minicomponents/MessageSearch';
import { useAuth } from '@/context/AuthContext';

// Types
interface Chat {
  id: string;
  type: 'DIRECT' | 'GROUP' | 'PROJECT';
  name?: string;
  description?: string;
  avatarUrl?: string;
  participants: {
    id: string;
    userId: string;
    isAdmin: boolean;
    joinedAt: string;
    leftAt?: string | null;
    isActive: boolean;
    user: {
      id: string;
      username: string;
      displayName?: string;
      profilePictureUrl?: string;
      isOnline?: boolean;
      lastSeen?: string;
    };
  }[];
  settings?: {
    allowFileSharing: boolean;
    allowReactions: boolean;
    muteNotifications: boolean;
  };
}

interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'CODE' | 'SYSTEM';
  senderId: string;
  sender: {
    id: string;
    username: string;
    displayName?: string;
    profilePictureUrl?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    senderName: string;
  };
  attachments?: any[];
  reactions: {
    emoji: string;
    count: number;
    users: string[];
  }[];
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  readBy: {
    userId: string;
    readAt: string;
  }[];
  createdAt: string;
}

// API Functions - keep your existing ones
const fetchChat = async (chatId: string): Promise<{ chat: Chat }> => {
  const response = await fetch(`/api/messaging/chats/${chatId}`);
  if (!response.ok) throw new Error('Failed to fetch chat');
  return response.json();
};

const fetchMessages = async (chatId: string): Promise<Message[]> => {
  const response = await fetch(`/api/messaging/chats/${chatId}/messages`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  const data = await response.json();
  return data.messages ?? [];
};

const sendMessage = async (
  chatId: string,
  content: string,
  type: string = 'TEXT',
) => {
  const response = await fetch(`/api/messaging/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, type }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

const markAsRead = async (chatId: string) => {
  const response = await fetch(`/api/messaging/chats/${chatId}/read`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to mark as read');
  return response.json();
};

const addReaction = async (messageId: string, emoji: string) => {
  const response = await fetch(
    `/api/messages/messaging/${messageId}/reactions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ emoji }),
    },
  );
  if (!response.ok) throw new Error('Failed to add reaction');
  return response.json();
};

const deleteMessage = async (messageId: string) => {
  const response = await fetch(`/api/messaging/messages/${messageId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete message');
  return response.json();
};

// Helper Functions - keep your existing ones
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

const formatMessageTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

// Message Bubble Component - keep your existing one but add ref support
const MessageBubble = ({
  message,
  isOwn,
  showAvatar,
  isHighlighted = false,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  isHighlighted?: boolean;
}) => {
  const [showReactions, setShowReactions] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const queryClient = useQueryClient();

  const addReactionMutation = useMutation({
    mutationFn: ({ messageId, emoji }: { messageId: string; emoji: string }) =>
      addReaction(messageId, emoji),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message deleted');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete message');
    },
  });

  const handleReaction = (emoji: string) => {
    addReactionMutation.mutate({ messageId: message.id, emoji });
    setShowReactions(false);
  };

  const handleDelete = () => {
    deleteMessageMutation.mutate(message.id);
    setShowMenu(false);
  };

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😮'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? 'mt-4' : 'mt-1'} ${
        isHighlighted
          ? 'bg-yellow-100 dark:bg-yellow-900/20 p-2 rounded-lg'
          : ''
      }`}
      id={`message-${message.id}`}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
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

      {/* Message Content */}
      <div
        className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}
      >
        {/* Sender Name */}
        {showAvatar && !isOwn && (
          <span className="text-xs text-muted-foreground mb-1">
            {message.sender.displayName || message.sender.username}
          </span>
        )}

        {/* Message Bubble */}
        <div
          className={`relative group rounded-2xl px-4 py-2 ${
            isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted text-foreground'
          }`}
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
          {message.type === 'TEXT' && (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}

          {message.type === 'IMAGE' && (
            <div className="space-y-2">
              <img
                src={message.content}
                alt="Shared image"
                className="max-w-full h-auto rounded-lg"
              />
            </div>
          )}

          {message.type === 'FILE' && (
            <div className="flex items-center gap-2 p-2 bg-background/20 rounded-lg">
              <File className="w-4 h-4" />
              <span className="text-sm">{message.content}</span>
            </div>
          )}

          {message.type === 'CODE' && (
            <pre className="bg-background/20 p-2 rounded-lg text-xs overflow-x-auto">
              <code>{message.content}</code>
            </pre>
          )}

          {/* Message Status */}
          <div className="flex items-center gap-1 mt-1">
            <span className="text-xs opacity-70">
              {formatMessageTime(message.createdAt)}
            </span>
            {isOwn && (
              <div className="flex items-center">
                {(message.readBy?.length ?? 0) > 1 ? (
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
                  onClick={() => handleReaction(reaction.emoji)}
                >
                  {reaction.emoji} {reaction.count}
                </Button>
              ))}
            </div>
          )}

          {/* Message Actions */}
          <div
            className={`absolute top-0 ${isOwn ? '-left-20' : '-right-20'} opacity-0 group-hover:opacity-100 transition-opacity`}
          >
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? 'end' : 'start'}>
                <DropdownMenuItem onClick={() => setShowReactions(true)}>
                  <Smile className="w-4 h-4 mr-2" />
                  Add Reaction
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Reply className="w-4 h-4 mr-2" />
                  Reply
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </DropdownMenuItem>
                {isOwn && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      className="text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Quick Reactions */}
        {showReactions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-1 mt-2 bg-background border border-border rounded-full p-1 shadow-lg"
          >
            {quickReactions.map((emoji) => (
              <Button
                key={emoji}
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-muted"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// Main Component
export default function ChatPage() {
  const { chatId } = useParams();
  const searchParams = useSearchParams();
  const highlightMessageId = searchParams.get('messageId'); // Get highlighted message from URL

  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  const router = useRouter();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();

  // Queries
  const { data: chatData, isLoading: loadingChat } = useQuery({
    queryKey: ['chat', chatId],
    queryFn: () => fetchChat(chatId as string),
    enabled: !!chatId,
  });

  const chat = chatData?.chat;

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', chatId],
    queryFn: () => fetchMessages(chatId as string),
    enabled: !!chatId,
    refetchInterval: 5000,
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({ content, type }: { content: string; type: string }) =>
      sendMessage(chatId as string, content, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', chatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setNewMessage('');
      setReplyTo(null);
      scrollToBottom();
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: () => markAsRead(chatId as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  // Effects
  useEffect(() => {
    if (chatId) {
      markAsReadMutation.mutate();
    }
  }, [chatId]);

  // Scroll to highlighted message from search
  useEffect(() => {
    if (highlightMessageId && messages.length > 0) {
      const timer = setTimeout(() => {
        const messageElement = document.getElementById(
          `message-${highlightMessageId}`,
        );
        if (messageElement) {
          messageElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });
          // Add temporary highlight effect
          messageElement.classList.add('ring-2', 'ring-yellow-400');
          setTimeout(() => {
            messageElement.classList.remove('ring-2', 'ring-yellow-400');
          }, 3000);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [highlightMessageId, messages]);

  // Handlers
  const handleSendMessage = () => {
    if (!newMessage.trim() || !chatId) return;

    sendMessageMutation.mutate({
      content: newMessage.trim(),
      type: 'TEXT',
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (file: File) => {
    // Handle file upload logic
    toast.info('File upload feature coming soon');
  };

  const handleVoiceMessage = () => {
    // Handle voice message logic
    toast.info('Voice message feature coming soon');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Handle message selection from search
  const handleMessageSelect = (messageId: string, selectedChatId: string) => {
    if (selectedChatId === chatId) {
      // Same chat, just scroll to message
      const messageElement = document.getElementById(`message-${messageId}`);
      if (messageElement) {
        messageElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
        });
        // Add highlight effect
        messageElement.classList.add('ring-2', 'ring-yellow-400');
        setTimeout(() => {
          messageElement.classList.remove('ring-2', 'ring-yellow-400');
        }, 3000);
      }
    } else {
      // Different chat, navigate there
      router.push(`/messages/${selectedChatId}?messageId=${messageId}`);
    }
  };

  if (loadingChat) {
    return <Loader />;
  }

  if (!chat) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Chat not found
          </h3>
          <p className="text-muted-foreground mb-4">
            The chat you're looking for doesn't exist.
          </p>
          <Button onClick={() => router.push('/messages')}>
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Loader />; // or any fallback UI
  }

  const isDirect = chat.type === 'DIRECT';
  let otherParticipant = null;

  if (isDirect && user?.id) {
    otherParticipant = chat.participants.find((p) => p.user?.id !== user.id);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex flex-col h-screen">
        {/* Chat Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/messages')}
                className="lg:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>

              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={
                    isDirect
                      ? otherParticipant?.user?.profilePictureUrl || ''
                      : chat.avatarUrl || ''
                  }
                  alt={
                    isDirect
                      ? otherParticipant?.user?.displayName ||
                        otherParticipant?.user?.username ||
                        ''
                      : chat.name || ''
                  }
                />
                <AvatarFallback>
                  {isDirect
                    ? otherParticipant?.user?.displayName?.charAt(0) ||
                      otherParticipant?.user?.username?.charAt(0) ||
                      '?'
                    : chat.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>

              <div>
                <h2 className="font-semibold text-foreground">
                  {isDirect
                    ? otherParticipant?.user?.displayName ||
                      otherParticipant?.user?.username ||
                      '?'
                    : chat.name || '?'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isDirect
                    ? otherParticipant?.user?.isOnline
                      ? 'Online'
                      : 'Last seen recently'
                    : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Add MessageSearch component here */}
              <MessageSearch
                onMessageSelect={handleMessageSelect}
                defaultChatId={chatId as string}
              />
              <Button size="sm" variant="ghost">
                <Phone className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Video className="w-4 h-4" />
              </Button>
              <Button size="sm" variant="ghost">
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {loadingMessages ? (
              <div className="flex justify-center items-center h-32">
                <Loader />
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((message, index) => {
                  const prevMessage = messages[index - 1];
                  const showAvatar =
                    !prevMessage || prevMessage.senderId !== message.senderId;
                  const isOwn = message.senderId === user.id;
                  const isHighlighted = highlightMessageId === message.id;

                  return (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isOwn={isOwn}
                      showAvatar={showAvatar}
                      isHighlighted={isHighlighted}
                    />
                  );
                })}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
          {/* Reply Context */}
          {replyTo && (
            <div className="mb-3 p-3 bg-muted/50 rounded-lg border-l-4 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Replying to{' '}
                    {replyTo.sender.displayName || replyTo.sender.username}
                  </p>
                  <p className="text-sm truncate">{replyTo.content}</p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyTo(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="flex items-end gap-2">
            <div className="flex-1 relative">
              <div className="flex items-center gap-2 mb-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowFilePicker(!showFilePicker)}
                >
                  <Paperclip className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                >
                  <Smile className="w-4 h-4" />
                </Button>
              </div>

              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full min-h-[40px] max-h-32 p-3 border border-input rounded-lg resize-none focus:ring-2 focus:ring-ring focus:border-transparent"
                rows={1}
              />
            </div>

            <div className="flex items-center gap-2">
              {isRecording ? (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setIsRecording(false)}
                >
                  <MicOff className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsRecording(true)}
                >
                  <Mic className="w-4 h-4" />
                </Button>
              )}

              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
