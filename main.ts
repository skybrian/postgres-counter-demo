/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import { startLog } from "./lib/log.ts";
import { wake } from "./lib/database.ts";

{
  const log = startLog("startup");
  await wake(log, 2000);
  log.sendTime();
}

// @ts-ignore See: https://github.com/denoland/fresh/issues/1452#issuecomment-1631870112
await start(manifest);
