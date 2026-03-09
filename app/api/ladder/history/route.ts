import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');
  const matchType = searchParams.get('match_type') || 'singles';
  const limitParam = searchParams.get('limit');

  if (!userId) {
    return NextResponse.json(
      { error: 'user_id가 필요합니다.' },
      { status: 400 }
    );
  }

  if (matchType !== 'singles' && matchType !== 'doubles') {
    return NextResponse.json(
      { error: '유효하지 않은 경기 방식입니다.' },
      { status: 400 }
    );
  }

  const limit = Math.min(Math.max(1, Number(limitParam) || 30), 100);

  const { data, error } = await supabase
    .from('elo_history')
    .select('*')
    .eq('user_id', userId)
    .eq('match_type', matchType)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching ELO history:', error);
    return NextResponse.json(
      { error: 'ELO 이력을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ history: data });
}
