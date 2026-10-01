/**
 * Admin: manually delete (회원 탈퇴) one user.
 *
 * Run with (from anywhere; .env.local of this repo is loaded). `tsx` is not a
 * dependency of this repo, so `npx` downloads it on first use (same as the
 * other scripts/*.ts):
 *   npx tsx scripts/delete-user.ts --email <email>                          # dry run (default)
 *   npx tsx scripts/delete-user.ts --email <email> --user-id <id-prefix> --execute
 *   npx tsx scripts/delete-user.ts --user-id <full uuid> [--execute]        # account without an email
 *
 * Matching:
 *   - By default an email matches ONLY auth.users.email (the account's primary
 *     address). identity_data.email comes from the provider and may be
 *     unverified, so identity-only matches are refused unless
 *     --allow-identity-match is given.
 *   - --user-id <uuid> alone looks the user up by id (e.g. Kakao accounts with
 *     no email). Together with --email, it is a cross-check: the run aborts
 *     unless the matched id starts with it (copy the 8-char prefix the dry run
 *     printed). --execute with --email REQUIRES this cross-check.
 *   - Process: delete only when the request came from the account's own
 *     address (or the requester otherwise proved ownership).
 *
 * Needs NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. Uses the SAME
 * deleteUserAccount() as DELETE /api/account (lib/account/deleteAccount.ts),
 * which requires migration 20261001000001_delete_user_account.sql to be applied.
 *
 * Output is limited to counts and a masked email — no other personal data.
 */

import { existsSync } from 'node:fs';
import path from 'node:path';
import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';
import {
  USER_IMAGE_BUCKETS,
  deleteUserAccount,
  describeErrorSafely,
  listUserStorageObjects,
} from '../lib/account/deleteAccount';

const LIST_USERS_PAGE_SIZE = 1000;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ID_PREFIX_RE = /^[0-9a-f]{8}[0-9a-f-]*$/i;

/** [table, user column, effect] — mirrors public.delete_user_account(). */
const USER_ROW_TARGETS: Array<[table: string, column: string, effect: 'delete' | 'detach']> = [
  ['match_posts', 'author_id', 'delete'],
  ['match_applications', 'applicant_id', 'delete'],
  ['court_transfers', 'seller_id', 'delete'],
  ['transfer_interests', 'buyer_id', 'delete'],
  ['court_transfers', 'buyer_id', 'detach'],
  ['tournaments', 'creator_id', 'delete'],
  ['tournament_participants', 'user_id', 'detach'],
  ['elo_history', 'user_id', 'delete'],
  ['game_records', 'user_id', 'delete'],
  ['reviews', 'user_id', 'delete'],
  ['player_profiles', 'user_id', 'delete'],
  ['push_subscriptions', 'user_id', 'delete'],
  ['alert_settings', 'user_id', 'delete'],
  ['alerts', 'user_id', 'delete'], // legacy, prod-only
  ['favorites', 'user_id', 'delete'],
  ['users', 'id', 'delete'],
];

interface Args {
  email?: string;
  userId?: string;
  allowIdentityMatch: boolean;
  execute: boolean;
}

type MatchSource = { kind: 'primary' } | { kind: 'identity'; providers: string[] } | { kind: 'id' };

interface Match {
  user: User;
  source: MatchSource;
}

function usage(message?: string): never {
  if (message) console.error(`Error: ${message}\n`);
  console.error(
    'Usage: npx tsx scripts/delete-user.ts (--email <email> [--user-id <id-prefix>] | --user-id <uuid>)\n' +
      '                                     [--allow-identity-match] [--execute]',
  );
  process.exit(1);
}

function parseArgs(argv: string[]): Args {
  const args: Args = { allowIdentityMatch: false, execute: false };

  const valueOf = (i: number, flag: string) => {
    const v = argv[i + 1];
    if (!v || v.startsWith('--')) usage(`${flag} needs a value`);
    return v;
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--execute') args.execute = true;
    else if (arg === '--allow-identity-match') args.allowIdentityMatch = true;
    else if (arg === '--email') args.email = valueOf(i++, arg);
    else if (arg.startsWith('--email=')) args.email = arg.slice('--email='.length);
    else if (arg === '--user-id') args.userId = valueOf(i++, arg);
    else if (arg.startsWith('--user-id=')) args.userId = arg.slice('--user-id='.length);
    else if (arg === '--help' || arg === '-h') usage();
    else usage(`unknown argument "${arg}"`);
  }

  args.email = args.email?.trim();
  args.userId = args.userId?.trim().toLowerCase();

  if (!args.email && !args.userId) usage('--email or --user-id is required');
  if (args.email !== undefined && !args.email.includes('@')) usage('--email must be an email address');
  if (args.userId !== undefined) {
    if (!args.email && !UUID_RE.test(args.userId)) usage('--user-id alone must be a full uuid');
    if (args.email && !ID_PREFIX_RE.test(args.userId)) usage('--user-id must be a uuid or its first 8+ hex chars');
  }
  if (args.execute && args.email && !args.userId) {
    usage('--execute with --email requires --user-id <id-prefix> from the dry run (cross-check)');
  }
  return args;
}

function loadEnv(repoRoot: string) {
  // process.loadEnvFile (Node >= 20.12) never overrides variables already set,
  // so load the most specific file first (same precedence as Next.js).
  for (const file of ['.env.local', '.env']) {
    const full = path.join(repoRoot, file);
    if (existsSync(full)) process.loadEnvFile(full);
  }
}

function maskEmail(email: string): string {
  const [local, domain = ''] = email.split('@');
  const visible = local.length <= 2 ? local.slice(0, 1) : local.slice(0, 2);
  return `${visible}***@${domain}`;
}

function describeSource(source: MatchSource): string {
  if (source.kind === 'primary') return 'primary email (auth.users.email)';
  if (source.kind === 'identity') return `identity email only (provider: ${source.providers.join(', ')}) — UNVERIFIED`;
  return 'user id';
}

async function findUsersByEmail(client: SupabaseClient, email: string): Promise<Match[]> {
  const target = email.toLowerCase();
  const matches: Match[] = [];

  for (let page = 1; ; page += 1) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: LIST_USERS_PAGE_SIZE });
    if (error) throw error;
    for (const user of data.users) {
      if (user.email?.toLowerCase() === target) {
        matches.push({ user, source: { kind: 'primary' } });
        continue;
      }
      const providers = (user.identities ?? [])
        .filter((i) => typeof i.identity_data?.email === 'string' && i.identity_data.email.toLowerCase() === target)
        .map((i) => i.provider);
      if (providers.length > 0) matches.push({ user, source: { kind: 'identity', providers: [...new Set(providers)] } });
    }
    if (data.users.length < LIST_USERS_PAGE_SIZE) break;
  }

  return matches;
}

async function resolveUser(client: SupabaseClient, args: Args, masked: string): Promise<Match> {
  const abort = (message: string): never => {
    console.error(`Abort: ${message}`);
    process.exit(2);
  };

  let match: Match;
  if (args.email) {
    const all = await findUsersByEmail(client, args.email);
    const primary = all.filter((m) => m.source.kind === 'primary');
    const identityOnly = all.filter((m) => m.source.kind === 'identity');
    const candidates = args.allowIdentityMatch ? all : primary;

    if (candidates.length === 0) {
      if (identityOnly.length > 0) {
        abort(
          `no account has ${masked} as its primary email; ${identityOnly.length} account(s) carry it only as a ` +
            'provider identity email (may be unverified). Confirm ownership, then re-run with --allow-identity-match.',
        );
      }
      abort(`no auth user matches ${masked}. If the account has no email, use --user-id <uuid>.`);
    }
    if (candidates.length > 1) abort(`${candidates.length} auth users match ${masked}; resolve manually.`);
    match = candidates[0];
  } else {
    const { data, error } = await client.auth.admin.getUserById(args.userId!);
    if (error || !data?.user) abort(`no auth user with that id (${describeErrorSafely(error)}).`);
    match = { user: data.user!, source: { kind: 'id' } };
  }

  if (args.userId && !match.user.id.toLowerCase().startsWith(args.userId)) {
    abort(`matched id ${match.user.id.slice(0, 8)}… does not match --user-id ${args.userId.slice(0, 8)}…`);
  }
  return match;
}

async function countRows(client: SupabaseClient, table: string, column: string, userId: string): Promise<number | null> {
  const { count, error } = await client.from(table).select('*', { count: 'exact', head: true }).eq(column, userId);
  if (error) return null; // e.g. legacy table absent in this environment
  return count ?? 0;
}

async function idsOf(client: SupabaseClient, table: string, column: string, userId: string): Promise<string[] | null> {
  const { data, error } = await client.from(table).select('id').eq(column, userId);
  if (error) return null;
  return ((data ?? []) as Array<{ id: string }>).map((r) => r.id);
}

/** Count rows of `table` whose `fkColumn` is in `parentIds` (optionally excluding the target's own rows). */
async function countChildren(
  client: SupabaseClient,
  table: string,
  fkColumn: string,
  parentIds: string[] | null,
  exclude?: [column: string, userId: string],
): Promise<number | null> {
  if (parentIds === null) return null;
  if (parentIds.length === 0) return 0;
  let query = client.from(table).select('*', { count: 'exact', head: true }).in(fkColumn, parentIds);
  if (exclude) query = query.neq(exclude[0], exclude[1]);
  const { count, error } = await query;
  if (error) return null;
  return count ?? 0;
}

const fmt = (n: number | null) => (n === null ? 'n/a' : String(n));

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const repoRoot = typeof __dirname !== 'undefined' ? path.resolve(__dirname, '..') : process.cwd();
  loadEnv(repoRoot);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    usage('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (.env.local)');
  }

  // Not lib/supabaseServer.ts: that module imports next/headers.
  const client = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const masked = args.email ? maskEmail(args.email) : `id ${args.userId!.slice(0, 8)}…`;
  console.log(`Target: ${masked}  (mode: ${args.execute ? 'EXECUTE' : 'dry run'})`);

  const { user, source } = await resolveUser(client, args, masked);
  const providers = [...new Set((user.identities ?? []).map((i) => i.provider))].join(', ') || '-';
  console.log(
    `Matched 1 user: id ${user.id.slice(0, 8)}…, matched via: ${describeSource(source)}, ` +
      `providers: ${providers}, created ${user.created_at?.slice(0, 10) ?? '-'}`,
  );

  console.log("\nThis user's rows (delete = removed, detach = reference set to NULL on another user's row):");
  for (const [table, column, effect] of USER_ROW_TARGETS) {
    const n = await countRows(client, table, column, user.id);
    console.log(`  ${`${table}.${column}`.padEnd(40)} ${effect.padEnd(7)} ${fmt(n)}`);
  }
  const alertIds = await idsOf(client, 'alerts', 'user_id', user.id);
  console.log(`  ${'notification_logs (via alerts)'.padEnd(40)} ${'delete'.padEnd(7)} ${fmt(await countChildren(client, 'notification_logs', 'alert_id', alertIds))}`);

  // Rows OTHER users will lose because they hang off this user's content (FK CASCADE).
  const [postIds, transferIds, tournamentIds] = await Promise.all([
    idsOf(client, 'match_posts', 'author_id', user.id),
    idsOf(client, 'court_transfers', 'seller_id', user.id),
    idsOf(client, 'tournaments', 'creator_id', user.id),
  ]);
  const reservedForTarget = await (async () => {
    const { count, error } = await client
      .from('court_transfers')
      .select('*', { count: 'exact', head: true })
      .eq('buyer_id', user.id)
      .eq('status', 'reserved');
    return error ? null : (count ?? 0);
  })();

  console.log("\nImpact on OTHER users' data (removed with this user's content):");
  const impact: Array<[label: string, n: number | null]> = [
    ["match_applications on this user's posts", await countChildren(client, 'match_applications', 'post_id', postIds, ['applicant_id', user.id])],
    ["transfer_interests on this user's listings", await countChildren(client, 'transfer_interests', 'transfer_id', transferIds, ['buyer_id', user.id])],
    ["tournament_participants in this user's tournaments", await countChildren(client, 'tournament_participants', 'tournament_id', tournamentIds)],
    ["tournament_matches in this user's tournaments", await countChildren(client, 'tournament_matches', 'tournament_id', tournamentIds)],
  ];
  for (const [label, n] of impact) console.log(`  ${label.padEnd(52)} ${fmt(n)}`);
  console.log(`  ${"listings reserved for this user -> 'available'".padEnd(52)} ${fmt(reservedForTarget)}`);

  console.log('\nStorage objects under <user id>/:');
  for (const bucket of USER_IMAGE_BUCKETS) {
    const paths = await listUserStorageObjects(client, bucket, user.id);
    console.log(`  ${bucket.padEnd(40)} ${paths.length}`);
  }

  if (!args.execute) {
    const next = args.email
      ? `--email <same> --user-id ${user.id.slice(0, 8)}${source.kind === 'identity' ? ' --allow-identity-match' : ''} --execute`
      : '--user-id <same> --execute';
    console.log(`\nDry run only. To permanently delete this account re-run with: ${next}`);
    return;
  }

  console.log('\nDeleting…');
  const summary = await deleteUserAccount(client, user.id);
  console.log('Done.');
  console.log(`  storage removed: ${JSON.stringify(summary.storage)}`);
  console.log(`  database:        ${JSON.stringify(summary.database)}`);
  console.log(`  auth user:       ${summary.authUserDeleted ? 'deleted' : 'already absent'}`);
}

main().catch((error) => {
  console.error(`Failed: ${describeErrorSafely(error)}`);
  process.exit(1);
});
