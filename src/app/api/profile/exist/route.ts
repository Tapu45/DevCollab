import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import { getAuthSession } from '@/utils/Authorize';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ exists: false, error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;

  // minimal user fields (exclude email/username)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { displayName: true, bio: true },
  });

  const [skillsCount, projectsCount, experiencesCount, educationsCount] = await Promise.all([
    prisma.skill.count({ where: { userId } }),
    prisma.project.count({ where: { ownerId: userId } }),
    prisma.experience.count({ where: { userId } }),
    prisma.education.count({ where: { userId } }),
  ]);

  const hasBasic = Boolean(user?.displayName || user?.bio);
  const hasOther = skillsCount > 0 || projectsCount > 0 || experiencesCount > 0 || educationsCount > 0;

  const exists = hasBasic || hasOther;

  return NextResponse.json({
    exists,
    details: {
      displayName: !!user?.displayName,
      bio: !!user?.bio,
      skillsCount,
      projectsCount,
      experiencesCount,
      educationsCount,
    },
  });
}