import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 10 });

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
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

  const { id: postId } = await context.params;
  if (!postId) {
    return NextResponse.json(
      { error: '매칭 글 ID가 필요합니다.' },
      { status: 400 }
    );
  }

  const { data: post } = await supabase
    .from('match_posts')
    .select('author_id, status, accepted_count, max_participants')
    .eq('id', postId)
    .single();

  if (!post) {
    return NextResponse.json(
      { error: '매칭 글을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  if (post.author_id === user.id) {
    return NextResponse.json(
      { error: '본인이 작성한 매칭 글에는 신청할 수 없습니다.' },
      { status: 400 }
    );
  }

  if (post.status !== 'open') {
    return NextResponse.json(
      { error: '모집이 마감된 매칭 글입니다.' },
      { status: 400 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const message = body.message || null;

    if (message && (typeof message !== 'string' || message.length > 200)) {
      return NextResponse.json(
        { error: '메시지는 200자 이하로 작성해주세요.' },
        { status: 400 }
      );
    }

    const { data: userData } = await supabase
      .from('users')
      .select('full_name, nickname')
      .eq('id', user.id)
      .single();

    const applicantName = userData?.nickname || userData?.full_name || user.email?.split('@')[0] || '익명';

    const { data, error } = await supabase
      .from('match_applications')
      .insert([{
        post_id: postId,
        applicant_id: user.id,
        applicant_name: applicantName,
        message,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 신청한 매칭 글입니다.' },
          { status: 409 }
        );
      }
      console.error('Error applying to match:', error);
      return NextResponse.json(
        { error: '매칭 신청에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ application: data }, { status: 201 });
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

  const { id: postId } = await context.params;

  const { data: app } = await supabase
    .from('match_applications')
    .select('id, status')
    .eq('post_id', postId)
    .eq('applicant_id', user.id)
    .single();

  if (!app) {
    return NextResponse.json(
      { error: '신청 내역을 찾을 수 없습니다.' },
      { status: 404 }
    );
  }

  const wasAccepted = app.status === 'accepted';

  const { error } = await supabase
    .from('match_applications')
    .delete()
    .eq('id', app.id);

  if (error) {
    console.error('Error withdrawing application:', error);
    return NextResponse.json(
      { error: '신청 취소에 실패했습니다.' },
      { status: 500 }
    );
  }

  if (wasAccepted) {
    await supabase.rpc('update_match_accepted_count', { post_uuid: postId });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest, context: RouteContext) {
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

  const { id: postId } = await context.params;

  const { data: post } = await supabase
    .from('match_posts')
    .select('author_id')
    .eq('id', postId)
    .single();

  if (!post || post.author_id !== user.id) {
    return NextResponse.json(
      { error: '권한이 없습니다.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { application_id, status } = body;

    if (!application_id || !status) {
      return NextResponse.json(
        { error: '신청 ID와 상태가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '올바르지 않은 상태입니다.' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('match_applications')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', application_id)
      .eq('post_id', postId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: '신청 내역을 찾을 수 없습니다.' },
          { status: 404 }
        );
      }
      console.error('Error updating application:', error);
      return NextResponse.json(
        { error: '신청 상태 변경에 실패했습니다.' },
        { status: 500 }
      );
    }

    await supabase.rpc('update_match_accepted_count', { post_uuid: postId });

    return NextResponse.json({ application: data });
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다.' },
      { status: 400 }
    );
  }
}
