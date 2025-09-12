import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { prisma } from '@/lib/Prisma';
import { collectGitHubStats } from '@/services/StatsCollectionService';
import { collectGitLabStats } from '@/services/StatsCollectionService';
import { collectLinkedInStats } from '@/services/StatsCollectionService';
import { collectLeetCodeStats } from '@/services/StatsCollectionService';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, forceRefresh = false } = await req.json();

    try {
        let result;

        switch (provider) {
            case 'github':
                result = await collectGitHubStats(session.user.id, forceRefresh);
                break;
            case 'gitlab':
                result = await collectGitLabStats(session.user.id, forceRefresh);
                break;
            case 'linkedin':
                result = await collectLinkedInStats(session.user.id, forceRefresh);
                break;
            case 'leetcode':
                result = await collectLeetCodeStats(session.user.id, forceRefresh);
                break;
            default:
                return NextResponse.json({ error: 'Unsupported provider' }, { status: 400 });
        }

        return NextResponse.json({ success: true, data: result });
    } catch (error) {
        console.error('Stats collection error:', error);
        return NextResponse.json({ error: 'Failed to collect stats' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const provider = searchParams.get('provider');

    try {
        let stats;

        if (provider) {
            // Get stats for specific provider
            if (['github', 'gitlab', 'linkedin'].includes(provider)) {
                const account = await prisma.account.findFirst({
                    where: { userId: session.user.id, provider },
                    include: { stats: true }
                });
                stats = account?.stats || [];
            } else {
                const profile = await prisma.externalProfile.findFirst({
                    where: { userId: session.user.id, provider },
                    include: { stats: true }
                });
                stats = profile?.stats || [];
            }
        } else {
            // Get all stats
            const [accounts, profiles] = await Promise.all([
                prisma.account.findMany({
                    where: { userId: session.user.id },
                    include: { stats: true }
                }),
                prisma.externalProfile.findMany({
                    where: { userId: session.user.id },
                    include: { stats: true }
                })
            ]);

            stats = [
                ...accounts.flatMap(acc => acc.stats.map(stat => ({ ...stat, provider: acc.provider }))),
                ...profiles.flatMap(prof => prof.stats.map(stat => ({ ...stat, provider: prof.provider })))
            ];
        }

        return NextResponse.json({ stats });
    } catch (error) {
        console.error('Stats retrieval error:', error);
        return NextResponse.json({ error: 'Failed to retrieve stats' }, { status: 500 });
    }
}