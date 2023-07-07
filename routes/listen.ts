import { Handlers } from "$fresh/server.ts";
import { cache } from "../lib/counterCache.ts";

export const handler: Handlers = {
  GET(_req: Request): Response {
    return new Response(cache.makeEventStream(), {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
      },
    });
  },
};
