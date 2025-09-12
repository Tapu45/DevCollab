'use client';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Code2,
  Users,
  MessageCircle,
  GitBranch,
  Coffee,
  Lightbulb,
  ArrowRight,
  Heart,
  Target,
  Sparkles,
} from 'lucide-react';

// Authentic developer stories and experiences
const developerStories = [
  {
    id: 'open-source-contributor',
    title: 'Open Source Contributor',
    avatar: '👨‍💻',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    textColor: 'text-blue-600 dark:text-blue-400',
    story: {
      challenge: 'I was working on a personal project but hit a wall with database optimization. The queries were slow and I couldn\'t figure out why.',
      solution: 'Found someone on DevConnect who had experience with similar issues. We paired on a call for an hour, and they showed me how to restructure my queries and add proper indexing.',
      outcome: 'My app went from taking 5 seconds to load to under 500ms. That collaboration turned into a long-term friendship and we\'ve worked on several projects together.',
      author: 'Sarah Chen',
      role: 'Full Stack Developer',
      location: 'San Francisco, CA',
    },
    collaborationType: 'Technical Pairing',
    duration: '1 hour session',
    technologies: ['PostgreSQL', 'Node.js', 'Express'],
  },
  {
    id: 'career-changer',
    title: 'Career Changer',
    avatar: '🎓',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'bg-green-50 dark:bg-green-950/20',
    textColor: 'text-green-600 dark:text-green-400',
    story: {
      challenge: 'I was learning React but couldn\'t find real projects to practice on. My portfolio was just tutorial clones and I needed something more substantial.',
      solution: 'Connected with a senior developer who needed help with their side project. They mentored me through building a real feature while teaching me best practices.',
      outcome: 'I built a complete user authentication system and learned about testing, deployment, and code reviews. That project got me my first job as a junior developer.',
      author: 'Marcus Johnson',
      role: 'Junior Frontend Developer',
      location: 'Austin, TX',
    },
    collaborationType: 'Mentorship',
    duration: '3 months',
    technologies: ['React', 'Firebase', 'Jest'],
  },
  {
    id: 'freelance-developer',
    title: 'Freelance Developer',
    avatar: '💼',
    color: 'from-orange-500 to-red-500',
    bgColor: 'bg-orange-50 dark:bg-orange-950/20',
    textColor: 'text-orange-600 dark:text-orange-400',
    story: {
      challenge: 'I kept getting projects that required both frontend and backend work, but I\'m primarily a frontend specialist. I was turning down good opportunities.',
      solution: 'Found a backend developer who was in the same situation. We started collaborating on projects, splitting the work based on our strengths.',
      outcome: 'We\'ve completed 12 projects together over the past year. I can now take on full-stack projects confidently, and we\'ve built a sustainable partnership.',
      author: 'Elena Rodriguez',
      role: 'Frontend Specialist',
      location: 'Barcelona, Spain',
    },
    collaborationType: 'Project Partnership',
    duration: '1 year ongoing',
    technologies: ['React', 'Django', 'AWS'],
  },
  {
    id: 'startup-founder',
    title: 'Startup Founder',
    avatar: '🚀',
    color: 'from-purple-500 to-indigo-500',
    bgColor: 'bg-purple-50 dark:bg-purple-950/20',
    textColor: 'text-purple-600 dark:text-purple-400',
    story: {
      challenge: 'My startup needed to launch an MVP quickly, but our small team was stretched thin. We needed specialized help with DevOps and security.',
      solution: 'Found experienced developers through DevConnect who could work part-time on our project. They helped set up CI/CD and implemented security best practices.',
      outcome: 'We launched on time and passed our security audit. Those developers became advisors and helped us scale to our Series A round.',
      author: 'David Kim',
      role: 'CTO, HealthTech Startup',
      location: 'Seoul, South Korea',
    },
    collaborationType: 'Expert Consultation',
    duration: '2 months',
    technologies: ['Docker', 'Kubernetes', 'OAuth'],
  },
];

// Story card component
const StoryCard = ({ story, isActive, onClick, index }: any) => {
  return (
    <motion.div
      className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 ${
        isActive
          ? `${story.bgColor} border-primary shadow-lg scale-105`
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
            rotate: isActive ? [0, 5, -5, 0] : 0,
          }}
          transition={{ duration: 2, repeat: isActive ? Infinity : 0 }}
        >
          {story.avatar}
        </motion.div>
        <div>
          <h3
            className={`text-lg font-bold ${isActive ? story.textColor : 'text-foreground'}`}
          >
            {story.title}
          </h3>
          <p className="text-sm text-muted-foreground">{story.collaborationType}</p>
        </div>
      </div>

      {/* Story Preview */}
      <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">
        {story.story.challenge}
      </p>

      {/* Technologies */}
      <div className="flex flex-wrap gap-2 mb-4">
        {story.technologies.map((tech: string, techIndex: number) => (
          <span
            key={techIndex}
            className="px-2 py-1 bg-muted/50 text-xs rounded-md text-muted-foreground"
          >
            {tech}
          </span>
        ))}
      </div>

      {/* Duration */}
      <div className="text-xs text-muted-foreground">
        {story.duration}
      </div>
    </motion.div>
  );
};

// Detailed story content component
const StoryDetails = ({ story }: any) => {
  const [activeSection, setActiveSection] = useState('challenge');

  const sections = [
    { id: 'challenge', label: 'The Challenge', icon: Target },
    { id: 'solution', label: 'How We Helped', icon: Lightbulb },
    { id: 'outcome', label: 'The Result', icon: Sparkles },
    { id: 'author', label: 'Their Story', icon: Heart },
  ];

  return (
    <motion.div
      key={story.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-2xl border border-border p-8"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div
          className={`p-4 rounded-xl bg-gradient-to-br ${story.color} text-white`}
        >
          <span className="text-2xl">{story.avatar}</span>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {story.title}
          </h2>
          <p className="text-muted-foreground">{story.collaborationType} • {story.duration}</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 p-1 bg-muted/50 rounded-lg">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <motion.button
              key={section.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveSection(section.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Icon className="w-4 h-4" />
              {section.label}
            </motion.button>
          );
        })}
      </div>

      {/* Section Content */}
      <AnimatePresence mode="wait">
        {activeSection === 'challenge' && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              The Challenge
            </h3>
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-foreground leading-relaxed">
                {story.story.challenge}
              </p>
            </div>
          </motion.div>
        )}

        {activeSection === 'solution' && (
          <motion.div
            key="solution"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              How DevConnect Helped
            </h3>
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-foreground leading-relaxed">
                {story.story.solution}
              </p>
            </div>
          </motion.div>
        )}

        {activeSection === 'outcome' && (
          <motion.div
            key="outcome"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              The Result
            </h3>
            <div className="p-4 bg-accent/50 border border-accent rounded-lg">
              <p className="text-foreground leading-relaxed">
                {story.story.outcome}
              </p>
            </div>
          </motion.div>
        )}

        {activeSection === 'author' && (
          <motion.div
            key="author"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Their Story
            </h3>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-6">
              <div className="flex items-center gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-full bg-gradient-to-br ${story.color} flex items-center justify-center text-white font-bold`}
                >
                  {story.story.author
                    .split(' ')
                    .map((n: string) => n[0])
                    .join('')}
                </div>
                <div>
                  <div className="font-semibold text-foreground">
                    {story.story.author}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {story.story.role}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {story.story.location}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {story.technologies.map((tech: string, techIndex: number) => (
                  <span
                    key={techIndex}
                    className="px-3 py-1 bg-muted/50 text-sm rounded-full text-muted-foreground"
                  >
                    {tech}
                  </span>
                ))}
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

  const [activeStory, setActiveStory] = useState(0);

  const handleStoryClick = (index: number) => {
    setActiveStory(index);
  };

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
        {[Code2, Users, MessageCircle, GitBranch, Coffee].map(
          (Icon, index) => (
            <motion.div
              key={index}
              className="absolute text-muted-foreground/10"
              style={{
                left: `${20 + index * 15}%`,
                top: `${10 + (index % 3) * 20}%`,
              }}
              animate={{
                y: [0, -20, 0],
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 15 + index * 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            >
              <Icon className="w-8 h-8" />
            </motion.div>
          ),
        )}
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          ref={titleRef}
          className="text-center max-w-3xl mx-auto mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Users className="w-4 h-4" />
            Real Developer Stories
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Real Collaborations, Real{' '}
            <span className="text-primary">Results</span>
          </motion.h2>

          <motion.p
            className="text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            These are actual stories from developers who found help, built partnerships, 
            and grew their careers through meaningful collaborations on DevConnect.
          </motion.p>
        </motion.div>

        {/* Story Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {developerStories.map((story, index) => (
            <StoryCard
              key={story.id}
              story={story}
              isActive={activeStory === index}
              onClick={handleStoryClick}
              index={index}
            />
          ))}
        </motion.div>

        {/* Detailed Story Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <AnimatePresence mode="wait">
            <StoryDetails story={developerStories[activeStory]} />
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
              Ready to Write Your Own Story?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join developers who are building real connections, solving actual problems, 
              and creating meaningful collaborations every day.
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
              Browse Projects
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default DeveloperPersonas;