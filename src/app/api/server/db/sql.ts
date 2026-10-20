import { foldSearchText } from "@/app/api/server/foldSearchText";
import { FIXED_NOW } from "@/app/api/server/metrics";
import type { ParsedListQuery, SortDir } from "@/types/list";
import type { DateRange } from "@/types/range";
import { getDatabase } from "@/app/api/server/db/connection";

export const NOW_ISO = FIXED_NOW.toISOString();
export const LIKE = "LIKE ? ESCAPE '\\'";

export const HELD_WHERE = `
  s.club_id = ?
  AND s.status != 'cancelled'
  AND datetime(s.starts_at) <= datetime(?)
  AND local_day(s.starts_at, ?) >= ?
  AND local_day(s.starts_at, ?) <= ?
`;

export type SortColumn = { expr: string; nullable: boolean };

type CountRow = { total: number };

export function heldParams(clubId: string, timeZone: string, range: DateRange): unknown[] {
  return [clubId, NOW_ISO, timeZone, range.from, timeZone, range.to];
}

function likePattern(q: string): string | null {
  const folded = foldSearchText(q.trim());
  if (folded === "") return null;
  return `%${folded.replace(/[\\%_]/g, (char) => `\\${char}`)}%`;
}

export function searchBinds(q: string, slots: (bound: string) => unknown[]): unknown[] {
  const like = likePattern(q);
  return [like === null ? 0 : 1, ...slots(like ?? "%")];
}

export function pageListed<Row>(ctes: string, order: string, params: unknown[], query: ParsedListQuery): { total: number; rows: Row[] } {
  return {
    total: count(`WITH ${ctes} SELECT COUNT(*) AS total FROM listed`, params),
    rows: getDatabase()
      .prepare<Row>(`WITH ${ctes} SELECT * FROM listed ORDER BY ${order} LIMIT ? OFFSET ?`)
      .all(...params, query.pageSize, offset(query)),
  };
}

export function orderSql(sort: string | null, dir: SortDir, columns: Record<string, SortColumn>, tie: string): string {
  if (sort === null) return tie;
  const column = columns[sort];
  if (!column) return tie;
  const direction = dir === "desc" ? "DESC" : "ASC";
  const primary = column.nullable ? `(${column.expr} IS NULL), ${column.expr} ${direction}` : `${column.expr} ${direction}`;
  return `${primary}, ${tie}`;
}

export function count(sql: string, params: unknown[]): number {
  return getDatabase().prepare<CountRow>(sql).get(...params)?.total ?? 0;
}

function offset(query: ParsedListQuery): number {
  return (query.page - 1) * query.pageSize;
}
