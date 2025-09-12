import { Client } from "@gradio/client";

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
    private static readonly PROJECT_IDEA_ENDPOINT = process.env.NEXT_PUBLIC_PROJECT_IDEA_ENDPOINT!;
    private static readonly SKILL_SUGGESTION_ENDPOINT = process.env.NEXT_PUBLIC_SKILL_SUGGESTION_ENDPOINT!;
    private static readonly HF_TOKEN = process.env.HUGGINGFACE_API_TOKEN! as `hf_${string}`;

    static async generateProjectIdeas(skills: string[], projects: { title: string, description: string }[]): Promise<ProjectIdea[]> {
        try {
            const client = await Client.connect(this.PROJECT_IDEA_ENDPOINT, {
                hf_token: this.HF_TOKEN,
            });

            // Format skills and projects to match the model's expected input
            const skillsText = skills.join(", ");
            const projectsText = projects.map(p =>
                `${p.title} (${p.description})`
            ).join("\n");

            const result = await client.predict("/generate_project_idea", {
                skills: skillsText,
                projects: projectsText,
            });

            // Parse the structured response
            const response = result.data as string;
            return this.parseProjectIdea(response);
        } catch (error) {
            console.error("Error generating project ideas:", error);
            return [this.getFallbackProjectIdea(skills)];
        }
    }

    static async suggestSkills(currentSkills: string[]): Promise<SkillSuggestion> {
        try {
            const client = await Client.connect(this.SKILL_SUGGESTION_ENDPOINT, {
                hf_token: this.HF_TOKEN,
            });

            // Format current skills with proficiency levels if available
            const skillsText = currentSkills.map(skill => {
                // You could enhance this by adding proficiency levels from your DB
                return skill;
            }).join(", ");

            const result = await client.predict("/suggest_skill", {
                current_skills: skillsText,
            });

            // Parse the structured response
            const response = result.data as string;
            return this.parseSkillSuggestion(response);
        } catch (error) {
            console.error("Error suggesting skills:", error);
            return this.getFallbackSkillSuggestion(currentSkills);
        }
    }

    private static parseProjectIdea(response: string): ProjectIdea[] {
        try {
            // Extract sections using regex or string splitting
            const sections = response.split('\n');
            const idea: ProjectIdea = {
                title: this.extractSection(sections, "Project Title:"),
                description: this.extractSection(sections, "Project Description:"),
                keyFeatures: this.extractBulletPoints(sections, "Key Features:"),
                techStack: this.extractBulletPoints(sections, "Tech Stack:"),
                learningBenefits: this.extractBulletPoints(sections, "Learning Benefits:"),
                difficulty: this.extractSection(sections, "Difficulty:").toLowerCase() as any,
            };
            return [idea];
        } catch (error) {
            console.error("Error parsing project idea:", error);
            return [this.getFallbackProjectIdea([])];
        }
    }

    private static parseSkillSuggestion(response: string): SkillSuggestion {
        try {
            const sections = response.split('\n');
            return {
                recommendedSkill: this.extractSection(sections, "Recommended Skill:"),
                valueProposition: this.extractSection(sections, "Why It's Valuable:"),
                learningRoadmap: this.extractBulletPoints(sections, "Learning Roadmap:"),
                timeInvestment: this.extractSection(sections, "Time Investment:"),
                careerImpact: this.extractSection(sections, "Career Impact:"),
            };
        } catch (error) {
            console.error("Error parsing skill suggestion:", error);
            return this.getFallbackSkillSuggestion([]);
        }
    }

    private static extractSection(sections: string[], header: string): string {
        const section = sections.find(s => s.trim().startsWith(header));
        return section ? section.replace(header, '').trim() : '';
    }

    private static extractBulletPoints(sections: string[], header: string): string[] {
        const startIndex = sections.findIndex(s => s.trim().startsWith(header));
        if (startIndex === -1) return [];

        const points: string[] = [];
        for (let i = startIndex + 1; i < sections.length; i++) {
            const line = sections[i].trim();
            if (line.startsWith('-') || line.startsWith('•')) {
                points.push(line.substring(1).trim());
            } else if (line.match(/^\d+\./)) {
                points.push(line.replace(/^\d+\./, '').trim());
            } else if (line === '' || line.includes(':')) {
                break;
            }
        }
        return points;
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