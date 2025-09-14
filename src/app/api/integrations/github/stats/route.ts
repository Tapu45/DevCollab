import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { githubAppService } from '@/services/Integration/GitHubAppService';

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const stats = await githubAppService.getUserStats(userId);
        return NextResponse.json({ stats });
    } catch (error) {
        console.error('GitHub stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch GitHub stats' }, { status: 500 });
    }
}