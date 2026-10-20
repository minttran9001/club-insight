import { formatDay } from "@/domain/metrics";
import type { DateRange } from "@/types/range";

export function dateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function orderedRange(start: Date, end: Date): DateRange {
  const startKey = dateKey(start);
  const endKey = dateKey(end);
  if (startKey <= endKey) return { from: startKey, to: endKey };
  return { from: endKey, to: startKey };
}

export function rangeLabel(from: string | null, to: string | null): string {
  if (!from || !to) return "Choose dates";
  return `${formatDay(from)} – ${formatDay(to)}`;
}
