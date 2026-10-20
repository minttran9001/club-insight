"use client";

import { rangeFetchDebounceMs } from "@/constants/timing";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ClubDateRange } from "@/types/range";

export function useSettledRange(current: ClubDateRange | null) {
  const rangeKey = current ? `${current.clubId}|${current.from}|${current.to}` : "";
  const debouncedRange = useDebouncedValue(rangeKey, rangeFetchDebounceMs);
  const [clubId = "", from = "", to = ""] = debouncedRange.split("|");
  const settled: ClubDateRange | null = clubId && from && to ? { clubId, from, to } : null;

  return { settled, rangeHasSettled: debouncedRange === rangeKey };
}
