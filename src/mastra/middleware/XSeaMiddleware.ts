import { Context, Next } from 'hono';

export
type HonoMiddleware = (ctx: Context, next: Next) => any;

const XSeaMiddleware: HonoMiddleware = async (ctx: Context, next: Next) => {
  try {
    const body = await ctx.req.json();
    return ctx.json(body);
  } catch (error: any) {
    const code = 500;
    return ctx.json({ code, message: error.message ?? '未知错误' }, code);
  }
}

export default XSeaMiddleware;
