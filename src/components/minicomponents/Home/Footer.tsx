"use client";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { 
  Github, 
  Twitter, 
  Linkedin, 
  Mail, 
  MapPin, 
  Phone, 
  Globe, 
  Code2,
  Heart,
  Coffee,
  Rocket,
  Users,
  BookOpen,
  Shield,
  HelpCircle,
  FileText,
  Zap,
  Star,
  ExternalLink,
  ArrowRight,
  Send,
  CheckCircle2,
  Sparkles,
  User,
  Award,
  Brain,
  Target
} from "lucide-react";

const Footer = () => {
  const footerRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.2 });
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail("");
      setTimeout(() => setIsSubscribed(false), 3000);
    }
  };

  const footerLinks = {
    product: [
      { name: "Features", href: "#features" },
      { name: "Pricing", href: "#pricing" },
      { name: "Integrations", href: "#integrations" },
      { name: "API Documentation", href: "#api-docs" },
      { name: "Changelog", href: "#changelog" },
      { name: "Roadmap", href: "#roadmap" }
    ],
    developers: [
      { name: "Getting Started", href: "#docs" },
      { name: "Developer Guide", href: "#guide" },
      { name: "Code Examples", href: "#examples" },
      { name: "SDKs & Tools", href: "#sdks" },
      { name: "Community Forum", href: "#forum" },
      { name: "Open Source", href: "#opensource" }
    ],
    company: [
      { name: "About Us", href: "#about" },
      { name: "Careers", href: "#careers" },
      { name: "Press Kit", href: "#press" },
      { name: "Blog", href: "#blog" },
      { name: "Contact", href: "#contact" },
      { name: "Partners", href: "#partners" }
    ],
    legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "Security", href: "#security" },
      { name: "Compliance", href: "#compliance" },
      { name: "GDPR", href: "#gdpr" }
    ]
  };

  const socialLinks = [
    { name: "GitHub", icon: Github, href: "https://github.com", color: "hover:text-gray-900 dark:hover:text-gray-100" },
    { name: "Twitter", icon: Twitter, href: "https://twitter.com", color: "hover:text-blue-400" },
    { name: "LinkedIn", icon: Linkedin, href: "https://linkedin.com", color: "hover:text-blue-600" },
    { name: "Email", icon: Mail, href: "mailto:contact@devconnect.com", color: "hover:text-green-500" }
  ];

  const stats = [
    { label: "Active Developers", value: "10K+", icon: Users },
    { label: "Projects Created", value: "25K+", icon: Code2 },
    { label: "Successful Matches", value: "5K+", icon: Target },
    { label: "Code Commits", value: "1M+", icon: Github }
  ];

  return (
    <footer 
      ref={footerRef}
      className="relative bg-gradient-to-b from-background via-muted/20 to-card border-t border-border"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        
        {/* Floating Code Elements */}
        {['{', '}', '<', '>', '/', '\\'].map((symbol, index) => (
          <motion.div
            key={symbol}
            className="absolute text-muted-foreground/5 text-4xl font-mono"
            style={{
              left: `${10 + (index * 15)}%`,
              top: `${20 + (index % 2) * 40}%`,
            }}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.3, 0.1]
            }}
            transition={{
              duration: 20 + index * 2,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {symbol}
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16">
       

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info & Newsletter */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="flex items-center gap-3 mb-6"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">DevConnect</span>
            </motion.div>

            <p className="text-muted-foreground mb-6 leading-relaxed">
              Connecting developers worldwide to build the future of technology together. 
              Join our community of passionate creators and innovators.
            </p>

            {/* Newsletter Signup */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-foreground mb-3">Stay Updated</h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-muted/50 border border-border/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    required
                  />
                  {isSubscribed && (
                    <motion.div
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </motion.div>
                  )}
                </div>
                <motion.button
                  type="submit"
                  className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 font-medium"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={isSubscribed}
                >
                  {isSubscribed ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Subscribed!
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Subscribe
                    </>
                  )}
                </motion.button>
              </form>
            </div>

           
          </motion.div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 + categoryIndex * 0.1 }}
            >
              <h4 className="text-lg font-semibold text-foreground mb-4 capitalize">
                {category === 'developers' ? 'For Developers' : category}
              </h4>
              <ul className="space-y-3">
                {links.map((link, linkIndex) => (
                  <motion.li 
                    key={link.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: 0.4 + categoryIndex * 0.1 + linkIndex * 0.05 }}
                  >
                    <motion.a
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                      whileHover={{ x: 5 }}
                    >
                      <span>{link.name}</span>
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
         <motion.div 
          className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border/30"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
        >
          <div className="flex flex-col md:flex-row items-center gap-4 mb-4 md:mb-0">
            <p className="text-muted-foreground text-sm">
              © 2025 DevConnect. Made with{" "}
              <motion.span
                className="text-red-500 inline-block"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ♥
              </motion.span>{" "}
              by developers, for developers.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>🌟 Open Source</span>
              <span>🚀 Always Improving</span>
              <span>🔒 Privacy First</span>
            </div>
            {/* Meet Developer Button */}
            <a
              href="/about-me"
              className="ml-0 md:ml-6 px-5 py-2 rounded-lg bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:bg-primary/90 transition-all duration-200"
            >
              <User className="w-4 h-4" />
              Meet Developer
            </a>
          </div>
          {/* Social Links */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 1 }}
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-3 bg-muted/50 rounded-lg border border-border/30 text-muted-foreground transition-all duration-300 ${social.color} hover:border-primary/50`}
                whileHover={{ scale: 1.1, y: -3 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 1.1 + index * 0.1, type: "spring", stiffness: 200 }}
              >
                <social.icon className="w-5 h-5" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;