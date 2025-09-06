'use client';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState, useCallback } from 'react';
import {
  Users,
  Clock,
  AlertTriangle,
  GitBranch,
  MessageSquare,
  TrendingDown,
  Target,
  Zap,
} from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
}

const ProblemStatement = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, amount: 0.2 });

  // Initialize particles
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        setDimensions({ width: offsetWidth, height: offsetHeight });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (dimensions.width && dimensions.height) {
      const newParticles: Particle[] = [];
      const particleCount = Math.floor((dimensions.width * dimensions.height) / 8000);

      for (let i = 0; i < particleCount; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * dimensions.width,
          y: Math.random() * dimensions.height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.6 + 0.2,
        });
      }
      setParticles(newParticles);
    }
  }, [dimensions]);

  const animateParticles = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !dimensions.width || !dimensions.height) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    setParticles(prevParticles => {
      const updatedParticles = prevParticles.map(particle => {
        let newX = particle.x + particle.vx;
        let newY = particle.y + particle.vy;
        let newVx = particle.vx;
        let newVy = particle.vy;

        if (newX <= 0 || newX >= dimensions.width) newVx = -newVx;
        if (newY <= 0 || newY >= dimensions.height) newVy = -newVy;

        newX = Math.max(0, Math.min(dimensions.width, newX));
        newY = Math.max(0, Math.min(dimensions.height, newY));

        return { ...particle, x: newX, y: newY, vx: newVx, vy: newVy };
      });

      // Draw particles
      updatedParticles.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(220, 70%, 60%, ${particle.opacity})`;
        ctx.fill();
      });

      // Draw connections
      updatedParticles.forEach((particle, i) => {
        updatedParticles.slice(i + 1).forEach(otherParticle => {
          const distance = Math.sqrt(
            Math.pow(particle.x - otherParticle.x, 2) + 
            Math.pow(particle.y - otherParticle.y, 2)
          );

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = `hsla(220, 70%, 60%, ${0.15 * (1 - distance / 120)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      return updatedParticles;
    });

    animationFrameRef.current = requestAnimationFrame(animateParticles);
  }, [dimensions]);

  useEffect(() => {
    if (particles.length > 0) {
      animateParticles();
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [particles.length, animateParticles]);

  const painPoints = [
    {
      icon: <Users className="w-5 h-5" />,
      title: 'Collaboration Barriers',
      description: 'Finding compatible developers with matching skills and availability',
      impact: '78%',
      metric: 'projects lack proper team collaboration'
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: 'Development Delays',
      description: 'Solo developers spending excessive time on areas outside expertise',
      impact: '3.2x',
      metric: 'longer development cycles for solo projects'
    },
    {
      icon: <GitBranch className="w-5 h-5" />,
      title: 'Skill Gaps',
      description: 'Critical missing capabilities preventing project completion',
      impact: '65%',
      metric: 'of ambitious projects remain incomplete'
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: 'Knowledge Silos',
      description: 'Limited exposure to different approaches and best practices',
      impact: '43%',
      metric: 'slower skill development when working alone'
    }
  ];

  const statistics = [
    { value: '2.1M+', label: 'Solo Developers', sublabel: 'Working in isolation' },
    { value: '89%', label: 'Abandoned Ideas', sublabel: 'Due to resource constraints' },
    { value: '156hrs', label: 'Monthly Waste', sublabel: 'On mismatched collaborations' }
  ];

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen bg-background overflow-hidden"
      style={{ opacity }}
    >
      {/* Particle Canvas Background */}
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
        style={{ width: dimensions.width, height: dimensions.height }}
      />

      <div className="relative z-10 container mx-auto px-6 py-16">
        {/* Header Section */}
        <motion.div
          ref={titleRef}
          className="max-w-4xl mx-auto text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-destructive/10 border border-destructive/20 rounded-full text-sm font-medium text-destructive mb-6"
            initial={{ scale: 0.8 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <AlertTriangle className="w-4 h-4" />
            Current State Analysis
          </motion.div>

          <motion.h2
            className="text-3xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            The Developer Collaboration Crisis
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Thousands of innovative projects fail not due to lack of talent, but due to the inability to find and coordinate with the right collaborators at the right time.
          </motion.p>
        </motion.div>

        {/* Statistics Row */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {statistics.map((stat, index) => (
            <motion.div
              key={index}
              className="relative group"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            >
              <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center group-hover:border-primary/30 transition-all duration-300">
                <div className="text-2xl md:text-3xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm font-semibold text-foreground mb-1">
                  {stat.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {stat.sublabel}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pain Points Grid */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-3">Core Challenges</h3>
            <p className="text-muted-foreground">Critical barriers preventing effective developer collaboration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                className="group bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-6 hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.8 + index * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-lg text-primary group-hover:bg-primary/20 transition-colors duration-300">
                    {point.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-foreground mb-2">{point.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">
                      {point.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-destructive">{point.impact}</span>
                      <span className="text-xs text-muted-foreground">{point.metric}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Impact Summary */}
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 0.6 }}
        >
          <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 rounded-2xl p-8 text-center">
            <motion.div
              className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingDown className="w-6 h-6 text-primary" />
            </motion.div>
            
            <h3 className="text-xl font-bold mb-3">The Exponential Impact</h3>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              When developers can't effectively collaborate, innovation stagnates. 
              Great ideas remain trapped in silos, and the entire ecosystem suffers from reduced productivity and missed opportunities.
            </p>
            
            <motion.div
              className="inline-flex items-center gap-2 text-primary font-medium"
              animate={{ x: [0, 3, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Target className="w-4 h-4" />
              <span>But there's a solution ahead</span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default ProblemStatement;