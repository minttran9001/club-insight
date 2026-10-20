import assert from "node:assert/strict";
import { test } from "node:test";
import { foldSearchText } from "@/app/api/server/foldSearchText";

test("folding drops case and Vietnamese tones", () => {
  assert.equal(foldSearchText("Dương"), "duong");
});

test("folding treats đ as d", () => {
  assert.equal(foldSearchText("Đặng"), "dang");
});
