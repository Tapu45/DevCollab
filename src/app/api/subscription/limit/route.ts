import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/Prisma';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resource = searchParams.get('resource');

    if (!resource) {
      return NextResponse.json({ error: 'Resource parameter required' }, { status: 400 });
    }

    // Get user's subscription and plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: userId },
      include: { plan: true }
    });

    if (!subscription || !subscription.plan) {
      return NextResponse.json({ canCreate: false, reason: 'No active subscription' });
    }

    // Check if subscription is active
    const isActive = subscription.status === 'ACTIVE' || subscription.status === 'TRIAL';
    if (!isActive) {
      return NextResponse.json({ canCreate: false, reason: 'Subscription not active' });
    }

    let canCreate = false;
    let currentCount = 0;
    let maxAllowed = 0;
    let reason = '';

    switch (resource) {
      case 'projects':
        currentCount = await prisma.project.count({
          where: { ownerId: userId }
        });
        maxAllowed = subscription.plan.maxProjects;
        canCreate = currentCount < maxAllowed;
        reason = canCreate ? '' : `Project limit reached (${currentCount}/${maxAllowed})`;
        break;

      case 'connections':
        currentCount = await prisma.connection.count({
          where: {
            OR: [
              { senderId: userId },
              { receiverId: userId }
            ],
            status: 'ACCEPTED'
          }
        });
        maxAllowed = subscription.plan.maxConnections;
        canCreate = currentCount < maxAllowed;
        reason = canCreate ? '' : `Connection limit reached (${currentCount}/${maxAllowed})`;
        break;

      case 'team-members':
        // Count collaborators across all user's projects
        const projects = await prisma.project.findMany({
          where: { ownerId: userId },
          include: {
            collaborators: true
          }
        });
        currentCount = projects.reduce((total, project) => total + project.collaborators.length, 0);
        maxAllowed = subscription.plan.maxTeamMembers;
        canCreate = currentCount < maxAllowed;
        reason = canCreate ? '' : `Team member limit reached (${currentCount}/${maxAllowed})`;
        break;

      default:
        return NextResponse.json({ error: 'Invalid resource' }, { status: 400 });
    }

    return NextResponse.json({
      canCreate,
      reason,
      currentCount,
      maxAllowed,
      planType: subscription.plan.type
    });

  } catch (error) {
    console.error('Error checking limits:', error);
    return NextResponse.json(
      { error: 'Failed to check limits' },
      { status: 500 }
    );
  }
}