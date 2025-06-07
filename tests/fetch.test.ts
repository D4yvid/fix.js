import { expect, test } from "vitest";
import { wrapAsync } from "../src";

const fetch = wrapAsync(globalThis.fetch);

test("Fetch http://localhost:65535", async () => {
  const [response, err] = await fetch("http://localhost:65535");

  if (err) {
    expect(response).toBeNull();
  } else {
    expect(err).toBeNull();
  }
});
