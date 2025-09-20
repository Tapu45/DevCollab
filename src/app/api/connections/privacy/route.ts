import { NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { auth } from '@clerk/nextjs/server';

export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await req.json();
    const {
      connectionPrivacyLevel,
      connectionRequestLevel,
      hideConnections,
      autoDeclineRequests,
      blockedUserIds,
      profileVisibility,
      allowMessages
    } = data;

    // Ensure blockedUserIds is always an array
    const safeBlockedUserIds = Array.isArray(blockedUserIds) ? blockedUserIds : [];

    const updatedPrivacy = await prisma.connectionPrivacy.upsert({
      where: { userId },
      update: {
        connectionPrivacyLevel,
        connectionRequestLevel,
        hideConnections,
        autoDeclineRequests,
        blockedUserIds: safeBlockedUserIds,
        profileVisibility,
        allowMessages
      },
      create: {
        userId,
        connectionPrivacyLevel,
        connectionRequestLevel,
        hideConnections,
        autoDeclineRequests,
        blockedUserIds: safeBlockedUserIds,
        profileVisibility: profileVisibility ?? "PUBLIC",
        allowMessages: allowMessages ?? true
      },
      select: {
        connectionPrivacyLevel: true,
        connectionRequestLevel: true,
        hideConnections: true,
        autoDeclineRequests: true,
        blockedUserIds: true,
        profileVisibility: true,
        allowMessages: true
      }
    });

    return NextResponse.json(updatedPrivacy);
  } catch (error) {
    // Log the error for debugging
    console.error(error);
    return NextResponse.json(
      { error: 'Failed to update privacy settings' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const privacySettings = await prisma.connectionPrivacy.findUnique({
      where: { userId },
      select: {
        connectionPrivacyLevel: true,
        connectionRequestLevel: true,
        hideConnections: true,
        autoDeclineRequests: true,
        blockedUserIds: true,
        profileVisibility: true,   // <-- add
        allowMessages: true        // <-- add
      }
    });

    return NextResponse.json(privacySettings);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch privacy settings' },
      { status: 500 }
    );
  }
}