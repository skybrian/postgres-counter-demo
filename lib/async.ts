/**
 * Indicates skipped items when iterating over a buffer.
 */
export const SKIPPED = Symbol("some items were skipped");

/**
 * A CircularBuffer is a buffer with a fixed size.
 * When the buffer is full, new items overwrite the oldest items in the buffer.
 * It supports async iteration over the items in the buffer and any new items pushed.
 * Any iterators that haven't read the oldest items yet will skip them.
 *
 * @template T The type of elements in the buffer.
 */
export class CircularBuffer<T> implements AsyncIterable<T | typeof SKIPPED> {
  #buffer: T[];
  #head: number; // location of oldest item
  #tail: number; // location where next item will be stored
  #size: number; // number of items in the buffer
  #pushCount: number; // number of items ever pushed
  #waiters: (() => void)[];

  /**
   * Creates a new FixedBuffer.
   *
   * @param {number} limit The maximum number of items that the buffer can hold.
   */
  constructor(limit: number) {
    if (limit < 1) throw Error(`invalid limit: ${limit}`);
    this.#buffer = new Array<T>(limit);
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
    const limit = this.#buffer.length;
    if (this.#size === limit) {
      this.#head = (this.#head + 1) % limit; // Move head circularly
    } else {
      this.#size++;
    }
    this.#buffer[this.#tail] = item; // Add item at the tail
    this.#tail = (this.#tail + 1) % limit; // Move tail circularly
    this.#pushCount++;

    this.#waiters.map((wake) => wake());
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
    let itemsDone = this.#pushCount - this.#size;
    while (true) {
      const todo = this.#pushCount - itemsDone;

      if (todo == 0) {
        // wait for a new item to be pushed
        await new Promise<void>((resolve) => this.#waiters.push(resolve));
      } else if (todo > this.#size) {
        // fell too far behind
        yield SKIPPED;
        itemsDone = this.#pushCount - this.#size;
      } else {
        const index = (this.#tail - todo + this.#buffer.length) %
          this.#buffer.length;
        yield this.#buffer[index];
        itemsDone++;
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
