import assert from "node:assert/strict";
import { test } from "node:test";
import { rowHeightPx, virtualRange } from "@/components/Table/virtualRange";

test("the top of a long table starts at the first row", () => {
  const range = virtualRange(0, rowHeightPx * 10, 100);
  assert.equal(range.start, 0);
  assert.ok(range.end > 10);
  assert.ok(range.end < 100);
});

test("scrolling down moves the window and keeps rows above and below", () => {
  const range = virtualRange(rowHeightPx * 40, rowHeightPx * 10, 100);
  assert.ok(range.start > 0);
  assert.ok(range.start < 40);
  assert.ok(range.end > 50);
  assert.ok(range.end < 100);
});

test("the window stops at the last row", () => {
  const range = virtualRange(rowHeightPx * 95, rowHeightPx * 10, 100);
  assert.equal(range.end, 100);
  assert.ok(range.start < 100);
});

test("an empty table has an empty window", () => {
  assert.deepEqual(virtualRange(0, 400, 0), { start: 0, end: 0 });
});
