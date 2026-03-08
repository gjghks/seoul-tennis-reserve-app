// biome-ignore lint: control chars in regex are intentional for sanitization
const CONTROL_CHAR_REGEX = new RegExp('[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]', 'g');

export function sanitizeText(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  return input.replace(CONTROL_CHAR_REGEX, '').normalize('NFC').trim();
}

export function validateTextLength(
  text: string,
  min: number,
  max: number
): boolean {
  return text.length >= min && text.length <= max;
}

export function sanitizeImageUrls(
  urls: unknown,
  maxCount: number,
  allowedHostnames: string[]
): string[] | null {
  if (!Array.isArray(urls)) return null;
  if (urls.length > maxCount) return null;

  const sanitized: string[] = [];
  for (const url of urls) {
    if (typeof url !== 'string') return null;

    if (url.startsWith('/')) {
      sanitized.push(url);
      continue;
    }

    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') return null;
      const isAllowed = allowedHostnames.some(
        host => parsed.hostname === host || parsed.hostname.endsWith(`.${host}`)
      );
      if (!isAllowed) return null;
      sanitized.push(url);
    } catch {
      return null;
    }
  }
  return sanitized;
}

export function validateDateRange(
  from: string | null,
  to: string | null,
  maxRangeDays = 730
): { from?: string; to?: string } | null {
  const result: { from?: string; to?: string } = {};

  if (from) {
    const d = Date.parse(from);
    if (Number.isNaN(d)) return null;
    result.from = from;
  }

  if (to) {
    const d = Date.parse(to);
    if (Number.isNaN(d)) return null;
    result.to = to;
  }

  if (result.from && result.to) {
    const diff = Date.parse(result.to) - Date.parse(result.from);
    if (diff < 0) return null;
    if (diff > maxRangeDays * 24 * 60 * 60 * 1000) return null;
  }

  return result;
}
