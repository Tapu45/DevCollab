import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sessionService } from '@/services/SessionService';

export async function DELETE(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const terminatedCount = await sessionService.terminateAllSessions(userId);

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