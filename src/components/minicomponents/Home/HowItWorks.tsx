'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  User,
  Brain,
  Users,
  Rocket,
  GitBranch,
  MessageSquare,
  Code,
  Network,
  Clock,
  Target,
  Trophy,
  Sparkles,
  CheckCircle,
} from 'lucide-react';

// ------------------- Types -------------------

type Step = {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  color: string;
  accent: string;
};

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

type Stat = {
  value: string;
  label: string;
  icon: React.ReactNode;
};

// ------------------- Data -------------------

const STEPS: Step[] = [
  {
    id: 1,
    icon: <User className="w-5 h-5" />,
    title: 'Build Your Developer Identity',
    subtitle: 'Craft a profile that speaks your skills',
    description:
      'Upload skills, sync GitHub/GitLab, and let AI analyze your patterns to generate a verified, dynamic developer identity.',
    features: ['Skill proficiency tracking', 'GitHub integration'],
    color: 'text-blue-500',
    accent: 'bg-blue-500',
  },
  {
    id: 2,
    icon: <Brain className="w-5 h-5" />,
    title: 'AI-Powered Matching',
    subtitle: 'Algorithms that understand context',
    description:
      'Our engine aligns skills, experience, time zones, and interests to recommend collaborators with the highest chance of success.',
    features: ['Vector similarity', 'Timezone optimization'],
    color: 'text-purple-500',
    accent: 'bg-purple-500',
  },
  {
    id: 3,
    icon: <Users className="w-5 h-5" />,
    title: 'Seamless Collaboration',
    subtitle: 'All tools in one workspace',
    description:
      'Form teams, share files, track tasks, and review code — all in an integrated environment designed for developer workflows.',
    features: ['Real-time chat', 'Project workspaces'],
    color: 'text-green-500',
    accent: 'bg-green-500',
  },
  {
    id: 4,
    icon: <Rocket className="w-5 h-5" />,
    title: 'Ship and Showcase',
    subtitle: 'Celebrate real outcomes',
    description:
      'Track milestones, showcase live demos, and earn achievements while building a strong, verified portfolio.',
    features: ['Progress tracking', 'Public showcases'],
    color: 'text-orange-500',
    accent: 'bg-orange-500',
  },
];

const FEATURES: Feature[] = [
  {
    icon: <GitBranch className="w-5 h-5" />,
    title: 'GitHub Integration',
    description: 'Auto-sync repos and analyze code.',
  },
  {
    icon: <MessageSquare className="w-5 h-5" />,
    title: 'Real-time Chat',
    description: 'Voice, video, and text communication.',
  },
  {
    icon: <Sparkles className="w-5 h-5" />,
    title: 'AI Recommendations',
    description: 'Project and team suggestions.',
  },
  {
    icon: <Trophy className="w-5 h-5" />,
    title: 'Achievements',
    description: 'Gamified progress and recognition.',
  },
];

const STATS: Stat[] = [
  {
    value: '3.2x',
    label: 'Faster Development',
    icon: <Clock className="w-4 h-4" />,
  },
  {
    value: '89%',
    label: 'Match Success Rate',
    icon: <Target className="w-4 h-4" />,
  },
  {
    value: '156+',
    label: 'Skills Tracked',
    icon: <Code className="w-4 h-4" />,
  },
  {
    value: '24/7',
    label: 'Global Collaboration',
    icon: <Network className="w-4 h-4" />,
  },
];

// ------------------- Subcomponents -------------------

const StepCard = ({ step, active }: { step: Step; active: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={active ? { opacity: 1, y: 0 } : { opacity: 0.3, y: 20 }}
    transition={{ duration: 0.5 }}
    className={`relative max-w-md rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm p-5`}
  >
    <div className={`flex items-center gap-3 mb-2 ${step.color}`}>
      <div
        className={`w-8 h-8 ${step.accent} text-white rounded-full flex items-center justify-center`}
      >
        {step.icon}
      </div>
      <h4 className="font-semibold">{step.title}</h4>
    </div>
    <p className="text-sm font-medium mb-2">{step.subtitle}</p>
    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
    <ul className="space-y-1">
      {step.features.map((f, i) => (
        <li
          key={i}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <CheckCircle className="w-3 h-3 text-primary" />
          {f}
        </li>
      ))}
    </ul>
  </motion.div>
);

const FeatureCard = ({ f }: { f: Feature }) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="group rounded-xl border border-border/40 bg-card/40 p-6 text-center backdrop-blur-sm transition-colors hover:border-primary/40"
  >
    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
      {f.icon}
    </div>
    <h4 className="font-semibold mb-2">{f.title}</h4>
    <p className="text-sm text-muted-foreground">{f.description}</p>
  </motion.div>
);

// ------------------- Main Component -------------------

export default function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });
  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % STEPS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity }}
      className="relative bg-background py-24"
    >
      <div className="container mx-auto px-6">
        {/* Header */}
        <div ref={titleRef} className="mb-16 text-center">
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary"
            initial={{ scale: 0.9 }}
            animate={isInView ? { scale: 1 } : {}}
          >
            <Sparkles className="w-4 h-4" /> The Solution
          </motion.div>
          <motion.h2
            className="mt-6 text-4xl font-bold sm:text-5xl md:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
          >
            How DevCollab Works
          </motion.h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            From isolation to collaboration in four deliberate steps. Our
            AI-driven system transforms how developers find, connect, and build
            together.
          </p>
        </div>

        {/* Stats */}
        <div className="mb-20 grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
            >
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                {s.icon}
              </div>
              <div className="text-2xl font-bold text-primary">{s.value}</div>
              <div className="text-sm text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Steps along curved path */}
        <div className="relative mb-20">
          <svg
            className="absolute inset-0 mx-auto h-[500px] w-full max-w-4xl"
            viewBox="0 0 800 500"
          >
            <motion.path
              d="M 100 450 C 250 100, 550 100, 700 450"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-border/60"
              strokeDasharray="2000"
              strokeDashoffset={2000 - activeStep * 500}
              transition={{ duration: 1 }}
            />
          </svg>
          <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-20">
            {STEPS.map((s, i) => (
              <StepCard key={s.id} step={s} active={i === activeStep} />
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="mb-20">
          <h3 className="mb-8 text-center text-2xl font-bold">
            Powerful Features
          </h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <FeatureCard key={i} f={f} />
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
        >
          <div className="inline-flex items-center gap-4 rounded-2xl border border-primary/20 bg-primary/5 px-8 py-6">
            <Sparkles className="h-6 w-6 text-primary animate-spin-slow" />
            <div className="text-left">
              <h3 className="text-xl font-semibold">
                Ready to transform your workflow?
              </h3>
              <p className="text-muted-foreground">
                Join developers already shipping faster with DevCollab.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
