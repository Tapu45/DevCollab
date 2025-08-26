import { PrismaClient } from "../../generated/prisma/index.js";
const prisma = new PrismaClient();

async function main() {
  await prisma.plan.createMany({
    data: [
      {
        name: 'Starter',
        type: 'FREE',
        price: 0,
        currency: 'INR',
        interval: 'monthly',
        features: JSON.stringify([
          'Basic Collaboration',
            'AI Matching',
          'Profile & Portfolio',
          '3 Projects',
          '10 Connections',
          'Basic Messaging'
        ]),
        maxProjects: 3,
        maxConnections: 10,
        maxTeamMembers: 5,
        hasAdvancedAI: false,
        hasAnalytics: false,
        hasPrioritySupport: false,
        hasApiAccess: false,
      },
      {
        name: 'Growth',
        type: 'PRO',
        price: 20,
        currency: 'USD',
        interval: 'monthly',
        features: JSON.stringify([
          'Advanced Collaboration',
          'AI Matching',
          '20 Projects',
          '200 Connections',
          'Team Management',
          'Analytics Dashboard',
          'Priority Support'
        ]),
        maxProjects: 20,
        maxConnections: 200,
        maxTeamMembers: 10,
        hasAdvancedAI: true,
        hasAnalytics: true,
        hasPrioritySupport: true,
        hasApiAccess: true,
      },
      {
        name: 'Enterprise',
        type: 'ENTERPRISE',
        price: 99,
        currency: 'USD',
        interval: 'monthly',
        features: JSON.stringify([
          'Unlimited Projects',
          'Unlimited Connections',
          'Advanced AI & Analytics',
          'Custom Integrations',
          'Admin Panel',
          'Premium Support',
          'API Access'
        ]),
        maxProjects: 9999,
        maxConnections: 9999,
        maxTeamMembers: 100,
        hasAdvancedAI: true,
        hasAnalytics: true,
        hasPrioritySupport: true,
        hasApiAccess: true,
      },
    ],
  });
}

main().finally(() => prisma.$disconnect());