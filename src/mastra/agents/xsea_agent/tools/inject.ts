import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { toolExecute } from '../utils';

export const 注入故障工具 = createTool({
  id: 'inject-fault',
  description: `
当需要 注入故障 的时候调用此工具
  `.trim(),
  inputSchema: z.object({
    type: z.enum(['CPU', 'MEMORY']).describe('故障类型，CPU或MEMORY'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('注入故障工具', context, async (context) => {
      return {
        success: true,
        prompt: '',
      };
    });
  },
});
