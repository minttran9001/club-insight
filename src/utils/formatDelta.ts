function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
}

export function formatDeltaWithPercent(delta: number, current: number | null): string {
  const amount = formatDelta(delta);
  if (current === null) return amount;
  const percent = percentChange(delta, current);
  return percent === null ? amount : `${amount} (${percent})`;
}

function percentChange(delta: number, current: number): string | null {
  const previous = current - delta;
  if (previous <= 0) return delta === 0 ? "0%" : null;
  const percent = (delta / previous) * 100;
  const whole = Math.round(percent);
  if (whole === 0 && delta !== 0) {
    const tenth = Math.round(percent * 10) / 10;
    return `${tenth > 0 ? "+" : ""}${tenth.toFixed(1)}%`;
  }
  return `${whole > 0 ? "+" : ""}${whole}%`;
}
