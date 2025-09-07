'use client';

import { useState, useRef, useLayoutEffect } from 'react'; // <-- Changed useEffect to useLayoutEffect
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import Loader from '@/components/shared/Loader';
import { Chat, Message } from '@/types/Message';
import MessageSearch from './MessageSearch';
import MessageBubble from './MessageBubble';
import React from 'react';

interface ChatWindowProps {
  selectedChat: Chat | undefined;
  messages: Message[];
  loadingMessages: boolean;
  currentUserId: string | undefined;
  newMessage: string;
  setNewMessage: (value: string) => void;
  isRecording: boolean;
  setIsRecording: (value: boolean) => void;
  showEmojiPicker: boolean;
  setShowEmojiPicker: (value: boolean) => void;
  showFilePicker: boolean;
  setShowFilePicker: (value: boolean) => void;
  handleSendMessage: () => void;
  handleKeyPress: (e: React.KeyboardEvent) => void;
  handleMessageSelect: (messageId: string, chatId: string) => void;
  selectedChatId: string | null;
}

export default function ChatWindow({
  selectedChat,
  messages,
  loadingMessages,
  currentUserId,
  newMessage,
  setNewMessage,
  isRecording,
  setIsRecording,
  showEmojiPicker,
  setShowEmojiPicker,
  showFilePicker,
  setShowFilePicker,
  handleSendMessage,
  handleKeyPress,
  handleMessageSelect,
  selectedChatId,
}: ChatWindowProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change or chat is selected
  useLayoutEffect(() => {
    if (messages.length > 0) {
      const viewport = scrollAreaRef.current?.querySelector(
        '[data-radix-scroll-area-viewport]',
      ) as HTMLElement;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, selectedChatId]); // <-- Added selectedChatId to dependencies for initial scroll

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
                      selectedChat.participants[0]?.displayName?.charAt(0) ||
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
                          {!isOwn && (
                            <div className="w-10 flex flex-col items-end">
                              <div
                                className={
                                  group.messages.length > 0 ? 'h-8 mt-1' : ''
                                }
                              ></div>
                            </div>
                          )}
                          <div className="flex flex-col gap-1 flex-1">
                            {group.messages.map((message, idx) => (
                              <MessageBubble
                                key={`${message.id}-${idx}`}
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

          {/* Message Input */}
          <div className="p-4 border-t border-border bg-card/50 backdrop-blur-sm shrink-0">
            <div className="flex items-center gap-3">
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
                disabled={!newMessage.trim()}
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
  );
}
