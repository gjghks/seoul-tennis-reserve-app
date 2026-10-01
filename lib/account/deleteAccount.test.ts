import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  deleteUserAccount,
  describeErrorSafely,
  listUserStorageObjects,
  sweepOrphanedUserStorage,
} from './deleteAccount';

const USER_ID = '11111111-2222-4333-8444-555555555555';

type ListItem = { name: string; id: string | null };

/** Fake service-role client: in-memory buckets keyed by full object path. */
function createFakeClient(
  initial: Record<string, string[]>,
  { publicUsers = [] as string[], authUsers = [] as string[] } = {},
) {
  const buckets = new Map<string, Set<string>>(
    Object.entries(initial).map(([bucket, paths]) => [bucket, new Set(paths)])
  );
  const calls: string[] = [];

  const list = vi.fn(async (bucket: string, prefix: string, opts: { limit: number; offset: number }) => {
    const base = prefix === '' ? '' : `${prefix}/`;
    const all = [...(buckets.get(bucket) ?? [])].filter((p) => p.startsWith(base));
    const children = new Map<string, ListItem>();
    for (const p of all) {
      const rest = p.slice(base.length);
      const [head, ...tail] = rest.split('/');
      children.set(head, { name: head, id: tail.length > 0 ? null : `id-${p}` });
    }
    const sorted = [...children.values()].sort((a, b) => a.name.localeCompare(b.name));
    return { data: sorted.slice(opts.offset, opts.offset + opts.limit), error: null };
  });

  const remove = vi.fn(async (bucket: string, paths: string[]) => {
    calls.push(`remove:${bucket}:${paths.length}`);
    const set = buckets.get(bucket);
    const removed = paths.filter((p) => set?.delete(p));
    return { data: removed.map((name) => ({ name })), error: null };
  });

  const rpc = vi.fn(async (fn: string, args: Record<string, unknown>) => {
    calls.push(`rpc:${fn}:${String(args.target_user_id)}`);
    return { data: { users: 1, favorites: 2 }, error: null as unknown };
  });

  const deleteUser = vi.fn(async (id: string, soft?: boolean) => {
    calls.push(`deleteUser:${id}:${String(soft)}`);
    return { data: { user: null }, error: null as unknown };
  });

  const getUserById = vi.fn(async (id: string) =>
    authUsers.includes(id)
      ? { data: { user: { id } }, error: null as unknown }
      : { data: { user: null }, error: { status: 404, code: 'user_not_found', message: 'User not found' } as unknown },
  );

  const usersIn = vi.fn(async (_col: string, ids: string[]) => ({
    data: ids.filter((id) => publicUsers.includes(id)).map((id) => ({ id })),
    error: null as unknown,
  }));

  const client = {
    from: (table: string) => {
      if (table !== 'users') throw new Error(`unexpected table ${table}`);
      return { select: () => ({ in: usersIn }) };
    },
    storage: {
      from: (bucket: string) => ({
        list: (prefix: string, opts: { limit: number; offset: number }) => list(bucket, prefix, opts),
        remove: (paths: string[]) => remove(bucket, paths),
      }),
    },
    rpc,
    auth: { admin: { deleteUser, getUserById } },
  };

  return {
    client: client as unknown as SupabaseClient,
    buckets,
    calls,
    list,
    remove,
    rpc,
    deleteUser,
    getUserById,
    usersIn,
  };
}

const makePaths = (n: number, prefix = USER_ID) =>
  Array.from({ length: n }, (_, i) => `${prefix}/${String(i).padStart(4, '0')}-img.webp`);

describe('listUserStorageObjects', () => {
  it('pages through more than one page and recurses into folders', async () => {
    const paths = [...makePaths(250), `${USER_ID}/nested/a.webp`];
    const { client, list } = createFakeClient({ 'review-images': paths });

    const result = await listUserStorageObjects(client, 'review-images', USER_ID);

    expect(result).toHaveLength(251);
    expect(new Set(result)).toEqual(new Set(paths));
    // 3 pages at the top level (100, 100, 51) + 1 for the nested folder
    expect(list).toHaveBeenCalledTimes(4);
  });

  it('only lists the user prefix', async () => {
    const other = '99999999-2222-4333-8444-555555555555';
    const { client } = createFakeClient({ 'review-images': [...makePaths(2), ...makePaths(3, other)] });

    const result = await listUserStorageObjects(client, 'review-images', USER_ID);

    expect(result).toHaveLength(2);
    expect(result.every((p) => p.startsWith(`${USER_ID}/`))).toBe(true);
  });
});

describe('deleteUserAccount', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  it('calls the RPC, then removes storage in both buckets (paginated), then hard-deletes the auth user', async () => {
    const other = '99999999-2222-4333-8444-555555555555';
    const fake = createFakeClient({
      'review-images': [...makePaths(150), ...makePaths(1, other)],
      'record-images': makePaths(3),
    });

    const summary = await deleteUserAccount(fake.client, USER_ID);

    expect(summary).toEqual({
      storage: { 'review-images': 150, 'record-images': 3 },
      database: { users: 1, favorites: 2 },
      authUserDeleted: true,
    });
    expect(fake.calls).toEqual([
      `rpc:delete_user_account:${USER_ID}`,
      'remove:review-images:100',
      'remove:review-images:50',
      'remove:record-images:3',
      `deleteUser:${USER_ID}:false`,
      // post-delete sweep found nothing left -> no remove calls
    ]);
    // Other users' objects are untouched
    expect([...fake.buckets.get('review-images')!]).toEqual(makePaths(1, other));
  });

  it('leaves storage untouched when the RPC is missing (code deployed before the migration)', async () => {
    const fake = createFakeClient({ 'review-images': makePaths(2), 'record-images': makePaths(1) });
    fake.rpc.mockResolvedValueOnce({
      data: null,
      error: { code: 'PGRST202', message: 'Could not find the function public.delete_user_account(target_user_id)' },
    } as never);

    await expect(deleteUserAccount(fake.client, USER_ID)).rejects.toMatchObject({ step: 'database' });
    expect(fake.remove).not.toHaveBeenCalled();
    expect(fake.deleteUser).not.toHaveBeenCalled();
    expect(fake.buckets.get('review-images')!.size).toBe(2);
    expect(fake.buckets.get('record-images')!.size).toBe(1);
  });

  it('removes images uploaded after the first storage pass (post-delete sweep)', async () => {
    const fake = createFakeClient({ 'review-images': makePaths(1) });
    // A racing upload from another tab lands while the auth user is being deleted.
    fake.deleteUser.mockImplementationOnce(async () => {
      fake.buckets.get('review-images')!.add(`${USER_ID}/late-upload.webp`);
      return { data: { user: null }, error: null };
    });

    const summary = await deleteUserAccount(fake.client, USER_ID);

    expect(summary.storage['review-images']).toBe(2);
    expect(fake.buckets.get('review-images')!.size).toBe(0);
  });

  it('does not fail the deletion when the post-delete sweep fails', async () => {
    const fake = createFakeClient({});
    fake.deleteUser.mockImplementationOnce(async () => {
      fake.list.mockResolvedValue({ data: null, error: { message: 'storage down' } } as never);
      return { data: { user: null }, error: null };
    });

    const summary = await deleteUserAccount(fake.client, USER_ID);

    expect(summary.authUserDeleted).toBe(true);
    expect(console.warn).toHaveBeenCalled();
  });

  it('rejects a non-uuid id without touching anything', async () => {
    const fake = createFakeClient({});
    await expect(deleteUserAccount(fake.client, 'not-a-uuid')).rejects.toMatchObject({ step: 'validate' });
    expect(fake.calls).toEqual([]);
  });

  it('does not delete the auth user when storage fails (retryable: the session survives)', async () => {
    const fake = createFakeClient({ 'review-images': makePaths(1) });
    fake.remove.mockResolvedValueOnce({ data: [], error: { message: 'boom' } } as never);

    await expect(deleteUserAccount(fake.client, USER_ID)).rejects.toMatchObject({ step: 'storage' });
    expect(fake.rpc).toHaveBeenCalledTimes(1);
    expect(fake.deleteUser).not.toHaveBeenCalled();
  });

  it('does not delete the auth user when the RPC fails', async () => {
    const fake = createFakeClient({});
    fake.rpc.mockResolvedValueOnce({ data: null, error: { code: '42501', message: 'permission denied' } } as never);

    await expect(deleteUserAccount(fake.client, USER_ID)).rejects.toMatchObject({ step: 'database' });
    expect(fake.deleteUser).not.toHaveBeenCalled();
  });

  it('re-runs the cleanup once and retries when the auth delete fails (e.g. FK from a racing insert)', async () => {
    const fake = createFakeClient({});
    fake.deleteUser.mockResolvedValueOnce({
      data: { user: null },
      error: { status: 500, message: 'Database error deleting user' },
    } as never);

    const summary = await deleteUserAccount(fake.client, USER_ID);

    expect(fake.rpc).toHaveBeenCalledTimes(2);
    expect(fake.deleteUser).toHaveBeenCalledTimes(2);
    expect(summary.authUserDeleted).toBe(true);
    expect(summary.database).toEqual({ users: 2, favorites: 4 });
  });

  it('throws at the auth step when the retry also fails', async () => {
    const fake = createFakeClient({});
    const err = { data: { user: null }, error: { status: 500, message: 'Database error deleting user' } };
    fake.deleteUser.mockResolvedValueOnce(err as never).mockResolvedValueOnce(err as never);

    await expect(deleteUserAccount(fake.client, USER_ID)).rejects.toMatchObject({ step: 'auth' });
  });

  it('treats an already-deleted auth user as success (idempotent re-run)', async () => {
    const fake = createFakeClient({});
    fake.deleteUser.mockResolvedValueOnce({
      data: { user: null },
      error: { status: 404, code: 'user_not_found', message: 'User not found' },
    } as never);

    const summary = await deleteUserAccount(fake.client, USER_ID);

    expect(summary.authUserDeleted).toBe(false);
    expect(fake.deleteUser).toHaveBeenCalledTimes(1);
  });
});

describe('sweepOrphanedUserStorage', () => {
  const LIVE = '22222222-2222-4333-8444-555555555555';
  const GONE = '33333333-2222-4333-8444-555555555555';
  const MID = '44444444-2222-4333-8444-555555555555'; // public row gone, auth user still there

  it('removes folders only of users missing from BOTH public.users and auth', async () => {
    const fake = createFakeClient(
      {
        'review-images': [...makePaths(2, LIVE), ...makePaths(2, GONE), ...makePaths(1, MID), 'not-a-uuid/x.webp'],
        'record-images': makePaths(3, GONE),
      },
      { publicUsers: [LIVE], authUsers: [LIVE, MID] },
    );

    const summary = await sweepOrphanedUserStorage(fake.client);

    expect(summary).toEqual({
      buckets: { 'review-images': { folders: 3, removed: 2 }, 'record-images': { folders: 1, removed: 3 } },
      orphanUsers: 1,
      truncated: false,
    });
    expect([...fake.buckets.get('review-images')!].sort()).toEqual(
      [...makePaths(2, LIVE), ...makePaths(1, MID), 'not-a-uuid/x.webp'].sort(),
    );
    expect(fake.buckets.get('record-images')!.size).toBe(0);
    // Live users are never looked up in auth
    expect(fake.getUserById).not.toHaveBeenCalledWith(LIVE);
  });

  it('skips a user when the auth lookup errors with anything but "not found"', async () => {
    const fake = createFakeClient({ 'review-images': makePaths(1, GONE) });
    fake.getUserById.mockResolvedValueOnce({ data: { user: null }, error: { status: 500, message: 'down' } } as never);

    const summary = await sweepOrphanedUserStorage(fake.client);

    expect(summary.orphanUsers).toBe(0);
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('aborts without deleting anything when the public.users lookup fails', async () => {
    const fake = createFakeClient({ 'review-images': makePaths(1, GONE) });
    fake.usersIn.mockResolvedValueOnce({ data: null, error: { message: 'db down' } } as never);

    await expect(sweepOrphanedUserStorage(fake.client)).rejects.toBeTruthy();
    expect(fake.remove).not.toHaveBeenCalled();
  });

  it('processes at most maxUsers orphans per run', async () => {
    const ids = ['a', 'b', 'c'].map((c) => `${c.repeat(8)}-2222-4333-8444-555555555555`);
    const fake = createFakeClient({ 'review-images': ids.flatMap((id) => makePaths(1, id)) });

    const summary = await sweepOrphanedUserStorage(fake.client, { maxUsers: 2 });

    expect(summary.orphanUsers).toBe(2);
    expect(summary.truncated).toBe(true);
    expect(fake.buckets.get('review-images')!.size).toBe(1);
  });
});

describe('describeErrorSafely', () => {
  it('redacts uuids and emails', () => {
    const text = describeErrorSafely({
      code: 'X1',
      status: 400,
      message: `object ${USER_ID}/a.webp of someone@example.com failed`,
    });
    expect(text).toContain('code=X1');
    expect(text).toContain('status=400');
    expect(text).not.toContain(USER_ID);
    expect(text).not.toContain('someone@example.com');
  });
});
