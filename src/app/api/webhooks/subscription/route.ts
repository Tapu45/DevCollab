import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { pusher } from '@/utils/Pusher';
import crypto from 'crypto';
import { SubscriptionService } from '@/services/SubscriptionService';

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
            case 'payment.failed':
                await handlePaymentFailed(event);
                break;
            case 'subscription.activated':
                await handleSubscriptionActivated(event);
                break;
            case 'subscription.cancelled':
                await handleSubscriptionCancelled(event);
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

        // Activate subscription
        await SubscriptionService.activateSubscription(invoice.subscription.userId);

        // Trigger real-time update
        await pusher.trigger(`user-${invoice.subscription.userId}`, 'subscription_updated', {
            type: 'payment_captured',
            amount: invoice.amount,
            currency: invoice.currency,
        });
    }
}

async function handlePaymentFailed(event: any) {
    const { order_id } = event.payload.payment.entity;

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
                status: 'FAILED',
            },
        });

        // Handle failed payment
        await SubscriptionService.handleFailedPayment(invoice.subscription.userId);
    }
}

async function handleSubscriptionActivated(event: any) {
    const { subscription_id } = event.payload.subscription.entity;

    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription_id },
        include: { user: true }
    });

    if (subscription) {
        await SubscriptionService.activateSubscription(subscription.userId);

        await pusher.trigger(`user-${subscription.userId}`, 'subscription_activated', {
            subscriptionId: subscription_id,
        });
    }
}

async function handleSubscriptionCancelled(event: any) {
    const { subscription_id } = event.payload.subscription.entity;

    const subscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription_id },
        include: { user: true }
    });

    if (subscription) {
        await SubscriptionService.cancelSubscription(subscription.userId, true);

        await pusher.trigger(`user-${subscription.userId}`, 'subscription_cancelled', {
            subscriptionId: subscription_id,
        });
    }
}