export interface Chat {
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

export interface Message {
  isSending: boolean | undefined;
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