import { SuggestionCacheService } from "@/services/SuggestionCacheService";

export async function invalidateSuggestionsOnUpdate(userId: string, updateType: 'skills' | 'projects') {
    try {
        // Invalidate cache immediately
        await SuggestionCacheService.invalidateUserCache(userId);

        console.log(`Cache invalidated and regeneration triggered for user ${userId} due to ${updateType} update`);
    } catch (error) {
        console.error("Error invalidating suggestions cache:", error);
    }
}