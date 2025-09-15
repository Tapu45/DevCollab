import { tasks } from "@trigger.dev/sdk";

export class TriggerClient {
    static async triggerUserSuggestions(userId: string) {
        try {
            const handle = await tasks.trigger("generate-user-suggestions", {
                userId: userId,
            });

            console.log(`Triggered suggestion generation for user ${userId}, run ID: ${handle.id}`);
            return handle;
        } catch (error) {
            console.error("Error triggering user suggestions:", error);
            throw error;
        }
    }

    static async triggerBatchSuggestions(userIds: string[]) {
        try {
            const handles = await tasks.batchTrigger(
                "generate-user-suggestions",
                userIds.map(userId => ({ payload: { userId } }))
            );

            console.log(`Triggered batch suggestion generation for ${userIds.length} users`);
            return handles;
        } catch (error) {
            console.error("Error triggering batch suggestions:", error);
            throw error;
        }
    }
}