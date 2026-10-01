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

vi.mock('@/lib/supabaseServer', () => ({
  createServerSupabaseClient: vi.fn(async () => mockSupabaseClient),
}));

vi.mock('@/lib/rateLimit', () => ({
  createRateLimiter: () => async () => ({ success: true, resetTime: 0 }),
}));

const SUPABASE_URL = 'https://proj.supabase.co';
const OWNER_ID = '11111111-2222-4333-8444-555555555555';
const OTHER_ID = '99999999-8888-4777-8666-555555555555';
const recordImageUrl = (path: string) => `${SUPABASE_URL}/storage/v1/object/public/record-images/${path}`;

const context = { params: Promise.resolve({ id: 'rec-1' }) };

let order: string[];

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', SUPABASE_URL);
  order = [];
  mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: { id: OWNER_ID } }, error: null });
  mockStorageRemove.mockImplementation(async (paths: string[]) => {
    order.push('storage-remove');
    return { data: paths.map((name) => ({ name })), error: null };
  });
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('DELETE /api/records/[id]', () => {
  function mockDelete(result: { data: unknown; error: unknown }) {
    const select = vi.fn(async () => {
      order.push('db-delete');
      return result;
    });
    const eqUser = vi.fn().mockReturnValue({ select });
    const eqId = vi.fn().mockReturnValue({ eq: eqUser });
    mockSupabaseClient.from = vi.fn().mockReturnValue({ delete: vi.fn().mockReturnValue({ eq: eqId }) });
    return { select, eqId, eqUser };
  }

  const deleteRequest = () => new NextRequest('http://localhost:3000/api/records/rec-1', { method: 'DELETE' });

  it("deletes the record, then removes only the owner's images", async () => {
    const { select, eqId, eqUser } = mockDelete({
      data: [{
        images: [
          recordImageUrl(`${OWNER_ID}/1-a.webp`),
          recordImageUrl(`${OTHER_ID}/2-b.webp`),
          recordImageUrl(`${OWNER_ID}/%2e%2e/${OTHER_ID}/3-c.webp`),
          `${SUPABASE_URL}/storage/v1/object/public/review-images/${OWNER_ID}/4-d.webp`,
        ],
      }],
      error: null,
    });

    const { DELETE } = await import('./route');
    const response = await DELETE(deleteRequest(), context);

    expect(response.status).toBe(200);
    expect(eqId).toHaveBeenCalledWith('id', 'rec-1');
    expect(eqUser).toHaveBeenCalledWith('user_id', OWNER_ID);
    expect(select).toHaveBeenCalledWith('images');
    expect(mockStorageFrom).toHaveBeenCalledWith('record-images');
    expect(mockStorageRemove).toHaveBeenCalledWith([`${OWNER_ID}/1-a.webp`]);
    expect(order).toEqual(['db-delete', 'storage-remove']);
  });

  it('does not touch storage when the DB delete fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockDelete({ data: null, error: { message: 'Database error' } });

    const { DELETE } = await import('./route');
    const response = await DELETE(deleteRequest(), context);

    expect(response.status).toBe(500);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it('does not touch storage when no row was deleted (not owner / not found)', async () => {
    mockDelete({ data: [], error: null });

    const { DELETE } = await import('./route');
    const response = await DELETE(deleteRequest(), context);

    expect(response.status).toBe(200);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it('still succeeds when storage removal throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    mockDelete({ data: [{ images: [recordImageUrl(`${OWNER_ID}/1-a.webp`)] }], error: null });
    mockStorageRemove.mockRejectedValue(new Error('network down'));

    const { DELETE } = await import('./route');
    const response = await DELETE(deleteRequest(), context);

    expect(response.status).toBe(200);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('returns 401 without touching DB or storage when unauthenticated', async () => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'no' } });
    const from = vi.fn();
    mockSupabaseClient.from = from;

    const { DELETE } = await import('./route');
    const response = await DELETE(deleteRequest(), context);

    expect(response.status).toBe(401);
    expect(from).not.toHaveBeenCalled();
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });
});

describe('PUT /api/records/[id]', () => {
  const kept = recordImageUrl(`${OWNER_ID}/1-kept.webp`);
  const dropped1 = recordImageUrl(`${OWNER_ID}/2-dropped.webp`);
  const dropped2 = recordImageUrl(`${OWNER_ID}/3-dropped.webp`);
  const added = recordImageUrl(`${OWNER_ID}/4-added.webp`);

  function mockRecordTable({
    previous,
    updated,
    current = updated,
    updateError = null,
  }: {
    previous: { images: string[] } | null;
    updated: { images: string[] } | null;
    /** Row seen by the re-read right before removing (defaults to the update result). */
    current?: { images: string[] } | null;
    updateError?: { code?: string; message: string } | null;
  }) {
    let reads = 0;
    const maybeSingle = vi.fn(async () => {
      order.push(reads++ === 0 ? 'db-read' : 'db-reread');
      return { data: reads === 1 ? previous : current, error: null };
    });
    const single = vi.fn(async () => {
      order.push('db-update');
      return { data: updated, error: updateError };
    });
    const update = vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single }) }),
      }),
    });
    mockSupabaseClient.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ eq: vi.fn().mockReturnValue({ maybeSingle }) }),
      }),
      update,
    });
    return { update, maybeSingle };
  }

  const putRequest = (images?: unknown) =>
    new NextRequest('http://localhost:3000/api/records/rec-1', {
      method: 'PUT',
      body: JSON.stringify({
        played_at: '2026-09-30',
        court_name: '테스트 코트',
        match_type: 'singles',
        match_format: '6game_1set',
        score: { sets: [{ my: 6, opp: 3 }] },
        result: 'win',
        ...(images !== undefined && { images }),
      }),
    });

  it('removes images dropped by the edit after the update succeeds', async () => {
    const { update } = mockRecordTable({
      previous: { images: [kept, dropped1, dropped2] },
      updated: { images: [kept, added] },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([kept, added]), context);

    expect(response.status).toBe(200);
    expect(update).toHaveBeenCalledWith(expect.objectContaining({ images: [kept, added] }));
    expect(mockStorageFrom).toHaveBeenCalledWith('record-images');
    expect(mockStorageRemove).toHaveBeenCalledWith([`${OWNER_ID}/2-dropped.webp`, `${OWNER_ID}/3-dropped.webp`]);
    expect(order).toEqual(['db-read', 'db-update', 'db-reread', 'storage-remove']);
  });

  it('keeps a dropped image that a concurrent edit wrote back', async () => {
    mockRecordTable({
      previous: { images: [kept, dropped1, dropped2] },
      updated: { images: [kept] },
      current: { images: [kept, dropped1] },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([kept]), context);

    expect(response.status).toBe(200);
    expect(mockStorageRemove).toHaveBeenCalledWith([`${OWNER_ID}/3-dropped.webp`]);
  });

  it('leaves images untouched when the body omits `images`', async () => {
    const { update, maybeSingle } = mockRecordTable({
      previous: { images: [kept, dropped1] },
      updated: { images: [kept, dropped1] },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest(), context);

    expect(response.status).toBe(200);
    expect(update.mock.calls[0][0]).not.toHaveProperty('images');
    expect(maybeSingle).not.toHaveBeenCalled();
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it.each([
    ['not an array', 'oops'],
    ['null', null],
    ['more than 5', Array.from({ length: 6 }, (_, i) => recordImageUrl(`${OWNER_ID}/${i}.webp`))],
    ['non-string entry', [kept, 42]],
  ])('rejects invalid images (%s) with 400 without touching DB or storage', async (_label, images) => {
    const { update } = mockRecordTable({ previous: { images: [kept] }, updated: { images: [] } });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest(images), context);

    expect(response.status).toBe(400);
    expect(update).not.toHaveBeenCalled();
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it('does not touch storage when images are unchanged', async () => {
    mockRecordTable({ previous: { images: [kept] }, updated: { images: [kept] } });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([kept]), context);

    expect(response.status).toBe(200);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it('does not touch storage when the update fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockRecordTable({
      previous: { images: [kept, dropped1] },
      updated: null,
      updateError: { message: 'Database error' },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([kept]), context);

    expect(response.status).toBe(500);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });

  it('does not touch storage when the record does not exist', async () => {
    mockRecordTable({
      previous: null,
      updated: null,
      updateError: { code: 'PGRST116', message: 'no rows' },
    });

    const { PUT } = await import('./route');
    const response = await PUT(putRequest([]), context);

    expect(response.status).toBe(404);
    expect(mockStorageRemove).not.toHaveBeenCalled();
  });
});
