import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const exchangeCodeForSession = vi.fn();
vi.mock('@/lib/supabaseServer', () => ({
  createServerSupabaseClient: vi.fn(async () => ({ auth: { exchangeCodeForSession } })),
}));

import { GET } from './route';

// Mirrors production: standalone server bound to 0.0.0.0:3000, public host in the Host header.
const call = (query: string, host = 'seoul-tennis.com') =>
  GET(new NextRequest(`http://0.0.0.0:3000/auth/callback${query}`, { headers: { host } }));

describe('GET /auth/callback — redirects stay on the public origin', () => {
  it('success → https://seoul-tennis.com/auth/complete', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const res = await call('?code=abc');
    expect(res.headers.get('location')).toBe('https://seoul-tennis.com/auth/complete');
  });

  it('exchange failure → public /login?error=auth_error', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: new Error('bad code') });
    const res = await call('?code=abc');
    expect(res.headers.get('location')).toBe('https://seoul-tennis.com/login?error=auth_error');
  });

  it('provider error → public /login with the error', async () => {
    const res = await call('?error=access_denied&error_description=nope');
    expect(res.headers.get('location')).toBe(
      'https://seoul-tennis.com/login?error=access_denied&error_description=nope'
    );
  });

  it('www callback stays on www', async () => {
    exchangeCodeForSession.mockResolvedValueOnce({ error: null });
    const res = await call('?code=abc', 'www.seoul-tennis.com');
    expect(res.headers.get('location')).toBe('https://www.seoul-tennis.com/auth/complete');
  });
});
