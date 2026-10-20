import type { NextRequest } from "next/server";
import { playerListColumns } from "@/domain/listColumns";
import { jsonResult, readPagedClubRequest } from "@/app/api/server/http";
import { getActivePlayers } from "@/app/api/server/services/activePlayersService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ clubId: string }> }) {
  const parsed = await readPagedClubRequest(
    request,
    params,
    playerListColumns.map((column) => column.id),
  );
  if (!parsed.ok) return parsed.response;
  const result = await getActivePlayers(parsed.scope, parsed.query);
  return jsonResult(result);
}
