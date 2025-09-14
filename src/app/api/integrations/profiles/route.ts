import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function GET() {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await prisma.externalProfile.findMany({
        where: { userId: userId },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { provider, username, url } = await req.json();

    if (!provider || !username) {
        return NextResponse.json({ error: 'provider and username are required' }, { status: 400 });
    }

    const profile = await prisma.externalProfile.upsert({
        where: { userId_provider: { userId: userId, provider } },
        update: { username, url },
        create: { userId: userId, provider, username, url },
    });

    return NextResponse.json({ profile });
}