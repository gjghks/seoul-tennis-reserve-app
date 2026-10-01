import type { SupabaseClient } from '@supabase/supabase-js';
import {
  describeErrorSafely,
  listStorageObjects,
  listTopLevelUserFolders,
  USER_IMAGE_BUCKETS,
  type UserImageBucket,
} from '../account/deleteAccount';

/**
 * Storage cleanup for images attached to posts (reviews → `review-images`,
 * game records → `record-images`).
 *
 * The privacy policy promises that attached images are deleted as soon as the
 * post is deleted or the image is removed from it. Two layers implement that:
 *   1. Immediate: the review / record API routes call removePostImages() after
 *      the DB delete/update succeeded (the DB row is the source of truth; a
 *      storage failure is logged and does not fail the request).
 *   2. Fallback: the daily /api/cron/cleanup calls sweepUnreferencedPostImages(),
 *      which removes objects no post references any more (storage failures in
 *      layer 1, posts deleted directly through PostgREST, uploads whose post
 *      was never saved). Objects younger than 24h are kept so an upload that
 *      happens before its post is saved is not swept.
 *
 * Stored values are public URLs built by lib/imageUtils.ts getPublicUrl():
 *   `${NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/<bucket>/<uid>/<ms>-<name>.webp`
 * Bare object paths (`<uid>/...`) are accepted too.
 *
 * Two parsers, deliberately asymmetric:
 *   - objectPathFromStoredImage() (strict) decides what may be DELETED.
 *     When unsure it returns null, which only leaves an object behind.
 *   - referencedObjectPaths() (lenient) decides what is still REFERENCED.
 *     When unsure it over-matches, which only keeps an object.
 */

/** Which bucket holds each table's `images`. */
export const POST_IMAGE_TABLES = {
  reviews: 'review-images',
  game_records: 'record-images',
} as const satisfies Record<string, UserImageBucket>;

const PUBLIC_OBJECT_PREFIX = '/storage/v1/object/public/';
const MAX_VALUE_LENGTH = 2048;
const REMOVE_BATCH_SIZE = 100;
const REF_PAGE_SIZE = 1000;
/** Placeholder object Supabase Studio creates for empty folders. */
const FOLDER_PLACEHOLDER = '.emptyFolderPlaceholder';

export const ORPHAN_MIN_AGE_MS = 24 * 60 * 60 * 1000;
export const ORPHAN_MAX_REMOVALS_PER_RUN = 200;

interface ParseOptions {
  /**
   * Origin a URL must have (e.g. `https://<ref>.supabase.co`). `'*'` accepts
   * any origin — only for collecting references, where over-matching merely
   * keeps an object. `null` rejects every URL (bare paths only).
   */
  origin: string | '*' | null;
}

function supabaseOrigin(): string | undefined {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return undefined;
  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

function hasUnsafeSegments(raw: string): boolean {
  let decoded: string;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    return true;
  }
  return decoded.includes('\\') || decoded.split('/').some((s) => s === '.' || s === '..');
}

/**
 * Converts one stored `images` entry into an object path inside `bucket`, or
 * null when it is not a safe object of that bucket (other bucket, foreign
 * host, relative URL, `..`/`.`/empty segments, backslashes, control chars).
 * Does NOT check ownership — see ownedImagePaths().
 */
export function objectPathFromStoredImage(
  value: unknown,
  bucket: UserImageBucket,
  { origin }: ParseOptions,
): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_VALUE_LENGTH) return null;

  let encodedPath: string;
  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    // The URL parser silently resolves `..`, `%2e%2e` and `\`; reject them on
    // the raw string instead of trusting the normalized result.
    if (hasUnsafeSegments(trimmed.split(/[?#]/)[0])) return null;
    let url: URL;
    try {
      url = new URL(trimmed);
    } catch {
      return null;
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    if (origin === null || (origin !== '*' && url.origin !== origin)) return null;
    const prefix = `${PUBLIC_OBJECT_PREFIX}${bucket}/`;
    if (!url.pathname.startsWith(prefix)) return null;
    encodedPath = url.pathname.slice(prefix.length);
  } else {
    // Bare object path. Anything that looks like a URL path, protocol-relative
    // URL or query/fragment is not one we wrote.
    if (trimmed.startsWith('/') || /[?#]/.test(trimmed)) return null;
    encodedPath = trimmed;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(encodedPath);
  } catch {
    return null;
  }
  if (decoded.includes('\\') || /[\u0000-\u001f\u007f]/.test(decoded)) return null;

  const segments = decoded.split('/');
  if (segments.length < 2) return null;
  if (segments.some((s) => s === '' || s === '.' || s === '..')) return null;
  return segments.join('/');
}

function safeDecode(value: string): string | null {
  try {
    return decodeURIComponent(value);
  } catch {
    return null;
  }
}

/**
 * Every object path in `bucket` that one stored `images` entry could refer to.
 * Lenient on purpose (see the module comment): accepts any host, root-relative
 * `/storage/v1/...` values, repeated slashes (e.g. a trailing `/` on
 * NEXT_PUBLIC_SUPABASE_URL), any `/<bucket>/` endpoint (object, render/image,
 * sign, ...), raw and percent-decoded forms, and bare paths. Never use the
 * result to pick objects to delete.
 */
export function referencedObjectPaths(value: unknown, bucket: UserImageBucket): string[] {
  if (typeof value !== 'string') return [];
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > MAX_VALUE_LENGTH) return [];

  const out = new Set<string>();
  const add = (candidate: string) => {
    const path = candidate.replace(/^\/+/, '');
    if (path) out.add(path);
  };
  const marker = `/${bucket}/`;

  for (const form of [trimmed, safeDecode(trimmed)]) {
    if (form === null) continue;
    const collapsed = form.split(/[?#]/)[0].replace(/\/{2,}/g, '/');
    let found = false;
    for (let i = collapsed.indexOf(marker); i !== -1; i = collapsed.indexOf(marker, i + 1)) {
      add(collapsed.slice(i + marker.length));
      found = true;
    }
    // Bare path (`<uid>/...`, possibly with a leading `/`).
    if (!found && !/^[a-z][a-z0-9+.-]*:/i.test(collapsed)) add(collapsed);
  }
  return [...out];
}

/**
 * Validates an already-parsed object path WITHOUT decoding it again (a second
 * decode could turn `<uid>/a%252Fb` into a different object): the first
 * segment must be `ownerId`, no empty/`.`/`..` segments, no backslashes or
 * control characters.
 */
export function isSafeOwnedObjectPath(path: unknown, ownerId: string): path is string {
  if (typeof path !== 'string' || !ownerId || path.length > MAX_VALUE_LENGTH) return false;
  if (path.includes('\\') || /[\u0000-\u001f\u007f]/.test(path)) return false;
  const segments = path.split('/');
  if (segments.length < 2 || segments[0] !== ownerId) return false;
  return !segments.some((s) => s === '' || s === '.' || s === '..');
}

/**
 * Object paths in `bucket` that `values` point to AND that live under
 * `<ownerId>/` — the only objects a post of that user may delete. Deduplicated.
 * URLs must be on this project's Supabase origin.
 */
export function ownedImagePaths(
  values: readonly unknown[] | null | undefined,
  bucket: UserImageBucket,
  ownerId: string,
  { origin = supabaseOrigin() ?? null }: { origin?: string | null } = {},
): string[] {
  if (!ownerId || !Array.isArray(values)) return [];
  const out = new Set<string>();
  for (const value of values) {
    // origin null (no NEXT_PUBLIC_SUPABASE_URL) → bare paths only.
    const path = objectPathFromStoredImage(value, bucket, { origin });
    if (path && path.split('/')[0] === ownerId) out.add(path);
  }
  return [...out];
}

/**
 * Entries of `before` (owned by `ownerId`) whose object is no longer referenced
 * by `after` — i.e. images dropped by an edit.
 */
export function droppedImagePaths(
  before: readonly unknown[] | null | undefined,
  after: readonly unknown[] | null | undefined,
  bucket: UserImageBucket,
  ownerId: string,
  options: { origin?: string | null } = {},
): string[] {
  const kept = referencedPathSet(after, bucket);
  return ownedImagePaths(before, bucket, ownerId, options).filter((p) => !kept.has(p));
}

function referencedPathSet(values: readonly unknown[] | null | undefined, bucket: UserImageBucket): Set<string> {
  const set = new Set<string>();
  for (const value of Array.isArray(values) ? values : []) {
    for (const path of referencedObjectPaths(value, bucket)) set.add(path);
  }
  return set;
}

export interface RemovePostImagesResult {
  requested: number;
  removed: number;
}

/**
 * Best-effort removal of a post's images. Never throws: the DB change already
 * happened, and anything left behind is picked up by the cleanup cron
 * (sweepUnreferencedPostImages). Logs carry no user ids or paths.
 *
 * `client` is the caller's user-session client: storage RLS only lets it
 * delete objects under its own `<uid>/` folder, on top of the owner filter.
 */
export async function removePostImages(
  client: SupabaseClient,
  bucket: UserImageBucket,
  ownerId: string,
  paths: readonly string[],
): Promise<RemovePostImagesResult> {
  // Re-check defensively so callers cannot pass foreign paths through. The
  // paths are already parsed (decoded) — validate them as-is, never decode twice.
  const safe = [...new Set(paths.filter((p) => isSafeOwnedObjectPath(p, ownerId)))];
  if (safe.length === 0) return { requested: 0, removed: 0 };

  let removed = 0;
  try {
    for (let i = 0; i < safe.length; i += REMOVE_BATCH_SIZE) {
      const batch = safe.slice(i, i + REMOVE_BATCH_SIZE);
      const { data, error } = await client.storage.from(bucket).remove(batch);
      if (error) throw error;
      removed += data?.length ?? 0;
    }
  } catch (error) {
    console.warn(
      `[post-images] remove failed (bucket=${bucket}, requested=${safe.length}); left for the cleanup cron: ${describeErrorSafely(error)}`,
    );
    return { requested: safe.length, removed };
  }

  if (removed < safe.length) {
    // Already gone, or RLS refused it (storage returns no error then).
    console.warn(
      `[post-images] removed ${removed}/${safe.length} objects (bucket=${bucket}); rest left for the cleanup cron`,
    );
  }
  return { requested: safe.length, removed };
}

/**
 * After a successful edit of a post, removes the owner's images that the edit
 * dropped (`before` → `after`). Best-effort, never throws.
 *
 * Reading `before` and the UPDATE are separate statements, so a concurrent
 * edit of the same post (e.g. a stale second tab) may have written a dropped
 * image back. To narrow that window the row is re-read right before removing
 * and anything it references again is kept; if the re-read fails nothing is
 * removed (the cleanup cron picks the leftovers up). A tiny window between the
 * re-read and the remove remains; it only affects the owner's own post.
 */
export async function removeDroppedPostImages(
  client: SupabaseClient,
  table: keyof typeof POST_IMAGE_TABLES,
  postId: string,
  ownerId: string,
  before: readonly unknown[] | null | undefined,
  after: readonly unknown[] | null | undefined,
): Promise<RemovePostImagesResult> {
  const bucket = POST_IMAGE_TABLES[table];
  const dropped = droppedImagePaths(before, after, bucket, ownerId);
  if (dropped.length === 0) return { requested: 0, removed: 0 };

  try {
    const { data, error } = await client
      .from(table)
      .select('images')
      .eq('id', postId)
      .eq('user_id', ownerId)
      .maybeSingle();
    if (error) throw error;
    const current = referencedPathSet((data as { images?: unknown } | null)?.images as unknown[] | null, bucket);
    return await removePostImages(client, bucket, ownerId, dropped.filter((p) => !current.has(p)));
  } catch (error) {
    console.warn(
      `[post-images] re-read before removing dropped images failed (table=${table}); left for the cleanup cron: ${describeErrorSafely(error)}`,
    );
    return { requested: 0, removed: 0 };
  }
}

export interface UnreferencedSweepSummary {
  buckets: Record<
    UserImageBucket,
    {
      /** Objects under a `<uuid>/` folder. */
      scanned: number;
      /** Distinct owner-matching object paths referenced by posts. */
      referenced: number;
      /** Unreferenced objects older than the age threshold. */
      eligible: number;
      removed: number;
    }
  >;
  /** true when more objects were eligible than the per-run cap; the rest go next run. */
  truncated: boolean;
  /** `<uuid>/` folders across both buckets, and how many were listed this run. */
  folders: { total: number; scanned: number };
  /** true when the listing time budget ran out; unscanned folders are covered by later runs. */
  cutShort: boolean;
}

/**
 * Collects every object path of `bucket` referenced by `table.images`, counting
 * a reference only when the object lives in the row owner's folder (a post
 * cannot keep another user's image alive). Keyset pagination on `id`, so
 * concurrent inserts/deletes cannot shift pages and hide a row. Throws on any
 * error — a partial reference set must never drive deletions.
 */
async function collectReferencedPaths(
  client: SupabaseClient,
  table: keyof typeof POST_IMAGE_TABLES,
): Promise<Set<string>> {
  const bucket = POST_IMAGE_TABLES[table];
  const referenced = new Set<string>();
  let lastId: string | null = null;

  for (;;) {
    let query = client.from(table).select('id, user_id, images').order('id', { ascending: true }).limit(REF_PAGE_SIZE);
    if (lastId !== null) query = query.gt('id', lastId);
    const { data, error } = await query;
    if (error) throw error;
    const rows = (data ?? []) as Array<{ id: string; user_id: string | null; images: unknown }>;
    if (rows.length === 0) break;

    for (const row of rows) {
      if (!Array.isArray(row.images) || !row.user_id) continue;
      for (const path of referencedPathSet(row.images, bucket)) {
        if (path.split('/')[0] === row.user_id) referenced.add(path);
      }
    }
    lastId = rows[rows.length - 1].id;
  }
  return referenced;
}

/**
 * Removes post images that no review/record references and that are older
 * than `minAgeMs`. Only objects under a `<uuid>/` folder (the shape the app
 * uploads) are considered. Must be called with a SERVICE ROLE client.
 *
 * Objects are listed BEFORE references are read, so a post saved during the
 * sweep is still seen. Any list/read error aborts before deleting anything.
 *
 * Listing costs one storage call per user folder, so it stops at `deadline`
 * (leaving the caller time to read references and delete). Folders are
 * visited in a rotated order (random start by default) over both buckets, so
 * runs that are cut short still cover every folder over time; deciding per
 * folder is safe because references are read in full every run.
 */
export async function sweepUnreferencedPostImages(
  client: SupabaseClient,
  {
    maxRemovals = ORPHAN_MAX_REMOVALS_PER_RUN,
    minAgeMs = ORPHAN_MIN_AGE_MS,
    now = Date.now(),
    deadline = Number.POSITIVE_INFINITY,
    clock = Date.now,
    startFraction = Math.random(),
  }: {
    maxRemovals?: number;
    minAgeMs?: number;
    now?: number;
    /** Epoch ms after which no further folder is listed. */
    deadline?: number;
    clock?: () => number;
    /** Where in the folder list to start, in [0, 1). */
    startFraction?: number;
  } = {},
): Promise<UnreferencedSweepSummary> {
  const tables = Object.keys(POST_IMAGE_TABLES) as Array<keyof typeof POST_IMAGE_TABLES>;

  const folders: Array<{ bucket: UserImageBucket; folder: string }> = [];
  for (const bucket of USER_IMAGE_BUCKETS) {
    for (const folder of await listTopLevelUserFolders(client, bucket)) folders.push({ bucket, folder });
  }

  const objects = {} as Record<UserImageBucket, string[]>;
  const eligibleByBucket = {} as Record<UserImageBucket, string[]>;
  for (const bucket of USER_IMAGE_BUCKETS) {
    objects[bucket] = [];
    eligibleByBucket[bucket] = [];
  }

  const start = folders.length === 0 ? 0 : Math.floor(Math.min(Math.max(startFraction, 0), 0.999999) * folders.length);
  let scannedFolders = 0;
  let cutShort = false;
  for (let k = 0; k < folders.length; k++) {
    if (clock() >= deadline) {
      cutShort = true;
      break;
    }
    const { bucket, folder } = folders[(start + k) % folders.length];
    const entries = (await listStorageObjects(client, bucket, folder)).filter(
      (entry) => entry.path.split('/').pop() !== FOLDER_PLACEHOLDER,
    );
    scannedFolders++;
    for (const entry of entries) {
      objects[bucket].push(entry.path);
      // Unknown age → keep.
      const created = entry.createdAt ? Date.parse(entry.createdAt) : Number.NaN;
      if (Number.isFinite(created) && now - created >= minAgeMs) eligibleByBucket[bucket].push(entry.path);
    }
  }
  if (cutShort) {
    console.warn(
      `[post-images] sweep listing hit its time budget after ${scannedFolders}/${folders.length} folders; the rest are covered by later runs`,
    );
  }

  const referencedByBucket = {} as Record<UserImageBucket, Set<string>>;
  for (const bucket of USER_IMAGE_BUCKETS) referencedByBucket[bucket] = new Set();
  for (const table of tables) {
    const refs = await collectReferencedPaths(client, table);
    for (const path of refs) referencedByBucket[POST_IMAGE_TABLES[table]].add(path);
  }

  const buckets = {} as UnreferencedSweepSummary['buckets'];
  let budget = maxRemovals;
  let truncated = false;

  for (const bucket of USER_IMAGE_BUCKETS) {
    const referenced = referencedByBucket[bucket];
    const eligible = eligibleByBucket[bucket].filter((p) => !referenced.has(p));
    const toRemove = eligible.slice(0, Math.max(budget, 0));
    if (toRemove.length < eligible.length) truncated = true;

    let removed = 0;
    for (let i = 0; i < toRemove.length; i += REMOVE_BATCH_SIZE) {
      const batch = toRemove.slice(i, i + REMOVE_BATCH_SIZE);
      const { data, error } = await client.storage.from(bucket).remove(batch);
      if (error) {
        console.warn(
          `[post-images] sweep remove failed (bucket=${bucket}); retried next run: ${describeErrorSafely(error)}`,
        );
        break;
      }
      removed += data?.length ?? 0;
    }
    budget -= toRemove.length;

    buckets[bucket] = {
      scanned: objects[bucket].length,
      referenced: referenced.size,
      eligible: eligible.length,
      removed,
    };
  }

  return { buckets, truncated, folders: { total: folders.length, scanned: scannedFolders }, cutShort };
}
