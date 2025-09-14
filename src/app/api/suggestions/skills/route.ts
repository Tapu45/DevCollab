import { NextRequest, NextResponse } from 'next/server';
import { findUsersBySkills } from '@/utils/Pinecone';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function GET(request: NextRequest) {
    try {
        // Get authenticated user
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const skillsParam = searchParams.get('skills');

        if (!skillsParam) {
            return NextResponse.json({ error: "No skills provided" }, { status: 400 });
        }

        const skills = skillsParam.split(',').map(s => s.trim());
        const limit = parseInt(searchParams.get('limit') || '10');
        const matchType = searchParams.get('matchType') as 'any' | 'all' || 'any';
        const location = searchParams.get('location') || undefined;
        const experienceLevel = searchParams.get('experienceLevel') || undefined;

        // Find users by skills
        const matchedUsers = await findUsersBySkills(skills, {
            limit,
            matchType,
            filterByLocation: location,
            filterByExperienceLevel: experienceLevel
        });

        // Enhance with additional user data
        const enhancedUsers = await Promise.all(
            matchedUsers.map(async (user) => {
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

        return NextResponse.json({
            users: enhancedUsers,
            total: enhancedUsers.length
        });
    } catch (error) {
        console.error("Error fetching users by skills:", error);
        return NextResponse.json(
            { error: "Failed to fetch users by skills" },
            { status: 500 }
        );
    }
}