"use client";

import { useRef, type ReactNode } from "react";
import { useVirtualRows } from "@/components/Table/useVirtualRows";
import { rowHeightPx, virtualizeAfter } from "@/components/Table/virtualRange";
import { controlClass } from "@/constants/controlClass";
import { Button } from "../Button";

const pagerButton = `${controlClass} disabled:cursor-not-allowed disabled:opacity-50`;

export type TableColumn<T> = {
  id: string;
  label: ReactNode;
  render: (row: T) => ReactNode;
  className?: string;
};

type TableProps<T> = {
  className?: string;
  rows: T[];
  columns: readonly TableColumn<T>[];
  caption: string;
  labelledBy?: string;
  getRowId: (row: T) => string | number;
  minWidth?: string;
  plain?: boolean;
  query?: string;
  onQueryChange?: (value: string) => void;
  sort?: string | null;
  dir?: string | null;
  onSort?: (columnId: string) => void;
  page?: number;
  pageSize?: number;
  total?: number;
  onPage?: (page: number) => void;
  noMatches?: boolean;
  busy?: boolean;
  allowSearch?: boolean;
};

export function Table<T>(props: TableProps<T>) {
  if (props.plain) return <PlainTable {...props} />;
  return <PagedTable {...props} />;
}

function PagedTable<T>(props: TableProps<T>) {
  const {
    rows,
    columns,
    caption,
    labelledBy,
    getRowId,
    minWidth = "720px",
    query = "",
    onQueryChange,
    sort = null,
    dir = null,
    onSort,
    page = 1,
    pageSize = 10,
    total = 0,
    onPage,
    noMatches = false,
    busy = false,
    className,
    allowSearch = false,
  } = props;
  const showPager = total > 0 && onPage !== undefined;
  const rangeStart = (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  return (
    <div className={`flex flex-col gap-4 ${className ?? ""}`}>
      {allowSearch ? (
        <div className="max-w-lg">
          <label className="flex flex-col gap-1 text-sm font-medium">
            Search
            <input className={controlClass} type="search" value={query} onChange={(event) => onQueryChange?.(event.target.value)} />
          </label>
        </div>
      ) : null}
      <ScrollingRows
        rows={rows}
        columns={columns}
        caption={caption}
        labelledBy={labelledBy}
        getRowId={getRowId}
        minWidth={minWidth}
        sort={sort}
        dir={dir}
        onSort={onSort}
        noMatches={noMatches}
        busy={busy}
      />
      {showPager ? (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" className={pagerButton} onClick={() => onPage(page - 1)} disabled={page <= 1}>
            Previous
          </Button>
          <Button type="button" variant="secondary" className={pagerButton} onClick={() => onPage(page + 1)} disabled={pageSize <= 0 || page * pageSize >= total}>
            Next
          </Button>
          <p className="text-sm tabular-nums text-zinc-600">
            {rangeStart}–{rangeEnd} of {total}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function PlainTable<T>(props: TableProps<T>) {
  const { rows, columns, caption, labelledBy, getRowId, minWidth = "720px", className } = props;

  return (
    <ScrollingRows
      rows={rows}
      columns={columns}
      caption={caption}
      labelledBy={labelledBy}
      getRowId={getRowId}
      minWidth={minWidth}
      className={className}
    />
  );
}

function ScrollingRows<T>({
  rows,
  columns,
  caption,
  labelledBy,
  getRowId,
  minWidth,
  sort = null,
  dir = null,
  onSort,
  noMatches = false,
  busy = false,
  className,
}: {
  rows: readonly T[];
  columns: readonly TableColumn<T>[];
  caption: string;
  labelledBy?: string;
  getRowId: (row: T) => string | number;
  minWidth: string;
  sort?: string | null;
  dir?: string | null;
  onSort?: (columnId: string) => void;
  noMatches?: boolean;
  busy?: boolean;
  className?: string;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtual = !noMatches && rows.length > virtualizeAfter;
  const range = useVirtualRows(virtual ? rows.length : 0, scrollRef);
  const start = virtual ? range.start : 0;
  const end = virtual ? range.end : rows.length;

  return (
    <div
      ref={scrollRef}
      className={`overflow-auto rounded-lg border border-teal-100 bg-white ${virtual ? "max-h-[28rem]" : ""} ${className ?? ""}`}
      aria-busy={busy}
    >
      <DataTable
        rows={rows.slice(start, end)}
        rowCount={rows.length}
        indexOffset={start}
        padBefore={start * rowHeightPx}
        padAfter={(rows.length - end) * rowHeightPx}
        columns={columns}
        caption={caption}
        labelledBy={labelledBy}
        getRowId={getRowId}
        minWidth={minWidth}
        sort={sort}
        dir={dir}
        onSort={onSort}
        noMatches={noMatches}
      />
    </div>
  );
}

function DataTable<T>({
  rows,
  rowCount,
  indexOffset,
  padBefore,
  padAfter,
  columns,
  caption,
  labelledBy,
  getRowId,
  minWidth,
  sort = null,
  dir = null,
  onSort,
  noMatches = false,
}: {
  rows: readonly T[];
  rowCount: number;
  indexOffset: number;
  padBefore: number;
  padAfter: number;
  columns: readonly TableColumn<T>[];
  caption: string;
  labelledBy?: string;
  getRowId: (row: T) => string | number;
  minWidth: string;
  sort?: string | null;
  dir?: string | null;
  onSort?: (columnId: string) => void;
  noMatches?: boolean;
}) {
  const sortable = onSort !== undefined;

  return (
    <table
      className="w-full border-collapse text-left text-sm"
      style={{ minWidth }}
      aria-labelledby={labelledBy}
      aria-rowcount={padBefore > 0 || padAfter > 0 ? rowCount + 1 : undefined}
    >
      <caption className="sr-only">{caption}</caption>
      <thead>
        <tr className="text-teal-900">
          {columns.map((column) => {
            const sorted = sort === column.id;
            let ariaSort: "ascending" | "descending" | "none" | undefined;
            if (sortable) ariaSort = sorted ? (dir === "desc" ? "descending" : "ascending") : "none";
            return (
              <th
                key={column.id}
                scope="col"
                aria-sort={ariaSort}
                className="sticky top-0 z-10 border-b border-teal-100 bg-teal-50 px-3 py-2 font-medium"
              >
                {sortable ? (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 text-left font-medium text-teal-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    onClick={() => onSort(column.id)}
                  >
                    {column.label}
                    {sorted ? <span aria-hidden="true">{dir === "desc" ? "↓" : "↑"}</span> : null}
                  </button>
                ) : (
                  column.label
                )}
              </th>
            );
          })}
        </tr>
      </thead>
      <tbody>
        {noMatches ? (
          <tr>
            <td colSpan={columns.length} className="px-3 py-4">
              No matches.
            </td>
          </tr>
        ) : (
          <>
            {padBefore > 0 ? <SpacerRow colSpan={columns.length} height={padBefore} /> : null}
            {rows.map((row, index) => {
              const rowIndex = indexOffset + index;
              return (
                <tr key={getRowId(row)} className={`h-10 border-b border-sky-50 ${rowIndex % 2 === 0 ? "bg-white" : "bg-sky-50/70"}`}>
                  {columns.map((column) => (
                    <td key={column.id} className={`h-10 max-w-60 truncate px-3 align-middle ${column.className ?? ""}`}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              );
            })}
            {padAfter > 0 ? <SpacerRow colSpan={columns.length} height={padAfter} /> : null}
          </>
        )}
      </tbody>
    </table>
  );
}

function SpacerRow({ colSpan, height }: { colSpan: number; height: number }) {
  return (
    <tr aria-hidden="true" style={{ height }}>
      <td colSpan={colSpan} className="border-0 p-0" />
    </tr>
  );
}
