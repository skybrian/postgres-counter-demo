import "$std/dotenv/load.ts";
import { getCounters, stop } from "../lib/counters.ts";
import { startLog } from "../lib/log.ts";

const log = startLog("print counters");
console.log(await getCounters(log));
log.sendTime();

stop();
