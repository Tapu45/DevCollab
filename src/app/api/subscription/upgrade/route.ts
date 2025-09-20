import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';
import Razorpay from 'razorpay';
import { PlanType, SubscriptionStatus } from '@/generated/prisma';
import { SubscriptionService } from '@/services/SubscriptionService';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { planType } = await request.json();

    if (!Object.values(PlanType).includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      );
    }

    // Get plan details
    const plan = await prisma.plan.findFirst({
      where: { type: planType, isActive: true }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // For FREE plan, upgrade immediately
    if (planType === PlanType.FREE) {
      const subscription = await SubscriptionService.createFreeSubscription(userId, plan.id);
      return NextResponse.json({
        success: true,
        subscription: {
          id: subscription.id,
          planType: plan.type,
          status: subscription.status
        }
      });
    }

    // Create or update subscription for paid plans
    const subscription = await SubscriptionService.createSubscription(userId, plan.id);

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(plan.price.toString()) * 100),
      currency: plan.currency,
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId: userId,
        planType: planType,
        planId: plan.id,
        subscriptionId: subscription.id,
      },
    });

    // Create invoice
    await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id,
        stripeInvoiceId: order.id, // Using stripeInvoiceId for razorpay order id
        amount: plan.price,
        currency: plan.currency,
        status: 'PENDING',
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      },
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        receipt: order.receipt,
      },
      subscription: {
        id: subscription.id,
        planType: plan.type,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}