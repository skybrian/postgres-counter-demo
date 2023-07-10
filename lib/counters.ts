import { RowCache } from "./cache.ts";
import { query } from "./database.ts";
import { startLog, TaskLog } from "./log.ts";
import { Counter, CounterStruct } from "./schema.ts";

const cache = new RowCache<Counter, CounterStruct>(Counter, "counter-changes");

let loading: Promise<string[]> | null = null;

const load = async (): Promise<string[]> => {
  if (loading) {
    return loading;
  }

  const log = startLog("load counters");
  try {
    const rs = await query(
      "select id, symbol, count from counters order by id",
    );

    const ids = [] as string[];
    for (const row of rs.rows) {
      cache.replace(log, row as CounterStruct);
      ids.push(row.id);
    }

    log.sendTime(`${ids.length} rows`);
    return ids;
  } catch (e) {
    log.sendTime("failed");
    throw e;
  } finally {
    loading = null;
  }
};

let loaded = load();

const getRowIds = async (log: TaskLog): Promise<string[]> => {
  try {
    return await loaded;
  } catch (e) {
    log.send("Counters failed to load, retrying");
    loaded = load();
    throw e;
  }
};

export const getCounters = async (log: TaskLog): Promise<Counter[]> => {
  const rows = [] as Counter[];

  for (const id of await getRowIds(log)) {
    const row = cache.getRow(id);
    if (!row) throw "failed to load row"; // shouldn't happen

    rows.push(row);
  }

  return rows;
};

export const getChanges = (): ReadableStream => cache.makeEventStream();

export const increment = async (log: TaskLog, id: string) => {
  const rs = await query(
    "update counters set count = count+1 where id=$1 returning id, symbol, count",
    [id],
  );
  if (rs.rowCount != 1) {
    throw `no counter incremented for '${id}'`;
  }
  cache.replace(log, rs.rows[0] as CounterStruct);
};

export const stop = () => cache.close();
