'use client';

import { useEffect } from 'react';
import { setGraceDays, clearGrace } from '../lib/Grace-Period';

async function setServerGrace(days = 7) {
  try {
    await fetch('/api/auth/set-grace', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ days }),
    });
  } catch (e) {
    // ignore network errors
  }
}

async function clearServerGrace() {
  try {
    await fetch('/api/auth/clear-grace', {
      method: 'POST',
      credentials: 'include',
    });
  } catch (e) {}
}

function AuthGraceSetter({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Check if user is authenticated by making a request to a protected endpoint
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          credentials: 'include',
        });

        if (response.ok) {
          // User is authenticated, set grace period
          setGraceDays(7);
          setServerGrace(7);
        } else {
          // User is not authenticated, clear grace
          clearGrace();
          clearServerGrace();
        }
      } catch (error) {
        // Network error or user not authenticated
        clearGrace();
        clearServerGrace();
      }
    };

    checkAuth();
  }, []);

  return <>{children}</>;
}

export default function Auth0Provider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthGraceSetter>{children}</AuthGraceSetter>;
}
