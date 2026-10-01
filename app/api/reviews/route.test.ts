import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

const mockStorageRemove = vi.fn();
const mockStorageFrom = vi.fn(() => ({ remove: mockStorageRemove }));

const mockSupabaseClient = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
  storage: {
    from: mockStorageFrom,
  },
};

const SUPABASE_URL = 'https://proj.supabase.co';
const OWNER_ID = '11111111-2222-4333-8444-555555555555';
const OTHER_ID = '99999999-8888-4777-8666-555555555555';
const reviewImageUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/review-images/${path}`;

vi.mock('@/lib/supabaseServer', () => ({
  createServerSupabaseClient: vi.fn(async () => mockSupabaseClient),
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

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should delete a review and then its own images from storage', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: OWNER_ID } },
      error: null,
    });
    mockStorageRemove.mockResolvedValue({ data: [{ name: 'x' }, { name: 'y' }], error: null });

    const order: string[] = [];
    const mockSelect = vi.fn(async () => {
      order.push('db-delete');
      return {
        data: [{
          images: [
            reviewImageUrl(`${OWNER_ID}/1-a.webp`),
            reviewImageUrl(`${OWNER_ID}/2-b.webp`),
            reviewImageUrl(`${OTHER_ID}/3-c.webp`),
            `https://evil.example.com/storage/v1/object/public/review-images/${OWNER_ID}/4-d.webp`,
          ],
        }],
        error: null,
      };
    });
    mockStorageRemove.mockImplementation(async (paths: string[]) => {
      order.push('storage-remove');
      return { data: paths.map((name) => ({ name })), error: null };
    });

    const mockFrom = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ select: mockSelect }),
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
    expect(mockSelect).toHaveBeenCalledWith('images');
    expect(mockStorageFrom).toHaveBeenCalledWith('review-images');
    expect(mockStorageRemove).toHaveBeenCalledTimes(1);
    expect(mockStorageRemove).toHaveBeenCalledWith([`${OWNER_ID}/1-a.webp`, `${OWNER_ID}/2-b.webp`]);
    expect(order).toEqual(['db-delete', 'storage-remove']);
  });

  it('should not touch storage when the review had no images or was not found', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: OWNER_ID } },
      error: null,
    });

    mockSupabaseClient.from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ data: [], error: null }) }),
        }),
      }),
    });

    const { DELETE } = await import('./route');
    const response = await DELETE(new NextRequest('http://localhost:3000/api/reviews?id=1'));

    expect(response.status).toBe(200);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it('should still succeed when storage removal fails (left for the cleanup cron)', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: OWNER_ID } },
      error: null,
    });
    mockStorageRemove.mockResolvedValue({ data: null, error: { message: 'storage down' } });

    mockSupabaseClient.from = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockResolvedValue({
              data: [{ images: [reviewImageUrl(`${OWNER_ID}/1-a.webp`)] }],
              error: null,
            }),
          }),
        }),
      }),
    });

    const { DELETE } = await import('./route');
    const response = await DELETE(new NextRequest('http://localhost:3000/api/reviews?id=1'));

    expect(response.status).toBe(200);
    expect(mockStorageRemove).toHaveBeenCalledWith([`${OWNER_ID}/1-a.webp`]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
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

    const mockSelect = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const mockFrom = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ select: mockSelect }),
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
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });
});

describe('PUT /api/reviews', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: OWNER_ID } },
      error: null,
    });
    mockStorageRemove.mockImplementation(async (paths: string[]) => ({
      data: paths.map((name) => ({ name })),
      error: null,
    }));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  const kept = reviewImageUrl(`${OWNER_ID}/1-kept.webp`);
  const dropped = reviewImageUrl(`${OWNER_ID}/2-dropped.webp`);
  const added = reviewImageUrl(`${OWNER_ID}/3-added.webp`);

  function mockReviewTable({
    previous,
    updated,
    current = updated,
    updateError = null,
  }: {
    previous: { images: string[] } | null;
    updated: { images: string[] } | null;
    /** Row seen by the re-read right before removing (defaults to the update result). */
    current?: { images: string[] } | null;
    updateError?: { message: string } | null;
  }) {
    const order: string[] = [];
    let reads = 0;
    const prevMaybeSingle = vi.fn(async () => {
      order.push(reads++ === 0 ? 'db-read' : 'db-reread');
      return { data: reads === 1 ? previous : current, error: null };
    });
    const updateSingle = vi.fn(async () => {
      order.push('db-update');
      return { data: updated, error: updateError };
    });
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single: updateSingle }),
        }),
      }),
    });
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({ maybeSingle: prevMaybeSingle }),
        }),
      }),
      update,
    });
    mockStorageRemove.mockImplementation(async (paths: string[]) => {
      order.push('storage-remove');
      return { data: paths.map((name) => ({ name })), error: null };
    });
    return { order, update, prevMaybeSingle };
  }

  const putRequest = (images?: unknown) =>
    new NextRequest('http://localhost:3000/api/reviews', {
      method: 'PUT',
      body: JSON.stringify({
        id: '1',
        rating: 4,
        content: '수정된 후기 내용입니다. 좋아요.',
        ...(images !== undefined && { images }),
      }),
    });

  it('removes images the edit dropped, after the update succeeds', async () => {
    const { order, update } = mockReviewTable({
      previous: { images: [kept, dropped] },
      updated: { images: [kept, added] },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([kept, added]));

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ images: [kept, added] }));
    expect(mockStorageFrom).toHaveBeenCalledWith('review-images');
    expect(mockStorageRemove).toHaveBeenCalledWith([`${OWNER_ID}/2-dropped.webp`]);
    expect(order).toEqual(['db-read', 'db-update', 'db-reread', 'storage-remove']);
  });

  it('keeps a dropped image that a concurrent edit wrote back', async () => {
    mockReviewTable({
      previous: { images: [kept, dropped] },
      updated: { images: [] },
      current: { images: [dropped] },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([]));

    expect(response.status).toBe(200);
    expect(mockStorageRemove).toHaveBeenCalledWith([`${OWNER_ID}/1-kept.webp`]);
  });

  it('leaves images untouched when the body omits `images`', async () => {
    const { update, prevMaybeSingle } = mockReviewTable({
      previous: { images: [kept, dropped] },
      updated: { images: [kept, dropped] },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest());

    expect(response.status).toBe(200);
    expect(update.mock.calls[0][0]).not.toHaveProperty('images');
    expect(prevMaybeSingle).not.toHaveBeenCalled();
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it.each([
    ['null', null],
    ['more than 3', [kept, dropped, added, reviewImageUrl(`${OWNER_ID}/4-extra.webp`)]],
    ['foreign host', [kept, `https://evil.example.com/storage/v1/object/public/review-images/${OWNER_ID}/x.webp`]],
  ])('rejects invalid images (%s) with 400 without touching DB or storage', async (_label, images) => {
    const { update } = mockReviewTable({ previous: { images: [kept] }, updated: { images: [] } });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest(images));

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it('does not touch storage when images are unchanged', async () => {
    mockReviewTable({ previous: { images: [kept] }, updated: { images: [kept] } });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([kept]));

    expect(response.status).toBe(200);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it('does not touch storage when the update fails', async () => {
    mockReviewTable({
      previous: { images: [kept, dropped] },
      updated: null,
      updateError: { message: 'Database error' },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([kept]));

    expect(response.status).toBe(500);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });
});
