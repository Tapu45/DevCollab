import { NextResponse } from 'next/server';
import { prisma } from '../../../../lib/Prisma';


export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
    return NextResponse.json(plans);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch plans', details: (error as Error).message },
      { status: 500 }
    );
  }
}