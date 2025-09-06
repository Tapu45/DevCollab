import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {prisma} from '@/lib/Prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds } = await request.json();
    const chatId = params.id;

    // Verify user is admin of the chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: session.user.id,
        isAdmin: true,
        isActive: true
      }
    });

    if (!participant) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Add participants
    const newParticipants = await prisma.chatParticipant.createMany({
      data: userIds.map((userId: string) => ({
        chatId,
        userId,
        isAdmin: false
      })),
      skipDuplicates: true
    });

    // Create system message for new participants
    if (newParticipants.count > 0) {
      await prisma.message.create({
        data: {
          chatId,
          senderId: session.user.id,
          content: `Added ${newParticipants.count} new participant(s) to the group`,
          type: 'SYSTEM'
        }
      });
    }

    return NextResponse.json({ added: newParticipants.count });
  } catch (error) {
    console.error('Error adding participants:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();
    const chatId = params.id;

    // Verify user is admin or removing themselves
    const isAdmin = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: session.user.id,
        isAdmin: true,
        isActive: true
      }
    });

    if (!isAdmin && userId !== session.user.id) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Remove participant
    await prisma.chatParticipant.updateMany({
      where: {
        chatId,
        userId
      },
      data: {
        isActive: false,
        leftAt: new Date()
      }
    });

    // Create system message
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true, username: true }
    });

    await prisma.message.create({
      data: {
        chatId,
        senderId: session.user.id,
        content: `${user?.displayName || user?.username} left the group`,
        type: 'SYSTEM'
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing participant:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}