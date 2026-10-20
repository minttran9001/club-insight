import { formatDay } from "@/domain/formatDay";
import type { ClubPresets } from "@/types/club";

/** Monday 5 October 2026, 09:00 in Asia/Ho_Chi_Minh. */
export const FIXED_NOW = new Date("2026-10-05T02:00:00.000Z");
import type { WeekPoint } from "@/types/dashboard";
import type { DateRange } from "@/types/range";
import type { MetricSession } from "@/types/session";

export const NO_SESSIONS_IN_RANGE = "No sessions in this range.";

const WEEKDAYS_FROM_SUNDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function localDateKey(instant: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);
  const year = part(parts, "year");
  const month = part(parts, "month");
  const day = part(parts, "day");
  return `${year}-${month}-${day}`;
}

export function formatLocalStart(startsAt: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(startsAt));
  const hour = part(parts, "hour").padStart(2, "0");
  const minute = part(parts, "minute").padStart(2, "0");
  return `${part(parts, "weekday")} ${part(parts, "day")} ${part(parts, "month")}, ${hour}:${minute}`;
}

export function comparisonLabel(from: string, to: string): string {
  return `Compared with ${formatDay(from)}–${formatDay(to)}.`;
}

export function clubHasNotHeldSession(name: string, createdAt: string): string {
  return `${name} was created on ${formatDay(createdAt)} and has not held a session yet.`;
}

function addDays(dateKey: string, days: number): string {
  const utc = Date.parse(`${dateKey}T00:00:00.000Z`) + days * 86_400_000;
  return new Date(utc).toISOString().slice(0, 10);
}

function inclusiveDayCount(from: string, to: string): number {
  const ms = Date.parse(`${to}T00:00:00.000Z`) - Date.parse(`${from}T00:00:00.000Z`);
  return Math.round(ms / 86_400_000) + 1;
}

export function previousRange(from: string, to: string): DateRange {
  const days = inclusiveDayCount(from, to);
  return { from: addDays(from, -days), to: addDays(from, -1) };
}

export function completeWeeksEnding(now: Date, timeZone: string, weeks: number): DateRange {
  const today = localDateKey(now, timeZone);
  const end = addDays(mondayOnOrBefore(today), -1);
  return { from: addDays(end, -(weeks * 7 - 1)), to: end };
}

export function allSessionsRangeFromFirstDay(now: Date, timeZone: string, firstDay: string | null): DateRange {
  const fallback = completeWeeksEnding(now, timeZone, 4);
  if (firstDay === null) return fallback;
  const from = mondayOnOrBefore(firstDay);
  if (from > fallback.to) return fallback;
  return { from, to: fallback.to };
}

export function allSessionsRange(now: Date, timeZone: string, sessions: MetricSession[]): DateRange {
  let firstDay: string | null = null;
  for (const session of sessions) {
    const start = new Date(session.startsAt);
    if (Number.isNaN(start.getTime())) continue;
    const day = localDateKey(start, timeZone);
    if (firstDay === null || day < firstDay) firstDay = day;
  }
  return allSessionsRangeFromFirstDay(now, timeZone, firstDay);
}

export function weekSpan(from: string, to: string): { first: string; last: string } {
  return { first: mondayOnOrBefore(from), last: mondayOnOrBefore(to) };
}

export function buildWeekPoints(from: string, to: string, counts: ReadonlyMap<string, number>): WeekPoint[] {
  const spanYears = from.slice(0, 4) !== to.slice(0, 4);
  const weeks: WeekPoint[] = [];
  const last = mondayOnOrBefore(to);
  for (let weekStart = mondayOnOrBefore(from); weekStart <= last; weekStart = addDays(weekStart, 7)) {
    const weekEnd = addDays(weekStart, 6);
    const partial = from > weekStart || to < weekEnd;
    const count = counts.get(weekStart) ?? 0;
    const label = spanYears ? `${weekLabel(weekStart)} ${weekStart.slice(0, 4)}` : weekLabel(weekStart);
    const text = `Week of ${formatDay(weekStart)}: ${count}${partial ? ", Partial" : ""}`;
    weeks.push({ weekStart, label, count, partial, text });
  }
  return weeks;
}

export function presetRanges(now: Date, timeZone: string, sessions: MetricSession[]): ClubPresets {
  return {
    fourWeeks: completeWeeksEnding(now, timeZone, 4),
    twelveWeeks: completeWeeksEnding(now, timeZone, 12),
    all: allSessionsRange(now, timeZone, sessions),
  };
}

function part(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((item) => item.type === type)?.value ?? "";
}

function weekdayIndex(dateKey: string): number {
  const name = new Intl.DateTimeFormat("en-US", {
    timeZone: "UTC",
    weekday: "short",
  }).format(new Date(`${dateKey}T12:00:00.000Z`));
  const index = WEEKDAYS_FROM_SUNDAY.indexOf(name);
  if (index < 0) throw new Error(`Cannot read the weekday for ${dateKey}.`);
  return index;
}

function mondayOnOrBefore(dateKey: string): string {
  const index = weekdayIndex(dateKey);
  const daysSinceMonday = index === 0 ? 6 : index - 1;
  return addDays(dateKey, -daysSinceMonday);
}

function weekLabel(weekStart: string): string {
  const [day, month] = formatDay(weekStart).split(" ");
  return `${day} ${month}`;
}
