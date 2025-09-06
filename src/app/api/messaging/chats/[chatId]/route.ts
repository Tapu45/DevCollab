import { NextRequest, NextResponse } from 'next/server';
import { MessagingService } from '@/services/MessagingService';

export async function GET(
  req: NextRequest,
  context: { params: { chatId: string } }
) {
  const awaitedParams = await context.params;
  const chatId = awaitedParams.chatId;
  try {
    const chat = await MessagingService.getChatById(chatId);
    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
    return NextResponse.json({ chat });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}