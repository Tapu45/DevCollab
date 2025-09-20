import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const profile = await prisma.externalProfile.findUnique({ where: { id: params.id } });
    if (!profile || profile.userId !== userId) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.externalProfile.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
}