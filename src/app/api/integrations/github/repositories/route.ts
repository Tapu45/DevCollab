import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function GET(req: NextRequest) {
    const { userId } = await auth();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');

    try {
        const installations = await prisma.gitHubAppInstallation.findMany({
            where: {
                isActive: true,
                account: {
                    userId: userId,
                },
            },
            include: {
                repositories: {
                    where: search ? {
                        OR: [
                            { name: { contains: search, mode: 'insensitive' } },
                            { fullName: { contains: search, mode: 'insensitive' } },
                            { description: { contains: search, mode: 'insensitive' } },
                        ],
                    } : undefined,
                    include: {
                        commits: {
                            orderBy: { createdAt: 'desc' },
                            take: 5,
                        },
                        issues: {
                            where: { state: 'open' },
                            take: 5,
                        },
                        pullRequests: {
                            where: { state: 'open' },
                            take: 5,
                        },
                    },
                    orderBy: { updatedAt: 'desc' },
                    skip: (page - 1) * limit,
                    take: limit,
                },
            },
        });

        const repositories = installations.flatMap(inst => inst.repositories);
        const total = installations.reduce((sum, inst) => sum + inst.repositories.length, 0);

        return NextResponse.json({
            repositories,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error('GitHub repositories error:', error);
        return NextResponse.json({ error: 'Failed to fetch repositories' }, { status: 500 });
    }
}