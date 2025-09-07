import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';
import bcrypt from 'bcryptjs';
import { sendPasswordResetEmail } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  // 1. Request password reset OTP
  if (action === 'request') {
    const { email } = body;
    if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Email not found. Please sign up.' }, { status: 404 });
    }

    const otp = generateOTP();
    const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes

    await prisma.verificationToken.create({
      data: { identifier: email, token: otp, expires }
    });

    await sendPasswordResetEmail(email, otp);

    return NextResponse.json({ message: 'OTP sent to your email.' });
  }

  // 2. Verify OTP and reset password
  if (action === 'reset') {
    const { email, otp, password } = body;
    if (!email || !otp || !password) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

    const verification = await prisma.verificationToken.findFirst({
      where: { identifier: email, token: otp }
    });
    if (!verification || verification.expires < new Date()) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { passwordHash }
    });

    await prisma.verificationToken.deleteMany({ where: { identifier: email } }); // Clean up all tokens for the email

    return NextResponse.json({ message: 'Password reset successful.' });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}