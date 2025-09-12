import { prisma } from "@/lib/Prisma";
import { AIService } from "./AIService";

export class SuggestionCacheService {
    private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    static async getUserSuggestions(userId: string) {
        const cache = await prisma.userSuggestionCache.findUnique({
            where: { userId },
            include: { user: { include: { skills: true, ownedProjects: true } } }
        });

        if (this.isCacheValid(cache)) {
            return {
                projectIdeas: JSON.parse(cache!.projectIdeas as string),
                skillSuggestions: JSON.parse(cache!.skillSuggestions as string),
                fromCache: true
            };
        }

        // Generate new suggestions
        return await this.generateAndCacheSuggestions(userId);
    }

    static async generateAndCacheSuggestions(userId: string) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                skills: true,
                ownedProjects: true
            }
        });

        if (!user) throw new Error("User not found");

        const skills = user.skills.map(s => s.name);
        const projects = user.ownedProjects.map(p => ({
            title: p.title,
            description: p.description || ""
        }));

        // Generate suggestions using AI
        const [projectIdeas, skillSuggestions] = await Promise.all([
            AIService.generateProjectIdeas(skills, projects),
            AIService.suggestSkills(skills)
        ]);

        // Cache the results
        const cache = await prisma.userSuggestionCache.upsert({
            where: { userId },
            update: {
                projectIdeas: JSON.stringify(projectIdeas),
                skillSuggestions: JSON.stringify(skillSuggestions),
                lastGenerated: new Date(),
                isValid: true
            },
            create: {
                userId,
                projectIdeas: JSON.stringify(projectIdeas),
                skillSuggestions: JSON.stringify(skillSuggestions),
                lastGenerated: new Date(),
                isValid: true
            }
        });

        return {
            projectIdeas: JSON.parse(cache.projectIdeas as string),
            skillSuggestions: JSON.parse(cache.skillSuggestions as string),
            fromCache: false
        };
    }

    static async invalidateUserCache(userId: string) {
        await prisma.userSuggestionCache.updateMany({
            where: { userId },
            data: { isValid: false }
        });
    }

    private static isCacheValid(cache: any): boolean {
        if (!cache || !cache.isValid) return false;

        const now = new Date();
        const cacheAge = now.getTime() - cache.lastGenerated.getTime();

        return cacheAge < this.CACHE_DURATION;
    }
}