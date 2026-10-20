import type { NextRequest } from "next/server";
import { noShowListColumns } from "@/domain/listColumns";
import { jsonResult, readPagedClubRequest } from "@/app/api/server/http";
import { getNoShows } from "@/app/api/server/services/noShowsService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ clubId: string }> }) {
  const parsed = await readPagedClubRequest(
    request,
    params,
    noShowListColumns.map((column) => column.id),
  );
  if (!parsed.ok) return parsed.response;
  const result = await getNoShows(parsed.scope, parsed.query);
  return jsonResult(result);
}
