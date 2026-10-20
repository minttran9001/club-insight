import { request } from "@/apiClient/client";
import { invalidResponse, isRecord } from "@/apiClient/helpers";
import type { DashboardReport } from "@/types/dashboard";
import type { ClubDateRange } from "@/types/range";

export async function fetchDashboard(scope: ClubDateRange, signal?: AbortSignal): Promise<DashboardReport> {
  const body = await request.get(`/api/clubs/${encodeURIComponent(scope.clubId)}/dashboard`, { from: scope.from, to: scope.to }, { signal });
  return normalizeDashboard(body);
}

function normalizeDashboard(body: unknown): DashboardReport {
  if (!isDashboard(body)) throw invalidResponse("Could not load this range.");
  return body;
}

function isDashboard(value: unknown): value is DashboardReport {
  if (!isRecord(value)) return false;
  const range = isRecord(value.range) ? value.range : null;
  const comparison = isRecord(value.comparison) ? value.comparison : null;
  const sessionsHeld = isRecord(value.sessionsHeld) ? value.sessionsHeld : null;
  const activePlayers = isRecord(value.activePlayers) ? value.activePlayers : null;
  const noShows = isRecord(value.noShows) ? value.noShows : null;
  return (
    typeof value.clubId === "string" &&
    range !== null &&
    typeof range.from === "string" &&
    typeof range.to === "string" &&
    comparison !== null &&
    typeof comparison.label === "string" &&
    typeof value.showChart === "boolean" &&
    (typeof value.message === "string" || value.message === null) &&
    sessionsHeld !== null &&
    typeof sessionsHeld.value === "number" &&
    typeof sessionsHeld.delta === "number" &&
    activePlayers !== null &&
    typeof activePlayers.value === "number" &&
    typeof activePlayers.delta === "number" &&
    noShows !== null &&
    typeof noShows.attendanceTaken === "number" &&
    typeof noShows.heldSessions === "number" &&
    (noShows.kind === "count" || noShows.kind === "unknown" || noShows.kind === "no-sessions") &&
    (typeof noShows.value === "number" || noShows.value === null) &&
    (typeof noShows.delta === "number" || noShows.delta === null) &&
    typeof value.hasHeldSession === "boolean" &&
    Array.isArray(value.weeks) &&
    value.weeks.every(isWeek)
  );
}

function isWeek(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return (
    typeof value.weekStart === "string" &&
    typeof value.label === "string" &&
    typeof value.count === "number" &&
    Number.isFinite(value.count) &&
    typeof value.partial === "boolean" &&
    typeof value.text === "string"
  );
}
