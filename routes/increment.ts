import { Handlers } from "$fresh/server.ts";
import { query } from "../lib/database.ts";

export const handler: Handlers = {
    async POST(req: Request) {
        const form = await req.formData();
        const key = form.get("button")?.toString();

        await query('update counters set count = count+1 where key=$1', [key]);

        const headers = new Headers();
        headers.set("location", "/");
        return new Response(null, {status: 303, headers});
    }
};
