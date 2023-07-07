import { query } from "./database.ts";
import { Counter, CounterStruct, Row } from "./schema.ts";

class Cache<T extends Row, RowStruct> {
  #type: { new (obj: RowStruct): T };
  #rows: Map<string, T>;
  #channel: BroadcastChannel;

  constructor(type: { new (obj: RowStruct): T }, channelName: string) {
    this.#type = type;
    this.#rows = new Map<string, T>();
    this.#channel = new BroadcastChannel(channelName);

    this.#channel.onmessage = (event: MessageEvent) => {
      this.#replace(new this.#type(event.data));
    };
  }

  get rows(): T[] {
    return [...this.#rows.values()];
  }

  /** Replaces a cached row if the given row is newer */
  replace(data: RowStruct) {
    const row = new this.#type(data);
    if (this.#replace(row)) {
      this.#channel.postMessage(data);
    }
  }

  #replace(row: T): boolean {
    const old = this.#rows.get(row.id);
    if (!row.replaces(old)) return false;
    this.#rows.set(row.id, row);
    return true;
  }
}

const cache = new Cache<Counter, CounterStruct>(Counter, "counter-changes");

let loading = null as Promise<Counter[]> | null;
let ready = false;

export const refresh = (): Promise<Counter[]> => {
  if (loading) {
    return loading;
  }

  loading = (async () => {
    try {
      const rs = await query(
        "select id, symbol, count from counters order by id",
      );
      for (const row of rs.rows) {
        cache.replace(row);
      }
      ready = true;
      return cache.rows;
    } finally {
      loading = null;
    }
  })();
  return loading;
};

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

export const getCounters = (): Promise<Counter[]> => {
  if (!ready) return refresh();
  return Promise.resolve(cache.rows);
};

refresh();
