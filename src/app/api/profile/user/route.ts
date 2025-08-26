import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { prisma } from '@/lib/Prisma';
import {authOptions} from '@/app/api/auth/[...nextauth]/route';



export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      username: true,
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
      showEmail: true,
      showLocation: true,
      allowMessages: true,
      reputationScore: true,
      totalContributions: true,
      createdAt: true,
      updatedAt: true,
      skills: {
        select: {
          id: true,
          name: true,
          category: true,
          proficiencyLevel: true,
          isVerified: true,
          yearsExperience: true,
          lastUsed: true,
        }
      }
    }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  // Only allow updating certain fields
  const {
    displayName,
    firstName,
    lastName,
    bio,
    location,
    timezone,
    website,
    githubUrl,
    linkedinUrl,
    profileVisibility,
    showEmail,
    showLocation,
    allowMessages,
  } = body;

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      displayName,
      firstName,
      lastName,
      bio,
      location,
      timezone,
      website,
      githubUrl,
      linkedinUrl,
      profileVisibility,
      showEmail,
      showLocation,
      allowMessages,
    }
  });
  return NextResponse.json({ message: 'Profile updated', user: updated });
}
