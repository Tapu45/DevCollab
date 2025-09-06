"use client";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { 
  Github, 
  GitBranch, 
  Database, 
  Cloud, 
  Code2, 
  Zap, 
  Workflow, 
  Link2,
  CheckCircle2,
  ArrowRight,
  Settings,
  Layers,
  Globe,
  Shield,
  Target,
  RefreshCw,
  Play,
  Download,
  Upload,
  Monitor,
  Smartphone,
  Cpu,
  HardDrive,
  Server,
  Terminal,
  FileCode,
  Package,
  Plug,
  ExternalLink
} from "lucide-react";

// Integration categories and tools
const integrationCategories = [
  {
    id: "version-control",
    title: "Version Control",
    description: "Seamlessly sync your repositories and contributions",
    icon: GitBranch,
    color: "from-green-500 to-emerald-500",
    tools: [
      {
        name: "GitHub",
        logo: "🐙",
        description: "Import repos, sync contributions, and showcase your work",
        features: ["Repository sync", "Contribution analysis", "Auto skill detection", "Project import"],
        isConnected: true,
        lastSync: "2 minutes ago"
      },
      {
        name: "GitLab",
        logo: "🦊",
        description: "Connect GitLab projects and track your development journey",
        features: ["Project integration", "Merge request tracking", "CI/CD insights", "Team collaboration"],
        isConnected: false,
        lastSync: null
      },
      {
        name: "Bitbucket",
        logo: "🪣",
        description: "Integrate Atlassian workflow with collaboration features",
        features: ["Repository management", "Pull request analytics", "Branch tracking", "Team insights"],
        isConnected: false,
        lastSync: null
      }
    ]
  },
  {
    id: "project-management",
    title: "Project Management",
    description: "Integrate with tools you already use for project tracking",
    icon: Workflow,
    color: "from-blue-500 to-cyan-500",
    tools: [
      {
        name: "Jira",
        logo: "📋",
        description: "Sync tasks and track project progress across teams",
        features: ["Issue tracking", "Sprint planning", "Progress sync", "Team coordination"],
        isConnected: true,
        lastSync: "1 hour ago"
      },
      {
        name: "Trello",
        logo: "📚",
        description: "Connect boards and streamline task management",
        features: ["Board integration", "Card synchronization", "Due date tracking", "Team collaboration"],
        isConnected: false,
        lastSync: null
      },
      {
        name: "Notion",
        logo: "📝",
        description: "Import documentation and project planning",
        features: ["Documentation sync", "Project templates", "Knowledge base", "Team wikis"],
        isConnected: true,
        lastSync: "5 minutes ago"
      }
    ]
  },
  {
    id: "cloud-services",
    title: "Cloud & Infrastructure",
    description: "Monitor deployments and infrastructure across platforms",
    icon: Cloud,
    color: "from-purple-500 to-indigo-500",
    tools: [
      {
        name: "AWS",
        logo: "☁️",
        description: "Track deployments and monitor cloud infrastructure",
        features: ["Deployment tracking", "Resource monitoring", "Cost analysis", "Performance metrics"],
        isConnected: false,
        lastSync: null
      },
      {
        name: "Vercel",
        logo: "▲",
        description: "Showcase live deployments and performance metrics",
        features: ["Deployment status", "Performance analytics", "Domain management", "Build logs"],
        isConnected: true,
        lastSync: "30 seconds ago"
      },
      {
        name: "Docker",
        logo: "🐳",
        description: "Container management and deployment insights",
        features: ["Container tracking", "Image management", "Deployment logs", "Registry integration"],
        isConnected: false,
        lastSync: null
      }
    ]
  },
  {
    id: "communication",
    title: "Communication",
    description: "Stay connected with integrated messaging and collaboration",
    icon: Link2,
    color: "from-orange-500 to-red-500",
    tools: [
      {
        name: "Slack",
        logo: "💬",
        description: "Bridge team communication with project updates",
        features: ["Channel integration", "Notification sync", "File sharing", "Team coordination"],
        isConnected: true,
        lastSync: "Just now"
      },
      {
        name: "Discord",
        logo: "🎮",
        description: "Connect gaming and development communities",
        features: ["Server integration", "Voice channels", "Community building", "Real-time chat"],
        isConnected: false,
        lastSync: null
      },
      {
        name: "Microsoft Teams",
        logo: "👥",
        description: "Enterprise collaboration and video conferencing",
        features: ["Meeting integration", "File collaboration", "Team channels", "Calendar sync"],
        isConnected: false,
        lastSync: null
      }
    ]
  }
];

// Real-time integration demo component
const IntegrationDemo = ({ category }: { category: any }) => {
  const [activeDemo, setActiveDemo] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDemo(prev => (prev + 1) % category.tools.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [category.tools.length]);

  const handleConnect = async (toolIndex: number) => {
    setIsLoading(true);
    // Simulate connection process
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color} text-white`}>
          <category.icon className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{category.title}</h3>
          <p className="text-sm text-muted-foreground">{category.description}</p>
        </div>
      </div>

      <div className="space-y-4">
        {category.tools.map((tool: any, index: number) => (
          <motion.div
            key={tool.name}
            className={`p-4 rounded-lg border transition-all duration-300 ${
              activeDemo === index 
                ? 'border-primary bg-primary/5' 
                : 'border-border/30 bg-muted/20'
            }`}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tool.logo}</span>
                <div>
                  <h4 className="font-medium text-foreground">{tool.name}</h4>
                  <p className="text-xs text-muted-foreground">{tool.description}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {tool.isConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-green-600 font-medium">Connected</span>
                    </div>
                    <motion.button
                      className="p-1 text-muted-foreground hover:text-foreground"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Settings className="w-4 h-4" />
                    </motion.button>
                  </div>
                ) : (
                  <motion.button
                    className="px-3 py-1 bg-primary text-primary-foreground text-xs rounded-md hover:bg-primary/90 transition-colors"
                    onClick={() => handleConnect(index)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <RefreshCw className="w-3 h-3 animate-spin" />
                    ) : (
                      'Connect'
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {tool.isConnected && tool.lastSync && (
              <div className="text-xs text-muted-foreground mb-3">
                Last sync: {tool.lastSync}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {tool.features.map((feature: string, idx: number) => (
                <motion.div
                  key={feature}
                  className="flex items-center gap-2 text-xs"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <CheckCircle2 className="w-3 h-3 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Data flow visualization
const DataFlowDemo = () => {
  const [activeFlow, setActiveFlow] = useState(0);
  
  const dataFlows = [
    {
      source: "GitHub",
      target: "DevConnect",
      data: "Repository Data",
      icon: Github,
      color: "text-green-500"
    },
    {
      source: "DevConnect",
      target: "AI Engine",
      data: "Skill Analysis",
      icon: Cpu,
      color: "text-blue-500"
    },
    {
      source: "AI Engine",
      target: "Matching",
      data: "Compatibility Score",
      icon: Target,
      color: "text-purple-500"
    },
    {
      source: "Projects",
      target: "Portfolio",
      data: "Showcase Data",
      icon: Monitor,
      color: "text-orange-500"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow(prev => (prev + 1) % dataFlows.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [dataFlows.length]);

  return (
    <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-6 text-center">
        Real-time Data Synchronization
      </h3>
      
      <div className="relative">
        <svg className="w-full h-32" viewBox="0 0 400 120">
          {dataFlows.map((flow, index) => {
            const isActive = activeFlow === index;
            const x1 = 50 + (index * 80);
            const x2 = x1 + 60;
            
            return (
              <g key={index}>
                {/* Connection line */}
                <motion.line
                  x1={x1}
                  y1="60"
                  x2={x2}
                  y2="60"
                  stroke="currentColor"
                  strokeWidth="2"
                  className={isActive ? "text-primary" : "text-muted-foreground/30"}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: isActive ? 1 : 0.3 }}
                  transition={{ duration: 1 }}
                />
                
                {/* Animated data packet */}
                {isActive && (
                  <motion.circle
                    cx={x1}
                    cy="60"
                    r="3"
                    fill="currentColor"
                    className="text-primary"
                    animate={{ cx: [x1, x2] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                )}
                
                {/* Arrow */}
                <polygon
                  points={`${x2-5},55 ${x2},60 ${x2-5},65`}
                  fill="currentColor"
                  className={isActive ? "text-primary" : "text-muted-foreground/30"}
                />
              </g>
            );
          })}
        </svg>
        
        {/* Flow labels */}
        <div className="flex justify-between mt-4">
          {dataFlows.map((flow, index) => (
            <motion.div
              key={index}
              className={`text-center ${
                activeFlow === index ? "scale-110" : "scale-100"
              } transition-transform`}
            >
              <flow.icon className={`w-6 h-6 mx-auto mb-1 ${
                activeFlow === index ? flow.color : "text-muted-foreground"
              }`} />
              <div className="text-xs font-medium text-foreground">{flow.source}</div>
              <div className="text-xs text-muted-foreground">{flow.data}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Tech Integration Component
const TechIntegration = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(titleRef, { once: true, amount: 0.3 });
  
  const [activeCategory, setActiveCategory] = useState(0);

  // Auto-rotate categories
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCategory(prev => (prev + 1) % integrationCategories.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  return (
    <motion.section 
      ref={containerRef}
      className="relative py-20 bg-gradient-to-b from-background via-muted/5 to-background overflow-hidden"
      style={{ opacity }}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        
        {/* Floating Integration Icons */}
        {[Database, Server, Cloud, Terminal, Package, Plug].map((Icon, index) => (
          <motion.div
            key={index}
            className="absolute text-muted-foreground/10"
            style={{
              left: `${15 + (index * 12)}%`,
              top: `${20 + (index % 2) * 30}%`,
            }}
            animate={{
              y: [0, -15, 0],
              rotate: [0, 180, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 12 + index * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            <Icon className="w-6 h-6" />
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
            <Plug className="w-4 h-4" />
            Technology Integration
          </motion.div>

          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-6 text-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Connect Your Entire{" "}
            <span className="text-primary">Development Ecosystem</span>
          </motion.h2>

          <motion.p 
            className="text-lg text-muted-foreground leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            DevConnect seamlessly integrates with the tools you already love. 
            From version control to project management, bring your entire workflow together 
            in one collaborative platform.
          </motion.p>
        </motion.div>

        {/* Category Navigation */}
        <motion.div 
          className="flex flex-wrap justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          {integrationCategories.map((category, index) => (
            <motion.button
              key={category.id}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl border transition-all duration-300 ${
                activeCategory === index
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-card/50 text-muted-foreground hover:text-foreground hover:border-primary/50'
              }`}
              onClick={() => setActiveCategory(index)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <category.icon className="w-5 h-5" />
              <span className="font-medium">{category.title}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Integration Demo */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.5 }}
            >
              <IntegrationDemo category={integrationCategories[activeCategory]} />
            </motion.div>
          </AnimatePresence>

          <motion.div
            style={{ y }}
          >
            <DataFlowDemo />
          </motion.div>
        </motion.div>

        {/* Integration Benefits */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          {[
            {
              icon: Zap,
              title: "Instant Synchronization",
              description: "Real-time data sync across all your connected tools and platforms",
              color: "text-yellow-500"
            },
            {
              icon: Shield,
              title: "Secure Connections",
              description: "Enterprise-grade security with OAuth 2.0 and encrypted data transfer",
              color: "text-green-500"
            },
            {
              icon: Globe,
              title: "Universal Compatibility",
              description: "Works with 50+ popular development tools and services",
              color: "text-blue-500"
            }
          ].map((benefit, index) => (
            <motion.div
              key={benefit.title}
              className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, borderColor: "var(--primary)" }}
            >
              <div className={`inline-flex p-3 rounded-xl bg-muted/50 mb-4 ${benefit.color}`}>
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="max-w-2xl mx-auto p-8 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/10 rounded-2xl backdrop-blur-sm">
            <h3 className="text-xl font-bold text-foreground mb-4">
              Ready to Supercharge Your Development Workflow?
            </h3>
            <p className="text-muted-foreground mb-6">
              Connect your existing tools and let DevConnect transform how you collaborate. 
              Set up integrations in under 2 minutes with our one-click connection system.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connect Your Tools
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                className="border border-border text-foreground px-6 py-3 rounded-lg font-medium hover:bg-accent transition-colors inline-flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                View All Integrations
                <ExternalLink className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default TechIntegration;