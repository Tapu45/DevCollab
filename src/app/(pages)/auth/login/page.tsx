'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function LoginPage() {
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await signIn('credentials', {
      ...form,
      redirect: false,
      ...(rememberMe && { maxAge: 30 * 24 * 60 * 60 }), // 30 days if remember me is checked
    });
    setLoading(false);
    if (res?.error) setError(res.error);
    else router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)] dark:bg-[var(--background)] transition-colors duration-300 justify-center items-center">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={handleSubmit}
        className="
          flex flex-col gap-5 w-full max-w-md
          bg-[var(--card)] text-[var(--card-foreground)]
          border border-[var(--border)]
          shadow-2xl rounded-3xl p-10
          transition-colors duration-300
          backdrop-blur-md
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="flex flex-col items-center mb-2"
        >
          <div className="mb-2">
            {/* Login Icon */}
            <svg
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 24 24"
              className="text-[var(--primary)]"
            >
              <path
                d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="10,17 15,12 10,7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <line
                x1="15"
                y1="12"
                x2="3"
                y2="12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-center tracking-tight mb-1">
            Welcome back
          </h2>
          <p className="text-[var(--muted-foreground)] text-base text-center">
            Sign in to continue your collaboration journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          <input
            name="emailOrUsername"
            placeholder="Email or Username"
            onChange={handleChange}
            required
            disabled={loading}
            className="
              px-4 py-3 rounded-xl border border-[var(--input)]
              bg-[var(--background)] text-[var(--foreground)]
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
              focus:border-[var(--primary)]
              placeholder:text-[var(--muted-foreground)]
              transition-all
            "
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            required
            disabled={loading}
            className="
              px-4 py-3 rounded-xl border border-[var(--input)]
              bg-[var(--background)] text-[var(--foreground)]
              focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
              focus:border-[var(--primary)]
              placeholder:text-[var(--muted-foreground)]
              transition-all
            "
          />
          <label className="flex items-center gap-2 text-[var(--foreground)]">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={loading}
              className="accent-[var(--primary)]"
            />
            Remember Me
          </label>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          type="submit"
          disabled={loading}
          className="
            mt-2 py-3 rounded-xl font-semibold text-lg
            bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]
            text-[var(--primary-foreground)]
            hover:from-[var(--accent)] hover:to-[var(--primary)]
            hover:text-[var(--accent-foreground)]
            transition-all shadow-lg
            disabled:opacity-60
          "
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center"
        >
          <Link
            href="/auth/forgot-password"
            className="text-[var(--primary)] hover:underline"
          >
            Forgot Password?
          </Link>
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="text-[var(--destructive)] text-center font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
