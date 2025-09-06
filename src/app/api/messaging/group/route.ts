import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import {prisma} from '@/lib/Prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, projectId, participantIds, isPublic } = await request.json();

    // Verify user has permission to create group chat for project
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          OR: [
            { ownerId: session.user.id },
            {
              collaborators: {
                some: {
                  userId: session.user.id,
                  role: { in: ['OWNER', 'CO_OWNER'] }
                }
              }
            }
          ]
        }
      });

      if (!project) {
        return NextResponse.json({ error: 'Permission denied' }, { status: 403 });
      }
    }

    // Create group chat
    const chat = await prisma.chat.create({
      data: {
        type: 'GROUP',
        name,
        description,
        projectId,
        settings: {
          create: {
            isPublic: isPublic || false,
            allowFileSharing: true,
            allowReactions: true,
            allowPolls: true,
            maxParticipants: 50,
            inviteCode: isPublic ? Math.random().toString(36).substring(2, 15) : null
          }
        },
        participants: {
          create: [
            {
              userId: session.user.id,
              isAdmin: true
            },
            ...participantIds.map((userId: string) => ({
              userId,
              isAdmin: false
            }))
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true
              }
            }
          }
        },
        settings: true,
        project: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating group chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');

    const chats = await prisma.chat.findMany({
      where: {
        type: 'GROUP',
        projectId: projectId || undefined,
        participants: {
          some: {
            userId: session.user.id,
            isActive: true
          }
        }
      },
      include: {
        participants: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                profilePictureUrl: true
              }
            }
          }
        },
        settings: true,
        project: {
          select: {
            id: true,
            title: true
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
                }
              }
            }
          }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching group chats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}