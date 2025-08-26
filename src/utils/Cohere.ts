import { CohereClient, CohereError } from "cohere-ai";
import { extractUserProfileData } from "./ProfileExtractor";
import { createHash } from "crypto";
import { Redis } from "@upstash/redis";

// === CONFIGURATION ===
const cohereApiKey = process.env.COHERE_API_KEY;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;
const EMBEDDING_MODEL = "embed-english-v3.0";
const CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

// Initialize Cohere client with retry logic
const cohere = new CohereClient({ 
  token: cohereApiKey 
});

// Initialize Upstash Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// === EMBEDDING GENERATION ===

/**
 * Generates an embedding for user profile data with retry logic and optimized caching
 */
export async function generateUserEmbedding(userId: string): Promise<number[]> {
  try {
    // Extract user profile data using ProfileExtractor
    const profileData = await extractUserProfileData(userId);
    
    // Create a cache key based on profile data
    const cacheKey = createCacheKey(userId, profileData);
    
    // Check cache first (Upstash returns string, so parse it)
    const cachedEmbedding = await redis.get(cacheKey);
    if (cachedEmbedding) {
      console.log("Using cached embedding for user", userId);
      return JSON.parse(cachedEmbedding as string);
    }
    
    // Generate embedding with retry logic
    const embedding = await withRetry(() => generateEmbedding(profileData));
    
    // Cache the result (set with expiry)
    await redis.set(cacheKey, JSON.stringify(embedding), { ex: CACHE_TTL });
    
    return embedding;
  } catch (error) {
    console.error("Error generating user embedding:", error);
    throw new Error(`Failed to generate embedding for user ${userId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate embeddings for multiple users with optimized batch processing
 */
export async function generateBatchEmbeddings(
  userIds: string[]
): Promise<Array<{ userId: string, embedding: number[] }>> {
  // Process in smaller batches to avoid rate limits
  const batchSize = 5;
  const results: Array<{ userId: string, embedding: number[] }> = [];
  
  for (let i = 0; i < userIds.length; i += batchSize) {
    try {
      const batch = userIds.slice(i, i + batchSize);
      
      // Process batch in parallel with controlled concurrency
      const batchPromises = batch.map(userId => 
        generateUserEmbedding(userId)
          .then(embedding => ({ userId, embedding }))
          .catch(error => {
            console.error(`Error processing user ${userId}:`, error);
            return null; // Allow other users to be processed even if one fails
          })
      );
      
      // Wait between batches to avoid rate limits
      if (i > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults.filter(Boolean) as Array<{ userId: string, embedding: number[] }>);
    } catch (error) {
      console.error(`Error processing batch starting at index ${i}:`, error);
      // Continue with next batch even if one batch fails
    }
  }
  
  return results;
}

// === HELPER FUNCTIONS ===

/**
 * Create a deterministic cache key based on user profile data
 */
function createCacheKey(userId: string, profileData: any): string {
  // Create a deterministic representation of the profile data
  // Only include fields that affect the embedding
  const relevantData = {
    skills: profileData.skills.map((s: any) => ({ 
      name: s.name, 
      proficiency: s.proficiencyLevel
    })),
    bio: profileData.basicInfo.bio,
    experiences: profileData.formattedText.experience,
    projects: profileData.formattedText.projects,
    education: profileData.formattedText.education,
    location: profileData.basicInfo.location,
    // Add a hash of the updatedAt timestamp to invalidate cache when profile changes
    lastUpdated: profileData.metadata?.updatedAt || Date.now()
  };
  
  // Generate a hash of the profile data
  const hash = createHash('md5').update(JSON.stringify(relevantData)).digest('hex');
  return `embedding:${userId}:${hash}`;
}

/**
 * Prepare user profile text for optimal embedding with weighted sections
 */
function prepareTextForEmbedding(profileData: any): string {
  // Emphasize important sections by repeating them
  const sections = [
    // Core identity (highest weight)
    `Developer profile: ${profileData.basicInfo.displayName}.`,
    profileData.basicInfo.bio ? `Bio: ${profileData.basicInfo.bio}` : '',
    
    // Skills (very high weight - repeat 3 times)
    `Skills: ${profileData.formattedText.skills}`,
    `Technical expertise: ${profileData.formattedText.skills}`,
    `Developer abilities: ${profileData.formattedText.skills}`,
    
    // Experience (high weight - repeat 2 times)
    `Experience: ${profileData.formattedText.experience}`,
    `Work history: ${profileData.formattedText.experience}`,
    
    // Projects (high weight - repeat 2 times)
    `Projects: ${profileData.formattedText.projects}`,
    `Portfolio: ${profileData.formattedText.projects}`,
    
    // Secondary information (normal weight)
    `Education: ${profileData.formattedText.education}`,
    `Location: ${profileData.basicInfo.location || 'Not specified'}`,
  ];
  
  return sections.filter(Boolean).join(' ');
}

/**
 * Generate embedding with proper error handling
 */
async function generateEmbedding(profileData: any): Promise<number[]> {
  const embeddingText = prepareTextForEmbedding(profileData);
  
  // Truncate text if needed (Cohere has token limits)
  const truncatedText = embeddingText.substring(0, 8000);
  
  const response = await cohere.embed({
    texts: [truncatedText],
    model: EMBEDDING_MODEL,
    inputType: "search_document"
  });
  
  let embeddingsArray: number[][] | undefined;

  if (Array.isArray(response.embeddings)) {
    embeddingsArray = response.embeddings;
  } else if (response.embeddings && typeof response.embeddings === 'object' && 'embeddings' in response.embeddings) {
    embeddingsArray = (response.embeddings as any).embeddings;
  }

  if (!embeddingsArray || embeddingsArray.length === 0) {
    throw new Error("Failed to generate embedding from Cohere API");
  }

  return embeddingsArray[0];
}

/**
 * Retry wrapper for API calls
 */
async function withRetry<T>(fn: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    
    const isRateLimitError = 
      error instanceof CohereError && 
      (error.message.includes('rate limit') || (typeof (error as any).code !== 'undefined' && (error as any).code === 429));
    
    // For rate limit errors, use exponential backoff
    const delay = isRateLimitError 
      ? RETRY_DELAY_MS * Math.pow(2, MAX_RETRIES - retries) 
      : RETRY_DELAY_MS;
    
    console.log(`Retrying after ${delay}ms (${retries} attempts left)`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return withRetry(fn, retries - 1);
  }
}

/**
 * Clear cache for a specific user
 */
export async function clearUserEmbeddingCache(userId: string): Promise<void> {
  const keys = await redis.keys(`embedding:${userId}:*`);
  for (const key of keys) {
    await redis.del(key);
  }
}

/**
 * Generate query embedding for searching similar profiles
 */
export async function generateQueryEmbedding(queryText: string): Promise<number[]> {
  try {
    const response = await withRetry(() => cohere.embed({
      texts: [queryText],
      model: EMBEDDING_MODEL,
      inputType: "search_query" // Use search_query for queries
    }));
    
    let embeddingsArray: number[][] | undefined;

    if (Array.isArray(response.embeddings)) {
      embeddingsArray = response.embeddings;
    } else if (response.embeddings && typeof response.embeddings === 'object' && 'embeddings' in response.embeddings) {
      embeddingsArray = (response.embeddings as any).embeddings;
    }

    if (!embeddingsArray || embeddingsArray.length === 0) {
      throw new Error("Failed to generate query embedding");
    }

    return embeddingsArray[0];
  } catch (error) {
    console.error("Error generating query embedding:", error);
    throw new Error(`Failed to generate query embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}