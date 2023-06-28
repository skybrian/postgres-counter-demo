import { Handlers } from "$fresh/server.ts";
import { query } from "../lib/database.ts";

const increment = async (id: string) => {
    const rs = (await query('update counters set count = count+1 where id=$1', [id]));
    if (rs.rowCount != 1) {
        console.warn(`no counter incremented for '${id}'`);
    }
}

export const handler: Handlers = {
    async POST(req: Request) {
        const form = await req.formData();
        const id = form.get("id")?.toString();

        if (id != null) {
            await increment(id);
        } else {
            console.warn("no id field");
        }

        const headers = new Headers();
        headers.set("location", "/");
        return new Response(null, {status: 303, headers});
    }
};
