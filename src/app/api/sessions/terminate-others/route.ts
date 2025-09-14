import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sessionService } from '@/services/SessionService';

export async function DELETE(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get current session token from request
        const currentSessionToken = req.headers.get('x-session-token');
        if (!currentSessionToken) {
            return NextResponse.json({ error: 'Current session token required' }, { status: 400 });
        }

        const terminatedCount = await sessionService.terminateOtherSessions(userId, currentSessionToken);

        return NextResponse.json({
            success: true,
            message: `Terminated ${terminatedCount} other sessions`,
            terminatedCount
        });
    } catch (error) {
        console.error('Terminate other sessions error:', error);
        return NextResponse.json({ error: 'Failed to terminate other sessions' }, { status: 500 });
    }
}