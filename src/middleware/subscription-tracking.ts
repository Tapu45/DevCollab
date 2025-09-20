import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

// Track subscription-related actions
export async function trackSubscriptionUsage(
    request: NextRequest,
    action: string,
    resource: string
) {
    try {
        const { userId } = await auth();

        if (!userId) return;

        // Track the usage
        await fetch(`${request.nextUrl.origin}/api/subscription/track-usage`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('authorization') || '',
            },
            body: JSON.stringify({
                action,
                resource,
                timestamp: new Date().toISOString(),
            }),
        });
    } catch (error) {
        console.error('Failed to track subscription usage:', error);
    }
}

// Middleware to track usage on protected routes
export function withSubscriptionTracking(handler: any) {
    return async (request: NextRequest, context: any) => {
        const response = await handler(request, context);

        // Track usage based on the route
        const pathname = request.nextUrl.pathname;

        if (pathname.startsWith('/api/projects') && request.method === 'POST') {
            await trackSubscriptionUsage(request, 'CREATE', 'project');
        } else if (pathname.startsWith('/api/connections') && request.method === 'POST') {
            await trackSubscriptionUsage(request, 'CREATE', 'connection');
        } else if (pathname.startsWith('/api/messaging') && request.method === 'POST') {
            await trackSubscriptionUsage(request, 'CREATE', 'message');
        }

        return response;
    };
}