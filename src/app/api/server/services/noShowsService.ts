import type { ParsedListQuery } from "@/types/list";
import type { ClubDateQuery } from "@/types/range";
import { queryNoShows } from "@/app/api/server/db/lists";
import { listResponse, withResolvedClub } from "@/app/api/server/services/helpers";

export function getNoShows(scope: ClubDateQuery, query: ParsedListQuery) {
  return withResolvedClub(scope, (club, range) => {
    const listed = queryNoShows(club, range, query);
    return listResponse(club.id, range, query, listed.total, {
      kind: listed.kind,
      attendanceTaken: listed.attendanceTaken,
      heldSessions: listed.heldSessions,
      noShows: listed.rows,
    });
  });
}
