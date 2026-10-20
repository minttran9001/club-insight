import assert from "node:assert/strict";
import { test } from "node:test";
import { allSessionsRange } from "@/app/api/server/testSupport";

const now = new Date("2026-10-05T02:00:00.000Z");
const timeZone = "Asia/Ho_Chi_Minh";

test("All starts on the Monday of the first session even when that session was cancelled", () => {
  const range = allSessionsRange(now, timeZone, [
    {
      id: "s1",
      startsAt: "2026-08-03T02:00:00.000Z",
      status: "cancelled",
      attendanceRecorded: false,
    },
  ]);

  assert.deepEqual(range, { from: "2026-08-03", to: "2026-10-04" });
});

test("All stays on the last four complete weeks when every session is still in the future", () => {
  const range = allSessionsRange(now, timeZone, [
    {
      id: "s1",
      startsAt: "2026-10-05T03:00:00.000Z",
      status: "scheduled",
      attendanceRecorded: false,
    },
  ]);

  assert.deepEqual(range, { from: "2026-09-07", to: "2026-10-04" });
});
