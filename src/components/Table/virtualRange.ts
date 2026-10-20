export const rowHeightPx = 40;
export const virtualOverscan = 6;
export const virtualizeAfter = 24;

export function virtualRange(scrollTop: number, viewportHeight: number, count: number): { start: number; end: number } {
  if (count <= 0) return { start: 0, end: 0 };
  const start = Math.max(0, Math.floor(scrollTop / rowHeightPx) - virtualOverscan);
  const end = Math.min(count, Math.ceil((scrollTop + viewportHeight) / rowHeightPx) + virtualOverscan);
  return { start, end: Math.max(end, start) };
}
