import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MessagingService } from '@/services/MessagingService';

export async function GET(
  req: NextRequest,
  context: { params: { chatId: string } }
) {
  const { params } = context;
  const awaitedParams = await params;
  const chatId = awaitedParams.chatId;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get('limit') || '50');
  const offset = parseInt(searchParams.get('offset') || '0');
  const before = searchParams.get('before');

  try {
    const messages = await MessagingService.getChatMessages(chatId, userId, {
      limit,
      offset,
      before: before === null ? undefined : before,
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: { chatId: string } }
) {
  const { params } = context;
  const awaitedParams = await params;
  const chatId = awaitedParams.chatId;

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();
    const message = await MessagingService.sendMessage({
      ...data,
      chatId,
      senderId: userId,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}