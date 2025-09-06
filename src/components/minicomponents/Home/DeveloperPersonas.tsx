"use client";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Code2, 
  Users, 
  GraduationCap, 
  Briefcase, 
  Rocket, 
  Brain, 
  Target, 
  TrendingUp,
  Heart,
  Zap,
  Star,
  Coffee,
  Github,
  Laptop,
  BookOpen,
  Building,
  Globe,
  ArrowRight,
  CheckCircle2,
  Clock,
  Trophy,
  Lightbulb,
  UserCheck,
  Network,
  Shield,
  Sparkles
} from "lucide-react";

// Persona data with detailed information
const personas = [
  {
    id: "solo-developer",
    title: "Solo Developers",
    subtitle: "The Independent Creators",
    description: "Passionate developers working on personal projects who need collaborators to bring their ambitious ideas to life.",
    avatar: "🧑‍💻",
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    textColor: "text-blue-600 dark:text-blue-400",
    stats: {
      count: "2.3M+",
      growth: "+45%",
      satisfaction: "92%"
    },
    painPoints: [
      "Feeling isolated in the development process",
      "Missing critical skills for complete projects",
      "Lack of motivation and accountability",
      "Limited networking opportunities"
    ],
    goals: [
      "Find compatible coding partners",
      "Learn new technologies through collaboration",
      "Complete ambitious personal projects",
      "Build a professional network"
    ],
    features: [
      "AI-powered skill matching",
      "Project collaboration tools",
      "Mentorship connections",
      "Community support groups"
    ],
    testimonial: {
      text: "DevConnect helped me find the perfect backend developer for my React project. We shipped in 3 weeks instead of 3 months!",
      author: "Sarah Chen",
      role: "Frontend Developer",
      rating: 5
    }
  },
  {
    id: "team-leads",
    title: "Team Leads",
    subtitle: "The Project Orchestrators", 
    description: "Experienced developers leading teams who need to find skilled contributors and manage collaborative development efficiently.",
    avatar: "👨‍💼",
    color: "from-purple-500 to-indigo-500",
    bgColor: "bg-purple-50 dark:bg-purple-950/20",
    textColor: "text-purple-600 dark:text-purple-400",
    stats: {
      count: "450K+",
      growth: "+38%",
      satisfaction: "89%"
    },
    painPoints: [
      "Difficulty finding qualified team members",
      "Managing remote team coordination",
      "Ensuring code quality across contributors",
      "Balancing diverse skill levels"
    ],
    goals: [
      "Build high-performing development teams",
      "Streamline project management workflows",
      "Maintain code quality standards",
      "Scale projects efficiently"
    ],
    features: [
      "Team formation tools",
      "Project management dashboard",
      "Code review workflows",
      "Performance analytics"
    ],
    testimonial: {
      text: "The team formation feature is incredible. I built a 5-person team for our startup in just 2 days with perfect skill complementarity.",
      author: "Marcus Rodriguez",
      role: "CTO, TechStart",
      rating: 5
    }
  },
  {
    id: "students",
    title: "Students & Learners",
    subtitle: "The Future Builders",
    description: "Computer science students and career changers looking to gain real-world experience through collaborative projects.",
    avatar: "🎓",
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-50 dark:bg-green-950/20",
    textColor: "text-green-600 dark:text-green-400",
    stats: {
      count: "890K+",
      growth: "+67%",
      satisfaction: "94%"
    },
    painPoints: [
      "Lack of real-world project experience",
      "Difficulty finding study partners",
      "Limited access to mentorship",
      "Building a professional portfolio"
    ],
    goals: [
      "Gain hands-on development experience",
      "Build an impressive portfolio",
      "Connect with industry mentors",
      "Learn best practices from peers"
    ],
    features: [
      "Student project matching",
      "Mentorship programs",
      "Skill verification system",
      "Portfolio building tools"
    ],
    testimonial: {
      text: "As a CS student, DevConnect gave me the chance to work on real projects. I landed my dream job thanks to the portfolio I built here!",
      author: "Alex Kim",
      role: "Computer Science Student",
      rating: 5
    }
  },
  {
    id: "freelancers",
    title: "Freelancers",
    subtitle: "The Flexible Professionals",
    description: "Independent contractors who need to expand their capabilities by partnering with other specialists for larger projects.",
    avatar: "💼",
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-50 dark:bg-orange-950/20",
    textColor: "text-orange-600 dark:text-orange-400",
    stats: {
      count: "1.1M+",
      growth: "+52%",
      satisfaction: "91%"
    },
    painPoints: [
      "Limited by individual skill sets",
      "Difficulty scaling to larger projects",
      "Finding reliable collaboration partners",
      "Competing with larger agencies"
    ],
    goals: [
      "Expand service offerings through partnerships",
      "Take on larger, more complex projects",
      "Build a network of trusted collaborators",
      "Increase revenue potential"
    ],
    features: [
      "Freelancer network matching",
      "Project revenue sharing tools",
      "Client management system",
      "Reputation & review system"
    ],
    testimonial: {
      text: "I've tripled my project capacity by partnering with other freelancers on DevConnect. The revenue sharing tools make collaboration seamless.",
      author: "David Thompson",
      role: "Full Stack Freelancer",
      rating: 5
    }
  }
];

// Interactive persona card component
const PersonaCard = ({ persona, isActive, onClick, index }: any) => {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);
  
  return (
    <motion.div
      className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
        isActive 
          ? `${persona.bgColor} border-primary shadow-lg scale-105` 
          : 'bg-card border-border hover:border-primary/50'
      }`}
      onClick={() => onClick(index)}
      whileHover={{ scale: isActive ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Avatar and Header */}
      <div className="flex items-center gap-4 mb-4">
        <motion.div 
          className="text-4xl"
          animate={{ 
            scale: isActive ? [1, 1.1, 1] : 1,
            rotate: isActive ? [0, 5, -5, 0] : 0
          }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        >
          {persona.avatar}
        </motion.div>
        <div>
          <h3 className={`text-lg font-bold ${isActive ? persona.textColor : 'text-foreground'}`}>
            {persona.title}
          </h3>
          <p className="text-sm text-muted-foreground">{persona.subtitle}</p>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
        {persona.description}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {Object.entries(persona.stats).map(([key, value]) => (
          <div key={key} className="text-center">
            <div className={`text-lg font-bold ${isActive ? persona.textColor : 'text-foreground'}`}>
              {String(value)}
            </div>
            <div className="text-xs text-muted-foreground capitalize">{key}</div>
          </div>
        ))}
      </div>

      {/* Active indicator */}
      {isActive && (
        <motion.div
          className="absolute top-4 right-4"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <CheckCircle2 className={`w-5 h-5 ${persona.textColor}`} />
        </motion.div>
      )}
    </motion.div>
  );
};

// Detailed persona content component
const PersonaDetails = ({ persona }: any) => {
  const [activeTab, setActiveTab] = useState('challenges');
  
  const tabs = [
    { id: 'challenges', label: 'Pain Points', icon: Target },
    { id: 'goals', label: 'Goals', icon: Trophy },
    { id: 'features', label: 'Solutions', icon: Sparkles },
    { id: 'testimonial', label: 'Success Story', icon: Heart }
  ];

  return (
    <motion.div
      key={persona.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl border border-border p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className={`p-4 rounded-xl bg-gradient-to-br ${persona.color} text-white`}>
          <span className="text-2xl">{persona.avatar}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">{persona.title}</h2>
          <p className="text-muted-foreground">{persona.subtitle}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-muted/50 rounded-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <motion.button
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </motion.button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'challenges' && (
          <motion.div
            key="challenges"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Current Challenges</h3>
            {persona.painPoints.map((point: string, index: number) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Target className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-foreground">{point}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'goals' && (
          <motion.div
            key="goals"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Key Objectives</h3>
            {persona.goals.map((goal: string, index: number) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 bg-primary/10 border border-primary/20 rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Trophy className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-foreground">{goal}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'features' && (
          <motion.div
            key="features"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">How DevConnect Helps</h3>
            {persona.features.map((feature: string, index: number) => (
              <motion.div
                key={index}
                className="flex items-start gap-3 p-3 bg-accent/50 border border-accent rounded-lg"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, backgroundColor: "var(--accent)" }}
              >
                <Sparkles className="w-5 h-5 text-accent-foreground flex-shrink-0 mt-0.5" />
                <p className="text-foreground">{feature}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'testimonial' && (
          <motion.div
            key="testimonial"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              {[...Array(persona.testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <blockquote className="text-foreground text-lg italic mb-4 leading-relaxed">
              "{persona.testimonial.text}"
            </blockquote>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${persona.color} flex items-center justify-center text-white font-bold`}>
                {persona.testimonial.author.split(' ').map((n: any[]) => n[0]).join('')}
              </div>
              <div>
                <div className="font-semibold text-foreground">{persona.testimonial.author}</div>
                <div className="text-sm text-muted-foreground">{persona.testimonial.role}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Main Developer Personas Component
const DeveloperPersonas = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, amount: 0.3 });
  
  const [activePersona, setActivePersona] = useState(0);

  // Auto-rotate personas
  useEffect(() => {
    const interval = setInterval(() => {
      setActivePersona(prev => (prev + 1) % personas.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      ref={containerRef}
      className="relative py-20 bg-gradient-to-b from-background via-muted/5 to-background overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        
        {/* Floating Icons */}
        {[Code2, Users, GraduationCap, Briefcase, Rocket, Brain].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-muted-foreground/10"
            style={{
              left: `${20 + (index * 15)}%`,
              top: `${10 + (index % 3) * 20}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 15 + index * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Icon className="w-8 h-8" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div 
          ref={titleRef}
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div 
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Users className="w-4 h-4" />
            Developer Community
          </motion.div>

          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Built for Every Type of{" "}
            <span className="text-primary">Developer</span>
          </motion.h2>

          <motion.p 
            className="text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Whether you're coding solo, leading teams, learning the ropes, or freelancing, 
            DevConnect adapts to your unique needs and connects you with the right collaborators.
          </motion.p>
        </motion.div>

        {/* Persona Cards Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {personas.map((persona, index) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
              isActive={activePersona === index}
              onClick={setActivePersona}
              index={index}
            />
          ))}
        </motion.div>

        {/* Detailed Persona Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            <PersonaDetails persona={personas[activePersona]} />
          </AnimatePresence>
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Find Your Developer Community Today
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of developers who've already found their perfect collaborators. 
              Your next breakthrough project is just a connection away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Start Connecting
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                className="border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Learn More
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DeveloperPersonas;