import { CircularBuffer, SKIPPED } from "./async.ts";

/**
 * A logger for reporting progess associated with a task.
 */
export class TaskLog {
  #path: string;
  #label: string;
  #startTime = performance.now();
  #messageCount = 0;

  constructor(path: string, label: string) {
    this.#path = path;
    this.#label = label;
  }

  /** Sends a message to the log. */
  send(msg: unknown) {
    const line = `${this.#path}${++this.#messageCount}${this.#label}: ${msg}`;
    logBuffer.push(line);
    console.log(line);
  }

  /** Sends the elapsed time in milliseconds since the task started, optionally followed by a message. */
  sendTime(msg?: unknown) {
    const elapsed = Math.ceil(performance.now() - this.#startTime);
    if (msg) {
      this.send(`${elapsed} ms - ${msg}`);
    } else {
      this.send(`${elapsed} ms`);
    }
  }

  /** Starts a new log for a child task. */
  startChild(label: string): TaskLog {
    this.send(label);
    return new TaskLog(`${this.#path}${this.#messageCount}.`, ` ${label}`);
  }
}

/**
 * Starts a log for reporting progress associated with a new top-level task.
 * (For example, a web request.)
 * Each task is given a unique number.
 *
 * @param label a short label included in the prefix for each of this task's messages.
 */
export const startLog = (label: string): TaskLog => {
  return root.startChild(label);
};

export const makeLogStream = (): ReadableStream<Uint8Array> => {
  const serialize = (item: string | typeof SKIPPED) => {
    if (item == SKIPPED) {
      return "\n=== SKIPPED ===\n\n";
    } else {
      return `data: ${item}\n`;
    }
  };
  return logBuffer.toReadableStream(serialize);
};

const root = new TaskLog("", "");

const logBuffer = new CircularBuffer<string>(100);
