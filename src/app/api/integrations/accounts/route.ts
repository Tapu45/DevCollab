import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/Prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const accounts = await prisma.account.findMany({
        where: { userId: session.user.id },
        select: {
            id: true,
            provider: true,
            providerAccountId: true,
            expires_at: true,
            scope: true,
        }
    });

    return NextResponse.json({ accounts });
}