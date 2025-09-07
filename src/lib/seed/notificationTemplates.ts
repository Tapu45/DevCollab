import { prisma } from '../../lib/Prisma.js';
import { NotificationType, NotificationPriority, NotificationCategory } from '../../generated/prisma/index.js';

const templates = [
  {
    type: NotificationType.CONNECTION_REQUEST,
    title: 'New Connection Request',
    message: '{{senderName}} wants to connect with you{{#message}} - "{{message}}"{{/message}}',
    actionUrl: '/connections/pending',
    actionText: 'View Request',
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.CONNECTION,
  },
  {
    type: NotificationType.CONNECTION_ACCEPTED,
    title: 'Connection Accepted',
    message: '{{accepterName}} accepted your connection request',
    actionUrl: '/connections',
    actionText: 'View Connection',
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.CONNECTION,
  },
  {
    type: NotificationType.CONNECTION_DECLINED,
    title: 'Connection Declined',
    message: '{{declinerName}} declined your connection request',
    actionUrl: '/connections',
    actionText: 'View Connections',
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.CONNECTION,
  },
  {
    type: NotificationType.MESSAGE_RECEIVED,
    title: 'New Message in {{chatName}}',
    message: '{{senderName}}: {{messagePreview}}',
    actionUrl: '/messages',
    actionText: 'Open Chat',
    priority: NotificationPriority.NORMAL,
    category: NotificationCategory.MESSAGE,
  },
];

export async function seedNotificationTemplates() {
  let successCount = 0;
  let errorCount = 0;
  for (const template of templates) {
    try {
      await prisma.notificationTemplate.upsert({
        where: { type: template.type },
        update: template,
        create: template,
      });
      console.log(`✅ Seeded template: ${template.type}`);
      successCount++;
    } catch (err) {
      console.error(`❌ Error seeding template: ${template.type}`, err);
      errorCount++;
    }
  }
  console.log(`\nSeeding complete. Success: ${successCount}, Errors: ${errorCount}`);
}

seedNotificationTemplates()
  .then(() => {
    console.log('All notification templates seeded.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });