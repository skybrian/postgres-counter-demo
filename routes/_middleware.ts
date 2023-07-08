import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { startLog } from "../lib/log.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  const path = new URL(req.url).pathname;
  if (path.startsWith("/_frsh/")) return ctx.next();

  const log = startLog(`${req.method} ${path}`);
  ctx.state.log = log;
  try {
    return await ctx.next();
  } finally {
    log.timeEnd();
  }
}
