import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/lib/email';

import { prisma } from '@/lib/Prisma';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, username, password, name, profilePictureUrl } = body;
  if (!email || !username || !password) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  });
  if (existingUser) {
    return NextResponse.json({ error: 'User already exists' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      displayName: name || username,
      profilePictureUrl: profilePictureUrl || null,
    }
  });

  // Generate a 6-digit OTP instead of a UUID token
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes expiry

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: otp,
      expires,
    }
  });

  // Update this function to send the OTP in the email body
  await sendVerificationEmail(email, otp);

  return NextResponse.json({ message: 'User registered', userId: user.id }, { status: 201 });
}