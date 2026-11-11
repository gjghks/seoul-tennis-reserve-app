import { describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn(async () => ({ data: { user: { id: 'u1' } } })) },
  })),
}));

import { middleware } from './middleware';

function req(host: string, path: string) {
  // NextRequest derives nextUrl from the URL; the Host header is what the proxy (cloudflared) forwards.
  return new NextRequest(`http://${host}${path}`, { headers: { host } });
}

describe('middleware — canonical host', () => {
  it('308-redirects www to the apex, preserving path and query', async () => {
    const res = await middleware(req('www.seoul-tennis.com', '/gangnam-gu?tab=map'));
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://seoul-tennis.com/gangnam-gu?tab=map');
  });

  it('redirects the www root', async () => {
    const res = await middleware(req('www.seoul-tennis.com', '/'));
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://seoul-tennis.com/');
  });

  it('does not redirect /auth on www (per-host OAuth PKCE cookie must stay on its host)', async () => {
    const res = await middleware(req('www.seoul-tennis.com', '/auth/callback?code=x'));
    expect(res.status).not.toBe(308);
  });

  it('still redirects the legacy Vercel production alias', async () => {
    const res = await middleware(req('seoul-tennis-reserve-app.vercel.app', '/today'));
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://seoul-tennis.com/today');
  });

  it('does not redirect the apex itself', async () => {
    const res = await middleware(req('seoul-tennis.com', '/today'));
    expect(res.status).not.toBe(308);
    expect(res.headers.get('location')).toBeNull();
  });
});
