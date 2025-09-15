import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { auth } from '@clerk/nextjs/server';
import { validateConnectionRequest } from '@/lib/ValidateConnect';
import { ConnectionNotificationService } from '@/services/ConnectionNotificationService';

enum ConnectionStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  DECLINED = 'DECLINED',
  WITHDRAWN = 'WITHDRAWN',
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, receiverId, type, message } = await req.json();

  if (action !== 'request') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!receiverId || receiverId === userId) {
    return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
  }

  const allowed = await validateConnectionRequest(userId, receiverId);
  if (!allowed) {
    return NextResponse.json({ error: 'Connection request not allowed by receiver privacy settings' }, { status: 403 });
  }

  // Prevent duplicate pending requests
  const existing = await prisma.connection.findFirst({
    where: {
      senderId: userId,
      receiverId,
      status: ConnectionStatus.PENDING,
    },
  });
  if (existing) {
    return NextResponse.json({ error: 'Request already sent' }, { status: 409 });
  }

  const connection = await prisma.connection.create({
    data: {
      senderId: userId,
      receiverId,
      type,
      status: ConnectionStatus.PENDING,
      message,
    },
  });

  await ConnectionNotificationService.notifyConnectionRequest(
    userId,
    receiverId,
    message
  );

  return NextResponse.json({ success: true, connection });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'pending') {
    // Received requests
    const pending = await prisma.connection.findMany({
      where: {
        receiverId: userId,
        status: ConnectionStatus.PENDING,
      },
      include: { sender: { select: { id: true, username: true, profilePictureUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ pending });
  }

  if (action === 'sent') {
    // Sent requests
    const sent = await prisma.connection.findMany({
      where: {
        senderId: userId,
        status: ConnectionStatus.PENDING,
      },
      include: { receiver: { select: { id: true, username: true, profilePictureUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ sent });
  }

  if (action === 'accepted') {
    // Accepted connections (both sent and received)
    const acceptedConnections = await prisma.connection.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ],
        status: ConnectionStatus.ACCEPTED,
      },
      include: {
        sender: { select: { id: true, username: true, profilePictureUrl: true, displayName: true } },
        receiver: { select: { id: true, username: true, profilePictureUrl: true, displayName: true } }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map to array of "other user" objects
    const accepted = acceptedConnections.map(conn => {
      // If current user is sender, return receiver; else return sender
      return conn.senderId === userId ? conn.receiver : conn.sender;
    });

    return NextResponse.json({ accepted });
  }

  if (action === 'connected') {
    // Find all accepted connections where the user is either sender or receiver
    const connections = await prisma.connection.findMany({
      where: {
        status: ConnectionStatus.ACCEPTED,
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: { select: { id: true, username: true, profilePictureUrl: true, displayName: true } },
        receiver: { select: { id: true, username: true, profilePictureUrl: true, displayName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Map to array of { user, connectedSince, type, connectionId }
    const connected = connections.map(conn => {
      const isSender = conn.senderId === userId;
      const user = isSender ? conn.receiver : conn.sender;
      return {
        ...user,
        connectedSince: conn.createdAt,
        type: conn.type,
        connectionId: conn.id,
      };
    });

    return NextResponse.json({ connected });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, connectionId, response } = await req.json();

  if (action !== 'respond') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!connectionId || !['ACCEPTED', 'DECLINED'].includes(response)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // Only receiver can respond
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (!connection || connection.receiverId !== userId || connection.status !== ConnectionStatus.PENDING) {
    return NextResponse.json({ error: 'Connection not found or not allowed' }, { status: 404 });
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { status: response },
  });

  if (response === 'ACCEPTED') {
    await ConnectionNotificationService.notifyConnectionAccepted(
      userId,
      connection.senderId
    );
  } else if (response === 'DECLINED') {
    await ConnectionNotificationService.notifyConnectionDeclined(
      userId,
      connection.senderId
    );
  }

  return NextResponse.json({ success: true, connection: updated });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, connectionId, targetUserId } = await req.json();

  if (action === 'withdraw') {
    if (!connectionId) {
      return NextResponse.json({ error: 'Missing connectionId' }, { status: 400 });
    }

    // Only sender can withdraw
    const connection = await prisma.connection.findUnique({
      where: { id: connectionId },
    });

    if (!connection || connection.senderId !== userId || connection.status !== ConnectionStatus.PENDING) {
      return NextResponse.json({ error: 'Connection not found or not allowed' }, { status: 404 });
    }

    await prisma.connection.delete({
      where: { id: connectionId },
    });

    return NextResponse.json({ success: true });
  }

  if (action === 'disconnect') {
    if (!connectionId && !targetUserId) {
      return NextResponse.json({ error: 'Provide connectionId or targetUserId' }, { status: 400 });
    }

    // Resolve the accepted connection
    const connection = connectionId
      ? await prisma.connection.findFirst({
        where: { id: connectionId, status: 'ACCEPTED' },
      })
      : await prisma.connection.findFirst({
        where: {
          status: 'ACCEPTED',
          OR: [
            { senderId: userId, receiverId: targetUserId },
            { senderId: targetUserId as string, receiverId: userId },
          ],
        },
      });

    if (!connection) {
      return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    if (connection.senderId !== userId && connection.receiverId !== userId) {
      return NextResponse.json({ error: 'Not allowed' }, { status: 403 });
    }

    await prisma.connection.delete({ where: { id: connection.id } });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}