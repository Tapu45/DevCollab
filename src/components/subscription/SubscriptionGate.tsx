import React from 'react';
import { PlanType } from '@/generated/prisma';
import { useSubscription } from '@/hooks/subscription/Subscriptionhook';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown } from 'lucide-react';

interface SubscriptionGateProps {
  requiredPlan: PlanType;
  feature: string;
  description?: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function SubscriptionGate({
  requiredPlan,
  feature,
  description,
  children,
  fallback
}: SubscriptionGateProps) {
  const { subscription, hasFeature, upgrade, isUpgrading } = useSubscription();

  const hasAccess = subscription && 
    (subscription.planType === requiredPlan || 
     (requiredPlan === PlanType.BASIC && ([PlanType.PRO, PlanType.ENTERPRISE] as PlanType[]).includes(subscription.planType)) ||
     (requiredPlan === PlanType.PRO && subscription.planType === PlanType.ENTERPRISE));

  if (hasAccess) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  const getPlanIcon = (plan: PlanType) => {
    switch (plan) {
      case PlanType.BASIC:
        return <Zap className="h-5 w-5" />;
      case PlanType.PRO:
        return <Crown className="h-5 w-5" />;
      case PlanType.ENTERPRISE:
        return <Crown className="h-5 w-5 text-purple-500" />;
      default:
        return <Lock className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-dashed">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {getPlanIcon(requiredPlan)}
        </div>
        <CardTitle className="text-lg">
          Upgrade to {requiredPlan} Plan
        </CardTitle>
        <CardDescription>
          {description || `${feature} is available for ${requiredPlan} subscribers and above.`}
        </CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <Badge variant="secondary" className="mb-4">
          {requiredPlan} Feature
        </Badge>
        <div className="space-y-2">
          <Button 
            onClick={() => upgrade(requiredPlan)}
            disabled={isUpgrading}
            className="w-full"
          >
            {isUpgrading ? 'Processing...' : `Upgrade to ${requiredPlan}`}
          </Button>
          <p className="text-xs text-muted-foreground">
            Your current plan: {subscription?.planType || 'FREE'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}