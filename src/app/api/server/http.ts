import type { NextRequest } from "next/server";
import { parseListQuery } from "@/app/api/server/pageList";
import type { ListQueryFields, ParsedListQuery } from "@/types/list";
import type { ClubDateQuery } from "@/types/range";
import type { ServiceResult } from "@/app/api/server/services/helpers";

export function jsonResult<T>(result: ServiceResult<T>): Response {
  if (!result.ok) return Response.json({ error: result.error }, { status: result.status });
  return Response.json(result.data);
}

export async function readClubQuery(request: NextRequest, params: Promise<{ clubId: string }>): Promise<ClubDateQuery> {
  const { clubId } = await params;
  return {
    clubId,
    from: request.nextUrl.searchParams.get("from"),
    to: request.nextUrl.searchParams.get("to"),
  };
}

export async function readPagedClubRequest(
  request: NextRequest,
  params: Promise<{ clubId: string }>,
  allowedSorts: readonly string[],
): Promise<{ ok: true; scope: ClubDateQuery; query: ParsedListQuery } | { ok: false; response: Response }> {
  const parsed = parseListQuery(readListFields(request), allowedSorts);
  if (!parsed.ok) return { ok: false, response: Response.json({ error: parsed.error }, { status: 400 }) };
  return { ok: true, scope: await readClubQuery(request, params), query: parsed.query };
}

function readListFields(request: NextRequest): ListQueryFields {
  const params = request.nextUrl.searchParams;
  return {
    q: params.get("q"),
    sort: params.get("sort"),
    dir: params.get("dir"),
    page: params.get("page"),
    pageSize: params.get("pageSize"),
  };
}
