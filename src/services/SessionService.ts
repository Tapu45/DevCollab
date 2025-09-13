import { prisma } from '@/lib/Prisma';
import { generateDeviceId, getLocationFromIP, parseUserAgent } from '@/utils/session-utils';

interface SessionInfo {
    id: string;
    device: string;
    deviceType: string;
    location: string;
    ipAddress: string;
    lastActivity: Date;
    createdAt: Date;
    isActive: boolean;
    isCurrent: boolean;
}

class SessionService {
    // Create or update session with device tracking
    async createSession(
        userId: string,
        sessionToken: string,
        expires: Date,
        ipAddress: string,
        userAgent: string
    ): Promise<void> {
        const deviceInfo = parseUserAgent(userAgent);
        const deviceId = generateDeviceId(userAgent, ipAddress);
        const location = await getLocationFromIP(ipAddress);

        // Create or update device
        await prisma.userDevice.upsert({
            where: { deviceId },
            update: {
                deviceName: deviceInfo.deviceName,
                deviceType: deviceInfo.deviceType,
                osName: deviceInfo.osName,
                osVersion: deviceInfo.osVersion,
                browserName: deviceInfo.browserName,
                browserVersion: deviceInfo.browserVersion,
                lastUsed: new Date(),
            },
            create: {
                userId,
                deviceId,
                deviceName: deviceInfo.deviceName,
                deviceType: deviceInfo.deviceType,
                osName: deviceInfo.osName,
                osVersion: deviceInfo.osVersion,
                browserName: deviceInfo.browserName,
                browserVersion: deviceInfo.browserVersion,
                lastUsed: new Date(),
            },
        });

        // Create session
        await prisma.session.create({
            data: {
                sessionToken,
                userId,
                expires,
                device: deviceInfo.deviceName,
                deviceId,
                ipAddress,
                userAgent,
                location,
                isActive: true,
                lastActivity: new Date(),
            },
        });

        // Log session activity
        await this.logSessionActivity(sessionToken, 'LOGIN', ipAddress, userAgent, location);
    }

    // Get all active sessions for a user
    async getUserSessions(userId: string, currentSessionToken?: string): Promise<SessionInfo[]> {
        const sessions = await prisma.session.findMany({
            where: {
                userId,
                isActive: true,
                expires: { gt: new Date() }
            },
            orderBy: { lastActivity: 'desc' },
        });

        return sessions.map(session => ({
            id: session.id,
            device: session.device || 'Unknown Device',
            deviceType: this.getDeviceTypeFromDevice(session.device ?? undefined),
            location: session.location || 'Unknown Location',
            ipAddress: session.ipAddress || 'Unknown IP',
            lastActivity: session.lastActivity,
            createdAt: session.createdAt,
            isActive: session.isActive,
            isCurrent: session.sessionToken === currentSessionToken,
        }));
    }

    // Terminate a specific session
    async terminateSession(sessionId: string, userId: string): Promise<boolean> {
        const session = await prisma.session.findFirst({
            where: { id: sessionId, userId },
        });

        if (!session) {
            return false;
        }

        await prisma.session.update({
            where: { id: sessionId },
            data: {
                isActive: false,
                expires: new Date(), // Expire immediately
            },
        });

        // Log session termination
        await this.logSessionActivity(
            session.sessionToken,
            'TERMINATED',
            session.ipAddress ?? undefined,
            session.userAgent ?? undefined,
            session.location ?? undefined
        );

        return true;
    }

    // Terminate all other sessions (keep current one)
    async terminateOtherSessions(userId: string, currentSessionToken: string): Promise<number> {
        const result = await prisma.session.updateMany({
            where: {
                userId,
                sessionToken: { not: currentSessionToken },
                isActive: true
            },
            data: {
                isActive: false,
                expires: new Date(),
            },
        });

        // Log termination of other sessions
        const terminatedSessions = await prisma.session.findMany({
            where: {
                userId,
                sessionToken: { not: currentSessionToken },
                isActive: false
            },
        });

        for (const session of terminatedSessions) {
            await this.logSessionActivity(
                session.sessionToken,
                'TERMINATED',
                session.ipAddress ?? undefined,
                session.userAgent ?? undefined,
                session.location ?? undefined
            );
        }

        return result.count;
    }

    // Terminate all sessions
    async terminateAllSessions(userId: string): Promise<number> {
        const result = await prisma.session.updateMany({
            where: { userId, isActive: true },
            data: {
                isActive: false,
                expires: new Date(),
            },
        });

        return result.count;
    }

    // Update session activity
    async updateSessionActivity(sessionToken: string): Promise<void> {
        await prisma.session.updateMany({
            where: { sessionToken, isActive: true },
            data: { lastActivity: new Date() },
        });
    }

    // Get session activity logs
    async getSessionActivity(sessionId: string): Promise<any[]> {
        return await prisma.sessionActivity.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'desc' },
        });
    }

    // Log session activity
    private async logSessionActivity(
        sessionToken: string,
        action: string,
        ipAddress?: string,
        userAgent?: string,
        location?: string,
        metadata?: any
    ): Promise<void> {
        const session = await prisma.session.findUnique({
            where: { sessionToken },
        });

        if (session) {
            await prisma.sessionActivity.create({
                data: {
                    sessionId: session.id,
                    userId: session.userId,
                    action,
                    ipAddress,
                    userAgent,
                    location,
                    metadata,
                },
            });
        }
    }

    // Get device type from device string
    private getDeviceTypeFromDevice(device?: string): string {
        if (!device) return 'desktop';
        if (device.toLowerCase().includes('mobile') || device.toLowerCase().includes('iphone') || device.toLowerCase().includes('android')) {
            return 'mobile';
        }
        if (device.toLowerCase().includes('tablet') || device.toLowerCase().includes('ipad')) {
            return 'tablet';
        }
        return 'desktop';
    }

    // Clean up expired sessions
    async cleanupExpiredSessions(): Promise<number> {
        const result = await prisma.session.deleteMany({
            where: {
                OR: [
                    { expires: { lt: new Date() } },
                    { isActive: false }
                ]
            },
        });

        return result.count;
    }

    // Get session statistics
    async getSessionStats(userId: string): Promise<any> {
        const [totalSessions, activeSessions, deviceCount] = await Promise.all([
            prisma.session.count({ where: { userId } }),
            prisma.session.count({ where: { userId, isActive: true, expires: { gt: new Date() } } }),
            prisma.userDevice.count({ where: { userId } }),
        ]);

        const recentActivity = await prisma.sessionActivity.findMany({
            where: {
                session: { userId }
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: { session: true },
        });

        return {
            totalSessions,
            activeSessions,
            deviceCount,
            recentActivity,
        };
    }
}

export const sessionService = new SessionService();