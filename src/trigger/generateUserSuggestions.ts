import { logger, task, wait } from "@trigger.dev/sdk";
import { getPrismaClient, disconnectPrisma } from "./PrismaService";
import { SuggestionCacheService } from "@/services/SuggestionCacheService";

export const generateUserSuggestions = task({
    id: "generate-user-suggestions",
    maxDuration: 900, // 15 mins compute cap; slow HuggingFace Spaces
    retry: {
        maxAttempts: 3,
        factor: 2,
        minTimeoutInMs: 5_000,
        maxTimeoutInMs: 60_000,
        randomize: true,
    },
    run: async (payload: { userId: string }) => {
        const { userId } = payload;

        logger.log("🚀 Starting suggestion generation", {
            userId,
            timestamp: new Date().toISOString()
        });

        try {
            // Optionally give HF space a brief warmup delay on cold starts
            await wait.for({ seconds: 3 });

            logger.log("📊 Generating suggestions from AI service", { userId });
            const result = await SuggestionCacheService.generateAndCacheSuggestions(userId);

            logger.log("✅ Suggestions generated & cached successfully", {
                userId,
                fromCache: result.fromCache,
                projectIdeasCount: result.projectIdeas?.length ?? 0,
                skillSuggestions: result.skillSuggestions ? "Generated" : "Not generated"
            });

            return {
                ok: true,
                userId,
                projectIdeasCount: result.projectIdeas?.length ?? 0,
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            logger.error("❌ Error generating suggestions", {
                userId,
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        } finally {
            await disconnectPrisma();
        }
    },
});