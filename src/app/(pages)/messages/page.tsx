'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {MessageCircle,Search,Plus,Phone,Video,Info,Paperclip,Smile,Send,Mic,MicOff,} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { useRouter, useSearchParams } from 'next/navigation';
import Loader from '@/components/shared/Loader';
import MessageSearch from './minicomponents/MessageSearch';
import GroupChatManager from './minicomponents/GroupChatManager';
import { useAuth } from '@/context/AuthContext';
import { Chat, Message } from '@/types/Message';
import ChatListItem from './minicomponents/ChatListItem';
import MessageBubble from './minicomponents/MessageBubble';

const fetchChats = async (): Promise<{ chats: Chat[] }> => {
  const response = await fetch('/api/messaging/chats');
  if (!response.ok) throw new Error('Failed to fetch chats');
  return response.json();
};

const fetchMessages = async (chatId: string): Promise<Message[]> => {
  const response = await fetch(`/api/messaging/chats/${chatId}/messages`);
  if (!response.ok) throw new Error('Failed to fetch messages');
  const data = await response.json();
  return data.messages; // <-- Extract the array
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

export default function MessagesPage() {
  const searchParams = useSearchParams();
  const chatIdFromQuery = searchParams.get('chat');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(
    chatIdFromQuery,
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFilePicker, setShowFilePicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const router = useRouter();
  const queryClient = useQueryClient();

  const { user } = useAuth();
  const currentUserId = user?.id;

  // Queries
  const {
    data,
    isLoading: loadingChats,
    error: chatsError,
  } = useQuery({
    queryKey: ['chats'],
    queryFn: fetchChats,
    refetchInterval: 30000,
  });
  const chats = data?.chats || [];

  useEffect(() => {
    console.log('Fetched chats:', chats);
  }, [chats]);

  useEffect(() => {
    if (chatsError) {
      console.error('Error fetching chats:', chatsError);
      toast.error('Failed to load conversations');
    }
  }, [chatsError]);

  useEffect(() => {
    if (chatIdFromQuery && chatIdFromQuery !== selectedChatId) {
      setSelectedChatId(chatIdFromQuery);
    }
  }, [chatIdFromQuery]);

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedChatId],
    queryFn: () =>
      selectedChatId ? fetchMessages(selectedChatId) : Promise.resolve([]),
    enabled: !!selectedChatId,
    refetchInterval: 5000,
  });

  // Mutations
  const sendMessageMutation = useMutation({
    mutationFn: ({
      chatId,
      content,
      type,
    }: {
      chatId: string;
      content: string;
      type: string;
    }) => sendMessage(chatId, content, type),
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
      type: 'TEXT',
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

  // NEW: Handle message selection from search
  const handleMessageSelect = (messageId: string, chatId: string) => {
    // Navigate to the specific chat with message highlighted
    router.push(`/messages/${chatId}?messageId=${messageId}`);
  };

  // NEW: Handle group creation callback
  const handleGroupCreated = () => {
    // Refresh the chats list when a new group is created
    queryClient.invalidateQueries({ queryKey: ['chats'] });
  };

  const selectedChat = Array.isArray(chats)
    ? chats.find((chat) => chat.id === selectedChatId)
    : undefined;
  const filteredChats = Array.isArray(chats)
    ? chats.filter((chat) => {
        if (!searchTerm.trim()) return true;
        return (
          chat.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          chat.participants.some(
            (p) =>
              p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              p.username.toLowerCase().includes(searchTerm.toLowerCase()),
          )
        );
      })
    : [];

  // Separate chats by type for better organization
  const directChats = filteredChats.filter((chat) => chat.type === 'DIRECT');
  const groupChats = filteredChats.filter((chat) => chat.type === 'GROUP');
  const projectChats = filteredChats.filter((chat) => chat.type === 'PROJECT');

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
              <div className="flex items-center gap-2">
                {/* Add MessageSearch component here */}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/messages/new')}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
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

          {/* Chat List with Tabs */}
          <Tabs defaultValue="all" className="flex-1 flex flex-col">
            <div className="px-4 pt-2">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all" className="text-xs">
                  All ({filteredChats.length})
                </TabsTrigger>
                <TabsTrigger value="direct" className="text-xs">
                  Direct ({directChats.length})
                </TabsTrigger>
                <TabsTrigger value="groups" className="text-xs">
                  Groups ({groupChats.length})
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="space-y-1">
                  <AnimatePresence>
                    {filteredChats.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onSelect={() => handleChatSelect(chat.id)}
                        onPin={() => {
                          /* Handle pin */
                        }}
                        onArchive={() => {
                          /* Handle archive */
                        }}
                        onMute={() => {
                          /* Handle mute */
                        }}
                        currentUserId={currentUserId} // <-- Add this
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="direct" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="space-y-1">
                  <AnimatePresence>
                    {directChats.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onSelect={() => handleChatSelect(chat.id)}
                        onPin={() => {}}
                        onArchive={() => {}}
                        onMute={() => {}}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="groups" className="flex-1 m-0 flex flex-col">
              {/* Group Chat Manager */}
              <div className="p-4 border-b border-border">
                <GroupChatManager
                  onChatSelect={handleChatSelect}
                  selectedChatId={selectedChatId || undefined}
                  onGroupCreated={handleGroupCreated}
                />
              </div>

              {/* Group Chats List */}
              <ScrollArea className="flex-1">
                <div className="space-y-1">
                  <AnimatePresence>
                    {groupChats.map((chat) => (
                      <ChatListItem
                        key={chat.id}
                        chat={chat}
                        isSelected={selectedChatId === chat.id}
                        onSelect={() => handleChatSelect(chat.id)}
                        onPin={() => {}}
                        onArchive={() => {}}
                        onMute={() => {}}
                        currentUserId={currentUserId}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Chat Window - keep your existing implementation */}
        <div className="flex-1 flex flex-col">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={
                          selectedChat.avatarUrl ||
                          selectedChat.participants[0]?.profilePictureUrl ||
                          ''
                        }
                        alt={
                          selectedChat.name ||
                          selectedChat.participants[0]?.displayName ||
                          ''
                        }
                      />
                      <AvatarFallback>
                        {selectedChat.name?.charAt(0) ||
                          selectedChat.participants[0]?.displayName?.charAt(
                            0,
                          ) ||
                          '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h2 className="font-semibold text-foreground">
                        {selectedChat.name ||
                          selectedChat.participants[0]?.displayName ||
                          selectedChat.participants[0]?.username}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {selectedChat.participants[0]?.isOnline
                          ? 'Online'
                          : 'Last seen recently'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Add MessageSearch for the specific chat */}
                    <MessageSearch
                      onMessageSelect={handleMessageSelect}
                      defaultChatId={selectedChatId || undefined}
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
                          !prevMessage ||
                          prevMessage.senderId !== message.senderId;
                        const isOwn = message.senderId === currentUserId;

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

              {/* Message Input - keep your existing implementation */}
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
                      disabled={
                        !newMessage.trim() || sendMessageMutation.isPending
                      }
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
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Select a conversation
                </h3>
                <p className="text-muted-foreground">
                  Choose a chat to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
