export function sanitizeRedirectPath(path: string | null): string {
  if (!path) return '/';

  // Iteratively decode to defeat double/triple encoding attacks
  let decoded = path;
  try {
    let prev = '';
    for (let i = 0; i < 5 && decoded !== prev; i++) {
      prev = decoded;
      decoded = decodeURIComponent(decoded);
    }
  } catch {
    // Malformed URI — reject
    return '/';
  }

  // Validate against the fully decoded version
  if (!decoded.startsWith('/')) return '/';
  if (decoded.startsWith('//')) return '/';
  if (decoded.includes('://')) return '/';

  const lower = decoded.toLowerCase();
  if (lower.startsWith('/javascript:')) return '/';
  if (lower.startsWith('/data:')) return '/';
  if (lower.startsWith('/vbscript:')) return '/';

  // Use URL constructor to catch protocol-relative and absolute URL tricks
  try {
    const url = new URL(decoded, 'http://localhost');
    if (url.hostname !== 'localhost') return '/';
    if (url.protocol !== 'http:') return '/';
  } catch {
    return '/';
  }

  // Return the original (encoded) path, not the decoded one
  return path;
}
