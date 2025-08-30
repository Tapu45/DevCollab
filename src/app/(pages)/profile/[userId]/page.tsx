'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Skill,
  Education,
  Experience,
  Project,
  Achievement,
  Endorsement,
  ForumPost,
  EventParticipation,
  ProfileProgress,
  UserProfile,
} from '@/types/Details';
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
  ExternalLink,
  Building2,
  BookOpen,
  Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSession } from 'next-auth/react';
import ConnectionButton from '../lazy/ConnectionButton';

const fetchProfile = async (userId: string): Promise<UserProfile> => {
  const res = await fetch(`/api/profile?userId=${userId}`);
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

export default function ViewUserProfile() {
  const { userId } = useParams();
  const { data: session } = useSession();

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

  if (isLoading) {
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
            <CardTitle className="text-destructive">
              Profile Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              {error instanceof Error
                ? error.message
                : 'Could not load profile'}
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/50 mb-8"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>

          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Avatar */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Avatar className="h-24 w-24 md:h-32 md:w-32 ring-4 ring-background shadow-2xl">
                  <AvatarImage
                    src={profile.profilePictureUrl || ''}
                    alt={profile.displayName || ''}
                  />
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-2xl md:text-3xl">
                    {getInitials(
                      profile.displayName ||
                        `${profile.firstName} ${profile.lastName}`,
                    )}
                  </AvatarFallback>
                </Avatar>

                {/* Reputation Badge */}
                <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-2 shadow-lg">
                  <Star className="w-4 h-4" />
                </div>
              </motion.div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                  {profile.displayName ||
                    `${profile.firstName} ${profile.lastName}`}
                </h1>

                {profile.bio && (
                  <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{profile.location}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <Trophy className="w-4 h-4 text-primary" />
                    <span className="font-medium text-foreground">
                      {profile.reputationScore}
                    </span>
                    <span>reputation</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Zap className="w-4 h-4 text-accent-foreground" />
                    <span className="font-medium text-foreground">
                      {profile.totalContributions}
                    </span>
                    <span>contributions</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex items-center gap-3 mt-4">
                  {profile.website && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-border/50 hover:bg-accent/10"
                    >
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                      </a>
                    </Button>
                  )}

                  {profile.githubUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-border/50 hover:bg-accent/10"
                    >
                      <a
                        href={profile.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </a>
                    </Button>
                  )}

                  {profile.linkedinUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="border-border/50 hover:bg-accent/10"
                    >
                      <a
                        href={profile.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                      </a>
                    </Button>
                  )}
                </div>
                {session?.user?.id && session.user.id !== userId && (
                  <div className="mt-4">
                    <ConnectionButton
                      userId={userId as string}
                      className="shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column - Skills & Experience */}
          <div className="lg:col-span-2 space-y-6">
            {/* Skills Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Code className="w-5 h-5 text-primary" />
                    Skills & Expertise
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.skills.map((skill) => (
                      <div
                        key={skill.name}
                        className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <h4 className="font-medium text-foreground">
                            {skill.name}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {skill.category}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < skill.proficiencyLevel
                                    ? 'bg-primary'
                                    : 'bg-muted-foreground/20'
                                }`}
                              />
                            ))}
                          </div>
                          {skill.isVerified && (
                            <Badge variant="secondary" className="text-xs">
                              Verified ✅
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Experience Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Briefcase className="w-5 h-5 text-primary" />
                    Professional Experience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.experiences.map((exp, idx) => (
                      <motion.div
                        key={idx}
                        variants={cardHoverVariants}
                        whileHover="hover"
                        className="p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground">
                              {exp.title}
                            </h4>
                            <p className="text-primary font-medium">
                              {exp.company}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                              <MapPin className="w-3 h-3" />
                              <span>{exp.location}</span>
                              <span>•</span>
                              <span>
                                {exp.startDate} - {exp.endDate || 'Present'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Education Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.educations.map((edu, idx) => (
                      <motion.div
                        key={idx}
                        variants={cardHoverVariants}
                        whileHover="hover"
                        className="p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <BookOpen className="w-5 h-5 text-accent-foreground" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground">
                              {edu.degree}
                            </h4>
                            <p className="text-accent-foreground font-medium">
                              {edu.fieldOfStudy}
                            </p>
                            <p className="text-foreground">{edu.institution}</p>
                            <p className="text-sm text-muted-foreground mt-1">
                              {edu.startDate} - {edu.endDate}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Projects Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Code className="w-5 h-5 text-primary" />
                    Featured Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.ownedProjects.map((proj) => (
                      <motion.div
                        key={proj.id}
                        variants={cardHoverVariants}
                        whileHover="hover"
                        className="p-4 rounded-xl bg-muted/20 border border-border/20 hover:border-primary/30 transition-all duration-200"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Code className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground mb-1">
                              {proj.title}
                            </h4>
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                              {proj.shortDesc}
                            </p>
                            {proj.githubUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                asChild
                                className="text-xs"
                              >
                                <a
                                  href={proj.githubUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Github className="w-3 h-3 mr-1" />
                                  View Code
                                </a>
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Column - Achievements & Activity */}
          <div className="space-y-6">
            {/* Achievements Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
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
                        {ach.achievement.icon && (
                          <img
                            src={ach.achievement.icon}
                            alt="achievement"
                            className="w-8 h-8 rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h5 className="font-medium text-foreground">
                            {ach.achievement.name}
                          </h5>
                          <p className="text-sm text-primary font-medium">
                            {ach.achievement.points} pts
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Endorsements Section */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
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
                            {end.skill.category}
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

            {/* Recent Activity */}
            <motion.div variants={itemVariants}>
              <Card className="border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Calendar className="w-5 h-5 text-primary" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {profile.forumPosts.slice(0, 3).map((post) => (
                      <div
                        key={post.id}
                        className="p-3 rounded-lg bg-muted/20 border border-border/20"
                      >
                        <h5 className="font-medium text-foreground text-sm mb-1">
                          {post.title}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}

                    {profile.eventParticipations.slice(0, 2).map((ev, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-muted/20 border border-border/20"
                      >
                        <h5 className="font-medium text-foreground text-sm mb-1">
                          {ev.event.title}
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {ev.event.startDate} - {ev.event.endDate}
                        </p>
                      </div>
                    ))}
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
