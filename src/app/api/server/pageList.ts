import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/domain/pageList";
import type { ListQueryFields, PageListFailure, ParsedListQuery, SortDir } from "@/types/list";

const pageError = "page must be an integer greater than or equal to 1.";
const pageSizeError = `pageSize must be an integer from 1 through ${MAX_PAGE_SIZE}.`;

export function parseListQuery(input: ListQueryFields, allowedSorts: readonly string[]): { ok: true; query: ParsedListQuery } | PageListFailure {
  const page = readOptionalInt(input.page, 1, (value) => value >= 1, pageError);
  if (typeof page !== "number") return page;
  const pageSize = readOptionalInt(input.pageSize, DEFAULT_PAGE_SIZE, (value) => value >= 1 && value <= MAX_PAGE_SIZE, pageSizeError);
  if (typeof pageSize !== "number") return pageSize;

  const sort = blank(input.sort) ? null : input.sort;
  const dirRaw = blank(input.dir) ? null : input.dir;
  if (dirRaw !== null && sort === null) return { ok: false, error: "dir requires sort." };
  if (sort !== null && !allowedSorts.includes(sort)) return { ok: false, error: "sort is not a column on this list." };
  if (dirRaw !== null && dirRaw !== "asc" && dirRaw !== "desc") return { ok: false, error: "dir must be asc or desc." };

  return {
    ok: true,
    query: {
      q: input.q ?? "",
      sort,
      dir: dirRaw === "desc" ? "desc" : "asc",
      page,
      pageSize,
    },
  };
}

export function echoedListQuery(query: ParsedListQuery): { q: string; sort: string | null; dir: SortDir | null } {
  return { q: query.q, sort: query.sort, dir: query.sort ? query.dir : null };
}

function readOptionalInt(
  value: string | null,
  fallback: number,
  valid: (parsed: number) => boolean,
  error: string,
): number | PageListFailure {
  if (blank(value)) return fallback;
  if (!/^(0|[1-9]\d*)$/.test(value)) return { ok: false, error };
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || !valid(parsed)) return { ok: false, error };
  return parsed;
}

function blank(value: string | null): value is null | "" {
  return value === null || value === "";
}
