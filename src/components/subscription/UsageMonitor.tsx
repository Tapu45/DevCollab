import React from 'react';
import { useSubscription } from '@/hooks/subscription/Subscriptionhook';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp } from 'lucide-react';

export function UsageMonitor() {
  const { 
    subscription, 
    usage, 
    getUsagePercentage, 
    isNearLimit, 
    getRemainingQuota,
    upgrade 
  } = useSubscription();

  if (!subscription || !usage) return null;

  const usageItems = [
    {
      label: 'Projects',
      current: usage.projects,
      limit: subscription.limits.maxProjects,
      percentage: getUsagePercentage('projects'),
      isNearLimit: isNearLimit('projects'),
    },
    {
      label: 'Connections',
      current: usage.connections,
      limit: subscription.limits.maxConnections,
      percentage: getUsagePercentage('connections'),
      isNearLimit: isNearLimit('connections'),
    },
    {
      label: 'Team Members',
      current: usage.teamMembers,
      limit: subscription.limits.maxTeamMembers,
      percentage: getUsagePercentage('teamMembers'),
      isNearLimit: isNearLimit('teamMembers'),
    },
  ];

  const hasAnyNearLimit = usageItems.some(item => item.isNearLimit);

  return (
    <Card className={hasAnyNearLimit ? 'border-orange-200' : ''}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Usage Overview
          {hasAnyNearLimit && (
            <Badge variant="destructive" className="ml-auto">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Near Limit
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Current plan: {subscription.planType}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {usageItems.map((item) => (
          <div key={item.label} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{item.label}</span>
              <span className={item.isNearLimit ? 'text-orange-600' : 'text-muted-foreground'}>
                {item.current} / {item.limit === -1 ? '∞' : item.limit}
              </span>
            </div>
            <Progress 
              value={item.percentage} 
              className={`h-2 ${item.isNearLimit ? 'bg-orange-100' : ''}`}
            />
          </div>
        ))}
        
        {hasAnyNearLimit && subscription.planType !== 'ENTERPRISE' && (
          <div className="pt-4 border-t">
            <p className="text-sm text-orange-600 mb-2">
              You're approaching your plan limits. Consider upgrading for more capacity.
            </p>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                const nextPlan = subscription.planType === 'FREE' ? 'BASIC' : 
                               subscription.planType === 'BASIC' ? 'PRO' : 'ENTERPRISE';
                upgrade(nextPlan as any);
              }}
            >
              Upgrade Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}