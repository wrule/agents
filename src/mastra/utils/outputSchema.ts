import { z } from 'zod';

const outputSchema = () => {
  const result = {
    success: z.boolean().describe('调用是否成功'),
    prompt: z.string().optional().describe('向用户解释调用结果以及下一步操作的prompt'),
  };
  return result;
};

export default outputSchema;
