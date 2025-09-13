import { NextRequest } from 'next/server';
import { UAParser } from 'ua-parser-js';

export function getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIP = req.headers.get('x-real-ip');
    const cfConnectingIP = req.headers.get('cf-connecting-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    if (cfConnectingIP) {
        return cfConnectingIP;
    }

    return 'unknown';
}

export function getClientUserAgent(req: NextRequest): string {
    return req.headers.get('user-agent') || 'unknown';
}

export function parseUserAgent(userAgent: string) {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();

    return {
        deviceName: `${result.browser.name || 'Unknown'} on ${result.os.name || 'Unknown'}`,
        deviceType: getDeviceType(result.device.type),
        osName: result.os.name,
        osVersion: result.os.version,
        browserName: result.browser.name,
        browserVersion: result.browser.version,
    };
}

function getDeviceType(deviceType?: string): string {
    if (!deviceType) return 'desktop';
    if (deviceType === 'mobile') return 'mobile';
    if (deviceType === 'tablet') return 'tablet';
    return 'desktop';
}

export function generateDeviceId(userAgent: string, ipAddress: string): string {
    // Generate a unique device ID based on user agent and IP
    const combined = `${userAgent}-${ipAddress}`;
    return Buffer.from(combined).toString('base64').slice(0, 32);
}

export async function getLocationFromIP(ipAddress: string): Promise<string> {
    try {
        // Skip external API calls for localhost
        if (ipAddress === '127.0.0.1' || ipAddress === '::1') {
            return 'Local Development';
        }

        // Skip API call for unknown IPs
        if (ipAddress === 'unknown') {
            return 'Unknown Location';
        }

        // Get API token from environment variables
        const token = process.env.IPINFO_API_TOKEN;

        if (!token) {
            console.warn('IPINFO_API_TOKEN not set in environment variables');
            return 'Unknown Location';
        }

        // Call ipinfo.io API with token
        const response = await fetch(`https://ipinfo.io/${ipAddress}/json?token=${token}`);

        if (!response.ok) {
            throw new Error(`ipinfo.io API error: ${response.status}`);
        }

        const data = await response.json();

        // Return city and country if available
        if (data.city && data.country) {
            // Optional: Add region if available
            if (data.region) {
                return `${data.city}, ${data.region}, ${data.country}`;
            }
            return `${data.city}, ${data.country}`;
        }

        // Return just country if city is not available
        if (data.country) {
            return data.country;
        }

        return 'Unknown Location';
    } catch (error) {
        console.error('Location fetch error:', error);
        return 'Unknown Location';
    }
}