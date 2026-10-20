import { jsonResult } from "@/app/api/server/http";
import { getClubs } from "@/app/api/server/services/clubsService";

export async function GET() {
  const result = await getClubs();
  return jsonResult(result);
}
