import { getDatabase } from "@/app/api/server/db/connection";
import type { MetricBooking } from "@/types/booking";
import type { ClubBundle, ClubRecord } from "@/types/club";
import type { PlayerRecord } from "@/types/player";
import type { SessionRecord } from "@/types/session";

type ClubRow = {
  club_id: string;
  name: string;
  time_zone: string;
  created_at: string;
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
