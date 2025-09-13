import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { linkedinService } from '@/services/LinkedInService';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const authUrl = linkedinService.generateAuthUrl(session.user.id);
        return NextResponse.json({ authUrl });
    } catch (error) {
        console.error('LinkedIn connect error:', error);
        return NextResponse.json({ error: 'Failed to generate LinkedIn auth URL' }, { status: 500 });
    }
}