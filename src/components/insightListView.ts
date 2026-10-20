import { attendanceCoverage } from "@/components/metricCopy";
import { noShowListColumns, playerListColumns, sessionListColumns } from "@/domain/listColumns";
import { matchListState } from "@/domain/matchOpenList";
import { OpenList, type ListState } from "@/types/dashboard";
import type { PageColumn } from "@/types/list";
import { noShowCountLabel, noShowListEmptyCopy } from "@/utils/noShowListEmptyCopy";

export type InsightListColumn = {
  id: string;
  label: string;
  className?: string;
};

export type InsightListRow = {
  id: string;
  cells: Record<string, string>;
};

export type InsightListView = {
  headingId: string;
  heading: string;
  count: string;
  coverage: string | null;
  emptyMessage: string;
  caption: string;
  minWidth?: string;
  className?: string;
  columns: InsightListColumn[];
  rows: InsightListRow[];
};

const sessionLabels: Record<string, string> = {
  title: "Title",
  start: "Start",
  duration: "Duration",
  places: "Places",
  kept: "Kept bookings",
  cancelled: "Cancelled bookings",
  attended: "Attended",
  noshows: "No-shows",
  attendance: "Attendance",
};

const sessionClassNames: Record<string, string> = {
  start: "whitespace-nowrap",
  duration: "tabular-nums",
  places: "tabular-nums",
  kept: "tabular-nums",
  cancelled: "tabular-nums",
};

const playerLabels: Record<string, string> = {
  name: "Name",
  joined: "Joined",
  attended: "Sessions attended",
  unrecorded: "Unrecorded sessions",
  noshows: "Confirmed no-shows",
};

const playerClassNames: Record<string, string> = {
  joined: "whitespace-nowrap",
  attended: "tabular-nums",
  unrecorded: "tabular-nums",
  noshows: "tabular-nums",
};

const noShowLabels: Record<string, string> = {
  player: "Player",
  joined: "Joined",
  session: "Session",
  start: "Start",
};

const noShowClassNames: Record<string, string> = {
  joined: "whitespace-nowrap",
  start: "whitespace-nowrap",
};

export function insightListView(list: ListState): InsightListView {
  return matchListState<InsightListView>(list, {
    [OpenList.sessions]: (sessions) => ({
      headingId: "sessions-heading",
      heading: "Sessions held",
      count: String(sessions.total),
      coverage: null,
      emptyMessage: "No sessions in this range.",
      caption: "Held sessions, most recent first",
      minWidth: "880px",
      columns: displayColumns(sessionListColumns, sessionLabels, sessionClassNames),
      rows: sessions.sessions.map((session) => ({ id: session.id, cells: rowCells(sessionListColumns, session) })),
    }),
    [OpenList.players]: (players) => ({
      headingId: "players-heading",
      heading: "Active players",
      count: String(players.total),
      coverage: null,
      emptyMessage: "No active players in this range.",
      caption: "Active players, busiest first",
      minWidth: "720px",
      columns: displayColumns(playerListColumns, playerLabels, playerClassNames),
      rows: players.players.map((player) => ({ id: player.id, cells: rowCells(playerListColumns, player) })),
    }),
    [OpenList.noShows]: (noShows) => ({
      headingId: "noshows-heading",
      heading: "No-shows",
      count: noShowCountLabel(noShows.report.kind, noShows.report.kind === "count" ? noShows.total : null),
      coverage: attendanceCoverage(noShows.report.attendanceTaken, noShows.report.heldSessions),
      emptyMessage: noShowListEmptyCopy(noShows.report.kind),
      caption: "No-shows, latest session first",
      minWidth: "640px",
      columns: displayColumns(noShowListColumns, noShowLabels, noShowClassNames),
      rows: noShows.report.noShows.map((noShow) => ({ id: noShow.bookingId, cells: rowCells(noShowListColumns, noShow) })),
    }),
  });
}

function displayColumns<T>(columns: readonly PageColumn<T>[], labels: Record<string, string>, classNames: Record<string, string>): InsightListColumn[] {
  return columns.map((column) => ({
    id: column.id,
    label: labels[column.id] ?? column.id,
    className: classNames[column.id],
  }));
}

function rowCells<T>(columns: readonly PageColumn<T>[], row: T): Record<string, string> {
  return Object.fromEntries(columns.map((column) => [column.id, column.text(row)]));
}
