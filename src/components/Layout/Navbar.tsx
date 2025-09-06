"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MagnifyingGlass, 
  Moon, 
  Sun, 
  DotsThree, 
  Plus,
  Star,
  Keyboard
} from "phosphor-react";
import { MessageCircle, Bell } from "lucide-react";
import PageHeader from "@/components/Layout/PageHeader";

export default function Navbar() {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifications, setNotifications] = useState(3);

  useEffect(() => {
    const has = document.documentElement.classList.contains("dark");
    setIsDark(has);
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <header 
      className="sticky top-0 z-40 w-full backdrop-blur-xl border-b shadow-sm"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-card-foreground)'
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        
        {/* Left: PageHeader and Search */}
        <div className="flex items-center gap-4">
          <PageHeader />
          
          <div className={`relative transition-all duration-300 ${
            searchOpen ? 'w-80' : 'w-64'
          }`}>
            <div className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
              searchOpen ? 'shadow-lg' : ''
            }`} style={{
              borderColor: searchOpen ? 'var(--color-primary)' : 'var(--color-border)',
              backgroundColor: searchOpen ? 'var(--color-accent)' : 'var(--color-input)'
            }}>
              <MagnifyingGlass 
                size={18} 
                style={{
                  color: searchOpen ? 'var(--color-primary)' : 'var(--color-muted-foreground)'
                }}
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{
                  color: 'var(--color-foreground)'
                }}
                placeholder="Search projects, people, skills..."
                aria-label="Search"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-lg transition-all duration-200"
                  style={{
                    color: 'var(--color-muted-foreground)',
                    backgroundColor: 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                  aria-label="Clear search"
                >
                  <span className="text-sm">✕</span>
                </button>
              )}
             
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg transition-all duration-200"
            style={{
              color: 'var(--color-card-foreground)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Toggle theme"
          >
            <motion.div
              initial={false}
              animate={{ rotate: isDark ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isDark ? (
                <Sun size={20} style={{ color: 'var(--color-chart-3)' }} />
              ) : (
                <Moon size={20} style={{ color: 'var(--color-card-foreground)' }} />
              )}
            </motion.div>
          </button>

          {/* Messages */}
          {/* <button 
            className="relative p-2.5 rounded-lg transition-all duration-200 group"
            style={{
              color: 'var(--color-card-foreground)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Messages"
          >
            <MessageCircle size={20} />
            <motion.div
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: 'var(--color-primary)' }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </button> */}

          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-lg transition-all duration-200 group"
            style={{
              color: 'var(--color-card-foreground)',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-accent)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
            aria-label="Notifications"
          >
            <Bell size={20} />
            {notifications > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 w-5 h-5 text-white text-xs rounded-full flex items-center justify-center font-bold"
                style={{
                  backgroundColor: 'var(--color-destructive)',
                  color: 'var(--color-destructive-foreground)'
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              >
               {notifications > 9 ? '9+' : notifications}
              </motion.span>
            )}
          </button>

         
        </div>
      </div>
    </header>
  );
}