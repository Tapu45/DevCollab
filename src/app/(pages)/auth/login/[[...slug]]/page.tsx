'use client';
import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex bg-[var(--background)] justify-center items-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] hover:from-[var(--accent)] hover:to-[var(--primary)]',
              card: 'bg-[var(--card)] border-[var(--border)]',
              headerTitle: 'text-[var(--foreground)]',
              headerSubtitle: 'text-[var(--muted-foreground)]',
              socialButtonsBlockButton:
                'border-[var(--border)] hover:bg-[var(--accent)]',
              formFieldInput:
                'bg-[var(--background)] border-[var(--border)] text-[var(--foreground)]',
              footerActionLink:
                'text-[var(--primary)] hover:text-[var(--accent)]',
            },
          }}
        />
      </motion.div>
    </div>
  );
}
