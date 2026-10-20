"use client";

import { insightListView, type InsightListRow } from "@/components/insightListView";
import { ListSkeleton } from "@/components/ListSkeleton";
import { ListTypeToggle } from "@/components/ListTypeToggle";
import { Table, type TableColumn } from "@/components/Table/Table";
import { useOpenList } from "@/hooks/useOpenList";
import { useUnrecordedSessions } from "@/hooks/useUnrecordedSessions";
import type { OpenList } from "@/types/dashboard";
import type { SortDir } from "@/types/list";
import type { ClubDateRange } from "@/types/range";

export function InsightList({
  current,
  settled,
  rangeHasSettled,
  open,
  q,
  sort,
  dir,
  page,
  onOpen,
  onQueryChange,
  onSort,
  onPage,
}: {
  current: ClubDateRange;
  settled: ClubDateRange | null;
  rangeHasSettled: boolean;
  open: OpenList;
  q: string;
  sort: string | null;
  dir: SortDir | null;
  page: number;
  onOpen: (open: OpenList) => void;
  onQueryChange: (value: string) => void;
  onSort: (columnId: string) => void;
  onPage: (page: number) => void;
}) {
  const { visibleList, listIsRefreshing, listErrorMessage } = useOpenList({ current, settled, rangeHasSettled, open, q, sort, dir, page });
  const { unrecordedSessions, unrecordedSessionsErrorMessage } = useUnrecordedSessions({ open, current, settled });
  const view = visibleList ? insightListView(visibleList) : null;
  const showEmpty = view !== null && visibleList !== null && visibleList.total === 0 && visibleList.q === "";

  return (
    <div id="insight-list" className="flex flex-col gap-4 border-t border-teal-100 pt-6">
      <ListTypeToggle value={open} onChange={onOpen} />
      {listErrorMessage ? <p role="alert">{listErrorMessage}</p> : null}
      {!listErrorMessage && !view ? <ListSkeleton /> : null}
      {view && visibleList ? (
        <section aria-labelledby={view.headingId} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <h2 id={view.headingId} className="text-lg font-semibold">
              {view.heading} <span className="text-zinc-500">{view.count}</span>
            </h2>
            {view.coverage ? <p className="text-sm text-zinc-600">{view.coverage}</p> : null}
          </div>
          {showEmpty ? (
            <p>{view.emptyMessage}</p>
          ) : (
            <Table
              className={view.className}
              rows={view.rows}
              columns={view.columns.map(
                (column): TableColumn<InsightListRow> => ({
                  id: column.id,
                  label: column.label,
                  className: column.className,
                  render: (row) => row.cells[column.id],
                }),
              )}
              caption={view.caption}
              labelledBy={view.headingId}
              getRowId={(row) => row.id}
              minWidth={view.minWidth}
              query={q}
              noMatches={visibleList.q !== "" && view.rows.length === 0}
              onQueryChange={onQueryChange}
              sort={sort}
              dir={dir}
              busy={listIsRefreshing}
              onSort={onSort}
              page={visibleList.page}
              pageSize={visibleList.pageSize}
              total={visibleList.total}
              onPage={onPage}
            />
          )}
          {unrecordedSessionsErrorMessage ? <p role="alert">{unrecordedSessionsErrorMessage}</p> : null}
          {unrecordedSessions.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 id="unrecorded-sessions-heading" className="text-base font-bold">
                Sessions where attendance was not taken
              </h3>
              <Table
                plain
                rows={unrecordedSessions}
                columns={[
                  { id: "session", label: "Session", render: (row) => row.title },
                  { id: "start", label: "Start", className: "whitespace-nowrap", render: (row) => row.localStart },
                ]}
                caption="Sessions where attendance was not taken"
                labelledBy="unrecorded-sessions-heading"
                getRowId={(row) => row.id}
                minWidth="640px"
              />
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
