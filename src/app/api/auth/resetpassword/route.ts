import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '@/lib/email';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // 1. Request password reset link
  if (action === 'request') {
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    // Always respond with success to prevent email enumeration
    if (!user) return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' });

    const token = uuidv4();
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    await prisma.verificationToken.create({
      data: { identifier: email, token, expires }
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({ message: 'If the email exists, a reset link will be sent.' });
  }

  // 2. Reset password with token
  if (action === 'reset') {
    const { token, password } = body;
    if (!token || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const verification = await prisma.verificationToken.findUnique({ where: { token } });
    if (!verification || verification.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: verification.identifier },
      data: { passwordHash }
    });

    await prisma.verificationToken.delete({ where: { token } });

    return NextResponse.json({ message: 'Password reset successful.' });
  }

  // 3. Validate reset token
  if (action === 'validate') {
    const { token } = body;
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const verification = await prisma.verificationToken.findUnique({ where: { token } });
    if (!verification || verification.expires < new Date()) {
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}