'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const { isSignedIn } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  function handleLoginClick() {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      router.push('/auth/login');
    }
  }

  function handleSignupClick() {
    if (isSignedIn) {
      router.push('/dashboard');
    } else {
      router.push('/auth/signup');
    }
  }

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/80 dark:bg-black/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="DevConnect Logo"
            width={36}
            height={36}
            className=""
          />
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">
            Lumora
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link
            href="#features"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition font-medium"
          >
            Features
          </Link>
          <Link
            href="#pricing"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition font-medium"
          >
            Pricing
          </Link>
          <Link
            href="#about"
            className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition font-medium"
          >
            About
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {!mounted || !isLoaded ? (
            // Loading state
            <>
              <div className="w-16 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              <div className="w-20 h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </>
          ) : isSignedIn ? (
            // Authenticated user
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <button className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                  Dashboard
                </button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8',
                    userButtonPopoverCard:
                      'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                    userButtonPopoverActionButton:
                      'hover:bg-gray-100 dark:hover:bg-gray-700',
                  },
                }}
              />
            </div>
          ) : (
            // Unauthenticated user
            <>
              <button
                onClick={handleLoginClick}
                className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Log in
              </button>
              <button
                onClick={handleSignupClick}
                className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
