import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import { sessionService } from '@/services/SessionService';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { sessionId: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const success = await sessionService.terminateSession(params.sessionId, session.user.id);

        if (!success) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'Session terminated successfully' });
    } catch (error) {
        console.error('Terminate session error:', error);
        return NextResponse.json({ error: 'Failed to terminate session' }, { status: 500 });
    }
}