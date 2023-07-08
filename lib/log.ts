import { CircularBuffer, SKIPPED } from "./async.ts";

export class LogContext {
  #path: string;
  #label: string;
  #startTime = performance.now();
  #messageCount = 0;

  constructor(path: string, label: string) {
    this.#path = path;
    this.#label = label;
  }

  send(msg: unknown) {
    const line = `${this.#path}${++this.#messageCount}${this.#label}: ${msg}`;
    logBuffer.push(line);
    console.log(line);
  }

  startChild(label: string): LogContext {
    this.send(label);
    return new LogContext(`${this.#path}${this.#messageCount}.`, ` ${label}`);
  }

  timeEnd() {
    const elapsed = Math.ceil(performance.now() - this.#startTime);
    this.send(`${elapsed} ms`);
  }
}

export const startLog = (label: string): LogContext => {
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

const root = new LogContext("", "");

const logBuffer = new CircularBuffer<string>(100);
