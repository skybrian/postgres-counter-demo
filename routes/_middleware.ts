import { MiddlewareHandlerContext } from "$fresh/server.ts";
import { startLog } from "../lib/log.ts";

export async function handler(
  req: Request,
  ctx: MiddlewareHandlerContext,
) {
  if (ctx.destination != "route") {
    return ctx.next();
  }

  const path = new URL(req.url).pathname;
  const log = startLog(`${req.method} ${path}`);

  ctx.state.log = log;

  try {
    const response = await ctx.next();
    if (response.status == 200) {
      log.sendTime();
    } else {
      log.sendTime(`- status: ${response.status}`);
    }
    return response;
  } catch (e) {
    log.send(e);
    log.sendTime("- failed (status: 500)");
    return new Response("That didn't work. (See log.)", { status: 500 });
  }
}
