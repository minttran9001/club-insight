import assert from "node:assert/strict";
import { test } from "node:test";
import { sessionListColumns } from "@/domain/listColumns";
import { foldSearchText } from "@/app/api/server/foldSearchText";
import { allSessionsRangeFromFirstDay, completeWeeksEnding, FIXED_NOW, presetRanges } from "@/app/api/server/metrics";
import type { ParsedListQuery } from "@/types/list";
import { earliestSessionDayByClub, loadClubBundleSync } from "@/app/api/server/db/clubs";
import { queryDashboard } from "@/app/api/server/db/dashboard";
import { queryActivePlayers, queryNoShows, querySessions, queryUnrecordedSessions } from "@/app/api/server/db/lists";
import { viSortKey } from "@/app/api/server/db/sortKey";
import type { SessionListItem } from "@/types/session";

const wide: ParsedListQuery = { q: "", sort: null, dir: "asc", page: 1, pageSize: 500 };

test("dashboard counts match the lists for the same range", () => {
  const club = bundle("club-001");
  const ranges = [
    completeWeeksEnding(FIXED_NOW, club.club.timeZone, 4),
    completeWeeksEnding(FIXED_NOW, club.club.timeZone, 12),
    { from: "2026-02-16", to: "2026-02-22" },
    { from: "2026-10-04", to: "2026-10-04" },
    { from: "2026-10-06", to: "2026-10-12" },
    { from: "2025-12-01", to: "2025-12-07" },
  ];
  for (const range of ranges) {
    const dashboard = queryDashboard(club.club, range);
    const sessions = querySessions(club.club, range, wide);
    const players = queryActivePlayers(club.club, range, wide);
    const noShows = queryNoShows(club.club, range, wide);
    assert.equal(dashboard.sessionsHeld.value, sessions.total, range.from);
    assert.equal(dashboard.activePlayers.value, players.total, range.from);
    assert.equal(dashboard.noShows.kind, noShows.kind, range.from);
    assert.equal(dashboard.noShows.attendanceTaken, noShows.attendanceTaken, range.from);
    assert.equal(dashboard.noShows.heldSessions, noShows.heldSessions, range.from);
    assert.equal(dashboard.noShows.value, noShows.kind === "count" ? noShows.total : null, range.from);
    const unrecorded = queryUnrecordedSessions(club.club, range).map((session) => session.id);
    assert.deepEqual(
      unrecorded,
      sessions.rows.filter((session) => !session.attendanceRecorded).map((session) => session.id),
      range.from,
    );
  }

  const empty = bundle("club-002");
  const four = completeWeeksEnding(FIXED_NOW, empty.club.timeZone, 4);
  const emptyDashboard = queryDashboard(empty.club, four);
  assert.equal(emptyDashboard.hasHeldSession, false);
  assert.equal(emptyDashboard.sessionsHeld.value, 0);
  assert.ok(emptyDashboard.weeks.length > 0);
  assert.ok(emptyDashboard.weeks.every((week) => week.count === 0));
});

test("sql lists keep one total across pages and apply search and sort", () => {
  const club = bundle("club-001");
  const range = completeWeeksEnding(FIXED_NOW, club.club.timeZone, 4);
  const sessions = querySessions(club.club, range, wide);
  const first = querySessions(club.club, range, { q: "", sort: null, dir: "asc", page: 1, pageSize: 10 });
  const second = querySessions(club.club, range, { q: "", sort: null, dir: "asc", page: 2, pageSize: 10 });
  assert.equal(first.total, sessions.total);
  assert.equal(second.total, sessions.total);
  assert.equal(new Set([...first.rows, ...second.rows].map((row) => row.id)).size, first.rows.length + second.rows.length);

  const sample = sessions.rows[0]?.title ?? "";
  const searched = querySessions(club.club, range, { q: sample, sort: null, dir: "asc", page: 1, pageSize: 10 });
  assert.ok(sample !== "");
  assert.ok(searched.total > 0);
  assert.ok(searched.total <= sessions.total);
  assert.ok(searched.rows.every((row) => matchesQuery(row, sample)));
  assert.ok(querySessions(club.club, range, { q: "%", sort: null, dir: "asc", page: 1, pageSize: 10 }).total < sessions.total);
  assert.ok(querySessions(club.club, range, { q: "_", sort: null, dir: "asc", page: 1, pageSize: 10 }).total < sessions.total);

  const byTitle = querySessions(club.club, range, { q: "", sort: "title", dir: "desc", page: 1, pageSize: 10 });
  const titleKeys = byTitle.rows.map((row) => viSortKey(row.title, "base"));
  assert.deepEqual(titleKeys, [...titleKeys].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0)));

  const byAttended = querySessions(club.club, range, { q: "", sort: "attended", dir: "asc", page: 1, pageSize: 20 });
  let seenNull = false;
  let previous = -1;
  for (const row of byAttended.rows) {
    if (row.attended === null) {
      seenNull = true;
      continue;
    }
    assert.equal(seenNull, false);
    assert.ok(row.attended >= previous);
    previous = row.attended;
  }

  const players = queryActivePlayers(club.club, range, wide);
  const playerName = players.rows[0]?.name ?? "";
  const named = queryActivePlayers(club.club, range, { q: playerName, sort: null, dir: "asc", page: 1, pageSize: 10 });
  assert.ok(playerName !== "");
  assert.ok(named.total > 0);
  assert.ok(named.total <= players.total);
  const byName = queryActivePlayers(club.club, range, { q: "", sort: "name", dir: "asc", page: 1, pageSize: 10 });
  const nameKeys = byName.rows.map((row) => viSortKey(row.name, "base"));
  assert.deepEqual(nameKeys, [...nameKeys].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0)));
});

test("the all preset uses the earliest session day from sql", () => {
  const firstDays = earliestSessionDayByClub();
  for (const clubId of ["club-001", "club-002"]) {
    const club = bundle(clubId);
    const expected = presetRanges(FIXED_NOW, club.club.timeZone, club.sessions);
    assert.deepEqual(
      allSessionsRangeFromFirstDay(FIXED_NOW, club.club.timeZone, firstDays.get(clubId) ?? null),
      expected.all,
    );
  }
});

function bundle(clubId: string) {
  const loaded = loadClubBundleSync(clubId);
  assert.ok(loaded, clubId);
  return loaded;
}

function matchesQuery(row: SessionListItem, q: string): boolean {
  const needle = foldSearchText(q.trim());
  return sessionListColumns.some((column) => foldSearchText(column.text(row)).includes(needle));
}
