import { expect, test } from "vitest";
import { Err, Ok, Result, hookPromiseObject } from "../src";
import { createUser, UserCreationError } from "./user.sample";

// Call this at the initialization of the program
// WARNING: This will replace the `Promise.prototype.catch` function with a custom implementation.
hookPromiseObject();

test("Test typed .catch of promises", async () => {
  hookPromiseObject();

  expect(await createUser("John Doe")).toBeTypeOf("number");

  const [result, error] = await createUser("John Doe")
    .then((value) => Ok(value))
    .catch(TypeError, () => Err("TypeError???"))
    .catch(UserCreationError, () => Err("User already created"))
    .catch(() => Err("Unknown error"));

  expect(result).toBeNull();
  expect(error).toBe("User already created");
});
