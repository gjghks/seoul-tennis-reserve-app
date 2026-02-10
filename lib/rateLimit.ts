import { NextRequest } from 'next/server';

type RateLimitEntry = {
  count: number;
  resetTime: number;
};

type RateLimitOptions = {
  windowMs: number;
  maxRequests: number;
};

type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetTime: number;
};

const CLEANUP_INTERVAL_MS = 60_000;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const requestWithIp = request as NextRequest & { ip?: string };
  if (requestWithIp.ip) {
    return requestWithIp.ip;
  }

  return 'unknown';
}

export function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests } = options;

  if (windowMs <= 0 || maxRequests <= 0) {
    throw new Error('windowMs and maxRequests must be greater than 0.');
  }

  const store = new Map<string, RateLimitEntry>();
  const refillRatePerMs = maxRequests / windowMs;

  const cleanupInterval = setInterval(() => {
    const now = Date.now();

    for (const [key, entry] of store.entries()) {
      const elapsed = now - entry.resetTime;
      const decayedCount = Math.max(0, entry.count - elapsed * refillRatePerMs);

      if (decayedCount <= 0 && elapsed >= windowMs) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL_MS);

  cleanupInterval.unref?.();

  return async (request: NextRequest): Promise<RateLimitResult> => {
    const now = Date.now();
    const ip = getClientIp(request);
    const key = `${request.method}:${request.nextUrl.pathname}:${ip}`;

    const existing = store.get(key);
    const currentCount = existing
      ? Math.max(0, existing.count - (now - existing.resetTime) * refillRatePerMs)
      : 0;

    const nextCount = currentCount + 1;

    if (nextCount > maxRequests) {
      const waitMs = Math.ceil((nextCount - maxRequests) / refillRatePerMs);

      store.set(key, {
        count: currentCount,
        resetTime: now,
      });

      return {
        success: false,
        remaining: 0,
        resetTime: now + waitMs,
      };
    }

    store.set(key, {
      count: nextCount,
      resetTime: now,
    });

    return {
      success: true,
      remaining: Math.max(0, Math.floor(maxRequests - nextCount)),
      resetTime: now + Math.ceil(nextCount / refillRatePerMs),
    };
  };
}
