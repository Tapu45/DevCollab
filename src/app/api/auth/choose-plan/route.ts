import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/Prisma";
import razorpay from "@/lib/Razorpay";

export async function POST(req: NextRequest) {
  try {
    const { userId, planId } = await req.json();

    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing userId or planId" }, { status: 400 });
    }

    // Check if user exists and is verified
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.emailVerified) {
      return NextResponse.json({ error: "User not found or not verified" }, { status: 400 });
    }

    // Check if plan exists and is active
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.isActive) {
      return NextResponse.json({ error: "Plan not found or inactive" }, { status: 400 });
    }

    // Check if user already has a subscription
    const existing = await prisma.subscription.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json({ error: "User already has a subscription" }, { status: 400 });
    }

if (Number(plan.price) > 0) {
  // Shorten receipt to max 40 chars
  const shortUserId = userId.slice(0, 8);
  const shortPlanId = planId.slice(0, 8);
  const receipt = `rcpt_${shortUserId}_${shortPlanId}_${Date.now()}`.slice(0, 40);

  const order = await razorpay.orders.create({
    amount: Math.round(Number(plan.price) * 100), // in paise
    currency: "INR",
    receipt,
    notes: { userId, planId },
  });
  return NextResponse.json({ paymentRequired: true, order });
}

    // Create subscription
    const subscription = await prisma.subscription.create({
      data: {
        userId,
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