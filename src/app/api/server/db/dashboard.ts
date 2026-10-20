import {
  NO_SESSIONS_IN_RANGE,
  buildWeekPoints,
  clubHasNotHeldSession,
  comparisonLabel,
  previousRange,
  weekSpan,
} from "@/app/api/server/metrics";
import type { ClubRecord } from "@/types/club";
import type { DashboardReport } from "@/types/dashboard";
import type { DateRange } from "@/types/range";
import { getDatabase } from "@/app/api/server/db/connection";
import { noShowKind, noShowStats } from "@/app/api/server/db/lists";
import { HELD_WHERE, NOW_ISO, count, heldParams } from "@/app/api/server/db/sql";

type WeekRow = { weekStart: string; count: number };
type FlagRow = { held: number };

export function queryDashboard(club: ClubRecord, range: DateRange): DashboardReport {
  const previous = previousRange(range.from, range.to);
  const currentHeld = countHeld(club, range);
  const previousHeld = countHeld(club, previous);
  const currentPlayers = countActivePlayers(club, range);
  const previousPlayers = countActivePlayers(club, previous);
  const currentNoShows = noShowStats(club, range);
  const previousNoShows = noShowStats(club, previous);
  const currentKind = noShowKind(currentNoShows);
  const previousKind = noShowKind(previousNoShows);
  const hasHeldSession = clubHasHeldSession(club.id);
  const weeks = weekCounts(club, range);
  let message: string | null = null;
  if (!hasHeldSession) message = clubHasNotHeldSession(club.name, club.createdAt);
  else if (currentHeld === 0) message = NO_SESSIONS_IN_RANGE;

  return {
    clubId: club.id,
    range,
    comparison: { ...previous, label: comparisonLabel(previous.from, previous.to) },
    hasHeldSession,
    message,
    showChart: weeks.length > 0,
    sessionsHeld: {
      value: currentHeld,
      delta: currentHeld - previousHeld,
    },
    activePlayers: {
      value: currentPlayers,
      delta: currentPlayers - previousPlayers,
    },
    noShows: {
      kind: currentKind,
      value: currentKind === "count" ? currentNoShows.noshows : null,
      delta: currentKind === "count" && previousKind === "count" ? currentNoShows.noshows - previousNoShows.noshows : null,
      attendanceTaken: currentNoShows.taken,
      heldSessions: currentNoShows.held,
    },
    weeks,
  };
}

function countHeld(club: ClubRecord, range: DateRange): number {
  return count(`SELECT COUNT(*) AS total FROM sessions s WHERE ${HELD_WHERE}`, heldParams(club.id, club.timeZone, range));
}

function countActivePlayers(club: ClubRecord, range: DateRange): number {
  return count(
    `SELECT COUNT(DISTINCT b.player_id) AS total
       FROM sessions s
       JOIN bookings b ON b.session_id = s.session_id
       WHERE ${HELD_WHERE}
         AND b.status = 'booked'
         AND (s.attendance_recorded = 0 OR b.attended = 1)`,
    heldParams(club.id, club.timeZone, range),
  );
}

function clubHasHeldSession(clubId: string): boolean {
  const row = getDatabase()
    .prepare<FlagRow>(
      `SELECT EXISTS(
         SELECT 1 FROM sessions
         WHERE club_id = ?
           AND status != 'cancelled'
           AND datetime(starts_at) <= datetime(?)
       ) AS held`,
    )
    .get(clubId, NOW_ISO);
  return row?.held === 1;
}

function weekCounts(club: ClubRecord, range: DateRange): DashboardReport["weeks"] {
  const span = weekSpan(range.from, range.to);
  const rows = getDatabase()
    .prepare<WeekRow>(
      `WITH RECURSIVE weeks(week_start) AS (
         SELECT ?
         UNION ALL
         SELECT date(week_start, '+7 days') FROM weeks WHERE week_start < ?
       ),
       active_days AS (
         SELECT DISTINCT local_day(s.starts_at, ?) AS day, b.player_id
         FROM sessions s
         JOIN bookings b ON b.session_id = s.session_id
         WHERE ${HELD_WHERE}
           AND b.status = 'booked'
           AND (s.attendance_recorded = 0 OR b.attended = 1)
       )
       SELECT
         w.week_start AS weekStart,
         (
           SELECT COUNT(DISTINCT a.player_id)
           FROM active_days a
           WHERE a.day >= w.week_start AND a.day <= date(w.week_start, '+6 days')
         ) AS count
       FROM weeks w
       ORDER BY w.week_start`,
    )
    .all(span.first, span.last, club.timeZone, ...heldParams(club.id, club.timeZone, range));
  const counts = new Map(rows.map((row) => [row.weekStart, row.count]));
  return buildWeekPoints(range.from, range.to, counts);
}
