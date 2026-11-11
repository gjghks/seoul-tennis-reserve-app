import { describe, expect, it } from 'vitest';
import { getPublicOrigin } from './publicOrigin';

// Standalone Next behind cloudflared builds request.url from the bind address (0.0.0.0:3000);
// the public host only survives in the Host / X-Forwarded-Host headers.
function req(headers: Record<string, string>, url = 'http://0.0.0.0:3000/auth/callback?code=x') {
  return new Request(url, { headers });
}

describe('getPublicOrigin', () => {
  it('uses the forwarded public host, not the 0.0.0.0 bind address', () => {
    expect(getPublicOrigin(req({ host: 'seoul-tennis.com' }))).toBe('https://seoul-tennis.com');
  });

  it('keeps www on www (per-host OAuth PKCE cookie lives there)', () => {
    expect(getPublicOrigin(req({ host: 'www.seoul-tennis.com' }))).toBe('https://www.seoul-tennis.com');
  });

  it('prefers x-forwarded-host when present', () => {
    expect(getPublicOrigin(req({ host: '0.0.0.0:3000', 'x-forwarded-host': 'seoul-tennis.com' }))).toBe(
      'https://seoul-tennis.com'
    );
  });

  it('never redirects to an unknown host (no open redirect via spoofed Host)', () => {
    expect(getPublicOrigin(req({ host: 'evil.example' }))).toBe('https://seoul-tennis.com');
    expect(getPublicOrigin(req({ host: 'evil.example', 'x-forwarded-host': 'evil.example' }))).toBe(
      'https://seoul-tennis.com'
    );
  });

  it('keeps local development origins working', () => {
    expect(getPublicOrigin(req({ host: 'localhost:3000' }, 'http://localhost:3000/auth/callback'))).toBe(
      'http://localhost:3000'
    );
  });
});
