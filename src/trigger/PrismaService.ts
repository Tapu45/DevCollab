import { PrismaClient } from "../generated/prisma/index";

let prisma: PrismaClient | null = null;

export async function getPrismaClient() {
    if (!prisma) {
        prisma = new PrismaClient({
            log: ['error'],
            datasources: {
                db: {
                    url: process.env.DATABASE_URL
                }
            }
        });
    }
    return prisma;
}

export async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
    }
}