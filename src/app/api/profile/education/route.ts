import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/utils/Authorize';
import { prisma } from '@/lib/Prisma';

export async function GET(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const educations = await prisma.education.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: 'desc' },
    });
    return NextResponse.json(educations);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch educations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      institution,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      grade,
      description,
    } = body;

    if (!institution) {
      return NextResponse.json({ error: 'Institution is required' }, { status: 400 });
    }

    const created = await prisma.education.create({
      data: {
        userId: session.user.id,
        institution,
        degree: degree ?? null,
        fieldOfStudy: fieldOfStudy ?? null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        grade: grade ?? null,
        description: description ?? null,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const record = await prisma.education.findUnique({ where: { id } });
    if (!record || record.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await prisma.education.update({
      where: { id },
      data: {
        institution: data.institution ?? record.institution,
        degree: data.degree ?? record.degree,
        fieldOfStudy: data.fieldOfStudy ?? record.fieldOfStudy,
        startDate: data.startDate ? new Date(data.startDate) : record.startDate,
        endDate:
          Object.prototype.hasOwnProperty.call(data, 'endDate')
            ? data.endDate
              ? new Date(data.endDate)
              : null
            : record.endDate,
        grade: data.grade ?? record.grade,
        description: data.description ?? record.description,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Failed to update education' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getAuthSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const record = await prisma.education.findUnique({ where: { id } });
    if (!record || record.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await prisma.education.delete({ where: { id } });
    return NextResponse.json({ message: 'Deleted' });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 });
  }
}
