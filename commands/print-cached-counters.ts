import "$std/dotenv/load.ts";
import { loadCounters } from "../lib/counters.ts";

const counters = await loadCounters(5000);
if (counters == null) {
  throw "counters didn't load";
}

console.log(counters.all());
counters.disconnect();
