import { request } from "@/apiClient/client";
import { invalidResponse, isNullableNumber, isNumber, isRecord, readItems } from "@/apiClient/helpers";
import { readKind } from "@/apiClient/no-shows";
import type { DashboardReport, WeekPoint } from "@/types/dashboard";
import type { ClubDateRange, DateRange } from "@/types/range";

const message = "Could not load this range.";

export async function fetchDashboard(scope: ClubDateRange, signal?: AbortSignal): Promise<DashboardReport> {
  const body = await request.get(`/api/clubs/${encodeURIComponent(scope.clubId)}/dashboard`, { from: scope.from, to: scope.to }, { signal });
  return normalizeDashboard(body);
}

export function normalizeDashboard(body: unknown): DashboardReport {
  if (!isRecord(body)) throw invalidResponse(message);
  const { clubId, hasHeldSession, showChart } = body;
  const summaryMessage = body.message;
  if (typeof clubId !== "string" || typeof hasHeldSession !== "boolean" || typeof showChart !== "boolean") throw invalidResponse(message);
  if (typeof summaryMessage !== "string" && summaryMessage !== null) throw invalidResponse(message);
  return {
    clubId,
    range: readRange(body.range),
    comparison: readComparison(body.comparison),
    hasHeldSession,
    message: summaryMessage,
    showChart,
    sessionsHeld: readCountDelta(body.sessionsHeld),
    activePlayers: readCountDelta(body.activePlayers),
    noShows: readNoShows(body.noShows),
    weeks: readItems(body, "weeks", readWeek, message),
  };
}

function readRange(value: unknown): DateRange {
  if (!isRecord(value) || typeof value.from !== "string" || typeof value.to !== "string") throw invalidResponse(message);
  return { from: value.from, to: value.to };
}

function readComparison(value: unknown): DashboardReport["comparison"] {
  const range = readRange(value);
  if (!isRecord(value) || typeof value.label !== "string") throw invalidResponse(message);
  return { ...range, label: value.label };
}

function readCountDelta(value: unknown): { value: number; delta: number } {
  if (!isRecord(value) || !isNumber(value.value) || !isNumber(value.delta)) throw invalidResponse(message);
  return { value: value.value, delta: value.delta };
}

function readNoShows(value: unknown): DashboardReport["noShows"] {
  if (!isRecord(value)) throw invalidResponse(message);
  const kind = readKind(value.kind);
  if (
    !kind ||
    !isNullableNumber(value.value) ||
    !isNullableNumber(value.delta) ||
    !isNumber(value.attendanceTaken) ||
    !isNumber(value.heldSessions)
  ) {
    throw invalidResponse(message);
  }
  return {
    kind,
    value: value.value,
    delta: value.delta,
    attendanceTaken: value.attendanceTaken,
    heldSessions: value.heldSessions,
  };
}

function readWeek(value: unknown): WeekPoint | null {
  if (!isRecord(value)) return null;
  if (
    typeof value.weekStart !== "string" ||
    typeof value.label !== "string" ||
    !isNumber(value.count) ||
    typeof value.partial !== "boolean" ||
    typeof value.text !== "string"
  ) {
    return null;
  }
  return {
    weekStart: value.weekStart,
    label: value.label,
    count: value.count,
    partial: value.partial,
    text: value.text,
  };
}
