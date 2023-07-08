import { Handlers } from "$fresh/server.ts";
import { makeLogStream } from "../lib/log.ts";

export const handler: Handlers = {
  GET(_req: Request): Response {
    return new Response(makeLogStream(), {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
};
