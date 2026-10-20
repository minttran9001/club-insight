import type { NextRequest } from "next/server";
import { jsonResult, readClubQuery } from "@/app/api/server/http";
import { getUnrecordedSessions } from "@/app/api/server/services/unrecordedSessionsService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ clubId: string }> }) {
  const scope = await readClubQuery(request, params);
  const result = await getUnrecordedSessions(scope);
  return jsonResult(result);
}
