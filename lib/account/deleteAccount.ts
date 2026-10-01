import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * 회원 탈퇴 — the single deletion code path shared by
 *   - DELETE /api/account            (self-service, session user only)
 *   - scripts/delete-user.ts --execute (admin, by email)
 *
 * Must be called with a SERVICE ROLE client. Keep this module free of
 * Next.js imports (`next/headers` etc.) so the admin script can load it.
 *
 * Order (each step is idempotent, so a failed run can simply be retried —
 * the auth user and its session survive until the very last step):
 *   1. DB        — rpc('delete_user_account'): one transaction that deletes /
 *                  detaches every public row of the user, incl. public.users.
 *                  First, so that a missing/failed RPC (e.g. code deployed
 *                  before the migration) aborts with NOTHING touched — images
 *                  would otherwise be gone while reviews/records still point
 *                  at them.
 *   2. Storage   — remove every object under `<userId>/` in the image buckets.
 *                  SQL cannot do this (storage.protect_delete trigger). If it
 *                  fails, the auth user still exists, so the user (or admin
 *                  script) can retry; step 1 then returns all-zero counts.
 *   3. Auth      — auth.admin.deleteUser(userId) hard delete (GoTrue cascades
 *                  identities/sessions). After step 1, because the NO ACTION
 *                  FKs to auth.users must be cleared first. A "user not found"
 *                  here counts as success (already deleted).
 *   4. Storage   — best-effort second sweep. deleteUser revokes refresh tokens
 *                  but an already-issued access token stays valid until it
 *                  expires (~1h), and the storage INSERT policies only check
 *                  auth.uid(); storage.objects has no FK to auth.users. So an
 *                  upload from another open tab can land after step 2. Failures
 *                  here are logged, not thrown (the account IS deleted).
 *                  Uploads after this sweep are removed by the daily
 *                  /api/cron/cleanup orphan sweep (sweepOrphanedUserStorage).
 */

/** Buckets whose object paths start with `<userId>/` (see lib/imageUtils.ts generateImagePath). */
export const USER_IMAGE_BUCKETS = ['review-images', 'record-images'] as const;
export type UserImageBucket = (typeof USER_IMAGE_BUCKETS)[number];

const LIST_PAGE_SIZE = 100;
const REMOVE_BATCH_SIZE = 100;
const MAX_FOLDER_DEPTH = 5;

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_ANYWHERE_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
const EMAIL_ANYWHERE_RE = /[^\s@'"<>]+@[^\s@'"<>]+\.[^\s@'"<>]+/g;

export type AccountDeletionStep = 'validate' | 'storage' | 'database' | 'auth';

export interface AccountDeletionSummary {
  /** Number of storage objects removed per bucket. */
  storage: Record<UserImageBucket, number>;
  /** Per-table counts returned by public.delete_user_account (rows deleted or detached). */
  database: Record<string, number>;
  /** false when the auth user was already gone (idempotent re-run). */
  authUserDeleted: boolean;
}

export class AccountDeletionError extends Error {
  readonly step: AccountDeletionStep;

  constructor(step: AccountDeletionStep, message: string) {
    super(message);
    this.name = 'AccountDeletionError';
    this.step = step;
  }
}

interface ErrorLike {
  message?: string;
  code?: string;
  status?: number;
  statusCode?: string | number;
}

/** Error description safe for logs: no user ids, emails or paths. */
export function describeErrorSafely(error: unknown): string {
  const e = (error ?? {}) as ErrorLike;
  const parts: string[] = [];
  if (e.code) parts.push(`code=${e.code}`);
  const status = e.status ?? e.statusCode;
  if (status !== undefined) parts.push(`status=${status}`);
  const message = typeof e.message === 'string' ? e.message : String(error);
  parts.push(
    message
      .replace(UUID_ANYWHERE_RE, '<uuid>')
      .replace(EMAIL_ANYWHERE_RE, '<email>')
      .slice(0, 200),
  );
  return parts.join(' ');
}

function fail(step: AccountDeletionStep, error: unknown): never {
  const detail = describeErrorSafely(error);
  console.error(`[account-deletion] step=${step} failed: ${detail}`);
  throw new AccountDeletionError(step, `Account deletion failed at step "${step}": ${detail}`);
}

/**
 * Lists every object path under `<userId>/` in a bucket (recurses into
 * sub-folders, pages through results). Read-only; also used by the admin
 * script's dry run.
 */
export async function listUserStorageObjects(
  client: SupabaseClient,
  bucket: UserImageBucket,
  userId: string,
): Promise<string[]> {
  const paths: string[] = [];

  const walk = async (prefix: string, depth: number): Promise<void> => {
    for (let offset = 0; ; offset += LIST_PAGE_SIZE) {
      const { data, error } = await client.storage.from(bucket).list(prefix, {
        limit: LIST_PAGE_SIZE,
        offset,
        sortBy: { column: 'name', order: 'asc' },
      });
      if (error) throw error;
      const items = data ?? [];

      for (const item of items) {
        const fullPath = `${prefix}/${item.name}`;
        // Folders come back with id === null.
        if (item.id === null) {
          if (depth < MAX_FOLDER_DEPTH) await walk(fullPath, depth + 1);
        } else {
          paths.push(fullPath);
        }
      }

      if (items.length < LIST_PAGE_SIZE) break;
    }
  };

  await walk(userId, 1);
  return paths;
}

async function removeUserStorage(
  client: SupabaseClient,
  bucket: UserImageBucket,
  userId: string,
): Promise<number> {
  // Collect the full list first, then remove: removing while paging with an
  // offset would shift the pages and skip objects.
  const paths = await listUserStorageObjects(client, bucket, userId);

  let removed = 0;
  for (let i = 0; i < paths.length; i += REMOVE_BATCH_SIZE) {
    const batch = paths.slice(i, i + REMOVE_BATCH_SIZE);
    const { data, error } = await client.storage.from(bucket).remove(batch);
    if (error) throw error;
    removed += data?.length ?? batch.length;
  }
  return removed;
}

function isUserNotFound(error: ErrorLike): boolean {
  return (
    error.status === 404 ||
    error.code === 'user_not_found' ||
    /user not found/i.test(error.message ?? '')
  );
}

async function runDatabaseCleanup(
  client: SupabaseClient,
  userId: string,
): Promise<Record<string, number>> {
  const { data, error } = await client.rpc('delete_user_account', { target_user_id: userId });
  if (error) fail('database', error);
  return (data ?? {}) as Record<string, number>;
}

function addCounts(a: Record<string, number>, b: Record<string, number>): Record<string, number> {
  const out = { ...a };
  for (const [key, value] of Object.entries(b)) {
    out[key] = (out[key] ?? 0) + (Number(value) || 0);
  }
  return out;
}

/**
 * Permanently deletes a user account and all of its data.
 *
 * @param serviceClient Supabase client created with the SERVICE ROLE key.
 * @param userId        auth.users id. Callers must derive it from a trusted
 *                      source (the session, or an admin lookup) — never from
 *                      request input.
 */
export async function deleteUserAccount(
  serviceClient: SupabaseClient,
  userId: string,
): Promise<AccountDeletionSummary> {
  if (!UUID_RE.test(userId)) {
    fail('validate', new Error('userId must be a uuid'));
  }

  // 1) Database (single transaction inside the function). Nothing else has
  //    been touched if this fails.
  let database = await runDatabaseCleanup(serviceClient, userId);

  // 2) Storage
  const storage = {} as Record<UserImageBucket, number>;
  for (const bucket of USER_IMAGE_BUCKETS) {
    try {
      storage[bucket] = await removeUserStorage(serviceClient, bucket, userId);
    } catch (error) {
      fail('storage', error);
    }
  }

  // 3) Auth (hard delete)
  let authUserDeleted = true;
  let { error: authError } = await serviceClient.auth.admin.deleteUser(userId, false);

  if (authError && !isUserNotFound(authError)) {
    // Most likely a concurrent request (e.g. another open tab) re-created a
    // row between step 1 and 3, so an FK blocked the delete. Re-run the
    // idempotent cleanup once and retry.
    console.warn(
      `[account-deletion] auth delete failed, retrying after cleanup: ${describeErrorSafely(authError)}`,
    );
    database = addCounts(database, await runDatabaseCleanup(serviceClient, userId));
    ({ error: authError } = await serviceClient.auth.admin.deleteUser(userId, false));
  }

  if (authError) {
    if (isUserNotFound(authError)) {
      authUserDeleted = false;
    } else {
      fail('auth', authError);
    }
  }

  // 4) Best-effort storage sweep for uploads that raced steps 2–3.
  for (const bucket of USER_IMAGE_BUCKETS) {
    try {
      storage[bucket] += await removeUserStorage(serviceClient, bucket, userId);
    } catch (error) {
      console.warn(
        `[account-deletion] post-delete storage sweep failed (bucket=${bucket}); left for the cleanup cron: ${describeErrorSafely(error)}`,
      );
    }
  }

  return { storage, database, authUserDeleted };
}

export interface OrphanSweepSummary {
  /** Per bucket: top-level `<uuid>/` folders seen and objects removed from orphaned ones. */
  buckets: Record<UserImageBucket, { folders: number; removed: number }>;
  /** Distinct user ids confirmed deleted (no public.users row AND no auth user). */
  orphanUsers: number;
  /** true when more orphans exist than `maxUsers`; the rest go next run. */
  truncated: boolean;
}

async function listTopLevelUserFolders(client: SupabaseClient, bucket: UserImageBucket): Promise<string[]> {
  const ids: string[] = [];
  for (let offset = 0; ; offset += LIST_PAGE_SIZE) {
    const { data, error } = await client.storage.from(bucket).list('', {
      limit: LIST_PAGE_SIZE,
      offset,
      sortBy: { column: 'name', order: 'asc' },
    });
    if (error) throw error;
    const items = data ?? [];
    for (const item of items) {
      if (item.id === null && UUID_RE.test(item.name)) ids.push(item.name);
    }
    if (items.length < LIST_PAGE_SIZE) break;
  }
  return ids;
}

/**
 * Removes image folders of users that no longer exist — uploads that slipped
 * in with a still-valid access token after deleteUserAccount() finished (see
 * step 4 above). Called by /api/cron/cleanup.
 *
 * Destructive, so a folder is removed only when BOTH checks agree the user is
 * gone: no public.users row (every live account has one, via the
 * on_auth_user_created trigger) AND auth.admin.getUserById → "not found". Any
 * lookup error aborts (DB) or skips that user (auth), never deletes. At most
 * `maxUsers` users are processed per run to bound the blast radius.
 */
export async function sweepOrphanedUserStorage(
  client: SupabaseClient,
  { maxUsers = 20 }: { maxUsers?: number } = {},
): Promise<OrphanSweepSummary> {
  const folders = {} as Record<UserImageBucket, string[]>;
  for (const bucket of USER_IMAGE_BUCKETS) {
    folders[bucket] = await listTopLevelUserFolders(client, bucket);
  }

  const allIds = [...new Set(USER_IMAGE_BUCKETS.flatMap((b) => folders[b]))];
  const existing = new Set<string>();
  for (let i = 0; i < allIds.length; i += LIST_PAGE_SIZE) {
    const chunk = allIds.slice(i, i + LIST_PAGE_SIZE);
    const { data, error } = await client.from('users').select('id').in('id', chunk);
    if (error) throw error;
    for (const row of (data ?? []) as Array<{ id: string }>) existing.add(row.id);
  }

  const candidates = allIds.filter((id) => !existing.has(id));
  const confirmed: string[] = [];
  let truncated = false;
  for (const id of candidates) {
    if (confirmed.length >= maxUsers) {
      truncated = true;
      break;
    }
    // Anything other than an explicit "not found" (lookup error, or an auth
    // user that still exists, e.g. mid-deletion) leaves the folder alone.
    const { error } = await client.auth.admin.getUserById(id);
    if (error && isUserNotFound(error)) confirmed.push(id);
  }

  const buckets = {} as OrphanSweepSummary['buckets'];
  for (const bucket of USER_IMAGE_BUCKETS) {
    let removed = 0;
    const inBucket = new Set(folders[bucket]);
    for (const id of confirmed) {
      if (inBucket.has(id)) removed += await removeUserStorage(client, bucket, id);
    }
    buckets[bucket] = { folders: folders[bucket].length, removed };
  }

  return { buckets, orphanUsers: confirmed.length, truncated };
}
