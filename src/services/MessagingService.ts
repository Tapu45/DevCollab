import { prisma } from '@/lib/Prisma';
import { MessageType, ChatType } from '@/generated/prisma';
import { NotificationService } from './NotificationService';
import { NotificationType, NotificationCategory } from '@/generated/prisma';
import { pusher } from '@/utils/Pusher';


export interface CreateMessageData {
  chatId: string;
  senderId: string;
  content: string;
  type?: MessageType;
  attachments?: any[];
  replyToId?: string;
}

export interface CreateChatData {
  type: ChatType;
  name?: string;
  description?: string;
  participantIds: string[];
  projectId?: string;
  avatarUrl?: string;
}

export interface ChatWithParticipants {
    id: string;
    type: ChatType;
    name?: string | null;        // Change from string? to string | null
    description?: string | null; // Change from string? to string | null
    avatarUrl?: string | null;   // Change from string? to string | null
    lastMessage?: {
      id: string;
      content: string;
      senderId: string;
      createdAt: Date;
    };
    participants: {
      id: string;
      username: string;
      displayName?: string | null;        // Change from string? to string | null
      profilePictureUrl?: string | null;  // Change from string? to string | null
      isAdmin: boolean;
      joinedAt: Date;
    }[];
    unreadCount: number;
    createdAt: Date;
    updatedAt: Date;
  }

export class MessagingService {
  // Create a new chat
  static async createChat(data: CreateChatData, creatorId: string): Promise<any> {
    const { type, name, description, participantIds, projectId, avatarUrl } = data;

    // Validate participants
    if (type === ChatType.DIRECT && participantIds.length !== 1) {
      throw new Error('Direct chat must have exactly one participant');
    }

    if (type === ChatType.GROUP && participantIds.length < 2) {
      throw new Error('Group chat must have at least 2 participants');
    }

    // Check if direct chat already exists
    if (type === ChatType.DIRECT) {
      const existingChat = await this.findDirectChat(creatorId, participantIds[0]);
      if (existingChat) {
        return existingChat;
      }
    }

    const chat = await prisma.chat.create({
      data: {
        type,
        name,
        description,
        projectId,
        avatarUrl,
        participants: {
          create: [
            // Add creator as admin
            {
              userId: creatorId,
              isAdmin: true,
            },
            // Add other participants
            ...participantIds.map(id => ({
              userId: id,
              isAdmin: false,
            })),
          ],
        },
        settings: {
          create: {
            allowFileSharing: true,
            allowReactions: true,
            allowPolls: true,
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        settings: true,
      },
    });

    // Send notifications to participants
    // await this.notifyChatCreated(chat, creatorId);

    return chat;
  }

  // Send a message
  static async sendMessage(data: CreateMessageData): Promise<any> {
    const { chatId, senderId, content, type = MessageType.TEXT, attachments, replyToId } = data;

    // Verify sender is participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: senderId,
        },
      },
    });

    if (!participant || !participant.isActive) {
      throw new Error('User is not a participant in this chat');
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        chatId,
        senderId,
        content,
        type,
        attachments: attachments ? JSON.stringify(attachments) : undefined,
        replyToId,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePictureUrl: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });

    // Update chat's last message
    await prisma.chat.update({
      where: { id: chatId },
      data: {
        lastMessageId: message.id,
        lastMessageAt: message.createdAt,
      },
    });

    // Mark as read for sender
    await this.markMessageAsRead(message.id, senderId);

    await pusher.trigger(`chat-${chatId}`, 'message_received', {
      messageId: message.id,
      chatId: message.chatId,
      senderId: message.senderId,
      content: message.content,
      type: message.type,
      createdAt: message.createdAt,
    });

    // Send notifications to other participants
    await this.notifyMessageSent(message, senderId);

    return message;
  }

  // Get user's chats
  static async getUserChats(userId: string, options: {
    limit?: number;
    offset?: number;
    type?: ChatType;
  } = {}): Promise<ChatWithParticipants[]> {
    const { limit = 50, offset = 0, type } = options;

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: {
            userId,
            isActive: true,
          },
        },
        isActive: true,
        ...(type && { type }),
      },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: userId },
                reads: {
                  none: {
                    userId,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return chats.map(chat => ({
      id: chat.id,
      type: chat.type,
      name: chat.name ?? undefined,
      description: chat.description ?? undefined,
      avatarUrl: chat.avatarUrl,
      lastMessage: chat.messages[0] ? {
        id: chat.messages[0].id,
        content: chat.messages[0].content,
        senderId: chat.messages[0].senderId,
        createdAt: chat.messages[0].createdAt,
      } : undefined,
      participants: chat.participants.map(p => ({
        id: p.user.id,
        username: p.user.username,
        displayName: p.user.displayName,
        profilePictureUrl: p.user.profilePictureUrl,
        isAdmin: p.isAdmin,
        joinedAt: p.joinedAt,
      })),
      unreadCount: chat._count.messages,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    }));
  }

  // Get chat messages
  static async getChatMessages(chatId: string, userId: string, options: {
    limit?: number;
    offset?: number;
    before?: string; // Message ID to get messages before
  } = {}): Promise<any[]> {
    const { limit = 50, offset = 0, before } = options;

    // Verify user is participant
    const participant = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
    });

    if (!participant || !participant.isActive) {
      throw new Error('User is not a participant in this chat');
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId,
        isDeleted: false,
        ...(before && {
          createdAt: {
            lt: await this.getMessageCreatedAt(before),
          },
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePictureUrl: true,
          },
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
        reads: {
          where: { userId },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    });

    return messages.reverse();
  }

  // Mark message as read
  static async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    await prisma.messageRead.upsert({
      where: {
        messageId_userId: {
          messageId,
          userId,
        },
      },
      update: {
        readAt: new Date(),
      },
      create: {
        messageId,
        userId,
        readAt: new Date(),
      },
    });
  }

  // Mark all messages in chat as read
  static async markChatAsRead(chatId: string, userId: string): Promise<void> {
    // Get unread messages
    const unreadMessages = await prisma.message.findMany({
      where: {
        chatId,
        senderId: { not: userId },
        reads: {
          none: {
            userId,
          },
        },
      },
      select: { id: true },
    });

    // Mark all as read
    if (unreadMessages.length > 0) {
      await prisma.messageRead.createMany({
        data: unreadMessages.map(msg => ({
          messageId: msg.id,
          userId,
          readAt: new Date(),
        })),
        skipDuplicates: true,
      });
    }
  }

  // Add reaction to message
  static async addReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    await prisma.messageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId,
          emoji,
        },
      },
      update: {
        createdAt: new Date(),
      },
      create: {
        messageId,
        userId,
        emoji,
      },
    });
    const message = await prisma.message.findUnique({
        where: { id: messageId },
        select: { chatId: true },
      });
  
    if (message) {
      
      await pusher.trigger(`chat-${message.chatId}`, 'message_reaction', {
        messageId,
        userId,
        emoji,
        action: 'add',
      });
    }
  }

  // Remove reaction from message
  static async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    await prisma.messageReaction.deleteMany({
      where: {
        messageId,
        userId,
        emoji,
      },
    });

    // Get message chat ID and emit real-time event
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { chatId: true },
    });

    if (message) {
      await pusher.trigger(`chat-${message.chatId}`, 'message_reaction', {
        messageId,
        userId,
        emoji,
        action: 'remove',
      });
    }
  }

  // Edit message
  static async editMessage(messageId: string, userId: string, newContent: string): Promise<any> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new Error('Message not found or user not authorized');
    }

    if (message.isDeleted) {
      throw new Error('Cannot edit deleted message');
    }

    return prisma.message.update({
      where: { id: messageId },
      data: {
        content: newContent,
        isEdited: true,
        editedAt: new Date(),
      },
    });
  }

  // Delete message
  static async deleteMessage(messageId: string, userId: string): Promise<void> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
    });

    if (!message || message.senderId !== userId) {
      throw new Error('Message not found or user not authorized');
    }

    await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        content: 'This message was deleted',
      },
    });
  }

  // Add participant to chat
  static async addParticipant(chatId: string, userId: string, addedBy: string): Promise<void> {
    // Verify adder is admin
    const adder = await prisma.chatParticipant.findUnique({
      where: {
        chatId_userId: {
          chatId,
          userId: addedBy,
        },
      },
    });

    if (!adder || !adder.isAdmin) {
      throw new Error('Only admins can add participants');
    }

    await prisma.chatParticipant.create({
      data: {
        chatId,
        userId,
        isAdmin: false,
      },
    });

    // Send notification
    await NotificationService.createFromTemplate(
      userId,
      NotificationType.MESSAGE_RECEIVED,
      {
        chatName: await this.getChatName(chatId),
        adderName: await this.getUserName(addedBy),
      },
      addedBy
    );
  }

  // Remove participant from chat
  static async removeParticipant(chatId: string, userId: string, removedBy: string): Promise<void> {
    // Verify remover is admin or removing themselves
    if (userId !== removedBy) {
      const remover = await prisma.chatParticipant.findUnique({
        where: {
          chatId_userId: {
            chatId,
            userId: removedBy,
          },
        },
      });

      if (!remover || !remover.isAdmin) {
        throw new Error('Only admins can remove participants');
      }
    }

    await prisma.chatParticipant.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        isActive: false,
        leftAt: new Date(),
      },
    });
  }

  // Private helper methods
  private static async findDirectChat(userId1: string, userId2: string): Promise<any> {
    return prisma.chat.findFirst({
      where: {
        type: ChatType.DIRECT,
        participants: {
          every: {
            userId: {
              in: [userId1, userId2],
            },
          },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
      },
    });
  }

  private static async getMessageCreatedAt(messageId: string): Promise<Date> {
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      select: { createdAt: true },
    });
    return message?.createdAt || new Date();
  }

  private static async notifyChatCreated(chat: any, creatorId: string): Promise<void> {
    const otherParticipants = chat.participants.filter((p: any) => p.userId !== creatorId);
    
    for (const participant of otherParticipants) {
      await NotificationService.createFromTemplate(
        participant.userId,
        NotificationType.MESSAGE_RECEIVED,
        {
          chatName: chat.name || 'New Chat',
          creatorName: await this.getUserName(creatorId),
        },
        creatorId
      );
    }
  }

  private static async notifyMessageSent(message: any, senderId: string): Promise<void> {
    const chat = await prisma.chat.findUnique({
      where: { id: message.chatId },
      include: {
        participants: {
          where: {
            userId: { not: senderId },
            isActive: true,
          },
        },
      },
    });

    if (!chat) return;

    for (const participant of chat.participants) {
      await NotificationService.createFromTemplate(
        participant.userId,
        NotificationType.MESSAGE_RECEIVED,
        {
          senderName: message.sender.displayName || message.sender.username,
          chatName: chat.name || 'Direct Message',
          messagePreview: message.content.substring(0, 50),
        },
        senderId
      );
    }
  }

  private static async getChatName(chatId: string): Promise<string> {
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      select: { name: true, type: true },
    });
    return chat?.name || (chat?.type === ChatType.DIRECT ? 'Direct Message' : 'Group Chat');
  }

  private static async getUserName(userId: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true },
    });
    return user?.displayName || user?.username || 'Unknown User';
  }


   static async getChatById(chatId: string): Promise<any> {
    return prisma.chat.findUnique({
      where: { id: chatId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
              },
            },
          },
        },
      },
    });
  }
}