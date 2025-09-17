import { RateLimits } from "./rateLimits";

export enum TaskType {
    ProjectSuggest = "ProjectSuggest",
    SkillsSuggest = "SkillsSuggest",
    ProjectDeepDive = "ProjectDeepDive",
    SkillsDeepDive = "SkillsDeepDive",
}

// Primary 4 and ordered fallbacks
const CHAINS: Record<TaskType, string[]> = {
    [TaskType.ProjectSuggest]: [
        "gemma2-9b-it",
        "llama-3.1-8b-instant",
        "qwen/qwen3-32b",
    ],
    [TaskType.SkillsSuggest]: [
        "llama-3.1-8b-instant",
        "gemma2-9b-it",
        "qwen/qwen3-32b",
    ],
    [TaskType.ProjectDeepDive]: [
        "llama-3.3-70b-versatile",
        "moonshotai/kimi-k2-instruct",
        "deepseek-r1-distill-llama-70b",
        "openai/gpt-oss-120b",
    ],
    [TaskType.SkillsDeepDive]: [
        "moonshotai/kimi-k2-instruct",
        "llama-3.3-70b-versatile",
        "qwen/qwen3-32b",
        "openai/gpt-oss-20b",
    ],
};

export const ModelRouter = {
    async pick(task: TaskType): Promise<string> {
        const chain = CHAINS[task];
        for (const model of chain) {
            if (!RateLimits.shouldSwitch(model)) {
                return model;
            }
        }
        // If all look constrained, still pick first to proceed
        return chain[0];
    },
};