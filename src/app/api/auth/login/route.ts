import { NextResponse } from "next/server";
import { prisma } from "@/lib/Prisma";
import bcrypt from "bcryptjs";



export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // You can generate a JWT or session here if needed
    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName
      }
    });
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}