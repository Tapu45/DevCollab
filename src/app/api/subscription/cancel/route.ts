import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { SubscriptionService } from '@/services/SubscriptionService';

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { immediate = false } = await request.json();

        const subscription = await SubscriptionService.cancelSubscription(userId, immediate);

        return NextResponse.json({
            success: true,
            subscription: {
                id: subscription.id,
                status: subscription.status,
                cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
                canceledAt: subscription.canceledAt
            }
        });
    } catch (error) {
        console.error('Error canceling subscription:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}