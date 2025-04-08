import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { toolExecute } from '../../xsea_agent/utils';

export const 创建任务工具 = createTool({
  id: 'create-task',
  description: `
当需要创建一个[演练任务|故障演练]的时候，调用此工具
  `.trim(),
  inputSchema: z.object({
    name: z.string().describe('演练任务名称'),
    description: z.string().describe('演练任务描述').optional(),
    validIgnore: z.boolean().describe('失效自动忽略').optional(),
    applicationInstanceUrls: z.array(z.string()).describe('需要演练的集群'),
    containerInstanceUrls: z.array(z.string()).describe('需要演练的主机列表'),
  }),
  outputSchema: z.object({
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果的prompt'),
  }),
  execute: async ({ context, resourceId: cookie }) => {
    return await toolExecute('创建目标工具', context, async (context) => {
      return {
        success: true,
      };
    });
  },
});
