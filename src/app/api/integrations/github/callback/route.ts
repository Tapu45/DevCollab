import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { githubAppService } from '@/services/Integration/GitHubAppService';
import { prisma } from '@/lib/Prisma';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/login`);
        }

        const { searchParams } = new URL(request.url);
        const installationId = searchParams.get('installation_id');
        const setupAction = searchParams.get('setup_action');
        const code = searchParams.get('code');

        if (!installationId) {
            return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=missing_installation_id`);
        }

        // Handle the GitHub App installation
        if (setupAction === 'install' || setupAction === 'update') {
            try {
                await githubAppService.installApp(userId, parseInt(installationId));

                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?success=github_connected`);
            } catch (error) {
                console.error('GitHub App installation error:', error);
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=installation_failed`);
            }
        }

        // Handle OAuth callback (if you want to support both)
        if (code) {
            try {
                // Exchange code for access token
                const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        client_id: process.env.GITHUB_CLIENT_ID!,
                        client_secret: process.env.GITHUB_CLIENT_SECRET!,
                        code,
                        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/github/callback`,
                    }),
                });

                const tokenData = await tokenResponse.json();

                if (tokenData.error) {
                    throw new Error(tokenData.error_description || tokenData.error);
                }

                // Get user info from GitHub
                const userResponse = await fetch('https://api.github.com/user', {
                    headers: {
                        'Authorization': `Bearer ${tokenData.access_token}`,
                        'Accept': 'application/vnd.github.v3+json',
                    },
                });

                const userData = await userResponse.json();

                // Create or update account
                const account = await prisma.account.upsert({
                    where: {
                        provider_providerAccountId: {
                            provider: 'github',
                            providerAccountId: userData.id.toString(),
                        },
                    },
                    update: {
                        access_token: tokenData.access_token,
                        refresh_token: tokenData.refresh_token,
                        expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
                        scope: tokenData.scope,
                      
                    },
                    create: {
                        userId,
                        provider: 'github',
                        type: 'oauth',
                        providerAccountId: userData.id.toString(),
                        access_token: tokenData.access_token,
                        refresh_token: tokenData.refresh_token,
                        expires_at: tokenData.expires_in ? Math.floor(Date.now() / 1000) + tokenData.expires_in : null,
                        scope: tokenData.scope,
                    },
                });

                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?success=github_connected`);
            } catch (error) {
                console.error('GitHub OAuth error:', error);
                return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=oauth_failed`);
            }
        }

        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=invalid_callback`);
    } catch (error) {
        console.error('GitHub callback error:', error);
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings/integrations?error=callback_failed`);
    }
}