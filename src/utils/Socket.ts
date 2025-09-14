import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

// Socket.io event types
export interface ServerToClientEvents {
  // Connection events
  connection_request: (data: { senderId: string; senderName: string; message?: string }) => void;
  connection_accepted: (data: { accepterId: string; accepterName: string }) => void;
  connection_declined: (data: { declinerId: string; declinerName: string }) => void;
  connection_blocked: (data: { blockerId: string; blockerName: string }) => void;

  // Message events
  message_received: (data: {
    messageId: string;
    chatId: string;
    senderId: string;
    content: string;
    type: string;
    createdAt: Date;
  }) => void;
  message_edited: (data: { messageId: string; newContent: string; editedAt: Date }) => void;
  message_deleted: (data: { messageId: string; chatId: string }) => void;
  message_reaction: (data: { messageId: string; userId: string; emoji: string; action: 'add' | 'remove' }) => void;
  message_read: (data: { messageId: string; userId: string; readAt: Date }) => void;
  typing_start: (data: { chatId: string; userId: string; userName: string }) => void;
  typing_stop: (data: { chatId: string; userId: string }) => void;

  // Chat events
  chat_created: (data: { chatId: string; name?: string; participants: string[] }) => void;
  participant_added: (data: { chatId: string; userId: string; userName: string }) => void;
  participant_removed: (data: { chatId: string; userId: string; userName: string }) => void;
  chat_updated: (data: { chatId: string; name?: string; description?: string }) => void;

  // Notification events
  notification_received: (data: {
    notificationId: string;
    type: string;
    title: string;
    message: string;
    actionUrl?: string;
    priority: string;
  }) => void;
  notification_read: (data: { notificationId: string }) => void;

  // Project events (for future)
  project_invitation: (data: { projectId: string; projectName: string; inviterName: string }) => void;
  task_assigned: (data: { taskId: string; taskTitle: string; assignerName: string }) => void;

  // System events
  user_online: (data: { userId: string; userName: string }) => void;
  user_offline: (data: { userId: string; userName: string }) => void;
  system_announcement: (data: { title: string; message: string; priority: string }) => void;
}

export interface ClientToServerEvents {
  // Connection events
  send_connection_request: (data: { receiverId: string; type: string; message?: string }) => void;
  respond_connection_request: (data: { connectionId: string; response: 'accept' | 'decline' }) => void;
  block_user: (data: { userId: string }) => void;

  // Message events
  send_message: (data: { chatId: string; content: string; type?: string; replyToId?: string }) => void;
  edit_message: (data: { messageId: string; newContent: string }) => void;
  delete_message: (data: { messageId: string }) => void;
  add_reaction: (data: { messageId: string; emoji: string }) => void;
  remove_reaction: (data: { messageId: string; emoji: string }) => void;
  mark_message_read: (data: {
    chatId: any; messageId: string
  }) => void;
  start_typing: (data: { chatId: string }) => void;
  stop_typing: (data: { chatId: string }) => void;

  // Chat events
  create_chat: (data: { type: string; name?: string; participantIds: string[] }) => void;
  add_participant: (data: { chatId: string; userId: string }) => void;
  remove_participant: (data: { chatId: string; userId: string }) => void;
  update_chat: (data: { chatId: string; name?: string; description?: string }) => void;
  join_chat: (data: { chatId: string }) => void;
  leave_chat: (data: { chatId: string }) => void;

  // Notification events
  mark_notification_read: (data: { notificationId: string }) => void;

  // System events
  join_user_room: () => void;
  leave_user_room: () => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  userName: string;
  userEmail: string;
}

// Socket.io server instance
let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const initializeSocket = (httpServer: HTTPServer) => {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NODE_ENV === 'production' ? false : ["http://localhost:3000"],
      methods: ["GET", "POST"],
      credentials: true,
    },
    path: '/api/socketio',
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      // Get userId from Clerk auth
      const { userId } = await auth();

      if (!userId) {
        return next(new Error('Authentication error'));
      }

      // Get user data
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
        },
      });

      if (!user) {
        return next(new Error('User not found'));
      }

      socket.data = {
        userId: user.id,
        userName: user.displayName || user.username,
        userEmail: user.email,
      };

      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  // Connection handling
  io.on('connection', (socket) => {
    const { userId, userName } = socket.data;

    console.log(`User ${userName} (${userId}) connected`);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Notify others that user is online
    socket.broadcast.emit('user_online', { userId, userName });

    // Connection Management Events
    socket.on('send_connection_request', async (data) => {
      try {
        // Emit to receiver
        socket.to(`user:${data.receiverId}`).emit('connection_request', {
          senderId: userId,
          senderName: userName,
          message: data.message,
        });
      } catch (error) {
        console.error('Error sending connection request:', error);
      }
    });

    socket.on('respond_connection_request', async (data) => {
      try {
        // Get connection details and emit to sender
        const connection = await prisma.connection.findUnique({
          where: { id: data.connectionId },
          include: { sender: { select: { id: true, displayName: true, username: true } } },
        });

        if (connection) {
          if (data.response === 'accept') {
            socket.to(`user:${connection.senderId}`).emit('connection_accepted', {
              accepterId: userId,
              accepterName: userName,
            });
          } else {
            socket.to(`user:${connection.senderId}`).emit('connection_declined', {
              declinerId: userId,
              declinerName: userName,
            });
          }
        }
      } catch (error) {
        console.error('Error responding to connection request:', error);
      }
    });

    // Message Events
    socket.on('send_message', async (data) => {
      try {
        // Verify user is participant in chat
        const participant = await prisma.chatParticipant.findUnique({
          where: {
            chatId_userId: {
              chatId: data.chatId,
              userId: userId,
            },
          },
        });

        if (!participant || !participant.isActive) {
          return;
        }

        // Get chat participants
        const chatParticipants = await prisma.chatParticipant.findMany({
          where: {
            chatId: data.chatId,
            isActive: true,
          },
          select: { userId: true },
        });

        // Emit to all participants except sender
        const participantIds = chatParticipants.map(p => p.userId).filter(id => id !== userId);

        participantIds.forEach(participantId => {
          socket.to(`user:${participantId}`).emit('message_received', {
            messageId: `temp_${Date.now()}`, // Temporary ID, will be replaced with real ID
            chatId: data.chatId,
            senderId: userId,
            content: data.content,
            type: data.type || 'TEXT',
            createdAt: new Date(),
          });
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    socket.on('start_typing', (data) => {
      // Get chat participants and emit typing indicator
      socket.to(`chat:${data.chatId}`).emit('typing_start', {
        chatId: data.chatId,
        userId: userId,
        userName: userName,
      });
    });

    socket.on('stop_typing', (data) => {
      socket.to(`chat:${data.chatId}`).emit('typing_stop', {
        chatId: data.chatId,
        userId: userId,
      });
    });

    socket.on('mark_message_read', async (data) => {
      try {
        // Emit to chat participants
        socket.to(`chat:${data.chatId}`).emit('message_read', {
          messageId: data.messageId,
          userId: userId,
          readAt: new Date(),
        });
      } catch (error) {
        console.error('Error marking message as read:', error);
      }
    });

    // Chat Events
    socket.on('join_chat', (data) => {
      socket.join(`chat:${data.chatId}`);
    });

    socket.on('leave_chat', (data) => {
      socket.leave(`chat:${data.chatId}`);
    });

    socket.on('add_participant', async (data) => {
      try {
        // Emit to the added participant
        socket.to(`user:${data.userId}`).emit('participant_added', {
          chatId: data.chatId,
          userId: data.userId,
          userName: userName,
        });
      } catch (error) {
        console.error('Error adding participant:', error);
      }
    });

    // Notification Events
    socket.on('mark_notification_read', (data) => {
      // Emit to user's room
      socket.emit('notification_read', {
        notificationId: data.notificationId,
      });
    });

    // Disconnection handling
    socket.on('disconnect', () => {
      console.log(`User ${userName} (${userId}) disconnected`);

      // Notify others that user is offline
      socket.broadcast.emit('user_offline', { userId, userName });
    });
  });

  return io;
};

// Export socket instance getter
export const getSocketInstance = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Helper functions for emitting events
export const emitToUser = (userId: string, event: keyof ServerToClientEvents, data: any) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToChat = (chatId: string, event: keyof ServerToClientEvents, data: any) => {
  if (io) {
    io.to(`chat:${chatId}`).emit(event, data);
  }
};

export const emitToAll = (event: keyof ServerToClientEvents, data: any) => {
  if (io) {
    io.emit(event, data);
  }
};