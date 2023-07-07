import { Counter } from "../lib/schema.ts";

export const makeCounterStream = (): ReadableStream => {
  const channel = new BroadcastChannel("counter-changes");

  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode("connected\n"));
      channel.onmessage = (event: MessageEvent<Counter>) => {
        const bytes = new TextEncoder().encode(
          `data: ${JSON.stringify(event.data)}\n`,
        );
        controller.enqueue(bytes);
      };
    },

    cancel() {
      channel.close();
    },
  });
};
