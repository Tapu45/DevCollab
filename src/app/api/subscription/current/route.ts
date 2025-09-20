import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';
import { PLAN_LIMITS } from '@/middleware/subscription-middleware';
import { SubscriptionService } from '@/services/SubscriptionService';
import { PlanType } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await SubscriptionService.getUserSubscription(userId);

    if (!subscription) {
      return NextResponse.json({
        planType: 'FREE',
        status: 'ACTIVE',
        limits: PLAN_LIMITS.FREE,
        isActive: true,
        nextBillingDate: null,
        gracePeriodEnd: null,
      });
    }

    const isActive = SubscriptionService.isSubscriptionActive(subscription);

    return NextResponse.json({
      planType: subscription.plan.type,
      status: subscription.status,
      limits: PLAN_LIMITS[subscription.plan.type],
      isActive,
      nextBillingDate: subscription.nextBillingDate,
      currentPeriodEnd: subscription.currentPeriodEnd,
      gracePeriodEnd: subscription.gracePeriodEnd,
      failedPaymentCount: subscription.failedPaymentCount,
      autoRenew: subscription.autoRenew,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}