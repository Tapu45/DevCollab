'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MagnifyingGlass,
  Moon,
  Sun,
  DotsThree,
  Plus,
  Star,
  Keyboard,
} from 'phosphor-react';
import { MessageCircle, Bell } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import PageHeader from '@/components/Layout/PageHeader';
import { useSearch } from '@/context/SearchContext';

export default function Navbar() {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<any[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const { search, results, loading, clear } = useSearch();

  const placeholder = useMemo(() => {
    // Default; pages can set context via what they register
    if (pathname?.startsWith('/settings')) return 'Search settings...';
    if (pathname?.startsWith('/my-network')) return 'Search your network...';
    if (pathname?.startsWith('/collaborate')) return 'Search people, skills...';
    return 'Search...';
  }, [pathname]);

  useEffect(() => {
    const has = document.documentElement.classList.contains('dark');
    setIsDark(has);
  }, []);

  // Fetch notification count on mount
  useEffect(() => {
    fetch('/api/notification?limit=0') // limit=0 to only get count, not notifications
      .then((res) => res.json())
      .then((data) => {
        setNotifications(data.unreadCount || 0);
      })
      .catch((err) =>
        console.error('Failed to fetch notification count:', err),
      );
  }, []);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (dropdownOpen) {
      fetch('/api/notification?limit=5')
        .then((res) => res.json())
        .then((data) => {
          setRecentNotifications(data.notifications || []);
          setNotifications(data.unreadCount || 0);
        })
        .catch((err) => console.error('Failed to fetch notifications:', err));
    }
  }, [dropdownOpen]);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  const handleNotificationClick = () => {
    setDropdownOpen((prev) => !prev);
  };

 useEffect(() => {
   const handleClickOutside = (event: MouseEvent) => {
     if (searchOpen && !(event.target as Element).closest('.search-dropdown')) {
       setSearchOpen(false);
     }
     if (
       dropdownOpen &&
       !(event.target as Element).closest('.notification-parent')
     ) {
       setDropdownOpen(false);
     }
   };
   document.addEventListener('mousedown', handleClickOutside);
   return () => document.removeEventListener('mousedown', handleClickOutside);
 }, [searchOpen, dropdownOpen]);

  const handleViewAll = () => {
    setDropdownOpen(false);
    router.push('/notification');
  };

  const onChangeSearch = (val: string) => {
    setQuery(val);
    setSearchOpen(true);
    if (val.trim().length >= 2) {
      search(val);
    } else {
      clear();
    }
  };

  const flatten = useMemo(() => {
    // Combine with type headings; keep groups in order by priority
    return results;
  }, [results]);

  const onSelectItem = (item: any) => {
    setSearchOpen(false);
    clear();
    setQuery('');
    if (item.href) {
      router.push(item.href);
      return;
    }
    // Sensible defaults if item is a user-like entity
    if (item.id) {
      router.push(`/profile/${item.id}`);
    }
  };

  return (
    <header
      className="sticky top-0 z-40 w-full backdrop-blur-xl border-b shadow-sm"
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-card-foreground)',
      }}
    >
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center gap-4">
          <PageHeader />
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`relative transition-all duration-300 ${
              searchOpen ? 'w-100' : 'w-94'
            }`}
          >
            <div
              className={`relative flex items-center gap-3 px-4 py-2.5 rounded-lg border transition-all duration-300 ${
                searchOpen ? 'shadow-lg' : ''
              }`}
              style={{
                borderColor: searchOpen
                  ? 'var(--color-primary)'
                  : 'var(--color-border)',
                backgroundColor: searchOpen
                  ? 'var(--color-accent)'
                  : 'var(--color-input)',
              }}
            >
              <MagnifyingGlass
                size={18}
                style={{
                  color: searchOpen
                    ? 'var(--color-primary)'
                    : 'var(--color-muted-foreground)',
                }}
              />
              <input
                value={query}
                onChange={(e) => onChangeSearch(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => setTimeout(() => setSearchOpen(false), 200)}
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--color-foreground)' }}
                placeholder={placeholder}
                aria-label="Search"
              />
              {query && (
                <button
                  onClick={() => {
                    setQuery('');
                    clear();
                  }}
                  className="p-1 rounded-lg transition-all duration-200"
                  style={{
                    color: 'var(--color-muted-foreground)',
                    backgroundColor: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      'var(--color-accent)';
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

            <AnimatePresence>
              {searchOpen && flatten.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="search-dropdown absolute left-0 right-0 mt-2 rounded-xl border shadow-lg z-50"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div className="max-h-96 overflow-y-auto py-2">
                    {loading && (
                      <div
                        className="px-4 py-2 text-xs"
                        style={{ color: 'var(--color-muted-foreground)' }}
                      >
                        Searching...
                      </div>
                    )}

                    {flatten.map((group) => (
                      <div key={group.type}>
                        <div
                          className="px-4 py-1 text-xs uppercase tracking-wider"
                          style={{ color: 'var(--color-muted-foreground)' }}
                        >
                          {group.type}
                        </div>
                        {group.items.length === 0 ? (
                          <div
                            className="px-4 py-2 text-sm"
                            style={{ color: 'var(--color-muted-foreground)' }}
                          >
                            No results
                          </div>
                        ) : (
                          group.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => onSelectItem(item)}
                              className="w-full px-4 py-2 flex items-center gap-3 text-left hover:bg-accent transition"
                              style={{ color: 'var(--color-card-foreground)' }}
                            >
                              {item.avatarUrl && (
                                <img
                                  src={item.avatarUrl}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover"
                                />
                              )}
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {item.title ?? 'Result'}
                                </span>
                                {item.subtitle && (
                                  <span
                                    className="text-xs"
                                    style={{
                                      color: 'var(--color-muted-foreground)',
                                    }}
                                  >
                                    {item.subtitle}
                                  </span>
                                )}
                                {item.href && (
                                  <span
                                    className="text-[10px]"
                                    style={{
                                      color: 'var(--color-muted-foreground)',
                                    }}
                                  >
                                    {item.href}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg transition-all duration-200"
            style={{
              color: 'var(--color-card-foreground)',
              backgroundColor: 'transparent',
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
                <Moon
                  size={20}
                  style={{ color: 'var(--color-card-foreground)' }}
                />
              )}
            </motion.div>
          </button>

          <div className="relative notification-parent">
            <button
              className="relative p-2.5 rounded-lg transition-all duration-200 group"
              style={{
                color: 'var(--color-card-foreground)',
                backgroundColor: 'transparent',
              }}
              onClick={handleNotificationClick}
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
                    color: 'var(--color-destructive-foreground)',
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  {notifications > 9 ? '9+' : notifications}
                </motion.span>
              )}
            </button>
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="notification-dropdown absolute right-0 mt-2 w-80 bg-card border border-border rounded-xl shadow-lg z-50"
                  style={{
                    backgroundColor: 'var(--color-card)',
                    borderColor: 'var(--color-border)',
                  }}
                >
                  <div
                    className="p-4 border-b border-border font-semibold"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-card-foreground)',
                    }}
                  >
                    Notifications
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {recentNotifications.length === 0 ? (
                      <div
                        className="p-4 text-muted-foreground text-sm text-center"
                        style={{ color: 'var(--color-muted-foreground)' }}
                      >
                        No notifications
                      </div>
                    ) : (
                      recentNotifications.map((n) => (
                        <div
                          key={n.id}
                          className={`flex items-start gap-3 px-4 py-3 border-b border-border last:border-b-0 cursor-pointer hover:bg-accent transition ${
                            !n.isRead ? 'bg-primary/10' : ''
                          }`}
                          style={{
                            borderColor: 'var(--color-border)',
                            backgroundColor: !n.isRead
                              ? 'var(--color-primary)/10'
                              : 'transparent',
                          }}
                          onClick={() => {
                            setDropdownOpen(false);
                            router.push('/notification');
                          }}
                        >
                          <div className="mt-1">
                            <Bell
                              size={16}
                              style={{ color: 'var(--color-muted-foreground)' }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className="font-medium truncate"
                                style={{
                                  color: 'var(--color-card-foreground)',
                                }}
                              >
                                {n.title}
                              </span>
                              {!n.isRead && (
                                <span
                                  className="w-2 h-2 bg-primary rounded-full"
                                  style={{
                                    backgroundColor: 'var(--color-primary)',
                                  }}
                                ></span>
                              )}
                            </div>
                            <div
                              className="text-xs text-muted-foreground truncate"
                              style={{ color: 'var(--color-muted-foreground)' }}
                            >
                              {n.message}
                            </div>
                            <div
                              className="text-xs text-muted-foreground mt-1"
                              style={{ color: 'var(--color-muted-foreground)' }}
                            >
                              {new Date(n.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div
                    className="p-2 border-t border-border text-center"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <button
                      className="text-primary font-medium hover:underline"
                      style={{ color: 'var(--color-primary)' }}
                      onClick={handleViewAll}
                    >
                      View All
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
