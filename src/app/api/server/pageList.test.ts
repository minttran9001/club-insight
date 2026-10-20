import assert from "node:assert/strict";
import { test } from "node:test";
import { parseListQuery } from "@/app/api/server/pageList";
import type { ListQueryFields } from "@/types/list";

const allowed = ["name"];

function query(overrides: Partial<ListQueryFields> = {}): ListQueryFields {
  return { q: null, sort: null, dir: null, page: null, pageSize: null, ...overrides };
}

test("an omitted page and page size use the defaults", () => {
  const result = parseListQuery(query(), allowed);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.query.page, 1);
  assert.equal(result.query.pageSize, 10);
  assert.equal(result.query.dir, "asc");
});

test("pageSize 50 is accepted", () => {
  const result = parseListQuery(query({ pageSize: "50" }), allowed);
  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.query.pageSize, 50);
});

test("a page that is not an integer of at least 1 fails", () => {
  const zero = parseListQuery(query({ page: "0" }), allowed);
  const fraction = parseListQuery(query({ page: "1.5" }), allowed);
  assert.equal(zero.ok, false);
  assert.equal(fraction.ok, false);
  if (zero.ok || fraction.ok) return;
  assert.equal(zero.error, "page must be an integer greater than or equal to 1.");
  assert.equal(fraction.error, "page must be an integer greater than or equal to 1.");
});

test("a pageSize outside 1 through 50 fails", () => {
  const zero = parseListQuery(query({ pageSize: "0" }), allowed);
  const tooBig = parseListQuery(query({ pageSize: "51" }), allowed);
  assert.equal(zero.ok, false);
  assert.equal(tooBig.ok, false);
  if (zero.ok || tooBig.ok) return;
  assert.equal(zero.error, "pageSize must be an integer from 1 through 50.");
  assert.equal(tooBig.error, "pageSize must be an integer from 1 through 50.");
});

test("a sort column that is not on the list fails", () => {
  const result = parseListQuery(query({ sort: "nope" }), allowed);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, "sort is not a column on this list.");
});

test("dir without sort fails", () => {
  const result = parseListQuery(query({ dir: "desc" }), allowed);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, "dir requires sort.");
});

test("dir other than asc or desc fails", () => {
  const result = parseListQuery(query({ sort: "name", dir: "up" }), allowed);
  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.error, "dir must be asc or desc.");
});
