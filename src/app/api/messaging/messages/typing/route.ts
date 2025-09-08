import { NextRequest, NextResponse } from 'next/server';
import { pusher } from '@/utils/Pusher';

export async function POST(req: NextRequest) {
    try {
        const { channel, event, data } = await req.json();

        if (!channel || !event || !data) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await pusher.trigger(channel, event, data);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to trigger typing event' }, { status: 500 });
    }
}