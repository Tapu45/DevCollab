import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { ConnectionType } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  // Overview: total, accepted, pending, blocked, declined
  if (action === 'overview') {
    const userId = session.user.id;
    const total = await prisma.connection.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
    });
    const accepted = await prisma.connection.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'ACCEPTED',
      },
    });
    const pending = await prisma.connection.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'PENDING',
      },
    });
    const blocked = await prisma.connection.count({
      where: {
        senderId: userId,
        status: 'BLOCKED',
      },
    });
    const declined = await prisma.connection.count({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'DECLINED',
      },
    });
    return NextResponse.json({ total, accepted, pending, blocked, declined });
  }

  // Growth: connections created per month (last 6 months)
  if (action === 'growth') {
    const userId = session.user.id;
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return date;
    }).reverse();

    const growth = await Promise.all(
      months.map(async (monthStart, idx) => {
        const monthEnd =
          idx < months.length - 1
            ? months[idx + 1]
            : new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 1);
        const count = await prisma.connection.count({
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
            createdAt: {
              gte: monthStart,
              lt: monthEnd,
            },
          },
        });
        return {
          month: monthStart.toISOString().slice(0, 7),
          count,
        };
      })
    );
    return NextResponse.json({ growth });
  }

  // Engagement: accepted connections with message count (basic metric)
  if (action === 'engagement') {
    const userId = session.user.id;
    // Count accepted connections
    const acceptedConnections = await prisma.connection.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
        status: 'ACCEPTED',
      },
      select: { id: true },
    });
    const connectionIds = acceptedConnections.map((c) => c.id);

    // Count messages exchanged in these connections (if you have a Message model with connectionId)
    // For now, just return accepted count
    return NextResponse.json({ acceptedConnections: connectionIds.length });
  }

  // Categories: distribution of connection types
  if (action === 'categories') {
    const userId = session.user.id;
    const types = [
      'COLLABORATOR',
      'MENTOR',
      'MENTEE',
      'FRIEND',
      'COLLEAGUE',
      'PROFESSIONAL',
    ];
    const distribution: Record<string, number> = {};
    for (const type of types) {
      // eslint-disable-next-line no-await-in-loop
      distribution[type] = await prisma.connection.count({
        where: {
          OR: [{ senderId: userId }, { receiverId: userId }],
          status: 'ACCEPTED',
          type: type as ConnectionType,
        },
      });
    }
    return NextResponse.json({ distribution });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}