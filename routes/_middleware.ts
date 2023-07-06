import { MiddlewareHandlerContext } from "$fresh/server.ts";

let requestCount = 0;

const nextLabel = (req: Request): string | null => {
  const path = new URL(req.url).pathname;
  if (path.startsWith("/_frsh/")) return null;

  return `${++requestCount} ${req.method} ${path}`;
};

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  const label = nextLabel(req);
  if (label != null) console.time(label);
  try {
    return await ctx.next();
  } finally {
    if (label != null) console.timeEnd(label);
  }
}
