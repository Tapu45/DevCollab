import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userIds } = await request.json();
    const chatId = params.id;

    // Verify user is admin of the chat
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: userId,
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
          senderId: userId,
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId: targetUserId } = await request.json();
    const chatId = params.id;

    // Verify user is admin or removing themselves
    const isAdmin = await prisma.chatParticipant.findFirst({
      where: {
        chatId,
        userId: userId,
        isAdmin: true,
        isActive: true
      }
    });

    if (!isAdmin && targetUserId !== userId) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
    }

    // Remove participant
    await prisma.chatParticipant.updateMany({
      where: {
        chatId,
        userId: targetUserId
      },
      data: {
        isActive: false,
        leftAt: new Date()
      }
    });

    // Create system message
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { displayName: true, username: true }
    });

    await prisma.message.create({
      data: {
        chatId,
        senderId: userId,
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