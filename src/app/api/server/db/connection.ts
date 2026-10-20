import Database from "better-sqlite3";
import path from "node:path";
import { formatDay } from "@/domain/formatDay";
import { foldSearchText } from "@/app/api/server/foldSearchText";
import { formatLocalStart, localDateKey } from "@/app/api/server/metrics";
import { viSortKey } from "@/app/api/server/db/sortKey";

export const databasePath = path.join(process.cwd(), "data", "insights.sqlite");

let database: InstanceType<typeof Database> | null = null;

export function openDatabase(
  filename: string,
  options?: { readonly?: boolean; fileMustExist?: boolean },
): InstanceType<typeof Database> {
  const db = new Database(filename, options);
  registerFunctions(db);
  return db;
}

export function getDatabase(): InstanceType<typeof Database> {
  if (!database) database = openDatabase(databasePath, { readonly: true, fileMustExist: true });
  return database;
}

export function withDatabase<T>(next: InstanceType<typeof Database>, run: () => T): T {
  const previous = database;
  database = next;
  try {
    return run();
  } finally {
    database = previous;
  }
}

function registerFunctions(db: InstanceType<typeof Database>) {
  db.function("fold", { deterministic: true }, foldValue);
  db.function("vi_full", { deterministic: true }, viFull);
  db.function("vi_base", { deterministic: true }, viBase);
  db.function("local_day", { deterministic: true }, localDay);
  db.function("local_start", { deterministic: true }, localStart);
  db.function("format_day", { deterministic: true }, formatDayValue);
}

function foldValue(value: unknown): string {
  return foldSearchText(text(value));
}

function viFull(value: unknown): string {
  return viSortKey(text(value), "full");
}

function viBase(value: unknown): string {
  return viSortKey(text(value), "base");
}

function localDay(instant: unknown, timeZone: unknown): string | null {
  if (typeof instant !== "string" || typeof timeZone !== "string") return null;
  const date = new Date(instant);
  if (Number.isNaN(date.getTime())) return null;
  return localDateKey(date, timeZone);
}

function localStart(instant: unknown, timeZone: unknown): string {
  if (typeof instant !== "string" || typeof timeZone !== "string") return "";
  if (Number.isNaN(new Date(instant).getTime())) return "";
  return formatLocalStart(instant, timeZone);
}

function formatDayValue(value: unknown): string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}/.test(value)) return "";
  return formatDay(value.slice(0, 10));
}

function text(value: unknown): string {
  return value == null ? "" : String(value);
}
