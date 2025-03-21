import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import toolExecute from '../utils/toolExecute';
import { outputSchemaBase } from '../utils/outputSchema';
import fakeVoid from '../utils/fakeVoid';
import { format } from 'date-fns';

export const getTimeNowTool = createTool({
  id: 'getTimeNowTool',
  description: `
当需要直接或间接获取当前时间，调用此工具
  `.trim(),
  inputSchema: fakeVoid,
  outputSchema: z.object({
    ...outputSchemaBase,
    time: z.string().describe('当前时间').optional(),
  }),
  execute: async ({ context }) => {
    return await toolExecute(async (context) => {
      return {
        success: true,
        time: format(new Date(), 'yyyy-MM-dd HH:mm:ss.SSS EEEE'),
      };
    }, context, 'getTimeNowTool');
  },
});
