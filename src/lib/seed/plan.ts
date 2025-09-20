import { PrismaClient, PlanType } from "../../generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Starter',
      type: PlanType.FREE,
      price: 0,
      currency: 'INR',
      interval: 'lifetime', // Changed to lifetime for FREE plan
      features: [
        'Basic Collaboration',
        'AI Matching',
        'Profile & Portfolio',
        '3 Projects',
        '10 Connections',
        'Basic Messaging'
      ],
      maxProjects: 3,
      maxConnections: 10,
      maxTeamMembers: 5,
      hasAdvancedAI: false,
      hasAnalytics: false,
      hasPrioritySupport: false,
      hasApiAccess: false,
      dailyRefreshLimit: 3,
    },
    {
      name: 'Growth',
      type: PlanType.PRO,
      price: 20,
      currency: 'USD',
      interval: 'monthly', // Monthly billing
      features: [
        'Advanced Collaboration',
        'AI Matching',
        '20 Projects',
        '200 Connections',
        'Team Management',
        'Analytics Dashboard',
        'Priority Support'
      ],
      maxProjects: 20,
      maxConnections: 200,
      maxTeamMembers: 10,
      hasAdvancedAI: true,
      hasAnalytics: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      dailyRefreshLimit: 10,
    },
    {
      name: 'Enterprise',
      type: PlanType.ENTERPRISE,
      price: 99,
      currency: 'USD',
      interval: 'monthly', // Monthly billing
      features: [
        'Unlimited Projects',
        'Unlimited Connections',
        'Advanced AI & Analytics',
        'Custom Integrations',
        'Admin Panel',
        'Premium Support',
        'API Access'
      ],
      maxProjects: 9999,
      maxConnections: 9999,
      maxTeamMembers: 100,
      hasAdvancedAI: true,
      hasAnalytics: true,
      hasPrioritySupport: true,
      hasApiAccess: true,
      dailyRefreshLimit: 9999,
    },
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { type: plan.type },
      update: {
        ...plan,
        features: JSON.stringify(plan.features),
      },
      create: {
        ...plan,
        features: JSON.stringify(plan.features),
      },
    });
  }

  console.log('✅ Plans seeded successfully with monthly billing');
}

main().finally(() => prisma.$disconnect());