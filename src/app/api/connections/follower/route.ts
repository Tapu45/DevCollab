import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'followers') {
    // Users who follow the current user
    const followers = await prisma.connection.findMany({
      where: {
        receiverId: session.user.id,
        status: 'ACCEPTED',
        type: 'FRIEND', // or 'FOLLOWER' if you use a specific type
      },
      include: {
        sender: { select: { id: true, username: true, profilePictureUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ followers });
  }

  if (action === 'following') {
    // Users whom the current user follows
    const following = await prisma.connection.findMany({
      where: {
        senderId: session.user.id,
        status: 'ACCEPTED',
        type: 'FRIEND', // or 'FOLLOWER' if you use a specific type
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, userId } = await req.json();

  if (action !== 'follow') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!userId || userId === session.user.id) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  // Prevent duplicate follow
  const existing = await prisma.connection.findFirst({
    where: {
      senderId: session.user.id,
      receiverId: userId,
      type: 'FRIEND', // or 'FOLLOWER'
      status: 'ACCEPTED',
    },
  });
  if (existing) {
    return NextResponse.json({ error: 'Already following' }, { status: 409 });
  }

  // Create follow connection
  const connection = await prisma.connection.create({
    data: {
      senderId: session.user.id,
      receiverId: userId,
      type: 'FRIEND', // or 'FOLLOWER'
      status: 'ACCEPTED',
    },
  });

  return NextResponse.json({ success: true, connection });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, userId } = await req.json();

  if (action !== 'unfollow') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!userId || userId === session.user.id) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  // Find and delete follow connection
  const connection = await prisma.connection.findFirst({
    where: {
      senderId: session.user.id,
      receiverId: userId,
      type: 'FRIEND', // or 'FOLLOWER'
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