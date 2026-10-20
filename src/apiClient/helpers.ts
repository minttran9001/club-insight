import { APIError } from "@/apiClient/apiError";
import type { SortDir } from "@/types/list";
import type { DateRange } from "@/types/range";

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function invalidResponse(message: string): APIError {
  return new APIError("invalid-response", message);
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isNullableNumber(value: unknown): value is number | null {
  return value === null || isNumber(value);
}

export function readItems<T>(
  record: Record<string, unknown>,
  key: string,
  read: (value: unknown) => T | null,
  message: string,
): T[] {
  const value = record[key];
  if (!Array.isArray(value)) throw invalidResponse(message);
  const items: T[] = [];
  for (const item of value) {
    const parsed = read(item);
    if (parsed === null) throw invalidResponse(message);
    items.push(parsed);
  }
  return items;
}

export function readPageFields(
  record: Record<string, unknown>,
  message: string,
): PagedClubFields {
  if (!isWholeNumber(record.page) || !isWholeNumber(record.pageSize) || !isWholeNumber(record.total)) {
    throw invalidResponse(message);
  }
  const sort = record.sort === null ? null : record.sort;
  const dir = record.dir === null ? null : record.dir;
  if (typeof record.q !== "string" || (sort !== null && typeof sort !== "string")) throw invalidResponse(message);
  if (dir !== null && dir !== "asc" && dir !== "desc") throw invalidResponse(message);
  if ((sort === null) !== (dir === null)) throw invalidResponse(message);
  return { page: record.page, pageSize: record.pageSize, total: record.total, q: record.q, sort, dir };
}

function isWholeNumber(value: unknown): value is number {
  return isNumber(value) && Number.isInteger(value) && value >= 0;
}

export function listSearchParams(
  range: DateRange,
  query: { q: string; sort: string | null; dir: SortDir | null; page: number; pageSize: number },
): Record<string, string> {
  const params: Record<string, string> = {
    from: range.from,
    to: range.to,
    page: String(query.page),
    pageSize: String(query.pageSize),
  };
  if (query.q !== "") params.q = query.q;
  if (query.sort) params.sort = query.sort;
  if (query.dir) params.dir = query.dir;
  return params;
}

export type PagedClubFields = {
  page: number;
  pageSize: number;
  total: number;
  q: string;
  sort: string | null;
  dir: SortDir | null;
};

export function readPagedClubResponse(body: unknown, message: string): { clubId: string; from: string; to: string; record: Record<string, unknown> } & PagedClubFields {
  const ranged = readClubRange(body);
  return { ...ranged, ...readPageFields(ranged.record, message) };
}

export function readClubRange(body: unknown): { clubId: string; from: string; to: string; record: Record<string, unknown> } {
  if (!isRecord(body)) throw invalidResponse("Invalid response");
  const range = isRecord(body.range) ? body.range : null;
  if (typeof body.clubId !== "string" || !range || typeof range.from !== "string" || typeof range.to !== "string") {
    throw invalidResponse("Invalid response");
  }
  return { clubId: body.clubId, from: range.from, to: range.to, record: body };
}
