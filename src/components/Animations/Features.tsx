import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, BrainCircuit, KanbanSquare, MessageCircle, Github, Code, Zap, CheckCircle, Clock, User, MessageSquare, Bell } from 'lucide-react';

// AI Matching Animation Component
type Developer = { id: number; name: string; skills: string[]; x: number; y: number; color: string };
type Connection = { id: number; from: Developer; to: Developer };

export const AIMatchingAnimation = () => {
  const [currentMatch, setCurrentMatch] = useState(0);
  const [connections, setConnections] = useState<Connection[]>([]);
  
  const developers: Developer[] = [
    { id: 1, name: 'Alex', skills: ['React', 'Node.js'], x: 20, y: 30, color: 'from-blue-400 to-blue-600' },
    { id: 2, name: 'Sarah', skills: ['Python', 'ML'], x: 80, y: 20, color: 'from-purple-400 to-purple-600' },
    { id: 3, name: 'Mike', skills: ['React', 'Python'], x: 60, y: 70, color: 'from-green-400 to-green-600' },
    { id: 4, name: 'Emma', skills: ['Node.js', 'ML'], x: 30, y: 80, color: 'from-pink-400 to-pink-600' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMatch((prev) => (prev + 1) % developers.length);
      setConnections(prev => {
        const newConnections = [...prev];
        if (newConnections.length > 3) newConnections.shift();
        newConnections.push({
          id: Date.now(),
          from: developers[currentMatch],
          to: developers[(currentMatch + 1) % developers.length]
        });
        return newConnections;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [currentMatch]);

  return (
    <div className="relative w-80 h-80 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 overflow-hidden border border-slate-700/50">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-20">
        <svg className="w-full h-full">
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#334155" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)"/>
        </svg>
      </div>

      {/* Central AI Brain */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center"
        animate={{ 
          scale: [1, 1.1, 1],
          boxShadow: [
            '0 0 20px rgba(34, 211, 238, 0.4)',
            '0 0 40px rgba(34, 211, 238, 0.8)',
            '0 0 20px rgba(34, 211, 238, 0.4)'
          ]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <BrainCircuit className="w-8 h-8 text-white" />
      </motion.div>

      {/* Developer Nodes */}
      {developers.map((dev, idx) => (
        <motion.div
          key={dev.id}
          className={`absolute w-12 h-12 bg-gradient-to-r ${dev.color} rounded-full flex items-center justify-center text-white text-xs font-bold`}
          style={{ left: `${dev.x}%`, top: `${dev.y}%` }}
          animate={{
            scale: currentMatch === idx ? [1, 1.2, 1] : 1,
            boxShadow: currentMatch === idx ? 
              '0 0 20px rgba(59, 130, 246, 0.6)' : 
              '0 0 10px rgba(0, 0, 0, 0.3)'
          }}
          transition={{ duration: 0.5 }}
        >
          {dev.name[0]}
        </motion.div>
      ))}

      {/* Connection Lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <AnimatePresence>
          {connections.map((conn) => (
            <motion.line
              key={conn.id}
              x1={`${conn.from.x}%`}
              y1={`${conn.from.y}%`}
              x2={`${conn.to.x}%`}
              y2={`${conn.to.y}%`}
              stroke="url(#connectionGradient)"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            />
          ))}
        </AnimatePresence>
        <defs>
          <linearGradient id="connectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.8"/>
          </linearGradient>
        </defs>
      </svg>

      {/* Match Score */}
      <motion.div
        className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 text-green-400 text-sm font-mono"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        Match: 94%
      </motion.div>
    </div>
  );
};

// Profile Portfolio Animation
export const ProfilePortfolioAnimation = () => {
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Profile', 'Projects', 'GitHub'];

  const skills = ['React', 'Node.js', 'Python', 'TypeScript', 'AWS'];
  const projects = [
    { name: 'E-commerce App', status: 'completed', progress: 100 },
    { name: 'AI Dashboard', status: 'in-progress', progress: 75 },
    { name: 'Mobile App', status: 'planning', progress: 25 }
  ];

  return (
    <div className="relative w-80 h-80 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-6 overflow-hidden border border-slate-700/50">
      {/* Header Tabs */}
      <div className="flex space-x-2 mb-4">
        {tabs.map((tab, idx) => (
          <motion.button
            key={tab}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              activeTab === idx ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-300'
            }`}
            onClick={() => setActiveTab(idx)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 0 && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {/* Profile Avatar */}
            <div className="flex items-center space-x-3">
              <motion.div
                className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-white font-bold"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                JD
              </motion.div>
              <div>
                <h3 className="text-white font-semibold">John Doe</h3>
                <p className="text-slate-400 text-sm">Full Stack Developer</p>
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-slate-300 text-sm mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <motion.span
                    key={skill}
                    className="px-2 py-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full text-xs text-blue-300 border border-blue-500/30"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.1, duration: 0.3 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Projects', value: '12', color: 'text-green-400' },
                { label: 'Commits', value: '1.2k', color: 'text-blue-400' },
                { label: 'Stars', value: '234', color: 'text-yellow-400' }
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  className="bg-slate-800/50 rounded-lg p-2 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.2 }}
                >
                  <div className={`text-lg font-bold ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs text-slate-400">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {activeTab === 1 && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            {projects.map((project, idx) => (
              <motion.div
                key={project.name}
                className="bg-slate-800/50 rounded-lg p-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-white text-sm font-medium">{project.name}</h4>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    project.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                    project.status === 'in-progress' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${project.progress}%` }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 2 && (
          <motion.div
            key="github"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Github className="w-6 h-6 text-white" />
              <span className="text-white font-medium">GitHub Integration</span>
            </div>
            
            {/* Contribution Graph */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: 35 }, (_, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${
                    Math.random() > 0.7 ? 'bg-green-500' :
                    Math.random() > 0.5 ? 'bg-green-400/60' :
                    Math.random() > 0.3 ? 'bg-green-400/30' :
                    'bg-slate-700'
                  }`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                />
              ))}
            </div>
            
            <div className="text-xs text-slate-400">147 contributions in the last year</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Project Collaboration Animation
export const ProjectCollaborationAnimation = () => {
  const [boardData, setBoardData] = useState({
    todo: [
      { id: 1, title: 'Design UI', assignee: 'Alex' },
      { id: 2, title: 'Setup Backend', assignee: 'Sarah' }
    ],
    inProgress: [
      { id: 3, title: 'API Integration', assignee: 'Mike' }
    ],
    done: [
      { id: 4, title: 'Database Schema', assignee: 'Emma' }
    ]
  });

  

  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setBoardData(prev => {
        const newData = { ...prev };
        // Simulate task movement
        if (newData.todo.length > 0 && Math.random() > 0.7) {
          const item = newData.todo.shift();
          if (item) {
            newData.inProgress.push(item);
          }
        }
        if (newData.inProgress.length > 0 && Math.random() > 0.8) {
          const item = newData.inProgress.shift();
          if (item) {
            newData.done.push(item);
          }
        }
        return newData;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

 const columns: { key: keyof typeof boardData; title: string; color: string; border: string }[] = [
  { key: 'todo', title: 'To Do', color: 'from-red-500/20 to-red-600/20', border: 'border-red-500/30' },
  { key: 'inProgress', title: 'In Progress', color: 'from-yellow-500/20 to-yellow-600/20', border: 'border-yellow-500/30' },
  { key: 'done', title: 'Done', color: 'from-green-500/20 to-green-600/20', border: 'border-green-500/30' }
];

  return (
    <div className="relative w-80 h-80 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl p-4 overflow-hidden border border-slate-700/50">
      <div className="flex items-center space-x-2 mb-4">
        <KanbanSquare className="w-5 h-5 text-cyan-400" />
        <h3 className="text-white font-semibold text-sm">Project Board</h3>
      </div>

      <div className="grid grid-cols-3 gap-2 h-full">
        {columns.map((column) => (
          <div key={column.key} className={`bg-gradient-to-b ${column.color} rounded-lg p-2 border ${column.border}`}>
            <h4 className="text-xs font-medium text-white mb-2 text-center">{column.title}</h4>
            <div className="space-y-2">
              <AnimatePresence>
                {boardData[column.key].map((item: { id: React.Key | null | undefined; title: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | React.ReactPortal | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; assignee: string | number | bigint | boolean | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined; }) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-slate-800 rounded-lg p-2 cursor-move"
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileDrag={{ scale: 1.05, rotate: 5 }}
                  >
                    <div className="text-xs text-white font-medium mb-1">{item.title}</div>
                    <div className="flex items-center space-x-1">
                      <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center text-xs text-white">
                        {typeof item.assignee === 'string' && item.assignee ? item.assignee[0] : ''}
                      </div>
                      <span className="text-xs text-slate-400">{item.assignee}</span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>

      {/* Team Members */}
      <div className="absolute bottom-2 left-2 flex space-x-1">
        {['A', 'S', 'M', 'E'].map((initial, idx) => (
          <motion.div
            key={initial}
            className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-xs text-white"
            animate={{ 
              y: [0, -2, 0],
              boxShadow: [
                '0 0 0 rgba(59, 130, 246, 0.4)',
                '0 0 10px rgba(59, 130, 246, 0.6)',
                '0 0 0 rgba(59, 130, 246, 0.4)'
              ]
            }}
            transition={{ duration: 2, delay: idx * 0.2, repeat: Infinity }}
          >
            {initial}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Real-time Communication Animation
export const RealTimeCommunicationAnimation = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alex', message: 'Hey team! Ready for the sprint?', time: '10:30', isOwn: false },
    { id: 2, user: 'You', message: 'Absolutely! Just reviewed the requirements.', time: '10:32', isOwn: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [notifications, setNotifications] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        const newMessages = [
          'Great! Let\'s discuss the API endpoints.',
          'I\'ll handle the frontend components.',
          'Perfect! I\'ll work on the database schema.',
          'Should we schedule a code review for tomorrow?',
          'Sounds good! I\'ll create the PR today.'
        ];
        
        const users = ['Sarah', 'Mike', 'Emma'];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomMessage = newMessages[Math.floor(Math.random() * newMessages.length)];
        
        setMessages(prev => [
          ...prev.slice(-4), // Keep only last 4 messages
          {
            id: Date.now(),
            user: randomUser,
            message: randomMessage,
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            isOwn: false
          }
        ]);
        setIsTyping(false);
        setNotifications(prev => prev + 1);
      }, 2000);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-80 h-80 bg-gradient-to-br from-slate-900/90 to-slate-800/90 rounded-2xl overflow-hidden border border-slate-700/50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 p-4 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-green-400" />
            <span className="text-white font-semibold text-sm">Team Chat</span>
          </div>
          <div className="flex items-center space-x-2">
            <motion.div
              className="relative"
              animate={{ scale: notifications > 0 ? [1, 1.2, 1] : 1 }}
              transition={{ duration: 0.3 }}
            >
              <Bell className="w-4 h-4 text-slate-400" />
              {notifications > 0 && (
                <motion.div
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-xs text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  {notifications}
                </motion.div>
              )}
            </motion.div>
            <div className="flex -space-x-1">
              {['A', 'S', 'M', 'E'].map((initial, idx) => (
                <motion.div
                  key={initial}
                  className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-xs text-white border-2 border-slate-800"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    borderColor: ['rgba(34, 197, 94, 0.5)', 'rgba(34, 197, 94, 1)', 'rgba(34, 197, 94, 0.5)']
                  }}
                  transition={{ duration: 2, delay: idx * 0.3, repeat: Infinity }}
                >
                  {initial}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 space-y-3 h-64 overflow-y-auto">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-3 py-2 rounded-lg ${
                msg.isOwn 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
                  : 'bg-slate-700 text-slate-200'
              }`}>
                {!msg.isOwn && (
                  <div className="text-xs font-medium text-slate-400 mb-1">{msg.user}</div>
                )}
                <div className="text-sm">{msg.message}</div>
                <div className="text-xs opacity-70 mt-1">{msg.time}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="flex justify-start"
            >
              <div className="bg-slate-700 px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  {[1, 2, 3].map((dot) => (
                    <motion.div
                      key={dot}
                      className="w-2 h-2 bg-slate-400 rounded-full"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 1, delay: dot * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Online Status */}
      <motion.div
        className="absolute bottom-4 right-4 flex items-center space-x-1 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-xs text-green-400">4 online</span>
      </motion.div>
    </div>
  );
};

// Main Features Component
const features = [
  {
    title: "AI-Powered Matching",
    desc: "Connect with developers based on skills, interests, and experience using advanced AI algorithms.",
    component: AIMatchingAnimation,
    bg: "from-blue-900/60 via-blue-800/30 to-blue-900/10",
    glow: "bg-blue-500/20",
  },
  {
    title: "Profile & Portfolio",
    desc: "Showcase your skills, experience, and projects. Import from GitHub/GitLab and track your growth.",
    component: ProfilePortfolioAnimation,
    bg: "from-purple-900/60 via-purple-800/30 to-purple-900/10",
    glow: "bg-purple-500/20",
  },
  {
    title: "Project Collaboration",
    desc: "Create project workspaces, manage tasks with Kanban boards, and invite teammates.",
    component: ProjectCollaborationAnimation,
    bg: "from-cyan-900/60 via-cyan-800/30 to-cyan-900/10",
    glow: "bg-cyan-500/20",
  },
  {
    title: "Real-time Communication",
    desc: "Message collaborators instantly with real-time chat and notifications.",
    component: RealTimeCommunicationAnimation,
    bg: "from-green-900/60 via-green-800/30 to-green-900/10",
    glow: "bg-green-500/20",
  },
];

export default function FeaturesOverview() {
  return (
    <main className="flex flex-col items-center w-full max-w-6xl mx-auto py-16 px-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 min-h-screen">
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
          const AnimationComponent = feature.component;
          
          return (
            <motion.div
              key={feature.title}
              className={`
                flex flex-col lg:flex-row items-center justify-between gap-8
                ${!isEven ? "lg:flex-row-reverse" : ""}
              `}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.06 }}
              viewport={{ once: true }}
            >
              {/* Text Section */}
              <div className="flex-1 space-y-4">
                <h3 className="font-semibold text-2xl lg:text-3xl text-white">{feature.title}</h3>
                <p className="text-lg text-gray-300 leading-relaxed">{feature.desc}</p>
                
                {/* Feature highlights */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {idx === 0 && ['Smart Matching', 'Skill Analysis', 'Real-time Updates'].map(highlight => (
                    <span key={highlight} className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm border border-blue-500/30">
                      {highlight}
                    </span>
                  ))}
                  {idx === 1 && ['GitHub Sync', 'Project Showcase', 'Growth Tracking'].map(highlight => (
                    <span key={highlight} className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30">
                      {highlight}
                    </span>
                  ))}
                  {idx === 2 && ['Collaboration', 'Task Management', 'Project Boards'].map(highlight => (
                    <span key={highlight} className="px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-sm border border-cyan-500/30">
                      {highlight}
                    </span>
                  ))}
                  {idx === 3 && ['Instant Messaging', 'Notifications', 'Real-time Chat'].map(highlight => (
                    <span key={highlight} className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm border border-green-500/30">
                      {highlight}
                    </span>
                  ))}
                </div>
              </div>
              {/* Animation Section */}
              <div className="flex-1">
                <AnimationComponent />
              </div>
            </motion.div>
          );
        })}
      </div>
    </main>
  );
}