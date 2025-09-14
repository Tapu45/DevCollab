import { NextRequest, NextResponse } from 'next/server';
import { Prisma, PrismaClient, QuestionStatus, TimeCategory } from '@/generated/prisma';
import { auth } from '@clerk/nextjs/server';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    const { questionId } = await req.json();

    if (!userId || !questionId) {
      return NextResponse.json({ error: 'Missing userId or questionId' }, { status: 400 });
    }

    // Upsert UserQuestionProgress to mark as SOLVED
    const progress = await prisma.userQuestionProgress.upsert({
      where: { userId_questionId: { userId, questionId } },
      update: { status: QuestionStatus.SOLVED },
      create: {
        userId,
        questionId,
        status: QuestionStatus.SOLVED,
      },
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const action = searchParams.get('action');
    if (action === 'get_companies') {
      // Return all companies (names only)
      const companies = await prisma.company.findMany({
        select: { name: true },
        orderBy: { name: 'asc' },
      });
      return NextResponse.json({ companies: companies.map(c => c.name) });
    }

    const { userId } = await auth();

    const company = searchParams.get('company'); // company name
    const title = searchParams.get('title'); // partial or full question title
    const timeCategory = searchParams.get('timeCategory'); // e.g. ALL, SIX_MONTHS
    const difficulty = searchParams.get('difficulty');
    const acceptanceMin = searchParams.get('acceptanceMin');
    const frequencyMin = searchParams.get('frequencyMin');

    // Build filters
    const filters: any = {};

    if (company) {
      const companyObj = await prisma.company.findUnique({ where: { name: company } });
      if (!companyObj) {
        return NextResponse.json({ questions: [] });
      }
      filters.companyId = companyObj.id;
    }

    if (title) {
      filters.title = { contains: title, mode: 'insensitive' };
    }

    if (timeCategory) {
      filters.timeCategories = { has: timeCategory as TimeCategory };
    }

    if (difficulty) {
      filters.difficulty = difficulty;
    }
    if (acceptanceMin) {
      filters.acceptance = { gte: Number(acceptanceMin) };
    }
    if (frequencyMin) {
      filters.frequency = { gte: Number(frequencyMin) };
    }

    const questions = await prisma.leetCodeQuestion.findMany({
      where: filters,
      orderBy: { title: 'asc' },
      include: userId
        ? {
          userProgress: {
            where: { userId },
            select: { status: true, updatedAt: true },
          },
        }
        : undefined,
    }) as Array<
      Prisma.LeetCodeQuestionGetPayload<{
        include: { userProgress: true }
      }>
    >;

    // Map questions to include completed info
    const mappedQuestions = questions.map(q => ({
      ...q,
      completed: q.userProgress?.[0]?.status === 'SOLVED',
      completedAt: q.userProgress?.[0]?.status === 'SOLVED' ? q.userProgress[0].updatedAt : null,
    }));

    return NextResponse.json({ questions: mappedQuestions });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}