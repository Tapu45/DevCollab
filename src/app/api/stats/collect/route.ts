import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';
import { collectGitHubStats } from '@/services/StatsCollectionService';
import { collectGitLabStats } from '@/services/StatsCollectionService';
import { collectLinkedInStats } from '@/services/StatsCollectionService';
import { collectLeetCodeStats } from '@/services/StatsCollectionService';

export async function POST(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { provider, forceRefresh = false } = await req.json();

    try {
        let result;

        switch (provider) {
            case 'github':
                result = await collectGitHubStats(userId, forceRefresh);
                break;
            case 'gitlab':
                result = await collectGitLabStats(userId, forceRefresh);
                break;
            case 'linkedin':
                result = await collectLinkedInStats(userId, forceRefresh);
                break;
            case 'leetcode':
                result = await collectLeetCodeStats(userId, forceRefresh);
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
    const { userId } = await auth();
    if (!userId) {
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
                    where: { userId: userId, provider },
                    include: { stats: true }
                });
                stats = account?.stats || [];
            } else {
                const profile = await prisma.externalProfile.findFirst({
                    where: { userId: userId, provider },
                    include: { stats: true }
                });
                stats = profile?.stats || [];
            }
        } else {
            // Get all stats
            const [accounts, profiles] = await Promise.all([
                prisma.account.findMany({
                    where: { userId: userId },
                    include: { stats: true }
                }),
                prisma.externalProfile.findMany({
                    where: { userId: userId },
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