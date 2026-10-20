import assert from "node:assert/strict";
import { test } from "node:test";
import { dateKey, orderedRange, parseDateKey, rangeLabel } from "@/utils/dateRangeField";

test("a calendar day keeps the local year, month, and day", () => {
  const key = dateKey(new Date(2026, 9, 6));
  assert.equal(key, "2026-10-06");
  const parsed = parseDateKey(key);
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 9);
  assert.equal(parsed.getDate(), 6);
});

test("an earlier end day swaps to the front of the range", () => {
  assert.deepEqual(orderedRange(new Date(2026, 9, 20), new Date(2026, 9, 12)), {
    from: "2026-10-12",
    to: "2026-10-20",
  });
});

test("the same day is a one-day range", () => {
  assert.deepEqual(orderedRange(new Date(2026, 9, 6), new Date(2026, 9, 6)), {
    from: "2026-10-06",
    to: "2026-10-06",
  });
});

test("a missing end shows Choose dates", () => {
  assert.equal(rangeLabel("2026-10-06", null), "Choose dates");
  assert.equal(rangeLabel("2026-09-07", "2026-10-04"), "7 Sep 2026 – 4 Oct 2026");
});
