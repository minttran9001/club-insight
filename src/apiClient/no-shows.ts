import { invalidResponse, isRecord, readItems } from "@/apiClient/helpers";
import { fetchPagedList } from "@/apiClient/pagedList";
import type { ListRequest } from "@/types/dashboard";
import type { NoShowItem, NoShowKind } from "@/types/noShow";
import type { ClubDateRange } from "@/types/range";

export function fetchNoShows(scope: ClubDateRange, list: ListRequest, signal?: AbortSignal) {
  return fetchPagedList(scope, "no-shows", list, signal, (record, message) => {
    const kind = readKind(record.kind);
    const attendanceTaken = record.attendanceTaken;
    const heldSessions = record.heldSessions;
    if (!kind || typeof attendanceTaken !== "number" || typeof heldSessions !== "number") throw invalidResponse(message);
    return {
      kind,
      attendanceTaken,
      heldSessions,
      noShows: readItems(record, "noShows", readNoShow, message),
    };
  });
}

function readKind(value: unknown): NoShowKind | null {
  if (value === "count" || value === "unknown" || value === "no-sessions") return value;
  return null;
}

function readNoShow(value: unknown): NoShowItem | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.bookingId !== "string" ||
    typeof value.playerId !== "string" ||
    typeof value.playerName !== "string" ||
    typeof value.joinedAt !== "string" ||
    typeof value.joinedOn !== "string" ||
    typeof value.sessionId !== "string" ||
    typeof value.sessionTitle !== "string" ||
    typeof value.startsAt !== "string" ||
    typeof value.localStart !== "string"
  ) {
    return null;
  }
  return {
    bookingId: value.bookingId,
    playerId: value.playerId,
    playerName: value.playerName,
    joinedAt: value.joinedAt,
    joinedOn: value.joinedOn,
    sessionId: value.sessionId,
    sessionTitle: value.sessionTitle,
    startsAt: value.startsAt,
    localStart: value.localStart,
  };
}
