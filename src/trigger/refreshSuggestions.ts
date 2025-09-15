import { logger, schedules } from "@trigger.dev/sdk/v3";
import { getPrismaClient, disconnectPrisma } from "./PrismaService";
import { generateUserSuggestions } from "./generateUserSuggestions";

export const refreshStaleSuggestions = schedules.task({
    id: "refresh-stale-suggestions",
    // Run hourly; checks for 24h staleness inside
    cron: "0 * * * *",
    run: async () => {
        let prisma;
        try {
            prisma = await getPrismaClient();
            const threshold = new Date(Date.now() - 24 * 60 * 60 * 1000);

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

            // Also include users who have no cache yet (first-time generation)
            const usersWithCacheIds = stale.map(s => s.userId);
            const usersWithoutCache = await prisma.user.findMany({
                where: {
                    suggestionCache: null,
                    // Optional: only refresh for active users
                    isActive: true,
                },
                select: { id: true },
            });

            const toRefresh = [
                ...new Set([
                    ...usersWithCacheIds,
                    ...usersWithoutCache.map(u => u.id),
                ]),
            ];

            if (toRefresh.length === 0) {
                logger.log("No stale/no-cache users found");
                return { refreshed: 0 };
            }

            logger.log("Queueing refresh for users", { count: toRefresh.length });

            // Enqueue with light concurrency to avoid hammering HF
            let queued = 0;
            for (const userId of toRefresh) {
                await generateUserSuggestions.trigger({ userId });
                queued++;
            }

            logger.log("Refresh enqueued", { queued });
            return { refreshed: queued };
        } finally {
            await disconnectPrisma();
        }
    },
});