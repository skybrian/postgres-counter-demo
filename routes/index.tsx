import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

// We need to use an alternative URL because npm modules aren't on deno deploy yet
// See: https://github.com/denoland/deploy_feedback/issues/314
import { Pool } from 'https://esm.sh/@neondatabase/serverless';

interface Counter {
    key: string,
    count: number
}

export const handler: Handlers = {
    async GET(_, ctx: HandlerContext) {
        const pool = new Pool({ connectionString: Deno.env.get("DATABASE_URL") });
        try {
            const rs = await pool.query('SELECT key, count from counters');
            return ctx.render(rs.rows);
        } finally {
            await pool.end();
        }    
    },
  };

export default function FrontPage({ data }: PageProps<Counter[]>) {

    return (
        <>
            <Head>
                <title>Postgres counter demo</title>
            </Head>
            <div>
                <h1>Postgres counter demo</h1>

                {data ? data.map((row) => (
                    <div key={row.key}>{row.key} {row.count}</div>
                )) : "unable to load counters"}
            </div>
        </>
    );
}