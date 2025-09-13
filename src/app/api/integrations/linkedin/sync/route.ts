import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { linkedinService } from '@/services/LinkedInService';
import { prisma } from '@/lib/Prisma';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Get LinkedIn account
        const account = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'linkedin'
            },
        });

        if (!account?.access_token) {
            return NextResponse.json({ error: 'LinkedIn not connected' }, { status: 400 });
        }

        // Check if token is expired and refresh if needed
        let accessToken = account.access_token;
        if (account.expires_at && account.expires_at < Math.floor(Date.now() / 1000)) {
            if (account.refresh_token) {
                const tokenResponse = await linkedinService.refreshToken(account.refresh_token);
                accessToken = tokenResponse.access_token;

                // Update account with new token
                await prisma.account.update({
                    where: { id: account.id },
                    data: {
                        access_token: tokenResponse.access_token,
                        refresh_token: tokenResponse.refresh_token,
                        expires_at: Math.floor(Date.now() / 1000) + tokenResponse.expires_in,
                    },
                });
            } else {
                return NextResponse.json({ error: 'LinkedIn token expired and no refresh token' }, { status: 400 });
            }
        }

        // Sync profile
        await linkedinService.syncUserProfile(session.user.id, accessToken);

        return NextResponse.json({ success: true, message: 'LinkedIn profile synced successfully' });
    } catch (error) {
        console.error('LinkedIn sync error:', error);
        return NextResponse.json({ error: 'Failed to sync LinkedIn profile' }, { status: 500 });
    }
}