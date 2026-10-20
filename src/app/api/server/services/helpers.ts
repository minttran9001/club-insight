import { connection } from "next/server";
import { echoedListQuery } from "@/app/api/server/pageList";
import { getClubSync } from "@/app/api/server/db/clubs";
import type { ClubRecord } from "@/types/club";
import type { ParsedListQuery } from "@/types/list";
import type { ClubDateQuery, DateRange } from "@/types/range";

export type ServiceFailure = {
  ok: false;
  status: 400 | 404;
  error: string;
};

export type ServiceResult<T> = { ok: true; data: T } | ServiceFailure;

export type ResolvedClub = {
  club: ClubRecord;
  from: string;
  to: string;
};

const invalidRange: ServiceFailure = {
  ok: false,
  status: 400,
  error: "from and to must be inclusive YYYY-MM-DD dates, with from on or before to.",
};

export function parseDateRange(
  from: string | null,
  to: string | null,
): { ok: true; from: string; to: string } | { ok: false } {
  if (!from || !to || !isRealDate(from) || !isRealDate(to) || from > to) {
    return { ok: false };
  }
  return { ok: true, from, to };
}

export async function resolveClub(scope: ClubDateQuery): Promise<{ ok: true } & ResolvedClub | ServiceFailure> {
  const range = parseDateRange(scope.from, scope.to);
  if (!range.ok) return invalidRange;
  await connection();
  const club = getClubSync(scope.clubId);
  if (!club) return { ok: false, status: 404, error: "Unknown club." };
  return { ok: true, club, from: range.from, to: range.to };
}

export async function withResolvedClub<T>(
  scope: ClubDateQuery,
  load: (club: ClubRecord, range: DateRange) => T,
): Promise<ServiceResult<T>> {
  const resolved = await resolveClub(scope);
  if (!resolved.ok) return resolved;
  return { ok: true, data: load(resolved.club, { from: resolved.from, to: resolved.to }) };
}

export function listResponse<T extends Record<string, unknown>>(
  clubId: string,
  range: DateRange,
  query: ParsedListQuery,
  total: number,
  body: T,
): {
  clubId: string;
  range: DateRange;
  page: number;
  pageSize: number;
  total: number;
  q: string;
  sort: string | null;
  dir: "asc" | "desc" | null;
} & T {
  return {
    clubId,
    range,
    page: query.page,
    pageSize: query.pageSize,
    total,
    ...echoedListQuery(query),
    ...body,
  };
}

function isRealDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
