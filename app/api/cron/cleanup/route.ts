import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();

    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    let deletedSnapshots = 0;
    let deletedSubscriptions = 0;
    let deletedCacheEntries = 0;

    const [snapshotResult, subscriptionResult, cacheResult] = await Promise.allSettled([
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

    return NextResponse.json({
      ok: true,
      deletedSnapshots,
      deletedSubscriptions,
      deletedCacheEntries,
    });
  } catch (error) {
    console.error('Cleanup cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
