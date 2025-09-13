import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { sessionService } from '@/services/SessionService';

export async function DELETE(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const terminatedCount = await sessionService.terminateAllSessions(session.user.id);

        return NextResponse.json({
            success: true,
            message: `Terminated ${terminatedCount} sessions`,
            terminatedCount
        });
    } catch (error) {
        console.error('Terminate all sessions error:', error);
        return NextResponse.json({ error: 'Failed to terminate all sessions' }, { status: 500 });
    }
}