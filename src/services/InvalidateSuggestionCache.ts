import { SuggestionCacheService } from "@/services/SuggestionCacheService";
import { generateUserSuggestions } from "@/trigger/generateUserSuggestions";

export async function invalidateSuggestionsOnUpdate(userId: string, updateType: 'skills' | 'projects') {
    try {
        // Invalidate cache immediately
        await SuggestionCacheService.invalidateUserCache(userId);

        // Trigger background regeneration
        await generateUserSuggestions.trigger({ userId });

        console.log(`Cache invalidated and regeneration triggered for user ${userId} due to ${updateType} update`);
    } catch (error) {
        console.error("Error invalidating suggestions cache:", error);
    }
}