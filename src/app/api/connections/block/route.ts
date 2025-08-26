import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, userId } = await req.json();

  if (action !== 'block') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!userId || userId === session.user.id) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  // Check if already blocked
  const existing = await prisma.connection.findFirst({
    where: {
      senderId: session.user.id,
      receiverId: userId,
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
        senderId: session.user.id,
        receiverId: userId,
      },
    },
    update: {
      status: 'BLOCKED',
      type: 'COLLABORATOR', // or any default type
      message: 'User blocked',
    },
    create: {
      senderId: session.user.id,
      receiverId: userId,
      status: 'BLOCKED',
      type: 'COLLABORATOR',
      message: 'User blocked',
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

  if (action !== 'unblock') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  if (!userId || userId === session.user.id) {
    return NextResponse.json({ error: 'Invalid userId' }, { status: 400 });
  }

  // Find blocked connection
  const connection = await prisma.connection.findFirst({
    where: {
      senderId: session.user.id,
      receiverId: userId,
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
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get('action');

  if (action === 'blocked') {
    // List users blocked by current user
    const blocked = await prisma.connection.findMany({
      where: {
        senderId: session.user.id,
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