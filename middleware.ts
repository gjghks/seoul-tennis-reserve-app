import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/my'];

// Canonical host consolidation. Vercel auto-generates the production alias
// `seoul-tennis-reserve-app.vercel.app`, which serves the identical app and has no
// redirect to the custom domain — so users who arrive there (PWA installed from it,
// shared/bookmarked links, Google-indexed pages) stay on the wrong host. Send them to
// the apex with a permanent 308 (path + query preserved).
// Exact-host match ONLY: preview deploys use distinct hostnames
// (seoul-tennis-reserve-app-git-*/<hash>.vercel.app) and are never matched, so the
// develop→Preview flow is untouched. `/api` and `/auth` are excluded so cron callers
// (Authorization header would be dropped on a cross-host redirect) and in-flight OAuth
// (per-host PKCE code_verifier cookie) are not broken.
const CANONICAL_HOST = 'seoul-tennis.com';
const LEGACY_PROD_HOST = 'seoul-tennis-reserve-app.vercel.app';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const host = request.headers.get('host');
  if (
    host === LEGACY_PROD_HOST &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/auth')
  ) {
    const url = request.nextUrl.clone();
    url.protocol = 'https:';
    url.host = CANONICAL_HOST;
    url.port = '';
    return NextResponse.redirect(url, 308);
  }

  const isProtected = PROTECTED_PATHS.some(path => pathname.startsWith(path));
  if (!isProtected) return NextResponse.next();

  const response = NextResponse.next();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  } catch {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  // Run on page routes so the canonical-host redirect can fire, while skipping API
  // routes, Next internals, and any path with a file extension (sw.js, manifest.json,
  // robots.txt, icons/*.png) — the last avoids a cross-origin redirect of the service
  // worker script. The existing `/my` auth gate still matches (no extension).
  matcher: ['/((?!api|_next|.*\\..*).*)'],
};
