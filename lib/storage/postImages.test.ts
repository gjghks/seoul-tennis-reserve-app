import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  droppedImagePaths,
  isSafeOwnedObjectPath,
  objectPathFromStoredImage,
  ownedImagePaths,
  referencedObjectPaths,
  removeDroppedPostImages,
  removePostImages,
  sweepUnreferencedPostImages,
} from './postImages';

const ORIGIN = 'https://proj.supabase.co';
const OWNER = '11111111-2222-4333-8444-555555555555';
const OTHER = '99999999-8888-4777-8666-555555555555';
const url = (bucket: string, path: string) => `${ORIGIN}/storage/v1/object/public/${bucket}/${path}`;

describe('objectPathFromStoredImage', () => {
  it('extracts the object path from a public URL of the bucket', () => {
    expect(
      objectPathFromStoredImage(url('review-images', `${OWNER}/1700000000000-a.webp`), 'review-images', { origin: ORIGIN }),
    ).toBe(`${OWNER}/1700000000000-a.webp`);
  });

  it('accepts bare object paths', () => {
    expect(objectPathFromStoredImage(`${OWNER}/1-a.webp`, 'record-images', { origin: ORIGIN })).toBe(`${OWNER}/1-a.webp`);
  });

  it.each([
    ['other bucket', url('record-images', `${OWNER}/1-a.webp`)],
    ['foreign host', `https://evil.example.com/storage/v1/object/public/review-images/${OWNER}/1-a.webp`],
    ['non-public endpoint', `${ORIGIN}/storage/v1/object/sign/review-images/${OWNER}/1-a.webp`],
    ['encoded traversal', url('review-images', `${OWNER}/%2e%2e/${OTHER}/1-a.webp`)],
    ['bare traversal', `${OWNER}/../${OTHER}/1-a.webp`],
    ['url traversal', url('review-images', `${OWNER}/../${OTHER}/1-a.webp`)],
    ['url bucket hop', url('record-images', `../review-images/${OWNER}/1-a.webp`)],
    ['url backslash', url('review-images', `${OWNER}\\..\\${OTHER}/1-a.webp`)],
    ['dot segment', `${OWNER}/./1-a.webp`],
    ['empty segment', `${OWNER}//1-a.webp`],
    ['backslash', `${OWNER}\\..\\x.webp`],
    ['encoded slash traversal', url('review-images', `${OWNER}%2f..%2f${OTHER}/x.webp`)],
    ['single segment', '1-a.webp'],
    ['leading slash', `/${OWNER}/1-a.webp`],
    ['query in bare path', `${OWNER}/1-a.webp?x=1`],
    ['javascript url', 'javascript:alert(1)'],
    ['data url', 'data:image/png;base64,AAAA'],
    ['malformed encoding', `${OWNER}/%E0%A4%A.webp`],
    ['non-string', 42],
  ])('rejects %s', (_label, value) => {
    expect(objectPathFromStoredImage(value, 'review-images', { origin: ORIGIN })).toBeNull();
  });

  it("origin '*' accepts any host (reference collection); null rejects every URL", () => {
    const foreign = `https://cdn.example.com/storage/v1/object/public/review-images/${OWNER}/1-a.webp`;
    expect(objectPathFromStoredImage(foreign, 'review-images', { origin: '*' })).toBe(`${OWNER}/1-a.webp`);
    expect(objectPathFromStoredImage(url('review-images', `${OWNER}/1-a.webp`), 'review-images', { origin: null })).toBeNull();
    expect(objectPathFromStoredImage(`${OWNER}/1-a.webp`, 'review-images', { origin: null })).toBe(`${OWNER}/1-a.webp`);
  });
});

describe('referencedObjectPaths (lenient, keep-side only)', () => {
  const path = `${OWNER}/1-a.webp`;

  it.each([
    ['canonical URL', url('review-images', path)],
    ['double slash from a trailing / on NEXT_PUBLIC_SUPABASE_URL', `${ORIGIN}//storage/v1/object/public/review-images/${path}`],
    ['root-relative URL (empty NEXT_PUBLIC_SUPABASE_URL)', `/storage/v1/object/public/review-images/${path}`],
    ['render/image transform URL', `${ORIGIN}/storage/v1/render/image/public/review-images/${path}?width=200`],
    ['foreign host', `https://cdn.example.com/storage/v1/object/public/review-images/${path}`],
    ['bare path', path],
    ['bare path with leading slash', `/${path}`],
    ['percent-encoded', url('review-images', `${OWNER}%2F1-a.webp`)],
  ])('matches %s', (_label, value) => {
    expect(referencedObjectPaths(value, 'review-images')).toContain(path);
  });

  it('ignores non-strings and empty values', () => {
    expect(referencedObjectPaths(42, 'review-images')).toEqual([]);
    expect(referencedObjectPaths('  ', 'review-images')).toEqual([]);
  });
});

describe('isSafeOwnedObjectPath (no second decode)', () => {
  it('accepts owned paths as-is and rejects unsafe or foreign ones', () => {
    expect(isSafeOwnedObjectPath(`${OWNER}/1-a.webp`, OWNER)).toBe(true);
    expect(isSafeOwnedObjectPath(`${OTHER}/1-a.webp`, OWNER)).toBe(false);
    expect(isSafeOwnedObjectPath(`${OWNER}/../${OTHER}/x.webp`, OWNER)).toBe(false);
    expect(isSafeOwnedObjectPath(`${OWNER}//x.webp`, OWNER)).toBe(false);
    expect(isSafeOwnedObjectPath(`${OWNER}\\x.webp`, OWNER)).toBe(false);
    expect(isSafeOwnedObjectPath(OWNER, OWNER)).toBe(false);
    expect(isSafeOwnedObjectPath(`${OWNER}/x.webp`, '')).toBe(false);
  });
});

describe('ownedImagePaths', () => {
  it("keeps only paths in the owner's folder, deduplicated", () => {
    const values = [
      url('review-images', `${OWNER}/1-a.webp`),
      `${OWNER}/1-a.webp`,
      url('review-images', `${OTHER}/2-b.webp`),
      `${OTHER}/3-c.webp`,
      url('review-images', `${OWNER}/%2e%2e/${OTHER}/4-d.webp`),
      `https://evil.example.com/storage/v1/object/public/review-images/${OWNER}/5-e.webp`,
      url('review-images', `${OWNER}/6-f.webp`),
    ];
    expect(ownedImagePaths(values, 'review-images', OWNER, { origin: ORIGIN })).toEqual([
      `${OWNER}/1-a.webp`,
      `${OWNER}/6-f.webp`,
    ]);
  });

  it('owner prefix must be the whole first segment', () => {
    expect(ownedImagePaths([`${OWNER}x/1-a.webp`], 'review-images', OWNER, { origin: ORIGIN })).toEqual([]);
  });

  it('returns nothing for a missing owner or non-array input', () => {
    expect(ownedImagePaths([`${OWNER}/1-a.webp`], 'review-images', '', { origin: ORIGIN })).toEqual([]);
    expect(ownedImagePaths(null, 'review-images', OWNER, { origin: ORIGIN })).toEqual([]);
  });

  describe('default origin from NEXT_PUBLIC_SUPABASE_URL', () => {
    afterEach(() => vi.unstubAllEnvs());

    it('uses the configured project origin', () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ORIGIN);
      expect(ownedImagePaths([url('record-images', `${OWNER}/1-a.webp`)], 'record-images', OWNER)).toEqual([
        `${OWNER}/1-a.webp`,
      ]);
    });

    it('rejects URLs when no origin is configured', () => {
      vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
      expect(ownedImagePaths([url('record-images', `${OWNER}/1-a.webp`)], 'record-images', OWNER)).toEqual([]);
    });
  });
});

describe('droppedImagePaths', () => {
  it('returns owned images of the old list that the new list no longer references', () => {
    const before = [
      url('record-images', `${OWNER}/1-a.webp`),
      url('record-images', `${OWNER}/2-b.webp`),
      url('record-images', `${OTHER}/3-c.webp`),
    ];
    const after = [`${OWNER}/1-a.webp`, url('record-images', `${OWNER}/9-new.webp`)];
    expect(droppedImagePaths(before, after, 'record-images', OWNER, { origin: ORIGIN })).toEqual([`${OWNER}/2-b.webp`]);
  });

  it('keeps an image the new list references in another URL shape', () => {
    const before = [url('record-images', `${OWNER}/1-a.webp`)];
    const after = [`${ORIGIN}//storage/v1/object/public/record-images/${OWNER}/1-a.webp`];
    expect(droppedImagePaths(before, after, 'record-images', OWNER, { origin: ORIGIN })).toEqual([]);
  });

  it('drops nothing when the list is unchanged and everything when cleared', () => {
    const before = [url('record-images', `${OWNER}/1-a.webp`)];
    expect(droppedImagePaths(before, before, 'record-images', OWNER, { origin: ORIGIN })).toEqual([]);
    expect(droppedImagePaths(before, [], 'record-images', OWNER, { origin: ORIGIN })).toEqual([`${OWNER}/1-a.webp`]);
    expect(droppedImagePaths(before, null, 'record-images', OWNER, { origin: ORIGIN })).toEqual([`${OWNER}/1-a.webp`]);
  });
});

describe('removePostImages', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => warn.mockRestore());

  const clientWith = (remove: (paths: string[]) => Promise<unknown>) =>
    ({ storage: { from: vi.fn(() => ({ remove })) } }) as unknown as SupabaseClient & {
      storage: { from: ReturnType<typeof vi.fn> };
    };

  it("removes only the owner's paths", async () => {
    const remove = vi.fn(async (paths: string[]) => ({ data: paths.map((name) => ({ name })), error: null }));
    const client = clientWith(remove);
    const result = await removePostImages(client, 'review-images', OWNER, [`${OWNER}/1-a.webp`, `${OTHER}/2-b.webp`]);
    expect(client.storage.from).toHaveBeenCalledWith('review-images');
    expect(remove).toHaveBeenCalledWith([`${OWNER}/1-a.webp`]);
    expect(result).toEqual({ requested: 1, removed: 1 });
  });

  it('does not decode an already-parsed path a second time', async () => {
    const remove = vi.fn(async (paths: string[]) => ({ data: paths.map((name) => ({ name })), error: null }));
    // Stored `<uid>/a%252Fb.webp` parses to `<uid>/a%2Fb.webp`; that exact object must be removed.
    const parsed = ownedImagePaths([url('review-images', `${OWNER}/a%252Fb.webp`)], 'review-images', OWNER, {
      origin: ORIGIN,
    });
    expect(parsed).toEqual([`${OWNER}/a%2Fb.webp`]);
    await removePostImages(clientWith(remove), 'review-images', OWNER, parsed);
    expect(remove).toHaveBeenCalledWith([`${OWNER}/a%2Fb.webp`]);
  });

  it('does not call storage when nothing is owned', async () => {
    const remove = vi.fn();
    await removePostImages(clientWith(remove), 'review-images', OWNER, [`${OTHER}/2-b.webp`]);
    expect(remove).not.toHaveBeenCalled();
  });

  it('never throws on storage errors and logs without ids or paths', async () => {
    const remove = vi.fn(async () => ({ data: null, error: { message: `Object ${OWNER}/1-a.webp denied`, statusCode: '403' } }));
    const result = await removePostImages(clientWith(remove), 'review-images', OWNER, [`${OWNER}/1-a.webp`]);
    expect(result).toEqual({ requested: 1, removed: 0 });
    const logged = warn.mock.calls.flat().join(' ');
    expect(logged).not.toContain(OWNER);
    expect(logged).toContain('<uuid>');
  });

  it('swallows thrown exceptions', async () => {
    const remove = vi.fn(async () => {
      throw new Error('network down');
    });
    await expect(removePostImages(clientWith(remove), 'record-images', OWNER, [`${OWNER}/1-a.webp`])).resolves.toEqual({
      requested: 1,
      removed: 0,
    });
  });

  it('warns when storage removed fewer objects than requested (e.g. RLS)', async () => {
    const remove = vi.fn(async () => ({ data: [], error: null }));
    await removePostImages(clientWith(remove), 'record-images', OWNER, [`${OWNER}/1-a.webp`]);
    expect(warn).toHaveBeenCalled();
  });
});

describe('removeDroppedPostImages', () => {
  let warn: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', ORIGIN);
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.unstubAllEnvs();
    warn.mockRestore();
  });

  function clientWithRow(current: { data: unknown; error: unknown }) {
    const remove = vi.fn(async (paths: string[]) => ({ data: paths.map((name) => ({ name })), error: null }));
    const maybeSingle = vi.fn(async () => current);
    const eqUser = vi.fn(() => ({ maybeSingle }));
    const eqId = vi.fn(() => ({ eq: eqUser }));
    const client = {
      from: vi.fn(() => ({ select: vi.fn(() => ({ eq: eqId })) })),
      storage: { from: vi.fn(() => ({ remove })) },
    } as unknown as SupabaseClient;
    return { client, remove, maybeSingle, eqId, eqUser };
  }

  const a = url('review-images', `${OWNER}/1-a.webp`);
  const b = url('review-images', `${OWNER}/2-b.webp`);

  it('re-reads the row and keeps dropped images that a concurrent edit wrote back', async () => {
    const fake = clientWithRow({ data: { images: [a] }, error: null });
    const result = await removeDroppedPostImages(fake.client, 'reviews', 'r1', OWNER, [a, b], []);
    expect(fake.eqId).toHaveBeenCalledWith('id', 'r1');
    expect(fake.eqUser).toHaveBeenCalledWith('user_id', OWNER);
    expect(fake.remove).toHaveBeenCalledWith([`${OWNER}/2-b.webp`]);
    expect(result).toEqual({ requested: 1, removed: 1 });
  });

  it('removes nothing when the re-read fails', async () => {
    const fake = clientWithRow({ data: null, error: { message: 'boom' } });
    await removeDroppedPostImages(fake.client, 'reviews', 'r1', OWNER, [a], []);
    expect(fake.remove).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalled();
  });

  it('skips the re-read when nothing was dropped', async () => {
    const fake = clientWithRow({ data: { images: [a] }, error: null });
    await removeDroppedPostImages(fake.client, 'reviews', 'r1', OWNER, [a], [a]);
    expect(fake.maybeSingle).not.toHaveBeenCalled();
    expect(fake.remove).not.toHaveBeenCalled();
  });
});

describe('sweepUnreferencedPostImages', () => {
  const NOW = Date.parse('2026-10-01T12:00:00.000Z');
  const OLD = '2026-09-29T00:00:00.000Z';
  const FRESH = '2026-10-01T06:00:00.000Z';

  type Obj = { path: string; created_at: string | null };
  type Row = { id: string; user_id: string | null; images: unknown };

  function createFakeServiceClient(
    objects: Record<string, Obj[]>,
    tables: Record<string, Row[]>,
    { failTable, refPageSize }: { failTable?: string; refPageSize?: number } = {},
  ) {
    const buckets = new Map(Object.entries(objects).map(([b, objs]) => [b, new Map(objs.map((o) => [o.path, o]))]));

    const list = vi.fn(async (bucket: string, prefix: string, opts: { limit: number; offset: number }) => {
      const base = prefix === '' ? '' : `${prefix}/`;
      const children = new Map<string, { name: string; id: string | null; created_at: string | null }>();
      for (const obj of buckets.get(bucket)?.values() ?? []) {
        if (!obj.path.startsWith(base)) continue;
        const [head, ...tail] = obj.path.slice(base.length).split('/');
        children.set(
          head,
          tail.length > 0 ? { name: head, id: null, created_at: null } : { name: head, id: `id-${obj.path}`, created_at: obj.created_at },
        );
      }
      const sorted = [...children.values()].sort((a, b) => a.name.localeCompare(b.name));
      return { data: sorted.slice(opts.offset, opts.offset + opts.limit), error: null };
    });

    const remove = vi.fn(async (bucket: string, paths: string[]) => {
      const set = buckets.get(bucket);
      const removed = paths.filter((p) => set?.delete(p));
      return { data: removed.map((name) => ({ name })), error: null };
    });

    const selects: string[] = [];
    const from = vi.fn((table: string) => {
      const state: { gt: string | null; limit: number } = { gt: null, limit: Infinity };
      const builder = {
        select: (cols: string) => {
          selects.push(`${table}:${cols}`);
          return builder;
        },
        order: () => builder,
        limit: (n: number) => {
          state.limit = Math.min(n, refPageSize ?? n);
          return builder;
        },
        gt: (_col: string, value: string) => {
          state.gt = value;
          return builder;
        },
        then: (resolve: (v: unknown) => void) => {
          if (table === failTable) return resolve({ data: null, error: { message: 'boom' } });
          const rows = [...(tables[table] ?? [])]
            .sort((a, b) => a.id.localeCompare(b.id))
            .filter((r) => state.gt === null || r.id > state.gt)
            .slice(0, state.limit);
          return resolve({ data: rows, error: null });
        },
      };
      return builder;
    });

    const client = {
      from,
      storage: {
        from: (bucket: string) => ({
          list: (prefix: string, opts: { limit: number; offset: number }) => list(bucket, prefix, opts),
          remove: (paths: string[]) => remove(bucket, paths),
        }),
      },
    } as unknown as SupabaseClient;

    return { client, buckets, remove, from, selects };
  }

  const remaining = (fake: ReturnType<typeof createFakeServiceClient>, bucket: string) =>
    [...(fake.buckets.get(bucket)?.keys() ?? [])].sort();

  it('removes unreferenced objects older than 24h and keeps referenced or fresh ones', async () => {
    const fake = createFakeServiceClient(
      {
        'review-images': [
          { path: `${OWNER}/1-referenced.webp`, created_at: OLD },
          { path: `${OWNER}/2-orphan.webp`, created_at: OLD },
          { path: `${OWNER}/3-fresh.webp`, created_at: FRESH },
          { path: `${OWNER}/4-no-date.webp`, created_at: null },
          { path: 'not-a-uuid/5-manual.webp', created_at: OLD },
          { path: `${OWNER}/.emptyFolderPlaceholder`, created_at: OLD },
        ],
        'record-images': [
          { path: `${OTHER}/1-referenced-bare.webp`, created_at: OLD },
          { path: `${OTHER}/2-orphan.webp`, created_at: OLD },
        ],
      },
      {
        reviews: [{ id: 'r1', user_id: OWNER, images: [url('review-images', `${OWNER}/1-referenced.webp`)] }],
        game_records: [
          { id: 'g1', user_id: OTHER, images: [`${OTHER}/1-referenced-bare.webp`] },
          { id: 'g2', user_id: OWNER, images: null },
        ],
      },
    );

    const summary = await sweepUnreferencedPostImages(fake.client, { now: NOW });

    expect(summary).toEqual({
      buckets: {
        'review-images': { scanned: 4, referenced: 1, eligible: 1, removed: 1 },
        'record-images': { scanned: 2, referenced: 1, eligible: 1, removed: 1 },
      },
      truncated: false,
      folders: { total: 2, scanned: 2 },
      cutShort: false,
    });
    expect(remaining(fake, 'review-images')).toEqual(
      [
        `${OWNER}/.emptyFolderPlaceholder`,
        `${OWNER}/1-referenced.webp`,
        `${OWNER}/3-fresh.webp`,
        `${OWNER}/4-no-date.webp`,
        'not-a-uuid/5-manual.webp',
      ].sort(),
    );
    expect(remaining(fake, 'record-images')).toEqual([`${OTHER}/1-referenced-bare.webp`]);
  });

  it("does not let a post keep another user's image alive, nor an image of the other bucket", async () => {
    const fake = createFakeServiceClient(
      { 'review-images': [{ path: `${OTHER}/1-victim.webp`, created_at: OLD }], 'record-images': [] },
      {
        reviews: [{ id: 'r1', user_id: OWNER, images: [url('review-images', `${OTHER}/1-victim.webp`)] }],
        game_records: [{ id: 'g1', user_id: OTHER, images: [url('review-images', `${OTHER}/1-victim.webp`)] }],
      },
    );
    const summary = await sweepUnreferencedPostImages(fake.client, { now: NOW });
    expect(summary.buckets['review-images'].removed).toBe(1);
  });

  it('caps removals per run across buckets and reports truncation', async () => {
    const make = (n: number, tag: string) =>
      Array.from({ length: n }, (_, i) => ({ path: `${OWNER}/${tag}-${String(i).padStart(3, '0')}.webp`, created_at: OLD }));
    const fake = createFakeServiceClient(
      { 'review-images': make(150, 'r'), 'record-images': make(100, 'g') },
      { reviews: [], game_records: [] },
    );

    const summary = await sweepUnreferencedPostImages(fake.client, { now: NOW, maxRemovals: 200 });

    expect(summary.truncated).toBe(true);
    expect(summary.buckets['review-images']).toMatchObject({ eligible: 150, removed: 150 });
    expect(summary.buckets['record-images']).toMatchObject({ eligible: 100, removed: 50 });
    expect(remaining(fake, 'record-images')).toHaveLength(50);
    expect(fake.remove.mock.calls.every(([, paths]) => paths.length <= 100)).toBe(true);
  });

  it('pages references by id even when the server caps the page size', async () => {
    const rows = Array.from({ length: 7 }, (_, i) => ({
      id: `r${i}`,
      user_id: OWNER,
      images: [`${OWNER}/${i}.webp`],
    }));
    const fake = createFakeServiceClient(
      { 'review-images': rows.map((r, i) => ({ path: `${OWNER}/${i}.webp`, created_at: OLD })), 'record-images': [] },
      { reviews: rows, game_records: [] },
      { refPageSize: 3 },
    );
    const summary = await sweepUnreferencedPostImages(fake.client, { now: NOW });
    expect(summary.buckets['review-images']).toMatchObject({ scanned: 7, referenced: 7, removed: 0 });
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('keeps objects referenced through double-slash, root-relative or transform URLs', async () => {
    const shapes = [
      `${ORIGIN}//storage/v1/object/public/review-images/${OWNER}/1.webp`,
      `/storage/v1/object/public/review-images/${OWNER}/2.webp`,
      `${ORIGIN}/storage/v1/render/image/public/review-images/${OWNER}/3.webp?width=100`,
    ];
    const fake = createFakeServiceClient(
      {
        'review-images': [1, 2, 3, 4].map((i) => ({ path: `${OWNER}/${i}.webp`, created_at: OLD })),
        'record-images': [],
      },
      { reviews: [{ id: 'r1', user_id: OWNER, images: shapes }], game_records: [] },
    );
    const summary = await sweepUnreferencedPostImages(fake.client, { now: NOW });
    expect(summary.buckets['review-images']).toMatchObject({ scanned: 4, eligible: 1, removed: 1 });
    expect(remaining(fake, 'review-images')).toEqual([`${OWNER}/1.webp`, `${OWNER}/2.webp`, `${OWNER}/3.webp`]);
  });

  it('stops listing at the deadline, deletes only from scanned folders, and rotates the start', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fake = createFakeServiceClient(
      {
        'review-images': [
          { path: `${OWNER}/1.webp`, created_at: OLD },
          { path: `${OTHER}/2.webp`, created_at: OLD },
        ],
        'record-images': [{ path: `${OWNER}/3.webp`, created_at: OLD }],
      },
      { reviews: [], game_records: [] },
    );
    // Folders in order: review/OWNER, review/OTHER, record/OWNER. Start at the
    // second one; the clock allows exactly one folder listing.
    let ticks = 0;
    const summary = await sweepUnreferencedPostImages(fake.client, {
      now: NOW,
      deadline: 1,
      clock: () => ticks++,
      startFraction: 0.5,
    });
    expect(summary.cutShort).toBe(true);
    expect(summary.folders).toEqual({ total: 3, scanned: 1 });
    expect(remaining(fake, 'review-images')).toEqual([`${OWNER}/1.webp`]);
    expect(remaining(fake, 'record-images')).toEqual([`${OWNER}/3.webp`]);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('aborts without deleting anything when references cannot be read', async () => {
    const fake = createFakeServiceClient(
      { 'review-images': [{ path: `${OWNER}/1.webp`, created_at: OLD }], 'record-images': [] },
      { reviews: [], game_records: [] },
      { failTable: 'game_records' },
    );
    await expect(sweepUnreferencedPostImages(fake.client, { now: NOW })).rejects.toBeTruthy();
    expect(fake.remove).not.toHaveBeenCalled();
  });
});
