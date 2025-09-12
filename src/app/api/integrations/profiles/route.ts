import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/Prisma';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profiles = await prisma.externalProfile.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ profiles });
}

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { provider, username, url } = await req.json();

    if (!provider || !username) {
        return NextResponse.json({ error: 'provider and username are required' }, { status: 400 });
    }

    const profile = await prisma.externalProfile.upsert({
        where: { userId_provider: { userId: session.user.id, provider } },
        update: { username, url },
        create: { userId: session.user.id, provider, username, url },
    });

    return NextResponse.json({ profile });
}