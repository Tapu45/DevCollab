'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function HeroSection() {
  return (
    <header className="relative w-full flex flex-col items-center justify-center min-h-screen py-30 overflow-hidden mb-8">
      {/* Animated Glowing Background */}
      <motion.div
        className="absolute inset-0 -z-10 w-full h-full pointer-events-none"
        initial={{ opacity: 0, scale: 1.1 }}
        animate={{ opacity: 0.8, scale: 1 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
      >
        <Image
          src="/bg.png"
          alt="Glowing background"
          fill
          style={{
            objectFit: 'cover',
            objectPosition: 'center 90px',
            filter: '',
          }}
          priority
        />
      </motion.div>

      {/* Animated Headline */}
      <motion.h1
        className="text-4xl sm:text-7xl font-extrabold tracking-tight text-center mb-4 leading-tight"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        Where developers connect<br />
        and build together
      </motion.h1>

      {/* Animated Subheading */}
      <motion.p
        className="text-2xl text-center text-gray-400 mb-10 max-w-3xl font-medium"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.7 }}
      >
        Discover collaborators, join projects, and grow your skills on an AI-powered
        platform designed for modern developers.
      </motion.p>

      {/* Animated Buttons */}
      <motion.div
        className="flex gap-4"
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

      {/* Dashboard Image */}
      <motion.div
        className="mt-12 w-full flex justify-center"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.3 }}
      >
        <Image
          src="/dashboard.png"
          alt="Dashboard Preview"
          width={1000}
          height={650}
          className="rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 max-w-full h-auto"
          priority
        />
      </motion.div>
    </header>
  );
}
