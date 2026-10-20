import { request } from "@/apiClient/client";
import { isRecord, readClubRange, readItems } from "@/apiClient/helpers";
import type { ClubDateRange } from "@/types/range";
import type { UnrecordedSessionItem } from "@/types/session";

export async function fetchUnrecordedSessions(scope: ClubDateRange, signal?: AbortSignal): Promise<ClubDateRange & { sessions: UnrecordedSessionItem[] }> {
  const body = await request.get(
    `/api/clubs/${encodeURIComponent(scope.clubId)}/unrecorded-sessions`,
    { from: scope.from, to: scope.to },
    { signal },
  );
  const ranged = readClubRange(body);
  const message = "Could not load sessions where attendance was not taken.";
  return {
    clubId: ranged.clubId,
    from: ranged.from,
    to: ranged.to,
    sessions: readItems(ranged.record, "sessions", readUnrecorded, message),
  };
}

function readUnrecorded(value: unknown): UnrecordedSessionItem | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.startsAt !== "string" ||
    typeof value.localStart !== "string"
  ) {
    return null;
  }
  return {
    id: value.id,
    title: value.title,
    startsAt: value.startsAt,
    localStart: value.localStart,
  };
}
