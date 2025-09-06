'use client'

import { ReactNode } from 'react'
import { useSubscription } from '@/hooks/subscription/Subscriptionhook'
import { PlanType } from '@/generated/prisma'
import { UpgradePrompt } from './UpgradePrompt'
import  Loader  from '@/components/shared/Loader'

interface SubscriptionGuardProps {
  children: ReactNode
  requiredPlan?: PlanType
  requiredFeature?: 'hasAdvancedAI' | 'hasAnalytics' | 'hasPrioritySupport' | 'hasApiAccess'
  fallback?: ReactNode
}

const PLAN_HIERARCHY = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
  ENTERPRISE: 3,
}

export function SubscriptionGuard({ 
  children, 
  requiredPlan, 
  requiredFeature,
  fallback 
}: SubscriptionGuardProps) {
const { subscription, isLoading } = useSubscription();
const planType = subscription?.planType;
const limits = subscription?.limits;

  if (isLoading) {
    return <Loader />
  }

  // Replace isActive check with a subscription existence check or your own logic
  if (!subscription) {
    return fallback || <UpgradePrompt message="Your subscription is not active. Please upgrade to continue." />
  }

  // Check plan level requirement
  if (requiredPlan) {
    const currentPlanLevel = planType ? PLAN_HIERARCHY[planType] : PLAN_HIERARCHY.FREE;
    const requiredPlanLevel = PLAN_HIERARCHY[requiredPlan];

    if (currentPlanLevel < requiredPlanLevel) {
      return fallback || <UpgradePrompt 
        message={`This feature requires ${requiredPlan} plan or higher.`}
        currentPlan={planType}
        requiredPlan={requiredPlan}
      />
    }
  }

  // Check specific feature requirement
  if (requiredFeature && (!limits || !limits[requiredFeature])) {
    return fallback || <UpgradePrompt 
      message={`This feature is not available in your current plan.`}
      feature={requiredFeature}
    />
  }

  return <>{children}</>
}