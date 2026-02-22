interface HighlightSegment {
  text: string;
  matched: boolean;
}

const normalize = (value: string): string => value.toLowerCase();

const findCompactRange = (source: string, query: string): [number, number] | null => {
  const compactSourceChars: string[] = [];
  const indexMap: number[] = [];
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (/\s/.test(char)) {
      continue;
    }

    compactSourceChars.push(char);
    indexMap.push(i);
  }

  const compactSource = normalize(compactSourceChars.join(''));
  const compactQuery = normalize(query.replace(/\s+/g, ''));
  if (!compactQuery) {
    return null;
  }

  const compactStart = compactSource.indexOf(compactQuery);
  if (compactStart < 0) {
    return null;
  }

  const originalStart = indexMap[compactStart];
  const originalEnd = indexMap[compactStart + compactQuery.length - 1] + 1;

  return [originalStart, originalEnd];
};

export const splitHighlightSegments = (sourceText: string, query: string): HighlightSegment[] => {
  if (!sourceText) {
    return [];
  }

  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return [{ text: sourceText, matched: false }];
  }

  const lowerSource = normalize(sourceText);
  const lowerQuery = normalize(normalizedQuery);

  let start = lowerSource.indexOf(lowerQuery);
  let end = start >= 0 ? start + lowerQuery.length : -1;

  if (start < 0) {
    const compactRange = findCompactRange(sourceText, normalizedQuery);
    if (compactRange) {
      [start, end] = compactRange;
    }
  }

  if (start < 0 || end <= start) {
    return [{ text: sourceText, matched: false }];
  }

  const segments: HighlightSegment[] = [];
  if (start > 0) {
    segments.push({ text: sourceText.slice(0, start), matched: false });
  }
  segments.push({ text: sourceText.slice(start, end), matched: true });
  if (end < sourceText.length) {
    segments.push({ text: sourceText.slice(end), matched: false });
  }

  return segments;
};
