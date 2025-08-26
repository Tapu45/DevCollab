import { motion } from "framer-motion";
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
} from "lucide-react";

const features = [
  {
    title: "AI-Powered Matching",
    desc: "Connect with developers based on skills, interests, and experience using advanced AI algorithms.",
    image: "https://thumbor-cdn.b2match.com/E85_dfrZ6W-kXkRziBX8aH5AWX4=/fit-in/1500x1070/filters:quality(95):no_upscale()/https://cdn.b2match.com/uploads/recommeder_page_section_1_c249919d7f/recommeder_page_section_1_c249919d7f.png", // <-- your image path here
    bg: "from-blue-900/60 via-blue-800/30 to-blue-900/10",
    glow: "bg-blue-500/20",
  },
  {
    title: "Profile & Portfolio",
    desc: "Showcase your skills, experience, and projects. Import from GitHub/GitLab and track your growth.",
    image: "https://images.unsplash.com/photo-1511367461989-f85a21fda167?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8YWJzdHJhY3QlMjBwcm9maWxlfGVufDB8fDB8fHww",
    bg: "from-purple-900/60 via-purple-800/30 to-purple-900/10",
    glow: "bg-purple-500/20",
  },
  {
    title: "Project Collaboration",
    desc: "Create project workspaces, manage tasks with Kanban boards, and invite teammates.",
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlnMhUZ6UaHZSq_RTvW50QgmUvfmDtyKfC0w&s",
    bg: "from-cyan-900/60 via-cyan-800/30 to-cyan-900/10",
    glow: "bg-cyan-500/20",
  },
  {
    title: "Real-time Communication",
    desc: "Message collaborators instantly with real-time chat and notifications.",
    image: "/images/real-time-communication.png",
    bg: "from-green-900/60 via-green-800/30 to-green-900/10",
    glow: "bg-green-500/20",
  },
];
// Add this to your globals.css for a subtle glow if not already present
// .drop-shadow-glow { filter: drop-shadow(0 0 8px currentColor); }

// ...existing code...

export default function FeaturesOverview() {
  return (
    <main className="flex flex-col items-center w-full max-w-6xl mx-auto py-16 px-4">
      <motion.h2
        className="text-3xl sm:text-5xl font-extrabold text-center mb-12 bg-gradient-to-r from-blue-500 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        Platform Features
      </motion.h2>
      <div className="flex flex-col gap-16 w-full">
        {features.map((feature, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.div
              key={feature.title}
              className={`
                flex flex-col md:flex-row items-center justify-between gap-8
                ${!isEven ? "md:flex-row-reverse" : ""}
              `}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              viewport={{ once: true }}
            >
              {/* Text Section */}
              <div className="flex-1">
                <h3 className="font-semibold text-2xl mb-2 text-white">{feature.title}</h3>
                <p className="text-lg text-gray-300 mb-4">{feature.desc}</p>
              </div>
              {/* Image Section */}
              <div className="flex-1 flex items-center justify-center relative">
                <motion.span
                  className={`absolute -top-8 -left-8 w-32 h-32 rounded-full blur-2xl opacity-40 ${feature.glow} pointer-events-none`}
                  animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.6, 0.4] }}
                  transition={{ repeat: Infinity, duration: 3, repeatType: "mirror", delay: idx * 0.1 }}
                />
                <span className="flex items-center justify-center rounded-lg bg-black/60 p-6 relative z-10">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-32 h-32 object-contain"
                  />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}
// ...existing code...