import { request } from "@/apiClient/client";
import { listSearchParams, readPagedClubResponse, type PagedClubFields } from "@/apiClient/helpers";
import type { ListRequest } from "@/types/dashboard";
import type { ClubDateRange } from "@/types/range";

export async function fetchPagedList<T extends Record<string, unknown>>(
  scope: ClubDateRange,
  path: string,
  list: ListRequest,
  signal: AbortSignal | undefined,
  readExtra: (record: Record<string, unknown>, message: string) => T,
): Promise<ClubDateRange & PagedClubFields & T> {
  const body = await request.get(`/api/clubs/${encodeURIComponent(scope.clubId)}/${path}`, listSearchParams(scope, list), { signal });
  const message = "Could not load this list.";
  const { record, ...page } = readPagedClubResponse(body, message);
  return { ...page, ...readExtra(record, message) };
}
