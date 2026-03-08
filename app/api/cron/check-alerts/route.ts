import { NextResponse } from 'next/server';
import { fetchTennisAvailability } from '@/lib/seoulApi';
import { createServiceRoleClient } from '@/lib/supabaseServer';
import { isCourtAvailable } from '@/lib/utils/courtStatus';
import { KOREAN_TO_SLUG, SLUG_TO_KOREAN } from '@/lib/constants/districts';
import { getWebPush } from '@/lib/webPush';
import { verifyCronSecret } from '@/lib/cronAuth';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

type CachedStatusRow = {
  svc_id: string;
  status: string;
};

type AlertSettingRow = {
  user_id: string;
  target_id: string;
};

type PushSubscriptionRow = {
  user_id: string;
  endpoint: string;
  keys_p256dh: string;
  keys_auth: string;
};

type NotificationPayload = {
  title: string;
  body: string;
  url: string;
  svcUrl?: string;
};

type QueuedNotification = {
  userId: string;
  payload: NotificationPayload;
};

function getStatusCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') {
    return null;
  }

  const maybeStatusCode = (error as { statusCode?: unknown }).statusCode;
  return typeof maybeStatusCode === 'number' ? maybeStatusCode : null;
}

export async function GET(request: Request) {
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const services = await fetchTennisAvailability();
    if (services.length === 0) {
      return NextResponse.json({ error: 'No data from Seoul API' }, { status: 502 });
    }

    const supabase = createServiceRoleClient();

    const { data: cacheRows, error: cacheError } = await supabase
      .from('court_status_cache')
      .select('svc_id, status');

    if (cacheError) {
      console.error('Failed to load court status cache:', cacheError);
      return NextResponse.json({ error: 'DB read failed' }, { status: 500 });
    }

    const previousStatusMap = new Map<string, string>();
    for (const row of (cacheRows ?? []) as CachedStatusRow[]) {
      previousStatusMap.set(row.svc_id, row.status);
    }

    const newlyAvailableCourts = services.filter((court) => {
      const previousStatus = previousStatusMap.get(court.SVCID);
      if (previousStatus === undefined) {
        return false;
      }

      return !isCourtAvailable(previousStatus) && isCourtAvailable(court.SVCSTATNM);
    });

    const availableCourtIds = newlyAvailableCourts.map((court) => court.SVCID);
    const availableDistricts = new Set(newlyAvailableCourts.map((court) => court.AREANM));
    const availableDistrictSlugs = Array.from(availableDistricts)
      .map((district) => KOREAN_TO_SLUG[district])
      .filter((slug): slug is string => typeof slug === 'string' && slug.length > 0);

    const [favoriteAlertResult, districtAlertResult] = await Promise.all([
      availableCourtIds.length > 0
        ? supabase
            .from('alert_settings')
            .select('user_id, target_id')
            .eq('alert_type', 'favorite_available')
            .eq('enabled', true)
            .in('target_id', availableCourtIds)
        : Promise.resolve({ data: [], error: null }),
      availableDistrictSlugs.length > 0
        ? supabase
            .from('alert_settings')
            .select('user_id, target_id')
            .eq('alert_type', 'district_available')
            .eq('enabled', true)
            .in('target_id', availableDistrictSlugs)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (favoriteAlertResult.error) {
      console.error('Failed to load favorite alerts:', favoriteAlertResult.error);
      return NextResponse.json({ error: 'DB read failed' }, { status: 500 });
    }

    if (districtAlertResult.error) {
      console.error('Failed to load district alerts:', districtAlertResult.error);
      return NextResponse.json({ error: 'DB read failed' }, { status: 500 });
    }

    const favoriteAlerts = (favoriteAlertResult.data ?? []) as AlertSettingRow[];
    const districtAlerts = (districtAlertResult.data ?? []) as AlertSettingRow[];

    const notifications: QueuedNotification[] = [];
    const courtsById = new Map(newlyAvailableCourts.map((court) => [court.SVCID, court]));

    for (const alert of favoriteAlerts) {
      const court = courtsById.get(alert.target_id);
      if (!court) {
        continue;
      }

      const districtSlug = KOREAN_TO_SLUG[court.AREANM];
      const url = districtSlug ? `/${districtSlug}/${court.SVCID}` : `/${court.SVCID}`;

      notifications.push({
        userId: alert.user_id,
        payload: {
          title: '🎾 접수 시작!',
          body: `${court.SVCNM} 예약 접수가 시작되었습니다`,
          url,
          svcUrl: court.SVCURL || undefined,
        },
      });
    }

    for (const alert of districtAlerts) {
      const districtSlug = alert.target_id;
      const districtName = SLUG_TO_KOREAN[districtSlug];
      if (!districtName) {
        continue;
      }

      notifications.push({
        userId: alert.user_id,
        payload: {
          title: '📢 코트 오픈',
          body: `${districtName}에 예약 가능한 코트가 생겼습니다`,
          url: `/${districtSlug}`,
        },
      });
    }

    const notificationUsers = Array.from(new Set(notifications.map((item) => item.userId)));

    let subscriptions: PushSubscriptionRow[] = [];
    if (notificationUsers.length > 0) {
      const { data: subscriptionRows, error: subscriptionsError } = await supabase
        .from('push_subscriptions')
        .select('user_id, endpoint, keys_p256dh, keys_auth')
        .in('user_id', notificationUsers);

      if (subscriptionsError) {
        console.error('Failed to load push subscriptions:', subscriptionsError);
        return NextResponse.json({ error: 'DB read failed' }, { status: 500 });
      }

      subscriptions = (subscriptionRows ?? []) as PushSubscriptionRow[];
    }

    const subscriptionsByUser = new Map<string, PushSubscriptionRow[]>();
    for (const subscription of subscriptions) {
      const existing = subscriptionsByUser.get(subscription.user_id) ?? [];
      existing.push(subscription);
      subscriptionsByUser.set(subscription.user_id, existing);
    }

    const expiredEndpoints = new Set<string>();
    let sentCount = 0;

    for (const notification of notifications) {
      const userSubscriptions = subscriptionsByUser.get(notification.userId) ?? [];
      const payload = JSON.stringify(notification.payload);

      const sendResults = await Promise.allSettled(
        userSubscriptions.map((subscription) =>
          getWebPush().sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.keys_p256dh,
                auth: subscription.keys_auth,
              },
            },
            payload
          )
        )
      );

      for (let i = 0; i < sendResults.length; i++) {
        const result = sendResults[i];
        if (result.status === 'fulfilled') {
          sentCount++;
          continue;
        }

        const statusCode = getStatusCode(result.reason);
        if (statusCode === 410) {
          const endpoint = userSubscriptions[i]?.endpoint;
          if (endpoint) {
            expiredEndpoints.add(endpoint);
          }
        } else {
          console.error('Failed to send push notification:', result.reason);
        }
      }
    }

    if (expiredEndpoints.size > 0) {
      const { error: deleteExpiredError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', Array.from(expiredEndpoints));

      if (deleteExpiredError) {
        console.error('Failed to delete expired push subscriptions:', deleteExpiredError);
      }
    }

    const nowIso = new Date().toISOString();
    const cacheUpsertRows = services.filter((court) => !court.SVCID.startsWith('INDEP_')).map((court) => ({
      svc_id: court.SVCID,
      status: court.SVCSTATNM,
      svc_name: court.SVCNM,
      district: court.AREANM,
      updated_at: nowIso,
    }));

    const { error: upsertCacheError } = await supabase
      .from('court_status_cache')
      .upsert(cacheUpsertRows, { onConflict: 'svc_id' });

    if (upsertCacheError) {
      console.error('Failed to update court status cache:', upsertCacheError);
      return NextResponse.json({ error: 'DB write failed' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      totalCourts: services.length,
      newlyAvailableCourts: newlyAvailableCourts.length,
      notificationsQueued: notifications.length,
      notificationsSent: sentCount,
      expiredSubscriptionsRemoved: expiredEndpoints.size,
      updatedAt: nowIso,
    });
  } catch (error) {
    console.error('Check alerts cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
