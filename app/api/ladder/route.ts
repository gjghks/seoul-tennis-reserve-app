import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { LEADERBOARD_PAGE_SIZE } from '@/lib/constants/ladder';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const { searchParams } = new URL(request.url);
  const matchType = searchParams.get('match_type') || 'singles';
  const district = searchParams.get('district') || null;
  const limitParam = searchParams.get('limit');
  const offsetParam = searchParams.get('offset');

  if (matchType !== 'singles' && matchType !== 'doubles') {
    return NextResponse.json(
      { error: '유효하지 않은 경기 방식입니다.' },
      { status: 400 }
    );
  }

  const limit = Math.min(Math.max(1, Number(limitParam) || LEADERBOARD_PAGE_SIZE), 100);
  const offset = Math.max(0, Number(offsetParam) || 0);

  const { data, error } = await supabase.rpc('get_leaderboard', {
    p_match_type: matchType,
    p_district: district,
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: '리더보드를 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json(data);
}
