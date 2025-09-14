import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MessagingService } from '@/services/MessagingService';

export async function POST(
  req: NextRequest,
  context: { params: { chatId: string } }
) {
  const { chatId } = (await context.params) as { chatId: string };
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await MessagingService.markChatAsRead(chatId, userId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}