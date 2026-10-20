import { connection } from "next/server";
import { allSessionsRangeFromFirstDay, completeWeeksEnding, FIXED_NOW } from "@/app/api/server/metrics";
import type { ClubSummary } from "@/types/club";
import { earliestSessionDayByClub, listClubRowsSync } from "@/app/api/server/db/clubs";
import type { ServiceResult } from "@/app/api/server/services/helpers";

export async function getClubs(): Promise<ServiceResult<{ clubs: ClubSummary[] }>> {
  await connection();
  const clubs = listClubRowsSync();
  const firstDays = earliestSessionDayByClub();
  const summaries: ClubSummary[] = clubs.map((club) => ({
    ...club,
    presets: {
      fourWeeks: completeWeeksEnding(FIXED_NOW, club.timeZone, 4),
      twelveWeeks: completeWeeksEnding(FIXED_NOW, club.timeZone, 12),
      all: allSessionsRangeFromFirstDay(FIXED_NOW, club.timeZone, firstDays.get(club.id) ?? null),
    },
  }));
  return { ok: true, data: { clubs: summaries } };
}
