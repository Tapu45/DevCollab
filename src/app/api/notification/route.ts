import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { NotificationService } from '@/services/NotificationService';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '20');
  const offset = parseInt(searchParams.get('offset') || '0');
  const unreadOnly = searchParams.get('unreadOnly') === 'true';
  const category = searchParams.get('category') as any;

  const notifications = await NotificationService.getUserNotifications(
    session.user.id,
    { limit, offset, unreadOnly, category }
  );

  const unreadCount = await NotificationService.getUnreadCount(session.user.id);

  return NextResponse.json({
    notifications,
    unreadCount,
    hasMore: notifications.length === limit,
  });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, notificationId, category } = await req.json();

  if (action === 'markAsRead' && notificationId) {
    await NotificationService.markAsRead(notificationId, session.user.id);
    return NextResponse.json({ success: true });
  }

  if (action === 'markAllAsRead') {
    await NotificationService.markAllAsRead(session.user.id, category);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}