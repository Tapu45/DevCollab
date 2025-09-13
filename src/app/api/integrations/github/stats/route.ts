import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { githubAppService } from '@/services/Integration/GitHubAppService';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const stats = await githubAppService.getUserStats(session.user.id);
        return NextResponse.json({ stats });
    } catch (error) {
        console.error('GitHub stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch GitHub stats' }, { status: 500 });
    }
}