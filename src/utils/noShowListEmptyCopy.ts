import { NO_SESSIONS_IN_RANGE_TEXT } from "@/components/metricCopy";
import type { NoShowKind } from "@/types/noShow";

export function noShowListEmptyCopy(kind: NoShowKind): string {
  if (kind === "no-sessions") return NO_SESSIONS_IN_RANGE_TEXT;
  if (kind === "unknown") return "Attendance was not taken.";
  return "No counted no-shows.";
}

export function noShowCountLabel(kind: NoShowKind, count: number | null): string {
  if (kind === "unknown") return "Unknown";
  if (kind === "no-sessions" || count === null) return "No count";
  return String(count);
}
