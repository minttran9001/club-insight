import { attendanceCoverage, NO_SESSIONS_IN_RANGE_TEXT } from "@/components/metricCopy";
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

export function insightListView(list: ListState): InsightListView {
  return matchListState<InsightListView>(list, {
    [OpenList.sessions]: (sessions) => ({
      headingId: "sessions-heading",
      heading: "Sessions held",
      count: String(sessions.total),
      coverage: null,
      emptyMessage: NO_SESSIONS_IN_RANGE_TEXT,
      caption: "Held sessions, most recent first",
      minWidth: "880px",
      columns: displayColumns(sessionListColumns),
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
      columns: displayColumns(playerListColumns),
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
      columns: displayColumns(noShowListColumns),
      rows: noShows.report.noShows.map((noShow) => ({ id: noShow.bookingId, cells: rowCells(noShowListColumns, noShow) })),
    }),
  });
}

function displayColumns<T>(columns: readonly PageColumn<T>[]): InsightListColumn[] {
  return columns.map((column) => ({ id: column.id, label: column.label, className: column.className }));
}

function rowCells<T>(columns: readonly PageColumn<T>[], row: T): Record<string, string> {
  return Object.fromEntries(columns.map((column) => [column.id, column.text(row)]));
}
