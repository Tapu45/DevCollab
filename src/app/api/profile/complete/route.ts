import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';
import { extractUserProfileData } from '@/utils/ProfileExtractor';
import { storeUserEmbedding } from '@/utils/Pinecone';

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('User ID:', userId);

    const profileData = await extractUserProfileData(userId);
    console.log('Profile data:', profileData);

    const success = await storeUserEmbedding(userId);
    console.log('Embedding success:', success);

    if (!success) {
      throw new Error('Failed to store user embedding');
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        profileCompleted: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Profile completed and embeddings stored successfully',
      profileData
    });

  } catch (error) {
    console.error('Error completing profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to complete profile' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileCompleted: true,
        skills: true,
        experiences: true,
        educations: true,
        ownedProjects: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const completionStatus = {
      isComplete: user.profileCompleted ?? false,
      sections: {
        skills: user.skills.length > 0,
        experience: user.experiences.length > 0,
        education: user.educations.length > 0,
        projects: user.ownedProjects.length > 0
      }
    };

    return NextResponse.json(completionStatus);

  } catch (error) {
    console.error('Error checking profile status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to check profile status' },
      { status: 500 }
    );
  }
}