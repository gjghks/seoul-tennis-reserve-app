import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { VALID_MATCH_TYPES } from '@/lib/constants/tennis';
import { VALID_MATCH_SKILL_FILTERS } from '@/lib/constants/matching';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { id } = await context.params;

  if (!id) {
    return NextResponse.json(
      { error: '매칭 글 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  const { data: post, error } = await supabase
    .from('match_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json(
        { error: '매칭 글을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }
    console.error('Error fetching match post:', error);
    return NextResponse.json(
      { error: '매칭 글을 불러오는데 실패했습니다.' },
      { status: 500 }
    );
  }

  const { data: { user } } = await supabase.auth.getUser();
  let applications = null;
  let hasApplied = false;

  if (user) {
    if (user.id === post.author_id) {
      const { data: apps } = await supabase
        .from('match_applications')
        .select('*')
        .eq('post_id', id)
        .order('created_at', { ascending: true });
      applications = apps;
    } else {
      const { data: myApp } = await supabase
        .from('match_applications')
        .select('id')
        .eq('post_id', id)
        .eq('applicant_id', user.id)
        .maybeSingle();
      hasApplied = !!myApp;
    }
  }

  return NextResponse.json({
    post: {
      ...post,
      has_applied: hasApplied,
      applications,
    },
  });
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
      { error: '매칭 글 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json();
    const {
      play_date,
      play_time_start,
      play_time_end,
      location_type,
      court_id,
      court_name,
      district,
      match_type,
      ntrp_min,
      ntrp_max,
      skill_level,
      max_participants,
      cost_per_person,
      title,
      description,
      status,
    } = body;

    if (!play_date || !play_time_start || !court_name || !district || !match_type || !title) {
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

    if (typeof title !== 'string' || title.length < 2 || title.length > 100) {
      return NextResponse.json(
        { error: '제목은 2~100자 사이로 작성해주세요.' },
        { status: 400 }
      );
    }

    if (description && (typeof description !== 'string' || description.length > 500)) {
      return NextResponse.json(
        { error: '설명은 500자 이하로 작성해주세요.' },
        { status: 400 }
      );
    }

    if (skill_level && !VALID_MATCH_SKILL_FILTERS.includes(skill_level)) {
      return NextResponse.json(
        { error: '올바르지 않은 실력 수준입니다.' },
        { status: 400 }
      );
    }

    const participants = Number(max_participants) || 1;
    if (participants < 1 || participants > 3) {
      return NextResponse.json(
        { error: '모집 인원은 1~3명 사이여야 합니다.' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {
      play_date,
      play_time_start,
      play_time_end: play_time_end ?? null,
      location_type: location_type || 'seoul_court',
      court_id: court_id ?? null,
      court_name,
      district,
      match_type,
      ntrp_min: ntrp_min ?? null,
      ntrp_max: ntrp_max ?? null,
      skill_level: skill_level ?? null,
      max_participants: participants,
      cost_per_person: cost_per_person ?? null,
      title,
      description: description ?? null,
      updated_at: new Date().toISOString(),
    };

    if (status && ['open', 'closed', 'completed', 'cancelled'].includes(status)) {
      updateData.status = status;
    }

    const { data, error } = await supabase
      .from('match_posts')
      .update(updateData)
      .eq('id', id)
      .eq('author_id', user.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '매칭 글을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('Error updating match post:', error);
      return NextResponse.json(
        { error: '매칭 글 수정에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: data });
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
      { error: '매칭 글 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from('match_posts')
    .delete()
    .eq('id', id)
    .eq('author_id', user.id);

  if (error) {
    console.error('Error deleting match post:', error);
    return NextResponse.json(
      { error: '매칭 글 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
