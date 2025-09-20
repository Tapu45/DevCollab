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
import { usePusherEvent } from '@/hooks/Pusher'; // <-- Added import for Pusher
import ChatWindow from './minicomponents/ChattingWindow';
import { usePage } from '@/context/PageContext';

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

  const { setPageInfo } = usePage();

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
    refetchInterval: 30000, // <-- Kept for chats (can be removed if Pusher events are added for chats)
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
    setPageInfo('Messages', 'Chat with your network and groups'); // <-- Set page info
  }, [setPageInfo]);

  useEffect(() => {
    if (chatIdFromQuery && chatIdFromQuery !== selectedChatId) {
      setSelectedChatId(chatIdFromQuery);
    }
  }, [chatIdFromQuery]);

  useEffect(() => {
    const markOnline = () => {
      if (currentUserId) {
        fetch('/api/messaging/messages/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId, isOnline: true }),
        });
      }
    };

    const markOffline = () => {
      if (currentUserId) {
        fetch('/api/messaging/messages/presence', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUserId, isOnline: false }),
        });
      }
    };

    // Mark online on mount
    markOnline();

    // Mark offline on unload or page leave
    const handleBeforeUnload = () => markOffline();
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      markOffline();
    };
  }, [currentUserId]);

  const { data: messages = [], isLoading: loadingMessages } = useQuery({
    queryKey: ['messages', selectedChatId],
    queryFn: () =>
      selectedChatId ? fetchMessages(selectedChatId) : Promise.resolve([]),
    enabled: !!selectedChatId,
    // refetchInterval: 5000, // <-- Removed to stop polling
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

  // NEW: Subscribe to Pusher for real-time messages
  usePusherEvent({
    channelName: selectedChatId ? `chat-${selectedChatId}` : '',
    eventName: 'message_received',
    callback: (data: {
      messageId: string;
      chatId: string;
      senderId: string;
      content: string;
      type: string;
      createdAt: string;
    }) => {
      if (!selectedChatId || data.chatId !== selectedChatId) return;

      // Check if message already exists (e.g., from optimistic update)
      const existingMessages = queryClient.getQueryData<Message[]>([
        'messages',
        selectedChatId,
      ]);
      if (existingMessages?.some((msg) => msg.id === data.messageId)) return;

      // Fetch the full message details (since Pusher payload is minimal)
      // Alternatively, adjust backend to send full message in Pusher event
      fetchMessages(selectedChatId).then((updatedMessages) => {
        queryClient.setQueryData(['messages', selectedChatId], updatedMessages);
      });

      // Invalidate chats to update last message
      queryClient.invalidateQueries({ queryKey: ['chats'] });
    },
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
  const handleSendMessage = (attachmentUrl?: string) => {
    if ((!newMessage.trim() && !attachmentUrl) || !selectedChatId) return;

    sendMessageMutation.mutate({
      chatId: selectedChatId,
      content: newMessage.trim() || attachmentUrl || '', // Use attachment URL if no text
      type: attachmentUrl ? 'IMAGE' : 'TEXT', // Adjust type based on attachment
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
        <ChatWindow
          selectedChat={selectedChat}
          messages={messages}
          loadingMessages={loadingMessages}
          currentUserId={currentUserId}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          isRecording={isRecording}
          setIsRecording={setIsRecording}
          showEmojiPicker={showEmojiPicker}
          setShowEmojiPicker={setShowEmojiPicker}
          showFilePicker={showFilePicker}
          setShowFilePicker={setShowFilePicker}
          handleSendMessage={handleSendMessage}
          handleKeyPress={handleKeyPress}
          handleMessageSelect={handleMessageSelect}
          selectedChatId={selectedChatId}
        />
      </div>
    </div>
  );
}
