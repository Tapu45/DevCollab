'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, 
  Search, 
  Plus, 
  MoreVertical,
  Phone,
  Video,
  Info,
  Settings,
  Archive,
  Trash2,
  Star,
  StarOff,
  Pin,
  PinOff,
  Users,
  Hash,
  Paperclip,
  Smile,
  Send,
  Image,
  File,
  Code,
  Mic,
  MicOff,
  X,
  Check,
  CheckCheck,
  Clock,
  AlertCircle,
  UserPlus,
  Shield,
  ShieldOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import Loader from '@/components/shared/Loader';

// Types
interface Chat {
  id: string;
  type: 'DIRECT' | 'GROUP' | 'PROJECT';
  name?: string;
  description?: string;
  avatarUrl?: string;
  lastMessage?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    createdAt: string;
    type: string;
  };
  participants: {
    id: string;
    username: string;
    displayName?: string;
    profilePictureUrl?: string;
    isOnline: boolean;
    lastSeen?: string;
  }[];
  unreadCount: number;
  isPinned: boolean;
  isArchived: boolean;
  isMuted: boolean;
  createdAt: string;
  updatedAt: string;
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

// API Functions
const fetchChats = async (): Promise<Chat[]> => {
  const response = await fetch('/api/messages/chats');
  if (!response.ok) throw new Error('Failed to fetch chats');
  return response.json();
};

const fetchMessages = async (chatId: string): Promise<Message[]> => {
  const response = await fetch(`/api/messages/chats/${chatId}/messages`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  return response.json();
};

const sendMessage = async (chatId: string, content: string, type: string = 'TEXT') => {
  const response = await fetch(`/api/messages/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, type }),
  });
  if (!response.ok) throw new Error('Failed to send message');
  return response.json();
};

const markAsRead = async (chatId: string) => {
  const response = await fetch(`/api/messages/chats/${chatId}/read`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to mark as read');
  return response.json();
};

// Helper Functions
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

const getChatTypeIcon = (type: string) => {
  switch (type) {
    case 'DIRECT': return <MessageCircle className="w-4 h-4" />;
    case 'GROUP': return <Users className="w-4 h-4" />;
    case 'PROJECT': return <Hash className="w-4 h-4" />;
    default: return <MessageCircle className="w-4 h-4" />;
  }
};

// Chat List Item Component
const ChatListItem = ({ 
  chat, 
  isSelected, 
  onSelect, 
  onPin, 
  onArchive, 
  onMute 
}: {
  chat: Chat;
  isSelected: boolean;
  onSelect: () => void;
  onPin: () => void;
  onArchive: () => void;
  onMute: () => void;
}) => {
  const otherParticipant = chat.participants.find(p => p.id !== 'current-user');
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={`group cursor-pointer transition-all duration-200 ${
        isSelected ? 'bg-primary/10 border-l-4 border-primary' : 'hover:bg-muted/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-background shadow-md">
            <AvatarImage 
              src={chat.avatarUrl || otherParticipant?.profilePictureUrl || ''} 
              alt={chat.name || otherParticipant?.displayName || otherParticipant?.username || ''} 
            />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {chat.name ? chat.name.charAt(0).toUpperCase() : 
               otherParticipant?.displayName?.charAt(0).toUpperCase() || 
               otherParticipant?.username?.charAt(0).toUpperCase() || '?'}
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
                {chat.name || otherParticipant?.displayName || otherParticipant?.username}
              </h3>
              {chat.isPinned && <Pin className="w-3 h-3 text-primary" />}
              {chat.isMuted && <Shield className="w-3 h-3 text-muted-foreground" />}
            </div>
            <div className="flex items-center gap-1">
              {chat.lastMessage && (
                <span className="text-xs text-muted-foreground">
                  {formatTime(chat.lastMessage.createdAt)}
                </span>
              )}
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
                  <span className="font-medium">{chat.lastMessage.senderName}:</span> {chat.lastMessage.content}
                </>
              ) : (
                'No messages yet'
              )}
            </p>
            <div className="flex items-center gap-1">
              {getChatTypeIcon(chat.type)}
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" className="opacity-0 group-hover:opacity-100">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onPin}>
                    {chat.isPinned ? <PinOff className="w-4 h-4 mr-2" /> : <Pin className="w-4 h-4 mr-2" />}
                    {chat.isPinned ? 'Unpin' : 'Pin'} Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={onMute}>
                    {chat.isMuted ? <ShieldOff className="w-4 h-4 mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
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
};

// Message Bubble Component
const MessageBubble = ({ message, isOwn, showAvatar }: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
}) => {
  const [showReactions, setShowReactions] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'} ${showAvatar ? 'mt-4' : 'mt-1'}`}
    >
      {/* Avatar */}
      {showAvatar && !isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage src={message.sender.profilePictureUrl || ''} alt={message.sender.displayName || message.sender.username} />
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {message.sender.displayName?.charAt(0) || message.sender.username.charAt(0)}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Message Content */}
      <div className={`flex flex-col max-w-[70%] ${isOwn ? 'items-end' : 'items-start'}`}>
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
            <div className={`mb-2 p-2 rounded-lg border-l-4 ${
              isOwn ? 'bg-primary-foreground/20 border-primary-foreground' : 'bg-muted-foreground/10 border-muted-foreground'
            }`}>
              <p className="text-xs font-medium">{message.replyTo.senderName}</p>
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
                {message.readBy.length > 1 ? (
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
                  onClick={() => {/* Handle reaction */}}
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
};

// Main Component
export default function MessagesPage() {
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  const router = useRouter();
  const queryClient = useQueryClient();

  // Queries
  const { data: chats = [], isLoading: loadingChats } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
    refetchInterval: 30000,
  });

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedChatId],
    queryFn: () => selectedChatId ? fetchMessages(selectedChatId) : Promise.resolve([]),
    enabled: !!selectedChatId,
    refetchInterval: 5000,
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({ chatId, content, type }: { chatId: string; content: string; type: string }) =>
      sendMessage(chatId, content, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', selectedChatId] });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      setNewMessage('');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send message');
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
  });

  // Handlers
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatId) return;
    
    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: newMessage.trim(),
      type: 'TEXT'
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (chatId: string) => {
    setSelectedChatId(chatId);
    markAsReadMutation.mutate(chatId);
  };

  const selectedChat = chats.find(chat => chat.id === selectedChatId);
  const filteredChats = chats.filter(chat =>
    chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    chat.participants.some(p => 
      p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.username.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loadingChats) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex h-screen">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                Messages
              </h1>
              <Button size="sm" variant="outline" onClick={() => router.push('/messages/new')}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Chat List */}
          <ScrollArea className="flex-1">
            <div className="space-y-1">
              <AnimatePresence>
                {filteredChats.map((chat) => (
                  <ChatListItem
                    key={chat.id}
                    chat={chat}
                    isSelected={selectedChatId === chat.id}
                    onSelect={() => handleChatSelect(chat.id)}
                    onPin={() => {/* Handle pin */}}
                    onArchive={() => {/* Handle archive */}}
                    onMute={() => {/* Handle mute */}}
                  />
                ))}
              </AnimatePresence>
            </div>
          </ScrollArea>
        </div>

        {/* Chat Window */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={selectedChat.avatarUrl || selectedChat.participants[0]?.profilePictureUrl || ''} 
                        alt={selectedChat.name || selectedChat.participants[0]?.displayName || ''} 
                      />
                      <AvatarFallback>
                        {selectedChat.name?.charAt(0) || selectedChat.participants[0]?.displayName?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {selectedChat.name || selectedChat.participants[0]?.displayName || selectedChat.participants[0]?.username}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.participants[0]?.isOnline ? 'Online' : 'Last seen recently'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
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
                        const showAvatar = !prevMessage || prevMessage.senderId !== message.senderId;
                        const isOwn = message.senderId === 'current-user';
                        
                        return (
                          <MessageBubble
                            key={message.id}
                            message={message}
                            isOwn={isOwn}
                            showAvatar={showAvatar}
                          />
                        );
                      })}
                    </AnimatePresence>
                  )}
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-end gap-2">
                  <div className="flex-1 relative">
                    <div className="flex items-center gap-2">
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
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">Choose a chat to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}