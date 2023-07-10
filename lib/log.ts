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
      this.send(`${elapsed} ms ${msg}`);
    } else {
      this.send(`${elapsed} ms`);
    }
  }

  /**
   * Starts a new log for a subtask.
   * Logs a message indicating the start of the task.
   *
   * @param label included in the prefix for each of this tasks's log messages.
   * @param msg optional suffix for the subtask's first message.
   */
  startChild(label: string, msg?: string): TaskLog {
    if (msg) {
      this.send(`${label} ${msg}`);
    } else {
      this.send(label);
    }
    return new TaskLog(`${this.#path}${this.#messageCount}.`, ` ${label}`);
  }
}

/**
 * Creates a logger for reporting progress associated with a new top-level task.
 * (For example, a web request.)
 * Logs a message indicating the start of the task.
 * Each task is given a unique number that will appear at the beginning
 * of each log message from that task (including subtasks).
 *
 * @param label included in the prefix for each of this task's log messages.
 * @param msg optional suffix for the task's first message.
 */
export const startLog = (label: string, msg?: string): TaskLog => {
  return root.startChild(label, msg);
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
