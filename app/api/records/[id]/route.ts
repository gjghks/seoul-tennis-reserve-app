import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import type { MatchType, MatchResult } from '@/lib/constants/tennis';
import { validateScore } from '@/lib/utils/tennis';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

const VALID_MATCH_TYPES: MatchType[] = ['singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles'];
const VALID_MATCH_FORMATS = ['4game_nodeuce', '6game_1set', '3set_match', '8game_proset', 'tiebreak', 'custom'];
const VALID_RESULTS: MatchResult[] = ['win', 'loss', 'draw', 'retired'];
const VALID_LOCATION_TYPES = ['seoul_court', 'custom'];
const VALID_SURFACES = ['hard', 'clay', 'artificial_grass', 'grass', 'indoor', 'other'];

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: Request, context: RouteContext) {
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: '기록 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from('game_records')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '기록을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    console.error('Error fetching record:', error);
    return NextResponse.json(
      { error: '기록을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ record: data });
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: '기록 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      played_at,
      duration_minutes,
      location_type,
      court_id,
      court_name,
      district,
      match_type,
      match_format,
      score,
      result,
      court_surface,
      opponent_name,
      opponent_level,
      cost,
      notes,
      images,
    } = body;

    if (!played_at || !court_name || !match_type || !match_format || !score || !result) {
      return NextResponse.json(
        { error: '필수 정보가 누락되었습니다.' },
        { status: 400 }
      );
    }

    if (!VALID_MATCH_TYPES.includes(match_type)) {
      return NextResponse.json(
        { error: '올바르지 않은 경기 유형입니다.' },
        { status: 400 }
      );
    }

    if (!VALID_MATCH_FORMATS.includes(match_format)) {
      return NextResponse.json(
        { error: '올바르지 않은 경기 형식입니다.' },
        { status: 400 }
      );
    }

    if (!VALID_RESULTS.includes(result)) {
      return NextResponse.json(
        { error: '올바르지 않은 경기 결과입니다.' },
        { status: 400 }
      );
    }

    if (location_type && !VALID_LOCATION_TYPES.includes(location_type)) {
      return NextResponse.json(
        { error: '올바르지 않은 장소 유형입니다.' },
        { status: 400 }
      );
    }

    if (court_surface && !VALID_SURFACES.includes(court_surface)) {
      return NextResponse.json(
        { error: '올바르지 않은 코트 표면 유형입니다.' },
        { status: 400 }
      );
    }

    const scoreValidation = validateScore(score);
    if (!scoreValidation.valid) {
      return NextResponse.json(
        { error: scoreValidation.error },
        { status: 400 }
      );
    }

    if (duration_minutes !== null && duration_minutes !== undefined) {
      if (!Number.isInteger(duration_minutes) || duration_minutes < 0 || duration_minutes > 600) {
        return NextResponse.json(
          { error: '경기 시간은 0~600분 사이여야 합니다.' },
          { status: 400 }
        );
      }
    }

    if (cost !== null && cost !== undefined) {
      if (typeof cost !== 'number' || cost < 0) {
        return NextResponse.json(
          { error: '비용은 0 이상이어야 합니다.' },
          { status: 400 }
        );
      }
    }

    if (notes && typeof notes === 'string' && notes.length > 1000) {
      return NextResponse.json(
        { error: '메모는 1000자 이하로 작성해주세요.' },
        { status: 400 }
      );
    }

    const imageUrls = Array.isArray(images) ? images.slice(0, 5) : [];

    const { data, error } = await supabase
      .from('game_records')
      .update({
        played_at,
        duration_minutes: duration_minutes ?? null,
        location_type: location_type || 'custom',
        court_id: court_id ?? null,
        court_name,
        district: district ?? null,
        match_type,
        match_format,
        score,
        result,
        court_surface: court_surface ?? null,
        opponent_name: opponent_name ?? null,
        opponent_level: opponent_level ?? null,
        cost: cost ?? null,
        notes: notes ?? null,
        images: imageUrls,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '기록을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('Error updating record:', error);
      return NextResponse.json(
        { error: '기록 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ record: data });
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)),
        },
      }
    );
  }

  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { error: '로그인이 필요합니다.' },
      { status: 401 }
    );
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json(
      { error: '기록 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('game_records')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting record:', error);
    return NextResponse.json(
      { error: '기록 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
