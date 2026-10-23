"use client";

import { RANGE_FETCH_DEBOUNCE_MS } from "@/constants/timing";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { ClubDateRange } from "@/types/range";

export function useSettledRange(current: ClubDateRange | null) {
  const rangeKey = current ? `${current.clubId}|${current.from}|${current.to}` : "";
  const debouncedRange = useDebouncedValue(rangeKey, RANGE_FETCH_DEBOUNCE_MS);
  const [clubId = "", from = "", to = ""] = debouncedRange.split("|");
  const settled: ClubDateRange | null = clubId && from && to ? { clubId, from, to } : null;

  return { settled, rangeHasSettled: debouncedRange === rangeKey };
}
