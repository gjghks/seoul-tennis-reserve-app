import { describe, expect, it } from 'vitest';
import { splitHighlightSegments } from './searchHighlight';

describe('searchHighlight', () => {
  it('highlights direct substring matches', () => {
    const segments = splitHighlightSegments('강남테니스장', '테니스');
    const matched = segments.find((segment) => segment.matched);

    expect(matched?.text).toBe('테니스');
  });

  it('highlights whitespace-insensitive matches', () => {
    const segments = splitHighlightSegments('강남 테니스장', '강남테');
    const matched = segments.find((segment) => segment.matched);

    expect(matched?.text).toBe('강남 테');
  });

  it('returns plain segment when no match exists', () => {
    const segments = splitHighlightSegments('잠실 테니스장', '강남');

    expect(segments).toEqual([{ text: '잠실 테니스장', matched: false }]);
  });
});
