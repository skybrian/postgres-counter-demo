import { Handlers } from "$fresh/server.ts";
import { increment } from "../lib/counters.ts";

export const handler: Handlers = {
  async POST(req: Request) {
    const form = await req.formData();

    const id = form.get("id")?.toString();
    if (id == null) {
      throw "no id field";
    }

    await increment(id);

    const headers = new Headers();
    headers.set("location", "/");
    return new Response("", { status: 303, headers });
  },
};
