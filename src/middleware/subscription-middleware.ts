import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';
import { PlanType, SubscriptionStatus } from '@/generated/prisma';
import { SubscriptionService } from '@/services/SubscriptionService';

// Define plan limits and features
export const PLAN_LIMITS = {
    FREE: {
        maxProjects: 3,
        maxConnections: 50,
        maxTeamMembers: 3,
        hasAdvancedAI: false,
        hasAnalytics: false,
        hasPrioritySupport: false,
        hasApiAccess: false,
        maxFileSize: 5, // MB
        maxStorageSize: 100, // MB
        dailyApiCalls: 100,
        canCreateEvents: false,
        maxEventAttendees: 0,
        canAccessForum: true,
        canCreatePosts: 5, // per day
        canSendMessages: 50, // per day
    },
    BASIC: {
        maxProjects: 10,
        maxConnections: 200,
        maxTeamMembers: 8,
        hasAdvancedAI: true,
        hasAnalytics: false,
        hasPrioritySupport: false,
        hasApiAccess: false,
        maxFileSize: 25, // MB
        maxStorageSize: 1000, // MB
        dailyApiCalls: 500,
        canCreateEvents: true,
        maxEventAttendees: 50,
        canAccessForum: true,
        canCreatePosts: 20, // per day
        canSendMessages: 200, // per day
    },
    PRO: {
        maxProjects: 50,
        maxConnections: 1000,
        maxTeamMembers: 25,
        hasAdvancedAI: true,
        hasAnalytics: true,
        hasPrioritySupport: true,
        hasApiAccess: true,
        maxFileSize: 100, // MB
        maxStorageSize: 10000, // MB
        dailyApiCalls: 2000,
        canCreateEvents: true,
        maxEventAttendees: 200,
        canAccessForum: true,
        canCreatePosts: 100, // per day
        canSendMessages: 1000, // per day
    },
    ENTERPRISE: {
        maxProjects: -1, // unlimited
        maxConnections: -1,
        maxTeamMembers: -1,
        hasAdvancedAI: true,
        hasAnalytics: true,
        hasPrioritySupport: true,
        hasApiAccess: true,
        maxFileSize: 500, // MB
        maxStorageSize: -1, // unlimited
        dailyApiCalls: -1, // unlimited
        canCreateEvents: true,
        maxEventAttendees: -1, // unlimited
        canAccessForum: true,
        canCreatePosts: -1, // unlimited
        canSendMessages: -1, // unlimited
    },
};
type PlanFeatureKey = keyof typeof PLAN_LIMITS['FREE'];

export async function checkSubscriptionLimits(
    request: NextRequest,
    requiredFeature?: PlanFeatureKey // <-- use the type here
) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json(
            { error: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const subscription = await SubscriptionService.getUserSubscription(userId);

        if (!subscription) {
            return NextResponse.json(
                { error: 'Subscription not found' },
                { status: 404 }
            );
        }

        const isActive = SubscriptionService.isSubscriptionActive(subscription);
        const limits = PLAN_LIMITS[subscription.planId as keyof typeof PLAN_LIMITS];

        // Check if subscription is active
        if (!isActive) {
            return NextResponse.json(
                {
                    error: 'Subscription inactive',
                    planType: subscription.planId,
                    status: subscription.status,
                    nextBillingDate: subscription.nextBillingDate,
                    gracePeriodEnd: subscription.gracePeriodEnd
                },
                { status: 403 }
            );
        }

        // Check specific feature if required
        if (requiredFeature && !limits[requiredFeature]) {
            return NextResponse.json(
                {
                    error: 'Feature not available in current plan',
                    planType: subscription.planId,
                    requiredFeature
                },
                { status: 403 }
            );
        }

        return {
            subscription,
            limits,
            isActive
        };
    } catch (error) {
        console.error('Error checking subscription limits:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}