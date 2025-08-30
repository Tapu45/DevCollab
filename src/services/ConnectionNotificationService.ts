import { emitToUser } from '@/utils/Socket';
import { NotificationService } from './NotificationService';
import { NotificationType, NotificationCategory } from '@/generated/prisma';

export class ConnectionNotificationService {
  // Connection request sent
  static async notifyConnectionRequest(senderId: string, receiverId: string, message?: string) {
    const sender = await this.getUserInfo(senderId);

    emitToUser(receiverId, 'connection_request', {
        senderId,
        senderName: sender?.displayName || sender?.username || 'Unknown User',
        message: message || '',
      });
    
    return NotificationService.createFromTemplate(
      receiverId,
      NotificationType.CONNECTION_REQUEST,
      {
        senderName: sender?.displayName || sender?.username || 'Unknown User',
        message: message || '',
      },
      senderId
    );
  }

  // Connection accepted
  static async notifyConnectionAccepted(accepterId: string, requesterId: string) {
    const accepter = await this.getUserInfo(accepterId);
    
    // Emit real-time event
    emitToUser(requesterId, 'connection_accepted', {
      accepterId,
      accepterName: accepter?.displayName || accepter?.username || 'Unknown User',
    });

    return NotificationService.createFromTemplate(
      requesterId,
      NotificationType.CONNECTION_ACCEPTED,
      {
        accepterName: accepter?.displayName || accepter?.username || 'Unknown User',
      },
      accepterId
    );
  }

  // Connection declined
  static async notifyConnectionDeclined(declinerId: string, requesterId: string) {
    const decliner = await this.getUserInfo(declinerId);
    
    return NotificationService.createFromTemplate(
      requesterId,
      NotificationType.CONNECTION_DECLINED,
      {
        declinerName: decliner?.displayName || decliner?.username || 'Unknown User',
      },
      declinerId
    );
  }

  // User blocked
  static async notifyUserBlocked(blockerId: string, blockedId: string) {
    const blocker = await this.getUserInfo(blockerId);
    
    return NotificationService.createFromTemplate(
      blockedId,
      NotificationType.CONNECTION_BLOCKED,
      {
        blockerName: blocker?.displayName || blocker?.username || 'Unknown User',
      },
      blockerId
    );
  }

  private static async getUserInfo(userId: string) {
    const { prisma } = await import('@/lib/Prisma');
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePictureUrl: true,
      },
    });
  }
}