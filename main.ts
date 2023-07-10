/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { startLog } from "./lib/log.ts";
import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

const log = startLog("lifecycle");

globalThis.addEventListener("unload", () => {
  log.sendTime("unload event");
});

globalThis.addEventListener("unhandledrejection", (e) => {
  log.send(`unhandled rejection at: ${e.promise}, reason: ${e.reason}`);
});

await start(manifest);
log.sendTime("fresh framework exited");
