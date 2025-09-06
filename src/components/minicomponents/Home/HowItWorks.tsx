'use client';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';
import {
  User,
  Brain,
  Users,
  Rocket,
  GitBranch,
  MessageSquare,
  Code,
  Zap,
  Target,
  ArrowRight,
  CheckCircle,
  Sparkles,
  Network,
  Clock,
  Trophy
} from 'lucide-react';

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, amount: 0.3 });
  const processRef = useRef<HTMLDivElement>(null);
  const processInView = useInView(processRef, { once: false, amount: 0.2 });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 1,
      icon: <User className="w-6 h-6" />,
      title: "Build Your Developer Identity",
      subtitle: "Create a comprehensive profile showcasing your skills",
      description: "Upload your skills, connect GitHub/GitLab, and let our AI analyze your coding patterns to create a rich developer profile.",
      features: ["Skill proficiency tracking", "GitHub integration", "Portfolio showcase", "Experience timeline"],
      color: "from-blue-500/20 to-cyan-500/20",
      accentColor: "text-blue-500",
      bgColor: "bg-blue-500"
    },
    {
      id: 2,
      icon: <Brain className="w-6 h-6" />,
      title: "AI-Powered Smart Matching",
      subtitle: "Advanced algorithms find your perfect collaborators",
      description: "Our AI analyzes complementary skills, experience levels, time zones, and project interests to suggest ideal teammates.",
      features: ["Vector-based matching", "Skill complementarity", "Timezone optimization", "Interest alignment"],
      color: "from-purple-500/20 to-pink-500/20",
      accentColor: "text-purple-500",
      bgColor: "bg-purple-500"
    },
    {
      id: 3,
      icon: <Users className="w-6 h-6" />,
      title: "Connect & Collaborate",
      subtitle: "Form teams and start building together",
      description: "Send collaboration requests, form project teams, and access integrated tools for seamless development workflow.",
      features: ["Real-time messaging", "Project workspaces", "Task management", "Code review tools"],
      color: "from-green-500/20 to-emerald-500/20",
      accentColor: "text-green-500",
      bgColor: "bg-green-500"
    },
    {
      id: 4,
      icon: <Rocket className="w-6 h-6" />,
      title: "Ship Amazing Projects",
      subtitle: "Track progress and celebrate achievements",
      description: "Use collaboration tools, track milestones, and build a portfolio of successful projects with your new team.",
      features: ["Progress tracking", "Milestone management", "Public showcases", "Achievement system"],
      color: "from-orange-500/20 to-red-500/20",
      accentColor: "text-orange-500",
      bgColor: "bg-orange-500"
    }
  ];

  const stats = [
    { value: "3.2x", label: "Faster Development", icon: <Clock className="w-5 h-5" /> },
    { value: "89%", label: "Match Success Rate", icon: <Target className="w-5 h-5" /> },
    { value: "156+", label: "Skills Tracked", icon: <Code className="w-5 h-5" /> },
    { value: "24/7", label: "Global Collaboration", icon: <Network className="w-5 h-5" /> }
  ];

  const features = [
    {
      icon: <GitBranch className="w-5 h-5" />,
      title: "GitHub Integration",
      description: "Auto-sync repos and analyze code"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Real-time Chat",
      description: "Voice, video, and text communication"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "AI Recommendations",
      description: "Smart project and team suggestions"
    },
    {
      icon: <Trophy className="w-5 h-5" />,
      title: "Achievement System",
      description: "Gamified collaboration tracking"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [steps.length]);

  const opacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [0, 1, 1, 0]);

  // Animation progress for flow diagram
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    if (processInView) {
      const timer = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 0.5;
        });
      }, 50);
      
      return () => clearInterval(timer);
    } else {
      setAnimationProgress(0);
    }
  }, [processInView]);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-background overflow-hidden py-10"
      style={{ opacity }}
    >
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Floating Code Elements */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-primary/20 font-mono text-sm"
            initial={{ y: 100, opacity: 0 }}
            animate={{ 
              y: -100, 
              opacity: [0, 1, 0],
              x: Math.sin(i) * 50
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: i * 1.3,
              ease: "linear"
            }}
            style={{
              left: `${20 + i * 15}%`,
              top: '100%'
            }}
          >
            {['{ }', '< />', '[]', '()', '=>', '&&'][i]}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6">
        {/* Header */}
        <motion.div
          ref={titleRef}
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary mb-6"
            initial={{ scale: 0.8 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Zap className="w-4 h-4" />
            The Solution
          </motion.div>

          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            How DevCollab Works
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            From isolation to collaboration in four intelligent steps. 
            Our AI-powered platform transforms how developers find, connect, and build together.
          </motion.p>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ delay: 0.6 + index * 0.1, duration: 0.4 }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-3 text-primary">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Animated Process Flow */}
        <div 
          ref={processRef}
          className="relative mb-20 py-10 overflow-hidden"
        >
          <motion.h3
            className="text-2xl font-bold text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={processInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            Our Intelligent Workflow
          </motion.h3>

          {/* Animated Flow Diagram */}
          <div className="relative h-[450px] max-w-4xl mx-auto">
            {/* Progress Path */}
            <div className="absolute left-1/2 top-0 h-full w-2 bg-primary/10 transform -translate-x-1/2 rounded-full overflow-hidden">
              <motion.div 
                className="w-full bg-gradient-to-b from-blue-500 via-purple-500 to-orange-500"
                style={{ 
                  height: `${animationProgress}%`,
                  transition: "height 0.5s ease"
                }}
              />
            </div>

            {/* Process Steps - Animated */}
            {steps.map((step, index) => {
              const stepPosition = 5 + (index * 90 / (steps.length - 1)); // Position percentage
              const stepActivated = animationProgress >= stepPosition;
              
              return (
                <motion.div
                  key={step.id}
                  className={`absolute left-1/2 w-full max-w-xl transform -translate-x-1/2 ${
                    index % 2 === 0 ? "-translate-x-[calc(50%+120px)]" : "-translate-x-[calc(50%-120px)]"
                  }`}
                  style={{ top: `${stepPosition}%` }}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={
                    stepActivated 
                      ? { opacity: 1, x: index % 2 === 0 ? "-calc(50% + 120px)" : "-calc(50% - 120px)" } 
                      : { opacity: 0, x: index % 2 === 0 ? -80 : 80 }
                  }
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {/* Connection Line */}
                  <div className={`absolute top-1/2 ${index % 2 === 0 ? "right-0" : "left-0"} w-32 h-0.5 ${step.bgColor} transform translate-y-1/2`} />
                  
                  {/* Step Bubble */}
                  <motion.div
                    className={`absolute top-1/2 ${index % 2 === 0 ? "right-0" : "left-0"} w-10 h-10 ${step.bgColor} rounded-full flex items-center justify-center text-white transform -translate-y-1/2 ${index % 2 === 0 ? "translate-x-1/2" : "-translate-x-1/2"} z-10`}
                    initial={{ scale: 0 }}
                    animate={stepActivated ? { scale: 1 } : { scale: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 }}
                  >
                    {step.icon}
                  </motion.div>

                  {/* Content Card */}
                  <motion.div 
                    className={`bg-gradient-to-br ${step.color} backdrop-blur-sm border border-border/50 rounded-xl p-5 ${
                      index % 2 === 0 ? "mr-16" : "ml-16"
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={stepActivated ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    <h4 className="font-bold text-lg mb-2">{step.title}</h4>
                    <p className={`${step.accentColor} text-sm font-medium mb-2`}>{step.subtitle}</p>
                    <p className="text-muted-foreground text-xs mb-3">{step.description}</p>
                    
                    {/* Key Features */}
                    <div className="space-y-1">
                      {step.features.slice(0, 2).map((feature, featureIndex) => (
                        <motion.div
                          key={featureIndex}
                          className="flex items-center gap-2 text-xs"
                          initial={{ opacity: 0, x: -5 }}
                          animate={stepActivated ? { opacity: 1, x: 0 } : { opacity: 0, x: -5 }}
                          transition={{ delay: 0.4 + featureIndex * 0.1 }}
                        >
                          <CheckCircle className="w-3 h-3 text-primary flex-shrink-0" />
                          <span className="text-muted-foreground">{feature}</span>
                        </motion.div>
                      ))}
                    </div>
                    
                    {/* Animated Data Flow */}
                    {index < steps.length - 1 && stepActivated && (
                      <motion.div
                        className="absolute bottom-0 right-0 w-4 h-4 text-primary/60"
                        animate={{ 
                          y: [0, index % 2 === 0 ? 20 : -20, 0],
                          x: [0, index % 2 === 0 ? 20 : -20, 0],
                          opacity: [1, 0.5, 0]
                        }}
                        transition={{ 
                          duration: 1.5, 
                          repeat: Infinity,
                          repeatType: "loop"
                        }}
                      >
                        <div className={`w-3 h-3 rounded-full ${step.bgColor}`} />
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
            
            {/* Data Flow Animation Elements */}
            {steps.slice(0, -1).map((step, index) => {
              const startPosition = 5 + (index * 90 / (steps.length - 1));
              const endPosition = 5 + ((index + 1) * 90 / (steps.length - 1));
              const isActive = animationProgress >= startPosition && animationProgress <= endPosition;
              
              return isActive && (
                [...Array(3)].map((_, dotIndex) => (
                  <motion.div
                    key={`flow-${index}-${dotIndex}`}
                    className="absolute left-1/2 z-20 transform -translate-x-1/2"
                    style={{ 
                      top: `${startPosition + ((animationProgress - startPosition) / 2)}%`,
                      opacity: isActive ? 1 : 0 
                    }}
                    initial={{ scale: 0 }}
                    animate={{ scale: [0.5, 1, 0.5], opacity: [0.2, 1, 0.2] }}
                    transition={{ 
                      duration: 2, 
                      repeat: Infinity,
                      delay: dotIndex * 0.3
                    }}
                  >
                    <div className={`w-2 h-2 rounded-full ${step.bgColor}`} />
                  </motion.div>
                ))
              );
            })}
            
            {/* Current Active Step Highlight */}
            {steps.map((step, index) => {
              const stepPosition = 5 + (index * 90 / (steps.length - 1));
              return animationProgress >= stepPosition && (
                <motion.div
                  key={`active-${step.id}`}
                  className="absolute left-1/2 transform -translate-x-1/2 z-30"
                  style={{ top: `${stepPosition}%` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className={`w-6 h-6 ${step.bgColor} rounded-full opacity-50`} />
                </motion.div>
              );
            })}
          </div>
          
          {/* Replay Button */}
          {animationProgress >= 100 && (
            <motion.button
              className="mx-auto mt-10 px-6 py-2 bg-primary/10 border border-primary/20 rounded-full text-sm font-medium text-primary flex items-center gap-2"
              onClick={() => setAnimationProgress(0)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
              Replay Animation
            </motion.button>
          )}
        </div>

        {/* Key Features Grid */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.2, duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold mb-3">Powerful Features</h3>
            <p className="text-muted-foreground">Everything you need for successful collaboration</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group bg-card/40 backdrop-blur-sm border border-border/30 rounded-xl p-6 text-center hover:border-primary/40 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 1.3 + index * 0.1, duration: 0.4 }}
                whileHover={{ y: -5, scale: 1.02 }}
              >
                <motion.div
                  className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-4 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h4 className="font-semibold mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1.5, duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-4 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border border-primary/20 rounded-2xl p-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            <div className="text-left">
              <h3 className="text-xl font-bold mb-2">Ready to Transform Your Development?</h3>
              <p className="text-muted-foreground">Join thousands of developers building amazing projects together</p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HowItWorks;