import { NextRequest, NextResponse } from 'next/server';
import { pusher } from '@/utils/Pusher';
import { prisma } from '@/lib/Prisma';

export async function POST(req: NextRequest) {
    try {
        const { userId, isOnline, lastSeen } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'userId is required' }, { status: 400 });
        }

        // Update user presence in database
        const updateData: any = { isOnline };
        if (lastSeen) updateData.lastSeen = new Date(lastSeen);
        if (!isOnline) updateData.lastSeen = new Date(); // Set lastSeen when going offline

        await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // Trigger Pusher event for real-time updates
        await pusher.trigger(`user-${userId}`, 'user_presence', {
            isOnline,
            lastSeen: updateData.lastSeen?.toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Presence update error:', error);
        return NextResponse.json({ error: 'Failed to update presence' }, { status: 500 });
    }
}