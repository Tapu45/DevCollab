/**
 * Grace-Period helper
 *
 * Works in both browser and server contexts (Next.js style).
 * Exports small, well-typed helpers to set/get/clear a 7-day (or configurable) "grace" timestamp.
 *
 * Usage:
 * - setGraceDays(7)                         // client or server (pass res to set server-side header)
 * - isGraceActive()                         // client check
 * - isGraceActive({ req })                  // server check (pass IncomingMessage or NextRequest-like)
 * - getGraceUntil() / getGraceUntil({req})
 * - clearGrace() / clearGrace({ res })
 */

type ServerRequestLike = { headers?: { get?: (name: string) => string | null } } | { headers?: Record<string, any> } | any;
type ServerResponseLike = {
    // simple compatible shapes:
    setHeader?: (name: string, value: string | string[]) => void;
    getHeader?: (name: string) => string | string[] | undefined;
    headers?: { append?: (name: string, value: string) => void; set?: (name: string, value: string) => void };
    cookies?: { set?: (name: string, value: string, opts?: any) => void };
} | any;

const COOKIE_NAME = "devcollab_grace_until";
const DEFAULT_PATH = "/";
const DEFAULT_SAMESITE = "Lax";

/** Build a Set-Cookie header value */
function buildSetCookieValue(name: string, value: string, opts: { maxAge?: number; expires?: Date; path?: string; sameSite?: string; httpOnly?: boolean; secure?: boolean } = {}) {
    const parts: string[] = [`${name}=${encodeURIComponent(value)}`];
    if (opts.expires) parts.push(`Expires=${opts.expires.toUTCString()}`);
    if (typeof opts.maxAge === "number") parts.push(`Max-Age=${Math.floor(opts.maxAge)}`);
    parts.push(`Path=${opts.path ?? DEFAULT_PATH}`);
    parts.push(`SameSite=${opts.sameSite ?? DEFAULT_SAMESITE}`);
    if (opts.secure) parts.push("Secure");
    if (opts.httpOnly) parts.push("HttpOnly");
    return parts.join("; ");
}

function parseCookieString(cookieStr: string | null | undefined): Record<string, string> {
    const out: Record<string, string> = {};
    if (!cookieStr) return out;
    cookieStr.split(";").forEach((part) => {
        const idx = part.indexOf("=");
        if (idx < 0) return;
        const k = part.slice(0, idx).trim();
        const v = part.slice(idx + 1).trim();
        out[k] = decodeURIComponent(v);
    });
    return out;
}

/** Read cookie from a server request-like object or browser */
export function getGraceUntil(options?: { req?: ServerRequestLike }): number | null {
    // Browser
    if (typeof window !== "undefined" && typeof document !== "undefined") {
        const parsed = parseCookieString(document.cookie || "");
        const v = parsed[COOKIE_NAME];
        if (!v) return null;
        const n = Number(v);
        return Number.isFinite(n) ? n : null;
    }

    // Server: try NextRequest-like header first
    const req = options?.req as any;
    if (!req) return null;

    let cookieHeader: string | null | undefined;
    // NextRequest-like: headers.get('cookie')
    if (req.headers && typeof req.headers.get === "function") {
        cookieHeader = req.headers.get("cookie");
    } else if (req.headers && req.headers.cookie) {
        cookieHeader = req.headers.cookie;
    } else if (req.headers && typeof req.headers === "object") {
        // fallback: maybe raw object
        cookieHeader = (req.headers as any).cookie;
    } else if (typeof req.getHeader === "function") {
        cookieHeader = req.getHeader("cookie");
    }

    const parsed = parseCookieString(cookieHeader || "");
    const v = parsed[COOKIE_NAME];
    if (!v) return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
}

/** Check if grace period is currently active (client or server) */
export function isGraceActive(options?: { req?: ServerRequestLike }): boolean {
    const until = getGraceUntil(options);
    if (!until) return false;
    return Date.now() < until;
}

/** Set grace until timestamp (ms). If res provided, will attach Set-Cookie header for server responses.
 *  Options:
 *   - res: server response-like (NextResponse, ServerResponse...). If provided we will try a few ways to attach Set-Cookie.
 *   - httpOnly: boolean - server-side only flag to mark cookie HttpOnly (default false for client convenience)
 *   - secure: boolean - adds Secure attribute
 */
export function setGraceUntil(untilMs: number, options?: { res?: ServerResponseLike; httpOnly?: boolean; secure?: boolean }) {
    const maxAgeSeconds = Math.max(0, Math.floor((untilMs - Date.now()) / 1000));
    const cookieValue = String(untilMs);

    // Server path: try to set cookie on response if provided
    const res = options?.res as any;
    if (res) {
        // Next.js Response.cookies.set (app router) style
        try {
            if (res?.cookies && typeof res.cookies.set === "function") {
                res.cookies.set(COOKIE_NAME, cookieValue, { maxAge: maxAgeSeconds, path: DEFAULT_PATH, sameSite: DEFAULT_SAMESITE, httpOnly: !!options?.httpOnly, secure: !!options?.secure });
                return;
            }
        } catch (e) {
            // ignore and fallback
        }

        // If response exposes setHeader
        const cookieStr = buildSetCookieValue(COOKIE_NAME, cookieValue, { maxAge: maxAgeSeconds, path: DEFAULT_PATH, sameSite: DEFAULT_SAMESITE, httpOnly: !!options?.httpOnly, secure: !!options?.secure });
        try {
            if (typeof res.setHeader === "function") {
                // preserve existing Set-Cookie if present
                const existing = res.getHeader?.("Set-Cookie");
                if (existing) {
                    if (Array.isArray(existing)) {
                        res.setHeader("Set-Cookie", [...existing, cookieStr]);
                    } else {
                        res.setHeader("Set-Cookie", [existing as string, cookieStr]);
                    }
                } else {
                    res.setHeader("Set-Cookie", cookieStr);
                }
                return;
            } else if (res.headers && typeof res.headers.append === "function") {
                res.headers.append("Set-Cookie", cookieStr);
                return;
            } else if (res.headers && typeof res.headers.set === "function") {
                // some frameworks
                res.headers.set("Set-Cookie", cookieStr);
                return;
            }
        } catch (e) {
            // best-effort, continue to client fallback
        }
    }

    // Client path: write document.cookie
    if (typeof document !== "undefined") {
        const expires = new Date(Date.now() + maxAgeSeconds * 1000);
        const cookieStr = buildSetCookieValue(COOKIE_NAME, cookieValue, { maxAge: maxAgeSeconds, expires, path: DEFAULT_PATH, sameSite: DEFAULT_SAMESITE, secure: !!options?.secure });
        document.cookie = cookieStr;
    }
}

/** Set grace period for given number of days (default 7) */
export function setGraceDays(days = 7, options?: { res?: ServerResponseLike; httpOnly?: boolean; secure?: boolean }) {
    const until = Date.now() + Math.floor(days * 24 * 60 * 60 * 1000);
    setGraceUntil(until, options);
}

/** Clear the grace cookie (server or client) */
export function clearGrace(options?: { res?: ServerResponseLike }) {
    const res = options?.res as any;

    // Server: set cookie with Max-Age=0
    if (res) {
        const cookieStr = buildSetCookieValue(COOKIE_NAME, "", { maxAge: 0, path: DEFAULT_PATH, sameSite: DEFAULT_SAMESITE });
        try {
            if (res?.cookies && typeof res.cookies.set === "function") {
                // Next.js Response.cookies.set with maxAge 0 sometimes can't remove; set empty.
                res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: DEFAULT_PATH });
                return;
            }
        } catch (e) { /* ignore */ }

        try {
            if (typeof res.setHeader === "function") {
                const existing = res.getHeader?.("Set-Cookie");
                if (existing) {
                    if (Array.isArray(existing)) {
                        res.setHeader("Set-Cookie", [...existing, cookieStr]);
                    } else {
                        res.setHeader("Set-Cookie", [existing as string, cookieStr]);
                    }
                } else {
                    res.setHeader("Set-Cookie", cookieStr);
                }
                return;
            } else if (res.headers && typeof res.headers.append === "function") {
                res.headers.append("Set-Cookie", cookieStr);
                return;
            } else if (res.headers && typeof res.headers.set === "function") {
                res.headers.set("Set-Cookie", cookieStr);
                return;
            }
        } catch (e) { /* ignore */ }
    }

    // Client:
    if (typeof document !== "undefined") {
        document.cookie = buildSetCookieValue(COOKIE_NAME, "", { maxAge: 0, path: DEFAULT_PATH, sameSite: DEFAULT_SAMESITE });
    }
}

/** Simple guard for server-side middleware/route: returns boolean and optional redirect target */
export function requireGraceActive(options?: { req?: ServerRequestLike; redirectTo?: string }): { active: boolean; redirect?: string | null } {
    const active = isGraceActive({ req: options?.req });
    if (active) return { active: true, redirect: null };
    return { active: false, redirect: options?.redirectTo ?? "/auth/login" };
}
