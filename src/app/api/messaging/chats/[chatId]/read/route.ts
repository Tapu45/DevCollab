import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../auth/[...nextauth]/route';
import { MessagingService } from '@/services/MessagingService';

export async function POST(
  req: NextRequest,
  context: { params: { chatId: string } }
) {
  const { chatId } = (await context.params) as { chatId: string };
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await MessagingService.markChatAsRead(chatId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });    
  }
}