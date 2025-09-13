import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { linkedinService } from '@/services/LinkedInService';
import { prisma } from '@/lib/Prisma';

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Remove LinkedIn account
        await prisma.account.deleteMany({
            where: {
                userId: session.user.id,
                provider: 'linkedin'
            },
        });

        // Deactivate LinkedIn profile
        await linkedinService.disconnectProfile(session.user.id);

        return NextResponse.json({ success: true, message: 'LinkedIn disconnected successfully' });
    } catch (error) {
        console.error('LinkedIn disconnect error:', error);
        return NextResponse.json({ error: 'Failed to disconnect LinkedIn' }, { status: 500 });
    }
}