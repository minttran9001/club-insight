import assert from "node:assert/strict";
import { test } from "node:test";
import { formatDeltaWithPercent } from "@/utils/formatDelta";

test("an increase shows the count and the percent of the previous period", () => {
  assert.equal(formatDeltaWithPercent(2, 60), "+2 (+3%)");
});

test("a decrease shows a negative percent", () => {
  assert.equal(formatDeltaWithPercent(-2, 1), "-2 (-67%)");
});

test("no change is zero percent", () => {
  assert.equal(formatDeltaWithPercent(0, 20), "0 (0%)");
});

test("a change from zero has no percent", () => {
  assert.equal(formatDeltaWithPercent(186, 186), "+186");
});

test("a missing count shows only the change", () => {
  assert.equal(formatDeltaWithPercent(4, null), "+4");
});
