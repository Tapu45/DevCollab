import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
  }

  // Fetch only public info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      displayName: true,
      firstName: true,
      lastName: true,
      profilePictureUrl: true,
      bio: true,
      location: true,
      timezone: true,
      website: true,
      githubUrl: true,
      linkedinUrl: true,
      profileVisibility: true,
      accountType: true,
      reputationScore: true,
      totalContributions: true,
      skills: {
        select: {
          name: true,
          category: true,
          proficiencyLevel: true,
          isVerified: true,
          yearsExperience: true,
        }
      },
      experiences: {
        select: {
          title: true,
          company: true,
          location: true,
          startDate: true,
          endDate: true,
          isCurrent: true,
          responsibilities: true,
        }
      },
      educations: {
        select: {
          institution: true,
          degree: true,
          fieldOfStudy: true,
          startDate: true,
          endDate: true,
          grade: true,
          description: true,
        }
      },
      ownedProjects: {
        select: {
          id: true,
          title: true,
          description: true,
          shortDesc: true,
          status: true,
          visibility: true,
          techStack: true,
          categories: true,
          tags: true,
          difficultyLevel: true,
          githubUrl: true,
          liveUrl: true,
          thumbnailUrl: true,
        }
      },
      achievements: {
        select: {
          achievement: {
            select: {
              name: true,
              description: true,
              icon: true,
              category: true,
              points: true,
            }
          },
          unlockedAt: true,
        }
      },
      endorsements: {
        select: {
          skill: {
            select: {
              name: true,
              category: true,
            }
          },
          message: true,
        }
      },
      forumPosts: {
        select: {
          id: true,
          title: true,
          slug: true,
          createdAt: true,
        }
      },
      eventParticipations: {
        select: {
          event: {
            select: {
              id: true,
              title: true,
              type: true,
              startDate: true,
              endDate: true,
              location: true,
              isVirtual: true,
            }
          },
          status: true,
        }
      },
      profileProgress: {
        select: {
          currentSection: true,
          lastUpdated: true,
        }
      },
      createdAt: true,
    }
  });

  // Hide if profile is private
  if (!user || user.profileVisibility === 'PRIVATE') {
    return NextResponse.json({ error: 'User not found or profile is private' }, { status: 404 });
  }

  return NextResponse.json(user);
}