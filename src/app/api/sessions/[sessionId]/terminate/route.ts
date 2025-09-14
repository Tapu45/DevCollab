import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sessionService } from '@/services/SessionService';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const success = await sessionService.terminateSession(params.sessionId, userId);

        if (!success) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Session terminated successfully' });
    } catch (error) {
        console.error('Terminate session error:', error);
        return NextResponse.json({ error: 'Failed to terminate session' }, { status: 500 });
    }
}