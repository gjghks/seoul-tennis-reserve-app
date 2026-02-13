import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { getWebPush } from '@/lib/webPush';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, keys_p256dh, keys_auth')
      .eq('user_id', user.id);

    if (error) {
      console.error('[Push Test] DB read failed:', error);
      return NextResponse.json({ error: 'DB read failed', detail: error.message }, { status: 500 });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ error: 'No push subscriptions found' }, { status: 404 });
    }

    let webPush: ReturnType<typeof getWebPush>;
    try {
      webPush = getWebPush();
    } catch (vapidError: unknown) {
      console.error('[Push Test] VAPID init failed:', vapidError);
      return NextResponse.json(
        { error: 'VAPID configuration error', detail: String(vapidError) },
        { status: 500 }
      );
    }

    const payload = JSON.stringify({
      title: '🎾 테스트 알림',
      body: '푸시 알림이 정상적으로 동작합니다!',
      url: '/my',
    });

    let sentCount = 0;
    const errors: string[] = [];

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
          payload
        )
      )
    );

    for (const result of results) {
      if (result.status === 'fulfilled') {
        sentCount++;
      } else {
        console.error('[Push Test] Send failed:', result.reason);
        errors.push(String(result.reason));
      }
    }

    return NextResponse.json({
      sent: sentCount,
      total: subscriptions.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (err) {
    console.error('[Push Test] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error', detail: String(err) },
      { status: 500 }
    );
  }
}
