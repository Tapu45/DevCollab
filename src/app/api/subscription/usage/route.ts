import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      projectCount,
      connectionCount,
      teamMemberCount,
      todayMessages,
      todayPosts,
    ] = await Promise.all([
      prisma.project.count({
        where: { ownerId: userId }
      }),
      prisma.connection.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ],
          status: 'ACCEPTED'
        }
      }),
      prisma.projectCollaborator.count({
        where: {
          project: { ownerId: userId },
          isActive: true
        }
      }),
      prisma.message.count({
        where: {
          senderId: userId,
          createdAt: { gte: today }
        }
      }),
      prisma.forumPost.count({
        where: {
          authorId: userId,
          createdAt: { gte: today }
        }
      }),
    ]);

    return NextResponse.json({
      projects: projectCount,
      connections: connectionCount,
      teamMembers: teamMemberCount,
      storageUsed: 0, // Implement based on your file storage
      apiCallsToday: 0, // Implement based on your API tracking
      postsToday: todayPosts,
      messagesToday: todayMessages,
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}