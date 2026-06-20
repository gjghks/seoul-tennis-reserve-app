import { afterEach, describe, expect, it, vi } from 'vitest';
import { verifyCronSecret } from './cronAuth';

/**
 * Characterization + security tests for verifyCronSecret.
 *
 * Source under test:
 *   const secret = process.env.CRON_SECRET;
 *   if (!secret || !authHeader) return false;
 *   const expected = `Bearer ${secret}`;
 *   if (authHeader.length !== expected.length) return false;       // JS string length (UTF-16 units)
 *   return timingSafeEqual(Buffer.from(authHeader), Buffer.from(expected));  // byte comparison
 *
 * Note: the length guard uses *string* length while timingSafeEqual compares *byte*
 * length. Equal string length but differing byte length (multibyte UTF-8) bypasses the
 * guard and makes timingSafeEqual throw — this is verified explicitly below.
 */

const SECRET = 's3cr3t-token-1234567890';
const VALID_HEADER = `Bearer ${SECRET}`;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('verifyCronSecret — accepts the correct token', () => {
  it('returns true for an exact "Bearer <secret>" match', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(VALID_HEADER)).toBe(true);
  });

  it('accepts a short single-char secret with the correct header', () => {
    vi.stubEnv('CRON_SECRET', 'x');
    expect(verifyCronSecret('Bearer x')).toBe(true);
  });

  it('accepts secrets containing spaces and special characters', () => {
    const tricky = 'a b c!@#$%^&*()_+-=';
    vi.stubEnv('CRON_SECRET', tricky);
    expect(verifyCronSecret(`Bearer ${tricky}`)).toBe(true);
  });

  it('is repeatable / deterministic for the same valid input', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(VALID_HEADER)).toBe(true);
    expect(verifyCronSecret(VALID_HEADER)).toBe(true);
    expect(verifyCronSecret(VALID_HEADER)).toBe(true);
  });
});

describe('verifyCronSecret — rejects wrong tokens', () => {
  it('rejects a same-length but different secret', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    // Same overall length as VALID_HEADER, different bytes.
    const wrong = `Bearer ${'X'.repeat(SECRET.length)}`;
    expect(wrong.length).toBe(VALID_HEADER.length);
    expect(verifyCronSecret(wrong)).toBe(false);
  });

  it('rejects when the token differs by a single character', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    const lastChar = SECRET.slice(-1);
    const flipped = lastChar === '0' ? '1' : '0';
    const almost = `Bearer ${SECRET.slice(0, -1)}${flipped}`;
    expect(almost.length).toBe(VALID_HEADER.length);
    expect(verifyCronSecret(almost)).toBe(false);
  });

  it('rejects a token that is a prefix of the correct one (shorter)', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(`Bearer ${SECRET.slice(0, -1)}`)).toBe(false);
  });

  it('rejects a token with trailing garbage (longer)', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(`${VALID_HEADER}extra`)).toBe(false);
  });

  it('rejects the raw secret without the Bearer scheme', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(SECRET)).toBe(false);
  });

  it('rejects the literal "Bearer <secret>" value used as the secret env (no double prefix)', () => {
    // If someone misconfigures CRON_SECRET to already contain "Bearer ", the header
    // would need a double prefix — a plain "Bearer x" must NOT match.
    vi.stubEnv('CRON_SECRET', 'Bearer x');
    expect(verifyCronSecret('Bearer x')).toBe(false);
    expect(verifyCronSecret('Bearer Bearer x')).toBe(true);
  });
});

describe('verifyCronSecret — malformed scheme / formatting', () => {
  it('rejects a lowercase "bearer" scheme (case-sensitive)', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(`bearer ${SECRET}`)).toBe(false);
  });

  it('rejects an all-caps "BEARER" scheme', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(`BEARER ${SECRET}`)).toBe(false);
  });

  it('rejects a different auth scheme (Basic)', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(`Basic ${SECRET}`)).toBe(false);
  });

  it('rejects when there is no space between scheme and token', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(`Bearer${SECRET}`)).toBe(false);
  });

  it('rejects a double space after Bearer', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(`Bearer  ${SECRET}`)).toBe(false);
  });

  it('rejects a leading space before the scheme', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(` Bearer ${SECRET}`)).toBe(false);
  });

  it('rejects a trailing whitespace/newline on an otherwise-valid header', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(`${VALID_HEADER}\n`)).toBe(false);
    expect(verifyCronSecret(`${VALID_HEADER} `)).toBe(false);
  });
});

describe('verifyCronSecret — null / empty / missing header', () => {
  it('rejects a null authHeader', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret(null)).toBe(false);
  });

  it('rejects an empty-string authHeader', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret('')).toBe(false);
  });

  it('rejects a whitespace-only authHeader', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret('   ')).toBe(false);
  });

  it('rejects the bare scheme with no token', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(verifyCronSecret('Bearer ')).toBe(false);
    expect(verifyCronSecret('Bearer')).toBe(false);
  });
});

describe('verifyCronSecret — CRON_SECRET env unset / empty (fail closed)', () => {
  it('returns false when CRON_SECRET is undefined, even with a "valid-looking" header', () => {
    vi.stubEnv('CRON_SECRET', undefined as unknown as string);
    expect(process.env.CRON_SECRET).toBeUndefined();
    expect(verifyCronSecret('Bearer anything')).toBe(false);
    expect(verifyCronSecret(VALID_HEADER)).toBe(false);
  });

  it('returns false when CRON_SECRET is an empty string (falsy guard)', () => {
    vi.stubEnv('CRON_SECRET', '');
    // "Bearer " would be the expected value, but the empty-secret guard short-circuits first.
    expect(verifyCronSecret('Bearer ')).toBe(false);
    expect(verifyCronSecret('')).toBe(false);
    expect(verifyCronSecret(null)).toBe(false);
  });

  it('returns false for null header regardless of whether the secret is set', () => {
    vi.stubEnv('CRON_SECRET', undefined as unknown as string);
    expect(verifyCronSecret(null)).toBe(false);
  });
});

describe('verifyCronSecret — constant-time byte comparison guarantees', () => {
  it('uses a length pre-check so unequal-length inputs never reach timingSafeEqual (no throw)', () => {
    // timingSafeEqual throws on differing byte lengths; differing-length headers must be
    // short-circuited by the string-length guard and return false without throwing.
    vi.stubEnv('CRON_SECRET', SECRET);
    expect(() => verifyCronSecret('Bearer short')).not.toThrow();
    expect(verifyCronSecret('Bearer short')).toBe(false);
    expect(() => verifyCronSecret(`${VALID_HEADER}-way-too-long-suffix`)).not.toThrow();
    expect(verifyCronSecret(`${VALID_HEADER}-way-too-long-suffix`)).toBe(false);
  });

  it('compares full byte content, not just length (same length, all bytes wrong => false)', () => {
    vi.stubEnv('CRON_SECRET', SECRET);
    const sameLenAllWrong = '#'.repeat(VALID_HEADER.length);
    expect(sameLenAllWrong.length).toBe(VALID_HEADER.length);
    expect(verifyCronSecret(sameLenAllWrong)).toBe(false);
  });

  it('CHARACTERIZATION: equal JS string length but differing UTF-8 byte length THROWS RangeError', () => {
    // The guard uses authHeader.length (UTF-16 code units) but timingSafeEqual compares
    // byte length. A multibyte char makes byteLength > stringLength, slipping past the
    // guard and tripping timingSafeEqual's own length assertion. This documents a real
    // edge in the source: such a request errors out rather than returning false.
    vi.stubEnv('CRON_SECRET', SECRET);
    // Replace the last char of the valid header with a 2-byte char: same string length,
    // one extra byte.
    const multibyte = `${VALID_HEADER.slice(0, -1)}é`;
    expect(multibyte.length).toBe(VALID_HEADER.length); // equal string length
    expect(Buffer.from(multibyte).length).not.toBe(Buffer.from(VALID_HEADER).length);
    expect(() => verifyCronSecret(multibyte)).toThrow(RangeError);
  });

  it('CHARACTERIZATION: a correct secret that itself contains multibyte chars still matches', () => {
    // When BOTH expected and provided contain the same multibyte secret, byte lengths
    // match and comparison succeeds normally.
    const unicodeSecret = 'tøken-密码-🎾';
    vi.stubEnv('CRON_SECRET', unicodeSecret);
    expect(verifyCronSecret(`Bearer ${unicodeSecret}`)).toBe(true);
    expect(verifyCronSecret(`Bearer ${unicodeSecret}X`)).toBe(false);
  });
});

describe('verifyCronSecret — env isolation between calls', () => {
  it('reads CRON_SECRET freshly on each invocation (rotating the secret invalidates old headers)', () => {
    vi.stubEnv('CRON_SECRET', 'old-secret');
    expect(verifyCronSecret('Bearer old-secret')).toBe(true);

    vi.stubEnv('CRON_SECRET', 'new-secret');
    expect(verifyCronSecret('Bearer old-secret')).toBe(false);
    expect(verifyCronSecret('Bearer new-secret')).toBe(true);
  });
});
