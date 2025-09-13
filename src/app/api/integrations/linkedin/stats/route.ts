import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { linkedinService } from '@/services/LinkedInService';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const stats = await linkedinService.getUserStats(session.user.id);

        if (!stats) {
            return NextResponse.json({ error: 'LinkedIn profile not found' }, { status: 404 });
        }

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('LinkedIn stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch LinkedIn stats' }, { status: 500 });
    }
}