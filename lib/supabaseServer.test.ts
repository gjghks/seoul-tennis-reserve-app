import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockCreateClient = vi.fn();
const mockCreateServerClient = vi.fn();
const mockCookies = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}));

vi.mock('next/headers', () => ({
  cookies: mockCookies,
}));

describe('supabaseServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'test-service-role-key');
  });

  describe('createServerSupabaseClient', () => {
    it('should create async cookie-based server client', async () => {
      const mockClient = { mock: 'server-client' };
      const cookieStore = {
        getAll: vi.fn().mockReturnValue([{ name: 'sb-token', value: 'token' }]),
        set: vi.fn(),
      };

      mockCookies.mockResolvedValue(cookieStore);
      mockCreateServerClient.mockReturnValue(mockClient);

      const { createServerSupabaseClient } = await import('./supabaseServer');
      const client = await createServerSupabaseClient();

      expect(mockCookies).toHaveBeenCalledTimes(1);
      expect(mockCreateServerClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        expect.objectContaining({
          cookies: expect.objectContaining({
            getAll: expect.any(Function),
            setAll: expect.any(Function),
          }),
        })
      );

      const options = mockCreateServerClient.mock.calls[0][2];
      expect(options.cookies.getAll()).toEqual([{ name: 'sb-token', value: 'token' }]);

      options.cookies.setAll([
        { name: 'sb-access-token', value: 'next-token', options: { httpOnly: true } },
      ]);
      expect(cookieStore.set).toHaveBeenCalledWith('sb-access-token', 'next-token', { httpOnly: true });
      expect(client).toBe(mockClient);
    });
  });

  describe('createAnonSupabaseClient', () => {
    it('should create anonymous client without headers', async () => {
      const mockClient = { mock: 'anon-client' };
      mockCreateClient.mockReturnValue(mockClient);

      const { createAnonSupabaseClient } = await import('./supabaseServer');
      const client = createAnonSupabaseClient();

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key'
      );
      expect(client).toBe(mockClient);
    });
  });

  describe('createServiceRoleClient', () => {
    it('should create service role client without session persistence', async () => {
      const mockClient = { mock: 'service-role-client' };
      mockCreateClient.mockReturnValue(mockClient);

      const { createServiceRoleClient } = await import('./supabaseServer');
      const client = createServiceRoleClient();

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-service-role-key',
        {
          auth: { autoRefreshToken: false, persistSession: false },
        }
      );
      expect(client).toBe(mockClient);
    });
  });
});
