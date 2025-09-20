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
      {/* Main Beautiful Heading */}
      <motion.h2
        variants={itemVariants}
        className="text-3xl md:text-4xl font-extrabold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-[color:var(--primary)] via-[color:var(--accent-foreground)] to-[color:var(--foreground)] drop-shadow-sm"
      >
        Unlock Your Next Big Project & Skill
      </motion.h2>
      <motion.p
        variants={itemVariants}
        className="text-center text-base md:text-lg text-[color:var(--muted-foreground)] mb-6"
      >
        Get inspired by AI-powered project ideas and skill roadmaps tailored for
        your growth.
      </motion.p>
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
            {Array.isArray(suggestions?.skillSuggestions) && (
              <div className="space-y-5">
                {suggestions.skillSuggestions.map(
                  (skill: SkillSuggestion, idx: number) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 8 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        duration: 0.35,
                        ease: easeOut,
                        delay: idx * 0.05,
                      }}
                      className="p-6 rounded-lg ring-1 ring-[color:var(--primary)]/30 bg-[color:var(--primary)]/8
    hover:ring-[color:var(--primary)]/60 hover:shadow-[0_0_16px_var(--primary)] transition-all mb-4"
                    >
                      <h3 className="relative font-extrabold text-2xl md:text-3xl mb-2 text-center">
                        <span
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[color:var(--primary)]/90 to-[color:var(--accent-foreground)]/90
      text-transparent bg-clip-text shadow-[0_2px_24px_0_var(--primary)] drop-shadow-lg tracking-wide"
                          style={{
                            WebkitTextStroke: '1px var(--background)',
                            letterSpacing: '0.04em',
                          }}
                        >
                          <Zap className="h-6 w-6 text-[color:var(--primary)] drop-shadow" />
                          {skill.recommendedSkill}
                        </span>
                        <span className="block mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-[color:var(--primary)] via-[color:var(--accent-foreground)] to-[color:var(--primary)] blur-[2px] opacity-70 animate-pulse" />
                      </h3>
                      <p className="text-sm text-[color:var(--muted-foreground)] mb-5">
                        {skill.valueProposition}
                      </p>

                      {/* Learning Roadmap - Horizontal Timeline with Advanced Styling */}
                      <div className="mb-8">
                        <h4 className="font-medium mb-6 text-[color:var(--foreground)] flex items-center">
                          <span className="bg-gradient-to-r from-[color:var(--primary)] to-[color:var(--accent-foreground)] w-10 h-[3px] rounded-full inline-block mr-3"></span>
                          Learning Roadmap
                          <span className="bg-gradient-to-r from-[color:var(--accent-foreground)] to-[color:var(--primary)] w-10 h-[3px] rounded-full inline-block ml-3"></span>
                        </h4>

                        {/* Horizontal Timeline */}
                        <div className="relative">
                          {/* Main Timeline Line */}
                          <motion.div
                            className="absolute top-[22px] left-0 h-1 bg-gradient-to-r from-[color:var(--primary)] via-[color:var(--accent-foreground)] to-[color:var(--primary)] rounded-full"
                            initial={{ width: '0%' }}
                            whileInView={{ width: '100%' }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                          />

                          {/* Timeline Steps */}
                          <div className="flex justify-between relative z-10 pt-2">
                            {skill.learningRoadmap.map((step, stepIdx) => (
                              <motion.div
                                key={stepIdx}
                                className="flex flex-col items-center px-1"
                                style={{
                                  width: `${100 / skill.learningRoadmap.length}%`,
                                  maxWidth: '180px',
                                }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{
                                  delay: 0.5 + stepIdx * 0.1,
                                  duration: 0.4,
                                }}
                              >
                                {/* Node */}
                                <motion.div
                                  className="w-11 h-11 rounded-full border-4 border-[color:var(--background)] flex items-center justify-center
                  bg-gradient-to-br from-[color:var(--primary)] to-[color:var(--accent-foreground)] shadow-lg shadow-[color:var(--primary)]/20"
                                  initial={{ scale: 0 }}
                                  whileInView={{ scale: 1 }}
                                  viewport={{ once: true }}
                                  transition={{
                                    type: 'spring',
                                    stiffness: 260,
                                    damping: 20,
                                    delay: 0.6 + stepIdx * 0.15,
                                  }}
                                >
                                  <span className="text-[color:var(--background)] font-bold text-sm">
                                    {stepIdx + 1}
                                  </span>
                                </motion.div>

                                {/* Step Text */}
                                <motion.div
                                  className="mt-3 text-center"
                                  initial={{ opacity: 0 }}
                                  whileInView={{ opacity: 1 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: 0.8 + stepIdx * 0.15 }}
                                >
                                  <p className="text-xs text-[color:var(--foreground)]">
                                    {step}
                                  </p>
                                </motion.div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Time and Career Impact - Positioned Below Roadmap */}
                      <div className="grid grid-cols-2 gap-6 mt-8 p-4 rounded-lg bg-[color:var(--background)]/30 backdrop-blur-sm border border-[color:var(--primary)]/20">
                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1, duration: 0.4 }}
                        >
                          <h4 className="font-medium text-sm flex items-center gap-2 text-[color:var(--foreground)]">
                            <Clock className="h-4 w-4 text-[color:var(--primary)]" />
                            Time Investment
                          </h4>
                          <p className="text-sm ml-6 text-[color:var(--muted-foreground)]">
                            {skill.timeInvestment}
                          </p>
                        </motion.div>

                        <motion.div
                          className="space-y-2"
                          initial={{ opacity: 0, x: 20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.1, duration: 0.4 }}
                        >
                          <h4 className="font-medium text-sm flex items-center gap-2 text-[color:var(--foreground)]">
                            <TrendingUp className="h-4 w-4 text-[color:var(--accent-foreground)]" />
                            Career Impact
                          </h4>
                          <p className="text-sm ml-6 text-[color:var(--muted-foreground)]">
                            {skill.careerImpact}
                          </p>
                        </motion.div>
                      </div>
                    </motion.div>
                  ),
                )}
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
