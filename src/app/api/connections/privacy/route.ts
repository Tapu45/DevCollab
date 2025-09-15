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
      blockedUserIds
    } = data;

    const updatedPrivacy = await prisma.connectionPrivacy.upsert({
      where: { userId },
      update: {
        connectionPrivacyLevel,
        connectionRequestLevel,
        hideConnections,
        autoDeclineRequests,
        blockedUserIds
      },
      create: {
        userId,
        connectionPrivacyLevel,
        connectionRequestLevel,
        hideConnections,
        autoDeclineRequests,
        blockedUserIds: blockedUserIds ?? []
      },
      select: {
        connectionPrivacyLevel: true,
        connectionRequestLevel: true,
        hideConnections: true,
        autoDeclineRequests: true,
        blockedUserIds: true
      }
    });

    return NextResponse.json(updatedPrivacy);
  } catch (error) {
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
        blockedUserIds: true
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