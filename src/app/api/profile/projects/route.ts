import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { getAuthSession } from '@/utils/Authorize';
import { invalidateSuggestionsOnUpdate } from '@/services/InvalidateSuggestionCache';

// Define enums as TypeScript union types (keep in sync with your schema)
type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'ARCHIVED';
type ProjectVisibility = 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';



// GET: List all projects owned by the authenticated user
export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const projects = await prisma.project.findMany({
    where: { ownerId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      collaborators: true,
      tasks: true,
      milestones: true,
    },
  });

  return NextResponse.json(projects);
}

// POST: Create a new project for the authenticated user
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const {
    title,
    description,
    shortDesc,
    status = 'PLANNING',
    visibility = 'PUBLIC',
    techStack = [],
    categories = [],
    tags = [],
    difficultyLevel,
    estimatedHours,
    maxCollaborators = 5,
    githubUrl,
    liveUrl,
    designUrl,
    documentUrl,
    thumbnailUrl,
    images = [],
    isRecruiting = false,
    recruitmentMsg,
    requiredSkills = [],
    preferredTimezone,
  } = body;

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  const project = await prisma.project.create({
    data: {
      ownerId: session.user.id,
      title,
      description,
      shortDesc,
      status,
      visibility,
      techStack,
      categories,
      tags,
      difficultyLevel,
      estimatedHours,
      maxCollaborators,
      githubUrl,
      liveUrl,
      designUrl,
      documentUrl,
      thumbnailUrl,
      images,
      isRecruiting,
      recruitmentMsg,
      requiredSkills,
      preferredTimezone,
    },
  });

  await invalidateSuggestionsOnUpdate(session.user.id, 'projects');

  return NextResponse.json(project, { status: 201 });
}

// PUT: Update a project (must be owned by the user)
export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { id, ...updateData } = body;

  if (!id) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  // Ensure the project belongs to the user
  const project = await prisma.project.findUnique({
    where: { id },
  });
  if (!project || project.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  const updated = await prisma.project.update({
    where: { id },
    data: updateData,
  });

  await invalidateSuggestionsOnUpdate(session.user.id, 'projects');

  return NextResponse.json(updated);
}

// DELETE: Delete a project (must be owned by the user)
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
  }

  // Ensure the project belongs to the user
  const project = await prisma.project.findUnique({
    where: { id },
  });
  if (!project || project.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  await prisma.project.delete({
    where: { id },
  });

  await invalidateSuggestionsOnUpdate(session.user.id, 'projects');

  return NextResponse.json({ message: 'Project deleted' });
}