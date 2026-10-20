import { request } from "@/apiClient/client";
import { invalidResponse, isRecord, readItems } from "@/apiClient/helpers";
import type { ClubSummary } from "@/types/club";
import type { DateRange } from "@/types/range";

export async function fetchClubs(signal?: AbortSignal): Promise<ClubSummary[]> {
  const body = await request.get("/api/clubs", undefined, { signal });
  return normalizeClubs(body);
}

function normalizeClubs(body: unknown): ClubSummary[] {
  if (!isRecord(body)) throw invalidResponse("Could not load clubs.");
  return readItems(body, "clubs", readClub, "Could not load clubs.");
}

function readClub(value: unknown): ClubSummary | null {
  if (!isRecord(value) || !isRecord(value.presets)) return null;
  const fourWeeks = readDateRange(value.presets.fourWeeks);
  const twelveWeeks = readDateRange(value.presets.twelveWeeks);
  const all = readDateRange(value.presets.all);
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.timeZone !== "string" ||
    typeof value.createdAt !== "string" ||
    !fourWeeks ||
    !twelveWeeks ||
    !all
  ) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    timeZone: value.timeZone,
    createdAt: value.createdAt,
    presets: { fourWeeks, twelveWeeks, all },
  };
}

function readDateRange(value: unknown): DateRange | null {
  if (!isRecord(value) || typeof value.from !== "string" || typeof value.to !== "string") return null;
  return { from: value.from, to: value.to };
}
