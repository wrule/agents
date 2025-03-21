import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import dayjs from 'dayjs';

export const timeNowTool = createTool({
  id: 'get-time-now',
  description: `
当需要直接或间接获取当前时间，调用此工具
  `.trim(),
  inputSchema: z.object({
    a: z.number().min(0).max(1).describe('随机数，0或1'),
  }),
  outputSchema: z.object({
    time: z.string().describe('当前时间'),
  }),
  execute: async ({ context }) => {
    return {
      time: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS dddd'),
    };
  },
});
