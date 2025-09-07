'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  useMotionValue,
  useSpring,
  Variants,
} from 'framer-motion';
import {
  User,
  Brain,
  Users,
  Rocket,
  Sparkles,
  ArrowRight,
  Code,
  GitBranch,
  MessageSquare,
  Trophy,
  Zap,
  Play,
  Pause,
} from 'lucide-react';

// ------------------- Types -------------------

type JourneyStep = {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  scene: string;
  metrics: {
    label: string;
    value: string;
    change: string;
  }[];
  visual: {
    type: 'code' | 'network' | 'collaboration' | 'launch';
    elements: string[];
  };
};

// ------------------- Data -------------------

const JOURNEY_STEPS: JourneyStep[] = [
  {
    id: 1,
    title: 'Identity Formation',
    subtitle: 'Your Digital DNA',
    description:
      'AI analyzes your coding patterns, GitHub activity, and skill progression to create a comprehensive developer profile that goes beyond traditional resumes.',
    icon: <User className="w-8 h-8" />,
    color: 'text-blue-500',
    gradient: 'from-blue-500 to-cyan-500',
    scene: 'profile-building',
    metrics: [
      { label: 'Skills Analyzed', value: '47', change: '+12%' },
      { label: 'Projects Synced', value: '23', change: '+5' },
      { label: 'Code Quality', value: '94%', change: '+8%' },
    ],
    visual: {
      type: 'code',
      elements: ['React', 'TypeScript', 'Node.js', 'Python', 'Docker'],
    },
  },
  {
    id: 2,
    title: 'Intelligent Matching',
    subtitle: 'AI-Powered Discovery',
    description:
      'Advanced algorithms consider technical compatibility, working styles, timezone alignment, and project goals to find your perfect collaboration partners.',
    icon: <Brain className="w-8 h-8" />,
    color: 'text-purple-500',
    gradient: 'from-purple-500 to-pink-500',
    scene: 'matching',
    metrics: [
      { label: 'Compatibility', value: '96%', change: '+15%' },
      { label: 'Matches Found', value: '12', change: '+3' },
      { label: 'Success Rate', value: '89%', change: '+12%' },
    ],
    visual: {
      type: 'network',
      elements: ['Node A', 'Node B', 'Node C', 'Node D', 'Node E'],
    },
  },
  {
    id: 3,
    title: 'Collaborative Workspace',
    subtitle: 'Seamless Integration',
    description:
      'Real-time collaboration tools, shared code repositories, and integrated project management create a frictionless development environment.',
    icon: <Users className="w-8 h-8" />,
    color: 'text-green-500',
    gradient: 'from-green-500 to-emerald-500',
    scene: 'collaboration',
    metrics: [
      { label: 'Active Projects', value: '8', change: '+2' },
      { label: 'Team Members', value: '24', change: '+6' },
      { label: 'Code Reviews', value: '156', change: '+23' },
    ],
    visual: {
      type: 'collaboration',
      elements: [
        'Chat',
        'Code Review',
        'File Share',
        'Video Call',
        'Task Board',
      ],
    },
  },
  {
    id: 4,
    title: 'Launch & Scale',
    subtitle: 'From Idea to Impact',
    description:
      'Deploy your collaborative projects, track performance metrics, and build a portfolio that showcases real-world impact and team achievements.',
    icon: <Rocket className="w-8 h-8" />,
    color: 'text-orange-500',
    gradient: 'from-orange-500 to-red-500',
    scene: 'launch',
    metrics: [
      { label: 'Projects Launched', value: '5', change: '+2' },
      { label: 'Users Impacted', value: '2.3K', change: '+800' },
      { label: 'Portfolio Score', value: 'A+', change: '+2 grades' },
    ],
    visual: {
      type: 'launch',
      elements: ['Deploy', 'Monitor', 'Scale', 'Celebrate', 'Repeat'],
    },
  },
];

// ------------------- Animation Variants -------------------

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      when: 'beforeChildren',
      staggerChildren: 0.1,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

// ------------------- Subcomponents -------------------

const JourneyScene = ({
  step,
  isActive,
  progress,
}: {
  step: JourneyStep;
  isActive: boolean;
  progress: number;
}) => {
  const renderVisual = () => {
    switch (step.visual.type) {
      case 'code':
        return (
          <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20" />
            <div className="p-4 space-y-2">
              {step.visual.elements.map((tech, i) => (
                <motion.div
                  key={tech}
                  initial={{ opacity: 0, x: -20 }}
                  animate={
                    isActive ? { opacity: 1, x: 0 } : { opacity: 0.3, x: -10 }
                  }
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 text-xs text-green-400"
                >
                  <Code className="w-3 h-3" />
                  <span>{tech}</span>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'network':
        return (
          <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20" />
            <svg className="w-full h-full" viewBox="0 0 200 120">
              {step.visual.elements.map((node, i) => {
                const x = 50 + (i % 3) * 50;
                const y = 30 + Math.floor(i / 3) * 40;
                return (
                  <motion.g key={node}>
                    <motion.circle
                      cx={x}
                      cy={y}
                      r="8"
                      fill="currentColor"
                      className="text-purple-400"
                      initial={{ scale: 0 }}
                      animate={isActive ? { scale: 1 } : { scale: 0.5 }}
                      transition={{ delay: i * 0.1 }}
                    />
                    <motion.text
                      x={x}
                      y={y + 25}
                      textAnchor="middle"
                      className="text-xs fill-white"
                      initial={{ opacity: 0 }}
                      animate={isActive ? { opacity: 1 } : { opacity: 0.3 }}
                      transition={{ delay: i * 0.1 + 0.2 }}
                    >
                      {node}
                    </motion.text>
                  </motion.g>
                );
              })}
            </svg>
          </div>
        );

      case 'collaboration':
        return (
          <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20" />
            <div className="p-4 grid grid-cols-3 gap-2">
              {step.visual.elements.map((tool, i) => (
                <motion.div
                  key={tool}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={
                    isActive
                      ? { opacity: 1, scale: 1 }
                      : { opacity: 0.3, scale: 0.8 }
                  }
                  transition={{ delay: i * 0.1 }}
                  className="bg-green-500/20 rounded p-2 text-center"
                >
                  <MessageSquare className="w-4 h-4 mx-auto text-green-400 mb-1" />
                  <span className="text-xs text-white">{tool}</span>
                </motion.div>
              ))}
            </div>
          </div>
        );

      case 'launch':
        return (
          <div className="relative w-full h-32 bg-gray-900 rounded-lg overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20" />
            <div className="p-4 flex items-center justify-center h-full">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={
                  isActive
                    ? { scale: 1, rotate: 0 }
                    : { scale: 0.5, rotate: -90 }
                }
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="text-orange-400"
              >
                <Rocket className="w-12 h-12" />
              </motion.div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        isActive ? { opacity: 1, scale: 1 } : { opacity: 0.4, scale: 0.9 }
      }
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {renderVisual()}
    </motion.div>
  );
};

const MetricsDisplay = ({
  metrics,
  isActive,
}: {
  metrics: JourneyStep['metrics'];
  isActive: boolean;
}) => (
  <div className="grid grid-cols-3 gap-4 mt-4">
    {metrics.map((metric, i) => (
      <motion.div
        key={metric.label}
        initial={{ opacity: 0, y: 20 }}
        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.5, y: 10 }}
        transition={{ delay: i * 0.1 }}
        className="text-center"
      >
        <div className="text-2xl font-bold text-primary">{metric.value}</div>
        <div className="text-xs text-muted-foreground">{metric.label}</div>
        <div className="text-xs text-green-500">{metric.change}</div>
      </motion.div>
    ))}
  </div>
);

// ------------------- New JourneyFlow Component (Adapted from DataFlowDemo) -------------------

const JourneyFlow = ({ activeStep }: { activeStep: number }) => {
  const journeyFlows = [
    {
      title: 'Identity Formation',
      subtitle: 'Digital DNA',
      icon: User,
      color: 'text-blue-500',
    },
    {
      title: 'Intelligent Matching',
      subtitle: 'AI Discovery',
      icon: Brain,
      color: 'text-purple-500',
    },
    {
      title: 'Collaborative Workspace',
      subtitle: 'Seamless Integration',
      icon: Users,
      color: 'text-green-500',
    },
    {
      title: 'Launch & Scale',
      subtitle: 'Impact & Growth',
      icon: Rocket,
      color: 'text-orange-500',
    },
  ];

  return (
    <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
        Your Developer Journey Flow
      </h3>
      
      <div className="relative">
        <svg className="w-full h-32" viewBox="0 0 400 120">
          {journeyFlows.map((flow, index) => {
            const isActive = activeStep === index;
            const x1 = 50 + (index * 80);
            const x2 = x1 + 60;
            
            return (
              <g key={index}>
                {/* Connection line */}
                <motion.line
                  x1={x1}
                  y1="60"
                  x2={x2}
                  y2="60"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={isActive ? "text-primary" : "text-muted-foreground/30"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isActive ? 1 : 0.3 }}
                  transition={{ duration: 1 }}
                />
                
                {/* Animated data packet (journey progression) */}
                {isActive && (
                  <motion.circle
                    cx={x1}
                    cy="60"
                    r="3"
                    fill="currentColor"
                    className="text-primary"
                    animate={{ cx: [x1, x2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                
                {/* Arrow */}
                <polygon
                  points={`${x2-5},55 ${x2},60 ${x2-5},65`}
                  fill="currentColor"
                  className={isActive ? "text-primary" : "text-muted-foreground/30"}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Flow labels */}
        <div className="flex justify-between mt-4">
          {journeyFlows.map((flow, index) => (
            <motion.div
              key={index}
              className={`text-center ${
                activeStep === index ? "scale-110" : "scale-100"
              } transition-transform`}
            >
              <flow.icon className={`w-6 h-6 mx-auto mb-1 ${
                activeStep === index ? flow.color : "text-muted-foreground"
              }`} />
              <div className="text-xs font-medium text-foreground">{flow.title}</div>
              <div className="text-xs text-muted-foreground">{flow.subtitle}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ------------------- Main Component -------------------

export default function EnhancedHowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const isInView = useInView(titleRef, { once: true, amount: 0.3 });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);
  const y = useTransform(scrollYProgress, [0, 1], [0, -100]);

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % JOURNEY_STEPS.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isPlaying]);

  // Mouse tracking for interactive effects
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    });
  }, []);

  const mouseX = useSpring(useMotionValue(mousePosition.x), {
    stiffness: 100,
    damping: 30,
  });
  const mouseY = useSpring(useMotionValue(mousePosition.y), {
    stiffness: 100,
    damping: 30,
  });

  return (
    <motion.section
      ref={containerRef}
      style={{ opacity }}
      className="relative bg-background py-20 overflow-hidden"
      onMouseMove={handleMouseMove}
      aria-labelledby="how-it-works-title"
    >
      {/* Dynamic Background */}
      <motion.div
        style={{
          y,
          background: `radial-gradient(circle at ${mouseX.get() * 100}% ${mouseY.get() * 100}%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)`,
        }}
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 container mx-auto px-6">
        {/* Enhanced Header */}
        <motion.div
          ref={titleRef}
          className="mb-16 text-center"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'show' : 'hidden'}
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-medium text-primary mb-6"
          >
            <Sparkles className="w-4 h-4" />
            The Journey
          </motion.div>

          <motion.h2
            id="how-it-works-title"
            variants={itemVariants}
            className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl mb-6"
          >
            Your Developer{' '}
            <span className="relative">
              <span className="relative z-10">Transformation</span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-lg"
                initial={{ scaleX: 0 }}
                animate={isInView ? { scaleX: 1 } : { scaleX: 0 }}
                transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                style={{ originX: 0 }}
              />
            </span>
          </motion.h2>

          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-3xl text-lg text-muted-foreground leading-relaxed mb-8"
          >
            Experience the complete developer journey from individual
            contributor to collaborative innovator. Watch your skills, network,
            and impact grow in real-time.
          </motion.p>

          {/* Interactive Controls */}
        </motion.div>

        {/* Interactive Journey Display */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: New Journey Flow (Replaces JourneyScene for flow visualization) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
            >
              <JourneyFlow activeStep={activeStep} />
            </motion.div>

            {/* Right: Content */}
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${JOURNEY_STEPS[activeStep].gradient} rounded-2xl flex items-center justify-center text-white shadow-lg`}
                >
                  {JOURNEY_STEPS[activeStep].icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">
                    {JOURNEY_STEPS[activeStep].title}
                  </h3>
                  <p className="text-muted-foreground">
                    {JOURNEY_STEPS[activeStep].subtitle}
                  </p>
                </div>
              </div>

              <p className="text-lg leading-relaxed text-muted-foreground">
                {JOURNEY_STEPS[activeStep].description}
              </p>
            </motion.div>
          </div>

          {/* Progress Indicator */}
          <motion.div
            className="mt-16 flex items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex-1 max-w-md h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                initial={{ width: 0 }}
                animate={{
                  width: `${((activeStep + 1) / JOURNEY_STEPS.length) * 100}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              Step {activeStep + 1} of {JOURNEY_STEPS.length}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}