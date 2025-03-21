import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { Dayjs } from 'dayjs';
import toolExecute from '../utils/toolExecute';
import { outputSchemaBase } from '../utils/outputSchema';
import fakeVoid from '../utils/fakeVoid';

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
        time: new Dayjs().format('YYYY-MM-DD HH:mm:ss.SSS dddd'),
      };
    }, context, 'getTimeNowTool');
  },
});
