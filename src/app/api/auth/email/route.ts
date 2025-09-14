import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/Prisma';

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json();
  if (!email || !otp) {
    return NextResponse.json({ error: 'Missing email or OTP' }, { status: 400 });
  }

  const verification = await prisma.verificationToken.findFirst({
    where: { identifier: email, token: otp }
  });

  if (!verification || verification.expires < new Date()) {
    return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
  }

  // Mark user as verified
  const updatedUser = await prisma.user.update({
    where: { email: verification.identifier },
    data: { emailVerified: new Date() }
  });

  // Delete the token
  await prisma.verificationToken.delete({
    where: { token: otp }
  });

  // set HttpOnly grace cookie for 7 days (server-side)
  const days = 7;
  const maxAge = Math.floor(days * 24 * 60 * 60);
  const until = Date.now() + maxAge * 1000;

  const res = NextResponse.json({
    message: 'Email verified successfully',
    userId: updatedUser.id,
    until,
  }, { status: 200 });

  res.cookies.set('devcollab_grace_until', String(until), {
    httpOnly: true,
    maxAge,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  return res;
}
