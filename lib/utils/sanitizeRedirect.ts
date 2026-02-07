export function sanitizeRedirectPath(path: string | null): string {
  if (!path) return '/';
  if (!path.startsWith('/')) return '/';
  if (path.startsWith('//')) return '/';
  if (path.includes('://')) return '/';
  if (path.toLowerCase().startsWith('/javascript:')) return '/';
  if (path.toLowerCase().startsWith('/data:')) return '/';
  if (decodeURIComponent(path).startsWith('//')) return '/';
  return path;
}
