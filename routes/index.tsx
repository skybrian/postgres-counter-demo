import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { Head, asset } from "$fresh/runtime.ts";

import { Counter } from "../lib/schema.ts";
import CounterButton from "../islands/counter-button.tsx"
import { getCounters } from "../lib/counterCache.ts";

export const handler: Handlers = {
    async GET(_, ctx: HandlerContext) {
        return ctx.render(await getCounters());
    }
  };

export default function renderPage({ data }: PageProps<Counter[]>) {

    const renderForm = (rows: Counter[]) =>
        <div class="counters">{rows.map((c) => <CounterButton {...c}/>)}</div>

    return (
        <>
            <Head>
                <title>Postgres counter demo!</title>
                <link rel="stylesheet" href={asset("/global.css")}/>
            </Head>
            <div>
                <h1>Postgres counter demo</h1>

                {data ? renderForm(data) : "unable to load counters"}

                <p>This page is a simple demonstration of how to build an old-fashioned database-backed website
                  using the free tiers of some fairly new Internet services. (New as of 2023.)</p>

                <p>Here are the technologies I used:</p>

                <ul>
                    <li><a href="https://deno.com/deploy">Deno Deploy:</a> web hosting</li>
                    <li><a href="https://fresh.deno.dev/">Deno Fresh:</a> web framework (server-side only for this demo)</li>
                    <li><a href="https://neon.tech/">Neon:</a> Postgres database hosting</li>
                </ul>

                <p>Source is available on <a href="https://github.com/skybrian/postgres-counter-demo">Github.</a></p>
            </div>
        </>
    );
}
