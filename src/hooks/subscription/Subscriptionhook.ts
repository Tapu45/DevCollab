import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { PlanType, SubscriptionStatus } from '@/generated/prisma';
import { toast } from 'sonner';

export const PLAN_LIMITS = {
  FREE: {
    maxProjects: 3,
    maxConnections: 50,
    maxTeamMembers: 3,
    hasAdvancedAI: false,
    hasAnalytics: false,
    hasPrioritySupport: false,
    hasApiAccess: false,
    maxFileSize: 5, // MB
    maxStorageSize: 100, // MB
    dailyApiCalls: 100,
    canCreateEvents: false,
    maxEventAttendees: 0,
    canAccessForum: true,
    canCreatePosts: 5,
    canSendMessages: 50,
  },
  BASIC: {
    maxProjects: 10,
    maxConnections: 200,
    maxTeamMembers: 8,
    hasAdvancedAI: true,
    hasAnalytics: false,
    hasPrioritySupport: false,
    hasApiAccess: false,
    maxFileSize: 25,
    maxStorageSize: 1000,
    dailyApiCalls: 500,
    canCreateEvents: true,
    maxEventAttendees: 50,
    canAccessForum: true,
    canCreatePosts: 20,
    canSendMessages: 200,
  },
  PRO: {
    maxProjects: 50,
    maxConnections: 1000,
    maxTeamMembers: 25,
    hasAdvancedAI: true,
    hasAnalytics: true,
    hasPrioritySupport: true,
    hasApiAccess: true,
    maxFileSize: 100,
    maxStorageSize: 10000,
    dailyApiCalls: 2000,
    canCreateEvents: true,
    maxEventAttendees: 200,
    canAccessForum: true,
    canCreatePosts: 100,
    canSendMessages: 1000,
  },
  ENTERPRISE: {
    maxProjects: -1,
    maxConnections: -1,
    maxTeamMembers: -1,
    hasAdvancedAI: true,
    hasAnalytics: true,
    hasPrioritySupport: true,
    hasApiAccess: true,
    maxFileSize: 500,
    maxStorageSize: -1,
    dailyApiCalls: -1,
    canCreateEvents: true,
    maxEventAttendees: -1,
    canAccessForum: true,
    canCreatePosts: -1,
    canSendMessages: -1,
  },
};

export interface UserSubscriptionInfo {
  userId: any;
  planType: PlanType;
  status: SubscriptionStatus;
  limits: typeof PLAN_LIMITS.FREE;
  isActive: boolean;
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  razorpaySubscriptionId?: string;
}

export interface UsageStats {
  projects: number;
  connections: number;
  teamMembers: number;
  storageUsed: number;
  apiCallsToday: number;
  postsToday: number;
  messagesToday: number;
}

export function useSubscription() {
  const { user } = useUser();
  const queryClient = useQueryClient();

  const {
    data: subscription,
    isLoading,
    error
  } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<UserSubscriptionInfo> => {
      const response = await fetch('/api/subscription/current');
      if (!response.ok) {
        throw new Error('Failed to fetch subscription');
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  const {
    data: usage,
    isLoading: isUsageLoading
  } = useQuery({
    queryKey: ['usage', user?.id],
    queryFn: async (): Promise<UsageStats> => {
      const response = await fetch('/api/subscription/usage');
      if (!response.ok) {
        throw new Error('Failed to fetch usage stats');
      }
      return response.json();
    },
    enabled: !!user?.id,
  });

  const trackUsage = useMutation({
    mutationFn: async ({ action, resource }: { action: string; resource: string }) => {
      const response = await fetch('/api/subscription/track-usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, resource }),
      });
      if (!response.ok) {
        throw new Error('Failed to track usage');
      }
      return response.json();
    },
  });

  const upgradeMutation = useMutation({
    mutationFn: async (planType: PlanType) => {
      const response = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upgrade subscription');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast.success('Upgrade initiated successfully!');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      // Open Razorpay checkout
      if (data.razorpayOrderId) {
        openRazorpayCheckout(data);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success('Subscription cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  const openRazorpayCheckout = (orderData: any) => {
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: orderData.amount,
      currency: orderData.currency,
      name: 'DevCollab',
      description: `Upgrade to ${orderData.planType} Plan`,
      order_id: orderData.razorpayOrderId,
      handler: async (response: any) => {
        try {
          const verifyResponse = await fetch('/api/subscription/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          if (verifyResponse.ok) {
            toast.success('Payment successful! Your subscription has been upgraded.');
            queryClient.invalidateQueries({ queryKey: ['subscription'] });
          } else {
            toast.error('Payment verification failed');
          }
        } catch (error) {
          toast.error('Payment processing failed');
        }
      },
      prefill: {
        email: user?.primaryEmailAddress?.emailAddress,
        name: user?.fullName,
      },
      theme: {
        color: '#3b82f6',
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
  };

  // Helper functions
  const hasFeature = (feature: keyof typeof PLAN_LIMITS.FREE): boolean => {
    if (!subscription) return false;
    return subscription.limits[feature] as boolean;
  };

  const canPerformAction = (action: keyof typeof PLAN_LIMITS.FREE, currentUsage?: number): boolean => {
    if (!subscription || !usage) return false;

    const limit = subscription.limits[action] as number;
    if (limit === -1) return true; // Unlimited

    const current = currentUsage ?? (usage as any)[action.replace('max', '').toLowerCase()];
    return current < limit;
  };

  const getUsagePercentage = (usageType: keyof UsageStats): number => {
    if (!subscription || !usage) return 0;

    const limitKey = `max${usageType.charAt(0).toUpperCase() + usageType.slice(1)}` as keyof typeof PLAN_LIMITS.FREE;
    const limit = subscription.limits[limitKey] as number;

    if (limit === -1) return 0; // Unlimited

    const current = usage[usageType];
    return Math.min((current / limit) * 100, 100);
  };

  const isNearLimit = (usageType: keyof UsageStats, threshold = 80): boolean => {
    return getUsagePercentage(usageType) >= threshold;
  };

  const getRemainingQuota = (quotaType: keyof UsageStats): number => {
    if (!subscription || !usage) return 0;

    const limitKey = `max${quotaType.charAt(0).toUpperCase() + quotaType.slice(1)}` as keyof typeof PLAN_LIMITS.FREE;
    const limit = subscription.limits[limitKey] as number;

    if (limit === -1) return Infinity; // Unlimited

    const current = usage[quotaType];
    return Math.max(limit - current, 0);
  };

  return {
    subscription,
    usage,
    isLoading: isLoading || isUsageLoading,
    error,

    // Actions
    upgrade: upgradeMutation.mutate,
    cancel: cancelMutation.mutate,
    isUpgrading: upgradeMutation.isPending,
    isCanceling: cancelMutation.isPending,

    // Helper functions
    hasFeature,
    canPerformAction,
    getUsagePercentage,
    isNearLimit,
    getRemainingQuota,
    trackUsage: trackUsage.mutate,

    // Quick access to common checks
    canCreateProject: () => canPerformAction('maxProjects', usage?.projects),
    canAddConnection: () => canPerformAction('maxConnections', usage?.connections),
    canAddTeamMember: () => canPerformAction('maxTeamMembers', usage?.teamMembers),
    hasAdvancedAI: () => hasFeature('hasAdvancedAI'),
    hasAnalytics: () => hasFeature('hasAnalytics'),
    hasPrioritySupport: () => hasFeature('hasPrioritySupport'),
    hasApiAccess: () => hasFeature('hasApiAccess'),
  };
}