import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';
import { PlanType, SubscriptionStatus } from '@/generated/prisma';

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
        maxConnections: -1, // unlimited
        maxTeamMembers: -1, // unlimited
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

// Protected routes that require subscription check
const PROTECTED_ROUTES = {
    // Routes that require BASIC or higher
    BASIC_ROUTES: [
        '/api/ai/',
        '/dashboard/analytics',
        '/collaborate/advanced',
    ],
    // Routes that require PRO or higher
    PRO_ROUTES: [
        '/api/analytics/',
        '/api/advanced-ai/',
        '/dashboard/insights',
        '/api/integrations/',
    ],
    // Routes that require ENTERPRISE
    ENTERPRISE_ROUTES: [
        '/api/enterprise/',
        '/dashboard/enterprise',
        '/api/sso/',
    ],
};

export interface UserSubscriptionInfo {
    planType: PlanType;
    status: SubscriptionStatus;
    limits: typeof PLAN_LIMITS.FREE;
    isActive: boolean;
    trialEndsAt?: Date;
    currentPeriodEnd?: Date;
}

export class SubscriptionService {
    static async getUserSubscription(userId: string): Promise<UserSubscriptionInfo | null> {
        try {
            const subscription = await prisma.subscription.findUnique({
                where: { userId },
                include: { plan: true },
            });

            if (!subscription) {
                // Default to FREE plan if no subscription
                return {
                    planType: PlanType.FREE,
                    status: SubscriptionStatus.ACTIVE,
                    limits: PLAN_LIMITS.FREE,
                    isActive: true,
                };
            }

            const isActive = this.isSubscriptionActive(subscription);
            const planType = subscription.plan.type;

            return {
                planType,
                status: subscription.status,
                limits: PLAN_LIMITS[planType],
                isActive,
                trialEndsAt: subscription.trialEnd || undefined,
                currentPeriodEnd: subscription.currentPeriodEnd || undefined,
            };
        } catch (error) {
            console.error('Error fetching user subscription:', error);
            return null;
        }
    }

    static isSubscriptionActive(subscription: any): boolean {
        const now = new Date();

        // Check if subscription is in active status
        if (subscription.status !== SubscriptionStatus.ACTIVE &&
            subscription.status !== SubscriptionStatus.TRIAL) {
            return false;
        }

        // Check if trial is still valid
        if (subscription.status === SubscriptionStatus.TRIAL) {
            return subscription.trialEnd ? new Date(subscription.trialEnd) > now : false;
        }

        // Check if current period is still valid
        if (subscription.currentPeriodEnd) {
            return new Date(subscription.currentPeriodEnd) > now;
        }

        return false;
    }

    static hasFeatureAccess(userPlan: PlanType, requiredPlan: PlanType): boolean {
        const planHierarchy = {
            [PlanType.FREE]: 0,
            [PlanType.BASIC]: 1,
            [PlanType.PRO]: 2,
            [PlanType.ENTERPRISE]: 3,
        };

        return planHierarchy[userPlan] >= planHierarchy[requiredPlan];
    }

    static checkRouteAccess(pathname: string, userPlan: PlanType): boolean {
        // Check ENTERPRISE routes
        if (PROTECTED_ROUTES.ENTERPRISE_ROUTES.some(route => pathname.startsWith(route))) {
            return this.hasFeatureAccess(userPlan, PlanType.ENTERPRISE);
        }

        // Check PRO routes
        if (PROTECTED_ROUTES.PRO_ROUTES.some(route => pathname.startsWith(route))) {
            return this.hasFeatureAccess(userPlan, PlanType.PRO);
        }

        // Check BASIC routes
        if (PROTECTED_ROUTES.BASIC_ROUTES.some(route => pathname.startsWith(route))) {
            return this.hasFeatureAccess(userPlan, PlanType.BASIC);
        }

        return true; // Allow access to non-protected routes
    }
}

export async function subscriptionMiddleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for auth routes and static files
    if (
        pathname.startsWith('/auth') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api/auth') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    try {
        const { userId } = await auth();

        if (!userId) {
            // Redirect to login for protected routes
            if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
                return NextResponse.redirect(new URL('/auth/signin', request.url));
            }
            return NextResponse.next();
        }

        const subscription = await SubscriptionService.getUserSubscription(userId);

        if (!subscription) {
            return NextResponse.json(
                { error: 'Unable to verify subscription' },
                { status: 500 }
            );
        }

        // Check if subscription is active
        if (!subscription.isActive) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'Subscription expired or inactive' },
                    { status: 403 }
                );
            }
            return NextResponse.redirect(new URL('/settings/billing', request.url));
        }

        // Check route access based on plan
        if (!SubscriptionService.checkRouteAccess(pathname, subscription.planType)) {
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'Upgrade required for this feature' },
                    { status: 403 }
                );
            }
            return NextResponse.redirect(new URL('/settings/billing', request.url));
        }

        // Add subscription info to headers for API routes
        const response = NextResponse.next();
        response.headers.set('x-user-plan', subscription.planType);
        response.headers.set('x-subscription-active', subscription.isActive.toString());

        return response;
    } catch (error) {
        console.error('Subscription middleware error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}