import assert from "node:assert/strict";
import { test } from "node:test";
import { OpenList } from "@/types/dashboard";
import { sameList, sameListScope, sameRange, type ListKey } from "@/utils/viewState";

const range = { clubId: "club-001", from: "2026-09-07", to: "2026-10-04" };
const key: ListKey = { ...range, open: OpenList.sessions, q: "", sort: null, dir: null, page: 1, pageSize: 25 };

test("ranges match only when club, from and to all match", () => {
  assert.equal(sameRange(range, { ...range }), true);
  assert.equal(sameRange(range, { ...range, clubId: "club-002" }), false);
  assert.equal(sameRange(range, { ...range, from: "2026-09-08" }), false);
  assert.equal(sameRange(range, { ...range, to: "2026-10-05" }), false);
});

test("a list scope ignores search, sort and page but not the list type", () => {
  const searched: ListKey = { ...key, q: "x", sort: "title", dir: "asc", page: 2 };
  assert.equal(sameListScope(key, searched), true);
  assert.equal(sameListScope(key, { ...key, open: OpenList.players }), false);
  assert.equal(sameListScope(key, { ...key, from: "2026-07-13" }), false);
});

test("a list matches only when search, sort, page and page size also match", () => {
  assert.equal(sameList(key, { ...key }), true);
  for (const other of [{ ...key, q: "x" }, { ...key, sort: "title", dir: "asc" as const }, { ...key, page: 2 }, { ...key, pageSize: 10 }]) {
    assert.equal(sameList(key, other), false);
  }
});
