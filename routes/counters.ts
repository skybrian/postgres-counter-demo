import { Handlers } from "$fresh/server.ts";
import { getChanges } from "../lib/counters.ts";

export const handler: Handlers = {
  GET(_req: Request): Response {
    return new Response(getChanges(), {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
};
