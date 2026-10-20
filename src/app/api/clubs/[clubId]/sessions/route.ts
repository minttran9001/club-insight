import type { NextRequest } from "next/server";
import { sessionListColumns } from "@/domain/listColumns";
import { jsonResult, readPagedClubRequest } from "@/app/api/server/http";
import { getSessions } from "@/app/api/server/services/sessionsService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ clubId: string }> }) {
  const parsed = await readPagedClubRequest(
    request,
    params,
    sessionListColumns.map((column) => column.id),
  );
  if (!parsed.ok) return parsed.response;
  const result = await getSessions(parsed.scope, parsed.query);
  return jsonResult(result);
}
