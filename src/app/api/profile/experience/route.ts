import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/Authorize';
import { prisma } from '@/lib/Prisma';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const experiences = await prisma.experience.findMany({
    where: { userId: session.user.id },
    orderBy: { startDate: 'desc' },
  });
  return NextResponse.json(experiences);
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, company, location, startDate, endDate, isCurrent, responsibilities } = body;
  if (!title || !company || !startDate) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

  const created = await prisma.experience.create({
    data: {
      userId: session.user.id,
      title,
      company,
      location,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      isCurrent: !!isCurrent,
      responsibilities,
    },
  });

  return NextResponse.json(created, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { id, ...data } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const exp = await prisma.experience.findUnique({ where: { id } });
  if (!exp || exp.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const updated = await prisma.experience.update({
    where: { id },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : exp.startDate,
      endDate: data.endDate ? new Date(data.endDate) : data.endDate === null ? null : exp.endDate,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const exp = await prisma.experience.findUnique({ where: { id } });
  if (!exp || exp.userId !== session.user.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await prisma.experience.delete({ where: { id } });
  return NextResponse.json({ message: 'Deleted' });
}