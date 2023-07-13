// Neon's database driver is an npm module. This complicates things for Deno.

// We need to use an alternative URL for deno-deploy because it doesn't support npm: URL's yet.
// See: https://github.com/denoland/deploy_feedback/issues/314

// Type definitions aren't always imported for the esm URL, so we need to declare types more often.
// Switching to the npm: URL temporarly can help.

import {
  FullQueryResults,
  neon,
} from "https://esm.sh/@neondatabase/serverless@0.5.0";
// } from "npm:@neondatabase/serverless@0.5.0";

import { TaskLog } from "./log.ts";
import { delay, TIMEOUT } from "./async.ts";

const neonQuery = (() => {
  const url = Deno.env.get("DATABASE_URL");
  if (url == null) throw "need to set DATABASE_URL environment variable";
  return neon(url, { "fullResults": true });
})();

export const query = async (
  sql: string,
  params?: unknown[],
): Promise<FullQueryResults<false>> => {
  return await neonQuery(sql, params);
};

/**
 * Sends a query to the database to wake it up. Returns true if it wakes by the timeout.
 */
export const wake = async (
  parentLog: TaskLog,
  millis = 1000,
): Promise<boolean> => {
  for (let failures = 0; failures < 2; failures++) {
    if (failures > 0) await delay(250);
    const log = parentLog.startChild(`wake`);
    try {
      const rs = query("select 1");
      const done = await Promise.race([delay(millis), rs]) != TIMEOUT;
      log.send(done ? "database is ready" : "timed out");
      if (!done) {
        rs.then((_) => log.sendTime("query returned")).catch((e) =>
          log.sendTime(e)
        );
      }
      return done;
    } catch (e) {
      log.send(e);
    }
  }

  throw "can't wake database (gave up)";
};
