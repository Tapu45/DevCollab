import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { MessagingService } from '@/services/MessagingService';
import { ChatType } from '@/generated/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') as ChatType;
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');

  try {
    const chats = await MessagingService.getUserChats(session.user.id, {
      type,
      limit,
      offset,
    });

    return NextResponse.json({ chats });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const chat = await MessagingService.createChat(data, session.user.id);

    return NextResponse.json({ chat }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create chat';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}