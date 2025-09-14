import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const chatId = searchParams.get('chatId');
    const type = searchParams.get('type'); // 'text', 'image', 'file', etc.
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    const senderId = searchParams.get('senderId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ messages: [], totalCount: 0, hasMore: false });
    }

    // Build where clause
    const whereClause: any = {
      AND: [
        // User must be participant in the chat
        {
          chat: {
            participants: {
              some: {
                userId: userId,
                isActive: true
              }
            }
          }
        },
        // Message must not be deleted
        { isDeleted: false },
        // Text search
        {
          content: {
            contains: query.trim(),
            mode: 'insensitive'
          }
        }
      ]
    };

    // Add optional filters
    if (chatId) {
      whereClause.AND.push({ chatId });
    }

    if (type && type !== 'all') {
      whereClause.AND.push({ type: type.toUpperCase() });
    }

    if (dateFrom) {
      whereClause.AND.push({
        createdAt: { gte: new Date(dateFrom) }
      });
    }

    if (dateTo) {
      whereClause.AND.push({
        createdAt: { lte: new Date(dateTo) }
      });
    }

    if (senderId) {
      whereClause.AND.push({ senderId });
    }

    // Get total count
    const totalCount = await prisma.message.count({ where: whereClause });

    // Get messages with pagination
    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            profilePictureUrl: true
          }
        },
        chat: {
          select: {
            id: true,
            name: true,
            type: true,
            project: {
              select: {
                id: true,
                title: true
              }
            }
          }
        },
        replyTo: {
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        },
        reactions: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    });

    const hasMore = totalCount > page * limit;

    return NextResponse.json({
      messages,
      totalCount,
      hasMore,
      currentPage: page
    });
  } catch (error) {
    console.error('Error searching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}