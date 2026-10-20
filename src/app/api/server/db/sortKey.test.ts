import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { parseCsv } from "../../../../../scripts/csv.ts";
import { viSortKey, type SortKeyMode } from "@/app/api/server/db/sortKey";

const players = parseCsv(fs.readFileSync(path.join(process.cwd(), "src/data/players.csv"), "utf8")).map((row) => row.name);
const titles = parseCsv(fs.readFileSync(path.join(process.cwd(), "src/data/sessions.csv"), "utf8")).map((row) => row.title);
const clubs = parseCsv(fs.readFileSync(path.join(process.cwd(), "src/data/clubs.csv"), "utf8")).map((row) => row.name);
const samples = [...new Set([...players, ...titles, ...clubs, "Recorded", "Not recorded", "Unknown", "ab", "á", "àb", "áb"])];

test("Vietnamese sort keys match localeCompare", () => {
  assertSameOrder(samples, "full");
  assertSameOrder(samples, "base");
});

function assertSameOrder(values: string[], mode: SortKeyMode) {
  const options = mode === "base" ? { sensitivity: "base" as const } : undefined;
  for (let left = 0; left < values.length; left += 1) {
    for (let right = left + 1; right < values.length; right += 1) {
      const locale = Math.sign(values[left].localeCompare(values[right], "vi", options));
      const keyed = compareKeys(viSortKey(values[left], mode), viSortKey(values[right], mode));
      assert.equal(keyed, locale, `${mode} ${JSON.stringify(values[left])} vs ${JSON.stringify(values[right])}`);
    }
  }
}

function compareKeys(left: string, right: string): number {
  if (left < right) return -1;
  if (left > right) return 1;
  return 0;
}
