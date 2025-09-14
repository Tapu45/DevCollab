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

  // Helper to map action to ConnectionType
  const typeMap: Record<string, string> = {
    collaborators: 'COLLABORATOR',
    mentors: 'MENTOR',
    mentees: 'MENTEE',
    friends: 'FRIEND',
  };

  if (action && typeMap[action]) {
    // List connections by category (type)
    const connections = await prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
        type: typeMap[action] as any,
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      include: {
        sender: { select: { id: true, username: true, profilePictureUrl: true } },
        receiver: { select: { id: true, username: true, profilePictureUrl: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ connections });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function PUT(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, connectionId, newType } = await req.json();

  if (action !== 'category') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  // Validate newType
  const validTypes = ['COLLABORATOR', 'MENTOR', 'MENTEE', 'FRIEND', 'COLLEAGUE', 'PROFESSIONAL'];
  if (!connectionId || !validTypes.includes(newType)) {
    return NextResponse.json({ error: 'Invalid parameters' }, { status: 400 });
  }

  // Only sender or receiver can update category
  const connection = await prisma.connection.findUnique({
    where: { id: connectionId },
  });

  if (
    !connection ||
    (connection.senderId !== userId && connection.receiverId !== userId) ||
    connection.status !== 'ACCEPTED'
  ) {
    return NextResponse.json({ error: 'Connection not found or not allowed' }, { status: 404 });
  }

  const updated = await prisma.connection.update({
    where: { id: connectionId },
    data: { type: newType },
  });

  return NextResponse.json({ success: true, connection: updated });
}