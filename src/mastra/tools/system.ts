import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import dayjs from 'dayjs';

export const timeNowTool = createTool({
  id: 'get-time-now',
  description: `
当需要直接或间接获取当前时间，调用此工具
  `.trim(),
  inputSchema: z.object({
    offset: z.number().describe(`距离当前时间的偏移值`),
    unit: z.enum([
      'y', 'M', '', ''
    ]).describe('偏移值的单位'),
  }),
  outputSchema: z.object({
    time: z.string().describe('当前时间'),
  }),
  execute: async ({ context }) => {
    const now = dayjs();
    return {
      time: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS dddd'),
    };
  },
});
