'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import type { IconProps } from 'phosphor-react';
import {
  House,
  FolderSimple,
  MagnifyingGlass,
  ChatDots,
  User,
  Gear,
  CaretLeft,
  SignOut,
  Book as BookOpenText,
  ListChecks,
  UsersThree,
  ChartLineUp,
} from 'phosphor-react';
import { usePathname } from 'next/navigation';
import { useSidebarStore } from '@/store/Zustand';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/context/AuthContext';

type NavItem = {
  id: string;
  label: string;
  href: string;
  Icon: (props: IconProps) => React.ReactNode;
  badge?: string | number;
  meta?: string;
};

const mainNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard', Icon: House },
  {
    id: 'projects',
    label: 'Projects',
    href: '/projects',
    Icon: FolderSimple,
    meta: '12',
  },
  {
    id: 'discover',
    label: 'Discover',
    href: '/discover',
    Icon: MagnifyingGlass,
  },
  {
    id: 'messages',
    label: 'Messages',
    href: '/messages',
    Icon: ChatDots,
    badge: 3,
  },
  { id: 'profile', label: 'Collaborate', href: '/collaborate', Icon: User },
  { id: 'settings', label: 'Settings', href: '/settings', Icon: Gear },
];

const interviewNavItems: NavItem[] = [
  {
    id: 'resources',
    label: 'Resources',
    href: '/interview-prep/resources',
    Icon: BookOpenText,
  },
  {
    id: 'practice',
    label: 'Practice',
    href: '/interview-prep/practice',
    Icon: ListChecks,
  },
  {
    id: 'Leetcode',
    label: 'LeetCode',
    href: '/interview-prep/leetcode/company-wise-question',
    Icon: UsersThree,
  },
  {
    id: 'tracker',
    label: 'Progress Tracker',
    href: '/interview-prep/tracker',
    Icon: ChartLineUp,
  },
];

export default function SIdebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { mode, toggleMode, hydrateMode } = useSidebarStore();
 const { user } = useAuth() ?? {};

  useEffect(() => {
    hydrateMode();
  }, []);

  const navItems = mode === 'main' ? mainNavItems : interviewNavItems;

  return (
    <aside
      className={`flex flex-col h-screen border-r transition-all duration-300 ease-in-out ${
        collapsed ? 'w-16' : 'w-60'
      }`}
      style={{
        backgroundColor: 'var(--color-card)',
        borderColor: 'var(--color-border)',
        color: 'var(--color-card-foreground)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="DevCollab logo"
              width={24}
              height={24}
              className="object-cover"
            />
          </div>
          
          {!collapsed && (
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--color-card-foreground)' }}>DevCollab</h1>
              <p className="text-xs" style={{ color: 'var(--color-muted-foreground)' }}>Connect • Build • Ship</p>
            </div>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg transition-all duration-200"
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
        >
          <CaretLeft 
            size={16} 
            className={`transition-transform ${
              collapsed ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

    

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-auto">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href));
            
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200 ${
                    active ? 'border' : ''
                  }`}
                  style={{
                    backgroundColor: active ? 'var(--color-primary)' : 'transparent',
                    color: active ? 'var(--color-primary-foreground)' : 'var(--color-card-foreground)',
                    borderColor: active ? 'var(--color-ring)' : 'transparent'
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'var(--color-accent)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors`} style={{
                    backgroundColor: active ? 'var(--color-primary-foreground)' : 'var(--color-accent)',
                    color: active ? 'var(--color-primary)' : 'var(--color-card-foreground)'
                  }}>
                    <item.Icon size={18} weight={active ? 'bold' : 'regular'} />
                  </div>
                  
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1 min-w-0">
                      <span className="text-sm font-medium truncate">{item.label}</span>
                      
                      <div className="flex items-center gap-2">
                        {item.meta && (
                          <span className="px-2 py-0.5 text-xs rounded-full font-medium" style={{
                            backgroundColor: 'var(--color-muted)',
                            color: 'var(--color-muted-foreground)'
                          }}>
                            {item.meta}
                          </span>
                        )}
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full font-bold" style={{
                            backgroundColor: 'var(--color-destructive)',
                            color: 'var(--color-destructive-foreground)'
                          }}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer / Profile */}
      <div className="p-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
      <Link href="/profile" className="flex items-center gap-3 cursor-pointer group">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold overflow-hidden">
          {user?.profilePictureUrl ? (
            <img src={user.profilePictureUrl} alt="Profile" className="w-8 h-8 rounded-lg object-cover" />
          ) : (
            (user?.displayName || "U")[0]
          )}
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="truncate">
                <span className="text-sm font-medium block" style={{ color: 'var(--color-card-foreground)' }}>
                  {user?.displayName || "User"}
                </span>
                {/* <span className="text-xs block" style={{ color: 'var(--color-muted-foreground)' }}>
                  {user?.firstName && user?.lastName
                    ? `${user.firstName} • ${user.lastName}`
                    : "Frontend • Open Source"}
                </span> */}
              </div>
              <button 
                className="p-1.5 rounded-lg transition-all duration-200"
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
              >
                <SignOut size={16} />
              </button>
            </div>
          </div>
        )}
        {collapsed && (
          <button 
            className="p-1.5 rounded-lg transition-all duration-200 ml-auto"
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
          >
            <SignOut size={16} />
          </button>
        )}
      </Link>
    </div>
    </aside>
  );
}