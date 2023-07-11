/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";

import { startLog } from "./lib/log.ts";
import { configureMiddleware } from "./routes/_middleware.ts";
import { loadCounters } from "./lib/counters.ts";

const log = startLog("startup");
configureMiddleware(await loadCounters(log));
log.sendTime("done");

await start(manifest);
