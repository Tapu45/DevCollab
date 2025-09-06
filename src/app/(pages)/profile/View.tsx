'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
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
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Loader from '@/components/shared/Loader';
import { FullProfile } from '@/types/Profile';
import { useAuth } from '@/context/AuthContext';
import { ProfileExperienceEducation } from './minicomponents/shared/ProfileExperienceEducation';
import { ProfileProjects } from './minicomponents/shared/ProfileProjects';
import { ProfileSkills } from './minicomponents/shared/ProfileSkills';
import { ProfileAchievements } from './minicomponents/shared/ProfileAchievements';
import { ProfileEvents } from './minicomponents/shared/ProfileEvents';
import { ProfileForum } from './minicomponents/shared/ProfileForum';
import { ProfileEndorsements } from './minicomponents/shared/ProfileEndorsements';


async function fetchFullProfile(userId: string): Promise<FullProfile | null> {
  const res = await fetch(`/api/profile?userId=${userId}`);
  if (!res.ok) return null;
  return res.json();
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

function ProfileView() {
  const router = useRouter();
  const { user: authUser } = useAuth(); 
  const userId = authUser?.id;

 const profileQuery = useQuery<FullProfile | null>({
   queryKey: ['profile', userId],
   queryFn: () => (userId ? fetchFullProfile(userId) : Promise.resolve(null)),
   staleTime: 1000 * 60 * 5,
   retry: 1,
   enabled: !!userId,
 });

  const loading = profileQuery.isLoading;
  const error = profileQuery.isError;
  const profile = profileQuery.data;

  // Extract sections
  const user = profile;
  const skills = profile?.skills ?? [];
  const projects = profile?.ownedProjects ?? [];
  const experiences = profile?.experiences ?? [];
  const educations = profile?.educations ?? [];

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

 
 

  function formatDate(d?: string) {
    if (!d) return '';
    try {
      return new Date(d).toLocaleDateString();
    } catch {
      return d.slice(0, 10);
    }
  }

  

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
            {/* Experience & Education Section */}
            <ProfileExperienceEducation
              experiences={sortedExperiences}
              educations={sortedEducations}
              itemVariants={itemVariants}
              cardHoverVariants={cardHoverVariants}
              formatDate={formatDate}
            />

            {/* Projects Section */}
            <ProfileProjects
              projects={projects}
              itemVariants={itemVariants}
              cardHoverVariants={cardHoverVariants}
            />

            <ProfileEvents
              eventParticipations={profile?.eventParticipations ?? []}
              createdEvents={profile?.createdEvents ?? []}
              itemVariants={itemVariants}
            />

            <ProfileForum
              forumPosts={profile?.forumPosts ?? []}
              forumReplies={profile?.forumReplies ?? []}
              itemVariants={itemVariants}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Skills Section */}
            <ProfileSkills skills={skills} itemVariants={itemVariants} />
            <ProfileAchievements
              achievements={profile?.achievements ?? []}
              itemVariants={itemVariants}
            />
            <ProfileEndorsements
              receivedEndorsements={profile?.receivedEndorsements ?? []}
              itemVariants={itemVariants}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default ProfileView;
