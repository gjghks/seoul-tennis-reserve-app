/**
 * Catmull-Rom → cubic Bézier 보간으로 부드러운 SVG path를 생성합니다.
 *
 * @param points - {x, y} 좌표 배열 (최소 2개)
 * @param tension - 곡률 텐션 (0 = 직선, 0.5 = 강한 곡선). 기본값 0.25
 * @returns SVG path `d` 속성 문자열 (예: "M 0 0 C ...")
 */
export function buildSmoothPath(
  points: Array<{ x: number; y: number }>,
  tension = 0.25,
): string {
  if (points.length < 2) return '';

  let d = `M ${points[0].x} ${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }

  return d;
}
