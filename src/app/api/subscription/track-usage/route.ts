import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';
import { pusher } from '@/utils/Pusher';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { action, resource } = await request.json();

        if (!action || !resource) {
            return NextResponse.json(
                { error: 'Action and resource are required' },
                { status: 400 }
            );
        }

        // Track the usage action
        await prisma.userActivity.create({
            data: {
                userId,
                action: `SUBSCRIPTION_${action.toUpperCase()}`,
                resource,
                metadata: {
                    timestamp: new Date().toISOString(),
                    resourceType: resource,
                },
            },
        });

        // Trigger real-time usage update
        await pusher.trigger(`user-${userId}`, 'usage_updated', {
            action,
            resource,
            timestamp: new Date().toISOString(),
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error tracking usage:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}