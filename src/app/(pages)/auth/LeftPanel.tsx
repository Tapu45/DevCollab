import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useAnimation } from "framer-motion";

interface Step {
  label: string;
  description: string;
  icon: React.ReactNode;
}

interface LeftPanelProps {
  currentStep: number;
}

const steps: Step[] = [
  {
    label: "Your details",
    description: "Provide an email and password",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M4 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
  {
    label: "Verify your email",
    description: "Enter your verification code",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect
          x="3"
          y="5"
          width="18"
          height="14"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path d="M3 7l9 6 9-6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
 {
    label: "Choose your plan",
    description: "Select a subscription plan",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <rect
          x="4"
          y="7"
          width="16"
          height="10"
          rx="2"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 11h8M8 15h8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    label: "Welcome to DevCollab!",
    description: "Get up and running in 3 minutes",
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path
          d="M12 2l2.09 6.26L20 9.27l-5 3.64L16.18 20 12 16.77 7.82 20 9 12.91l-5-3.64 5.91-.91z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      </svg>
    ),
  },
];

export default function LeftPanel({ currentStep }: LeftPanelProps) {
  return (
    <div className="relative overflow-hidden w-full h-full flex flex-col justify-between p-0 border-r border-[var(--sidebar-border)] shadow-2xl rounded-r-2xl">
      {/* Animated background */}
      <motion.div
        className="absolute inset-0 z-0"
        animate={{
          background: [
            "linear-gradient(135deg, var(--sidebar) 0%, var(--sidebar-accent) 100%)",
            "linear-gradient(225deg, var(--sidebar-accent) 0%, var(--sidebar) 100%)",
            "linear-gradient(135deg, var(--sidebar) 0%, var(--sidebar-accent) 100%)",
          ],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />

      {/* Glass glowing blobs */}
      {/* <motion.div
        className="absolute -top-32 left-1/2 -translate-x-1/2 w-[450px] h-[450px] rounded-full bg-[var(--primary)] opacity-30 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity }}
      /> */}
      {/* <motion.div
        className="absolute bottom-0 right-0 w-[250px] h-[250px] rounded-full bg-[var(--accent)] opacity-20 blur-2xl"
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 5, repeat: Infinity }}
      /> */}

      {/* Content */}
       <div className="relative z-10 flex flex-col h-full animate-fade-in">
        {/* Logo */}
        <div className="mb-10 flex items-center gap-3 px-10 pt-10">
          <div className="w-12 h-12 relative flex-shrink-0">
            <Image
              src="/logo.png"
              alt="DevCollab Logo"
              fill
              className="object-contain rounded-xl shadow"
              priority
            />
          </div>
          <motion.span
            className="font-extrabold text-3xl tracking-tight bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] bg-clip-text text-transparent drop-shadow px-4 py-2 rounded-xl backdrop-blur-md bg-white/10 dark:bg-black/10  shadow-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Lumora
          </motion.span>
        </div>

        {/* Steps */}
        <div className="flex flex-row flex-1 px-10">
          {/* Progress bar */}
          <div className="relative flex flex-col items-center mr-6">
            <div className="w-1 bg-[var(--muted)] rounded-full flex-1 overflow-hidden">
              <motion.div
                className="w-1 rounded-full bg-gradient-to-b from-[var(--primary)] to-[var(--accent)]"
                style={{
                  height: `${((currentStep + 1) / steps.length) * 100}%`,
                }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* Step list */}
          <ol className="space-y-8 flex-1  p-4 rounded-xl ">
            {steps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              return (
                <motion.li
                  key={step.label}
                  className={`flex items-start space-x-4 transition-opacity duration-200 ${
                    isActive ? "" : "opacity-60"
                  }`}
                  whileHover={{ scale: 1.02 }}
                >
                  <motion.span
                    className={`rounded-full w-12 h-12 flex items-center justify-center border-2 shadow-lg ${
                      isActive
                        ? "bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)] ring-4 ring-[var(--primary)]/20"
                        : isCompleted
                        ? "bg-[var(--accent)] text-[var(--accent-foreground)] border-[var(--accent)]"
                        : "bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]"
                    }`}
                    whileHover={{ rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {step.icon}
                  </motion.span>
                  <div>
                    <div className="font-semibold text-lg">{step.label}</div>
                    <div className="text-[var(--muted-foreground)] text-sm">
                      {step.description}
                    </div>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between text-sm mt-10 px-10 pb-8 z-10">
        <Link
          href="/"
          className="hover:underline transition-colors text-[var(--muted-foreground)] hover:text-[var(--primary)] font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          &larr; Back to home
        </Link>
        <Link
          href="/auth/login"
          className="hover:underline transition-colors text-[var(--muted-foreground)] hover:text-[var(--primary)] font-medium px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        >
          Sign in
        </Link>
      </div>

      {/* Fade-in */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}
