import type { ParsedListQuery } from "@/types/list";
import type { ClubDateQuery } from "@/types/range";
import { querySessions } from "@/app/api/server/db/lists";
import { listResponse, withResolvedClub } from "@/app/api/server/services/helpers";

export function getSessions(scope: ClubDateQuery, query: ParsedListQuery) {
  return withResolvedClub(scope, (club, range) => {
    const listed = querySessions(club, range, query);
    return listResponse(club.id, range, query, listed.total, { sessions: listed.rows });
  });
}
