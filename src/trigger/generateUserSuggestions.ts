import { logger, task, wait } from "@trigger.dev/sdk/v3";
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
        logger.log("Generating suggestions for user", { userId });

        // Optionally give HF space a brief warmup delay on cold starts
        await wait.for({ seconds: 3 });

        const result = await SuggestionCacheService.generateAndCacheSuggestions(userId);

        logger.log("Suggestions generated & cached", {
            userId,
            fromCache: result.fromCache,
            projectIdeasCount: result.projectIdeas?.length ?? 0,
        });

        return { ok: true };
    },
});