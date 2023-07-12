import { HandlerContext, Handlers } from "$fresh/server.ts";
import { loadCounters } from "../lib/counters.ts";

export const handler: Handlers = {
  async GET(_, _ctx: HandlerContext) {
    const counters = await loadCounters();
    return Promise.resolve(
      new Response(counters.getChanges(), {
        headers: {
          "content-type": "text/event-stream; charset=utf-8",
          "cache-control": "no-store",
        },
      }),
    );
  },
};
