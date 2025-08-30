export interface BasicInfo {
  id: string;
  email: string;
  username: string;
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
  website?: string;
  github?: string;
  linkedin?: string;
  profileVisibility: string;
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description: string;
  location: string;
}

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  location: string;
  type: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  link?: string;
  image?: string;
  startDate: string;
  endDate?: string;
}

export interface Skill {
  id: string;
  name: string;
  level?: string;
  category?: string;
}

export interface ProfileData {
  basic: BasicInfo;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
}