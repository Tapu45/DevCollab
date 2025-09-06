"use client";

import { motion, easeInOut } from "framer-motion";
import { 
  Home, 
  ArrowLeft, 
  Coffee, 
  Code, 
  GitBranch, 
  Zap,
  Clock,
  Users,
  Hand,
  Skull,
  AlertTriangle,
  Bug
} from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  const floatingAnimation = {
    y: [-10, 10, -10],
    transition: {
      duration: 3,
      repeat: Infinity as number,
      ease: easeInOut
    }
  };

  const glitchAnimation = {
    x: [0, -2, 2, 0],
    transition: {
      duration: 0.3,
      repeat: Infinity as number,
      repeatType: "reverse" as const
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-accent/10 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 3,
              repeat: Infinity as number,
              delay: Math.random() * 2
            }}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Main 404 with glitch effect */}
        <motion.div
          className="relative mb-8"
          animate={glitchAnimation}
        >
          <h1 className="text-9xl md:text-[12rem] font-bold text-primary/80 relative">
            404
            <motion.div
              className="absolute inset-0 text-destructive/50"
              animate={{
                x: [0, 3, -3, 0],
                opacity: [0, 0.7, 0]
              }}
              transition={{
                duration: 0.2,
                repeat: Infinity as number,
                repeatDelay: 2
              }}
            >
              404
            </motion.div>
          </h1>
        </motion.div>

        {/* Floating death elements */}
        <motion.div
          className="absolute top-20 right-10 text-6xl"
          animate={floatingAnimation}
        >
          <Skull className="text-destructive/60" />
        </motion.div>

        {/* Main message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-destructive to-primary bg-clip-text text-transparent">
            Congratulations! You Broke Something! 🎉
          </h2>
          
          <div className="max-w-2xl mx-auto space-y-4 text-lg text-muted-foreground">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="leading-relaxed"
            >
              Oh look, another brilliant user who thinks clicking <span className="text-destructive font-semibold">random URLs</span> 
              is a valid life strategy. 🤡 This page doesn't exist because I haven't built it yet, genius!
            </motion.p>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="leading-relaxed"
            >
              I know, I know... "But the internet should have EVERYTHING!" Well, newsflash: 
              <span className="text-primary font-semibold"> Rome wasn't built in a day</span>, 
              and neither is my sanity! 🏛️💀
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center gap-2 text-destructive font-medium"
            >
              <Hand className="w-5 h-5" />
              <span>I'm ONE person, not Amazon's entire dev team!</span>
              <Hand className="w-5 h-5 scale-x-[-1]" />
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="italic text-sm"
            >
              God blessed me with <span className="text-destructive font-semibold">2 hands</span> and 
              <span className="text-accent font-semibold"> 1 brain</span> (on good days). 
              Meanwhile, you expect miracles faster than a <span className="text-primary">microwave burrito</span>! 🌯⚡
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3 }}
              className="text-muted-foreground/80 text-sm"
            >
              P.S. - While you're here being disappointed, I'm probably debugging something else that 
              <span className="text-destructive"> definitely worked yesterday</span>. 
              Such is the circle of developer life! 🔄💀
            </motion.p>
          </div>
        </motion.div>

        {/* Brutal stats cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto"
        >
          <div className="bg-card/50 backdrop-blur-sm border border-destructive/20 rounded-lg p-4">
            <Coffee className="w-8 h-8 text-destructive mx-auto mb-2" />
            <div className="text-2xl font-bold text-destructive">∞²</div>
            <div className="text-sm text-muted-foreground">Coffee Overdoses</div>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-primary/20 rounded-lg p-4">
            <Bug className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-primary">404</div>
            <div className="text-sm text-muted-foreground">Bugs Fixed Today</div>
          </div>
          
          <div className="bg-card/50 backdrop-blur-sm border border-accent/20 rounded-lg p-4">
            <AlertTriangle className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold text-accent">-5</div>
            <div className="text-sm text-muted-foreground">Hours of Sleep</div>
          </div>
        </motion.div>

        {/* Sarcastic action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90 transition-colors"
            >
              <Home className="w-5 h-5" />
              Go Home (And Stay There!)
            </motion.button>
          </Link>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.history.back()}
            className="bg-destructive text-destructive-foreground px-8 py-3 rounded-lg font-medium flex items-center gap-2 hover:bg-destructive/90 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Undo Your Mistake
          </motion.button>
        </motion.div>

        {/* Developer's cry for help */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 p-4 border border-muted rounded-lg bg-muted/10 max-w-lg mx-auto"
        >
          <p className="text-sm text-muted-foreground italic">
            "Dear Universe, I'm just one caffeine-dependent human trying to build cool stuff. 
            Please grant me <span className="text-primary">more patience</span>, 
            <span className="text-accent"> fewer bugs</span>, and 
            <span className="text-destructive">users who read documentation</span>. Amen." 🙏
          </p>
        </motion.div>

        {/* Floating chaos symbols */}
        <motion.div
          className="absolute bottom-10 left-10 text-4xl text-destructive/30"
          animate={{
            rotate: [0, 360],
            y: [-5, 5, -5]
          }}
          transition={{
            duration: 8,
            repeat: Infinity as number
          }}
        >
          <Skull />
        </motion.div>

        <motion.div
          className="absolute top-32 left-20 text-3xl text-accent/40"
          animate={{
            rotate: [0, -180, 180, 0],
            x: [-3, 3, -3]
          }}
          transition={{
            duration: 6,
            repeat: Infinity as number,
            delay: 1
          }}
        >
          <Bug />
        </motion.div>

        <motion.div
          className="absolute bottom-32 right-20 text-5xl text-primary/25"
          animate={{
            scale: [1, 1.2, 0.8, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 3,
            repeat: Infinity as number,
            delay: 0.5
          }}
        >
          <AlertTriangle />
        </motion.div>
      </div>
    </div>
  );
}