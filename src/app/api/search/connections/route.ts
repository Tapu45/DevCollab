import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { auth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const q = (searchParams.get('q') || '').trim();
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!q) {
            return NextResponse.json({ users: [], total: 0 });
        }

        // Find all accepted connections where the current user is either sender or receiver,
        // then pick the "other" user. Filter by name/username and skills.
        const connections = await prisma.connection.findMany({
            where: {
                status: 'ACCEPTED',
                OR: [{ senderId: userId }, { receiverId: userId }],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                        profilePictureUrl: true,
                        skills: { select: { name: true } },
                    },
                },
                receiver: {
                    select: {
                        id: true,
                        displayName: true,
                        username: true,
                        profilePictureUrl: true,
                        skills: { select: { name: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const query = q.toLowerCase();
        const uniq: Record<string, boolean> = {};
        const matched = [];

        for (const c of connections) {
            const other =
                c.senderId === userId ? c.receiver : c.sender;

            if (!other || uniq[other.id]) continue;

            const name = (other.displayName || '').toLowerCase();
            const username = (other.username || '').toLowerCase();
            const skills = (other.skills || []).map(s => s.name.toLowerCase());

            const hit =
                name.includes(query) ||
                username.includes(query) ||
                skills.some(s => s.includes(query));

            if (hit) {
                uniq[other.id] = true;
                matched.push({
                    id: other.id,
                    displayName: other.displayName,
                    username: other.username,
                    profilePictureUrl: other.profilePictureUrl,
                });
            }
            if (matched.length >= limit) break;
        }

        return NextResponse.json({ users: matched, total: matched.length });
    } catch (err) {
        console.error('Connections search error:', err);
        return NextResponse.json({ error: 'Failed to search connections' }, { status: 500 });
    }
}