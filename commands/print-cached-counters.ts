import "$std/dotenv/load.ts";
import { loadCounters } from "../lib/counters.ts";
import { startLog } from "../lib/log.ts";

const log = startLog("print counters");

const counters = await loadCounters(log);
console.log(counters.all());

log.sendTime();

counters.disconnect();
