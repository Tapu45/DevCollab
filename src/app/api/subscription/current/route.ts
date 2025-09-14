import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';
import { PLAN_LIMITS } from '@/middleware/subscription-middleware';
import { SubscriptionStatus } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: userId },
      include: { plan: true },
    });

    if (!subscription) {
      // Default to FREE plan
      return NextResponse.json({
        planType: 'FREE',
        status: 'ACTIVE',
        limits: PLAN_LIMITS.FREE,
        isActive: true,
      });
    }

    const isActive = isSubscriptionActive(subscription);

    return NextResponse.json({
      planType: subscription.plan.type,
      status: subscription.status,
      limits: PLAN_LIMITS[subscription.plan.type],
      isActive,
      trialEndsAt: subscription.trialEnd,
      currentPeriodEnd: subscription.currentPeriodEnd,
      stripeSubscriptionId: subscription.stripeSubscriptionId, // Using stripeSubscriptionId instead
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function isSubscriptionActive(subscription: any): boolean {
  const now = new Date();

  if (subscription.status !== SubscriptionStatus.ACTIVE &&
    subscription.status !== SubscriptionStatus.TRIAL) {
    return false;
  }

  if (subscription.status === SubscriptionStatus.TRIAL) {
    return subscription.trialEnd ? new Date(subscription.trialEnd) > now : false;
  }

  if (subscription.currentPeriodEnd) {
    return new Date(subscription.currentPeriodEnd) > now;
  }

  return false;
}