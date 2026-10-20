import { getDatabase } from "@/app/api/server/db/connection";
import type { ClubRecord } from "@/types/club";

type ClubRow = {
  club_id: string;
  name: string;
  time_zone: string;
  created_at: string;
};

type FirstDayRow = { club_id: string; first_day: string | null };

export function listClubRowsSync(): ClubRecord[] {
  const rows = getDatabase()
    .prepare<ClubRow>("SELECT club_id, name, time_zone, created_at FROM clubs ORDER BY club_id")
    .all();
  return rows.map(toClub);
}

export function getClubSync(clubId: string): ClubRecord | null {
  const row = getDatabase()
    .prepare<ClubRow>("SELECT club_id, name, time_zone, created_at FROM clubs WHERE club_id = ?")
    .get(clubId);
  return row ? toClub(row) : null;
}

export function earliestSessionDayByClub(): Map<string, string | null> {
  const rows = getDatabase()
    .prepare<FirstDayRow>(
      `SELECT c.club_id, MIN(local_day(s.starts_at, c.time_zone)) AS first_day
       FROM clubs c
       LEFT JOIN sessions s ON s.club_id = c.club_id
       GROUP BY c.club_id`,
    )
    .all();
  return new Map(rows.map((row) => [row.club_id, row.first_day]));
}

function toClub(row: ClubRow): ClubRecord {
  return {
    id: row.club_id,
    name: row.name,
    timeZone: row.time_zone,
    createdAt: row.created_at,
  };
}
