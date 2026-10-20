import type { ParsedListQuery } from "@/types/list";
import type { ClubDateQuery } from "@/types/range";
import { queryActivePlayers } from "@/app/api/server/db/lists";
import { listResponse, withResolvedClub } from "@/app/api/server/services/helpers";

export function getActivePlayers(scope: ClubDateQuery, query: ParsedListQuery) {
  return withResolvedClub(scope, (club, range) => {
    const listed = queryActivePlayers(club, range, query);
    return listResponse(club.id, range, query, listed.total, { players: listed.rows });
  });
}
