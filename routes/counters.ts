import { HandlerContext, Handlers } from "$fresh/server.ts";
import { Counters } from "../lib/counters.ts";

export const handler: Handlers = {
  GET(_, ctx: HandlerContext) {
    const counters = ctx.state.counters as Counters;
    return new Response(counters.getChanges(), {
      headers: {
        "content-type": "text/event-stream; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  },
};
