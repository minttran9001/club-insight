import { getClubSync } from "@/app/api/server/db/clubs";
import { getDatabase } from "@/app/api/server/db/connection";
import { allSessionsRangeFromFirstDay, completeWeeksEnding, localDateKey } from "@/app/api/server/metrics";
import type { MetricBooking } from "@/types/booking";
import type { ClubPresets, ClubRecord } from "@/types/club";
import type { PlayerRecord } from "@/types/player";
import type { DateRange } from "@/types/range";
import type { MetricSession, SessionRecord } from "@/types/session";

type ClubBundle = {
  club: ClubRecord;
  sessions: SessionRecord[];
  bookings: MetricBooking[];
  players: PlayerRecord[];
};

type SessionRow = {
  session_id: string;
  title: string;
  starts_at: string;
  duration_minutes: number;
  places: number;
  status: string;
  attendance_recorded: number;
};

type BookingRow = {
  booking_id: string;
  session_id: string;
  player_id: string;
  status: string;
  attended: number | null;
};

type PlayerRow = {
  player_id: string;
  name: string;
  joined_club_at: string;
};

export function allSessionsRange(now: Date, timeZone: string, sessions: MetricSession[]): DateRange {
  let firstDay: string | null = null;
  for (const session of sessions) {
    const start = new Date(session.startsAt);
    if (Number.isNaN(start.getTime())) continue;
    const day = localDateKey(start, timeZone);
    if (firstDay === null || day < firstDay) firstDay = day;
  }
  return allSessionsRangeFromFirstDay(now, timeZone, firstDay);
}

export function presetRanges(now: Date, timeZone: string, sessions: MetricSession[]): ClubPresets {
  return {
    fourWeeks: completeWeeksEnding(now, timeZone, 4),
    twelveWeeks: completeWeeksEnding(now, timeZone, 12),
    all: allSessionsRange(now, timeZone, sessions),
  };
}

export function loadClubBundleSync(clubId: string): ClubBundle | null {
  const club = getClubSync(clubId);
  if (!club) return null;
  const db = getDatabase();
  const sessions = db
    .prepare<SessionRow>(
      `SELECT session_id, title, starts_at, duration_minutes, places, status, attendance_recorded
       FROM sessions WHERE club_id = ?`,
    )
    .all(clubId)
    .map(toSession);
  const bookings = db
    .prepare<BookingRow>(
      `SELECT booking_id, session_id, player_id, status, attended
       FROM bookings
       WHERE session_id IN (SELECT session_id FROM sessions WHERE club_id = ?)`,
    )
    .all(clubId)
    .map(toBooking);
  const players = db
    .prepare<PlayerRow>("SELECT player_id, name, joined_club_at FROM players WHERE club_id = ?")
    .all(clubId)
    .map(toPlayer);
  return { club, sessions, bookings, players };
}

function toSession(row: SessionRow): SessionRecord {
  return {
    id: row.session_id,
    title: row.title,
    startsAt: row.starts_at,
    durationMinutes: row.duration_minutes,
    places: row.places,
    status: row.status === "cancelled" ? "cancelled" : "scheduled",
    attendanceRecorded: row.attendance_recorded === 1,
  };
}

function toBooking(row: BookingRow): MetricBooking {
  return {
    id: row.booking_id,
    sessionId: row.session_id,
    playerId: row.player_id,
    status: row.status === "booked" ? "booked" : "cancelled",
    attended: row.attended === null ? null : row.attended === 1,
  };
}

function toPlayer(row: PlayerRow): PlayerRecord {
  return {
    id: row.player_id,
    name: row.name,
    joinedAt: row.joined_club_at,
  };
}
