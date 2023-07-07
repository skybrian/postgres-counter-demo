import { RowCache } from "./cache.ts";
import { query } from "./database.ts";
import { Counter, CounterStruct } from "./schema.ts";

const cache = new RowCache<Counter, CounterStruct>(Counter, "counter-changes");

const rowIds = (async () => {
  const rs = await query(
    "select id, symbol, count from counters order by id",
  );

  const ids = [] as string[];
  for (const row of rs.rows) {
    cache.replace(row);
    ids.push(row.id);
  }
  return ids;
})();

export const getCounters = async (): Promise<Counter[]> => {
  const rows = [] as Counter[];

  for (const id of await rowIds) {
    const row = cache.getRow(id);
    if (!row) throw "failed to load row"; // shouldn't happen

    rows.push(row);
  }

  return rows;
};

export const getChanges = (): ReadableStream => cache.makeEventStream();

export const increment = async (id: string) => {
  const rs = await query(
    "update counters set count = count+1 where id=$1 returning id, symbol, count",
    [id],
  );
  if (rs.rowCount != 1) {
    throw `no counter incremented for '${id}'`;
  }
  cache.replace(rs.rows[0]);
};