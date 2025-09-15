import { PrismaClient } from "../generated/prisma/index";
import { withAccelerate } from "@prisma/extension-accelerate";

let prisma: PrismaClient | null = null;

export async function getPrismaClient() {
    if (!prisma) {
        const databaseUrl = process.env.DATABASE_URL_ACCELERATE || process.env.DATABASE_URL;

        prisma = new PrismaClient({
            log: ['error'],
            datasources: {
                db: {
                    url: databaseUrl
                }
            }
        }).$extends(withAccelerate());
    }
    return prisma;
}

export async function disconnectPrisma() {
    if (prisma) {
        await prisma.$disconnect();
        prisma = null;
    }
}