import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/Prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";


async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  return session?.user || null;
}

// GET endpoint to fetch progress
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const progress = await prisma.profileProgress.findUnique({
      where: { userId: user.id },
    });

    return NextResponse.json({ 
      section: progress?.currentSection || "basic" 
    });
  } catch (error) {
    console.error("Error fetching profile progress:", error);
    return NextResponse.json({ error: "Failed to fetch progress" }, { status: 500 });
  }
}

// POST endpoint to update progress
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { section } = await req.json();

    const progress = await prisma.profileProgress.upsert({
      where: { userId: user.id as string },
      update: { 
        currentSection: section,
        lastUpdated: new Date()
      },
      create: {
        userId: user.id as string,
        currentSection: section,
      }
    });

    return NextResponse.json({ success: true, progress });
  } catch (error) {
    console.error("Error updating profile progress:", error);
    return NextResponse.json({ error: "Failed to update progress" }, { status: 500 });
  }
}