import { task } from "@trigger.dev/sdk/v3";

export const refreshAllUserStats = task({
    id: "refresh-all-user-stats",
    run: async (payload: {}) => {
        const { prisma } = await import("@/lib/Prisma");

        // Get all users with connected accounts
        const users = await prisma.user.findMany({
            include: {
                accounts: true,
                externalProfiles: true
            }
        });

        for (const user of users) {
            try {
                // Refresh GitHub stats
                if (user.accounts.some(acc => acc.provider === 'github')) {
                    await import("@/services/StatsCollectionService").then(module =>
                        module.collectGitHubStats(user.id, true)
                    );
                }

                // Refresh GitLab stats
                if (user.accounts.some(acc => acc.provider === 'gitlab')) {
                    await import("@/services/StatsCollectionService").then(module =>
                        module.collectGitLabStats(user.id, true)
                    );
                }

                // Refresh LeetCode stats
                if (user.externalProfiles.some(prof => prof.provider === 'leetcode')) {
                    await import("@/services/StatsCollectionService").then(module =>
                        module.collectLeetCodeStats(user.id, true)
                    );
                }
            } catch (error) {
                console.error(`Failed to refresh stats for user ${user.id}:`, error);
            }
        }

        return { message: "Stats refresh completed", usersProcessed: users.length };
    },
});