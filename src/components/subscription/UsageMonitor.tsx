'use client';

import React, { useEffect, useState } from 'react';
import { useSubscription } from '@/hooks/subscription/Subscriptionhook';
import { usePusherEvent } from '@/hooks/Pusher';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, RefreshCw, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface RealTimeUsageMonitorProps {
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export function RealTimeUsageMonitor({
  showUpgradeButton = true,
  compact = false,
}: RealTimeUsageMonitorProps) {
  const {
    subscription,
    usage,
    getUsagePercentage,
    isNearLimit,
    getRemainingQuota,
    upgrade,
  } = useSubscription();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time usage updates
  usePusherEvent({
    channelName: subscription ? `user-${subscription.userId}` : '',
    eventName: 'usage_updated',
    callback: (data) => {
      setLastUpdated(new Date());
      // Show a subtle notification for usage updates
      if (data.action === 'CREATE' && data.resource) {
        toast.info(`${data.resource} created successfully`);
      }
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      // Trigger a refresh of usage data
      window.location.reload();
    } catch (error) {
      toast.error('Failed to refresh usage data');
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!subscription || !usage) return null;

  const usageItems = [
    {
      label: 'Projects',
      current: usage.projects,
      limit: subscription.limits.maxProjects,
      percentage: getUsagePercentage('projects'),
      isNearLimit: isNearLimit('projects'),
      icon: '📁',
    },
    {
      label: 'Connections',
      current: usage.connections,
      limit: subscription.limits.maxConnections,
      percentage: getUsagePercentage('connections'),
      isNearLimit: isNearLimit('connections'),
      icon: '👥',
    },
    {
      label: 'Team Members',
      current: usage.teamMembers,
      limit: subscription.limits.maxTeamMembers,
      percentage: getUsagePercentage('teamMembers'),
      isNearLimit: isNearLimit('teamMembers'),
      icon: '👨‍💼',
    },
  ];

  const hasAnyNearLimit = usageItems.some((item) => item.isNearLimit);
  const hasAnyAtLimit = usageItems.some((item) => item.percentage >= 100);

  if (compact) {
    return (
      <div className="space-y-2">
        {usageItems.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span>{item.icon}</span>
              {item.label}
            </span>
            <span
              className={
                item.isNearLimit
                  ? 'text-orange-600 font-medium'
                  : 'text-muted-foreground'
              }
            >
              {item.current} / {item.limit === -1 ? '∞' : item.limit}
            </span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <Card
      className={`${hasAnyNearLimit ? 'border-orange-200' : ''} ${hasAnyAtLimit ? 'border-red-200' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Usage Overview
            {hasAnyNearLimit && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Near Limit
              </Badge>
            )}
            {hasAnyAtLimit && (
              <Badge variant="destructive" className="ml-2">
                <AlertTriangle className="h-3 w-3 mr-1" />
                At Limit
              </Badge>
            )}
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
        <CardDescription>
          Current plan: {subscription.planType} • Last updated:{' '}
          {lastUpdated.toLocaleTimeString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center gap-2">
                <span>{item.icon}</span>
                {item.label}
              </span>
              <span
                className={
                  item.isNearLimit
                    ? 'text-orange-600 font-medium'
                    : 'text-muted-foreground'
                }
              >
                {item.current} / {item.limit === -1 ? '∞' : item.limit}
                {item.percentage > 0 && (
                  <span className="ml-1">({Math.round(item.percentage)}%)</span>
                )}
              </span>
            </div>
            <Progress
              value={item.percentage}
              className={`h-2 ${
                item.percentage >= 100
                  ? 'bg-red-100'
                  : item.isNearLimit
                    ? 'bg-orange-100'
                    : ''
              }`}
            />
            {item.percentage > 0 && (
              <div className="text-xs text-muted-foreground">
                {getRemainingQuota(
                  item.label.toLowerCase().replace(' ', '') as any,
                )}{' '}
                remaining
              </div>
            )}
          </div>
        ))}

        {/* Daily Usage Stats */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {usage.messagesToday}
              </div>
              <div className="text-xs text-muted-foreground">
                Messages Today
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {usage.postsToday}
              </div>
              <div className="text-xs text-muted-foreground">Posts Today</div>
            </div>
          </div>
        </div>

        {showUpgradeButton &&
          (hasAnyNearLimit || hasAnyAtLimit) &&
          subscription.planType !== 'ENTERPRISE' && (
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">
                    {hasAnyAtLimit
                      ? "You've reached your plan limits!"
                      : "You're approaching your plan limits."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Consider upgrading for more capacity and features.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    const nextPlan =
                      subscription.planType === 'FREE'
                        ? 'BASIC'
                        : subscription.planType === 'BASIC'
                          ? 'PRO'
                          : 'ENTERPRISE';
                    upgrade(nextPlan as any);
                  }}
                  className="ml-4"
                >
                  <Zap className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
