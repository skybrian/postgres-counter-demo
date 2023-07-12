import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { asset, Head } from "$fresh/runtime.ts";

import CounterButton from "../islands/counter-button.tsx";
import { getCounters } from "../lib/counters.ts";
import { LoadingScreen } from "../components/loading.tsx";

export const handler: Handlers = {
  async GET(_, ctx: HandlerContext) {
    const counters = getCounters();
    const pageFunction = counters == null ? LoadingScreen : CounterPage;
    const response = await ctx.render(pageFunction);
    response.headers.set("cache-control", "no-store");
    return response;
  },
};

// See: https://github.com/denoland/fresh/issues/1452
export default function forward(page: PageProps<(p: PageProps) => unknown>) {
  const result = page.data(page);
  return result as unknown;
}

function CounterPage(_page: PageProps) {
  const counters = getCounters();
  if (counters == null) throw "shouldn't happen";
  return (
    <>
      <Head>
        <title>Postgres counter demo!</title>
        <link rel="stylesheet" href={asset("/global.css")} />
      </Head>
      <div>
        <h1>Postgres counter demo</h1>

        <div class="counters">
          {counters.all().map((c) => <CounterButton {...c} />)}
        </div>

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
