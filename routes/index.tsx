import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { asset, Head } from "$fresh/runtime.ts";

import { Counter } from "../lib/schema.ts";
import CounterButton from "../islands/counter-button.tsx";
import { Counters } from "../lib/counters.ts";

export const handler: Handlers = {
  async GET(_, ctx: HandlerContext) {
    const counters = ctx.state.counters as Counters;
    const response = await ctx.render(counters.all());
    response.headers.set("cache-control", "no-store");
    return response;
  },
};

export default function renderPage({ data }: PageProps<Counter[]>) {
  const renderForm = (rows: Counter[]) => (
    <div class="counters">{rows.map((c) => <CounterButton {...c} />)}</div>
  );

  return (
    <>
      <Head>
        <title>Postgres counter demo!</title>
        <link rel="stylesheet" href={asset("/global.css")} />
      </Head>
      <div>
        <h1>Postgres counter demo</h1>

        {data ? renderForm(data) : "unable to load counters"}

        <p>
          This page is a demonstration of how to build a database-backed website
          using the free tiers of some fairly new Internet services. (New as of
          2023.)
        </p>

        <p>Here are the technologies I used:</p>

        <ul>
          <li>
            <a href="https://deno.com/deploy">Deno Deploy:</a> web hosting
          </li>
          <li>
            <a href="https://fresh.deno.dev/">Deno Fresh:</a> web framework
          </li>
          <li>
            <a href="https://neon.tech/">Neon:</a> Postgres database hosting
          </li>
        </ul>

        <p>
          Source is available on{" "}
          <a href="https://github.com/skybrian/postgres-counter-demo">
            Github.
          </a>
        </p>
      </div>
    </>
  );
}
