import { logger, schedules } from "@trigger.dev/sdk";
import { getPrismaClient, disconnectPrisma } from "@/trigger/PrismaService";
import { SuggestionCacheService } from "@/services/SuggestionCacheService";

export const nightlyRefreshSuggestions = schedules.task({
    id: "nightly-refresh-suggestions",
    cron: "0 2 * * *",
    run: async (payload) => {
        logger.log("🌙 Starting nightly suggestions refresh", {
            timestamp: payload.timestamp,
            timezone: payload.timezone
        });

        let prisma;
        try {
            prisma = await getPrismaClient();

            const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

            // Find users with stale or invalid caches
            const stale = await prisma.userSuggestionCache.findMany({
                where: {
                    OR: [
                        { isValid: false },
                        { lastGenerated: { lt: threshold } },
                    ],
                },
                select: { userId: true },
            });

            // Also include users who have no cache yet
            const usersWithCacheIds = stale.map((s: { userId: any; }) => s.userId);
            const usersWithoutCache = await prisma.user.findMany({
                where: {
                    suggestionCache: null,
                    isActive: true, // Only refresh active users
                },
                select: { id: true },
            });

            const toRefresh = [
                ...new Set([
                    ...usersWithCacheIds,
                    ...usersWithoutCache.map((u: { id: any; }) => u.id),
                ]),
            ];

            if (toRefresh.length === 0) {
                logger.log("✅ No stale/no-cache users found");
                return { refreshed: 0, message: "No users need refresh" };
            }

            logger.log("🔄 Refreshing suggestions for users", {
                count: toRefresh.length,
                userIds: toRefresh.slice(0, 10) // Log first 10 for debugging
            });

            // Process in batches to avoid overwhelming the system
            const batchSize = 5;
            let processed = 0;
            let errors = 0;

            for (let i = 0; i < toRefresh.length; i += batchSize) {
                const batch = toRefresh.slice(i, i + batchSize);

                await Promise.allSettled(
                    batch.map(async (userId) => {
                        try {
                            await SuggestionCacheService.generateAndCacheSuggestions(userId);
                            processed++;
                            logger.log("✅ Refreshed suggestions", { userId });
                        } catch (error) {
                            errors++;
                            logger.error("❌ Failed to refresh suggestions", {
                                userId,
                                error: error instanceof Error ? error.message : "Unknown error"
                            });
                        }
                    })
                );

                // Small delay between batches to be gentle on external APIs
                if (i + batchSize < toRefresh.length) {
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }
            }

            logger.log("🎉 Nightly refresh completed", {
                total: toRefresh.length,
                processed,
                errors,
                successRate: `${((processed / toRefresh.length) * 100).toFixed(1)}%`
            });

            return {
                refreshed: processed,
                errors,
                total: toRefresh.length,
                successRate: `${((processed / toRefresh.length) * 100).toFixed(1)}%`
            };

        } catch (error) {
            logger.error("💥 Nightly refresh failed", {
                error: error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined
            });
            throw error;
        } finally {
            await disconnectPrisma();
        }
    },
});