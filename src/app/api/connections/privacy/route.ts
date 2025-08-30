import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/Prisma';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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
      where: { userId: user.id },
      update: {
        connectionPrivacyLevel,
        connectionRequestLevel,
        hideConnections,
        autoDeclineRequests,
        blockedUserIds
      },
      create: {
        userId: user.id,
        connectionPrivacyLevel,
        connectionRequestLevel,
        hideConnections,
        autoDeclineRequests,
        blockedUserIds
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
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const privacySettings = await prisma.connectionPrivacy.findUnique({
      where: { userId: user.id },
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