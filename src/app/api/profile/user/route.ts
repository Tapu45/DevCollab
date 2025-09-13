import { NextRequest, NextResponse } from 'next/server';
import { getServerSession, Session } from 'next-auth';
import { prisma } from '@/lib/Prisma';
import {authOptions} from '@/app/api/auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions) as Session | null;
  console.log("DEBUG /api/profile/user session:", session);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      skills: true,
      experiences: true,
      educations: true,
      ownedProjects: true,
      projectCollaborations: true,
      sentConnections: true,
      receivedConnections: true,
      sentMessages: true,
      receivedMessages: true,
      chatParticipants: true,
      taskAssignments: true,
      createdTasks: true,
      comments: true,
      achievements: true,
      endorsements: true,
      receivedEndorsements: true,
      forumPosts: true,
      forumReplies: true,
      eventParticipations: true,
      createdEvents: true,
      reports: true,
      reportedBy: true,
      sentNotifications: true,        // <-- use this
      receivedNotifications: true,    // <-- use this
      apiKeys: true,
      suggestionCache: true,
      profileProgress: true,
      subscription: {
        include: {
          plan: true,
          invoices: true
        }
      },
      accounts: true,
      sessions: true,
      questionProgress: true,
      connectionPrivacy: true,
      notificationPreferences: true,
      messageReactions: true,
      messageReads: true
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
