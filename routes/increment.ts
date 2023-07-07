import { Handlers } from "$fresh/server.ts";
import { increment } from "../lib/counters.ts";

export const handler: Handlers = {
  async POST(req: Request) {
    const form = await req.formData();

    const id = form.get("id")?.toString();
    if (id == null) {
      throw "no id field";
    }

    try {
      await increment(id);
    } catch (e) {
      console.log(e);
    }

    const headers = new Headers();
    headers.set("location", "/");
    const response = new Response("", { status: 303, headers });
    console.log("increment done");
    return response;
  },
};
