import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const accounts = await prisma.account.findMany({
        where: { userId: userId },
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