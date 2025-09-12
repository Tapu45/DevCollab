import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Users,
  BrainCircuit,
  KanbanSquare,
  MessageCircle,
  BadgeCheck,
  BarChart3,
  Github,
  ShieldCheck,
  Smartphone,
  Bot,
} from 'lucide-react';

const features = [
  {
    title: 'AI-Powered Matching',
    desc: 'Connect with developers based on skills, interests, and experience using advanced AI algorithms.',
    image:
      'https://thumbor-cdn.b2match.com/E85_dfrZ6W-kXkRziBX8aH5AWX4=/fit-in/1500x1070/filters:quality(95):no_upscale()/https://cdn.b2match.com/uploads/recommeder_page_section_1_c249919d7f/recommeder_page_section_1_c249919d7f.png',
    bg: 'from-blue-900/60 via-blue-800/30 to-blue-900/10',
    glow: 'bg-blue-500/20',
    icon: BrainCircuit,
  },
  {
    title: 'Profile & Portfolio',
    desc: 'Showcase your skills, experience, and projects. Import from GitHub/GitLab and track your growth.',
    image:
      'https://images.unsplash.com/photo-1511367461989-f85a21fda167?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWJzdHJhY3QlMjBwcm9maWxlfGVufDB8fDB8fHww',
    bg: 'from-purple-900/60 via-purple-800/30 to-purple-900/10',
    glow: 'bg-purple-500/20',
    icon: BadgeCheck,
  },
  {
    title: 'Project Collaboration',
    desc: 'Create project workspaces, manage tasks with Kanban boards, and invite teammates.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlnMhUZ6UaHZSq_RTvW50QgmUvfmDtyKfC0w&s',
    bg: 'from-cyan-900/60 via-cyan-800/30 to-cyan-900/10',
    glow: 'bg-cyan-500/20',
    icon: KanbanSquare,
  },
  {
    title: 'Real-time Communication',
    desc: 'Message collaborators instantly with real-time chat and notifications.',
    image: '/images/real-time-communication.png',
    bg: 'from-green-900/60 via-green-800/30 to-green-900/10',
    glow: 'bg-green-500/20',
    icon: MessageCircle,
  },
];

export default function FeaturesOverview() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Calculate active feature based on scroll progress
  const activeFeatureIndex = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0, 1, 2, 3, 3],
  );

  return (
    <main
      ref={containerRef}
      className="flex flex-col lg:flex-row items-start w-full max-w-6xl mx-auto py-16 px-4 gap-12"
    >
      {/* Left Side: Sticky Feature Text */}
      <div className="lg:sticky lg:top-20 lg:w-1/2 lg:h-screen flex flex-col justify-center">
        <motion.h2
          className="text-3xl sm:text-5xl font-extrabold mb-12 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
        >
          Platform Features
        </motion.h2>

        <div className="space-y-8">
          {features.map((feature, idx) => (
            <motion.div
              key={feature.title}
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Feature Title */}
              <motion.div
                className="flex items-center gap-4 mb-4"
                style={{
                  scale: useTransform(activeFeatureIndex, (value) =>
                    value === idx ? 1.1 : 1,
                  ),
                }}
              >
                <motion.div
                  className="p-3 rounded-lg"
                  style={{
                    backgroundColor: useTransform(
                      activeFeatureIndex,
                      (value) => (value === idx ? '#3b82f6' : '#374151'),
                    ),
                    color: useTransform(
                      activeFeatureIndex,
                      (value) => (value === idx ? '#ffffff' : '#d1d5db'),
                    ),
                  }}
                >
                  <feature.icon className="w-6 h-6" />
                </motion.div>
                <motion.h3
                  className="font-semibold text-2xl"
                  style={{
                    color: useTransform(activeFeatureIndex, (value) =>
                      value === idx ? '#ffffff' : '#d1d5db',
                    ),
                  }}
                >
                  {feature.title}
                </motion.h3>
              </motion.div>

              {/* Feature Description */}
              <motion.p
                className="text-lg text-gray-300 leading-relaxed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  opacity: useTransform(activeFeatureIndex, (value) =>
                    value === idx ? 1 : 0.5,
                  ),
                }}
                transition={{ duration: 0.3 }}
              >
                {feature.desc}
              </motion.p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Side: Image Reveal */}
      <div className="lg:w-1/2 lg:h-screen flex items-center justify-center relative overflow-hidden">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            className="absolute inset-0 flex items-center justify-center"
            style={{
              opacity: useTransform(activeFeatureIndex, (value) =>
                value === idx ? 1 : 0,
              ),
              x: useTransform(activeFeatureIndex, (value) =>
                value === idx ? 0 : value > idx ? -100 : 100,
              ),
            }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {/* Glow Effect */}
            <motion.span
              className={`absolute -top-8 -left-8 w-64 h-64 rounded-full blur-3xl opacity-40 ${feature.glow} pointer-events-none`}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                repeatType: 'mirror',
                delay: idx * 0.1,
              }}
            />

            {/* Image Container */}
            <motion.div
              className="relative z-10 p-8 bg-black/60 rounded-lg shadow-2xl"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src={feature.image}
                alt={feature.title}
                className="w-80 h-80 object-contain rounded-lg"
              />
            </motion.div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}
