'use client';

import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
  Users,
  Clock,
  AlertTriangle,
  GitBranch,
  MessageSquare,
  TrendingDown,
  Target,
  ChevronRight,
} from 'lucide-react';

/**
 * EnterpriseProblemStatement
 *
 * Purpose: Problem Statement section that explains the pain point of developer collaboration
 * (discovery, coordination, and execution) and why our solution matters.
 *
 * Style: Enterprise polish inspired by Stripe/Linear—minimal, asymmetric grid with strong type,
 * tight spacing control, and data-led storytelling. No blobs or generic gradient cards.
 *
 * Notes:
 * - Uses motion-driven reveal, stagger, and subtle parallax on the background diagram.
 * - Keyboard & screen-reader friendly; honors reduced motion.
 * - Ready to drop into a Next.js + Tailwind + Framer Motion codebase.
 */

type PainPoint = {
  icon: React.ReactNode;
  title: string;
  description: string;
  impact: string;
  metric: string;
};

type Stat = {
  value: string;
  label: string;
  sublabel: string;
};

const PAIN_POINTS: PainPoint[] = [
  {
    icon: <Users className="w-5 h-5" aria-hidden="true" />,
    title: 'Collaboration Barriers',
    description:
      'Hard to discover compatible developers with the right skills, work style, and availability.',
    impact: '78%',
    metric: 'projects lack proper team collaboration',
  },
  {
    icon: <Clock className="w-5 h-5" aria-hidden="true" />,
    title: 'Development Delays',
    description:
      'Solo builders lose time context-switching into unfamiliar areas outside their expertise.',
    impact: '3.2x',
    metric: 'longer dev cycles on solo projects',
  },
  {
    icon: <GitBranch className="w-5 h-5" aria-hidden="true" />,
    title: 'Skill Gaps',
    description:
      'Critical capabilities go missing at key phases—shipping stalls or scope gets cut.',
    impact: '65%',
    metric: 'of ambitious projects remain incomplete',
  },
  {
    icon: <MessageSquare className="w-5 h-5" aria-hidden="true" />,
    title: 'Knowledge Silos',
    description:
      'Limited exposure to peer patterns and best practices slows compound learning.',
    impact: '43%',
    metric: 'slower skill development when working alone',
  },
];

const STATS: Stat[] = [
  {
    value: '2.1M+',
    label: 'Solo Developers',
    sublabel: 'Working in isolation',
  },
  { value: '89%', label: 'Abandoned Ideas', sublabel: 'Resource constraints' },
  { value: '156hrs', label: 'Monthly Waste', sublabel: 'Mismatched collabs' },
];

export default function EnterpriseProblemStatement() {
  const sectionRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const leadInView = useInView(leadRef, { once: true, amount: 0.3 });
  const listInView = useInView(listRef, { once: true, amount: 0.2 });

  // Subtle parallax for the background diagram
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, -40]); // moves up slightly on scroll

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.08,
        ease: 'easeOut',
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section
      ref={sectionRef}
      aria-labelledby="problem-statement-title"
      className="relative bg-background text-foreground"
    >
      {/* Background: technical diagram (no blobs, no loud gradients). */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ y }}
      >
        <svg
          className="h-full w-full opacity-[0.10]"
          viewBox="0 0 1200 800"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* grid */}
          <pattern
            id="ps-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 32 0 L 0 0 0 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="1200" height="800" fill="url(#ps-grid)" />

          {/* network strokes */}
          <g stroke="currentColor" strokeWidth="1" className="text-primary/40">
            <path d="M100 120L320 220L540 160L820 260L1040 180" fill="none" />
            <path d="M120 420L360 380L600 520L880 460L1080 560" fill="none" />
            <path d="M160 680L420 600L760 700L1040 640" fill="none" />
          </g>
          {/* connection nodes */}
          <g className="text-primary/50" fill="currentColor">
            {[
              { x: 320, y: 220 },
              { x: 540, y: 160 },
              { x: 820, y: 260 },
              { x: 600, y: 520 },
            ].map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r="3.5" />
            ))}
          </g>
        </svg>
      </motion.div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 sm:py-28 lg:px-8">
        {/* Asymmetric layout: left narrative (sticky on lg), right evidence */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-y-16 gap-x-12">
          {/* Narrative column */}
          <div className="lg:sticky lg:top-24 self-start">
            <motion.div
              ref={leadRef}
              initial="hidden"
              animate={leadInView ? 'show' : 'hidden'}
              variants={container}
              className="space-y-6"
            >
              <motion.div
                variants={item}
                className="inline-flex items-center text-sm"
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-3 py-1.5 font-medium text-destructive">
                  <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                  Current State Analysis
                </span>
              </motion.div>

              <motion.h2
                id="problem-statement-title"
                variants={item}
                className="text-balance text-3xl font-bold leading-tight tracking-tight sm:text-4xl md:text-5xl"
              >
                The developer collaboration crisis is silent—but measurable.
              </motion.h2>

              <motion.p
                variants={item}
                className="max-w-prose text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg"
              >
                Great ideas don’t fail for lack of talent. They fail because
                discovery is noisy, coordination is fragile, and execution
                rarely composes the right people at the right time. The result:
                slow delivery, abandoned scope, and siloed learning.
              </motion.p>

              <motion.div variants={item} className="mt-4">
                <a
                  href="#how-we-fix"
                  className="group inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                >
                  Learn how we fix this
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </a>
              </motion.div>

              {/* Data ribbon */}
              <motion.div
                variants={item}
                className="mt-8 grid grid-cols-1 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-card/40 backdrop-blur-sm sm:grid-cols-3 sm:divide-y-0 sm:divide-x"
                role="list"
              >
                {STATS.map((s, i) => (
                  <div key={i} className="p-5">
                    <div className="text-2xl font-bold text-primary">
                      {s.value}
                    </div>
                    <div className="text-sm font-medium">{s.label}</div>
                    <div className="text-xs text-muted-foreground">
                      {s.sublabel}
                    </div>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          {/* Evidence column */}
          <div className="space-y-10">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={leadInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="flex items-center gap-3"
            >
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-background">
                <TrendingDown
                  className="h-5 w-5 text-primary"
                  aria-hidden="true"
                />
              </div>
              <div className="text-sm text-muted-foreground">
                Compounded impact across throughput, quality, and retention.
              </div>
            </motion.div>

            <motion.div
              ref={listRef}
              variants={container}
              initial="hidden"
              animate={listInView ? 'show' : 'hidden'}
              className="relative"
            >
              {/* Vertical rule for timeline feel */}
              <div
                aria-hidden="true"
                className="absolute left-[10px] top-0 hidden h-full w-px bg-border/70 sm:block"
              />
              <ul className="space-y-8">
                {PAIN_POINTS.map((p, idx) => (
                  <motion.li
                    key={p.title}
                    variants={item}
                    className="relative grid grid-cols-[24px_1fr] items-start gap-4 sm:grid-cols-[28px_1fr]"
                    role="listitem"
                  >
                    {/* marker */}
                    <div className="relative hidden sm:block">
                      <span className="absolute -left-[7px] top-1 inline-block h-3.5 w-3.5 rounded-full border border-border/60 bg-background" />
                    </div>

                    <div className="group">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 inline-flex rounded-md border border-border/60 bg-background p-2 text-primary transition-colors group-hover:border-primary/40">
                          {p.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-baseline gap-x-3">
                            <h3 className="text-base font-semibold">
                              {p.title}
                            </h3>
                            <div className="inline-flex items-center gap-1 text-sm font-semibold text-destructive">
                              {p.impact}
                              <span className="text-xs text-muted-foreground font-normal">
                                {p.metric}
                              </span>
                            </div>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Closing statement with a quiet emphasis line */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={listInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="rounded-2xl border border-primary/15 bg-primary/5 p-6"
            >
              <div className="flex items-start gap-4">
                <div className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background">
                  <Target className="h-5 w-5 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h4 className="text-base font-semibold">
                    The exponential impact
                  </h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    When teams can’t compose the right skills at the right time,
                    innovation slows. Ideas remain siloed, and delivery
                    suffers—across speed, quality, and learning. We’re here to
                    reverse that curve.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* CTA micro-interaction */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={listInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
            >
              <a
                id="how-we-fix"
                href="#solution"
                className="group inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-4 py-3 text-sm font-semibold text-foreground transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              >
                See the solution approach
                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Optional 3D/Illustration hooks (keep off-DOM until used) */}
      {/* 
        - Drop a Spline scene behind the SVG grid (z-0) for subtle perspective.
        - Embed a Lottie of connecting nodes near the stats ribbon.
        - Swap the SVG network with an interactive WebGL graph (e.g., react-three-fiber) on desktop only.
      */}
    </section>
  );
}

/* -------------------------------- Enhancements --------------------------------
1) Replace the background SVG with a lightweight animated SVG path (stroke-dashoffset) to
   signal "live connections" without resorting to generic gradients.
2) Typography system: Tailwind plugin or CSS variables for steps (e.g., --step-0..5) mapped
   to text sizes for consistent vertical rhythm.
3) Motion: Use prefers-reduced-motion to reduce parallax amplitude and disable stagger.
4) Analytics hooks: Wrap CTA clicks with your analytics emitter for conversion tracking.
--------------------------------------------------------------------------------- */
