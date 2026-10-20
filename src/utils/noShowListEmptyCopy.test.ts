import assert from "node:assert/strict";
import { test } from "node:test";
import { noShowCountLabel, noShowListEmptyCopy } from "@/utils/noShowListEmptyCopy";

test("an unknown no-show list says attendance was not taken", () => {
  assert.equal(noShowListEmptyCopy("unknown"), "Attendance was not taken.");
});

test("a range with no held sessions stays no-sessions in the list", () => {
  assert.equal(noShowListEmptyCopy("no-sessions"), "No sessions in this range.");
});

test("a recorded range with no absences is an empty count", () => {
  assert.equal(noShowListEmptyCopy("count"), "No counted no-shows.");
});

test("unknown and no-count use different labels", () => {
  assert.equal(noShowCountLabel("unknown", null), "Unknown");
  assert.equal(noShowCountLabel("no-sessions", null), "No count");
  assert.equal(noShowCountLabel("count", 3), "3");
});
