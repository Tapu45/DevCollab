'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setStep('reset');
        setMessage('OTP sent to your email.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', email, otp, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Password reset successful. You can now log in.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)] dark:bg-[var(--background)] transition-colors duration-300 justify-center items-center">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        onSubmit={step === 'request' ? handleRequest : handleReset}
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
            {/* Forgot Password Icon */}
            <svg
              width="40"
              height="40"
              fill="none"
              viewBox="0 0 24 24"
              className="text-[var(--primary)]"
            >
              <path
                d="M12 2C13.1 2 14 2.9 14 4V5H10V4C10 2.9 10.9 2 12 2ZM9 5V6H15V5H9ZM8 7V20C8 21.1 8.9 22 10 22H14C15.1 22 16 21.1 16 20V7H8ZM10 9H14V20H10V9Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-center tracking-tight mb-1">
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </h2>
          <p className="text-[var(--muted-foreground)] text-base text-center">
            {step === 'request'
              ? 'Enter your email to receive an OTP.'
              : 'Enter the OTP and your new password.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col gap-3"
        >
          {step === 'request' ? (
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={status === 'loading'}
              className="
                px-4 py-3 rounded-xl border border-[var(--input)]
                bg-[var(--background)] text-[var(--foreground)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                focus:border-[var(--primary)]
                placeholder:text-[var(--muted-foreground)]
                transition-all
              "
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                disabled={status === 'loading'}
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
                type="password"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={status === 'loading'}
                className="
                  px-4 py-3 rounded-xl border border-[var(--input)]
                  bg-[var(--background)] text-[var(--foreground)]
                  focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                  focus:border-[var(--primary)]
                  placeholder:text-[var(--muted-foreground)]
                  transition-all
                "
              />
            </>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          type="submit"
          disabled={status === 'loading'}
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
          {status === 'loading'
            ? 'Processing...'
            : step === 'request'
              ? 'Send OTP'
              : 'Reset Password'}
        </motion.button>

        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`text-center font-medium ${
                status === 'success'
                  ? 'text-green-600'
                  : 'text-[var(--destructive)]'
              }`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>
    </div>
  );
}
