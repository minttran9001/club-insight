import type { ClubDateQuery } from "@/types/range";
import { queryDashboard } from "@/app/api/server/db/dashboard";
import { withResolvedClub } from "@/app/api/server/services/helpers";

export function getDashboard(scope: ClubDateQuery) {
  return withResolvedClub(scope, (club, range) => queryDashboard(club, range));
}
