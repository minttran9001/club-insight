"use client";

import { rangeFetchDebounceMs } from "@/constants/timing";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export function useSettledRange(club: string | null, from: string | null, to: string | null) {
  const rangeKey = `${club ?? ""}|${from ?? ""}|${to ?? ""}`;
  const debouncedRange = useDebouncedValue(rangeKey, rangeFetchDebounceMs);
  const [debouncedClub = "", debouncedFrom = "", debouncedTo = ""] = debouncedRange.split("|");
  const settledClub = debouncedClub || null;
  const settledFrom = debouncedFrom || null;
  const settledTo = debouncedTo || null;

  return {
    settledClub,
    settledFrom,
    settledTo,
    rangeHasSettled: settledClub === club && settledFrom === from && settledTo === to,
  };
}
