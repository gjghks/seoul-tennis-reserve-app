import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabaseServer';
import { verifyCronSecret } from '@/lib/cronAuth';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  if (!verifyCronSecret(request.headers.get('authorization'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = createServiceRoleClient();

    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Seoul' });

    const { data, error } = await supabase
      .from('court_transfers')
      .update({ status: 'expired', updated_at: new Date().toISOString() })
      .eq('status', 'available')
      .lt('play_date', today)
      .select('id');

    if (error) {
      console.error('Failed to expire transfers:', error);
      return NextResponse.json({ error: 'Failed to expire transfers' }, { status: 500 });
    }

    const expiredCount = data?.length ?? 0;

    return NextResponse.json({ ok: true, expiredCount });
  } catch (error) {
    console.error('Expire transfers cron error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
