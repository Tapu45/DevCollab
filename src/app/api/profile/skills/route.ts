import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { getAuthSession } from '@/utils/Authorize';
import { invalidateSuggestionsOnUpdate } from '@/services/InvalidateSuggestionCache';

// GET: List all skills for the authenticated user
export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const skills = await prisma.skill.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  });

  return NextResponse.json(skills);
}

// POST: Add a new skill for the authenticated user
export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    name,
    category,
    proficiencyLevel,
    yearsExperience,
    lastUsed,
  } = await req.json();

  if (!name || !category || !proficiencyLevel) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const skill = await prisma.skill.create({
      data: {
        userId: session.user.id,
        name,
        category,
        proficiencyLevel,
        yearsExperience,
        lastUsed: lastUsed ? new Date(lastUsed) : undefined,
      },
    });

    await invalidateSuggestionsOnUpdate(session.user.id, 'skills');

    return NextResponse.json(skill, { status: 201 });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return NextResponse.json({ error: 'Skill already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to add skill' }, { status: 500 });
  }
}

// PUT: Update an existing skill (by skill id, must belong to user)
export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const {
    id,
    name,
    category,
    proficiencyLevel,
    yearsExperience,
    lastUsed,
  } = await req.json();

  if (!id) {
    return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
  }

  // Ensure the skill belongs to the user
  const skill = await prisma.skill.findUnique({
    where: { id },
  });
  if (!skill || skill.userId !== session.user.id) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }

  const updated = await prisma.skill.update({
    where: { id },
    data: {
      name,
      category,
      proficiencyLevel,
      yearsExperience,
      lastUsed: lastUsed ? new Date(lastUsed) : undefined,
    },
  });
  await invalidateSuggestionsOnUpdate(session.user.id, 'skills');

  return NextResponse.json(updated);
}

// DELETE: Remove a skill (by skill id, must belong to user)
export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await req.json();
  if (!id) {
    return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
  }

  // Ensure the skill belongs to the user
  const skill = await prisma.skill.findUnique({
    where: { id },
  });
  if (!skill || skill.userId !== session.user.id) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }

  await prisma.skill.delete({
    where: { id },
  });

  await invalidateSuggestionsOnUpdate(session.user.id, 'skills');

  return NextResponse.json({ message: 'Skill deleted successfully' });
}