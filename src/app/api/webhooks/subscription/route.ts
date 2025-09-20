import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { pusher } from '@/utils/Pusher';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
    try {
        const payload = await request.text();
        const signature = request.headers.get('x-razorpay-signature');

        // Verify webhook signature
        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(payload)
            .digest('hex');

        if (signature !== expectedSignature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const event = JSON.parse(payload);

        // Handle different webhook events
        switch (event.event) {
            case 'payment.captured':
                await handlePaymentCaptured(event);
                break;
            case 'subscription.activated':
                await handleSubscriptionActivated(event);
                break;
            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event);
                break;
            case 'subscription.paused':
                await handleSubscriptionPaused(event);
                break;
            case 'subscription.resumed':
                await handleSubscriptionResumed(event);
                break;
            default:
                console.log('Unhandled webhook event:', event.event);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error processing subscription webhook:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function handlePaymentCaptured(event: any) {
    const { order_id, payment_id } = event.payload.payment.entity;

    // Find the invoice
    const invoice = await prisma.invoice.findFirst({
        where: { stripeInvoiceId: order_id },
        include: { subscription: { include: { user: true } } },
    });

    if (invoice) {
        // Update invoice status
        await prisma.invoice.update({
            where: { id: invoice.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });

        // Trigger real-time update
        await pusher.trigger(`user-${invoice.subscription.userId}`, 'subscription_updated', {
            type: 'payment_captured',
            amount: invoice.amount,
            currency: invoice.currency,
        });
    }
}

async function handleSubscriptionActivated(event: any) {
    const { subscription_id } = event.payload.subscription.entity;

    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription_id },
        include: { user: true },
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: { status: 'ACTIVE' },
        });

        await pusher.trigger(`user-${subscription.userId}`, 'subscription_updated', {
            type: 'subscription_activated',
            planType: subscription.planId,
        });
    }
}

async function handleSubscriptionCancelled(event: any) {
    const { subscription_id } = event.payload.subscription.entity;

    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription_id },
        include: { user: true },
    });

    if (subscription) {
        await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                status: 'CANCELED',
                canceledAt: new Date(),
            },
        });

        await pusher.trigger(`user-${subscription.userId}`, 'subscription_updated', {
            type: 'subscription_cancelled',
        });
    }
}

async function handleSubscriptionPaused(event: any) {
    const { subscription_id } = event.payload.subscription.entity;

    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription_id },
        include: { user: true },
    });

    if (subscription) {
        await pusher.trigger(`user-${subscription.userId}`, 'subscription_updated', {
            type: 'subscription_paused',
        });
    }
}

async function handleSubscriptionResumed(event: any) {
    const { subscription_id } = event.payload.subscription.entity;

    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription_id },
        include: { user: true },
    });

    if (subscription) {
        await pusher.trigger(`user-${subscription.userId}`, 'subscription_updated', {
            type: 'subscription_resumed',
        });
    }
}