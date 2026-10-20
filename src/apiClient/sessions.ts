import { isNullableNumber, isNumber, isRecord, readItems } from "@/apiClient/helpers";
import { fetchPagedList } from "@/apiClient/pagedList";
import type { ListRequest } from "@/types/dashboard";
import type { ClubDateRange } from "@/types/range";
import type { SessionListItem } from "@/types/session";

export function fetchSessions(scope: ClubDateRange, list: ListRequest, signal?: AbortSignal) {
  return fetchPagedList(scope, "sessions", list, signal, (record, message) => ({
    sessions: readItems(record, "sessions", readSession, message),
  }));
}

function readSession(value: unknown): SessionListItem | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.startsAt !== "string" ||
    typeof value.localStart !== "string" ||
    !isNumber(value.durationMinutes) ||
    !isNumber(value.places) ||
    !isNumber(value.keptBookings) ||
    !isNumber(value.cancelledBookings) ||
    !isNullableNumber(value.attended) ||
    !isNullableNumber(value.noShows) ||
    typeof value.attendanceRecorded !== "boolean"
  ) {
    return null;
  }
  return {
    id: value.id,
    title: value.title,
    startsAt: value.startsAt,
    localStart: value.localStart,
    durationMinutes: value.durationMinutes,
    places: value.places,
    keptBookings: value.keptBookings,
    cancelledBookings: value.cancelledBookings,
    attended: value.attended,
    noShows: value.noShows,
    attendanceRecorded: value.attendanceRecorded,
  };
}
