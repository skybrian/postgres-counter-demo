import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { Head, asset } from "$fresh/runtime.ts";

import { query } from "../lib/database.ts";
import { Counter } from "../lib/schema.ts";

export const handler: Handlers = {
    async GET(_, ctx: HandlerContext) {
        const rs = await query('select key, symbol, count from counters order by key');
        return ctx.render(rs.rows);
    }
  };

export default function renderPage({ data }: PageProps<Counter[]>) {
    return (
        <>
            <Head>
                <title>Postgres counter demo!</title>
                <link rel="stylesheet" href={asset("/global.css")}/>
            </Head>
            <div>
                <h1>Postgres counter demo</h1>

                {data ? renderForm(data) : "unable to load counters"}
            </div>
        </>
    );
}

const renderForm = (rows: Counter[]) =>
    <form class="buttons" method="POST" action="/increment">{rows.map(renderButton)}</form>

const renderButton = (c: Counter) =>
    <button name="button" value={c.key}>{c.count} {c.symbol}</button>
