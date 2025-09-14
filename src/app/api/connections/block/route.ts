import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { auth } from '@clerk/nextjs/server';

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

  // Check if already blocked
  const existing = await prisma.connection.findFirst({
    where: {
      senderId: userId,
      receiverId: targetUserId,
      status: 'BLOCKED',
    },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already blocked' }, { status: 409 });
  }

  // Block user (create or update connection)
  const connection = await prisma.connection.upsert({
    where: {
      senderId_receiverId: {
        senderId: userId,
        receiverId: targetUserId,
      },
    },
    update: {
      status: 'BLOCKED',
      type: 'COLLABORATOR', // or any default type
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

  return NextResponse.json({ success: true, connection });
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

  // Find blocked connection
  const connection = await prisma.connection.findFirst({
    where: {
      senderId: userId,
      receiverId: targetUserId,
      status: 'BLOCKED',
    },
  });

  if (!connection) {
    return NextResponse.json({ error: 'User not blocked' }, { status: 404 });
  }

  // Unblock: delete or update status
  await prisma.connection.delete({
    where: { id: connection.id },
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