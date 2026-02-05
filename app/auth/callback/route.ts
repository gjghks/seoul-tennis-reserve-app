import { createSupabaseServerClient } from '@/lib/supabase-server';
import { NextRequest, NextResponse } from 'next/server';

function sanitizeRedirectPath(path: string | null): string {
  if (!path) return '/';
  if (!path.startsWith('/')) return '/';
  if (path.startsWith('//')) return '/';
  return path;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const origin = requestUrl.origin;

  const authRedirectCookie = request.cookies.get('auth_redirect')?.value;
  const redirectPath = sanitizeRedirectPath(
    authRedirectCookie ? decodeURIComponent(authRedirectCookie) : null
  );

  if (code) {
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${origin}/login?error=auth_error`);
    }
  }

  const response = NextResponse.redirect(`${origin}${redirectPath}`);
  response.cookies.delete('auth_redirect');
  return response;
}
