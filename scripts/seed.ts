import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { databasePath } from "@/app/api/server/db/connection";
import { parseCsv } from "./csv.ts";

const dataDir = path.join(process.cwd(), "src", "data");

fs.mkdirSync(path.dirname(databasePath), { recursive: true });
if (fs.existsSync(databasePath)) fs.rmSync(databasePath);

const db = new Database(databasePath);
db.exec(`
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
  CREATE INDEX sessions_club ON sessions (club_id);
  CREATE INDEX bookings_session ON bookings (session_id);
  CREATE INDEX players_club ON players (club_id);
`);

const insertClub = db.prepare(
  "INSERT INTO clubs (club_id, name, time_zone, created_at) VALUES (?, ?, ?, ?)",
);
const insertPlayer = db.prepare(
  "INSERT INTO players (player_id, club_id, name, joined_club_at) VALUES (?, ?, ?, ?)",
);
const insertSession = db.prepare(
  `INSERT INTO sessions (
    session_id, club_id, title, starts_at, duration_minutes, places, status, attendance_recorded
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
);
const insertBooking = db.prepare(
  "INSERT INTO bookings (booking_id, session_id, player_id, status, attended) VALUES (?, ?, ?, ?, ?)",
);

const clubs = parseCsv(fs.readFileSync(path.join(dataDir, "clubs.csv"), "utf8"));
const players = parseCsv(fs.readFileSync(path.join(dataDir, "players.csv"), "utf8"));
const sessions = parseCsv(fs.readFileSync(path.join(dataDir, "sessions.csv"), "utf8"));
const bookings = parseCsv(fs.readFileSync(path.join(dataDir, "bookings.csv"), "utf8"));

db.transaction(() => {
  for (const row of clubs) {
    insertClub.run(row.club_id, row.name, row.time_zone, row.created_at);
  }
  for (const row of players) {
    insertPlayer.run(row.player_id, row.club_id, row.name, row.joined_club_at);
  }
  for (const row of sessions) {
    insertSession.run(
      row.session_id,
      row.club_id,
      row.title,
      row.starts_at,
      Number(row.duration_minutes),
      Number(row.places),
      row.status,
      row.attendance_recorded === "true" ? 1 : 0,
    );
  }
  for (const row of bookings) {
    insertBooking.run(
      row.booking_id,
      row.session_id,
      row.player_id,
      row.status,
      attendedValue(row.attended),
    );
  }
})();

db.close();

function attendedValue(value: string): number | null {
  if (value === "") return null;
  if (value === "true") return 1;
  return 0;
}
