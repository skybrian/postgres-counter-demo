/**
 * Indicates skipped items when iterating over a buffer.
 */
export const SKIPPED = Symbol("some items were skipped");

/**
 * FixedBuffer is a circular buffer with a fixed size.
 * It supports async iteration over the items in the buffer.
 * When the buffer is full, new items overwrite the oldest items in the buffer.
 * Any running iterators that haven't read the oldest items yet will skip them.
 *
 * @template T The type of elements in the buffer.
 */
export class FixedBuffer<T> implements AsyncIterable<T | typeof SKIPPED> {
  #buffer: T[];
  #limit: number;
  #head: number;
  #tail: number;
  #size: number;
  #pushCount: number;
  #waiters: (() => void)[];

  /**
   * Creates a new FixedBuffer.
   *
   * @param {number} limit The maximum number of items that the buffer can hold.
   */
  constructor(limit: number) {
    this.#buffer = new Array<T>(limit);
    this.#limit = limit;
    this.#head = 0;
    this.#tail = 0;
    this.#size = 0;
    this.#pushCount = 0;
    this.#waiters = [];
  }

  /**
   * Adds an item to the buffer.
   * If the buffer is full, it overwrites the oldest item in the buffer.
   *
   * @param {T} item The item to add.
   */
  push(item: T): void {
    if (this.#size === this.#limit) {
      this.#head = (this.#head + 1) % this.#limit; // Move head circularly
    } else {
      this.#size++;
    }
    this.#buffer[this.#tail] = item; // Add item at the tail
    this.#tail = (this.#tail + 1) % this.#limit; // Move tail circularly

    for (const wake of this.#waiters) {
      wake();
    }
    this.#waiters = [];
  }

  /**
   * Returns an async iterator that yields the items currently in the buffer,
   * followed by any new items pushed.
   * The iterator will never finish, because it waits forever for new items.
   *
   * Yields SKIPPED to indicate that some items were pushed but not yielded.
   * This can happen when items are pushed faster than they're read.
   */
  async *[Symbol.asyncIterator](): AsyncGenerator<
    T | typeof SKIPPED,
    void,
    unknown
  > {
    let current = 0;
    let itemIndex = this.#pushCount;
    while (true) {
      if (this.#pushCount - itemIndex > this.#size) {
        yield SKIPPED;
      }

      if (current < this.#size) {
        const index = (this.#head + current) % this.#limit;
        current++;
        itemIndex++;
        yield this.#buffer[index];
      } else {
        // Wait for a new item to be pushed
        await new Promise<void>((resolve) => this.#waiters.push(resolve));
      }
    }
  }

  toReadableStream(
    serialize: (item: T | typeof SKIPPED) => string,
  ): ReadableStream<Uint8Array> {
    const encoder = new TextEncoder();
    const it = this[Symbol.asyncIterator]();

    return new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          const result = await it.next();

          if (result.done) {
            controller.close();
          } else {
            const bytes = encoder.encode(serialize(result.value));
            controller.enqueue(bytes);
          }
        } catch (e) {
          controller.error(e);
        }
      },

      cancel() {},
    });
  }
}
