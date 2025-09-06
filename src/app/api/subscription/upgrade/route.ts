import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/Prisma';
import Razorpay from 'razorpay';
import { PlanType , SubscriptionStatus} from '@/generated/prisma';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
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

     let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          planId: plan.id,
          status: SubscriptionStatus.INCOMPLETE,
        },
      });
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(parseFloat(plan.price.toString()) * 100),
      currency: plan.currency,
      receipt: `order_${session.user.id}_${Date.now()}`,
      notes: {
        userId: session.user.id,
        planType: planType,
        planId: plan.id,
      },
    });

    // Store order details in database for verification
    await prisma.invoice.create({
      data: {
        subscriptionId: subscription.id, // Use subscriptionId instead of userId
        amount: plan.price,
        currency: plan.currency,
        status: 'PENDING',
        stripeInvoiceId: order.id, // Use stripeInvoiceId for razorpay order id
      },
    });

    return NextResponse.json({
      razorpayOrderId: order.id,
      amount: order.amount,
      currency: order.currency,
      planType: planType,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating upgrade order:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}