import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createServiceRoleClient } from '@/lib/supabaseServer';
import { createRateLimiter } from '@/lib/rateLimit';
import { deleteUserAccount } from '@/lib/account/deleteAccount';
import { ACCOUNT_DELETE_CONFIRM_TEXT } from '@/lib/account/constants';

// Irreversible + expensive: keep the budget tight.
const limiter = createRateLimiter({ windowMs: 60_000, maxRequests: 3 });

const TRUSTED_HOSTS = new Set(['seoul-tennis.com', 'www.seoul-tennis.com']);

/**
 * Defense in depth against CSRF on this irreversible endpoint. Today a
 * cross-site DELETE already needs a CORS preflight the app never answers and
 * the auth cookies are SameSite=Lax, but that protection is implicit (a future
 * global CORS header would remove it). Requests without Origin /
 * Sec-Fetch-Site (non-browser clients) are left to the session check.
 */
function isCrossSiteRequest(request: NextRequest): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return true;

  const origin = request.headers.get('origin');
  if (!origin) return false;

  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return true; // "null" or malformed
  }
  const requestHost = request.headers.get('host') ?? request.nextUrl.host;
  return originHost !== requestHost && !TRUSTED_HOSTS.has(originHost);
}

// DELETE: 회원 탈퇴 (본인 계정만)
export async function DELETE(request: NextRequest) {
  if (isCrossSiteRequest(request)) {
    return NextResponse.json({ error: '허용되지 않은 요청입니다.' }, { status: 403 });
  }

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

  let confirm: unknown;
  try {
    const body = await request.json();
    confirm = body?.confirm;
  } catch {
    confirm = undefined;
  }

  if (typeof confirm !== 'string' || confirm.trim() !== ACCOUNT_DELETE_CONFIRM_TEXT) {
    return NextResponse.json(
      { error: `확인 문구 '${ACCOUNT_DELETE_CONFIRM_TEXT}'를 정확히 입력해주세요.` },
      { status: 400 }
    );
  }

  try {
    // The id comes from the verified session only — never from the request body.
    await deleteUserAccount(createServiceRoleClient(), user.id);
  } catch {
    // deleteUserAccount already logged a PII-free description of the failure.
    return NextResponse.json(
      { error: '회원 탈퇴 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }

  // The account is gone; drop the session. signOut clears the auth cookies via
  // the cookie adapter even when the server-side session no longer exists.
  try {
    await supabase.auth.signOut({ scope: 'local' });
  } catch {
    /* session already invalid — cookies are expired below anyway */
  }

  const response = NextResponse.json({ success: true });
  for (const { name } of request.cookies.getAll()) {
    if (name.startsWith('sb-')) {
      response.cookies.set(name, '', { path: '/', maxAge: 0 });
    }
  }
  return response;
}
