import { NextRequest, NextResponse } from 'next/server';
import { findSimilarUsers } from '@/utils/Pinecone';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/Prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        const userId = session.user.id;
      
        // Check cache ONCE
        const cache = await prisma.userSuggestionCache.findUnique({ where: { userId } });
        const now = new Date();
        if (cache && (now.getTime() - new Date(cache.updatedAt).getTime()) < 24 * 60 * 60 * 1000) {
            const cacheDataObj = typeof cache.data === 'string' ? JSON.parse(cache.data) : cache.data;
            return NextResponse.json({ ...cacheDataObj, fromCache: true });
        }

        // Generate new data if cache is missing/expired
          const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '10');
        const location = searchParams.get('location') || undefined;
        const experienceLevel = searchParams.get('experienceLevel') || undefined;

        const similarUsers = await findSimilarUsers(userId, {
            limit,
            filterByLocation: location,
            filterByExperienceLevel: experienceLevel,
            minScore: 0.5
        });

        const enhancedUsers = await Promise.all(
            similarUsers.map(async (user) => {
                const userData = await prisma.user.findUnique({
                    where: { id: user.userId },
                    select: {
                        id: true,
                        displayName: true,
                        firstName: true,
                        lastName: true,
                        profilePictureUrl: true,
                        location: true,
                        bio: true,
                        skills: {
                            select: {
                                name: true,
                                category: true,
                                proficiencyLevel: true
                            }
                        }
                    }
                });

                return {
                    ...user,
                    profile: userData
                };
            })
        );

        const responseData = {
            users: enhancedUsers,
            total: enhancedUsers.length
        };

        // Update cache
        await prisma.userSuggestionCache.upsert({
            where: { userId },
            update: { data: responseData },
            create: { userId, data: responseData }
        });

        // Always set fromCache: false for fresh data
        return NextResponse.json({ ...responseData, fromCache: false });
    } catch (error) {
        console.error("Error fetching similar users:", error);
        return NextResponse.json(
            { error: "Failed to fetch similar users" },
            { status: 500 }
        );
    }
}