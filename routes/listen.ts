import { Handlers } from "$fresh/server.ts";
import { makeCounterStream } from "../lib/counterChannel.ts";

export const handler: Handlers = {
  GET(_req: Request): Response {
    return new Response(makeCounterStream(), {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
      },
    });
  },
};
