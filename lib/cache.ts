import { startLog, TaskLog } from "./log.ts";

export interface Row {
  readonly id: string;
  /**
   * Returns true if this is a newer version of the same row, or the row
   * didn't exist before (represented as undefined).
   */
  replaces(other: Row | undefined): boolean;
}

/**
 * A cache of the rows of a table that automatically synchronizes with similar caches
 * on other servers. Any rows added to this cache will be broadcast to the other caches
 * that are subscribed to the same BroadcastChannel, and any changes they send will
 * be added to the cache.
 *
 * Also supports browser subscriptions using server-sent events.
 */
export class RowCache<T extends Row, RowStruct> {
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
      const log = startLog("channel");
      log.send(`received: ${JSON.stringify(event.data)}`);
      this.#replace(log, new this.#type(event.data));
      log.sendTime();
    };
  }

  getRow(id: string): T | undefined {
    return this.#rows.get(id);
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
   * Rows can be in any order.
   */
  makeEventStream(): ReadableStream {
    const encoder = new TextEncoder();
    const rows = () => [...this.#rows.values()];
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

  /**
   * Replaces a cached row if the given row is newer.
   * (Not called for remote changes.)
   */
  replace(log: TaskLog, data: RowStruct) {
    const row = new this.#type(data);
    if (this.#replace(log, row)) {
      log.send(`sending to channel: ${JSON.stringify(data)}`);
      this.#channel.postMessage(data);
    } else {
      log.send("row already cached");
    }
  }

  /** Stops listening for remote changes. */
  close() {
    this.#channel.close();
  }

  /**
   * Replaces a cached row if the given row is newer.
   * (Called for local and remote changes.)
   */
  #replace(log: TaskLog, row: T): boolean {
    const old = this.#rows.get(row.id);
    if (!row.replaces(old)) return false;

    this.#rows.set(row.id, row);
    this.#notify(log, row);

    return true;
  }

  #notify(log: TaskLog, row: T) {
    const subs = this.#subscribers;
    if (subs.length == 0) return;

    this.#subscribers = [];
    log.send(`notifying ${subs.length} subscribers`);
    for (const sub of subs) {
      sub(row);
    }
  }
}
