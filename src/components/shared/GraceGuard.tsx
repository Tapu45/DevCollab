'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isGraceActive, clearGrace } from '../../lib/Grace-Period';

export default function GraceGuard() {
  const [show, setShow] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // run only on client
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    // don't block auth pages themselves
    if (path.startsWith('/auth')) return;

    const active = isGraceActive();
    if (!active) {
      setShow(true);
      const t = setTimeout(() => {
        clearGrace();
        router.push('/auth/login');
      }, 5000); // short delay so user sees modal
      return () => clearTimeout(t);
    }
  }, [router]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 max-w-lg mx-4">
        <h3 className="text-lg font-semibold mb-2">Session expired</h3>
        <p className="mb-4 text-sm">
          Your access expired — please sign in again to continue.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => {
              clearGrace();
              router.push('/auth/login');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Sign in
          </button>
          <button
            onClick={() => setShow(false)}
            className="px-4 py-2 border rounded"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
