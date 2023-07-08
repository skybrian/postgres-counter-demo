import { assertEquals } from "$std/testing/asserts.ts";

import { CircularBuffer, SKIPPED } from "../lib/async.ts";

Deno.test("single-item buffer works when it never blocks", async () => {
  const buf = new CircularBuffer(1);
  const it = buf[Symbol.asyncIterator]();
  for (let i = 0; i < 5; i++) {
    buf.push(i);
    assertEquals((await it.next()).value, i);
  }
});

Deno.test("single-item buffer works when it always blocks", async () => {
  const buf = new CircularBuffer(1);
  const it = buf[Symbol.asyncIterator]();
  for (let i = 0; i < 5; i++) {
    const next = it.next();
    buf.push(i);
    assertEquals((await next).value, i);
  }
});

Deno.test("single-item buffer works when skipping", async () => {
  const buf = new CircularBuffer(1);
  const it = buf[Symbol.asyncIterator]();
  for (let i = 0; i < 5; i++) {
    const next = it.next();
    buf.push("should skip");
    buf.push(i);
    assertEquals((await next).value, SKIPPED);
    assertEquals((await it.next()).value, i);
  }
});
