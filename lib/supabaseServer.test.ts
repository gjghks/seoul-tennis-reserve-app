import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockCreateClient = vi.fn();

vi.mock('@supabase/supabase-js', () => ({
  createClient: mockCreateClient,
}));

describe('supabaseServer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://test.supabase.co');
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', 'test-anon-key');
  });

  describe('createServerSupabaseClient', () => {
    it('should create client with auth header when provided', async () => {
      const mockClient = { mock: 'client' };
      mockCreateClient.mockReturnValue(mockClient);

      const { createServerSupabaseClient } = await import('./supabaseServer');
      const request = new NextRequest('http://localhost:3000/api/test', {
        headers: {
          Authorization: 'Bearer test-token',
        },
      });

      const client = createServerSupabaseClient(request);

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        {
          global: {
            headers: { Authorization: 'Bearer test-token' },
          },
        }
      );
      expect(client).toBe(mockClient);
    });

    it('should create client without auth header when not provided', async () => {
      const mockClient = { mock: 'client' };
      mockCreateClient.mockReturnValue(mockClient);

      const { createServerSupabaseClient } = await import('./supabaseServer');
      const request = new NextRequest('http://localhost:3000/api/test');

      const client = createServerSupabaseClient(request);

      expect(mockCreateClient).toHaveBeenCalledWith(
        'https://test.supabase.co',
        'test-anon-key',
        {
          global: {
            headers: {},
          },
        }
      );
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
});
