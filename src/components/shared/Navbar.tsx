"use client";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-white/80 dark:bg-black/70 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="DevConnect Logo" width={36} height={36} className="" />
          <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">DevConnect</span>
        </Link>
        {/* Nav Links */}
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition font-medium">
            Features
          </Link>
          <Link href="#pricing" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition font-medium">
            Pricing
          </Link>
          <Link href="#about" className="text-gray-700 dark:text-gray-200 hover:text-blue-600 transition font-medium">
            About
          </Link>
        </div>
        {/* Actions */}
        <div className="flex items-center gap-2">
          <Link href="/auth/login">
            <button className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
              Log in
            </button>
          </Link>
          <Link href="/auth/signup">
            <button className="px-4 py-2 rounded-full bg-blue-600 text-white text-sm font-semibold shadow hover:bg-blue-700 transition">
              Sign up
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}