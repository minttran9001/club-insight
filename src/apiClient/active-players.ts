import { isNumber, isRecord, readItems } from "@/apiClient/helpers";
import { fetchPagedList } from "@/apiClient/pagedList";
import type { ListRequest } from "@/types/dashboard";
import type { ActivePlayerItem } from "@/types/player";
import type { ClubDateRange } from "@/types/range";

export function fetchActivePlayers(scope: ClubDateRange, list: ListRequest, signal?: AbortSignal) {
  return fetchPagedList(scope, "active-players", list, signal, (record, message) => ({
    players: readItems(record, "players", readPlayer, message),
  }));
}

function readPlayer(value: unknown): ActivePlayerItem | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.id !== "string" ||
    typeof value.name !== "string" ||
    typeof value.joinedAt !== "string" ||
    typeof value.joinedOn !== "string" ||
    !isNumber(value.sessionsAttended) ||
    !isNumber(value.unrecordedSessions) ||
    !isNumber(value.confirmedNoShows)
  ) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    joinedAt: value.joinedAt,
    joinedOn: value.joinedOn,
    sessionsAttended: value.sessionsAttended,
    unrecordedSessions: value.unrecordedSessions,
    confirmedNoShows: value.confirmedNoShows,
  };
}
