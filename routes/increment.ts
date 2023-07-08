import { Handlers } from "$fresh/server.ts";
import { increment } from "../lib/counters.ts";
import { LogContext } from "../lib/log.ts";

export const handler: Handlers = {
  async POST(req: Request, ctx) {
    const form = await req.formData();

    const id = form.get("id")?.toString();
    if (id == null) {
      throw "no id field";
    }

    const log = ctx.state.log as LogContext;
    try {
      log.send("calling increment");
      await increment(log, id);
      log.send("increment finished");
    } catch (e) {
      log.send(e);
    }

    const headers = new Headers();
    headers.set("location", "/");
    return new Response("", { status: 303, headers });
  },
};
