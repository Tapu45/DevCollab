'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Loader from '@/components/shared/Loader';
import { useRouter } from 'next/navigation';
import { motion, easeOut } from 'framer-motion';
import {
  MapPin,
  User,
  Sparkles,
  ArrowRight,
  Users,
  TrendingUp,
  Star,
  Briefcase,
} from 'lucide-react';

interface SuggestedUser {
  userId: string;
  displayName: string;
  score: number;
  profile: {
    id: string;
    displayName: string;
    firstName: string;
    lastName: string;
    profilePictureUrl?: string | null;
    location: string | null;
    bio: string | null;
    skills: Array<{
      name: string;
      category: string;
      proficiencyLevel: number;
    }>;
  };
}

const fetchSuggestions = async (): Promise<{ users: SuggestedUser[] }> => {
  const response = await fetch('/api/suggestions/similar');
  if (!response.ok) throw new Error('Failed to fetch suggestions');
  return response.json();
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
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
};

const cardHoverVariants = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
};

export default function DeveloperSuggestions() {
  const router = useRouter();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['suggested-users'],
    queryFn: fetchSuggestions,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <Loader />;

  if (isError)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[60vh] flex items-center justify-center"
      >
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-4">
              <TrendingUp className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-destructive">Connection Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Could not load suggestions at this time. Please try again later.
            </p>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="border-destructive/20 text-destructive hover:bg-destructive/10"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );

  const users = data?.users ?? [];

  if (users.length === 0)
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="min-h-[60vh] flex items-center justify-center"
      >
        <Card className="w-full max-w-md border-muted bg-muted/5">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Users className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>No Suggestions Yet</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-2">
              No developer suggestions available yet.
            </p>
            <p className="text-muted-foreground text-sm mb-4">
              Complete your profile to get matched with similar developers.
            </p>
            <Button
              onClick={() => router.push('/profile')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Complete Profile
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4"
          >
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Matching</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent mb-4"
          >
            Discover Your Perfect
            <span className="block text-primary">Developer Match</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Connect with developers who share your skills, interests, and career
            goals. Our AI algorithm finds the best matches for collaboration and
            growth.
          </motion.p>
        </div>

        {/* Users Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {users.map((user, index) => (
            <motion.div
              key={user.userId}
              variants={itemVariants}
              whileHover="hover"
              className="group"
            >
              <Card className="h-full border border-border/50 bg-card/50 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden group-hover:border-primary/30">
                <CardContent className="p-0">
                  {/* Header with gradient */}
                  <div className="bg-gradient-to-r from-primary/5 to-accent/5 p-6 border-b border-border/20">
                    <div className="flex items-start gap-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Avatar className="h-16 w-16 ring-4 ring-background shadow-lg">
                          <AvatarImage
                            src={
                              user.profile?.profilePictureUrl ||               
                              ''
                            }
                            alt={user.profile?.displayName || ''}
                          />
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                            {getInitials(
                              user.profile?.displayName ||
                                user.profile?.firstName ||
                                '',
                            )}
                          </AvatarFallback>
                        </Avatar>
                      </motion.div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-foreground truncate mb-1">
                          {user.profile?.displayName ||
                            `${user.profile?.firstName} ${user.profile?.lastName}`}
                        </h3>

                        {user.profile?.location && (
                          <div className="flex items-center gap-1 text-muted-foreground text-sm mb-2">
                            <MapPin className="w-3 h-3" />
                            <span>{user.profile.location}</span>
                          </div>
                        )}

                        {/* Match Score */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.min(user.score * 100, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-medium text-primary">
                            {Math.round(user.score * 100)}% match
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {user.profile?.bio && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 leading-relaxed">
                        {user.profile.bio}
                      </p>
                    )}

                    {user.profile?.skills && user.profile.skills.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-foreground mb-3">
                          Top Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {user.profile.skills.slice(0, 4).map((skill) => (
                            <Badge
                              key={skill.name}
                              variant="secondary"
                              className="text-xs px-2 py-1 bg-secondary/20 text-secondary-foreground border-secondary/30 hover:bg-secondary/30 transition-colors"
                            >
                              {skill.name}
                            </Badge>
                          ))}
                          {user.profile.skills.length > 4 && (
                            <Badge
                              variant="outline"
                              className="text-xs px-2 py-1 border-border/50 text-muted-foreground"
                            >
                              +{user.profile.skills.length - 4}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Button */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        onClick={() => router.push(`/profile/${user.userId}`)}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2.5 rounded-xl transition-all duration-200 group-hover:shadow-lg group-hover:shadow-primary/25"
                      >
                        <span>View Profile</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
