import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { createRateLimiter } from './rateLimit';

/**
 * The limiter is a leaky/token-bucket: each key stores { count, resetTime }, and on
 * every call the stored count is decayed by elapsed_ms * (maxRequests / windowMs)
 * before adding 1. So `windowMs` is the time to fully refill `maxRequests` tokens.
 *
 * Fixed epoch for deterministic resetTime math.
 */
const NOW = Date.parse('2026-06-21T00:00:00Z'); // 1782000000000

/** Build a minimal NextRequest. IP resolves from x-forwarded-for, then .ip, then 'unknown'. */
function makeRequest(opts?: {
  path?: string;
  method?: string;
  forwardedFor?: string;
  ip?: string;
}): NextRequest {
  const { path = '/p', method = 'GET', forwardedFor, ip } = opts ?? {};
  const headers: Record<string, string> = {};
  if (forwardedFor !== undefined) headers['x-forwarded-for'] = forwardedFor;
  const req = new NextRequest(`https://example.com${path}`, { method, headers });
  if (ip !== undefined) {
    (req as NextRequest & { ip?: string }).ip = ip;
  }
  return req;
}

describe('createRateLimiter — option validation', () => {
  it('throws when windowMs is zero', () => {
    expect(() => createRateLimiter({ windowMs: 0, maxRequests: 1 })).toThrow(
      'windowMs and maxRequests must be greater than 0.'
    );
  });

  it('throws when windowMs is negative', () => {
    expect(() => createRateLimiter({ windowMs: -1, maxRequests: 1 })).toThrow();
  });

  it('throws when maxRequests is zero', () => {
    expect(() => createRateLimiter({ windowMs: 1000, maxRequests: 0 })).toThrow();
  });

  it('throws when maxRequests is negative', () => {
    expect(() => createRateLimiter({ windowMs: 1000, maxRequests: -5 })).toThrow();
  });

  it('does not throw for valid positive options and returns a function', () => {
    const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 5 });
    expect(typeof limiter).toBe('function');
  });
});

describe('createRateLimiter — request handling', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('under-limit allows', () => {
    it('allows the first request and reports remaining = maxRequests - 1', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
      const result = await limiter(makeRequest({ forwardedFor: '1.1.1.1' }));

      expect(result.success).toBe(true);
      expect(result.remaining).toBe(1);
      // refillRatePerMs = 2/1000 = 0.002; resetTime = now + ceil(1 / 0.002) = now + 500
      expect(result.resetTime).toBe(NOW + 500);
    });

    it('allows every request up to and including the limit, draining remaining to 0', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 3 });
      const fwd = '1.1.1.1';

      const r1 = await limiter(makeRequest({ forwardedFor: fwd }));
      const r2 = await limiter(makeRequest({ forwardedFor: fwd }));
      const r3 = await limiter(makeRequest({ forwardedFor: fwd }));

      expect([r1.success, r2.success, r3.success]).toEqual([true, true, true]);
      expect([r1.remaining, r2.remaining, r3.remaining]).toEqual([2, 1, 0]);
    });

    it('computes resetTime as now + ceil(count / refillRate) on success', async () => {
      // windowMs 10000, maxRequests 5 => refillRatePerMs = 0.0005
      const limiter = createRateLimiter({ windowMs: 10_000, maxRequests: 5 });
      const result = await limiter(makeRequest({ forwardedFor: '2.2.2.2' }));

      // ceil(1 / 0.0005) = 2000
      expect(result.resetTime).toBe(NOW + 2000);
      expect(result.remaining).toBe(4);
    });
  });

  describe('over-limit blocks with resetTime', () => {
    it('blocks the request that exceeds the limit', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
      const fwd = '3.3.3.3';

      await limiter(makeRequest({ forwardedFor: fwd }));
      await limiter(makeRequest({ forwardedFor: fwd }));
      const blocked = await limiter(makeRequest({ forwardedFor: fwd }));

      expect(blocked.success).toBe(false);
      expect(blocked.remaining).toBe(0);
      // waitMs = ceil((nextCount(3) - max(2)) / 0.002) = ceil(1/0.002) = 500
      expect(blocked.resetTime).toBe(NOW + 500);
    });

    it('keeps blocking repeated over-limit requests at the same instant', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
      const fwd = '3.3.3.4';

      const allowed = await limiter(makeRequest({ forwardedFor: fwd }));
      const blocked1 = await limiter(makeRequest({ forwardedFor: fwd }));
      const blocked2 = await limiter(makeRequest({ forwardedFor: fwd }));

      expect(allowed.success).toBe(true);
      expect(blocked1.success).toBe(false);
      expect(blocked2.success).toBe(false);
      // The stored count is NOT incremented on block, so a second over-limit call
      // re-computes from the same stored count: waitMs stays ceil(1/0.001) = 1000.
      expect(blocked1.resetTime).toBe(NOW + 1000);
      expect(blocked2.resetTime).toBe(NOW + 1000);
    });

    it('returns a resetTime strictly in the future when blocked', async () => {
      const limiter = createRateLimiter({ windowMs: 5000, maxRequests: 1 });
      const fwd = '3.3.3.5';

      await limiter(makeRequest({ forwardedFor: fwd }));
      const blocked = await limiter(makeRequest({ forwardedFor: fwd }));

      expect(blocked.success).toBe(false);
      expect(blocked.resetTime).toBeGreaterThan(NOW);
    });
  });

  describe('window reset over time', () => {
    it('allows a new request after the full window elapses', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
      const fwd = '4.4.4.4';

      expect((await limiter(makeRequest({ forwardedFor: fwd }))).success).toBe(true);
      expect((await limiter(makeRequest({ forwardedFor: fwd }))).success).toBe(false);

      vi.advanceTimersByTime(1000); // fully refills 1 token

      const afterWindow = await limiter(makeRequest({ forwardedFor: fwd }));
      expect(afterWindow.success).toBe(true);
    });

    it('partially decays the count proportionally to elapsed time', async () => {
      // refillRatePerMs = 2/1000 = 0.002; 500ms decays count by exactly 1
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
      const fwd = '5.5.5.5';

      await limiter(makeRequest({ forwardedFor: fwd })); // count -> 1
      await limiter(makeRequest({ forwardedFor: fwd })); // count -> 2
      expect((await limiter(makeRequest({ forwardedFor: fwd }))).success).toBe(false);

      vi.advanceTimersByTime(500); // count decays from 2 to 1

      const afterHalf = await limiter(makeRequest({ forwardedFor: fwd }));
      expect(afterHalf.success).toBe(true); // 1 + 1 = 2 <= max
      expect(afterHalf.remaining).toBe(0);

      // bucket is full again at the same instant -> next is blocked
      expect((await limiter(makeRequest({ forwardedFor: fwd }))).success).toBe(false);
    });

    it('does not over-refill: count floors at 0 after a long idle period', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
      const fwd = '6.6.6.6';

      await limiter(makeRequest({ forwardedFor: fwd }));
      await limiter(makeRequest({ forwardedFor: fwd }));

      // Idle far longer than the window. Decay clamps at 0 (Math.max(0, ...)),
      // so the very first request after returns the same fresh result as a new key.
      vi.advanceTimersByTime(10 * 60_000);

      const fresh = await limiter(makeRequest({ forwardedFor: fwd }));
      expect(fresh.success).toBe(true);
      expect(fresh.remaining).toBe(1); // floor(2 - 1) = 1, like a brand-new bucket
      expect(fresh.resetTime).toBe(Date.now() + 500);
    });
  });

  describe('per-key isolation', () => {
    it('isolates buckets by client IP (x-forwarded-for)', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });

      expect((await limiter(makeRequest({ forwardedFor: '10.0.0.1' }))).success).toBe(true);
      // Same IP again -> blocked
      expect((await limiter(makeRequest({ forwardedFor: '10.0.0.1' }))).success).toBe(false);
      // Different IP -> independent bucket, allowed
      expect((await limiter(makeRequest({ forwardedFor: '10.0.0.2' }))).success).toBe(true);
    });

    it('isolates buckets by HTTP method', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
      const fwd = '11.0.0.1';

      expect((await limiter(makeRequest({ method: 'GET', forwardedFor: fwd }))).success).toBe(true);
      expect((await limiter(makeRequest({ method: 'GET', forwardedFor: fwd }))).success).toBe(false);
      // Same IP + path but different method -> separate bucket
      expect((await limiter(makeRequest({ method: 'POST', forwardedFor: fwd }))).success).toBe(true);
    });

    it('isolates buckets by request pathname', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
      const fwd = '12.0.0.1';

      expect((await limiter(makeRequest({ path: '/api/a', forwardedFor: fwd }))).success).toBe(true);
      expect((await limiter(makeRequest({ path: '/api/a', forwardedFor: fwd }))).success).toBe(false);
      // Same IP + method but different path -> separate bucket
      expect((await limiter(makeRequest({ path: '/api/b', forwardedFor: fwd }))).success).toBe(true);
    });

    it('ignores the query string when keying (pathname only)', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
      const fwd = '13.0.0.1';

      expect(
        (await limiter(makeRequest({ path: '/api/x?page=1', forwardedFor: fwd }))).success
      ).toBe(true);
      // Different query string, same pathname -> same bucket -> blocked
      expect(
        (await limiter(makeRequest({ path: '/api/x?page=2', forwardedFor: fwd }))).success
      ).toBe(false);
    });

    it('keeps separate limiter instances fully independent', async () => {
      const limiterA = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
      const limiterB = createRateLimiter({ windowMs: 1000, maxRequests: 1 });
      const fwd = '14.0.0.1';

      expect((await limiterA(makeRequest({ forwardedFor: fwd }))).success).toBe(true);
      expect((await limiterA(makeRequest({ forwardedFor: fwd }))).success).toBe(false);
      // A's exhausted bucket must not affect B
      expect((await limiterB(makeRequest({ forwardedFor: fwd }))).success).toBe(true);
    });
  });

  describe('client IP resolution', () => {
    it('uses the first IP in a comma-separated x-forwarded-for chain', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });

      expect(
        (await limiter(makeRequest({ forwardedFor: '20.0.0.1, 20.0.0.2, 20.0.0.3' }))).success
      ).toBe(true);
      // Same first IP, different trailing proxies -> same bucket -> blocked
      expect(
        (await limiter(makeRequest({ forwardedFor: '20.0.0.1, 99.99.99.99' }))).success
      ).toBe(false);
      // Different first IP -> different bucket
      expect(
        (await limiter(makeRequest({ forwardedFor: '20.0.0.2, 20.0.0.1' }))).success
      ).toBe(true);
    });

    it('trims whitespace around the first forwarded IP', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });

      expect((await limiter(makeRequest({ forwardedFor: '  21.0.0.1  ' }))).success).toBe(true);
      // Trimmed value matches the un-padded one -> same bucket
      expect((await limiter(makeRequest({ forwardedFor: '21.0.0.1' }))).success).toBe(false);
    });

    it('falls back to request.ip when x-forwarded-for is absent', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });

      expect((await limiter(makeRequest({ ip: '30.0.0.1' }))).success).toBe(true);
      expect((await limiter(makeRequest({ ip: '30.0.0.1' }))).success).toBe(false);
      expect((await limiter(makeRequest({ ip: '30.0.0.2' }))).success).toBe(true);
    });

    it('falls back to the shared "unknown" bucket when no IP info exists', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });

      // No x-forwarded-for, no .ip -> key uses 'unknown' for both
      expect((await limiter(makeRequest())).success).toBe(true);
      expect((await limiter(makeRequest())).success).toBe(false);
    });

    it('treats a whitespace-only x-forwarded-for as no IP (falls back)', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });

      // firstIp = '   '.trim() = '' (falsy) -> request.ip then 'unknown'
      const blank1 = await limiter(makeRequest({ forwardedFor: '   ' }));
      const blank2 = await limiter(makeRequest({ forwardedFor: '   ' }));
      expect(blank1.success).toBe(true);
      // Both fall back to the same 'unknown' bucket -> second is blocked
      expect(blank2.success).toBe(false);
    });

    it('prefers x-forwarded-for over request.ip when both are present', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 1 });

      // Header IP 40.0.0.1 should be the key, not the .ip 50.0.0.1
      await limiter(makeRequest({ forwardedFor: '40.0.0.1', ip: '50.0.0.1' }));
      // Same header IP, different .ip -> still the same bucket -> blocked
      const blocked = await limiter(makeRequest({ forwardedFor: '40.0.0.1', ip: '99.0.0.9' }));
      expect(blocked.success).toBe(false);
      // A request keyed only by .ip 50.0.0.1 must be an independent (allowed) bucket
      expect((await limiter(makeRequest({ ip: '50.0.0.1' }))).success).toBe(true);
    });
  });

  describe('background cleanup of stale buckets', () => {
    it('evicts a fully-decayed bucket so it behaves like a brand-new key', async () => {
      const limiter = createRateLimiter({ windowMs: 1000, maxRequests: 2 });
      const fwd = '60.0.0.1';

      await limiter(makeRequest({ forwardedFor: fwd }));
      const second = await limiter(makeRequest({ forwardedFor: fwd }));
      expect(second.remaining).toBe(0);

      // CLEANUP_INTERVAL_MS = 60_000; advancing fires the setInterval, and since
      // elapsed >= windowMs and decayedCount <= 0 the entry is deleted.
      vi.advanceTimersByTime(60_000);

      const afterCleanup = await limiter(makeRequest({ forwardedFor: fwd }));
      expect(afterCleanup.success).toBe(true);
      expect(afterCleanup.remaining).toBe(1); // fresh bucket
    });
  });
});

describe('createRateLimiter — concurrency-safe accounting (real timers)', () => {
  it('counts concurrent awaited calls correctly within one window', async () => {
    const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });
    const fwd = '70.0.0.1';

    const results = await Promise.all([
      limiter(makeRequest({ forwardedFor: fwd })),
      limiter(makeRequest({ forwardedFor: fwd })),
      limiter(makeRequest({ forwardedFor: fwd })),
      limiter(makeRequest({ forwardedFor: fwd })),
    ]);

    const allowed = results.filter((r) => r.success).length;
    const blocked = results.filter((r) => !r.success).length;
    expect(allowed).toBe(3);
    expect(blocked).toBe(1);
  });
});
