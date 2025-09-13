import { NextRequest, NextResponse } from 'next/server';
import { linkedinService } from '@/services/LinkedInService';
import { prisma } from '@/lib/Prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings/linkedin?error=${error}`);
    }

    if (!code || !state) {
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings/linkedin?error=missing_params`);
    }

    try {
        // Verify state parameter (should match the user ID or session)
        const userId = state; // In production, you should verify this against a session

        // Exchange code for access token
        const tokenResponse = await linkedinService.exchangeCodeForToken(code);

        // Store the access token in the Account table
        await prisma.account.upsert({
            where: {
                provider_providerAccountId: {
                    provider: 'linkedin',
                    providerAccountId: userId, // You might need to get the actual LinkedIn user ID
                },
            },
            update: {
                access_token: tokenResponse.access_token,
                refresh_token: tokenResponse.refresh_token,
                expires_at: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
                scope: tokenResponse.scope,
            },
            create: {
                userId,
                type: 'oauth',
                provider: 'linkedin',
                providerAccountId: userId, // You might need to get the actual LinkedIn user ID
                access_token: tokenResponse.access_token,
                refresh_token: tokenResponse.refresh_token,
                expires_at: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
                scope: tokenResponse.scope,
            },
        });

        // Sync the LinkedIn profile
        await linkedinService.syncUserProfile(userId, tokenResponse.access_token);

        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings/linkedin?success=true`);
    } catch (error) {
        console.error('LinkedIn OAuth callback error:', error);
        return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/settings/linkedin?error=callback_failed`);
    }
}