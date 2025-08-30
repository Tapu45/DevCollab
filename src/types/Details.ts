export interface Skill {
  name: string;
  category: string;
  proficiencyLevel: number;
  isVerified?: boolean;
  yearsExperience?: number;
}

export interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  responsibilities: string;
}

export interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  grade: string;
  description: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  shortDesc: string;
  status: string;
  visibility: string;
  techStack: string;
  categories: string;
  tags: string;
  difficultyLevel: string;
  githubUrl: string;
  liveUrl: string;
  thumbnailUrl: string;
}

export interface Achievement {
  achievement: {
    name: string;
    description: string;
    icon: string;
    category: string;
    points: number;
  };
  unlockedAt: string;
}

export interface Endorsement {
  skill: {
    name: string;
    category: string;
  };
  message: string;
}

export interface ForumPost {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
}

export interface EventParticipation {
  event: {
    id: string;
    title: string;
    type: string;
    startDate: string;
    endDate: string;
    location: string;
    isVirtual: boolean;
  };
  status: string;
}

export interface ProfileProgress {
  currentSection: string;
  lastUpdated: string;
}

export interface UserProfile {
  id: string;
  displayName: string;
  firstName: string;
  lastName: string;
  profilePictureUrl: string | null;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  website: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
  profileVisibility: string;
  accountType: string;
  reputationScore: number;
  totalContributions: number;
  skills: Skill[];
  experiences: Experience[];
  educations: Education[];
  ownedProjects: Project[];
  achievements: Achievement[];
  endorsements: Endorsement[];
  forumPosts: ForumPost[];
  eventParticipations: EventParticipation[];
  profileProgress: ProfileProgress | null;
  createdAt: string;
}