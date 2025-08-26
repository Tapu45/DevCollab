import { User } from "@/generated/prisma";
import { Pinecone, PineconeRecord, RecordMetadata } from "@pinecone-database/pinecone";
import { generateQueryEmbedding, generateUserEmbedding } from "./Cohere";
import { extractUserProfileData } from "./ProfileExtractor";


// === CONFIGURATION ===
const PINECONE_API_KEY = process.env.PINECONE_API_KEY!;
const PINECONE_ENVIRONMENT = process.env.PINECONE_ENVIRONMENT || 'us-east-1-aws'; // match your .env and Pinecone dashboard
const INDEX_NAME = process.env.PINECONE_INDEX || 'devcollab-matching'; // match your .env and Pinecone dashboard
const NAMESPACE = 'user-profiles';
const MAX_FETCH_BATCH = 100;
const VECTOR_DIMENSION = 1024; // Cohere embed-english-v3.0 dimension

// Type definitions for improved type safety
interface UserMetadata extends RecordMetadata {
  userId: string;
  displayName: string;
  location: string; // Remove | null
  timezone: string;
  experienceLevel: string;
  experienceYears: number;
  accountType: string;
  skills: string; // Store as JSON string
  profileVisibility: string;
}

interface SimilarUserResult {
  userId: string;
  displayName: string;
  score: number;
  metadata: UserMetadata;
}

// Initialize Pinecone client
let pineconeClient: Pinecone | null = null;
let pineconeIndex: any = null;

/**
 * Get or initialize the Pinecone client
 */
async function getPineconeClient(): Promise<Pinecone> {
  if (pineconeClient) return pineconeClient;

  if (!PINECONE_API_KEY) {
    throw new Error("PINECONE_API_KEY is not defined in environment variables");
  }

  pineconeClient = new Pinecone({
    apiKey: PINECONE_API_KEY,
  });

  return pineconeClient;
}

/**
 * Get or initialize the Pinecone index
 */
async function getIndex() {
  if (pineconeIndex) return pineconeIndex;

  const client = await getPineconeClient();

  // Check if index exists
  const indexesResponse = await client.listIndexes();
  const indexArray = Array.isArray(indexesResponse.indexes) ? indexesResponse.indexes : [];
  const existingIndex = indexArray.find((idx: { name: string; }) => idx.name === INDEX_NAME);

  if (!existingIndex) {
    throw new Error(`Pinecone index "${INDEX_NAME}" does not exist. Please create it in the Pinecone dashboard.`);
  }

  pineconeIndex = client.index(INDEX_NAME);
  return pineconeIndex;
}

/**
 * Store user embedding in Pinecone
 */
export async function storeUserEmbedding(userId: string): Promise<boolean> {
  try {
    // Get user profile data
    const profileData = await extractUserProfileData(userId);

    // Generate embedding using Cohere
    const embedding = await generateUserEmbedding(userId);

    // Prepare metadata for the vector
    const metadata: UserMetadata = {
      userId: userId,
      displayName: profileData.basicInfo.displayName ?? "",
      location: profileData.basicInfo.location ?? "",
      timezone: profileData.basicInfo.timezone ?? "",
      experienceLevel: profileData.experienceLevel ?? "",
      experienceYears: profileData.metadata.experienceYears ?? 0,
      accountType: profileData.accountType ?? "",
      skills: JSON.stringify(profileData.skills.map((s: any) => s.name) ?? []),
      profileVisibility: profileData.basicInfo.profileVisibility ?? ""
    };

    // Create the record for Pinecone
    const record: PineconeRecord<UserMetadata> = {
      id: `user:${userId}`,
      values: embedding,
      metadata
    };

    // Store in Pinecone
    const index = await getIndex();
    await index.namespace(NAMESPACE).upsert([record]);

    console.log(`Successfully stored embedding for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error storing user embedding for ${userId}:`, error);
    return false;
  }
}

/**
 * Store embeddings for multiple users in batches
 */
export async function storeBatchUserEmbeddings(userIds: string[]): Promise<{ success: string[], failed: string[] }> {
  const results = {
    success: [] as string[],
    failed: [] as string[]
  };

  // Process in batches of 10
  const batchSize = 10;

  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(async (userId) => {
        try {
          await storeUserEmbedding(userId);
          return { userId, success: true };
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
          return { userId, success: false };
        }
      })
    );

    // Separate successes and failures
    batchResults.forEach(result => {
      if (result.success) {
        results.success.push(result.userId);
      } else {
        results.failed.push(result.userId);
      }
    });

    // Avoid rate limits
    if (i + batchSize < userIds.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Delete user embedding from Pinecone
 */
export async function deleteUserEmbedding(userId: string): Promise<boolean> {
  try {
    const index = await getIndex();
    await index.namespace(NAMESPACE).deleteOne(`user:${userId}`);
    console.log(`Successfully deleted embedding for user ${userId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting user embedding for ${userId}:`, error);
    return false;
  }
}

/**
 * Find similar users based on a user ID
 */
export async function findSimilarUsers(
  userId: string,
  options: {
    limit?: number,
    minScore?: number,
    includeMetadata?: boolean,
    filterByLocation?: string,
    filterByExperienceLevel?: string,
    filterBySkills?: string[]
  } = {}
): Promise<SimilarUserResult[]> {
  try {
    // Default options
    const {
      limit = 10,
      minScore = 0.7,
      includeMetadata = true,
      filterByLocation,
      filterByExperienceLevel,
      filterBySkills
    } = options;

    // Generate embedding for the query user
    const embedding = await generateUserEmbedding(userId);

    // Prepare filter if needed
    let filter: any = {
      userId: { $ne: userId }, // Don't include the query user
      profileVisibility: { $ne: "private" } // Only include non-private profiles
    };

    // Add optional filters
    if (filterByLocation) {
      filter.location = { $eq: filterByLocation };
    }

    if (filterByExperienceLevel) {
      filter.experienceLevel = { $eq: filterByExperienceLevel };
    }

    if (filterBySkills && filterBySkills.length > 0) {
      filter.skills = { $in: filterBySkills };
    }

    // Query Pinecone
    const index = await getIndex();
    const queryResults = await index.namespace(NAMESPACE).query({
      vector: embedding,
      topK: limit * 2, // Get more results than needed to account for filtering
      includeMetadata,
      filter
    });

    // Format and filter results
    const results = queryResults.matches
      .filter((match: { score: number; }) => match.score && match.score >= minScore)
      .slice(0, limit)
      .map((match: { metadata: UserMetadata; score: any; }) => ({
        userId: match.metadata?.userId as string,
        displayName: match.metadata?.displayName as string,
        score: match.score || 0,
        metadata: match.metadata as UserMetadata
      }));

    return results;
  } catch (error) {
    console.error(`Error finding similar users for ${userId}:`, error);
    throw new Error(`Failed to find similar users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Find users by query text (skills, interests, etc.)
 */
export async function findUsersByQuery(
  queryText: string,
  options: {
    limit?: number,
    minScore?: number,
    includeMetadata?: boolean,
    filterByLocation?: string,
    filterByExperienceLevel?: string
  } = {}
): Promise<SimilarUserResult[]> {
  try {
    // Generate embedding for the text query
    const embedding = await generateQueryEmbedding(queryText);

    // Default options
    const {
      limit = 10,
      minScore = 0.7,
      includeMetadata = true,
      filterByLocation,
      filterByExperienceLevel
    } = options;

    // Prepare filter if needed
    let filter: any = {
      profileVisibility: { $ne: "private" } // Only include non-private profiles
    };

    // Add optional filters
    if (filterByLocation) {
      filter.location = { $eq: filterByLocation };
    }

    if (filterByExperienceLevel) {
      filter.experienceLevel = { $eq: filterByExperienceLevel };
    }

    // Query Pinecone
    const index = await getIndex();
    const queryResults = await index.namespace(NAMESPACE).query({
      vector: embedding,
      topK: limit * 2, // Get more results than needed to account for filtering
      includeMetadata,
      filter
    });

    // Format and filter results
    const results = queryResults.matches
      .filter((match: { score: number; }) => match.score && match.score >= minScore)
      .slice(0, limit)
      .map((match: { metadata: UserMetadata; score: any; }) => ({
        userId: match.metadata?.userId as string,
        displayName: match.metadata?.displayName as string,
        score: match.score || 0,
        metadata: match.metadata as UserMetadata
      }));

    return results;
  } catch (error) {
    console.error(`Error finding users by query "${queryText}":`, error);
    throw new Error(`Failed to search users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Skill-based matching for finding users with specific skills
 */
export async function findUsersBySkills(
  skills: string[],
  options: {
    limit?: number,
    minScore?: number,
    includeMetadata?: boolean,
    filterByLocation?: string,
    filterByExperienceLevel?: string,
    matchType?: 'any' | 'all'
  } = {}
): Promise<SimilarUserResult[]> {
  try {
    if (!skills.length) {
      throw new Error("No skills provided for matching");
    }

    // Default options
    const {
      limit = 10,
      includeMetadata = true,
      filterByLocation,
      filterByExperienceLevel,
      matchType = 'any'
    } = options;

    // Create query text from skills
    const queryText = `Developer with skills in ${skills.join(", ")}`;
    const embedding = await generateQueryEmbedding(queryText);

    // Prepare filter
    let filter: any = {
      profileVisibility: { $ne: "private" } // Only include non-private profiles
    };

    // Skills filter based on match type
    if (matchType === 'all') {
      // Must have ALL specified skills
      skills.forEach((skill, index) => {
        filter[`skills[${index}]`] = { $eq: skill };
      });
    } else {
      // Must have ANY of the specified skills
      filter.skills = { $in: skills };
    }

    // Add optional filters
    if (filterByLocation) {
      filter.location = { $eq: filterByLocation };
    }

    if (filterByExperienceLevel) {
      filter.experienceLevel = { $eq: filterByExperienceLevel };
    }

    // Query Pinecone
    const index = await getIndex();
    const queryResults = await index.namespace(NAMESPACE).query({
      vector: embedding,
      topK: limit * 2,
      includeMetadata,
      filter
    });

    // Format results
    const results = queryResults.matches
      .slice(0, limit)
      .map((match: { metadata: UserMetadata; score: any; }) => ({
        userId: match.metadata?.userId as string,
        displayName: match.metadata?.displayName as string,
        score: match.score || 0,
        metadata: match.metadata as UserMetadata
      }));

    return results;
  } catch (error) {
    console.error(`Error finding users by skills ${skills.join(", ")}:`, error);
    throw new Error(`Failed to find users by skills: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reindex all user embeddings
 */
export async function reindexAllUserEmbeddings(users: User[]): Promise<{
  total: number,
  success: number,
  failed: number
}> {
  try {
    const index = await getIndex();

    // First clear the namespace
    await index.namespace(NAMESPACE).deleteAll();

    // Process users in batches
    const batchSize = 20;
    let successCount = 0;
    let failedCount = 0;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const userIds = batch.map(user => user.id);

      const results = await storeBatchUserEmbeddings(userIds);
      successCount += results.success.length;
      failedCount += results.failed.length;

      // Avoid rate limits
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    return {
      total: users.length,
      success: successCount,
      failed: failedCount
    };
  } catch (error) {
    console.error("Error reindexing all user embeddings:", error);
    throw new Error(`Failed to reindex users: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if the Pinecone index is healthy and ready
 */
export async function checkPineconeHealth(): Promise<{
  healthy: boolean;
  stats?: any;
  error?: string;
}> {
  try {
    const client = await getPineconeClient();
    const indexesResponse = await client.listIndexes();
    const indexArray = Array.isArray(indexesResponse.indexes) ? indexesResponse.indexes : [];
    const indexExists = indexArray.some((idx: { name: string; }) => idx.name === INDEX_NAME);

    if (!indexExists) {
      return {
        healthy: false,
        error: `Index ${INDEX_NAME} does not exist`
      };
    }

    const index = await getIndex();
    const stats = await index.describeIndexStats();

    return {
      healthy: true,
      stats
    };
  } catch (error) {
    console.error("Error checking Pinecone health:", error);
    return {
      healthy: false,
      error: `${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}