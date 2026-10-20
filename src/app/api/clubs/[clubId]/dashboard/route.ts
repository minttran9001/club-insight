import type { NextRequest } from "next/server";
import { jsonResult, readClubQuery } from "@/app/api/server/http";
import { getDashboard } from "@/app/api/server/services/dashboardService";

export async function GET(request: NextRequest, { params }: { params: Promise<{ clubId: string }> }) {
  const scope = await readClubQuery(request, params);
  const result = await getDashboard(scope);
  return jsonResult(result);
}
