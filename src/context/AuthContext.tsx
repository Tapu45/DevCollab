'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any; // You can make this more specific if needed
  setUser: React.Dispatch<React.SetStateAction<any>>;
  isLoaded: boolean;
  isSignedIn: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { isSignedIn: clerkIsSignedIn } = useClerkAuth();
  const [user, setUser] = useState<any>(null); // Fix: Change from null to any
  const router = useRouter();

  // Fix: Handle undefined isSignedIn
  const isSignedIn = clerkIsSignedIn ?? false;

  useEffect(() => {
    if (isLoaded && clerkUser) {
      // Sync user with your database
      fetch('/api/auth/sync-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clerkId: clerkUser.id,
          email: clerkUser.emailAddresses[0]?.emailAddress,
          firstName: clerkUser.firstName,
          lastName: clerkUser.lastName,
          imageUrl: clerkUser.imageUrl,
          username: clerkUser.username,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => setUser(data?.user || clerkUser))
        .catch(() => setUser(clerkUser));
    } else if (isLoaded && !isSignedIn) {
      setUser(null);
    }
  }, [clerkUser, isLoaded, isSignedIn]);

  return (
    <AuthContext.Provider value={{ user, setUser, isLoaded, isSignedIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
