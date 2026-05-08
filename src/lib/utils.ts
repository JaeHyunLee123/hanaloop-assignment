/**
 * 소수점 4자리 반올림 헬퍼
 */
export function roundTo4(n: number): number {
  return Math.round(n * 10000) / 10000;
}