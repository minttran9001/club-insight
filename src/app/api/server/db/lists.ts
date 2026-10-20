import { formatDay } from "@/domain/formatDay";
import { formatLocalStart } from "@/app/api/server/metrics";
import type { ClubRecord } from "@/types/club";
import type { ParsedListQuery } from "@/types/list";
import type { NoShowItem, NoShowKind } from "@/types/noShow";
import type { ActivePlayerItem } from "@/types/player";
import type { DateRange } from "@/types/range";
import type { SessionListItem, UnrecordedSessionItem } from "@/types/session";
import { getDatabase } from "@/app/api/server/db/connection";
import { HELD_WHERE, LIKE, heldParams, orderSql, pageListed, searchBinds, type SortColumn } from "@/app/api/server/db/sql";

const sessionSorts: Record<string, SortColumn> = {
  title: { expr: "vi_base(title)", nullable: false },
  start: { expr: "datetime(starts_at)", nullable: false },
  duration: { expr: "duration_minutes", nullable: false },
  places: { expr: "places", nullable: false },
  kept: { expr: "kept", nullable: false },
  cancelled: { expr: "cancelled", nullable: false },
  attended: { expr: "attended", nullable: true },
  noshows: { expr: "noshows", nullable: true },
  attendance: {
    expr: "vi_base(CASE WHEN attendance_recorded = 1 THEN 'Recorded' ELSE 'Not recorded' END)",
    nullable: false,
  },
};

const SESSION_TIE = "datetime(starts_at) DESC, row_id ASC";

const SESSION_SEARCH = `
  (? = 0 OR
    fold(title) ${LIKE}
    OR fold(local_start(starts_at, ?)) ${LIKE}
    OR fold(duration_minutes || ' min') ${LIKE}
    OR fold(CAST(places AS TEXT)) ${LIKE}
    OR fold(CAST(kept AS TEXT)) ${LIKE}
    OR fold(CAST(cancelled AS TEXT)) ${LIKE}
    OR fold(CASE WHEN attendance_recorded = 1 THEN CAST(attended_count AS TEXT) ELSE 'Unknown' END) ${LIKE}
    OR fold(CASE WHEN attendance_recorded = 1 THEN CAST(noshow_count AS TEXT) ELSE 'Unknown' END) ${LIKE}
    OR fold(CASE WHEN attendance_recorded = 1 THEN 'Recorded' ELSE 'Not recorded' END) ${LIKE}
  )
`;

type SessionSqlRow = {
  session_id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
  places: number;
  attendance_recorded: number;
  kept: number;
  cancelled: number;
  attended: number | null;
  noshows: number | null;
};

export function querySessions(
  club: ClubRecord,
  range: DateRange,
  query: ParsedListQuery,
): { rows: SessionListItem[]; total: number } {
  const listed = pageListed<SessionSqlRow>(
    sessionCtes(),
    orderSql(query.sort, query.dir, sessionSorts, SESSION_TIE),
    [...heldParams(club.id, club.timeZone, range), ...sessionSearchParams(query.q, club.timeZone)],
    query,
  );
  return { total: listed.total, rows: listed.rows.map((row) => toSessionItem(row, club.timeZone)) };
}

export function queryUnrecordedSessions(club: ClubRecord, range: DateRange): UnrecordedSessionItem[] {
  const rows = getDatabase()
    .prepare<{ session_id: string; title: string; starts_at: string }>(
      `SELECT s.session_id, s.title, s.starts_at
       FROM sessions s
       WHERE ${HELD_WHERE}
         AND s.attendance_recorded = 0
       ORDER BY datetime(s.starts_at) DESC, s.rowid ASC`,
    )
    .all(...heldParams(club.id, club.timeZone, range));
  return rows.map((row) => ({
    id: row.session_id,
    title: row.title,
    startsAt: row.starts_at,
    localStart: formatLocalStart(row.starts_at, club.timeZone),
  }));
}

function sessionCtes(): string {
  return `
    held AS (
      SELECT
        s.rowid AS row_id,
        s.session_id,
        s.title,
        s.starts_at,
        s.duration_minutes,
        s.places,
        s.attendance_recorded
      FROM sessions s
      WHERE ${HELD_WHERE}
    ),
    tallies AS (
      SELECT
        h.row_id,
        h.session_id,
        h.title,
        h.starts_at,
        h.duration_minutes,
        h.places,
        h.attendance_recorded,
        COALESCE(SUM(b.status = 'booked'), 0) AS kept,
        COALESCE(SUM(b.status = 'cancelled'), 0) AS cancelled,
        COALESCE(SUM(b.status = 'booked' AND b.attended = 1), 0) AS attended_count,
        COALESCE(SUM(b.status = 'booked' AND b.attended = 0), 0) AS noshow_count
      FROM held h
      LEFT JOIN bookings b ON b.session_id = h.session_id
      GROUP BY h.row_id, h.session_id, h.title, h.starts_at, h.duration_minutes, h.places, h.attendance_recorded
    ),
    listed AS (
      SELECT
        row_id,
        session_id,
        title,
        starts_at,
        duration_minutes,
        places,
        attendance_recorded,
        kept,
        cancelled,
        CASE WHEN attendance_recorded = 1 THEN attended_count END AS attended,
        CASE WHEN attendance_recorded = 1 THEN noshow_count END AS noshows
      FROM tallies
      WHERE ${SESSION_SEARCH}
    )
  `;
}

function sessionSearchParams(q: string, timeZone: string): unknown[] {
  return searchBinds(q, (bound) => [bound, timeZone, bound, bound, bound, bound, bound, bound, bound, bound]);
}

function toSessionItem(row: SessionSqlRow, timeZone: string): SessionListItem {
  return {
    id: row.session_id,
    title: row.title,
    startsAt: row.starts_at,
    localStart: formatLocalStart(row.starts_at, timeZone),
    durationMinutes: row.duration_minutes,
    places: row.places,
    keptBookings: row.kept,
    cancelledBookings: row.cancelled,
    attended: row.attended,
    noShows: row.noshows,
    attendanceRecorded: row.attendance_recorded === 1,
  };
}

const playerSorts: Record<string, SortColumn> = {
  name: { expr: "vi_base(name)", nullable: false },
  joined: { expr: "joined_at", nullable: false },
  attended: { expr: "attended", nullable: false },
  unrecorded: { expr: "unrecorded", nullable: false },
  noshows: { expr: "noshows", nullable: false },
};

const PLAYER_TIE = "(attended + unrecorded) DESC, vi_full(name) ASC, joined_at ASC, player_id ASC";

const PLAYER_SEARCH = `
  (? = 0 OR
    fold(name) ${LIKE}
    OR fold(CASE WHEN joined_at = '' THEN '' ELSE format_day(joined_at) END) ${LIKE}
    OR fold(CAST(attended AS TEXT)) ${LIKE}
    OR fold(CAST(unrecorded AS TEXT)) ${LIKE}
    OR fold(CAST(noshows AS TEXT)) ${LIKE}
  )
`;

type PlayerSqlRow = {
  player_id: string;
  name: string;
  joined_at: string;
  attended: number;
  unrecorded: number;
  noshows: number;
};

export function queryActivePlayers(
  club: ClubRecord,
  range: DateRange,
  query: ParsedListQuery,
): { rows: ActivePlayerItem[]; total: number } {
  const listed = pageListed<PlayerSqlRow>(
    playerCtes(),
    orderSql(query.sort, query.dir, playerSorts, PLAYER_TIE),
    [...heldParams(club.id, club.timeZone, range), ...playerSearchParams(query.q)],
    query,
  );
  return { total: listed.total, rows: listed.rows.map(toPlayerItem) };
}

function playerCtes(): string {
  return `
    held AS (
      SELECT s.session_id, s.attendance_recorded
      FROM sessions s
      WHERE ${HELD_WHERE}
    ),
    classified AS (
      SELECT
        b.player_id,
        CASE
          WHEN h.attendance_recorded = 0 THEN 'unrecorded'
          WHEN b.attended = 1 THEN 'attended'
          ELSE 'no-show'
        END AS kind
      FROM held h
      JOIN bookings b ON b.session_id = h.session_id
      WHERE b.status = 'booked'
        AND (h.attendance_recorded = 0 OR b.attended = 0 OR b.attended = 1)
    ),
    tallies AS (
      SELECT
        c.player_id,
        COALESCE(p.name, c.player_id) AS name,
        COALESCE(p.joined_club_at, '') AS joined_at,
        SUM(c.kind = 'attended') AS attended,
        SUM(c.kind = 'unrecorded') AS unrecorded,
        SUM(c.kind = 'no-show') AS noshows
      FROM classified c
      LEFT JOIN players p ON p.player_id = c.player_id
      GROUP BY c.player_id
      HAVING SUM(c.kind = 'attended') + SUM(c.kind = 'unrecorded') > 0
    ),
    listed AS (
      SELECT * FROM tallies
      WHERE ${PLAYER_SEARCH}
    )
  `;
}

function playerSearchParams(q: string): unknown[] {
  return searchBinds(q, (bound) => [bound, bound, bound, bound, bound]);
}

function toPlayerItem(row: PlayerSqlRow): ActivePlayerItem {
  return {
    id: row.player_id,
    name: row.name,
    joinedAt: row.joined_at,
    joinedOn: row.joined_at ? formatDay(row.joined_at) : "",
    sessionsAttended: row.attended,
    unrecordedSessions: row.unrecorded,
    confirmedNoShows: row.noshows,
  };
}

const noShowSorts: Record<string, SortColumn> = {
  player: { expr: "vi_base(player_name)", nullable: false },
  joined: { expr: "joined_at", nullable: false },
  session: { expr: "vi_base(session_title)", nullable: false },
  start: { expr: "datetime(starts_at)", nullable: false },
};

const NO_SHOW_TIE = "datetime(starts_at) DESC, vi_full(player_name) ASC, joined_at ASC, booking_id ASC";

const NO_SHOW_SEARCH = `
  (? = 0 OR
    fold(player_name) ${LIKE}
    OR fold(CASE WHEN joined_at = '' THEN '' ELSE format_day(joined_at) END) ${LIKE}
    OR fold(session_title) ${LIKE}
    OR fold(local_start(starts_at, ?)) ${LIKE}
  )
`;

type NoShowSqlRow = {
  booking_id: string;
  player_id: string;
  player_name: string;
  joined_at: string;
  session_id: string;
  session_title: string;
  starts_at: string;
};

type HeldStats = { held: number; taken: number; noshows: number };

export function queryNoShows(
  club: ClubRecord,
  range: DateRange,
  query: ParsedListQuery,
): { kind: NoShowKind; attendanceTaken: number; heldSessions: number; rows: NoShowItem[]; total: number } {
  const stats = noShowStats(club, range);
  const kind = noShowKind(stats);
  const listed = pageListed<NoShowSqlRow>(
    noShowCtes(),
    orderSql(query.sort, query.dir, noShowSorts, NO_SHOW_TIE),
    [...heldParams(club.id, club.timeZone, range), ...noShowSearchParams(query.q, club.timeZone)],
    query,
  );
  return {
    kind,
    attendanceTaken: stats.taken,
    heldSessions: stats.held,
    total: listed.total,
    rows: listed.rows.map((row) => toNoShowItem(row, club.timeZone)),
  };
}

export function noShowStats(club: ClubRecord, range: DateRange): HeldStats {
  const row = getDatabase()
    .prepare<HeldStats>(
      `WITH held AS (
         SELECT s.session_id, s.attendance_recorded
         FROM sessions s
         WHERE ${HELD_WHERE}
       )
       SELECT
         (SELECT COUNT(*) FROM held) AS held,
         (SELECT COALESCE(SUM(attendance_recorded = 1), 0) FROM held) AS taken,
         (
           SELECT COUNT(*)
           FROM held h
           JOIN bookings b ON b.session_id = h.session_id
           WHERE h.attendance_recorded = 1
             AND b.status = 'booked'
             AND b.attended = 0
         ) AS noshows`,
    )
    .get(...heldParams(club.id, club.timeZone, range));
  return row ?? { held: 0, taken: 0, noshows: 0 };
}

export function noShowKind(stats: HeldStats): NoShowKind {
  if (stats.held === 0) return "no-sessions";
  if (stats.taken === 0) return "unknown";
  return "count";
}

function noShowCtes(): string {
  return `
    held AS (
      SELECT s.session_id, s.title, s.starts_at, s.attendance_recorded
      FROM sessions s
      WHERE ${HELD_WHERE}
    ),
    matched AS (
      SELECT
        b.booking_id,
        b.player_id,
        COALESCE(p.name, b.player_id) AS player_name,
        COALESCE(p.joined_club_at, '') AS joined_at,
        h.session_id,
        h.title AS session_title,
        h.starts_at
      FROM held h
      JOIN bookings b ON b.session_id = h.session_id
      LEFT JOIN players p ON p.player_id = b.player_id
      WHERE h.attendance_recorded = 1
        AND b.status = 'booked'
        AND b.attended = 0
    ),
    listed AS (
      SELECT * FROM matched
      WHERE ${NO_SHOW_SEARCH}
    )
  `;
}

function noShowSearchParams(q: string, timeZone: string): unknown[] {
  return searchBinds(q, (bound) => [bound, bound, bound, timeZone, bound]);
}

function toNoShowItem(row: NoShowSqlRow, timeZone: string): NoShowItem {
  return {
    bookingId: row.booking_id,
    playerId: row.player_id,
    playerName: row.player_name,
    joinedAt: row.joined_at,
    joinedOn: row.joined_at ? formatDay(row.joined_at) : "",
    sessionId: row.session_id,
    sessionTitle: row.session_title,
    startsAt: row.starts_at,
    localStart: formatLocalStart(row.starts_at, timeZone),
  };
}
