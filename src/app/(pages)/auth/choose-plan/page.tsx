'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSignupContext } from '@/context/SignupContext';
import { signIn } from 'next-auth/react';
import Script from 'next/script';
import LeftPanel from '../LeftPanel';

type Plan = {
  id: string;
  name: string;
  description?: string;
  price: string;
  currency: string;
  interval: string;
  features: string[];
};

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ChoosePlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const { email, password, clearSignupCredentials } = useSignupContext();

  useEffect(() => {
    async function fetchPlans() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/auth/plans');
        if (!res.ok) throw new Error('Failed to fetch plans');
        const data = await res.json();
        // Parse features from JSON string to array
        const plansWithFeatures = (data || []).map((plan: any) => ({
          ...plan,
          features:
            typeof plan.features === 'string'
              ? JSON.parse(plan.features)
              : plan.features,
        }));
        setPlans(plansWithFeatures);
      } catch (err: any) {
        setError(err.message || 'Error loading plans');
      } finally {
        setLoading(false);
      }
    }
    fetchPlans();
  }, []);

  const handleSelect = (planId: string) => {
    setSelectedPlan(planId);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !selectedPlan) {
      setError('Please select a plan.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/choose-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, planId: selectedPlan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to choose plan');

      // If payment is required, open Razorpay checkout
      const selectedPlanData = plans.find(p => p.id === selectedPlan);
      const isFreePlan = selectedPlanData?.price === '0';

      // If payment is required, open Razorpay checkout
      if (data.paymentRequired && data.order) {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: data.order.amount,
          currency: data.order.currency,
          order_id: data.order.id,
          name: 'DevCollab',
          description: 'Subscription Payment',
          handler: async function (response: any) {
            await fetch('/api/auth/confirm-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId: selectedPlan,
                userId,
              }),
            });
            router.push('/auth/welcome');
          },
          prefill: { email: email || '' },
          theme: { color: '#3399cc' },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
        setSubmitting(false);
        return;
      }

      // If it's a free plan or no payment required, redirect directly to welcome page
      if (isFreePlan || !data.paymentRequired) {
        router.push('/auth/welcome');
        return;
      }

    } catch (err: any) {
      setError(err.message || 'Error submitting plan');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--background)] dark:bg-[var(--background)] transition-colors duration-300">
      {/* Left Panel */}
      <div className="hidden md:block w-[25%]">
        <LeftPanel currentStep={2} />
      </div>
      {/* Right Panel */}
      <div className=" w-[75%] flex-1 flex flex-col justify-center items-center px-4 sm:px-8 md:px-16">
        <div className="max-w-4xl w-full py-10">
          <Script src="https://checkout.razorpay.com/v1/checkout.js" />
          <div className="flex flex-col items-center mb-8">
            <div className="mb-2">
              {/* Subscription Icon: Credit Card */}
              <svg
                width="40"
                height="40"
                fill="none"
                viewBox="0 0 24 24"
                className="text-[var(--primary)]"
              >
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="12"
                  rx="3"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <rect
                  x="7"
                  y="16"
                  width="2"
                  height="2"
                  rx="0.5"
                  fill="currentColor"
                />
                <rect
                  x="11"
                  y="16"
                  width="6"
                  height="2"
                  rx="0.5"
                  fill="currentColor"
                />
                <path d="M3 10h18" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold text-center tracking-tight mb-1 text-[var(--card-foreground)]">
              Choose Your Subscription Plan
            </h1>
            <p className="text-[var(--muted-foreground)] text-base text-center">
              Select a plan to continue. Upgrade anytime.
            </p>
          </div>
          {loading && (
            <p className="text-center text-[var(--muted-foreground)]">
              Loading plans...
            </p>
          )}
          {error && (
            <p className="text-[var(--destructive)] text-center font-medium mb-4">
              {error}
            </p>
          )}
          {!loading && plans.length === 0 && (
            <p className="text-[var(--muted-foreground)] text-center">
              No plans available.
            </p>
          )}

          <form onSubmit={handleSubmit}>
            <div
              className="
                flex flex-col gap-6
                sm:flex-row sm:gap-6
                justify-center items-stretch
                w-full
              "
            >
              {plans.map((plan) => (
                <label
                  key={plan.id}
                  className={`
                    flex flex-col gap-2 flex-1 border-2 rounded-2xl p-6 cursor-pointer
                    transition-all duration-200 shadow-2xl
                    bg-[var(--card)] text-[var(--card-foreground)]
                    border-[var(--border)]
                    hover:border-[var(--primary)] hover:shadow-xl
                    ${selectedPlan === plan.id ? 'border-[var(--primary)] ring-2 ring-[var(--primary)] bg-[var(--accent)]' : ''}
                    min-w-0
                  `}
                  style={{
                    boxShadow:
                      selectedPlan === plan.id
                        ? '0 8px 32px 0 rgba(51,153,204,0.15)'
                        : '0 4px 16px 0 rgba(0,0,0,0.07)',
                  }}
                >
                  <div className="flex items-center mb-1">
                    <input
                      type="radio"
                      name="plan"
                      value={plan.id}
                      checked={selectedPlan === plan.id}
                      onChange={() => handleSelect(plan.id)}
                      className="mr-3 accent-[var(--primary)] w-5 h-5"
                    />
                    <span className="font-bold text-lg">{plan.name}</span>
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-[var(--muted)] text-[var(--muted-foreground)]">
                      {plan.interval}
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-extrabold text-[var(--primary)]">
                      {plan.price === '0'
                        ? 'Free'
                        : `${plan.price} ${plan.currency}`}
                    </span>
                    {plan.price !== '0' && (
                      <span className="text-sm text-[var(--muted-foreground)]">
                        / {plan.interval}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">
                    {plan.description || ''}
                  </div>
                  <ul className="list-disc ml-6 text-xs mt-2 space-y-1 text-[var(--card-foreground)]">
                    {plan.features?.map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                  </ul>
                </label>
              ))}
            </div>
            <button
              type="submit"
              disabled={!selectedPlan || submitting}
              className="
                mt-8 w-full py-3 rounded-xl font-semibold text-lg
                bg-gradient-to-r from-[var(--primary)] to-[var(--accent)]
                text-[var(--primary-foreground)]
                hover:from-[var(--accent)] hover:to-[var(--primary)]
                hover:text-[var(--accent-foreground)]
                transition-all shadow-lg
                disabled:opacity-60
              "
            >
              {submitting ? 'Submitting...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
