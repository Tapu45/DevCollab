'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useQueries } from '@tanstack/react-query';
import { motion, easeOut } from 'framer-motion';
import {
  Edit,
  Share2,
  Mail,
  Globe,
  Github,
  Linkedin,
  MapPin,
  Clock,
  Briefcase,
  GraduationCap,
  Code,
  Star,
  Users,
  TrendingUp,
  ExternalLink,
  Building2,
  BookOpen,
  Zap,
  Calendar,
  Award,
  MessageSquare,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Loader from '@/components/shared/Loader';

// --- Types ---
type UserProfile = {
  id?: string;
  displayName?: string;
  headline?: string;
  bio?: string;
  location?: string;
  timezone?: string;
  website?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  avatarUrl?: string;
  availability?: string;
};

type Skill = {
  id?: string;
  name: string;
  category?: string;
  proficiencyLevel?: number;
};

type Project = {
  id?: string;
  title: string;
  githubUrl?: string;
  shortDesc?: string;
  tech?: string[];
};

type Experience = {
  id?: string;
  title: string;
  company: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  responsibilities?: string;
};

type Education = {
  id?: string;
  institution: string;
  degree?: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  grade?: string;
  description?: string;
};

// --- Query Functions ---
async function fetchUser(): Promise<UserProfile | null> {
  const res = await fetch('/api/profile/user');
  if (res.status === 401) return null;
  if (!res.ok) throw new Error('Failed to fetch user');
  const data = await res.json();
  return data || null;
}

async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch('/api/profile/skills');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchProjects(): Promise<Project[]> {
  const res = await fetch('/api/profile/projects');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchExperience(): Promise<Experience[]> {
  const res = await fetch('/api/profile/experience');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function fetchEducation(): Promise<Education[]> {
  const res = await fetch('/api/profile/education');
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: easeOut },
  },
};

const cardHoverVariants = {
  hover: {
    y: -4,
    transition: { duration: 0.2, ease: easeOut },
  },
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((s: string) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

// --- Main Component ---
function ProfileView() {
  const router = useRouter();

  // Use TanStack Query for all data
  const userQuery = useQuery<UserProfile | null>({
    queryKey: ['profile', 'user'],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const queries = useQueries({
    queries: [
      {
        queryKey: ['profile', 'skills'],
        queryFn: fetchSkills,
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
      {
        queryKey: ['profile', 'projects'],
        queryFn: fetchProjects,
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
      {
        queryKey: ['profile', 'experience'],
        queryFn: fetchExperience,
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
      {
        queryKey: ['profile', 'education'],
        queryFn: fetchEducation,
        staleTime: 1000 * 60 * 5,
        retry: 1,
      },
    ],
  });

  // Loading and error states
  const loading = userQuery.isLoading || queries.some((q) => q.isLoading);
  const error = userQuery.isError || queries.some((q) => q.isError);

  // Data
  const user = userQuery.data;
  const skills = queries[0]?.data ?? [];
  const projects = queries[1]?.data ?? [];
  const experiences = queries[2]?.data ?? [];
  const educations = queries[3]?.data ?? [];

  // Sort timeline data
  const sortedExperiences = Array.isArray(experiences)
    ? [...experiences].sort((a, b) =>
        (b.startDate || '').localeCompare(a.startDate || ''),
      )
    : [];
  const sortedEducations = Array.isArray(educations)
    ? [...educations].sort((a, b) =>
        (b.startDate || '').localeCompare(a.startDate || ''),
      )
    : [];

  // Empty state
  const isEmpty =
    !user ||
    (!user.displayName &&
      skills.length === 0 &&
      projects.length === 0 &&
      experiences.length === 0 &&
      educations.length === 0);

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[60vh] flex items-center justify-center p-6"
      >
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">
              Failed to Load Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              There was an error loading your profile. Please try again later.
            </p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Empty profile state
  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[60vh] flex items-center justify-center p-6"
      >
        <Card className="w-full max-w-2xl border-muted bg-muted/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-2xl mb-2">Create Your Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground text-lg mb-6">
              You don't have a profile yet. Create a professional profile to get
              AI recommendations and collaborator matches.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <Button
                onClick={() => router.push('/profile/create')}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
              >
                Create Profile
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="border-border/50 hover:bg-accent/10 px-8 py-3 text-lg"
              >
                Go to Dashboard
              </Button>
            </div>
            <div className="bg-accent/10 border border-accent/20 rounded-xl p-4">
              <p className="text-sm text-muted-foreground">
                <strong>Tip:</strong> Import from GitHub / LinkedIn or add basic
                info, 3 skills and one project to enable matching.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Utility
  const topSkills = skills.slice(0, 8);
  const projectsCount = projects.length;
  const collaborations = user?.id ? '-' : '-';

  function formatDate(d?: string) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d.slice(0, 10);
    }
  }

  // Calculate profile completeness
  const profileCompleteness = Math.min(
    100,
    Math.round(
      (((skills.length > 0 ? 1 : 0) +
        (projects.length > 0 ? 1 : 0) +
        (sortedExperiences.length > 0 ? 1 : 0) +
        (sortedEducations.length > 0 ? 1 : 0) +
        (user?.bio ? 1 : 0)) /
        5) *
        100,
    ),
  );

  // Main profile view
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-3">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Hero Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/50 mb-4"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>

          <div className="relative p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* Profile Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Avatar className="h-16 w-16 lg:h-24 lg:w-24 ring-2 ring-background shadow-xl">
                  <AvatarImage
                    src={user?.avatarUrl || ''}
                    alt={user?.displayName || ''}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xl lg:text-2xl">
                    {user?.displayName ? getInitials(user.displayName) : '?'}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mb-2">
                  <div>
                    <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
                      {user?.displayName || '—'}
                    </h1>
                    {user?.headline && (
                      <p className="text-base text-muted-foreground">
                        {user.headline}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/50 hover:bg-accent/10 px-2 py-1"
                    >
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                    <Button
                      onClick={() => router.push('/profile/create')}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground px-2 py-1"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </div>

                {user?.bio && (
                  <p className="text-muted-foreground text-base mb-2 max-w-2xl">
                    {user.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground mb-2">
                  {user?.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{user.location}</span>
                    </div>
                  )}
                  {user?.timezone && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{user.timezone}</span>
                    </div>
                  )}
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-2">
                  {user?.githubUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-border/50 hover:bg-accent/10 px-2 py-1"
                    >
                      <a
                        href={user.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-1" />
                        GitHub
                      </a>
                    </Button>
                  )}

                  {user?.linkedinUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-border/50 hover:bg-accent/10 px-2 py-1"
                    >
                      <a
                        href={user.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4 mr-1" />
                        LinkedIn
                      </a>
                    </Button>
                  )}

                  {user?.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-border/50 hover:bg-accent/10 px-2 py-1"
                    >
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    size="sm"
                    className="border-border/50 hover:bg-accent/10 px-2 py-1"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Contact
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-4 gap-4"
        >
          {/* Left Column - Main Content */}
          <div className="lg:col-span-3 space-y-4">
          {/* Summary Section */}
<motion.div variants={itemVariants}>
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Star className="w-4 h-4 text-primary" />
        Summary
      </CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-muted-foreground text-sm mb-2">
        {user?.bio || 'No summary provided.'}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-muted/20 border border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
              <Code className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                Projects
              </h4>
              <p className="text-lg font-bold text-primary">
                {projectsCount}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Public projects linked to your profile
          </p>
        </div>
        <div className="p-2 rounded-lg bg-muted/20 border border-border/20">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-accent-foreground" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                Match Score
              </h4>
              <p className="text-lg font-bold text-accent-foreground">
                —
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Match score & recent activity
          </p>
        </div>
      </div>
    </CardContent>
  </Card>
</motion.div>

{/* Experience Section */}
<motion.div variants={itemVariants}>
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Briefcase className="w-4 h-4 text-primary" />
        Professional Experience
      </CardTitle>
    </CardHeader>
    <CardContent>
      {sortedExperiences.length === 0 ? (
        <p className="text-muted-foreground text-center py-3 text-sm">
          No experience added yet
        </p>
      ) : (
        <div className="space-y-1">
          {sortedExperiences.map((ex, idx) => (
            <motion.div
              key={ex.id || `${ex.title}-${ex.company}`}
              variants={cardHoverVariants}
              whileHover="hover"
              className="p-2 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">
                    {ex.title}
                  </h4>
                  <p className="text-primary font-medium text-xs">
                    {ex.company}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDate(ex.startDate)} —{' '}
                      {ex.isCurrent ? 'Present' : formatDate(ex.endDate)}
                    </span>
                  </div>
                  {ex.responsibilities && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {ex.responsibilities}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</motion.div>

{/* Education Section */}
<motion.div variants={itemVariants}>
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <GraduationCap className="w-4 h-4 text-primary" />
        Education
      </CardTitle>
    </CardHeader>
    <CardContent>
      {sortedEducations.length === 0 ? (
        <p className="text-muted-foreground text-center py-3 text-sm">
          No education entries yet
        </p>
      ) : (
        <div className="space-y-1">
          {sortedEducations.map((ed, idx) => (
            <motion.div
              key={ed.id || ed.institution}
              variants={cardHoverVariants}
              whileHover="hover"
              className="p-2 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-foreground text-sm">
                    {ed.institution}
                  </h4>
                  {ed.degree && (
                    <p className="text-accent-foreground font-medium text-xs">
                      {ed.degree}
                    </p>
                  )}
                  {ed.fieldOfStudy && (
                    <p className="text-foreground text-xs">
                      {ed.fieldOfStudy}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {formatDate(ed.startDate)} — {formatDate(ed.endDate)}
                    </span>
                  </div>
                  {ed.description && (
                    <p className="text-muted-foreground mt-1 text-xs">
                      {ed.description}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</motion.div>

{/* Projects Section */}
<motion.div variants={itemVariants}>
  <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 p-2">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Code className="w-4 h-4 text-primary" />
        Featured Projects
      </CardTitle>
    </CardHeader>
    <CardContent>
      {projects.length === 0 ? (
        <p className="text-muted-foreground text-center py-3 text-sm">
          No projects added yet
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {projects.map((p) => (
            <motion.div
              key={p.id || p.title}
              variants={cardHoverVariants}
              whileHover="hover"
              className="p-2 rounded-lg bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
            >
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Code className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-foreground text-sm">
                      {p.title}
                    </h4>
                    {p.githubUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-6 px-1"
                      >
                        <a
                          href={p.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </Button>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs line-clamp-3 mb-1">
                    {p.shortDesc}
                  </p>
                  {p.tech && (
                    <div className="flex flex-wrap gap-1">
                      {p.tech.map((t) => (
                        <Badge
                          key={t}
                          variant="secondary"
                          className="text-[10px] px-1 py-0"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</motion.div>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Skills Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="w-4 h-4 text-primary" />
                    Skills & Proficiency
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {skills.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No skills added
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {topSkills.map((s) => (
                        <div key={s.id || s.name}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-foreground text-sm">
                              {s.name}
                            </span>
                            {s.category && (
                              <Badge variant="outline" className="text-xs">
                                {s.category}
                              </Badge>
                            )}
                          </div>
                          <Progress
                            value={
                              s.proficiencyLevel
                                ? (s.proficiencyLevel / 5) * 100
                                : 0
                            }
                            className="h-2"
                          />
                        </div>
                      ))}

                      {skills.length > topSkills.length && (
                        <div className="text-center pt-2">
                          <Badge variant="secondary" className="text-xs">
                            And {skills.length - topSkills.length} more
                          </Badge>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact & Availability */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="w-4 h-4 text-primary" />
                    Contact & Availability
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {user?.availability && (
                      <div className="p-3 rounded-lg bg-muted/20 border border-border/20">
                        <p className="text-sm">
                          <strong className="text-foreground">
                            Availability:
                          </strong>{' '}
                          {user.availability}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      {user?.githubUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full justify-start border-border/50 hover:bg-accent/10"
                        >
                          <a
                            href={user.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Github className="w-4 h-4 mr-2" />
                            GitHub
                          </a>
                        </Button>
                      )}

                      {user?.linkedinUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full justify-start border-border/50 hover:bg-accent/10"
                        >
                          <a
                            href={user.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Linkedin className="w-4 h-4 mr-2" />
                            LinkedIn
                          </a>
                        </Button>
                      )}

                      {user?.website && (
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="w-full justify-start border-border/50 hover:bg-accent/10"
                        >
                          <a
                            href={user.website}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            Website
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Stats */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Profile Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Projects
                      </span>
                      <span className="font-semibold text-foreground">
                        {projectsCount}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Connections
                      </span>
                      <span className="font-semibold text-foreground">
                        {collaborations}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          Profile completeness
                        </span>
                        <span className="text-sm font-medium text-foreground">
                          {profileCompleteness}%
                        </span>
                      </div>
                      <Progress value={profileCompleteness} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ProfileView;
