import { logger, schedules } from "@trigger.dev/sdk";
import { getPrismaClient, disconnectPrisma } from "@/trigger/PrismaService";
import { SubscriptionStatus, PlanType } from "@/generated/prisma";
import { pusher } from "@/utils/Pusher";

export const subscriptionMonitorTask = schedules.task({
    id: "subscription-monitor",
    cron: "0 */6 * * *", // Run every 6 hours
    run: async (payload) => {
        logger.log("🔍 Starting subscription monitoring", {
            timestamp: payload.timestamp,
            timezone: payload.timezone
        });

        let prisma;
        try {
            prisma = await getPrismaClient();
            if (!prisma) {
                throw new Error("Failed to get Prisma client");
            }
            const now = new Date();

            // Find expired subscriptions that need to be downgraded
            const expiredSubscriptions = await prisma.subscription.findMany({
                where: {
                    OR: [
                        // Subscriptions past their billing date
                        {
                            nextBillingDate: { lt: now },
                            status: SubscriptionStatus.ACTIVE,
                            plan: { type: { not: PlanType.FREE } }
                        },
                        // Subscriptions in grace period that have expired
                        {
                            gracePeriodEnd: { lt: now },
                            status: SubscriptionStatus.GRACE_PERIOD
                        },
                        // Past due subscriptions older than 7 days
                        {
                            status: SubscriptionStatus.PAST_DUE,
                            currentPeriodEnd: { lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
                        }
                    ]
                },
                include: {
                    plan: true,
                    user: true
                }
            });

            logger.log("📊 Found expired subscriptions", {
                count: expiredSubscriptions.length
            });

            // Get the FREE plan
            const freePlan = await prisma.plan.findFirst({
                where: { type: PlanType.FREE }
            });

            if (!freePlan) {
                throw new Error("FREE plan not found");
            }

            let downgradedCount = 0;
            let gracePeriodCount = 0;

            for (const subscription of expiredSubscriptions) {
                try {
                    if (subscription.status === SubscriptionStatus.ACTIVE && subscription.nextBillingDate && subscription.nextBillingDate < now) {
                        // Give 3 days grace period for active subscriptions
                        const gracePeriodEnd = new Date(subscription.nextBillingDate);
                        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 3);

                        await prisma.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                status: SubscriptionStatus.GRACE_PERIOD,
                                gracePeriodEnd: gracePeriodEnd,
                                failedPaymentCount: subscription.failedPaymentCount + 1,
                                updatedAt: now
                            }
                        });

                        // Notify user about grace period
                        await pusher.trigger(`user-${subscription.userId}`, 'subscription_grace_period', {
                            message: 'Your subscription payment is overdue. You have 3 days to make payment.',
                            gracePeriodEnd: gracePeriodEnd
                        });

                        gracePeriodCount++;
                        logger.log("⚠️ Moved subscription to grace period", {
                            userId: subscription.userId,
                            planType: subscription.plan.type
                        });

                    } else {
                        // Downgrade to FREE plan
                        await prisma.subscription.update({
                            where: { id: subscription.id },
                            data: {
                                planId: freePlan.id,
                                status: SubscriptionStatus.ACTIVE,
                                nextBillingDate: null,
                                gracePeriodEnd: null,
                                currentPeriodStart: now,
                                currentPeriodEnd: null, // FREE plan doesn't expire
                                failedPaymentCount: 0,
                                updatedAt: now
                            }
                        });

                        // Notify user about downgrade
                        await pusher.trigger(`user-${subscription.userId}`, 'subscription_downgraded', {
                            message: 'Your subscription has been downgraded to the FREE plan due to non-payment.',
                            newPlan: 'FREE'
                        });

                        downgradedCount++;
                        logger.log("⬇️ Downgraded subscription to FREE", {
                            userId: subscription.userId,
                            fromPlan: subscription.plan.type
                        });
                    }
                } catch (error) {
                    logger.error("❌ Failed to process subscription", {
                        subscriptionId: subscription.id,
                        userId: subscription.userId,
                        error: error instanceof Error ? error.message : "Unknown error"
                    });
                }
            }

            logger.log("✅ Subscription monitoring completed", {
                total: expiredSubscriptions.length,
                downgraded: downgradedCount,
                gracePeriod: gracePeriodCount
            });

            return {
                processed: expiredSubscriptions.length,
                downgraded: downgradedCount,
                gracePeriod: gracePeriodCount
            };

        } catch (error) {
            logger.error("💥 Subscription monitoring failed", {
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        } finally {
            await disconnectPrisma();
        }
    },
});