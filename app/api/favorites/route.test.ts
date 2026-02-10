import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabaseServer', () => ({
  createServerSupabaseClient: vi.fn(async () => mockSupabaseClient),
}));

const mockFavorites = [
  {
    id: '1',
    user_id: 'user1',
    svc_id: 'court1',
    svc_name: '강남 테니스장',
    district: '강남구',
    place_name: '강남구민체육센터',
    created_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    user_id: 'user1',
    svc_id: 'court2',
    svc_name: '송파 테니스장',
    district: '송파구',
    place_name: '송파구민체육센터',
    created_at: '2024-01-02T00:00:00.000Z',
  },
];

describe('GET /api/favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user favorites when authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const mockOrder = vi.fn().mockResolvedValue({
      data: mockFavorites,
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrder,
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.favorites).toEqual(mockFavorites);
    expect(mockFrom).toHaveBeenCalledWith('favorites');
  });

  it('should return 401 when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다.');
  });

  it('should return 500 when database query fails', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          order: mockOrder,
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('즐겨찾기를 불러오는데 실패했습니다.');
  });
});

describe('POST /api/favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a favorite successfully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: mockFavorites[0],
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({
        svc_id: 'court1',
        svc_name: '강남 테니스장',
        district: '강남구',
        place_name: '강남구민체육센터',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.favorite).toEqual(mockFavorites[0]);
  });

  it('should return 401 when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({
        svc_id: 'court1',
        svc_name: '강남 테니스장',
        district: '강남구',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다.');
  });

  it('should return 400 when required fields are missing', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({
        svc_id: 'court1',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('필수 정보가 누락되었습니다.');
  });

  it('should return 409 when duplicate favorite exists', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { code: '23505', message: 'Unique constraint violation' },
    });

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({
        svc_id: 'court1',
        svc_name: '강남 테니스장',
        district: '강남구',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('이미 즐겨찾기에 추가된 테니스장입니다.');
  });

  it('should return 500 when database insert fails', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: mockSingle,
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: JSON.stringify({
        svc_id: 'court1',
        svc_name: '강남 테니스장',
        district: '강남구',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('즐겨찾기 추가에 실패했습니다.');
  });

  it('should return 400 when request body is invalid JSON', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('잘못된 요청입니다.');
  });
});

describe('DELETE /api/favorites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a favorite successfully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const mockEq = vi.fn().mockResolvedValue({
      data: null,
      error: null,
    });

    const mockFrom = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { DELETE } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites?svc_id=court1');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should return 401 when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const { DELETE } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites?svc_id=court1');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다.');
  });

  it('should return 400 when svc_id is missing', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const { DELETE } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('테니스장 ID가 필요합니다.');
  });

  it('should return 500 when database delete fails', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const mockEq = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const mockFrom = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { DELETE } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/favorites?svc_id=court1');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('즐겨찾기 삭제에 실패했습니다.');
  });
});
