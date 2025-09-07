'use client';

import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { usePusherEvent } from '@/hooks/Pusher';

export function NotificationManager() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  usePusherEvent({
    channelName: userId ? `user-${userId}` : '',
    eventName: 'notification_received',
    callback: (notification) => {
      toast(notification.title, {
        description: notification.message,
        action: notification.actionUrl
          ? {
              label: notification.actionText || 'View',
              onClick: () => (window.location.href = notification.actionUrl!),
            }
          : undefined,
        duration: 5000,
        position: 'bottom-right',
        style: {
          backgroundColor: 'var(--color-card)',
          color: 'var(--color-card-foreground)',
          border: '1px solid var(--color-border)',
        },
      });
    },
  });

  return null; // This component doesn't render anything
}
