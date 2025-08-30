import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Check both sent and received connections
  const connection = await prisma.connection.findFirst({
    where: {
      OR: [
        { senderId: session.user.id, receiverId: userId },
        { senderId: userId, receiverId: session.user.id },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!connection) {
    return NextResponse.json({ status: 'NONE' });
  }

  return NextResponse.json({ status: connection.status });
}