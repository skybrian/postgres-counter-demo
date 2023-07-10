// Neon's database driver is an npm module. This complicates things for Deno.

// We need to use an alternative URL for deno-deploy because it doesn't support npm: URL's yet.
// See: https://github.com/denoland/deploy_feedback/issues/314

// Type definitions aren't always imported for the esm URL, so we need to declare types more often.
// Switching to the npm: URL temporarly can help.

import {
  FullQueryResults,
  neon,
} from "https://esm.sh/@neondatabase/serverless@0.4.26";
// import { FullQueryResults, neon } from "npm:@neondatabase/serverless@0.4.26";

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
