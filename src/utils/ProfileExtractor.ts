import { prisma } from "../lib/Prisma";
import {  SkillCategory } from "../generated/prisma/index.js";

export async function extractUserProfileData(userId: string) {
  try {
    // Fetch complete user profile with relations based on actual schema
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        skills: true,
        experiences: true,
        educations: true,
        ownedProjects: true,
        projectCollaborations: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // Extract skills with categories and proficiency matching schema
    const skillsText = user.skills.map(skill => 
      `${skill.name} (${SkillCategory[skill.category]}, proficiency: ${skill.proficiencyLevel}/10)`
    ).join(". ");

    // Extract work experience matching schema
    const experienceText = user.experiences.map(exp => 
      `${exp.title} at ${exp.company}` +
      `${exp.location ? ` in ${exp.location}` : ''}` +
      ` (${formatDateRange(exp.startDate, exp.endDate)}).` +
      `${exp.responsibilities ? ` ${exp.responsibilities}` : ''}`
    ).join(" ");

    // Extract education matching schema
    const educationText = user.educations.map(edu => 
      `${edu.degree || ''} ${edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ''}` +
      ` at ${edu.institution}` +
      `${edu.startDate ? ` (${formatDateRange(edu.startDate, edu.endDate)})` : ''}`
    ).join(" ");

    // Extract project information matching schema
    const ownedProjectsText = user.ownedProjects.map(project => 
      `Created "${project.title}"${project.shortDesc ? `: ${project.shortDesc}` : ''}. ` +
      `${project.techStack?.length ? `Technologies: ${project.techStack.join(", ")}.` : ''}`
    ).join(" ");

    // Combine all user data into structured format for embedding
    const profileData = {
      userId: user.id,
      basicInfo: {
        displayName: user.displayName || `${user.firstName} ${user.lastName}`,
        location: user.location,
        timezone: user.timezone,
        bio: user.bio,
        website: user.website,
        githubUrl: user.githubUrl,
        linkedinUrl: user.linkedinUrl,
        profileVisibility: user.profileVisibility,
      },
      skills: user.skills.map(skill => ({
        name: skill.name,
        category: skill.category,
        proficiencyLevel: skill.proficiencyLevel,
        yearsExperience: skill.yearsExperience,
        lastUsed: skill.lastUsed,
      })),
      accountType: user.accountType,
      experienceLevel: calculateExperienceLevel(user.experiences),
      formattedText: {
        summary: `${user.displayName || user.firstName} is a developer ${user.location ? `from ${user.location}` : ""} ${user.bio ? `who ${user.bio}` : ""}.`,
        skills: skillsText,
        experience: experienceText,
        education: educationText,
        projects: `${ownedProjectsText}`,
      },
      metadata: {
        location: user.location,
        timezone: user.timezone,
        experienceYears: calculateTotalExperienceYears(user.experiences),
        accountType: user.accountType,
        reputationScore: user.reputationScore,
        totalContributions: user.totalContributions,
        projectCount: user.ownedProjects.length + user.projectCollaborations.length,
        profileVisibility: user.profileVisibility,
      }
    };

    return profileData;
  } catch (error) {
    console.error("Error extracting user profile data:", error);
    throw error;
  }
}

/**
 * Helper function to format date ranges
 */
function formatDateRange(startDate: Date | null, endDate: Date | null): string {
  if (!startDate) return "N/A";
  
  const start = new Date(startDate).getFullYear();
  const end = endDate ? new Date(endDate).getFullYear() : "Present";
  
  return `${start} to ${end}`;
}

/**
 * Calculate total years of experience from work history
 */
function calculateTotalExperienceYears(experiences: any[]): number {
  if (!experiences || experiences.length === 0) return 0;
  
  const totalDays = experiences.reduce((total, exp) => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
    const daysInPosition = (endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24);
    return total + daysInPosition;
  }, 0);
  
  // Convert days to years (approximate)
  return Math.round(totalDays / 365);
}

/**
 * Determine experience level based on work history
 */
function calculateExperienceLevel(experiences: any[]): string {
  const yearsOfExperience = calculateTotalExperienceYears(experiences);
  
  if (yearsOfExperience < 2) return "beginner";
  if (yearsOfExperience < 5) return "intermediate";
  if (yearsOfExperience < 10) return "advanced";
  return "expert";
}

/**
 * Extract top skills by proficiency level
 */
function extractTopSkills(skills: any[], limit: number): string[] {
  if (!skills || skills.length === 0) return [];
  
  return skills
    .sort((a, b) => b.proficiencyLevel - a.proficiencyLevel)
    .slice(0, limit)
    .map(skill => skill.name);
}

/**
 * Batch extract multiple user profiles
 */
export async function batchExtractUserProfiles(userIds: string[]) {
  const results = [];
  
  for (const userId of userIds) {
    try {
      const profileData = await extractUserProfileData(userId);
      results.push(profileData);
    } catch (error) {
      console.error(`Error processing user ${userId}:`, error);
      // Continue with other users even if one fails
    }
  }
  
  return results;
}