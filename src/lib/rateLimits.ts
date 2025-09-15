// src/lib/rateLimits.ts
type ParsedLimits = {
    rpm?: number; rpd?: number; tpm?: number; tpd?: number;
    remainingRpm?: number; remainingRpd?: number; remainingTpm?: number; remainingTpd?: number;
    lastLimitedAt?: number;
};

const state = new Map<string, ParsedLimits>();


function parseHeaders(h: Headers): ParsedLimits {
    const obj: ParsedLimits = {};
    const getNum = (k: string) => {
        const v = h.get(k);
        if (!v) return undefined;
        const n = parseInt(v, 10);
        return Number.isFinite(n) ? n : undefined;
    };
    // Correct mapping based on docs
    obj.remainingRpd = getNum("x-ratelimit-remaining-requests"); // Requests Per Day
    obj.remainingTpm = getNum("x-ratelimit-remaining-tokens");   // Tokens Per Minute
    obj.rpd = getNum("x-ratelimit-limit-requests");              // Requests Per Day
    obj.tpm = getNum("x-ratelimit-limit-tokens");                // Tokens Per Minute

    // Optionally, keep the old headers for compatibility
    obj.remainingRpm = getNum("x-ratelimit-remaining-rpm");
    obj.remainingTpd = getNum("x-ratelimit-remaining-tpd");
    obj.rpm = getNum("x-ratelimit-limit-rpm");
    obj.tpd = getNum("x-ratelimit-limit-tpd");
    return obj;
}


export const RateLimits = {
    record(model: string, info: { ok: boolean; status: number; headers: Headers; estInputTokens: number }) {
        const prev = state.get(model) || {};
        const parsed = parseHeaders(info.headers);
        const merged: ParsedLimits = { ...prev, ...parsed };
        state.set(model, merged);
    },
    markLimited(model: string, res: Response) {
        const prev = state.get(model) || {};
        prev.lastLimitedAt = Date.now();
        state.set(model, prev);
    },
    shouldSwitch(model: string) {
        const s = state.get(model);
        if (!s) return false;
        const under15 = (remaining?: number, total?: number) =>
            total && remaining !== undefined ? remaining / total < 0.15 : false;

        if (under15(s.remainingRpm, s.rpm)) return true;
        if (under15(s.remainingRpd, s.rpd)) return true;
        if (under15(s.remainingTpm, s.tpm)) return true;
        if (under15(s.remainingTpd, s.tpd)) return true;

        if (s.lastLimitedAt && Date.now() - s.lastLimitedAt < 5 * 60 * 1000) return true;
        return false;
    },
};