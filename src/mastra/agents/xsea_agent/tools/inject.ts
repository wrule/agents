import { z } from 'zod';
import { createTool } from '@mastra/core/tools';
import { toolExecute } from '../utils';
import axios from 'axios';

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
      const { data } = await axios.post(
        `http://10.10.224.24:8089/api/xchaos/taskinstance/executeTask`,
        {
          taskId: {
            'CPU': '1887384229074038786',
            'MEMORY': '1887381615393501186',
          }[context.type],
          ignore: false,
        },
        {
          headers: {
            cookie:
              'sys_token=a3de603a41dc4fed9562ffe8d1e61669; sys_env_id=977046101482688512; sys_env_code=AI_DEMO; X-XSHELTER-ACCESS-TOKEN=9cf1c1b7-e9fc-4636-b0ec-3ec6ed44556c',
            ["Content-Type"]: "application/json",
          },
        },
      );
      console.log('注入接口返回', data);
      return {
        success: true,
      };
    });
  },
});
