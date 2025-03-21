import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import dayjs from 'dayjs';
import toolExecute from '../utils/toolExecute';

export const getTimeNowTool = createTool({
  id: 'get-time-now',
  description: `
当需要直接或间接获取当前时间，调用此工具
  `.trim(),
  inputSchema: z.object({
    a: z.number().min(0).max(1).describe('随机数，0或1'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果以及下一步操作的prompt'),
    time: z.string().describe('当前时间').optional(),
  }),
  execute: async ({ context }) => {
    return await toolExecute(async (context) => {
      return {
        success: true,
        time: dayjs().format('YYYY-MM-DD HH:mm:ss.SSS dddd'),
      };
    }, context, 'get-time-now');
  },
});
