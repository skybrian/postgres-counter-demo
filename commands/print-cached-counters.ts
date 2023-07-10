import "$std/dotenv/load.ts";
import { getCounters, stop } from "../lib/counters.ts";

console.log(await getCounters());
stop();
