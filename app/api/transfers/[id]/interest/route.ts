import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';

const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 15 });

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, context: RouteContext) {
  const { id: transferId } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ myInterest: null, interests: [], isSeller: false });
  }

  const { data: transfer } = await supabase
    .from('court_transfers')
    .select('seller_id')
    .eq('id', transferId)
    .single();

  if (!transfer) {
    return NextResponse.json({ error: '양도글을 찾을 수 없습니다.' }, { status: 404 });
  }

  const isSeller = transfer.seller_id === user.id;

  if (isSeller) {
    const { data: interests } = await supabase
      .from('transfer_interests')
      .select('*')
      .eq('transfer_id', transferId)
      .order('created_at', { ascending: false });

    return NextResponse.json({
      myInterest: null,
      interests: interests || [],
      isSeller: true,
    });
  }

  const { data: myInterest } = await supabase
    .from('transfer_interests')
    .select('*')
    .eq('transfer_id', transferId)
    .eq('buyer_id', user.id)
    .maybeSingle();

  return NextResponse.json({
    myInterest: myInterest || null,
    interests: [],
    isSeller: false,
  });
}

export async function POST(request: NextRequest, context: RouteContext) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) } }
    );
  }

  const { id: transferId } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: transfer } = await supabase
    .from('court_transfers')
    .select('seller_id, status')
    .eq('id', transferId)
    .single();

  if (!transfer) {
    return NextResponse.json({ error: '양도글을 찾을 수 없습니다.' }, { status: 404 });
  }

  if (transfer.seller_id === user.id) {
    return NextResponse.json({ error: '본인의 양도글에는 관심 표시할 수 없습니다.' }, { status: 400 });
  }

  if (transfer.status !== 'available') {
    return NextResponse.json({ error: '양도 가능한 글에만 관심 표시할 수 있습니다.' }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const message = body.message || null;

    if (message && (typeof message !== 'string' || message.length > 200)) {
      return NextResponse.json({ error: '메시지는 200자 이하로 작성해주세요.' }, { status: 400 });
    }

    const { data: userData } = await supabase
      .from('users')
      .select('full_name, nickname')
      .eq('id', user.id)
      .single();

    const buyerName = userData?.nickname || userData?.full_name || user.email?.split('@')[0] || '익명';

    const { data, error } = await supabase
      .from('transfer_interests')
      .insert([{
        transfer_id: transferId,
        buyer_id: user.id,
        buyer_name: buyerName,
        message,
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '이미 관심 표시한 양도글입니다.' }, { status: 409 });
      }
      console.error('Error expressing interest:', error);
      return NextResponse.json({ error: '관심 표시에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ interest: data }, { status: 201 });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const rateLimitResult = await limiter(request);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)) } }
    );
  }

  const { id: transferId } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { data: transfer } = await supabase
    .from('court_transfers')
    .select('seller_id')
    .eq('id', transferId)
    .single();

  if (!transfer || transfer.seller_id !== user.id) {
    return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { interest_id, status } = body;

    if (!interest_id || !status) {
      return NextResponse.json({ error: '관심 표시 ID와 상태가 필요합니다.' }, { status: 400 });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return NextResponse.json({ error: '올바르지 않은 상태입니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('transfer_interests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', interest_id)
      .eq('transfer_id', transferId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: '관심 표시를 찾을 수 없습니다.' }, { status: 404 });
      }
      console.error('Error updating interest:', error);
      return NextResponse.json({ error: '상태 변경에 실패했습니다.' }, { status: 500 });
    }

    return NextResponse.json({ interest: data });
  } catch {
    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  const { id: transferId } = await context.params;
  const supabase = await createServerSupabaseClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
  }

  const { error } = await supabase
    .from('transfer_interests')
    .delete()
    .eq('transfer_id', transferId)
    .eq('buyer_id', user.id);

  if (error) {
    console.error('Error withdrawing interest:', error);
    return NextResponse.json({ error: '관심 철회에 실패했습니다.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
