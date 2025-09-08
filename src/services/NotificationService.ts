import { prisma } from '@/lib/Prisma';
import { NotificationType, NotificationPriority, NotificationCategory } from '@/generated/prisma';
import { pusher } from '@/utils/Pusher';

export interface CreateNotificationData {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    data?: any;
    priority?: NotificationPriority;
    category: NotificationCategory;
    senderId?: string;
    actionUrl?: string | null;  
    actionText?: string | null; 
    expiresAt?: Date | null;    
    scheduledAt?: Date | null;  
  }

  export interface NotificationTemplate {
    title: string;
    message: string;
    actionUrl?: string | null;
    actionText?: string | null;
    priority: NotificationPriority;
  }

export class NotificationService {
  // Create a single notification
  static async createNotification(data: CreateNotificationData) {
    // Check user preferences
    const preferences = await this.getUserPreferences(data.userId, data.category);
    // if (!preferences?.inAppEnabled) {
    //   console.log('Notification not created: preferences missing or disabled for', data.userId, data.category);
    //   return null;
    // }

    // Check quiet hours
    if (this.isInQuietHours(preferences)) {
      // Schedule for later or skip
      data.scheduledAt = this.getNextAvailableTime(preferences);
    }

    const notification = await prisma.notification.create({
      data: {
        ...data,
        priority: data.priority || NotificationPriority.NORMAL,
      },
    });

    await pusher.trigger(`user-${data.userId}`, 'notification_received', {
      notificationId: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      actionUrl: notification.actionUrl,
      priority: notification.priority,
    });

    // Trigger real-time delivery
    await this.deliverNotification(notification);

    return notification;
  }

  // Create multiple notifications (batch)
  static async createBulkNotifications(notifications: CreateNotificationData[]) {
    const validNotifications = [];
    
    for (const data of notifications) {
      const preferences = await this.getUserPreferences(data.userId, data.category);
      if (preferences?.inAppEnabled) {
        validNotifications.push({
          ...data,
          priority: data.priority || NotificationPriority.NORMAL,
        });
      }
    }

    if (validNotifications.length === 0) return [];

    const created = await prisma.notification.createMany({
      data: validNotifications,
    });

    // Trigger real-time delivery for each
    for (const notification of validNotifications) {
      await this.deliverNotification(notification);
    }

    return created;
  }

  // Create notification from template
  static async createFromTemplate(
    userId: string,
    type: NotificationType,
    templateData: Record<string, any>,
    senderId?: string
  ) {
    const template = await this.getTemplate(type);
    if (!template) {
      throw new Error(`Template not found for type: ${type}`);
    }

    const title = this.interpolateTemplate(template.title, templateData);
    const message = this.interpolateTemplate(template.message, templateData);
    const actionUrl = template.actionUrl ? this.interpolateTemplate(template.actionUrl, templateData) : undefined;

    return this.createNotification({
      userId,
      type,
      title,
      message,
      actionUrl,
      actionText: template.actionText,
      priority: template.priority,
      category: template.category,
      senderId,
    });
  }

  // Get user notifications
  static async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      category?: NotificationCategory;
    } = {}
  ) {
    const { limit = 20, offset = 0, unreadOnly = false, category } = options;

    return prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly && { isRead: false }),
        ...(category && { category }),
        // include notifications that have no expiration OR not expired
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
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
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      take: limit,
      skip: offset,
    });
  }

  // Mark notification as read
  static async markAsRead(notificationId: string, userId: string) {
    const result = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    if (result.count > 0) {
      // Emit real-time event
      await pusher.trigger(`user-${userId}`, 'notification_read', {
        notificationId,
      });
    }

    return result;
  }

  // Mark all notifications as read
  static async markAllAsRead(userId: string, category?: NotificationCategory) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
        ...(category && { category }),
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  // Get unread count
  static async getUnreadCount(userId: string, category?: NotificationCategory) {
    return prisma.notification.count({
      where: {
        userId,
        isRead: false,
        ...(category && { category }),
        // include notifications without expiresAt or with expiresAt in future
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });
  }

  // Delete old notifications
  static async cleanupOldNotifications(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return prisma.notification.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        isRead: true,
      },
    });
  }

  // Private helper methods
  private static async getUserPreferences(userId: string, category: NotificationCategory) {
    return prisma.notificationPreference.findUnique({
      where: {
        userId_category: {
          userId,
          category,
        },
      },
    });
  }

  private static async getTemplate(type: NotificationType) {
    return prisma.notificationTemplate.findUnique({
      where: { type },
    });
  }

  private static interpolateTemplate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  private static isInQuietHours(preferences: any): boolean {
    if (!preferences?.quietHoursStart || !preferences?.quietHoursEnd) {
      return false;
    }
    // Implement quiet hours logic
    return false; // Simplified for now
  }

  private static getNextAvailableTime(preferences: any): Date {
    // Implement scheduling logic
    return new Date(Date.now() + 60 * 60 * 1000); // 1 hour later
  }

  private static async deliverNotification(notification: any) {
    // Implement real-time delivery (WebSocket, push notifications, etc.)
    // This would integrate with your real-time system
  }
}