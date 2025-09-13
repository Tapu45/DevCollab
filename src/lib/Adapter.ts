import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/Prisma';
import { getClientIP, getClientUserAgent, parseUserAgent, generateDeviceId, getLocationFromIP } from '@/utils/session-utils';
import type { NextRequest } from 'next/server';
import type { Adapter } from 'next-auth/adapters';

export function CustomPrismaAdapter(req: Request | NextRequest): Adapter {
    const baseAdapter = PrismaAdapter(prisma);

    // Ensure the original adapter has the createSession method
    if (!baseAdapter.createSession) {
        console.error("Original adapter doesn't have createSession method");
        return baseAdapter;
    }

    return {
        ...baseAdapter,
        async createSession(session) {
            try {
                // Safely extract client information
                const ip = (req && 'headers' in req && 'cookies' in req)
                    ? getClientIP(req as NextRequest)
                    : 'unknown';
                let userAgent: string;
                if ('cookies' in req && 'nextUrl' in req) {
                    userAgent = getClientUserAgent(req as NextRequest);
                } else {
                    userAgent = req.headers.get('user-agent') || 'unknown';
                }
                const deviceInfo = parseUserAgent(userAgent);
                const deviceId = generateDeviceId(userAgent, ip);
                // Make location optional to avoid waiting for external API
                let location = "Unknown";
                try {
                    location = await getLocationFromIP(ip);
                } catch (e) {
                    console.error("Failed to get location:", e);
                }

                console.log("Creating enhanced session with device info:", {
                    userId: session.userId,
                    deviceId,
                    device: deviceInfo.deviceName,
                });

                // Create the enhanced session
                const createdSession = await baseAdapter.createSession!({
                    ...session,
                    deviceId,
                    device: deviceInfo.deviceName,
                    ipAddress: ip,
                    userAgent: userAgent,
                    location: location
                } as any);

                if (!createdSession) {
                    throw new Error("Failed to create session");
                }

                return createdSession;

            } catch (error) {
                console.error("Error in custom session creation:", error);
                // Fallback to original adapter if our customization fails
                if (baseAdapter.createSession) {
                    const fallbackSession = await baseAdapter.createSession(session);
                    if (!fallbackSession) {
                        throw new Error("Failed to create session in fallback");
                    }
                    return fallbackSession;
                }
                throw error;
            }
        }
    };
}