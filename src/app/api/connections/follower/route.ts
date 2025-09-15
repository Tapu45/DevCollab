import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'followers') {
    // Users who follow the current user (modeled as FRIEND accepted inbound)
    const followers = await prisma.connection.findMany({
      where: {
        receiverId: userId,
        status: 'ACCEPTED',
        type: 'FRIEND',
      },
      include: {
        sender: { select: { id: true, username: true, profilePictureUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ followers });
  }

  if (action === 'following') {
    // Users whom the current user follows (modeled as FRIEND accepted outbound)
    const following = await prisma.connection.findMany({
      where: {
        senderId: userId,
        status: 'ACCEPTED',
        type: 'FRIEND',
      },
      include: {
        receiver: { select: { id: true, username: true, profilePictureUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ following });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, userId: targetUserId } = await req.json();

  if (action !== 'follow') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  // Prevent duplicate "follow"
  const existing = await prisma.connection.findFirst({
    where: {
      senderId: userId,
      receiverId: targetUserId,
      type: 'FRIEND',
      status: 'ACCEPTED',
    },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already following' }, { status: 409 });
  }

  // Create follow connection (accepted one-way)
  const connection = await prisma.connection.create({
    data: {
      senderId: userId,
      receiverId: targetUserId,
      type: 'FRIEND',
      status: 'ACCEPTED',
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

  if (action !== 'unfollow') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!targetUserId || targetUserId === userId) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  const connection = await prisma.connection.findFirst({
    where: {
      senderId: userId,
      receiverId: targetUserId,
      type: 'FRIEND',
      status: 'ACCEPTED',
    },
  });

  if (!connection) {
    return NextResponse.json({ error: 'Not following' }, { status: 404 });
  }

  await prisma.connection.delete({
    where: { id: connection.id },
  });

  return NextResponse.json({ success: true });
}