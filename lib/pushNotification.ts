import { createServiceRoleClient } from '@/lib/supabaseServer';
import { getWebPush } from '@/lib/webPush';

type NotificationPayload = {
  title: string;
  body: string;
  url: string;
};

function getStatusCode(error: unknown): number | null {
  if (!error || typeof error !== 'object') {
    return null;
  }
  const maybeStatusCode = (error as { statusCode?: unknown }).statusCode;
  return typeof maybeStatusCode === 'number' ? maybeStatusCode : null;
}

/**
 * Send a push notification to a specific user.
 * Uses service role client to bypass RLS on push_subscriptions.
 * Fire-and-forget: logs errors but never throws.
 */
export async function sendPushToUser(
  userId: string,
  payload: NotificationPayload
): Promise<void> {
  try {
    const supabase = createServiceRoleClient();

    const { data: subscriptions, error: dbError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .eq('user_id', userId);

    if (dbError) {
      console.error('[Push] Failed to load subscriptions:', dbError);
      return;
    }

    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    const webPush = getWebPush();
    const payloadString = JSON.stringify(payload);

    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        webPush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys_p256dh,
              auth: sub.keys_auth,
            },
          },
          payloadString
        )
      )
    );

    const expiredEndpoints: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      if (result.status === 'rejected') {
        const statusCode = getStatusCode(result.reason);
        if (statusCode === 410) {
          const endpoint = subscriptions[i]?.endpoint;
          if (endpoint) {
            expiredEndpoints.push(endpoint);
          }
        } else {
          console.error('[Push] Send failed:', result.reason);
        }
      }
    }

    if (expiredEndpoints.length > 0) {
      await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints)
        .then(({ error }) => {
          if (error) {
            console.error('[Push] Failed to cleanup expired subscriptions:', error);
          }
        });
    }
  } catch (error) {
    console.error('[Push] Unexpected error:', error);
  }
}
