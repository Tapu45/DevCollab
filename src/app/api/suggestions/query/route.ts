import { NextRequest, NextResponse } from 'next/server';
import { findUsersByQuery } from '@/utils/Pinecone';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/Prisma';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ error: "No query provided" }, { status: 400 });
    }

    const limit = parseInt(searchParams.get('limit') || '10');
    const location = searchParams.get('location') || undefined;
    const experienceLevel = searchParams.get('experienceLevel') || undefined;

    // Find users by query
    const matchedUsers = await findUsersByQuery(query, {
      limit,
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
    console.error("Error searching users:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}