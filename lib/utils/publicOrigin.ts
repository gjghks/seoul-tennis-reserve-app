const CANONICAL_ORIGIN = 'https://seoul-tennis.com';
const PUBLIC_HOSTS = new Set(['seoul-tennis.com', 'www.seoul-tennis.com']);
const LOCAL_HOST = /^(localhost|127\.0\.0\.1)(:\d+)?$/;

/**
 * Public origin for building absolute redirect URLs in route handlers.
 *
 * Self-hosted standalone Next (behind cloudflared) builds `request.url` from its bind
 * address (`0.0.0.0:3000`), so `new URL(request.url).origin` is unusable. The public host
 * survives in X-Forwarded-Host / Host; only allow-listed hosts are trusted so a spoofed
 * header can never turn a redirect into an open redirect.
 */
export function getPublicOrigin(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-host')?.split(',')[0]?.trim().toLowerCase();
  const host = request.headers.get('host')?.trim().toLowerCase();

  for (const candidate of [forwarded, host]) {
    if (!candidate) continue;
    if (PUBLIC_HOSTS.has(candidate)) return `https://${candidate}`;
    if (LOCAL_HOST.test(candidate)) return `${new URL(request.url).protocol}//${candidate}`;
  }
  return CANONICAL_ORIGIN;
}
