'use client';

import { useRef, useLayoutEffect, useState } from 'react'; 
import { AnimatePresence } from 'framer-motion';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
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
import { usePusherEvent } from '@/hooks/Pusher';
import { pusherClient } from '@/utils/Pusher';

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
  handleSendMessage: (attachmentUrl?: string) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isSomeoneTyping, setIsSomeoneTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const [userPresence, setUserPresence] = useState<{
    isOnline: boolean;
    lastSeen: string | null;
  }>({
    isOnline: !!selectedChat?.participants[0]?.isOnline,
    lastSeen: selectedChat?.participants[0]?.lastSeen || null,
  });

  // ...existing code...

  // Auto-scroll to bottom when messages change or chat is selected
  useLayoutEffect(() => {
    if (messages.length > 0) {
      const root = scrollAreaRef.current?.closest(
        '[data-slot="scroll-area"]',
      ) as HTMLElement | null;
      const viewport = root?.querySelector(
        '[data-slot="scroll-area-viewport"]',
      ) as HTMLElement | null;

      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, selectedChatId]);

  usePusherEvent({
    channelName: selectedChatId ? `chat-${selectedChatId}` : '',
    eventName: 'typing',
    callback: (data: { userId: string }) => {
      if (data.userId !== currentUserId) setIsSomeoneTyping(true);
    },
  });
  usePusherEvent({
    channelName: selectedChatId ? `chat-${selectedChatId}` : '',
    eventName: 'stop_typing',
    callback: (data: { userId: string }) => {
      if (data.userId !== currentUserId) setIsSomeoneTyping(false);
    },
  });

  usePusherEvent({
    channelName: selectedChat?.participants[0]?.id
      ? `user-${selectedChat.participants[0].id}`
      : '',
    eventName: 'user_presence',
    callback: (data: { isOnline: boolean; lastSeen: string }) => {
      setUserPresence({ isOnline: data.isOnline, lastSeen: data.lastSeen });
    },
  });


function formatLastSeen(lastSeen: string) {
  const date = new Date(lastSeen);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h ago`;
  return date.toLocaleString();
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

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setUploadError(null);
    setImageUrl(null); // Clear any previous URL

    if (!file) return;

    // Only allow image files
    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed.');
      setSelectedFile(null);
      return;
    }

    // Only allow files up to 2MB
    if (file.size > 2 * 1024 * 1024) {
      setUploadError('File size must be less than 2MB.');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setShowFilePicker(false);
    // Create preview URL
    setImageUrl(URL.createObjectURL(file));
  }

  async function handleSendMessageWithUpload() {
    if (!selectedFile && !newMessage.trim()) return;

    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const result = await res.json();

        if (!res.ok || !result.success) {
          throw new Error(result.error || 'Upload failed');
        }

        // Send message with attachment URL
        handleSendMessage(result.data.secure_url);

        // Clear after send
        setSelectedFile(null);
        setImageUrl(null);
        setNewMessage('');
      } catch (err: any) {
        setUploadError(err.message || 'Upload failed');
      } finally {
        setUploading(false);
      }
    } else {
      // No file, just send text message
      handleSendMessage();
      setNewMessage('');
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setNewMessage(e.target.value);

    if (selectedChatId && currentUserId) {
      fetch('/api/messaging/messages/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: `chat-${selectedChatId}`,
          event: 'typing',
          data: { userId: currentUserId },
        }),
      });

      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        fetch('/api/messaging/messages/typing', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            channel: `chat-${selectedChatId}`,
            event: 'stop_typing',
            data: { userId: currentUserId },
          }),
        });
      }, 1000);
    }
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
                    {userPresence.isOnline
                      ? 'Online'
                      : userPresence.lastSeen
                        ? `Last seen ${formatLastSeen(userPresence.lastSeen)}`
                        : 'Last seen recently'}
                  </p>
                  {isSomeoneTyping && (
                    <span className="text-xs text-primary animate-pulse">
                      Typing...
                    </span>
                  )}
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
              {/* Attachment Button */}
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={() => {
                  setShowFilePicker(!showFilePicker);
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
              >
                <Paperclip className="w-5 h-5" />
              </Button>
              {/* Hidden File Input */}
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="image/*"
                disabled={uploading}
              />
              {/* Show file preview if selected */}
              {imageUrl && (
                <div className="ml-2 flex items-center gap-2">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-10 h-10 object-cover rounded"
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedFile(null);
                      setImageUrl(null);
                    }}
                    disabled={uploading}
                  >
                    Remove
                  </Button>
                </div>
              )}
              {/* Show upload error */}
              {uploadError && (
                <span className="text-xs text-red-500 ml-2">{uploadError}</span>
              )}
              {/* Emoji Button */}
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={uploading}
              >
                <Smile className="w-5 h-5" />
              </Button>

              <div className="flex-1 relative">
                <textarea
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type a message..."
                  className="w-full min-h-[44px] max-h-32 px-4 py-3 border border-input rounded-full bg-background focus:ring-2 focus:ring-ring focus:border-transparent resize-none transition"
                  rows={1}
                  disabled={uploading}
                />
                {showEmojiPicker && (
                  <div className="absolute bottom-16 left-0 z-20">
                    <div
                      style={{ height: 300, width: 350, overflow: 'hidden' }}
                    >
                      <Picker
                        data={data}
                        onEmojiSelect={(emoji: any) => {
                          setNewMessage(newMessage + emoji.native);
                          setShowEmojiPicker(false);
                        }}
                        theme="auto"
                        previewPosition="none"
                        searchPosition="none"
                        perLine={8}
                      />
                    </div>
                  </div>
                )}
              </div>

              {isRecording ? (
                <Button
                  size="icon"
                  variant="destructive"
                  className="rounded-full"
                  onClick={() => setIsRecording(false)}
                  disabled={uploading}
                >
                  <MicOff className="w-5 h-5" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="rounded-full"
                  onClick={() => setIsRecording(true)}
                  disabled={uploading}
                >
                  <Mic className="w-5 h-5" />
                </Button>
              )}

              <Button
                size="icon"
                className="rounded-full bg-primary text-white hover:bg-primary/90 transition"
                onClick={handleSendMessageWithUpload}
                disabled={(!newMessage.trim() && !selectedFile) || uploading}
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