import { RowCache } from "./cache.ts";
import { query } from "./database.ts";
import { startLog, TaskLog } from "./log.ts";
import { Counter, CounterStruct } from "./schema.ts";

export class Counters {
  readonly #rowIds: string[];
  readonly #cache: RowCache<Counter, CounterStruct>;

  constructor(rowIds: string[], cache: RowCache<Counter, CounterStruct>) {
    this.#rowIds = rowIds;
    this.#cache = cache;
  }

  /** Returns the current value of all counters in the cache. */
  all(): Counter[] {
    const rows = [] as Counter[];
    for (const id of this.#rowIds) {
      const row = this.#cache.getRow(id);
      if (!row) throw "failed to load row"; // shouldn't happen
      rows.push(row);
    }
    return rows;
  }

  getChanges(): ReadableStream {
    return this.#cache.makeEventStream();
  }

  async increment(log: TaskLog, id: string) {
    const rs = await query(
      "update counters set count = count+1 where id=$1 returning id, symbol, count",
      [id],
    );
    if (rs.rowCount != 1) {
      throw `no counter incremented for '${id}'`;
    }
    this.#cache.replace(log, rs.rows[0] as CounterStruct);
  }

  disconnect() {
    this.#cache.disconnect();
  }
}

let loading: Promise<Counters> | null = null;
let counters: Counters | null = null;

const load = async (): Promise<Counters> => {
  const log = startLog("load counters");
  try {
    const rs = await query(
      "select id, symbol, count from counters order by id",
    );

    const ids = [] as string[];
    const cache = new RowCache<Counter, CounterStruct>(
      Counter,
      "counter-changes",
    );
    for (const row of rs.rows) {
      cache.replace(log, row as CounterStruct);
      ids.push(row.id);
    }

    log.sendTime(`${ids.length} rows`);
    counters = new Counters(ids, cache);
    loading = null;
    return counters;
  } catch (e) {
    log.sendTime("failed");
    loading = null;
    throw e;
  }
};

/** Returns the counters once they are loaded. */
export const loadCounters = (): Promise<Counters> => {
  if (counters != null) {
    return Promise.resolve(counters);
  }
  if (!loading) {
    loading = load();
  }
  return loading;
};

/** Returns the counters or null to indicate that they are still loading. */
export const getCounters = (): Counters | null => {
  if (counters != null) {
    return counters;
  }
  if (!loading) {
    loading = load();
  }
  return null;
};
