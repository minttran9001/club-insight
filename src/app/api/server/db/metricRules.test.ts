import assert from "node:assert/strict";
import { test } from "node:test";
import { clubHasNotHeldSession } from "@/app/api/server/metrics";
import { noSessionsInRange } from "@/components/metricCopy";
import type { ParsedListQuery } from "@/types/list";
import type { ClubRecord } from "@/types/club";
import { openDatabase, withDatabase } from "@/app/api/server/db/connection";
import { queryDashboard } from "@/app/api/server/db/dashboard";
import { queryActivePlayers, queryNoShows, querySessions, queryUnrecordedSessions } from "@/app/api/server/db/lists";

const club: ClubRecord = {
  id: "club-rule",
  name: "Rule Club",
  timeZone: "Asia/Ho_Chi_Minh",
  createdAt: "2026-09-01",
};

const list: ParsedListQuery = { q: "", sort: null, dir: "asc", page: 1, pageSize: 20 };

test("a kept absence on a recorded held session is a no-show, and that player is not active", () => {
  const report = scenario(
    [
      session("s1", "2026-10-01T02:00:00.000Z", "scheduled", true),
      player("p1", "Ada", "2026-01-01"),
      player("p2", "Bea", "2026-02-01"),
      booking("b1", "s1", "p1", "booked", 0),
      booking("b2", "s1", "p2", "booked", 1),
    ],
    "2026-10-01",
    "2026-10-01",
  );

  assert.equal(report.dashboard.sessionsHeld.value, 1);
  assert.equal(report.dashboard.noShows.kind, "count");
  assert.equal(report.dashboard.noShows.value, 1);
  assert.deepEqual(report.players.rows.map((row) => row.id), ["p2"]);
  assert.equal(report.noShows.total, 1);
  assert.equal(report.noShows.rows[0]?.playerId, "p1");
});

test("a kept booking on an unrecorded session counts as active and leaves no-shows unknown", () => {
  const report = scenario(
    [
      session("s1", "2026-10-02T02:00:00.000Z", "scheduled", false),
      player("p1", "Ada", "2026-01-01"),
      booking("b1", "s1", "p1", "booked", null),
    ],
    "2026-10-02",
    "2026-10-02",
  );

  assert.equal(report.dashboard.noShows.kind, "unknown");
  assert.equal(report.dashboard.noShows.value, null);
  assert.deepEqual(report.players.rows.map((row) => row.id), ["p1"]);
  assert.equal(report.noShows.total, 0);
});

test("a cancelled booking is not a no-show", () => {
  const report = scenario(
    [
      session("s1", "2026-10-01T02:00:00.000Z", "scheduled", true),
      player("p1", "Ada", "2026-01-01"),
      booking("b1", "s1", "p1", "cancelled", 0),
    ],
    "2026-10-01",
    "2026-10-01",
  );

  assert.equal(report.dashboard.noShows.kind, "count");
  assert.equal(report.dashboard.noShows.value, 0);
  assert.equal(report.players.total, 0);
});

test("a cancelled session and a session after now are not held", () => {
  const report = scenario(
    [
      session("cancelled", "2026-10-01T02:00:00.000Z", "cancelled", true),
      session("later", "2026-10-05T02:00:01.000Z", "scheduled", true),
      player("p1", "Ada", "2026-01-01"),
      booking("b1", "cancelled", "p1", "booked", 0),
      booking("b2", "later", "p1", "booked", 0),
    ],
    "2026-10-01",
    "2026-10-05",
  );

  assert.equal(report.dashboard.sessionsHeld.value, 0);
  assert.equal(report.dashboard.noShows.kind, "no-sessions");
  assert.equal(report.sessions.total, 0);
});

test("a session counts on its club-local day when it has already started", () => {
  const report = scenario(
    [session("s1", "2026-10-04T17:00:00.000Z", "scheduled", true)],
    "2026-10-05",
    "2026-10-05",
  );
  const previousDay = scenario(
    [session("s1", "2026-10-04T17:00:00.000Z", "scheduled", true)],
    "2026-10-04",
    "2026-10-04",
  );

  assert.equal(report.dashboard.sessionsHeld.value, 1);
  assert.equal(previousDay.dashboard.sessionsHeld.value, 0);
});

test("unrecorded sessions are the held sessions without attendance, latest first", () => {
  const report = scenario(
    [
      session("early", "2026-10-01T02:00:00.000Z", "scheduled", false, "Early"),
      session("recorded", "2026-10-02T02:00:00.000Z", "scheduled", true, "Recorded"),
      session("later", "2026-10-03T02:00:00.000Z", "scheduled", false, "Later"),
    ],
    "2026-10-01",
    "2026-10-04",
  );

  assert.deepEqual(
    report.unrecorded.map((row) => row.id),
    ["later", "early"],
  );
});

test("a club that has never held a session still draws a zero for each week", () => {
  const report = scenario([], "2026-09-07", "2026-09-20");

  assert.equal(report.dashboard.hasHeldSession, false);
  assert.equal(report.dashboard.message, clubHasNotHeldSession(club.name, club.createdAt));
  assert.equal(report.dashboard.showChart, true);
  assert.deepEqual(
    report.dashboard.weeks.map((week) => week.count),
    [0, 0],
  );
});

test("a range with no held sessions says so when the club has held one before", () => {
  const report = scenario(
    [session("earlier", "2026-09-01T02:00:00.000Z", "scheduled", true)],
    "2026-10-01",
    "2026-10-04",
  );

  assert.equal(report.dashboard.hasHeldSession, true);
  assert.equal(report.dashboard.sessionsHeld.value, 0);
  assert.equal(report.dashboard.message, noSessionsInRange);
  assert.equal(report.dashboard.noShows.kind, "no-sessions");
});

function scenario(rows: Fixture[], from: string, to: string) {
  const db = openDatabase(":memory:");
  db.exec(SCHEMA);
  const insertClub = db.prepare("INSERT INTO clubs (club_id, name, time_zone, created_at) VALUES (?, ?, ?, ?)");
  const insertPlayer = db.prepare("INSERT INTO players (player_id, club_id, name, joined_club_at) VALUES (?, ?, ?, ?)");
  const insertSession = db.prepare(
    `INSERT INTO sessions (session_id, club_id, title, starts_at, duration_minutes, places, status, attendance_recorded)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
  );
  const insertBooking = db.prepare(
    "INSERT INTO bookings (booking_id, session_id, player_id, status, attended) VALUES (?, ?, ?, ?, ?)",
  );
  insertClub.run(club.id, club.name, club.timeZone, club.createdAt);
  for (const row of rows) {
    if (row.kind === "player") insertPlayer.run(row.id, club.id, row.name, row.joinedAt);
    if (row.kind === "session") {
      insertSession.run(row.id, club.id, row.title, row.startsAt, 60, 4, row.status, row.attendanceRecorded ? 1 : 0);
    }
    if (row.kind === "booking") insertBooking.run(row.id, row.sessionId, row.playerId, row.status, row.attended);
  }
  const range = { from, to };
  return withDatabase(db, () => ({
    dashboard: queryDashboard(club, range),
    sessions: querySessions(club, range, list),
    players: queryActivePlayers(club, range, list),
    noShows: queryNoShows(club, range, list),
    unrecorded: queryUnrecordedSessions(club, range),
  }));
}

type Fixture = ReturnType<typeof player> | ReturnType<typeof session> | ReturnType<typeof booking>;

function player(id: string, name: string, joinedAt: string) {
  return { kind: "player" as const, id, name, joinedAt };
}

function session(id: string, startsAt: string, status: string, attendanceRecorded: boolean, title = id) {
  return { kind: "session" as const, id, startsAt, status, attendanceRecorded, title };
}

function booking(id: string, sessionId: string, playerId: string, status: string, attended: number | null) {
  return { kind: "booking" as const, id, sessionId, playerId, status, attended };
}

const SCHEMA = `
  CREATE TABLE clubs (
    club_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    time_zone TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE players (
    player_id TEXT PRIMARY KEY,
    club_id TEXT NOT NULL,
    name TEXT NOT NULL,
    joined_club_at TEXT NOT NULL
  );
  CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,
    club_id TEXT NOT NULL,
    title TEXT NOT NULL,
    starts_at TEXT NOT NULL,
    duration_minutes INTEGER NOT NULL,
    places INTEGER NOT NULL,
    status TEXT NOT NULL,
    attendance_recorded INTEGER NOT NULL
  );
  CREATE TABLE bookings (
    booking_id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    player_id TEXT NOT NULL,
    status TEXT NOT NULL,
    attended INTEGER
  );
`;
