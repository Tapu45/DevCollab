'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import LeftPanel from '../LeftPanel';
import { useRouter } from 'next/navigation';
import { useSignupContext } from '@/context/SignupContext';

export default function SignupPage() {
  const [form, setForm] = useState({
    email: '',
    username: '',
    password: '',
    name: '',
    profilePictureUrl: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(
    null,
  );
  const router = useRouter();

  const { setSignupCredentials } = useSignupContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || 'Signup failed');
    setSignupCredentials(form.email, form.password);
    router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`);
  };

  const handleUsernameChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const value = e.target.value;
  setForm(f => ({ ...f, username: value }));
  setUsernameAvailable(null);
  if (value.length >= 3) {
    const res = await fetch('/api/auth/check-username', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: value }),
    });
    const data = await res.json();
    setUsernameAvailable(data.available);
  }
};

  return (
    <div className="min-h-screen flex bg-[var(--background)] dark:bg-[var(--background)] transition-colors duration-300">
      {/* Left Panel */}
      <div className="w-[25%] min-h-screen">
        <LeftPanel currentStep={0} />
      </div>
      {/* Right Panel */}
      <div className="w-[75%] flex flex-col justify-center items-center px-4 sm:px-8 md:px-16">
        <form
          onSubmit={handleSubmit}
          className="
            flex flex-col gap-5 w-full max-w-md
           
            text-[var(--card-foreground)]
          
            shadow-2xl rounded-3xl p-10
            transition-colors duration-300
            backdrop-blur-md
          "
          //  className="
          //   flex flex-col gap-5 w-full max-w-md
          //   bg-gradient-to-br from-[var(--card)] to-[var(--card-foreground)/10]
          //   text-[var(--card-foreground)]
          //   border border-[var(--border)]
          //   shadow-2xl rounded-3xl p-10
          //   transition-colors duration-300
          //   backdrop-blur-md
          // "
        >
          <div className="flex flex-col items-center mb-2">
            <div className="mb-2">
              {/* User Plus Icon */}
              <svg
                width="40"
                height="40"
                fill="none"
                viewBox="0 0 24 24"
                className="text-[var(--primary)]"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M4 20c0-3.314 3.134-6 7-6s7 2.686 7 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M19 8v4m2-2h-4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <h2 className="text-3xl font-extrabold text-center tracking-tight mb-1">
              Create your account
            </h2>
            <p className="text-[var(--muted-foreground)] text-base text-center">
              Start collaborating in seconds. No credit card required.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <input
              name="email"
              placeholder="Email"
              type="email"
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
              name="username"
              placeholder="Username"
              onChange={handleUsernameChange}
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
            {usernameAvailable === false && (
              <div className="text-red-500 text-sm mt-1">
                Username is already taken.
              </div>
            )}
            {usernameAvailable === true && form.username.length >= 3 && (
              <div className="text-green-500 text-sm mt-1">
                Username is available!
              </div>
            )}
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
          </div>
          <button
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
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
          {error && (
            <div className="text-[var(--destructive)] text-center font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-600 dark:text-green-400 text-center font-medium">
              {success}
            </div>
          )}
          <div className="flex items-center gap-2 my-2">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--muted-foreground)]">
              or sign up with
            </span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>
          <div className="flex flex-row gap-4 justify-center">
            {/* Social Buttons */}
            <button
              type="button"
              aria-label="Sign up with Google"
              className="
                bg-[var(--background)] border border-[var(--input)] rounded-full p-3
                flex items-center justify-center
                hover:bg-[var(--muted)] hover:text-[var(--primary)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                transition-all shadow
              "
              onClick={() => signIn('google')}
            >
              {/* Google SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <g>
                  <path
                    d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.227s2.75-6.227 6.125-6.227c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.657z"
                    fill="#4285F4"
                  />
                  <path
                    d="M3.153 7.345l3.281 2.406c.891-1.742 2.578-2.977 4.601-2.977 1.125 0 2.148.391 2.953 1.031l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-3.828 0-7.078 2.484-8.406 5.812z"
                    fill="#34A853"
                  />
                  <path
                    d="M12 22c2.672 0 4.922-.883 6.563-2.406l-3.031-2.484c-.844.602-1.953.961-3.531.961-3.008 0-5.563-2.031-6.484-4.773l-3.25 2.508c1.516 3.211 4.797 5.194 8.733 5.194z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M21.805 10.023h-9.765v3.977h5.617c-.242 1.242-1.484 3.648-5.617 3.648-3.375 0-6.125-2.789-6.125-6.227s2.75-6.227 6.125-6.227c1.922 0 3.211.82 3.953 1.523l2.703-2.633c-1.711-1.57-3.922-2.539-6.656-2.539-5.523 0-10 4.477-10 10s4.477 10 10 10c5.742 0 9.547-4.023 9.547-9.695 0-.652-.07-1.148-.156-1.657z"
                    fill="#EA4335"
                  />
                </g>
              </svg>
            </button>
            <button
              type="button"
              aria-label="Sign up with GitHub"
              className="
                bg-[var(--background)] border border-[var(--input)] rounded-full p-3
                flex items-center justify-center
                hover:bg-[var(--muted)] hover:text-[var(--primary)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                transition-all shadow
              "
              onClick={() => signIn('github')}
            >
              {/* GitHub SVG */}
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.426 2.865 8.18 6.839 9.504.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.461-1.11-1.461-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.112-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.577.688.479C19.138 20.197 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Sign up with LinkedIn"
              className="
                bg-[var(--background)] border border-[var(--input)] rounded-full p-3
                flex items-center justify-center
                hover:bg-[var(--muted)] hover:text-[var(--primary)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                transition-all shadow
              "
              onClick={() => signIn('linkedin')}
            >
              {/* LinkedIn SVG */}
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.268c-.966 0-1.75-.784-1.75-1.75s.784-1.75 1.75-1.75 1.75.784 1.75 1.75-.784 1.75-1.75 1.75zm13.5 11.268h-3v-5.604c0-1.337-.025-3.063-1.868-3.063-1.868 0-2.154 1.459-2.154 2.967v5.7h-3v-10h2.881v1.367h.041c.401-.761 1.381-1.563 2.845-1.563 3.043 0 3.604 2.004 3.604 4.609v5.587z" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Sign up with GitLab"
              className="
                bg-[var(--background)] border border-[var(--input)] rounded-full p-3
                flex items-center justify-center
                hover:bg-[var(--muted)] hover:text-[var(--primary)]
                focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                transition-all shadow
              "
              onClick={() => signIn('gitlab')}
            >
              {/* GitLab SVG */}
              <svg
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <g>
                  <path d="M22.545 13.408l-2.036-6.263a1.13 1.13 0 0 0-2.149-.04l-1.63 4.991H7.27l-1.63-4.991a1.13 1.13 0 0 0-2.149.04l-2.036 6.263a1.13 1.13 0 0 0 .41 1.267l9.06 6.59a1.13 1.13 0 0 0 1.34 0l9.06-6.59a1.13 1.13 0 0 0 .41-1.267z" />
                </g>
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
