'use client';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [valid, setValid] = useState<null | boolean>(null);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState<
    'idle' | 'loading' | 'success' | 'error'
  >('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const t = searchParams.get('token');
    setToken(t);
    if (!t) {
      setValid(false);
      setMessage('Invalid or missing reset token.');
      return;
    }
    // Validate token
    fetch('/api/auth/resetpassword', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'validate', token: t }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.valid) {
          setValid(true);
        } else {
          setValid(false);
          setMessage('Invalid or expired reset token.');
        }
      })
      .catch(() => {
        setValid(false);
        setMessage('Something went wrong. Please try again later.');
      });
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setMessage('Password must be at least 6 characters.');
      setStatus('error');
      return;
    }
    if (password !== confirm) {
      setMessage('Passwords do not match.');
      setStatus('error');
      return;
    }
    setStatus('loading');
    setMessage('');
    try {
      const res = await fetch('/api/auth/resetpassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setMessage('Password reset successful! You can now log in.');
      } else {
        setStatus('error');
        setMessage(data.error || 'Reset failed.');
      }
    } catch {
      setStatus('error');
      setMessage('Something went wrong. Please try again later.');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h1 className="text-2xl font-bold mb-4">Reset Password</h1>
      {valid === null && <p>Validating token...</p>}
      {valid === false && <p className="text-red-600">{message}</p>}
      {valid && status !== 'success' && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="password"
            placeholder="New password"
            className="border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={status === 'loading'}
          />
          <input
            type="password"
            placeholder="Confirm new password"
            className="border p-2 rounded"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={6}
            disabled={status === 'loading'}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
      )}
      {message && (
        <p
          className={`mt-4 ${status === 'success' ? 'text-green-600' : 'text-red-600'}`}
        >
          {message}
        </p>
      )}
      {status === 'success' && (
        <button
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => router.push('/auth/login')}
        >
          Go to Login
        </button>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">
          Loading...
        </div>
      }
    >
      <ResetPasswordPageInner />
    </Suspense>
  );
}
