import React from 'react';
import { PlanType } from '@/generated/prisma';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Zap, Crown } from 'lucide-react';
import { useSubscription } from '@/hooks/subscription/Subscriptionhook';

interface UpgradePromptProps {
  message?: string;
  currentPlan?: PlanType;
  requiredPlan?: PlanType;
  feature?: string;
}

export function UpgradePrompt({
  message,
  currentPlan,
  requiredPlan,
  feature,
}: UpgradePromptProps) {
  const { upgrade, isUpgrading } = useSubscription();

  const getPlanIcon = (plan?: PlanType) => {
    switch (plan) {
      case 'BASIC':
        return <Zap className="h-5 w-5" />;
      case 'PRO':
        return <Crown className="h-5 w-5" />;
      case 'ENTERPRISE':
        return <Crown className="h-5 w-5 text-purple-500" />;
      default:
        return <Lock className="h-5 w-5" />;
    }
  };

  return (
    <Card className="border-dashed text-center">
      <CardHeader>
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          {getPlanIcon(requiredPlan)}
        </div>
        <CardTitle>
          {requiredPlan ? `Upgrade to ${requiredPlan} Plan` : 'Upgrade Required'}
        </CardTitle>
        <CardDescription>
          {message ||
            (feature
              ? `The feature "${feature}" is not available in your current plan.`
              : 'Please upgrade your subscription to access this feature.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {requiredPlan && (
          <Badge variant="secondary" className="mb-4">
            {requiredPlan} Feature
          </Badge>
        )}
        <Button
          onClick={() => requiredPlan && upgrade(requiredPlan)}
          disabled={isUpgrading || !requiredPlan}
          className="w-full"
        >
          {isUpgrading ? 'Processing...' : requiredPlan ? `Upgrade to ${requiredPlan}` : 'Upgrade'}
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          Your current plan: {currentPlan || 'FREE'}
        </p>
      </CardContent>
      </Card>
  );
}