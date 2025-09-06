'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GradientBlinds from '../../Animations/GradientBlinds';

export default function HeroSection() {
  return (
    <header className="relative w-full flex flex-col items-center justify-center min-h-[130vh] py-30 overflow-hidden mb-8">
      {/* Animated Background - needs to receive pointer events */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-auto">
        <GradientBlinds
          gradientColors={['#FF9FFC', '#5227FF', '#00D4FF']}
          angle={15}
          noise={0.2}
          blindCount={16}
          blindMinWidth={60}
          spotlightRadius={0.7}
          spotlightSoftness={1.2}
          spotlightOpacity={0.8}
          mouseDampening={0.15}
          distortAmount={0.1}
          shineDirection="right"
          mixBlendMode="normal"
        />
      </div>

      {/* Fallback gradient background */}
      <div className="absolute inset-0 w-full h-full z-0 bg-gradient-to-br from-purple-500/20 via-blue-500/20 to-cyan-500/20 pointer-events-none" />

      {/* Black overlay at bottom for continuity */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black via-black/80 to-transparent z-10 pointer-events-none" />

      {/* Content overlay - positioned above background but allowing events to pass through */}
      <div className="relative z-20 flex flex-col items-center justify-center pointer-events-none">
        {/* Animated Headline */}
        <motion.h1
          className="text-4xl sm:text-7xl font-extrabold tracking-tight text-center mb-4 leading-tight text-white"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Where developers connect<br />
          and build together
        </motion.h1>

        {/* Animated Subheading */}
        <motion.p
          className="text-2xl text-center text-gray-300 mb-10 max-w-3xl font-medium"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.7 }}
        >
          Discover collaborators, join projects, and grow your skills on an AI-powered
          platform designed for modern developers.
        </motion.p>

        {/* Animated Buttons */}
        <motion.div
          className="flex gap-4 pointer-events-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1 }}
        >
          <Link href="/auth/signup" passHref>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-full bg-white text-black font-semibold text-lg shadow-lg hover:bg-gray-100 transition"
            >
              Start for free
            </motion.button>
          </Link>

          <Link href="/demo" passHref>
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
              className="px-8 py-3 rounded-full bg-black/80 text-white font-semibold text-lg border border-white hover:bg-black transition"
            >
              Watch demo
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </header>
  );
}