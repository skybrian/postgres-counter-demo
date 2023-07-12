import "$std/dotenv/load.ts";
import { loadCounters } from "../lib/counters.ts";

const counters = await loadCounters();
console.log(counters.all());

counters.disconnect();
