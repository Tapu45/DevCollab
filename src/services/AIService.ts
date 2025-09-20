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
    // Enhanced: Project suggestions
    static async generateProjectIdeas(skills: string[], projects: { title: string, description: string }[]): Promise<ProjectIdea[]> {
        try {
            const skillsText = skills.join(", ");
            const projectsText = projects.map(p => `${p.title} (${p.description || ""})`).join("\n");

            const model = await ModelRouter.pick(TaskType.ProjectSuggest);
            const prompt: ChatMessage[] = [
                {
                    role: "system",
                    content:
                        "You are an expert software mentor specializing in cutting-edge development trends. Return concise JSON strictly matching the schema. No extra text.",
                },
                {
                    role: "user",
                    content:
                        `Analyze these user skills and projects in depth to propose EXACTLY 3 project ideas of progressive difficulty (beginner, intermediate, advanced).\n\n` +
                        `Skills: ${skillsText}\nProjects:\n${projectsText}\n\n` +
                        `Guidelines:\n` +
                        `- Suggest modern, innovative projects (avoid typical YouTube tutorial projects like basic e-commerce, todo apps, or clones)\n` +
                        `- Each project should build upon existing skills while introducing new challenges\n` +
                        `- Projects should follow a logical progression in difficulty\n` +
                        `- Suggest projects with real-world application and portfolio value\n` +
                        `- Focus on emerging technologies and market trends\n\n` +
                        `Return a JSON array with EXACTLY 3 objects (beginner, intermediate, advanced) with keys: title, description, keyFeatures (string[]), techStack (string[]), learningBenefits (string[]), difficulty ('beginner'|'intermediate'|'advanced').`
                }
            ];

            const jsonText = await GroqChat.json(model, prompt, { temperature: 0.4, max_tokens: 1000 });
            let parsed = JSON.parse(jsonText);

            if (Array.isArray(parsed)) {
                parsed = parsed.slice(0, 3);
                // Ensure we have exactly 3 projects
                while (parsed.length < 3) {
                    const difficulties = ['beginner', 'intermediate', 'advanced'];
                    const existingDifficulties = parsed.map((p: { difficulty: any; }) => p.difficulty);
                    const missingDifficulty = difficulties.find(d => !existingDifficulties.includes(d)) || 'beginner';
                    parsed.push(this.getFallbackProjectIdea(skills, missingDifficulty as 'beginner' | 'intermediate' | 'advanced'));
                }
                return parsed as ProjectIdea[];
            }

            if (parsed && parsed.ideas && Array.isArray(parsed.ideas)) {
                const ideas = parsed.ideas.slice(0, 3);
                while (ideas.length < 3) {
                    const difficulties = ['beginner', 'intermediate', 'advanced'];
                    const existingDifficulties = ideas.map((p: { difficulty: any; }) => p.difficulty);
                    const missingDifficulty = difficulties.find(d => !existingDifficulties.includes(d)) || 'beginner';
                    ideas.push(this.getFallbackProjectIdea(skills, missingDifficulty as 'beginner' | 'intermediate' | 'advanced'));
                }
                return ideas as ProjectIdea[];
            }

            return [
                this.getFallbackProjectIdea(skills, 'beginner'),
                this.getFallbackProjectIdea(skills, 'intermediate'),
                this.getFallbackProjectIdea(skills, 'advanced')
            ];
        } catch (error) {
            console.error("Error generating project ideas:", error);
            return [
                this.getFallbackProjectIdea(skills, 'beginner'),
                this.getFallbackProjectIdea(skills, 'intermediate'),
                this.getFallbackProjectIdea(skills, 'advanced')
            ];
        }
    }

    // Enhanced: Skills roadmap
    static async suggestSkills(currentSkills: string[]): Promise<SkillSuggestion[]> {
        try {
            const skillsText = currentSkills.join(", ");

            const model = await ModelRouter.pick(TaskType.SkillsSuggest);
            const prompt: ChatMessage[] = [
                {
                    role: "system",
                    content:
                        "You are a senior tech career coach with expertise in emerging technologies. Return concise JSON strictly matching the schema. No extra text.",
                },
                {
                    role: "user",
                    content:
                        `Thoroughly analyze these user skills: ${skillsText}\n\n` +
                        `Recommend EXACTLY 3 high-impact skills that:\n` +
                        `- Build upon the user's current skill set\n` +
                        `- Follow a logical progression (complement each other)\n` +
                        `- Include modern, in-demand technologies\n` +
                        `- Represent different aspects of development (e.g., frontend, backend, DevOps, etc.)\n` +
                        `- Will maximize career opportunities\n\n` +
                        `For each skill include:\n` +
                        `- recommendedSkill (string)\n` +
                        `- valueProposition (string)\n` +
                        `- learningRoadmap (string[] of 4-6 clear steps)\n` +
                        `- timeInvestment (string)\n` +
                        `- careerImpact (string)\n\n` +
                        `Return a JSON array containing EXACTLY 3 skill suggestion objects.`
                }
            ];

            const jsonText = await GroqChat.json(model, prompt, { temperature: 0.4, max_tokens: 1200 });
            let parsed = JSON.parse(jsonText);

            if (Array.isArray(parsed)) {
                parsed = parsed.slice(0, 3);
                while (parsed.length < 3) {
                    parsed.push(this.getFallbackSkillSuggestion(currentSkills, parsed.length));
                }
                return parsed as SkillSuggestion[];
            }

            return [
                this.getFallbackSkillSuggestion(currentSkills, 0),
                this.getFallbackSkillSuggestion(currentSkills, 1),
                this.getFallbackSkillSuggestion(currentSkills, 2)
            ];
        } catch (error) {
            console.error("Error suggesting skills:", error);
            return [
                this.getFallbackSkillSuggestion(currentSkills, 0),
                this.getFallbackSkillSuggestion(currentSkills, 1),
                this.getFallbackSkillSuggestion(currentSkills, 2)
            ];
        }
    }


    private static getFallbackProjectIdea(skills: string[], difficulty: 'beginner' | 'intermediate' | 'advanced'): ProjectIdea {
        const fallbacks: Record<'beginner' | 'intermediate' | 'advanced', ProjectIdea> = {
            beginner: {
                title: "Interactive Data Visualization Dashboard",
                description: "Create a responsive dashboard that visualizes data using modern charting libraries",
                keyFeatures: [
                    "Real-time data updates",
                    "Multiple visualization types",
                    "Filtering and sorting options",
                    "Responsive design"
                ],
                techStack: ["React", "D3.js or Chart.js", "Tailwind CSS", "Vite"],
                learningBenefits: [
                    "Data visualization principles",
                    "React state management",
                    "API integration",
                    "Modern UI development"
                ],
                difficulty: "beginner"
            },
            intermediate: {
                title: "AI-Enhanced Content Creator Tool",
                description: "Build a web application that uses AI to help users create and improve content",
                keyFeatures: [
                    "AI text enhancement",
                    "Content suggestions",
                    "Collaborative editing",
                    "Export to multiple formats"
                ],
                techStack: ["Next.js", "OpenAI API", "Prisma", "tRPC", "TypeScript"],
                learningBenefits: [
                    "AI integration",
                    "Full-stack development",
                    "API design",
                    "User authentication"
                ],
                difficulty: "intermediate"
            },
            advanced: {
                title: "Decentralized Knowledge Sharing Platform",
                description: "Create a platform where users can share knowledge and get rewarded through a token system",
                keyFeatures: [
                    "Blockchain-based rewards",
                    "Content verification system",
                    "Reputation mechanics",
                    "Distributed storage"
                ],
                techStack: ["Solidity", "React", "IPFS", "Node.js", "GraphQL"],
                learningBenefits: [
                    "Blockchain development",
                    "Distributed systems",
                    "Smart contract security",
                    "Web3 integration"
                ],
                difficulty: "advanced"
            }
        };

        return fallbacks[difficulty];
    }

    private static getFallbackSkillSuggestion(skills: string[], index: number): SkillSuggestion {
        const fallbacks = [
            {
                recommendedSkill: "TypeScript",
                valueProposition: "Adds type safety and improves code quality in JavaScript projects",
                learningRoadmap: [
                    "Learn basic type system",
                    "Practice with small projects",
                    "Study interfaces and generics",
                    "Learn advanced type manipulation",
                    "Convert existing JS project"
                ],
                timeInvestment: "2-3 months for proficiency",
                careerImpact: "Highly sought after in frontend and full-stack roles"
            },
            {
                recommendedSkill: "Containerization with Docker & Kubernetes",
                valueProposition: "Streamline deployment and ensure consistent environments across development and production",
                learningRoadmap: [
                    "Master Docker basics and container concepts",
                    "Create custom Dockerfiles for applications",
                    "Learn Docker Compose for multi-container setups",
                    "Study Kubernetes fundamentals",
                    "Practice container orchestration"
                ],
                timeInvestment: "3-4 months for working knowledge",
                careerImpact: "Essential for DevOps roles and increasingly required for full-stack developers"
            },
            {
                recommendedSkill: "Machine Learning Fundamentals",
                valueProposition: "Add intelligence and data-driven features to applications",
                learningRoadmap: [
                    "Learn Python for ML",
                    "Study data processing with pandas",
                    "Understand basic ML algorithms",
                    "Practice with scikit-learn",
                    "Implement ML in a web application",
                    "Study MLOps basics"
                ],
                timeInvestment: "4-6 months for fundamentals",
                careerImpact: "Opens doors to AI/ML roles and adds value to full-stack development positions"
            }
        ];

        return fallbacks[index] || fallbacks[0];
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
}