'use client';

import type React from 'react';
import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Users,
  Clock,
  AlertTriangle,
  GitBranch,
  MessageSquare,
  Brain,
  ArrowRight,
  Zap,
  Sparkles,
} from 'lucide-react';

type PainPoint = {
  icon: React.ReactNode;
  description: string;
  impact: string;
  metric: string;
  severity: 'high' | 'medium' | 'critical';
  image: string;
  color: string;
  glowColor: string;
};

type Stat = {
  value: string;
  label: string;
  sublabel: string;
  trend?: 'up' | 'down' | 'stable';
};

const PAIN_POINTS: PainPoint[] = [
  {
    icon: <Users className="w-6 h-6" aria-hidden="true" />,
    description:
      'Finding developers with complementary skills, compatible work styles, and aligned availability takes weeks, not hours.',
    impact: '78%',
    metric: 'of projects lack proper team composition',
    severity: 'critical',
    image: '/placeholder.svg?height=200&width=400',
    color: 'from-red-500/30 via-pink-500/30 to-rose-500/30',
    glowColor: 'rgba(239, 68, 68, 0.4)',
  },
  {
    icon: <Clock className="w-6 h-6" aria-hidden="true" />,
    description:
      'Solo builders waste 40% of their time context-switching into unfamiliar domains instead of building.',
    impact: '3.2x',
    metric: 'longer development cycles',
    severity: 'high',
    image: '/placeholder.svg?height=200&width=400',
    color: 'from-orange-500/30 via-amber-500/30 to-yellow-500/30',
    glowColor: 'rgba(249, 115, 22, 0.4)',
  },
  {
    icon: <GitBranch className="w-6 h-6" aria-hidden="true" />,
    description:
      'Projects stall when specific expertise is needed—frontend, backend, DevOps, or domain knowledge.',
    impact: '65%',
    metric: 'of ambitious projects remain incomplete',
    severity: 'critical',
    image: '/placeholder.svg?height=200&width=400',
    color: 'from-purple-500/30 via-violet-500/30 to-indigo-500/30',
    glowColor: 'rgba(147, 51, 234, 0.4)',
  },
  {
    icon: <MessageSquare className="w-6 h-6" aria-hidden="true" />,
    description:
      'Limited exposure to peer patterns and best practices slows compound learning and innovation.',
    impact: '43%',
    metric: 'slower skill development in isolation',
    severity: 'medium',
    image: '/placeholder.svg?height=200&width=400',
    color: 'from-cyan-500/30 via-blue-500/30 to-indigo-500/30',
    glowColor: 'rgba(59, 130, 246, 0.4)',
  },
];

const STATS: Stat[] = [
  {
    value: '2.1M+',
    label: 'Solo Developers',
    sublabel: 'Working in isolation globally',
    trend: 'up',
  },
  {
    value: '89%',
    label: 'Abandoned Ideas',
    sublabel: 'Due to resource constraints',
    trend: 'up',
  },
  {
    value: '156hrs',
    label: 'Monthly Waste',
    sublabel: 'On mismatched collaborations',
    trend: 'stable',
  },
];

const severityColors = {
  critical: 'text-red-400',
  high: 'text-orange-400',
  medium: 'text-yellow-400',
};

// Floating particles component
const FloatingParticles = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + i * 0.5,
            repeat: Infinity,
            delay: i * 0.4,
            ease: 'easeInOut',
          }}
          initial={{
            left: `${20 + i * 15}%`,
            top: `${30 + i * 10}%`,
          }}
        />
      ))}
    </div>
  );
};

// Energy pulse effect
const EnergyPulse = ({ color }: { color: string }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${color} 0%, transparent 70%)`,
        }}
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
    </div>
  );
};

// Lightning effect component
const LightningEffect = ({ isActive }: { isActive: boolean }) => {
  if (!isActive) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 2 }}
      >
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <motion.path
            d="M20,10 L30,30 L25,35 L40,60 L35,65 L50,90"
            stroke="rgba(255, 255, 255, 0.8)"
            strokeWidth="0.5"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: [0, 1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 3 }}
            style={{
              filter: 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.8))',
            }}
          />
        </svg>
      </motion.div>
    </div>
  );
};

export default function EnhancedProblemStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [activeCard, setActiveCard] = useState(0);

  const leadInView = useInView(leadRef, { once: true, amount: 0.3 });
  const listInView = useInView(listRef, { once: true, amount: 0.2 });

  // Cycle active card for different effects
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCard((prev) => (prev + 1) % PAIN_POINTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <motion.section
      ref={sectionRef}
      aria-labelledby="problem-statement-title"
      className="relative  text-white overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        {/* <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-blue-900/20"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        /> */}
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-56 items-start">
          {/* Left column - Fixed content */}
          <div className="flex-1 lg:max-w-lg">
            <motion.div
              ref={leadRef}
              initial="hidden"
              animate={leadInView ? 'show' : 'hidden'}
              variants={container}
              className="space-y-8 h-full flex flex-col justify-center"
            >
              <motion.div variants={item} className="inline-flex items-center">
                <motion.span
                  className="inline-flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/20 px-4 py-2 font-medium text-white relative overflow-hidden"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(239, 68, 68, 0.3)',
                      '0 0 30px rgba(239, 68, 68, 0.5)',
                      '0 0 20px rgba(239, 68, 68, 0.3)',
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatDelay: 3,
                    }}
                  />
                  <AlertTriangle
                    className="h-4 w-4 relative z-10"
                    aria-hidden="true"
                  />
                  <span className="relative z-10">Current State Analysis</span>
                </motion.span>
              </motion.div>

              <motion.h2
                id="problem-statement-title"
                variants={item}
                className="text-balance text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl"
              >
                The developer collaboration{' '}
                <span className="relative">
                  <span className="relative z-10 text-blue-400 bg-clip-text">
                    crisis
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-red-500/30 to-purple-500/30 rounded-lg blur-md"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                </span>{' '}
                is measurable.
              </motion.h2>

              <motion.p
                variants={item}
                className="max-w-prose text-pretty text-lg leading-relaxed text-gray-300 sm:text-xl"
              >
                Great ideas don't fail for lack of talent. They fail because{' '}
                <strong className="text-white">discovery is noisy</strong>,{' '}
                <strong className="text-white">coordination is fragile</strong>,
                and{' '}
                <strong className="text-white">
                  execution rarely composes
                </strong>{' '}
                the right people at the right time.
              </motion.p>

              <motion.div variants={item} className="mt-6">
                <motion.a
                  href="#how-we-fix"
                  className="group inline-flex items-center gap-3 rounded-xl border border-white/20 bg-white/10 text-white px-6 py-3 text-sm font-semibold backdrop-blur-md transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 relative overflow-hidden"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(255, 255, 255, 0.1)',
                      '0 0 30px rgba(255, 255, 255, 0.2)',
                      '0 0 20px rgba(255, 255, 255, 0.1)',
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ['-100%', '100%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      repeatDelay: 2,
                    }}
                  />
                  <span className="relative z-10">Learn how we fix this</span>
                  <ArrowRight className="h-4 w-4 relative z-10" />
                </motion.a>
              </motion.div>
            </motion.div>
          </div>

          <div className="flex-1 lg:max-w-lg">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={leadInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
              className="flex items-center gap-4 mb-8"
            >
              <motion.div
                className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-md relative"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                    '0 0 40px rgba(168, 85, 247, 0.6)',
                    '0 0 20px rgba(168, 85, 247, 0.4)',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain
                  className="h-6 w-6 text-purple-400 relative z-10"
                  aria-hidden="true"
                />
                <Sparkles className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1" />
              </motion.div>
              <div className="text-base text-gray-300">
                Compounded impact across throughput, quality, and retention.
              </div>
            </motion.div>

            <div
              className="relative overflow-hidden rounded-3xl"
              style={{ height: '600px' }}
            >
              <motion.div
                ref={listRef}
                className="flex flex-col gap-6"
                animate={{
                  y: [0, -(PAIN_POINTS.length * 180)],
                }}
                transition={{
                  duration: PAIN_POINTS.length * 4,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: 'linear',
                }}
              >
                {[...PAIN_POINTS, ...PAIN_POINTS].map((p, idx) => {
                  const originalIdx = idx % PAIN_POINTS.length;
                  const isActive = activeCard === originalIdx;

                  return (
                    <motion.div
                      key={`${p.description}-${idx}`}
                      className="relative rounded-2xl border border-white/30 backdrop-blur-xl shadow-2xl p-0 flex flex-col items-stretch overflow-hidden"
                      style={{
                        minHeight: 160,
                        width: '100%',
                        background: `linear-gradient(135deg, ${p.color})`,
                      }}
                      initial={{ opacity: 0, x: 50, filter: 'blur(8px)' }}
                      animate={
                        listInView
                          ? {
                              opacity: 1,
                              x: 0,
                              filter: 'blur(0px)',
                              boxShadow: isActive
                                ? [
                                    `0 0 30px ${p.glowColor}`,
                                    `0 0 60px ${p.glowColor}`,
                                    `0 0 30px ${p.glowColor}`,
                                  ]
                                : `0 4px 32px ${p.glowColor}`,
                            }
                          : {}
                      }
                      transition={{
                        delay: (idx % PAIN_POINTS.length) * 0.1,
                        duration: 0.8,
                        type: 'spring',
                        boxShadow: { duration: 2, repeat: Infinity },
                      }}
                    >
                      {/* Multiple glow layers */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background: `linear-gradient(45deg, ${p.glowColor}, transparent, ${p.glowColor})`,
                        }}
                        animate={{
                          rotate: [0, 360],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          rotate: {
                            duration: 8,
                            repeat: Infinity,
                            ease: 'linear',
                          },
                          opacity: { duration: 2, repeat: Infinity },
                        }}
                      />

                      {/* Energy pulse effect */}
                      <EnergyPulse color={p.glowColor} />

                      {/* Floating particles */}
                      <FloatingParticles color={p.glowColor} />

                      {/* Lightning effect for active cards */}
                      <LightningEffect isActive={isActive} />

                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        style={{
                          background:
                            'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
                        }}
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          repeatDelay: 2,
                        }}
                      />

                      <div className="relative z-10 flex items-center gap-4 p-6">
                        <motion.div
                          className="flex-shrink-0 w-14 h-14 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur-md border border-white/30 relative"
                          animate={
                            isActive
                              ? {
                                  scale: [1, 1.1, 1],
                                  rotate: [0, 5, -5, 0],
                                }
                              : {}
                          }
                          transition={{
                            duration: 1.5,
                            repeat: isActive ? Infinity : 0,
                          }}
                        >
                          {p.icon}
                          <Zap className="h-3 w-3 text-yellow-300 absolute -top-1 -right-1" />

                          {/* Icon glow */}
                          <motion.div
                            className="absolute inset-0 rounded-xl"
                            style={{
                              background: `radial-gradient(circle, ${p.glowColor} 0%, transparent 70%)`,
                            }}
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.5, 0.8, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                            }}
                          />
                        </motion.div>

                        <div className="flex-1">
                          <motion.div
                            className={`font-bold mb-2 text-xl ${severityColors[p.severity]} flex items-center gap-2`}
                            animate={
                              isActive
                                ? {
                                    scale: [1, 1.05, 1],
                                  }
                                : {}
                            }
                            transition={{
                              duration: 1,
                              repeat: isActive ? Infinity : 0,
                            }}
                          >
                            {p.impact}
                            {isActive && (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: 'linear',
                                }}
                              >
                                <Sparkles className="h-4 w-4 text-yellow-400" />
                              </motion.div>
                            )}
                            <span className="text-xs text-gray-300 ml-2">
                              {p.metric}
                            </span>
                          </motion.div>
                          <p className="text-sm text-gray-200 line-clamp-3 leading-relaxed">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      {/* Bottom glow line */}
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-1"
                        style={{
                          background: `linear-gradient(90deg, transparent, ${p.glowColor}, transparent)`,
                        }}
                        animate={{
                          opacity: [0.5, 1, 0.5],
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                        }}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
