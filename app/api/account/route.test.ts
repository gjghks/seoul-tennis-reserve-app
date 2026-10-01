import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
    signOut: vi.fn(),
  },
};
const mockServiceClient = { tag: 'service-role-client' };
const mockDeleteUserAccount = vi.fn();

vi.mock('@/lib/supabaseServer', () => ({
  createServerSupabaseClient: vi.fn(async () => mockSupabaseClient),
  createServiceRoleClient: vi.fn(() => mockServiceClient),
}));

vi.mock('@/lib/account/deleteAccount', () => ({
  deleteUserAccount: (...args: unknown[]) => mockDeleteUserAccount(...args),
}));

const SESSION_USER_ID = '11111111-2222-4333-8444-555555555555';

function makeRequest(body?: unknown, cookie?: string, extraHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...extraHeaders };
  if (cookie) headers.cookie = cookie;
  return new NextRequest('http://localhost:3000/api/account', {
    method: 'DELETE',
    headers,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('DELETE /api/account', () => {
  beforeEach(() => {
    // Fresh module per test: the in-memory rate limiter (3/min) is module state.
    vi.resetModules();
    vi.clearAllMocks();
    mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });
  });

  it.each([
    ['foreign Origin', { origin: 'https://evil.example' }],
    ['null Origin', { origin: 'null' }],
    ['Sec-Fetch-Site: cross-site', { 'sec-fetch-site': 'cross-site' }],
  ])('returns 403 for a cross-site request (%s) before touching the session', async (_label, headers) => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: SESSION_USER_ID } }, error: null });

    const { DELETE } = await import('./route');
    const response = await DELETE(makeRequest({ confirm: '탈퇴' }, undefined, headers));

    expect(response.status).toBe(403);
    expect(mockSupabaseClient.auth.getUser).not.toHaveBeenCalled();
    expect(mockDeleteUserAccount).not.toHaveBeenCalled();
  });

  it.each([
    ['same-host Origin', { origin: 'http://localhost:3000', 'sec-fetch-site': 'same-origin' }],
    ['production Origin', { origin: 'https://seoul-tennis.com' }],
  ])('accepts a same-site request (%s)', async (_label, headers) => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: SESSION_USER_ID } }, error: null });
    mockDeleteUserAccount.mockResolvedValue({ storage: {}, database: {}, authUserDeleted: true });

    const { DELETE } = await import('./route');
    const response = await DELETE(makeRequest({ confirm: '탈퇴' }, undefined, headers));

    expect(response.status).toBe(200);
  });

  it('returns 401 when not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'no session' } });

    const { DELETE } = await import('./route');
    const response = await DELETE(makeRequest({ confirm: '탈퇴' }));

    expect(response.status).toBe(401);
    expect(mockDeleteUserAccount).not.toHaveBeenCalled();
  });

  it.each([
    ['missing body', undefined],
    ['invalid json', '{not json'],
    ['missing confirm', {}],
    ['wrong confirm', { confirm: '탈퇴할래요' }],
    ['non-string confirm', { confirm: true }],
  ])('returns 400 for %s', async (_label, body) => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: SESSION_USER_ID } }, error: null });

    const { DELETE } = await import('./route');
    const response = await DELETE(makeRequest(body));

    expect(response.status).toBe(400);
    expect(mockDeleteUserAccount).not.toHaveBeenCalled();
  });

  it('deletes the SESSION user (never an id from the body), signs out and clears auth cookies', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: SESSION_USER_ID } }, error: null });
    mockDeleteUserAccount.mockResolvedValue({ storage: {}, database: {}, authUserDeleted: true });

    const { DELETE } = await import('./route');
    const response = await DELETE(
      makeRequest(
        { confirm: '탈퇴', userId: '99999999-2222-4333-8444-555555555555' },
        'sb-abc-auth-token=xyz; tennis-theme=neo',
      ),
    );
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual({ success: true });
    expect(mockDeleteUserAccount).toHaveBeenCalledTimes(1);
    expect(mockDeleteUserAccount).toHaveBeenCalledWith(mockServiceClient, SESSION_USER_ID);
    expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();

    const setCookie = response.headers.get('set-cookie') ?? '';
    expect(setCookie).toContain('sb-abc-auth-token=');
    expect(setCookie).toMatch(/Max-Age=0/i);
    expect(setCookie).not.toContain('tennis-theme');
  });

  it('still returns 200 when signOut throws after a successful deletion', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: SESSION_USER_ID } }, error: null });
    mockDeleteUserAccount.mockResolvedValue({ storage: {}, database: {}, authUserDeleted: true });
    mockSupabaseClient.auth.signOut.mockRejectedValue(new Error('session gone'));

    const { DELETE } = await import('./route');
    const response = await DELETE(makeRequest({ confirm: '탈퇴' }));

    expect(response.status).toBe(200);
  });

  it('returns 500 with a generic message when deletion fails', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: SESSION_USER_ID } }, error: null });
    mockDeleteUserAccount.mockRejectedValue(new Error('step=database failed: secret detail'));

    const { DELETE } = await import('./route');
    const response = await DELETE(makeRequest({ confirm: '탈퇴' }));
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('회원 탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
    expect(JSON.stringify(data)).not.toContain('secret');
    expect(mockSupabaseClient.auth.signOut).not.toHaveBeenCalled();
  });

  it('rate limits after 3 requests per minute', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'no session' } });

    const { DELETE } = await import('./route');
    for (let i = 0; i < 3; i += 1) {
      expect((await DELETE(makeRequest({ confirm: '탈퇴' }))).status).toBe(401);
    }
    const limited = await DELETE(makeRequest({ confirm: '탈퇴' }));

    expect(limited.status).toBe(429);
    expect(limited.headers.get('Retry-After')).toBeTruthy();
  });
});
