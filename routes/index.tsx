import { HandlerContext, Handlers, PageProps } from "$fresh/server.ts";
import { Head } from "$fresh/runtime.ts";

// TODO: query database

interface Counter {
    key: string,
    count: number
}

const data: Counter[] = [ { key: "cherries", count: 0 }, { key: "apples", count: 0 } ];

export const handler: Handlers = {
    async GET(_, ctx: HandlerContext) {
        return await ctx.render(data);
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