'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { UserProfile } from '@/types/Details';
import Loader from '@/components/shared/Loader';
import { motion, easeOut } from 'framer-motion';
import {
  MapPin,
  Globe,
  Github,
  Linkedin,
  Award,
  Briefcase,
  GraduationCap,
  Code,
  MessageSquare,
  Calendar,
  Star,
  Users,
  Trophy,
  Building2,
  BookOpen,
  Zap,
  ExternalLink,
  Clock,
  CheckCircle,
  TrendingUp,
  Target,
  Layers,
  Database,
  Cloud,
  Wrench,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ConnectionButton from '../lazy/ConnectionButton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useUser } from '@clerk/nextjs';

const fetchProfile = async (
  userId: string,
): Promise<UserProfile | { blocked: true }> => {
  const res = await fetch(`/api/profile?userId=${userId}`);
  if (res.status === 403) {
    // Blocked by user
    return { blocked: true };
  }
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Failed to fetch profile');
  }
  return res.json();
};

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'PROGRAMMING_LANGUAGE':
      return <Code className="w-4 h-4" />;
    case 'FRAMEWORK':
      return <Layers className="w-4 h-4" />;
    case 'DATABASE':
      return <Database className="w-4 h-4" />;
    case 'CLOUD_PLATFORM':
      return <Cloud className="w-4 h-4" />;
    case 'DEVOPS_TOOL':
      return <Wrench className="w-4 h-4" />;
    default:
      return <Code className="w-4 h-4" />;
  }
};

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


export default function ViewUserProfile() {
  const { userId } = useParams();
  const { user, isLoaded } = useUser(); 
  

  const {
    data: profile,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['user-profile', userId],
    queryFn: () => fetchProfile(userId as string),
    enabled: !!userId,
    staleTime: 1000 * 60 * 10,
    refetchOnWindowFocus: false,
  });

   if (isLoading || !isLoaded) {
     return <Loader />;
   }

  if (isError) {
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
              <Users className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Profile Not Found</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {error instanceof Error ? error.message : 'Could not load profile'}
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  if (!profile) {
    return null;
  }

  if ('blocked' in profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-primary/40 bg-primary/10 shadow-[0_0_32px_0_var(--primary)]">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-primary font-bold">
                Umm... Access Denied!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-primary-foreground mb-4">
                Looks like they don&apos;t want to collaborate with you right
                now.
                <br />
                Maybe try connecting with someone else? 😅
              </p>
              <Button
                variant="outline"
                onClick={() => (window.location.href = '/collaborate')}
                className="border-primary/40 text-primary hover:bg-primary/10"
              >
                Explore Network
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Group skills by category
  const skillsByCategory = profile.skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof profile.skills>);

  return (
    <div className="min-h-screen bg-background">
      {profile && (profile as any).blocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-[6px] bg-black/40">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.23, 1.02, 0.64, 1.01] }}
            className="w-full max-w-md mx-auto"
          >
            <Card className="border-primary/40 bg-primary/10 shadow-[0_0_32px_0_var(--primary)]">
              <CardHeader className="text-center">
                <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-4 animate-bounce">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-primary font-bold">
                  Umm... Access Denied!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-lg text-primary-foreground mb-4">
                  Looks like they don&apos;t want to collaborate with you right
                  now.
                  <br />
                  Maybe try connecting with someone else? 😅
                </p>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/my-network')}
                  className="border-primary/40 text-primary hover:bg-primary/10"
                >
                  Explore Network
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 "
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-card via-card to-muted/30 border border-border/50 mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5"></div>

          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
              {/* Profile Avatar */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className="relative flex-shrink-0"
              >
                <Avatar className="h-28 w-28 lg:h-36 lg:w-36 ring-4 ring-background shadow-xl">
                  <AvatarImage
                    src={profile.profilePictureUrl || ''}
                    alt={profile.displayName || ''}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl lg:text-3xl">
                    {getInitials(
                      profile.displayName ||
                        `${profile.firstName} ${profile.lastName}`,
                    )}
                  </AvatarFallback>
                </Avatar>
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0 space-y-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                    {profile.displayName ||
                      `${profile.firstName} ${profile.lastName}`}
                  </h1>
                  {profile.bio && (
                    <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                </div>

                {/* Stats + Social Links + Connect Button in one line */}
                <div className="flex flex-wrap items-center gap-6 mt-2">
                  {/* Stats Row */}
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-semibold text-foreground">
                      {profile.reputationScore}
                    </span>
                    <span className="text-muted-foreground">reputation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-accent-foreground" />
                    <span className="font-semibold text-foreground">
                      {profile.totalContributions}
                    </span>
                    <span className="text-muted-foreground">contributions</span>
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Social Links */}
                  <div className="flex items-center gap-3">
                    {profile.website && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-9"
                      >
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Globe className="w-4 h-4 mr-2" />
                          Website
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {profile.githubUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-9"
                      >
                        <a
                          href={profile.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Github className="w-4 h-4 mr-2" />
                          GitHub
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {profile.linkedinUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="h-9"
                      >
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Linkedin className="w-4 h-4 mr-2" />
                          LinkedIn
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </Button>
                    )}
                    {/* Connection Button */}
                    {user?.id && user.id !== userId && (
                      <ConnectionButton
                        userId={userId as string}
                        className="shadow-sm hover:shadow-md transition-shadow duration-200 ml-2"
                      />
                    )}
                  </div>
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
          className="grid grid-cols-1 xl:grid-cols-3 gap-8"
        >
          {/* Left Column - Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Skills Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6">
                  <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                    <Code className="w-5 h-5 text-primary" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {Object.entries(skillsByCategory).map(
                    ([category, skills]) => (
                      <div key={category} className="space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          {getCategoryIcon(category)}
                          <h3 className="font-medium text-foreground capitalize">
                            {category.replace(/_/g, ' ').toLowerCase()}
                          </h3>
                          <Badge variant="secondary" className="text-xs">
                            {skills.length}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {skills.map((skill) => (
                            <div
                              key={skill.name}
                              className="p-4 rounded-lg bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium text-foreground">
                                  {skill.name}
                                </h4>
                                <div className="flex items-center gap-1">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full ${
                                        i <
                                        Math.floor(skill.proficiencyLevel / 2)
                                          ? 'bg-primary'
                                          : 'bg-muted-foreground/20'
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>{skill.yearsExperience} years</span>
                                <span>{skill.proficiencyLevel}/10</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Experience Section */}
            {profile.experiences.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <Briefcase className="w-5 h-5 text-primary" />
                      Professional Experience
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {profile.experiences.map((exp, idx) => (
                        <div
                          key={idx}
                          className="relative pl-6 border-l-2 border-border/30 last:border-l-0"
                        >
                          <div className="absolute -left-2 top-0 w-4 h-4 bg-primary rounded-full border-2 border-background"></div>
                          <div className="p-4 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground text-lg">
                                  {exp.title}
                                </h4>
                                <p className="text-primary font-medium">
                                  {exp.company}
                                </p>
                              </div>
                              <Badge
                                variant={
                                  exp.isCurrent ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {exp.isCurrent ? 'Current' : 'Previous'}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span>{exp.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>
                                  {formatDate(exp.startDate)} -{' '}
                                  {exp.endDate
                                    ? formatDate(exp.endDate)
                                    : 'Present'}
                                </span>
                              </div>
                            </div>
                            {exp.responsibilities && (
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {exp.responsibilities}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Education Section */}
            {profile.educations.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <GraduationCap className="w-5 h-5 text-primary" />
                      Education
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {profile.educations.map((edu, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-foreground text-lg">
                                {edu.degree}
                              </h4>
                              <p className="text-primary font-medium">
                                {edu.institution}
                              </p>
                              <p className="text-accent-foreground">
                                {edu.fieldOfStudy}
                              </p>
                            </div>
                            {edu.grade && (
                              <Badge variant="outline" className="text-xs">
                                {edu.grade}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <Clock className="w-3 h-3" />
                            <span>
                              {formatDate(edu.startDate)} -{' '}
                              {formatDate(edu.endDate)}
                            </span>
                          </div>
                          {edu.description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {edu.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Projects Section */}
            {profile.ownedProjects.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-6">
                    <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                      <Code className="w-5 h-5 text-primary" />
                      Featured Projects
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {profile.ownedProjects.map((proj) => (
                        <div
                          key={proj.id}
                          className="p-4 rounded-lg bg-muted/20 border border-border/20 hover:bg-muted/30 transition-colors group"
                        >
                          <div className="flex items-start gap-3 mb-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Code className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">
                                {proj.title}
                              </h4>
                              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                                {proj.shortDesc}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1 mb-3">
                            {Array.isArray(proj.techStack) ? (
                              <>
                                {proj.techStack
                                  .slice(0, 3)
                                  .map((tech: string) => (
                                    <Badge
                                      key={tech}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {tech}
                                    </Badge>
                                  ))}
                                {proj.techStack.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{proj.techStack.length - 3} more
                                  </Badge>
                                )}
                              </>
                            ) : (
                              proj.techStack && (
                                <Badge variant="secondary" className="text-xs">
                                  {proj.techStack}
                                </Badge>
                              )
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {proj.githubUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 text-xs"
                              >
                                <a
                                  href={proj.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Github className="w-3 h-3 mr-1" />
                                  Code
                                </a>
                              </Button>
                            )}
                            {proj.liveUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="h-8 text-xs"
                              >
                                <a
                                  href={proj.liveUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  Live
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Achievements Section */}
            {profile.achievements.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                      <Award className="w-5 h-5 text-primary" />
                      Achievements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.achievements.map((ach, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-primary/20"
                        >
                          <div className="text-2xl">{ach.achievement.icon}</div>
                          <div className="flex-1 min-w-0">
                            <h5 className="font-medium text-foreground text-sm">
                              {ach.achievement.name}
                            </h5>
                            <p className="text-xs text-primary font-medium">
                              {ach.achievement.points} points
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Endorsements Section */}
            {profile.endorsements.length > 0 && (
              <motion.div variants={itemVariants}>
                <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                      <MessageSquare className="w-5 h-5 text-primary" />
                      Endorsements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {profile.endorsements.map((end, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-lg bg-muted/20 border border-border/20"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary" className="text-xs">
                              {end.skill.name}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {end.skill.category
                                .replace(/_/g, ' ')
                                .toLowerCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground italic">
                            "{end.message}"
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Profile Stats */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg font-semibold">
                    <Target className="w-5 h-5 text-primary" />
                    Profile Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Skills
                    </span>
                    <span className="font-semibold text-foreground">
                      {profile.skills.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Experience
                    </span>
                    <span className="font-semibold text-foreground">
                      {profile.experiences.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Education
                    </span>
                    <span className="font-semibold text-foreground">
                      {profile.educations.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Projects
                    </span>
                    <span className="font-semibold text-foreground">
                      {profile.ownedProjects.length}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Member since
                    </span>
                    <span className="font-semibold text-foreground">
                      {formatDate(profile.createdAt)}
                    </span>
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