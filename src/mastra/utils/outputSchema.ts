import { z } from 'zod';

export
const outputSchemaBase = {
  success: z.boolean().describe('调用是否成功'),
  prompt: z.string().optional().describe('向用户解释调用结果或下一步操作的prompt'),
};
