import { z } from 'zod';
import dayjs from 'dayjs';
import { createTool } from '@mastra/core/tools';

export const 获取当前时间工具 = createTool({
  id: 'get-time-now',
  description: `
当上下文需要获取当前日期或者时间的时候，调用此工具

例子
- 开始时间是今天 -> 需要调用此工具获取今天的日期
- 结束时间是一周后 -> 需要调用此工具并且推算出一周后的日期
  `.trim(),
  inputSchema: z.object({
    format: z.string().min(1).max(25).default('YYYY-MM-DD HH:mm:ss').describe('moment.js标准的format字符串'),
  }),
  outputSchema: z.object({
    dateTimeNow: z.string().describe('当前系统时间'),
  }),
  execute: async ({ context }) => {
    const name = '获取当前时间工具';
    console.log('->', name, context);
    const result = { dateTimeNow: dayjs().format(context.format || 'YYYY-MM-DD HH:mm:ss') };
    console.log('<-', name, result);
    return result;
  },
});
