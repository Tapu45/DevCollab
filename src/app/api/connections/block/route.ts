import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { auth } from '@clerk/nextjs/server';
import { ConnectionNotificationService } from '@/services/ConnectionNotificationService';

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, userId: targetUserId } = await req.json();

  if (action !== 'block') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  // Block user: ensure any existing ties are removed, create/update BLOCKED, and sync privacy
  const result = await prisma.$transaction(async (tx) => {
    // Remove any existing connections in either direction (pending/accepted/declined)
    await tx.connection.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId },
        ],
      },
    });

    // Create or update a BLOCKED record in one canonical direction (current user blocks target)
    const connection = await tx.connection.upsert({
      where: {
        senderId_receiverId: {
          senderId: userId,
          receiverId: targetUserId,
        },
      },
      update: {
        status: 'BLOCKED',
        message: 'User blocked',
      },
      create: {
        senderId: userId,
        receiverId: targetUserId,
        status: 'BLOCKED',
        type: 'COLLABORATOR',
        message: 'User blocked',
      },
    });

    // Sync privacy.blockedUserIds
    const privacy = await tx.connectionPrivacy.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        blockedUserIds: [],
      },
    });

    const newBlocked = Array.from(new Set([...(privacy.blockedUserIds || []), targetUserId]));
    await tx.connectionPrivacy.update({
      where: { userId },
      data: { blockedUserIds: newBlocked },
    });

    return connection;
  });

  // // Notify the blocked user (optional informational)
  // try {
  //   await ConnectionNotificationService.notifyUserBlocked(userId, targetUserId);
  // } catch (_) {
  //   // best-effort
  // }

  return NextResponse.json({ success: true, connection: result });
}

export async function DELETE(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, userId: targetUserId } = await req.json();

  if (action !== 'unblock') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    // Remove BLOCKED record if exists (canonical direction)
    await tx.connection.deleteMany({
      where: {
        senderId: userId,
        receiverId: targetUserId,
        status: 'BLOCKED',
      },
    });

    // Remove from privacy.blockedUserIds
    const privacy = await tx.connectionPrivacy.findUnique({ where: { userId } });
    if (privacy?.blockedUserIds?.length) {
      const updated = privacy.blockedUserIds.filter((id) => id !== targetUserId);
      await tx.connectionPrivacy.update({
        where: { userId },
        data: { blockedUserIds: updated },
      });
    }
  });

  return NextResponse.json({ success: true });
}

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'blocked') {
    // List users blocked by current user
    const blocked = await prisma.connection.findMany({
      where: {
        senderId: userId,
        status: 'BLOCKED',
      },
      include: {
        receiver: { select: { id: true, username: true, profilePictureUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ blocked });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}