import { GroqChat } from "@/lib/groqClient";
import type { ChatMessage } from "@/lib/groqClient";
import { ModelRouter, TaskType } from "@/lib/modelRouter";

interface ProjectIdea {
    title: string;
    description: string;
    keyFeatures: string[];
    techStack: string[];
    learningBenefits: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
}

interface SkillSuggestion {
    recommendedSkill: string;
    valueProposition: string;
    learningRoadmap: string[];
    timeInvestment: string;
    careerImpact: string;
}

export class AIService {
    // Initial: Project suggestions
    static async generateProjectIdeas(skills: string[], projects: { title: string, description: string }[]): Promise<ProjectIdea[]> {
        try {
            const skillsText = skills.join(", ");
            const projectsText = projects.map(p => `${p.title} (${p.description || ""})`).join("\n");

            const model = await ModelRouter.pick(TaskType.ProjectSuggest);
            const prompt: ChatMessage[] = [
                {
                    role: "system",
                    content:
                        "You are an expert software mentor. Return concise JSON strictly matching the schema. No extra text.",
                },
                {
                    role: "user",
                    content:
                        `Given these user skills and recent/owned projects, propose 1-3 tailored project ideas.\n\n` +
                        `Skills: ${skillsText}\nProjects:\n${projectsText}\n\n` +
                        `Return JSON array of objects with keys: title, description, keyFeatures (string[]), techStack (string[]), learningBenefits (string[]), difficulty ('beginner'|'intermediate'|'advanced').`
                }
            ];

            const jsonText = await GroqChat.json(model, prompt, { temperature: 0.3, max_tokens: 800 });
            const parsed = JSON.parse(jsonText);

            if (Array.isArray(parsed)) {
                return parsed as ProjectIdea[];
            }
            if (parsed && parsed.ideas && Array.isArray(parsed.ideas)) {
                return parsed.ideas as ProjectIdea[];
            }
            return [this.getFallbackProjectIdea(skills)];
        } catch (error) {
            console.error("Error generating project ideas:", error);
            return [this.getFallbackProjectIdea(skills)];
        }
    }

    // Initial: Skills roadmap
    static async suggestSkills(currentSkills: string[]): Promise<SkillSuggestion> {
        try {
            const skillsText = currentSkills.join(", ");

            const model = await ModelRouter.pick(TaskType.SkillsSuggest);
            const prompt: ChatMessage[] = [
                {
                    role: "system",
                    content:
                        "You are a career coach. Return concise JSON strictly matching the schema. No extra text.",
                },
                {
                    role: "user",
                    content:
                        `User's current skills: ${skillsText}\n` +
                        `Recommend 1 high-impact next skill with:\n` +
                        `- recommendedSkill (string)\n- valueProposition (string)\n- learningRoadmap (string[] of 4-8 steps)\n- timeInvestment (string)\n- careerImpact (string)\n` +
                        `Return exactly one JSON object.`
                }
            ];

            const jsonText = await GroqChat.json(model, prompt, { temperature: 0.3, max_tokens: 600 });
            const parsed = JSON.parse(jsonText);
            return parsed as SkillSuggestion;
        } catch (error) {
            console.error("Error suggesting skills:", error);
            return this.getFallbackSkillSuggestion(currentSkills);
        }
    }

    // Deep-dive: Project exploration
    static async deepDiveProject(project: { title: string; description?: string; techStack?: string[]; userSkills?: string[] }) {
        const model = await ModelRouter.pick(TaskType.ProjectDeepDive);
        const prompt: ChatMessage[] = [
            { role: "system", content: "You are a senior tech lead. Return structured JSON. No extra text." },
            {
                role: "user",
                content:
                    `Deep dive for project:\n` +
                    `Title: ${project.title}\nDescription: ${project.description || ""}\n` +
                    `Tech stack: ${(project.techStack || []).join(", ")}\nUser skills: ${(project.userSkills || []).join(", ")}\n\n` +
                    `Return JSON with keys:\n` +
                    `- milestones: string[]\n- architecture: string[] (key components)\n- tasksWeekByWeek: string[][] (8-12 weeks, each is string[])\n- risks: string[]\n- references: { title: string; url: string }[]`
            }
        ];
        const jsonText = await GroqChat.json(model, prompt, { temperature: 0.2, max_tokens: 1600 });
        return JSON.parse(jsonText);
    }

    // Deep-dive: Skills roadmap expansion
    static async deepDiveSkills(skill: string, currentSkills: string[]) {
        const model = await ModelRouter.pick(TaskType.SkillsDeepDive);
        const prompt: ChatMessage[] = [
            { role: "system", content: "You are a senior educator. Return structured JSON. No extra text." },
            {
                role: "user",
                content:
                    `User skills: ${currentSkills.join(", ")}\n` +
                    `Target skill for deep dive: ${skill}\n\n` +
                    `Return JSON with keys:\n` +
                    `- prerequisites: string[]\n- curriculum: { module: string; outcomes: string[]; resources: { title: string; url: string }[] }[]\n` +
                    `- practiceProjects: { title: string; brief: string }[]\n` +
                    `- assessment: string[]`
            }
        ];
        const jsonText = await GroqChat.json(model, prompt, { temperature: 0.25, max_tokens: 1400 });
        return JSON.parse(jsonText);
    }

    private static getFallbackProjectIdea(skills: string[]): ProjectIdea {
        return {
            title: "Personal Portfolio Website",
            description: "Create a modern portfolio website to showcase your projects and skills",
            keyFeatures: [
                "Responsive design",
                "Project showcase",
                "Skills section",
                "Contact form"
            ],
            techStack: ["React", "Next.js", "Tailwind CSS", "Vercel"],
            learningBenefits: [
                "Modern web development",
                "UI/UX principles",
                "Deployment workflows"
            ],
            difficulty: "intermediate"
        };
    }

    private static getFallbackSkillSuggestion(skills: string[]): SkillSuggestion {
        return {
            recommendedSkill: "TypeScript",
            valueProposition: "Adds type safety and improves code quality in JavaScript projects",
            learningRoadmap: [
                "Learn basic type system",
                "Practice with small projects",
                "Study advanced features",
                "Convert existing JS project"
            ],
            timeInvestment: "2-3 months for proficiency",
            careerImpact: "Highly sought after in frontend and full-stack roles"
        };
    }
}