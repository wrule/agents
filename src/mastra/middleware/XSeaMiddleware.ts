import { Context, Next } from 'hono';
import { thttp } from '../agents/xsea_agent/api/http';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export
type HonoMiddleware = (ctx: Context, next: Next) => any;

const XSeaMiddleware: HonoMiddleware = async (ctx: Context, next: Next) => {
  try {
    const url = new URL(ctx.req.url);
    const fullPath = (url.pathname + url.search).replace(/^\/xsea\/api/, '');
    const cookie = url.searchParams.get('resourceId') ?? undefined;
    if (['GET'].includes(ctx.req.method)) {
      const res = await thttp(cookie).get(fullPath);
      return ctx.json(res.data, res.status as ContentfulStatusCode);
    } else {
      const body = await ctx.req.json();
      const res = await thttp(cookie).post(fullPath, body);
      return ctx.json(res.data, res.status as ContentfulStatusCode);
    }
  } catch (error: any) {
    const code = 500;
    return ctx.json({ code, message: error.message ?? '未知错误' }, code);
  }
}

export default XSeaMiddleware;
