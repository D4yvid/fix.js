import { describe, expect, test } from "vitest";
import { wrap, wrapPromise } from "../src";

const NEVER_THROW_RESULT = "Data!";

async function alwaysThrow() {
  throw new Error("alwaysThrow called");
}

async function neverThrow() {
  return NEVER_THROW_RESULT;
}

const alwaysThrowSync = wrap(() => {
  throw new Error("alwaysThrowSync called!");
});

const neverThrowSync = wrap(() => {
  return NEVER_THROW_RESULT;
});

test("Wrap always throws promise", async () => {
  const [result, error] = await wrapPromise(alwaysThrow());

  expect(result).toBeNull();
  expect(error).toBeTruthy();
});

test("Wrap never throws promise", async () => {
  const [result, error] = await wrapPromise(neverThrow());

  expect(result).toBe(NEVER_THROW_RESULT);
  expect(error).toBeNull();
});

test("Wrap never throw non-async", () => {
  const [result, err] = neverThrowSync();

  expect(result).toBeTruthy();
  expect(err).toBeNull();
});

test("Wrap always throw non-async", () => {
  const [result, err] = alwaysThrowSync();

  expect(result).toBeNull();
  expect(err).toBeTruthy();
});
