// Neon's database driver is an npm module. This complicates things for Deno.

// We need to use an alternative URL for deno-deploy because it doesn't support npm: URL's yet.
// See: https://github.com/denoland/deploy_feedback/issues/314

// Type definitions aren't always imported for the esm URL, so we need to declare types more often.
// Switching to the npm: URL temporarly can help.

import { Pool, QueryResult } from "https://esm.sh/@neondatabase/serverless";
// import { Pool, QueryResult } from 'npm:@neondatabase/serverless';

let cachedPool = null as (Pool | null);

const getPool = (): Pool => {
  if (cachedPool != null) return cachedPool;

  const url = Deno.env.get("DATABASE_URL");
  if (url == null) throw "need to set DATABASE_URL environment variable";

  cachedPool = new Pool({ connectionString: url });
  return cachedPool;
};

export const query = async (
  sql: string,
  params?: unknown[],
): Promise<QueryResult> => {
  return await getPool().query(sql, params);
};

export const disconnect = async (): Promise<void> => {
  if (cachedPool != null) {
    await cachedPool.end();
    cachedPool = null;
  }
};
