import { NextRequest, NextResponse } from 'next/server';
import { reindexAllUserEmbeddings, checkPineconeHealth, storeUserEmbedding } from '@/utils/Pinecone';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/Prisma';
import { UserRole } from '@/generated/prisma';

// Health check endpoint
export async function GET(request: NextRequest) {
  try {
    // Verify admin permissions
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    if (user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    
    // Check Pinecone health
    const healthStatus = await checkPineconeHealth();
    
    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error("Error checking Pinecone health:", error);
    return NextResponse.json(
      { error: "Failed to check Pinecone health" }, 
      { status: 500 }
    );
  }
}

// Reindex all users endpoint
export async function POST(request: NextRequest) {
  try {
    // Verify admin permissions
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });
    
    if (user?.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }
    
    const body = await request.json();
    const { action } = body;
    
    if (action === "reindex_all") {
      // Get all users with completed profiles
      const users = await prisma.user.findMany({
        where: {
          // Only include users with complete profiles
          firstName: { not: null },
          lastName: { not: null },
          profileVisibility: { not: "private" }
        }
      });
      
      // Reindex all users
      const result = await reindexAllUserEmbeddings(users);
      
      return NextResponse.json(result);
    } else if (action === "index_user" && body.userId) {
      // Index a specific user
      const success = await storeUserEmbedding(body.userId);
      
      return NextResponse.json({ success });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error processing admin embeddings action:", error);
    return NextResponse.json(
      { error: "Failed to process admin action" }, 
      { status: 500 }
    );
  }
}