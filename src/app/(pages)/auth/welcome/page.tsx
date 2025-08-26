'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSignupContext } from '@/context/SignupContext';
import { signIn } from 'next-auth/react';
import LeftPanel from '../LeftPanel';

export default function WelcomePage() {
  const [dark, setDark] = useState(true);
  const router = useRouter();
  const { email, password, clearSignupCredentials } = useSignupContext();

  useEffect(() => {
    async function autoLogin() {
      if (email && password) {
        const loginRes = await signIn('credentials', {
          emailOrUsername: email,
          password,
          redirect: false,
        });
        clearSignupCredentials();
        if (loginRes?.error) {
          router.push('/auth/login');
        }
      }
    }
    autoLogin();
  }, [email, password, clearSignupCredentials, router]);

  return (
    <div className="min-h-screen flex bg-[var(--background)] text-[var(--foreground)] font-sans">
      {/* LeftPanel: last step active */}
      <div className="w-[25%] min-h-screen">
        <LeftPanel currentStep={3} />
      </div>
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div
          className="welcome-card bg-[var(--card)] text-[var(--card-foreground)] rounded-2xl shadow-xl p-8 max-w-lg w-full flex flex-col items-center gap-6 overflow-hidden"
          style={{ border: '1px solid var(--border)' }}
        >
          {/* Video at the top, not overlapping */}
          <video
            className="w-full h-48 object-cover rounded-xl mb-4"
            src="/dev.mp4"
            autoPlay
            loop
            muted
            playsInline
          />
          {/* All content below video */}
          <div className="flex flex-col items-center gap-6 w-full">
            <p className="subtitle text-lg text-center">
              You’ve just joined a community of awesome developers.
              <br />
              <span className="highlight font-semibold text-[var(--primary)]">
                Let’s build, collaborate, and maybe break production together!
              </span>
            </p>
            <a
              href="/dashboard"
              className="dashboard-link mt-4 inline-block bg-[var(--primary)] text-[var(--primary-foreground)] px-6 py-2 rounded-lg font-semibold shadow hover:bg-[var(--accent)] transition-colors"
            >
              Go to your dashboard →
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}