import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabaseServer';
import { verifyCronSecret } from '@/lib/cronAuth';
import { describeErrorSafely, sweepOrphanedUserStorage, type OrphanSweepSummary } from '@/lib/account/deleteAccount';
import { sweepUnreferencedPostImages, type UnreferencedSweepSummary } from '@/lib/storage/postImages';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;
/**
 * Time the unreferenced-image sweep may spend listing storage folders (one
 * list call per user folder), counted from the start of the request. Leaves
 * the rest of maxDuration for reading references and deleting.
 */
const IMAGE_SWEEP_LISTING_BUDGET_MS = 18_000;

export async function GET(request: Request) {
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  try {
    const supabase = createServiceRoleClient();

    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let deletedSnapshots = 0;
    let deletedSubscriptions = 0;
    let deletedCacheEntries = 0;
    let orphanStorage: OrphanSweepSummary | null = null;
    let unreferencedImages: UnreferencedSweepSummary | null = null;

    const [snapshotResult, subscriptionResult, cacheResult, orphanResult] = await Promise.allSettled([
      (async () => {
        try {
          const { data, error } = await supabase
            .from('reservation_snapshots')
            .delete()
            .lt('snapshot_at', ninetyDaysAgo)
            .select('id');

          if (error) {
            console.error('Failed to delete reservation snapshots:', error);
            return 0;
          }

          return data?.length ?? 0;
        } catch (err) {
          console.error('Error deleting reservation snapshots:', err);
          return 0;
        }
      })(),
      (async () => {
        try {
          const { data, error } = await supabase
            .from('push_subscriptions')
            .delete()
            .lt('updated_at', ninetyDaysAgo)
            .select('id');

          if (error) {
            console.error('Failed to delete push subscriptions:', error);
            return 0;
          }

          return data?.length ?? 0;
        } catch (err) {
          console.error('Error deleting push subscriptions:', err);
          return 0;
        }
      })(),
      (async () => {
        try {
          const { data, error } = await supabase
            .from('court_status_cache')
            .delete()
            .lt('updated_at', sevenDaysAgo)
            .select('svc_id');

          if (error) {
            console.error('Failed to delete court status cache:', error);
            return 0;
          }

          return data?.length ?? 0;
        } catch (err) {
          console.error('Error deleting court status cache:', err);
          return 0;
        }
      })(),
      // Storage sweeps run one after the other (same buckets):
      //  1. folders of deleted accounts — uploads by a deleted account's
      //     still-valid access token after 회원 탈퇴 (lib/account/deleteAccount.ts);
      //  2. post images no review/record references any more and older than
      //     24h — leftovers of failed immediate deletes, posts deleted outside
      //     the API, uploads whose post was never saved (lib/storage/postImages.ts).
      (async () => {
        let orphans: OrphanSweepSummary | null = null;
        let unreferenced: UnreferencedSweepSummary | null = null;
        try {
          orphans = await sweepOrphanedUserStorage(supabase);
        } catch (err) {
          console.error(`Error sweeping orphaned user storage: ${describeErrorSafely(err)}`);
        }
        try {
          unreferenced = await sweepUnreferencedPostImages(supabase, {
            deadline: startedAt + IMAGE_SWEEP_LISTING_BUDGET_MS,
          });
        } catch (err) {
          console.error(`Error sweeping unreferenced post images: ${describeErrorSafely(err)}`);
        }
        return { orphans, unreferenced };
      })(),
    ]);

    if (snapshotResult.status === 'fulfilled') {
      deletedSnapshots = snapshotResult.value;
    }

    if (subscriptionResult.status === 'fulfilled') {
      deletedSubscriptions = subscriptionResult.value;
    }

    if (cacheResult.status === 'fulfilled') {
      deletedCacheEntries = cacheResult.value;
    }

    if (orphanResult.status === 'fulfilled') {
      orphanStorage = orphanResult.value.orphans;
      unreferencedImages = orphanResult.value.unreferenced;
    }

    return NextResponse.json({
      ok: true,
      deletedSnapshots,
      deletedSubscriptions,
      deletedCacheEntries,
      orphanStorage,
      unreferencedImages,
    });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
