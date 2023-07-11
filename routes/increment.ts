import { Handlers } from "$fresh/server.ts";
import { Counters } from "../lib/counters.ts";
import { TaskLog } from "../lib/log.ts";

export const handler: Handlers = {
  async POST(req: Request, ctx) {
    const form = await req.formData();

    const id = form.get("id")?.toString();
    if (id == null) {
      throw "no id field";
    }

    const log = ctx.state.log as TaskLog;
    const counters = ctx.state.counters as Counters;
    try {
      await counters.increment(log, id);
    } catch (e) {
      log.send(e);
      throw e;
    }

    const headers = new Headers();
    headers.set("location", "/");
    return new Response("", { status: 303, headers });
  },
};
