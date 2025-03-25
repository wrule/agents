import path from 'path';
import { z } from 'zod';
import { zerialize } from 'zodex';
import axios from 'axios';
import { Context, Next } from 'hono';

const BASE_URL = 'http://localhost:9091';

export
type HonoMiddleware = (ctx: Context, next: Next) => any;

const QACleaningMiddleware: HonoMiddleware = async (ctx: Context) => {
  try {
    let p = ctx.req.query('p');
    let n = ctx.req.query('n');
    if (ctx.req.method === 'POST') {
      const json = await ctx.req.json();
      p = p || json.p;
      n = n || json.n;
    }
    p = (p || '').trim();
    n = (n || '').trim();
    if (!p) {
      return ctx.json([]);
    }
    if (!n) {
      n = '5';
    }
    const { data } = await axios.post(path.join(BASE_URL, '/v1/chat/completions'), {
      messages: p,
      agentName: 'qa_cleaning_agent',
      output: zerialize(
        z.array(z.object({
          q: z.string().describe('问题'),
          a: z.string().describe('回答'),
          s: z.number().min(0).max(100).describe('得分'),
        })).length(Number(n)).describe('提取的问答列表')
      ),
    });
    return ctx.json(data);
  } catch (error: any) {
    const code = 500;
    return ctx.json({ code, message: error.message ?? '未知错误' }, code);
  }
}

export default QACleaningMiddleware;
