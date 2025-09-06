'use client';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  Github,
  Linkedin,
  Twitter,
  Mail,
  Heart,
  Code,
  Coffee,
  Users,
  Star,
  MapPin,
  Calendar,
  Zap,
  Target,
  Sparkles,
  ArrowUpRight,
  Quote
} from 'lucide-react';
import Image from 'next/image';

const AboutMe = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const isHeroInView = useInView(heroRef, { once: true, amount: 0.3 });
  const isJourneyInView = useInView(journeyRef, { once: true, amount: 0.2 });
  
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const socialLinks = [
    {
      name: 'GitHub',
      icon: <Github className="w-5 h-5" />,
      url: 'https://github.com/yourusername',
      color: 'hover:text-foreground'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      url: 'https://linkedin.com/in/yourusername',
      color: 'hover:text-primary'
    },
    {
      name: 'Twitter',
      icon: <Twitter className="w-5 h-5" />,
      url: 'https://twitter.com/yourusername',
      color: 'hover:text-primary'
    },
    {
      name: 'Email',
      icon: <Mail className="w-5 h-5" />,
      url: 'mailto:your.email@example.com',
      color: 'hover:text-accent-foreground'
    }
  ];

  const stats = [
    { value: '2+', label: 'Years Coding', icon: <Code className="w-5 h-5" /> },
    { value: '50+', label: 'Projects Built', icon: <Target className="w-5 h-5" /> },
    { value: '∞', label: 'Cups of Coffee', icon: <Coffee className="w-5 h-5" /> },
    { value: '1K+', label: 'Lines of Code', icon: <Zap className="w-5 h-5" /> }
  ];

  const milestones = [
    {
      year: '2022',
      title: 'The Beginning',
      description: 'Started my coding journey with curiosity and determination',
      icon: <Sparkles className="w-5 h-5" />
    },
    {
      year: '2023',
      title: 'First Projects',
      description: 'Built my first web applications and discovered my passion',
      icon: <Code className="w-5 h-5" />
    },
    {
      year: '2024',
      title: 'Growing Skills',
      description: 'Mastered modern frameworks and development practices',
      icon: <Target className="w-5 h-5" />
    },
    {
      year: '2025',
      title: 'DevCollab Born',
      description: 'Created this platform to connect developers worldwide',
      icon: <Users className="w-5 h-5" />
    }
  ];

  return (
    <div ref={containerRef} className="min-h-screen bg-background">
      {/* Hero Section */}
      <motion.section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ y: heroY, opacity: heroOpacity }}
      >
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Floating Elements */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/30 rounded-full"
              animate={{
                y: [0, -20, 0],
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.4
              }}
              style={{
                left: `${10 + i * 10}%`,
                top: `${20 + (i % 3) * 20}%`
              }}
            />
          ))}
        </div>

        <div className="relative z-10 container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            {/* Profile Image */}
            <motion.div
              className="relative mx-auto mb-8"
              initial={{ scale: 0, rotate: -180 }}
              animate={isHeroInView ? { scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <div className="relative w-48 h-48 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full p-1 animate-spin" style={{ animationDuration: '3s' }}>
                  <div className="w-full h-full bg-background rounded-full p-2">
                    <div className="relative w-full h-full bg-muted rounded-full overflow-hidden">
                      {/* Placeholder for your photo */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/20 to-accent/20">
                        <motion.div
                          className="text-6xl"
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          👨‍💻
                        </motion.div>
                      </div>
                      {/* Replace with your actual photo */}
                      {/* <Image
                        src="/your-photo.jpg"
                        alt="Your Name"
                        fill
                        className="object-cover"
                        onLoad={() => setImageLoaded(true)}
                      /> */}
                    </div>
                  </div>
                </div>
                
                {/* Status Badge */}
                <motion.div
                  className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                  initial={{ scale: 0 }}
                  animate={isHeroInView ? { scale: 1 } : {}}
                  transition={{ delay: 0.5, duration: 0.4 }}
                >
                  <div className="w-2 h-2 bg-primary-foreground rounded-full animate-pulse" />
                  Available
                </motion.div>
              </div>
            </motion.div>

            {/* Hero Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <motion.h1
                className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Hi, I'm Rameswar 👋
              </motion.h1>

              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                A passionate{' '}
                <span className="text-primary font-semibold">Frontend Developer</span>{' '}
                who believes in the power of collaboration
              </motion.p>

              {/* Location & Info */}
              <motion.div
                className="flex items-center justify-center gap-6 text-muted-foreground mb-8"
                initial={{ opacity: 0 }}
                animate={isHeroInView ? { opacity: 1 } : {}}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>India</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Available for projects</span>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div
                className="flex items-center justify-center gap-4 mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.7, duration: 0.6 }}
              >
                {socialLinks.map((link, index) => (
                  <motion.a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl text-muted-foreground ${link.color} transition-all duration-300 hover:scale-110 hover:border-primary/30`}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
                  >
                    {link.icon}
                  </motion.a>
                ))}
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 30 }}
                animate={isHeroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.9, duration: 0.6 }}
              >
                {stats.map((stat, index) => (
                  <motion.div
                    key={index}
                    className="text-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={isHeroInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 1 + index * 0.1, duration: 0.4 }}
                  >
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-xl mb-2 text-primary">
                      {stat.icon}
                    </div>
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            {/* Thank You Message */}
            <motion.div
              className="relative mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
                <div className="absolute top-4 left-4 text-primary/20">
                  <Quote className="w-8 h-8" />
                </div>
                
                <motion.div
                  className="text-center"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Heart className="w-6 h-6 text-destructive animate-pulse" />
                    <h3 className="text-2xl font-bold">Thank You!</h3>
                    <Heart className="w-6 h-6 text-destructive animate-pulse" />
                  </div>
                  
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    To everyone using DevCollab - you make this journey worthwhile. As a{' '}
                    <span className="text-primary font-semibold">solo developer</span>, building this platform has been both challenging and incredibly rewarding. Your support and feedback drive me to create better solutions for our developer community.
                  </p>
                </motion.div>
              </div>
            </motion.div>

            {/* About Content */}
            <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <h2 className="text-3xl font-bold mb-6">My Story</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    I started my coding journey like many others - with curiosity and a laptop. What began as late-night tutorials and countless Stack Overflow searches has evolved into a passion for creating meaningful digital experiences.
                  </p>
                  
                  <p>
                    As a <span className="text-primary font-semibold">self-taught developer</span>, I understand the challenges of learning in isolation. The struggle to find mentors, the difficulty in getting code reviews, and the loneliness of debugging at 2 AM - I've been there.
                  </p>
                  
                  <p>
                    This personal experience inspired DevCollab. I wanted to create a space where developers could find their tribe, share knowledge, and build amazing things together. Because the best code is written when we code together.
                  </p>
                </div>
              </motion.div>

              <motion.div
                className="relative"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Code className="w-5 h-5 text-primary" />
                    What Drives Me
                  </h3>
                  
                  <div className="space-y-3">
                    {[
                      { text: 'Building solutions that solve real problems', icon: '🎯' },
                      { text: 'Creating beautiful, intuitive user experiences', icon: '✨' },
                      { text: 'Connecting developers worldwide', icon: '🌍' },
                      { text: 'Learning something new every day', icon: '📚' }
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.4 }}
                        viewport={{ once: true }}
                      >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-sm">{item.text}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey Timeline */}
      <section ref={journeyRef} className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={isJourneyInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">My Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              From curious beginner to building platforms that connect developers worldwide
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto">
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                className="relative flex items-center gap-6 mb-8 last:mb-0"
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isJourneyInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                {/* Timeline Line */}
                {index < milestones.length - 1 && (
                  <div className="absolute left-6 top-16 w-0.5 h-16 bg-border" />
                )}
                
                {/* Icon */}
                <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary border-2 border-primary/20">
                  {milestone.icon}
                </div>
                
                {/* Content */}
                <div className="flex-1 bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-primary bg-primary/10 px-2 py-1 rounded">
                      {milestone.year}
                    </span>
                    <h3 className="font-semibold">{milestone.title}</h3>
                  </div>
                  <p className="text-muted-foreground text-sm">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <motion.div
              className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-8 h-8 text-primary" />
            </motion.div>
            
            <h2 className="text-3xl font-bold mb-4">Let's Connect & Build Together</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Whether you want to collaborate on a project, share feedback about DevCollab, 
              or just say hi - I'd love to hear from you!
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              {socialLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-card border border-border rounded-xl hover:border-primary/30 transition-all duration-300 hover:scale-105"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.icon}
                  <span className="font-medium">{link.name}</span>
                  <ArrowUpRight className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutMe;