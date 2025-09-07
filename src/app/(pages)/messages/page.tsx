'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  Search,
  Plus,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Send,
  Mic,
  MicOff,
} from 'lucide-react';
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
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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

  // NEW: Auto-scroll to bottom when messages change (moved to top with other hooks)
  useEffect(() => {
    if (messages.length > 0) {
      // Small delay to ensure DOM is rendered
      setTimeout(() => {
        const viewport = scrollAreaRef.current?.querySelector(
          '[data-radix-scroll-area-viewport]',
        ) as HTMLElement;
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }, 100);
    }
  }, [messages]);

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
    onMutate: async ({ chatId, content, type }) => {
       if (!user) {
         throw new Error('User not available for sending message');
       }
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages', chatId] });

      // Snapshot previous messages
      const previousMessages = queryClient.getQueryData<Message[]>([
        'messages',
        chatId,
      ]);

      // Optimistically add the message
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const optimisticMessage: Message = {
        id: tempId,
        content,
        type: type as Message['type'], // <-- Cast to match the union type
        senderId: currentUserId!,
        sender: user!, // Assuming user object has the sender details
        createdAt: new Date().toISOString(),
        isEdited: false,
        readBy: [], // Will update on success
        reactions: [],
        replyTo: undefined,
        isSending: true,
        isDeleted: false, // <-- Custom flag (ensure Message type includes this)
      };

      queryClient.setQueryData<Message[]>(['messages', chatId], (old) => [
        ...(old || []),
        optimisticMessage,
      ]);

      return { previousMessages, tempId };
    },
    onSuccess: (data, variables, context) => {
      // Update the optimistic message with real data
      queryClient.setQueryData<Message[]>(
        ['messages', variables.chatId],
        (old) => {
          if (!old) return old;
          return old.map((msg) =>
            msg.id === context?.tempId
              ? { ...data, isSending: false } // <-- Remove sending flag
              : msg,
          );
        },
      );

      queryClient.invalidateQueries({
        queryKey: ['messages', variables.chatId],
      });
      queryClient.invalidateQueries({ queryKey: ['chats'] });
      // Note: Input is cleared in handleSendMessage, not here
    },
    onError: (error, variables, context) => {
      // Revert to previous messages
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['messages', variables.chatId],
          context.previousMessages,
        );
      }
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

    // Clear input instantly
    setNewMessage('');
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

  function groupMessages(messages: Message[]) {
    const groups: { senderId: string; messages: Message[] }[] = [];
    let currentGroup: { senderId: string; messages: Message[] } | null = null;

    for (const msg of messages) {
      if (!currentGroup || currentGroup.senderId !== msg.senderId) {
        if (currentGroup) groups.push(currentGroup);
        currentGroup = { senderId: msg.senderId, messages: [msg] };
      } else {
        currentGroup.messages.push(msg);
      }
    }
    if (currentGroup) groups.push(currentGroup);
    return groups;
  }

  return (
    <div className=" bg-gradient-to-br from-background via-background to-muted/20">
      <div className="flex h-[84vh]">
        {/* Chat List Sidebar */}
        <div className="w-80 border-r border-border bg-card/50 backdrop-blur-sm h-[84vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
              {' '}
              {/* Make this a flex row */}
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push('/messages/new')}
              >
                <Plus className="w-4 h-4" />
              </Button>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Chat List with Tabs */}
          <div className="flex-1 min-h-0">
            <Tabs defaultValue="all" className="flex-1 flex flex-col h-full">
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

              <TabsContent value="all" className="flex-1 m-0 min-h-0">
                <ScrollArea className="h-full max-h-full">
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
        </div>

        {/* Chat Window - keep your existing implementation */}
        <div className="flex-1 flex flex-col h-[84vh]">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
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
              <div className="flex-1 min-h-0 overflow-y-auto">
                <ScrollArea className="flex-1 p-4 h-full max-h-full">
                  <div ref={scrollAreaRef} className="space-y-4">
                    {loadingMessages ? (
                      <div className="flex justify-center items-center h-32">
                        <Loader />
                      </div>
                    ) : (
                      <AnimatePresence>
                        {groupMessages(messages).map((group, groupIdx) => {
                          const isOwn = group.senderId === currentUserId;
                          return (
                            <div
                              key={groupIdx}
                              className={`flex ${isOwn ? 'justify-end' : ''}`}
                            >
                              {/* Avatar spacer for alignment (only for others, not own messages) */}
                              {!isOwn && (
                                <div className="w-10 flex flex-col items-end">
                                  {/* Only show avatar for the first message in group */}
                                  <div
                                    className={
                                      group.messages.length > 0
                                        ? 'h-8 mt-1'
                                        : ''
                                    }
                                  >
                                    {/* Empty div just for spacing */}
                                  </div>
                                </div>
                              )}
                              {/* Message bubbles */}
                              <div className="flex flex-col gap-1 flex-1">
                                {group.messages.map((message, idx) => (
                                  <MessageBubble
                                    key={`${message.id}-${idx}`} // <-- More stable key
                                    message={message}
                                    isOwn={isOwn}
                                    showAvatar={!isOwn && idx === 0}
                                    isGrouped={group.messages.length > 1}
                                    isFirst={idx === 0}
                                    isLast={idx === group.messages.length - 1}
                                    isSending={message.isSending}
                                  />
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Message Input - keep your existing implementation */}
              <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm shrink-0">
                <div className="flex items-center gap-3">
                  {/* Left icons */}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setShowFilePicker(!showFilePicker)}
                  >
                    <Paperclip className="w-5 h-5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-full"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  >
                    <Smile className="w-5 h-5" />
                  </Button>

                  {/* Message input */}
                  <div className="flex-1 relative">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="w-full min-h-[44px] max-h-32 px-4 py-3 border border-input rounded-full bg-background focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition"
                      rows={1}
                    />
                  </div>

                  {/* Mic and Send buttons */}
                  {isRecording ? (
                    <Button
                      size="icon"
                      variant="destructive"
                      className="rounded-full"
                      onClick={() => setIsRecording(false)}
                    >
                      <MicOff className="w-5 h-5" />
                    </Button>
                  ) : (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="rounded-full"
                      onClick={() => setIsRecording(true)}
                    >
                      <Mic className="w-5 h-5" />
                    </Button>
                  )}

                  <Button
                    size="icon"
                    className="rounded-full bg-primary text-white hover:bg-primary/90 transition"
                    onClick={handleSendMessage}
                    disabled={
                      !newMessage.trim() || sendMessageMutation.isPending
                    }
                  >
                    <Send className="w-5 h-5" />
                  </Button>
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
