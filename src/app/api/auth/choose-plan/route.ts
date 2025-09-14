import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/Prisma";
import razorpay from "@/lib/Razorpay";
import { auth } from '@clerk/nextjs/server';

export async function POST(req: NextRequest) {
  try {
    const { planId } = await req.json();

    // Get the authenticated user from Clerk
    const { userId: clerkUserId } = await auth();

    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!planId) {
      return NextResponse.json({ error: "Missing planId" }, { status: 400 });
    }

    // Check if user exists in our database
    let user = await prisma.user.findUnique({ where: { id: clerkUserId } });

    // If user doesn't exist, create them (this handles the sync issue)
    if (!user) {
      // Get user info from Clerk (we'll need to make this work)
      // For now, let's create a basic user entry
      user = await prisma.user.create({
        data: {
          id: clerkUserId,
          email: 'temp@example.com', // This will be updated by the sync
          username: `user_${clerkUserId.slice(0, 8)}`,
          displayName: 'New User',
          emailVerified: new Date(), // Clerk handles email verification
        },
      });
    }

    // Check if user is verified
    if (!user.emailVerified) {
      return NextResponse.json({ error: "User not verified" }, { status: 400 });
    }

    // Check if plan exists and is active
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not found or inactive" }, { status: 400 });
    }

    // Check if user already has a subscription
    const existing = await prisma.subscription.findUnique({ where: { userId: clerkUserId } });
    if (existing) {
      return NextResponse.json({ error: "User already has a subscription" }, { status: 400 });
    }

    if (Number(plan.price) > 0) {
      // Shorten receipt to max 40 chars
      const shortUserId = clerkUserId.slice(0, 8);
      const shortPlanId = planId.slice(0, 8);
      const receipt = `rcpt_${shortUserId}_${shortPlanId}_${Date.now()}`.slice(0, 40);

      const order = await razorpay.orders.create({
        amount: Math.round(Number(plan.price) * 100), // in paise
        currency: "INR",
        receipt,
        notes: { userId: clerkUserId, planId },
      });
      return NextResponse.json({ paymentRequired: true, order });
    }

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId: clerkUserId,
        planId,
        status: "ACTIVE",
        currentPeriodStart: new Date(),
        // Optionally set currentPeriodEnd, trialStart, trialEnd, etc.
      },
    });

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}