import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import dayjs from 'dayjs';

export const timeNowTool = createTool({
  id: 'get-time-now',
  description: 'Get current time',
  inputSchema: z.void(),
  outputSchema: z.string(),
  execute: async () => {
    return dayjs().format('YYYY-MM-DD HH:mm:ss');
  },
});
