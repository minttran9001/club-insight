import type { ClubDateQuery } from "@/types/range";
import { queryUnrecordedSessions } from "@/app/api/server/db/lists";
import { withResolvedClub } from "@/app/api/server/services/helpers";

export function getUnrecordedSessions(scope: ClubDateQuery) {
  return withResolvedClub(scope, (club, range) => ({
    clubId: club.id,
    range,
    sessions: queryUnrecordedSessions(club, range),
  }));
}
