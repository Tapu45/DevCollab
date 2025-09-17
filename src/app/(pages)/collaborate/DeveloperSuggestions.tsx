import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  RefreshCw,
  Lightbulb,
  TrendingUp,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import { useSuggestions } from '@/hooks/useSuggestions';
import { motion, easeOut } from 'framer-motion';

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

const containerVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: easeOut,
      when: 'beforeChildren',
      staggerChildren: 0.08,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: easeOut },
  },
};

export function ProjectSkillSuggestions() {
  const { suggestions, loading, error, refreshSuggestions } = useSuggestions();

  if (loading) {
    return <SuggestionsSkeleton />;
  }

  if (error) {
    return (
      <Card className="p-6 border-[1px] border-[color:var(--sidebar-border)] bg-[color:var(--card)]/60 backdrop-blur">
        <div className="text-center">
          <p className="text-[color:var(--destructive)] mb-4">
            Failed to load suggestions
          </p>
          <Button
            onClick={() => refreshSuggestions()}
            variant="outline"
            className="border-[color:var(--sidebar-border)] hover:bg-[color:var(--primary)]/10"
          >
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Project Ideas Section */}
      <motion.div variants={itemVariants}>
        <Card
          className="relative overflow-hidden border border-[color:var(--sidebar-border)] bg-[color:var(--card)]/40 backdrop-blur-sm transition-all duration-300
          hover:border-[color:var(--primary)]/40 hover:shadow-[0_0_24px_0_var(--primary)]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500
            before:content-[''] before:absolute before:-top-24 before:-left-24 before:h-64 before:w-64
            before:rounded-full before:bg-[radial-gradient(closest-side,rgba(0,0,0,0)_0%,var(--primary)_15%,rgba(0,0,0,0)_60%)] before:opacity-[.12]
            after:content-[''] after:absolute after:-bottom-24 after:-right-24 after:h-64 after:w-64
            after:rounded-full after:bg-[radial-gradient(closest-side,rgba(0,0,0,0)_0%,var(--accent)_20%,rgba(0,0,0,0)_60%)] after:opacity-[.12]"
          />
          <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-primary/10 via-accent/10 to-background/0">
            <CardTitle className="flex items-center gap-2 text-[color:var(--primary)]">
              <Lightbulb className="h-5 w-5" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent-foreground)]">
                AI-Suggested Project Ideas
              </span>
            </CardTitle>
            <Button
              onClick={refreshSuggestions}
              variant="outline"
              size="sm"
              className="gap-2 border-[color:var(--sidebar-border)]/70 hover:border-[color:var(--primary)]/60 hover:bg-[color:var(--primary)]/10 hover:shadow-[0_0_16px_var(--primary)]"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {suggestions?.projectIdeas?.map(
                (idea: ProjectIdea, index: number) => (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.01 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="relative p-5 rounded-xl border border-[color:var(--sidebar-border)] bg-[color:var(--card)]/40
                      hover:border-[color:var(--primary)]/50 hover:shadow-[0_0_18px_var(--primary)] transition-all duration-300"
                  >
                    <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-[color:var(--primary)]/50 to-transparent" />
                    <h3 className="font-semibold text-lg mb-2 text-[color:var(--foreground)]">
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--foreground)] to-[color:var(--muted-foreground)]">
                        {idea.title}
                      </span>
                    </h3>
                    <p className="text-sm text-[color:var(--muted-foreground)] mb-4">
                      {idea.description}
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-[color:var(--primary)]" />
                        <span className="text-sm font-medium text-[color:var(--foreground)]">
                          Key Features
                        </span>
                      </div>
                      <ul className="list-disc list-inside text-sm space-y-1 ml-6 text-[color:var(--foreground)]/90">
                        {idea.keyFeatures.map((feature, idx) => (
                          <li key={idx}>{feature}</li>
                        ))}
                      </ul>

                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-[color:var(--accent-foreground)]" />
                        <span className="text-sm font-medium text-[color:var(--foreground)]">
                          Tech Stack
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 ml-6">
                        {idea.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 rounded-md text-xs
                              bg-[color:var(--primary)]/10 text-[color:var(--primary)]
                              ring-1 ring-[color:var(--primary)]/30 hover:ring-[color:var(--primary)]/60
                              hover:shadow-[0_0_12px_var(--primary)] transition-shadow"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-[color:var(--accent-foreground)]" />
                        <span className="text-sm font-medium text-[color:var(--foreground)]">
                          Difficulty
                        </span>
                        <span
                          className={`px-2 py-1 text-xs rounded
                            ${
                              idea.difficulty === 'beginner'
                                ? 'bg-[color:var(--primary)]/10 text-[color:var(--primary)] ring-1 ring-[color:var(--primary)]/40'
                                : idea.difficulty === 'intermediate'
                                  ? 'bg-[color:var(--accent)]/10 text-[color:var(--accent-foreground)] ring-1 ring-[color:var(--accent-foreground)]/30'
                                  : 'bg-[color:var(--destructive)]/10 text-[color:var(--destructive)] ring-1 ring-[color:var(--destructive)]/30'
                            }`}
                        >
                          {idea.difficulty}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ),
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Skill Suggestions Section */}
      <motion.div variants={itemVariants}>
        <Card
          className="relative overflow-hidden border border-[color:var(--sidebar-border)] bg-[color:var(--card)]/40 backdrop-blur-sm transition-all duration-300
          hover:border-[color:var(--primary)]/40 hover:shadow-[0_0_24px_0_var(--accent-foreground)]"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500
            before:content-[''] before:absolute before:-top-24 before:right-12 before:h-48 before:w-48
            before:rounded-full before:bg-[radial-gradient(closest-side,rgba(0,0,0,0)_0%,var(--accent-foreground)_18%,rgba(0,0,0,0)_60%)] before:opacity-[.10]"
          />
          <CardHeader className="bg-gradient-to-r from-accent/10 to-background/0">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[color:var(--accent-foreground)]" />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--accent-foreground)] to-[color:var(--primary)]">
                Skill Development Roadmap
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {suggestions?.skillSuggestions && (
              <div className="space-y-5">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, ease: easeOut }}
                  className="p-4 rounded-lg ring-1 ring-[color:var(--primary)]/30 bg-[color:var(--primary)]/8
                    hover:ring-[color:var(--primary)]/60 hover:shadow-[0_0_16px_var(--primary)] transition-all"
                >
                  <h3 className="font-semibold text-lg mb-2 text-[color:var(--foreground)]">
                    {suggestions.skillSuggestions.recommendedSkill}
                  </h3>
                  <p className="text-sm text-[color:var(--muted-foreground)]">
                    {suggestions.skillSuggestions.valueProposition}
                  </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-5">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: easeOut, delay: 0.05 }}
                  >
                    <h4 className="font-medium mb-2 text-[color:var(--foreground)]">
                      Learning Roadmap
                    </h4>
                    <ul className="list-disc list-inside text-sm space-y-1 text-[color:var(--foreground)]/90">
                      {suggestions.skillSuggestions.learningRoadmap.map(
                        (step, idx) => (
                          <li key={idx}>{step}</li>
                        ),
                      )}
                    </ul>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.35, ease: easeOut, delay: 0.08 }}
                    className="space-y-3"
                  >
                    <div>
                      <h4 className="font-medium mb-1 text-[color:var(--foreground)]">
                        Time Investment
                      </h4>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {suggestions.skillSuggestions.timeInvestment}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-1 text-[color:var(--foreground)]">
                        Career Impact
                      </h4>
                      <p className="text-sm text-[color:var(--muted-foreground)]">
                        {suggestions.skillSuggestions.careerImpact}
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {suggestions?.fromCache && (
        <motion.p
          variants={itemVariants}
          className="text-xs text-[color:var(--muted-foreground)] text-center"
        >
          Suggestions cached • Updated within 24 hours
        </motion.p>
      )}
    </motion.div>
  );
}

function SuggestionsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="border border-[color:var(--sidebar-border)] bg-[color:var(--card)]/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full animate-pulse" />
          ))}
        </CardContent>
      </Card>
      <Card className="border border-[color:var(--sidebar-border)] bg-[color:var(--card)]/40">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-32 w-full animate-pulse" />
        </CardContent>
      </Card>
    </div>
  );
}
