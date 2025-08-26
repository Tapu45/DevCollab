import { getServerSession } from "next-auth";
import { prisma } from "@/lib/Prisma";
import { extractUserProfileData } from "@/utils/ProfileExtractor";
import { storeUserEmbedding } from "@/utils/Pinecone";

export async function POST(req: Request) {
  try {
    // 1. Get authenticated user
    const session = await getServerSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    if (!userId || typeof userId !== "string") {
      return Response.json({ error: "User ID is missing or invalid" }, { status: 400 });
    }

    // 2. Get user's complete profile data
    const profileData = await extractUserProfileData(userId);
    
    // 3. Store embedding in Pinecone
    const success = await storeUserEmbedding(userId);
    if (!success) {
      throw new Error("Failed to store user embedding");
    }

    // 4. Update user's profile completion status
    await prisma.user.update({
      where: { id: userId },
      data: { 
        // Add any profile completion flags or metadata
        // These are examples - adjust based on your needs
        profileCompleted: true,
        updatedAt: new Date()
      }
    });

    return Response.json({
      success: true,
      message: "Profile completed and embeddings stored successfully",
      profileData
    });

  } catch (error) {
    console.error("Error completing profile:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to complete profile" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        profileCompleted: true,
        skills: true,
        experiences: true,
        educations: true,
        ownedProjects: true
      }
    });

    if (!user) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const completionStatus = {
      isComplete: user.profileCompleted ?? false,
      sections: {
        skills: user.skills.length > 0,
        experience: user.experiences.length > 0,
        education: user.educations.length > 0,
        projects: user.ownedProjects.length > 0
      }
    };

    return Response.json(completionStatus);

  } catch (error) {
    console.error("Error checking profile status:", error);
    return Response.json(
      { error: error instanceof Error ? error.message : "Failed to check profile status" },
      { status: 500 }
    );
  }
}