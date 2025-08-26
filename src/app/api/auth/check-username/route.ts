import { NextRequest, NextResponse } from 'next/server';
import {prisma} from '../../../../lib/Prisma'

export async function POST(req: NextRequest) {
  const { username } = await req.json();
  if (!username) {
    return NextResponse.json({ available: false, error: 'No username provided' }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { username } });
  return NextResponse.json({ available: !existing });
}