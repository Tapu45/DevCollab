import { prisma } from '@/lib/Prisma';
import { SubscriptionStatus, PlanType } from '@/generated/prisma';
import { pusher } from '@/utils/Pusher';

export class SubscriptionService {
  /**
   * Create or upgrade a subscription
   */
  static async createSubscription(userId: string, planId: string) {
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new Error('Plan not found');
    }

    // For FREE plan, create immediately active subscription
    if (plan.type === PlanType.FREE) {
      return await this.createFreeSubscription(userId, planId);
    }

    // For paid plans, create incomplete subscription pending payment
    const now = new Date();
    const nextBillingDate = new Date(now);
    nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);

    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription) {
      return await prisma.subscription.update({
        where: { userId },
        data: {
          planId,
          status: SubscriptionStatus.INCOMPLETE,
          nextBillingDate,
          gracePeriodEnd: null,
          failedPaymentCount: 0,
          autoRenew: true,
          updatedAt: now,
        },
      });
    } else {
      return await prisma.subscription.create({
        data: {
          userId,
          planId,
          status: SubscriptionStatus.INCOMPLETE,
          nextBillingDate,
          autoRenew: true,
          createdAt: now,
          updatedAt: now,
        },
      });
    }
  }

  /**
   * Create a free subscription (lifetime)
   */
  static async createFreeSubscription(userId: string, planId: string) {
    const now = new Date();

    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (existingSubscription) {
      return await prisma.subscription.update({
        where: { userId },
        data: {
          planId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: null, // FREE plan doesn't expire
          nextBillingDate: null,
          gracePeriodEnd: null,
          failedPaymentCount: 0,
          autoRenew: false,
          updatedAt: now,
        },
      });
    } else {
      return await prisma.subscription.create({
        data: {
          userId,
          planId,
          status: SubscriptionStatus.ACTIVE,
          currentPeriodStart: now,
          currentPeriodEnd: null,
          nextBillingDate: null,
          autoRenew: false,
          createdAt: now,
          updatedAt: now,
        },
      });
    }
  }

  /**
   * Activate subscription after successful payment
   */
  static async activateSubscription(userId: string, paymentDate?: Date) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const now = paymentDate || new Date();
    const currentPeriodStart = now;
    const currentPeriodEnd = new Date(now);
    const nextBillingDate = new Date(now);

    // Set billing cycle based on plan interval
    if (subscription.plan.interval === 'monthly') {
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (subscription.plan.interval === 'yearly') {
      currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart,
        currentPeriodEnd,
        nextBillingDate,
        lastPaymentDate: now,
        gracePeriodEnd: null,
        failedPaymentCount: 0,
        updatedAt: now,
      },
    });

    // Notify user
    await pusher.trigger(`user-${userId}`, 'subscription_activated', {
      planType: subscription.plan.type,
      nextBillingDate,
    });

    return updatedSubscription;
  }

  /**
   * Handle failed payment
   */
  static async handleFailedPayment(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const now = new Date();
    const gracePeriodEnd = new Date(now);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3); // 3 days grace period

    const updatedSubscription = await prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.PAST_DUE,
        gracePeriodEnd,
        failedPaymentCount: subscription.failedPaymentCount + 1,
        updatedAt: now,
      },
    });

    // Notify user
    await pusher.trigger(`user-${userId}`, 'payment_failed', {
      gracePeriodEnd,
      failedAttempts: updatedSubscription.failedPaymentCount,
    });

    return updatedSubscription;
  }

  /**
   * Cancel subscription
   */
  static async cancelSubscription(userId: string, immediate: boolean = false) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      throw new Error('Subscription not found');
    }

    const now = new Date();

    if (immediate || subscription.plan.type === PlanType.FREE) {
      // Get FREE plan and downgrade immediately
      const freePlan = await prisma.plan.findFirst({
        where: { type: PlanType.FREE },
      });

      if (!freePlan) {
        throw new Error('FREE plan not found');
      }

      return await prisma.subscription.update({
        where: { userId },
        data: {
          planId: freePlan.id,
          status: SubscriptionStatus.ACTIVE,
          canceledAt: now,
          cancelAtPeriodEnd: false,
          nextBillingDate: null,
          currentPeriodEnd: null,
          gracePeriodEnd: null,
          autoRenew: false,
          updatedAt: now,
        },
      });
    } else {
      // Cancel at period end
      return await prisma.subscription.update({
        where: { userId },
        data: {
          cancelAtPeriodEnd: true,
          canceledAt: now,
          autoRenew: false,
          updatedAt: now,
        },
      });
    }
  }

  /**
   * Check if subscription is active
   */
  static isSubscriptionActive(subscription: any): boolean {
    const now = new Date();

    // FREE plan is always active
    if (subscription.plan?.type === PlanType.FREE) {
      return subscription.status === SubscriptionStatus.ACTIVE;
    }

    // Check various conditions
    if (subscription.status === SubscriptionStatus.ACTIVE) {
      if (
        subscription.currentPeriodEnd &&
        new Date(subscription.currentPeriodEnd) < now
      ) {
        return false;
      }
      return true;
    }

    if (subscription.status === SubscriptionStatus.GRACE_PERIOD) {
      return subscription.gracePeriodEnd
        ? new Date(subscription.gracePeriodEnd) > now
        : false;
    }

    if (subscription.status === SubscriptionStatus.TRIAL) {
      return subscription.trialEnd
        ? new Date(subscription.trialEnd) > now
        : false;
    }

    return false;
  }

  /**
   * Get subscription status for user
   */
  static async getUserSubscription(userId: string) {
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: { plan: true },
    });

    if (!subscription) {
      // Create default FREE subscription
      const freePlan = await prisma.plan.findFirst({
        where: { type: PlanType.FREE },
      });

      if (freePlan) {
        return await this.createFreeSubscription(userId, freePlan.id);
      }
      return null;
    }

    return subscription;
  }
}
