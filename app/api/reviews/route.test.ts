import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/lib/supabaseServer', () => ({
  createServerSupabaseClient: vi.fn(() => mockSupabaseClient),
  createAnonSupabaseClient: vi.fn(() => mockSupabaseClient),
}));

const mockReviews = [
  {
    id: '1',
    user_id: 'user1',
    court_id: 'court1',
    court_name: '강남 테니스장',
    district: '강남구',
    rating: 5,
    content: '정말 좋은 테니스장입니다. 시설도 깨끗하고 관리도 잘 되어 있어요.',
    images: [],
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    user_id: 'user2',
    court_id: 'court2',
    court_name: '송파 테니스장',
    district: '송파구',
    rating: 4,
    content: '시설이 좋습니다. 다만 주차가 조금 불편해요.',
    images: ['image1.jpg'],
    created_at: '2024-01-02T00:00:00.000Z',
    updated_at: '2024-01-02T00:00:00.000Z',
  },
];

describe('GET /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return all reviews when no court_id is provided', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: mockReviews,
            error: null,
          }),
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/reviews');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reviews).toEqual(mockReviews);
    expect(mockFrom).toHaveBeenCalledWith('reviews');
  });

  it('should filter reviews by court_id', async () => {
    const mockEq = vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({
        data: [mockReviews[0]],
        error: null,
      }),
    });

    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          eq: mockEq,
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/reviews?court_id=court1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.reviews).toHaveLength(1);
    expect(data.reviews[0].court_id).toBe('court1');
    expect(mockEq).toHaveBeenCalledWith('court_id', 'court1');
  });

  it('should return 500 error when database query fails', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      }),
    });

    mockSupabaseClient.from = mockFrom;

    const { GET } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/reviews');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('후기를 불러오는데 실패했습니다.');
  });
});

describe('POST /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a review successfully', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const mockSingle = vi.fn().mockResolvedValue({
      data: mockReviews[0],
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
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        court_id: 'court1',
        court_name: '강남 테니스장',
        district: '강남구',
        rating: 5,
        content: '정말 좋은 테니스장입니다. 시설도 깨끗하고 관리도 잘 되어 있어요.',
        images: [],
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.review).toEqual(mockReviews[0]);
  });

  it('should return 401 when user is not authenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Not authenticated' },
    });

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        court_id: 'court1',
        court_name: '강남 테니스장',
        district: '강남구',
        rating: 5,
        content: '정말 좋은 테니스장입니다.',
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
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        court_id: 'court1',
        rating: 5,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('필수 정보가 누락되었습니다.');
  });

  it('should return 400 when rating is out of range', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        court_id: 'court1',
        court_name: '강남 테니스장',
        district: '강남구',
        rating: 6,
        content: '정말 좋은 테니스장입니다.',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('평점은 1~5 사이여야 합니다.');
  });

  it('should return 400 when content length is invalid', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        court_id: 'court1',
        court_name: '강남 테니스장',
        district: '강남구',
        rating: 5,
        content: '짧음',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('후기는 10자 이상 500자 이하로 작성해주세요.');
  });

  it('should return 409 when duplicate review exists', async () => {
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
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        court_id: 'court1',
        court_name: '강남 테니스장',
        district: '강남구',
        rating: 5,
        content: '정말 좋은 테니스장입니다. 시설도 깨끗하고 관리도 잘 되어 있어요.',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.error).toBe('이미 이 테니스장에 후기를 작성하셨습니다.');
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
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: JSON.stringify({
        court_id: 'court1',
        court_name: '강남 테니스장',
        district: '강남구',
        rating: 5,
        content: '정말 좋은 테니스장입니다. 시설도 깨끗하고 관리도 잘 되어 있어요.',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('후기 작성에 실패했습니다.');
  });

  it('should return 400 when request body is invalid JSON', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const { POST } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/reviews', {
      method: 'POST',
      body: 'invalid json',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('잘못된 요청입니다.');
  });
});

describe('DELETE /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should delete a review successfully', async () => {
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
    const request = new NextRequest('http://localhost:3000/api/reviews?id=1');
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
    const request = new NextRequest('http://localhost:3000/api/reviews?id=1');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toBe('로그인이 필요합니다.');
  });

  it('should return 400 when review id is missing', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: 'user1' } },
      error: null,
    });

    const { DELETE } = await import('./route');
    const request = new NextRequest('http://localhost:3000/api/reviews');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('후기 ID가 필요합니다.');
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
    const request = new NextRequest('http://localhost:3000/api/reviews?id=1');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('후기 삭제에 실패했습니다.');
  });
});
