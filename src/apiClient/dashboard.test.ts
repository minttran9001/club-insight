import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeDashboard } from "@/apiClient/dashboard";

const payload = {
  clubId: "club-001",
  range: { from: "2026-09-07", to: "2026-10-04" },
  comparison: { from: "2026-08-10", to: "2026-09-06", label: "Compared with 10 Aug 2026–6 Sep 2026." },
  hasHeldSession: true,
  message: null,
  showChart: true,
  sessionsHeld: { value: 12, delta: 2 },
  activePlayers: { value: 30, delta: -1 },
  noShows: { kind: "count", value: 3, delta: null, attendanceTaken: 10, heldSessions: 12 },
  weeks: [{ weekStart: "2026-09-07", label: "7 Sep", count: 3, partial: false, text: "Week of 7 Sep 2026: 3" }],
};

test("a valid dashboard payload parses", () => {
  assert.deepEqual(normalizeDashboard(payload), payload);
});

test("a dashboard payload without a comparison start is rejected", () => {
  const comparison = { to: payload.comparison.to, label: payload.comparison.label };
  assert.throws(() => normalizeDashboard({ ...payload, comparison }), { message: "Could not load this range." });
});

test("a dashboard payload with a malformed week is rejected", () => {
  const weeks = [{ ...payload.weeks[0], count: "3" }];
  assert.throws(() => normalizeDashboard({ ...payload, weeks }), { message: "Could not load this range." });
});
