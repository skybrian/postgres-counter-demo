import { CircularBuffer, SKIPPED } from "./async.ts";

/**
 * TaskLog is a logger for reporting progress associated with a task or subtask.
 *
 * Tasks and subtasks form a tree. They run concurrently, so their
 * log messages are intermixed.
 *
 * Log messages are numbered to show the relationship between a task
 * and its messages. (It also to makes it easier to see if any messages go missing.)
 * For example, 1.2.3 is the third message by subtask 1.2. Subtask 1.2
 * is the second subtask created by task 1, which was the first task
 * that started a task log.
 *
 * Each task also has a label, which appears as a prefix for its own messages,
 * but not those of any subtasks.
 *
 * When a new subtask starts, this is indicated by a log message with the
 * labels of both the parent and child tasks.
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

  /** Sends a message to this task's log. */
  send(msg: unknown) {
    this.#sendLine("", msg);
  }

  /** Sends the elapsed time in milliseconds since this task started, optionally followed by a message. */
  sendTime(msg?: unknown) {
    const elapsed = Math.ceil(performance.now() - this.#startTime);
    this.#sendLine(` at ${elapsed} ms`, msg);
  }

  /**
   * Starts a new log for a subtask.
   * Logs a message indicating the start of the task.
   *
   * @param label included in the prefix for each of this tasks's log messages.
   * @param msg optional suffix for the subtask's first message.
   */
  startChild(label: string): TaskLog {
    this.send(label);
    return new TaskLog(`${this.#path}${this.#messageCount}.`, ` ${label}`);
  }

  #sendLine(suffix: string, msg: unknown) {
    let line = `${this.#path}${++this.#messageCount}${this.#label}${suffix}`;
    if (msg instanceof Error) {
      msg = (msg as Error).stack ?? msg;
    }
    if (msg) {
      line += `: ${msg}`;
    }
    logBuffer.push(line);
    console.log(line);
  }
}

/**
 * Creates a logger for reporting progress associated with a new top-level task.
 * (For example, a web request.)
 *
 * Also logs a message indicating the start of the task.
 *
 * @param label included in the prefix for each of this task's log messages (but not subtasks).
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
