'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  Calendar,
  DollarSign,
  BarChart3,
  Zap,
  Crown,
  Star,
  RefreshCw,
  Download,
  Settings,
  Bell,
  Shield,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSubscription } from '@/hooks/subscription/Subscriptionhook';
import { usePusherEvent } from '@/hooks/Pusher';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { PlanType } from '@/generated/prisma';

interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  currency: string;
  interval: string;
  features: string[];
  maxProjects: number;
  maxConnections: number;
  maxTeamMembers: number;
  hasAdvancedAI: boolean;
  hasAnalytics: boolean;
  hasPrioritySupport: boolean;
  hasApiAccess: boolean;
}

interface UsageStats {
  projects: number;
  connections: number;
  teamMembers: number;
  storageUsed: number;
  apiCallsToday: number;
  postsToday: number;
  messagesToday: number;
}

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  createdAt: string;
}

export default function SubscriptionPage() {
  const { user } = useUser();
  const {
    subscription,
    usage,
    isLoading,
    getUsagePercentage,
    isNearLimit,
    getRemainingQuota,
    upgrade,
    cancel,
  } = useSubscription();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  // Real-time subscription updates
  usePusherEvent({
    channelName: user?.id ? `user-${user.id}` : '',
    eventName: 'subscription_updated',
    callback: (data) => {
      toast.success('Subscription updated successfully!');
      // Refresh subscription data
      window.location.reload();
    },
  });

  // Real-time usage updates
  usePusherEvent({
    channelName: user?.id ? `user-${user.id}` : '',
    eventName: 'usage_updated',
    callback: (data: UsageStats) => {
      // Update usage in real-time
      toast.info('Usage updated');
    },
  });

  useEffect(() => {
    fetchPlans();
    fetchInvoices();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoadingPlans(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const response = await fetch('/api/subscription/invoices');
      const data = await response.json();
      setInvoices(data.invoices || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
      toast.error('Failed to load billing history');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleUpgrade = async (planType: PlanType) => {
    try {
      await upgrade(planType);
    } catch (error) {
      toast.error('Failed to upgrade subscription');
    }
  };

  const handleCancel = async () => {
    if (window.confirm('Are you sure you want to cancel your subscription?')) {
      try {
        await cancel();
        toast.success('Subscription cancelled successfully');
      } catch (error) {
        toast.error('Failed to cancel subscription');
      }
    }
  };

  const getPlanIcon = (planType: PlanType) => {
    switch (planType) {
      case 'FREE':
        return <Shield className="h-5 w-5" />;
      case 'BASIC':
        return <Zap className="h-5 w-5" />;
      case 'PRO':
        return <Crown className="h-5 w-5" />;
      case 'ENTERPRISE':
        return <Star className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getPlanColor = (planType: PlanType) => {
    switch (planType) {
      case 'FREE':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'BASIC':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'PRO':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'ENTERPRISE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading subscription details...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 border border-border/50 mb-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>

          <div className="relative p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <CreditCard className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent-foreground bg-clip-text text-transparent">
                    Subscription & Billing
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Manage your subscription, track usage, and view billing
                    history
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  className={getPlanColor(subscription?.planType || 'FREE')}
                >
                  {getPlanIcon(subscription?.planType || 'FREE')}
                  <span className="ml-1">
                    {subscription?.planType || 'FREE'}
                  </span>
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {subscription?.isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage & Limits</TabsTrigger>
            <TabsTrigger value="plans">Plans & Pricing</TabsTrigger>
            <TabsTrigger value="billing">Billing History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Current Plan Card */}
              {/* Current Plan Card - Updated for Monthly Billing */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold">
                        {subscription?.planType || 'FREE'}
                      </span>
                      <Badge
                        variant={
                          subscription?.isActive ? 'default' : 'secondary'
                        }
                      >
                        {subscription?.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* NEW: Monthly Billing Info */}
                    {subscription?.planType !== 'FREE' &&
                      subscription?.nextBillingDate && (
                        <div className="text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 inline mr-1" />
                          Next billing:{' '}
                          {new Date(
                            subscription.nextBillingDate,
                          ).toLocaleDateString()}
                        </div>
                      )}

                    {/* NEW: Grace Period Warning */}
                    {subscription?.gracePeriodEnd &&
                      new Date(subscription.gracePeriodEnd) > new Date() && (
                        <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">
                            Payment overdue. Grace period ends{' '}
                            {new Date(
                              subscription.gracePeriodEnd,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}

                    {/* NEW: Failed Payment Count */}
                    {subscription?.failedPaymentCount &&
                      subscription.failedPaymentCount > 0 && (
                        <div className="text-sm text-red-600">
                          Failed payments: {subscription.failedPaymentCount}
                        </div>
                      )}

                    {/* NEW: Auto-renewal Status */}
                    {subscription?.planType !== 'FREE' && (
                      <div className="text-sm text-muted-foreground">
                        <RefreshCw className="h-4 w-4 inline mr-1" />
                        Auto-renewal:{' '}
                        {subscription?.autoRenew ? 'Enabled' : 'Disabled'}
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => handleUpgrade('PRO' as PlanType)}
                        disabled={subscription?.planType === 'ENTERPRISE'}
                      >
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        Upgrade Plan
                      </Button>
                      {subscription?.planType !== 'FREE' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={handleCancel}
                        >
                          Cancel Subscription
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* NEW: Billing Status Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Billing Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Plan Type
                      </span>
                      <span className="font-medium">
                        {subscription?.planType || 'FREE'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Billing Cycle
                      </span>
                      <span className="font-medium">
                        {subscription?.planType === 'FREE'
                          ? 'Lifetime'
                          : 'Monthly'}
                      </span>
                    </div>
                    {subscription?.lastPaymentDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Last Payment
                        </span>
                        <span className="font-medium">
                          {new Date(
                            subscription.lastPaymentDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    {subscription?.nextBillingDate && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Next Billing
                        </span>
                        <span className="font-medium">
                          {new Date(
                            subscription.nextBillingDate,
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Projects
                      </span>
                      <span className="font-medium">
                        {usage?.projects || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Connections
                      </span>
                      <span className="font-medium">
                        {usage?.connections || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Team Members
                      </span>
                      <span className="font-medium">
                        {usage?.teamMembers || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        Messages Today
                      </span>
                      <span className="font-medium">
                        {usage?.messagesToday || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Usage Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {usage && subscription && (
                      <>
                        {isNearLimit('projects') && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Projects near limit</span>
                          </div>
                        )}
                        {isNearLimit('connections') && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">
                              Connections near limit
                            </span>
                          </div>
                        )}
                        {isNearLimit('teamMembers') && (
                          <div className="flex items-center gap-2 text-orange-600">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">
                              Team members near limit
                            </span>
                          </div>
                        )}
                        {!isNearLimit('projects') &&
                          !isNearLimit('connections') &&
                          !isNearLimit('teamMembers') && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">
                                All usage within limits
                              </span>
                            </div>
                          )}
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usage & Limits Tab */}
          <TabsContent value="usage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Usage Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usage && subscription && (
                  <div className="space-y-6">
                    {/* Projects Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Projects</span>
                        <span
                          className={
                            isNearLimit('projects')
                              ? 'text-orange-600'
                              : 'text-muted-foreground'
                          }
                        >
                          {usage.projects} /{' '}
                          {subscription.limits.maxProjects === -1
                            ? '∞'
                            : subscription.limits.maxProjects}
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage('projects')}
                        className={`h-2 ${isNearLimit('projects') ? 'bg-orange-100' : ''}`}
                      />
                      <div className="text-xs text-muted-foreground">
                        {getRemainingQuota('projects')} remaining
                      </div>
                    </div>

                    {/* Connections Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Connections</span>
                        <span
                          className={
                            isNearLimit('connections')
                              ? 'text-orange-600'
                              : 'text-muted-foreground'
                          }
                        >
                          {usage.connections} /{' '}
                          {subscription.limits.maxConnections === -1
                            ? '∞'
                            : subscription.limits.maxConnections}
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage('connections')}
                        className={`h-2 ${isNearLimit('connections') ? 'bg-orange-100' : ''}`}
                      />
                      <div className="text-xs text-muted-foreground">
                        {getRemainingQuota('connections')} remaining
                      </div>
                    </div>

                    {/* Team Members Usage */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Team Members</span>
                        <span
                          className={
                            isNearLimit('teamMembers')
                              ? 'text-orange-600'
                              : 'text-muted-foreground'
                          }
                        >
                          {usage.teamMembers} /{' '}
                          {subscription.limits.maxTeamMembers === -1
                            ? '∞'
                            : subscription.limits.maxTeamMembers}
                        </span>
                      </div>
                      <Progress
                        value={getUsagePercentage('teamMembers')}
                        className={`h-2 ${isNearLimit('teamMembers') ? 'bg-orange-100' : ''}`}
                      />
                      <div className="text-xs text-muted-foreground">
                        {getRemainingQuota('teamMembers')} remaining
                      </div>
                    </div>

                    {/* Daily Usage */}
                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {usage.messagesToday}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Messages Today
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">
                          {usage.postsToday}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Posts Today
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plans & Pricing Tab */}
          <TabsContent value="plans" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {loadingPlans ? (
                <div className="col-span-full flex items-center justify-center py-8">
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  <span>Loading plans...</span>
                </div>
              ) : (
                plans.map((plan) => (
                  <Card
                    key={plan.id}
                    className={`relative ${plan.type === subscription?.planType ? 'ring-2 ring-primary' : ''}`}
                  >
                    {plan.type === subscription?.planType && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Current Plan
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        {getPlanIcon(plan.type)}
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                      </div>
                      <div className="text-3xl font-bold">
                        ${plan.price}
                        <span className="text-sm font-normal text-muted-foreground">
                          /
                          {plan.interval === 'lifetime'
                            ? 'lifetime'
                            : plan.interval}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="text-sm">
                            <span className="font-medium">Projects:</span>{' '}
                            {plan.maxProjects === -1
                              ? 'Unlimited'
                              : plan.maxProjects}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Connections:</span>{' '}
                            {plan.maxConnections === -1
                              ? 'Unlimited'
                              : plan.maxConnections}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Team Members:</span>{' '}
                            {plan.maxTeamMembers === -1
                              ? 'Unlimited'
                              : plan.maxTeamMembers}
                          </div>
                        </div>

                        <div className="space-y-1">
                          {plan.hasAdvancedAI && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Advanced AI</span>
                            </div>
                          )}
                          {plan.hasAnalytics && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Analytics</span>
                            </div>
                          )}
                          {plan.hasPrioritySupport && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>Priority Support</span>
                            </div>
                          )}
                          {plan.hasApiAccess && (
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span>API Access</span>
                            </div>
                          )}
                        </div>

                        <Button
                          className="w-full"
                          variant={
                            plan.type === subscription?.planType
                              ? 'outline'
                              : 'default'
                          }
                          disabled={plan.type === subscription?.planType}
                          onClick={() => handleUpgrade(plan.type)}
                        >
                          {plan.type === subscription?.planType
                            ? 'Current Plan'
                            : 'Upgrade'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          {/* Billing History Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Billing History
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingInvoices ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                    <span>Loading billing history...</span>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No billing history found
                  </div>
                ) : (
                  <div className="space-y-4">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-muted">
                            {invoice.status === 'PAID' ? (
                              <CheckCircle className="h-5 w-5 text-green-500" />
                            ) : (
                              <XCircle className="h-5 w-5 text-red-500" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium">
                              ${invoice.amount} {invoice.currency}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(invoice.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge
                            variant={
                              invoice.status === 'PAID'
                                ? 'default'
                                : 'destructive'
                            }
                          >
                            {invoice.status}
                          </Badge>
                          {invoice.paidAt && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Paid on{' '}
                              {new Date(invoice.paidAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
