import { query } from "./database.ts";
import { Counter, CounterStruct, Row } from "./schema.ts";

/**
 * A cache of the rows of a table that automatically synchronizes with similar caches
 * on other servers. Any rows added to this cache will be broadcast to the other caches
 * that are subscribed to the same BroadcastChannel, and any changes they send will
 * be added to the cache.
 *
 * Also supports browser subscriptions using server-sent events.
 */
class RowCache<T extends Row, RowStruct> {
  #type: { new (obj: RowStruct): T };
  #rows: Map<string, T>;
  #channel: BroadcastChannel;
  #subscribers: ((row: T) => void)[];

  constructor(type: { new (obj: RowStruct): T }, channelName: string) {
    this.#type = type;
    this.#rows = new Map<string, T>();
    this.#channel = new BroadcastChannel(channelName);
    this.#subscribers = [];

    this.#channel.onmessage = (event: MessageEvent) => {
      this.#replace(new this.#type(event.data));
    };
  }

  /** Returns each row in the cache. */
  get rows(): T[] {
    return [...this.#rows.values()];
  }

  /** Returns the next row that's added or changed in the cache (locally or remotely). */
  get nextChange(): Promise<T> {
    return new Promise((resolve, _reject) => {
      this.#subscribers.push(resolve);
    });
  }

  /**
   * Returns each row in the cache and all future changes to this cache.
   * Each row will be written as JSON with "data: " in front.
   */
  makeEventStream(): ReadableStream {
    const encoder = new TextEncoder();
    const rows = () => this.rows;
    const nextRow = () => this.nextChange;
    let done = false;

    return new ReadableStream({
      async start(controller) {
        const sendRow = (row: T) => {
          const line = `data: ${JSON.stringify(row)}\n`;
          controller.enqueue(encoder.encode(line));
        };

        rows().map(sendRow);
        while (!done) {
          sendRow(await nextRow());
        }
      },

      cancel() {
        done = true;
      },
    });
  }

  /** Replaces a cached row if the given row is newer. (Local changes only.) */
  replace(data: RowStruct) {
    const row = new this.#type(data);
    if (this.#replace(row)) {
      this.#channel.postMessage(data);
    }
  }

  /** Replaces a cached row if the given row is newer. (Local and remote changes.) */
  #replace(row: T): boolean {
    const old = this.#rows.get(row.id);
    if (!row.replaces(old)) return false;
    this.#rows.set(row.id, row);
    for (const sub of this.#subscribers) {
      sub(row);
    }
    this.#subscribers = [];
    return true;
  }
}

export const cache = new RowCache<Counter, CounterStruct>(
  Counter,
  "counter-changes",
);

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
