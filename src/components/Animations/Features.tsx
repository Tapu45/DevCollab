"use client";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  BrainCircuit, 
  Users, 
  Code2, 
  MessageSquare, 
  GitBranch, 
  Zap, 
  Target, 
  CheckCircle2,
  Clock,
  Star,
  TrendingUp,
  Shield,
  Globe,
  Layers,
  Database,
  Settings,
  ArrowRight,
  Github,
  Play,
  FileText,
  Calendar,
  Bell,
  Search,
  Filter,
  BarChart3,
  Workflow
} from "lucide-react";

// Enhanced Neural Network Background Component
const NeuralNetwork = ({ isActive = false }: { isActive?: boolean }) => {
  const [nodes] = useState(() => 
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      connections: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => 
        Math.floor(Math.random() * 12)
      ).filter(conn => conn !== i)
    }))
  );

  return (
    <div className="absolute inset-0 opacity-10">
      <svg className="w-full h-full">
        {/* Connection lines */}
        {nodes.map(node => 
          node.connections.map(connId => {
            const connectedNode = nodes[connId];
            return (
              <motion.line
                key={`${node.id}-${connId}`}
                x1={`${node.x}%`}
                y1={`${node.y}%`}
                x2={`${connectedNode.x}%`}
                y2={`${connectedNode.y}%`}
                stroke="currentColor"
                strokeWidth="1"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: isActive ? 1 : 0.3,
                  opacity: isActive ? 0.6 : 0.2
                }}
                transition={{ 
                  duration: 2,
                  ease: "easeInOut",
                  repeat: isActive ? Infinity : 0,
                  repeatType: "reverse"
                }}
              />
            );
          })
        )}
        
        {/* Nodes */}
        {nodes.map(node => (
          <motion.circle
            key={node.id}
            cx={`${node.x}%`}
            cy={`${node.y}%`}
            r="2"
            fill="currentColor"
            animate={{
              r: isActive ? [2, 4, 2] : 2,
              opacity: isActive ? [0.4, 0.8, 0.4] : 0.3
            }}
            transition={{
              duration: 2,
              repeat: isActive ? Infinity : 0,
              delay: node.id * 0.2
            }}
          />
        ))}
      </svg>
    </div>
  );
};

// AI Matching Demonstration
const AIMatchingDemo = () => {
  const [matchingState, setMatchingState] = useState('scanning');
  const [developers] = useState([
    { id: 1, name: 'Alex Chen', skills: ['React', 'Node.js'], match: 94, x: 15, y: 25 },
    { id: 2, name: 'Sarah Kim', skills: ['Python', 'AI/ML'], match: 89, x: 75, y: 20 },
    { id: 3, name: 'Mike Rodriguez', skills: ['DevOps', 'AWS'], match: 91, x: 80, y: 70 },
    { id: 4, name: 'Emma Thompson', skills: ['UI/UX', 'React'], match: 87, x: 20, y: 75 }
  ]);

  useEffect(() => {
    const sequence = ['scanning', 'analyzing', 'matching', 'complete'];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % sequence.length;
      setMatchingState(sequence[currentIndex]);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-card/80 to-muted/40 rounded-xl border border-border/50 overflow-hidden">
      <NeuralNetwork isActive={matchingState === 'analyzing'} />
      
      {/* Central AI Core */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-primary rounded-full flex items-center justify-center"
        animate={{
          scale: matchingState === 'analyzing' ? [1, 1.2, 1] : 1,
          boxShadow: matchingState === 'analyzing' 
            ? ['0 0 0 0 var(--primary)', '0 0 0 20px transparent', '0 0 0 0 var(--primary)']
            : '0 0 0 0 var(--primary)'
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <BrainCircuit className="w-6 h-6 text-primary-foreground" />
      </motion.div>

      {/* Developer Nodes */}
      {developers.map((dev, index) => (
        <motion.div
          key={dev.id}
          className="absolute w-8 h-8 bg-accent rounded-full flex items-center justify-center text-xs font-medium"
          style={{ left: `${dev.x}%`, top: `${dev.y}%` }}
          animate={{
            scale: matchingState === 'matching' && index % 2 === 0 ? [1, 1.1, 1] : 1,
            borderColor: matchingState === 'complete' ? 'var(--primary)' : 'transparent'
          }}
          transition={{ duration: 0.8, delay: index * 0.2 }}
        >
          {dev.name.split(' ').map(n => n[0]).join('')}
        </motion.div>
      ))}

      {/* Status Display */}
      <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur-sm rounded-lg px-3 py-1">
        <div className="flex items-center gap-2 text-sm">
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
          <span className="text-foreground font-medium">
            {matchingState === 'scanning' && 'Scanning profiles...'}
            {matchingState === 'analyzing' && 'Analyzing compatibility...'}
            {matchingState === 'matching' && 'Finding matches...'}
            {matchingState === 'complete' && 'Match found: 94%'}
          </span>
        </div>
      </div>
    </div>
  );
};

// Smart Portfolio Showcase
const PortfolioShowcase = () => {
  const [activeView, setActiveView] = useState(0);
  const views = ['overview', 'projects', 'activity'];

  const projects = [
    { name: 'E-commerce Platform', tech: ['React', 'Node.js', 'PostgreSQL'], status: 'Live', stars: 142 },
    { name: 'AI Dashboard', tech: ['Python', 'TensorFlow', 'Docker'], status: 'In Progress', stars: 89 },
    { name: 'Mobile App', tech: ['React Native', 'Firebase'], status: 'Planning', stars: 67 }
  ];

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-card/80 to-muted/40 rounded-xl border border-border/50 overflow-hidden">
      {/* Header Tabs */}
      <div className="flex p-3 border-b border-border/30">
        {['Overview', 'Projects', 'Activity'].map((tab, index) => (
          <motion.button
            key={tab}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              activeView === index 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveView(index)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {tab}
          </motion.button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeView === 0 && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground">Alex Chen</h4>
                <p className="text-sm text-muted-foreground">Senior Full Stack Developer</p>
              </div>
              <motion.div
                className="text-right"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="text-lg font-bold text-primary">94%</div>
                <div className="text-xs text-muted-foreground">Profile Score</div>
              </motion.div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Projects', value: '12', icon: Code2 },
                { label: 'Connections', value: '234', icon: Users },
                { label: 'Contributions', value: '1.2k', icon: GitBranch }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  className="bg-muted/50 rounded-lg p-2 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <stat.icon className="w-4 h-4 mx-auto mb-1 text-primary" />
                  <div className="text-sm font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-1">
              {['React', 'TypeScript', 'Node.js', 'AWS', 'Python'].map((skill, index) => (
                <motion.span
                  key={skill}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-md border border-primary/20"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}

        {activeView === 1 && (
          <motion.div
            key="projects"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4 space-y-2"
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.name}
                className="bg-muted/30 rounded-lg p-3 border border-border/30"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, borderColor: 'var(--primary)' }}
              >
                <div className="flex justify-between items-start mb-1">
                  <h5 className="text-sm font-medium text-foreground">{project.name}</h5>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs text-muted-foreground">{project.stars}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    project.status === 'Live' ? 'bg-green-500/20 text-green-600' :
                    project.status === 'In Progress' ? 'bg-blue-500/20 text-blue-600' :
                    'bg-orange-500/20 text-orange-600'
                  }`}>
                    {project.status}
                  </span>
                  <div className="flex gap-1">
                    {project.tech.slice(0, 2).map(tech => (
                      <span key={tech} className="text-xs text-muted-foreground">{tech}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeView === 2 && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="p-4"
          >
            <div className="grid grid-cols-7 gap-1 mb-3">
              {Array.from({ length: 28 }, (_, i) => (
                <motion.div
                  key={i}
                  className={`w-3 h-3 rounded-sm ${
                    Math.random() > 0.7 ? 'bg-primary' :
                    Math.random() > 0.5 ? 'bg-primary/60' :
                    Math.random() > 0.3 ? 'bg-primary/30' :
                    'bg-muted'
                  }`}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.02 }}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground">147 contributions in the last month</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Collaboration Workspace Demo
const CollaborationDemo = () => {
  const [tasks, setTasks] = useState({
    todo: [
      { id: 1, title: 'API Design', assignee: 'Alex', priority: 'high' },
      { id: 2, title: 'UI Components', assignee: 'Sarah', priority: 'medium' }
    ],
    progress: [
      { id: 3, title: 'Database Schema', assignee: 'Mike', priority: 'high' }
    ],
    done: [
      { id: 4, title: 'Project Setup', assignee: 'Emma', priority: 'low' }
    ]
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => {
        const newTasks = { ...prev };
        
        // Simulate task movement
        if (newTasks.todo.length > 0 && Math.random() > 0.7) {
          const task = newTasks.todo.shift();
          if (task) newTasks.progress.push(task);
        }
        
        if (newTasks.progress.length > 0 && Math.random() > 0.8) {
          const task = newTasks.progress.shift();
          if (task) newTasks.done.push(task);
        }
        
        return newTasks;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const columns = [
    { key: 'todo' as keyof typeof tasks, title: 'To Do', color: 'bg-red-500/10 border-red-500/20' },
    { key: 'progress' as keyof typeof tasks, title: 'In Progress', color: 'bg-blue-500/10 border-blue-500/20' },
    { key: 'done' as keyof typeof tasks, title: 'Done', color: 'bg-green-500/10 border-green-500/20' }
  ];

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-card/80 to-muted/40 rounded-xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-border/30">
        <div className="flex items-center gap-2">
          <Workflow className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Project Board</span>
        </div>
        <div className="flex -space-x-1">
          {['A', 'S', 'M', 'E'].map((initial, index) => (
            <motion.div
              key={initial}
              className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-xs text-primary-foreground border-2 border-background"
              animate={{ 
                y: [0, -2, 0],
                scale: [1, 1.05, 1]
              }}
              transition={{ duration: 2, delay: index * 0.2, repeat: Infinity }}
            >
              {initial}
            </motion.div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 p-3 h-48">
        {columns.map(column => (
          <div key={column.key} className={`rounded-lg p-2 border ${column.color}`}>
            <h4 className="text-xs font-medium text-foreground mb-2 text-center">{column.title}</h4>
            <div className="space-y-1">
              <AnimatePresence>
                {tasks[column.key].map((task: any) => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="bg-background rounded-md p-2 text-xs border border-border/30"
                    whileHover={{ scale: 1.02, y: -1 }}
                  >
                    <div className="font-medium text-foreground mb-1">{task.title}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">{task.assignee}</span>
                      <div className={`w-2 h-2 rounded-full ${
                        task.priority === 'high' ? 'bg-red-500' :
                        task.priority === 'medium' ? 'bg-yellow-500' :
                        'bg-green-500'
                      }`} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Real-time Communication Demo
const CommunicationDemo = () => {
  const [messages, setMessages] = useState([
    { id: 1, user: 'Alex', message: 'Ready for the code review?', time: '2:30 PM', isOwn: false },
    { id: 2, user: 'You', message: 'Yes! Just pushed the latest changes.', time: '2:32 PM', isOwn: true }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [onlineCount, setOnlineCount] = useState(4);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      
      setTimeout(() => {
        const newMessages = [
          'Great work on the API endpoints!',
          'Should we update the documentation?',
          'I\'ll handle the deployment pipeline.',
          'The tests are passing on my end.',
          'Let\'s schedule a team sync tomorrow.'
        ];
        
        const users = ['Sarah', 'Mike', 'Emma'];
        const randomUser = users[Math.floor(Math.random() * users.length)];
        const randomMessage = newMessages[Math.floor(Math.random() * newMessages.length)];
        
        setMessages(prev => [
          ...prev.slice(-3),
          {
            id: Date.now(),
            user: randomUser,
            message: randomMessage,
            time: new Date().toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit' 
            }),
            isOwn: false
          }
        ]);
        setIsTyping(false);
      }, 1500);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-64 bg-gradient-to-br from-card/80 to-muted/40 rounded-xl border border-border/50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-border/30 bg-muted/20">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-foreground">Team Chat</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <motion.div
            className="w-2 h-2 bg-green-500 rounded-full"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span>{onlineCount} online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-3 space-y-2 h-44 overflow-y-auto">
        <AnimatePresence>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-3 py-2 rounded-lg text-xs ${
                msg.isOwn 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-muted text-foreground'
              }`}>
                {!msg.isOwn && (
                  <div className="font-medium text-xs opacity-70 mb-1">{msg.user}</div>
                )}
                <div>{msg.message}</div>
                <div className="text-xs opacity-60 mt-1">{msg.time}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        <AnimatePresence>
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="flex justify-start"
            >
              <div className="bg-muted px-3 py-2 rounded-lg">
                <div className="flex space-x-1">
                  {[1, 2, 3].map(dot => (
                    <motion.div
                      key={dot}
                      className="w-1 h-1 bg-muted-foreground rounded-full"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, delay: dot * 0.2, repeat: Infinity }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Main Features Component
const FeaturesOverview = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, amount: 0.3 });

  const features = [
    {
      title: "AI-Powered Developer Matching",
      description: "Advanced algorithms analyze skills, experience, and project preferences to connect you with the perfect collaborators for your next breakthrough project.",
      component: AIMatchingDemo,
      highlights: ['Smart Compatibility Analysis', 'Skill Complementarity', 'Real-time Matching']
    },
    {
      title: "Intelligent Profile & Portfolio",
      description: "Showcase your expertise with GitHub integration, project highlights, and skill verification. Let your work speak for itself with automated portfolio generation.",
      component: PortfolioShowcase,
      highlights: ['GitHub Sync', 'Project Analytics', 'Skill Verification']
    },
    {
      title: "Seamless Project Collaboration",
      description: "From idea to deployment, manage projects with integrated tools including task boards, milestone tracking, and team coordination features.",
      component: CollaborationDemo,
      highlights: ['Kanban Boards', 'Task Management', 'Progress Tracking']
    },
    {
      title: "Real-time Team Communication",
      description: "Stay connected with your team through instant messaging, notifications, and collaboration channels designed specifically for developers.",
      component: CommunicationDemo,
      highlights: ['Instant Messaging', 'Team Channels', 'Smart Notifications']
    }
  ];

  return (
    <section 
      ref={containerRef}
      className="relative py-16 bg-gradient-to-b from-background via-muted/10 to-background overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
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
            className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4"
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <Zap className="w-4 h-4" />
            Platform Features
          </motion.div>

          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-4 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Everything You Need to{" "}
            <span className="text-primary">Collaborate & Create</span>
          </motion.h2>

          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            Built by developers, for developers. Experience the future of collaborative coding
            with tools designed to accelerate your projects and expand your network.
          </motion.p>
        </motion.div>

        {/* Features Grid */}
        <div className="space-y-20">
          {features.map((feature, index) => {
            const isEven = index % 2 === 0;
            const FeatureComponent = feature.component;
            
            return (
              <motion.div
                key={feature.title}
                className={`flex flex-col lg:flex-row items-center gap-12 ${
                  !isEven ? 'lg:flex-row-reverse' : ''
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, amount: 0.3 }}
              >
                {/* Content */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Feature Highlights */}
                  <div className="space-y-3">
                    {feature.highlights.map((highlight, idx) => (
                      <motion.div
                        key={highlight}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + idx * 0.1 }}
                        viewport={{ once: true }}
                      >
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-foreground font-medium">{highlight}</span>
                      </motion.div>
                    ))}
                  </div>

                  <motion.button
                    className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium group"
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    Learn more about this feature
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </div>

                {/* Demo Component */}
                <motion.div 
                  className="flex-1 w-full max-w-lg"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <FeatureComponent />
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Ready to Transform Your Development Journey?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join thousands of developers already collaborating, learning, and building 
              amazing projects together on our platform.
            </p>
            <motion.button
              className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get Started Free
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesOverview;