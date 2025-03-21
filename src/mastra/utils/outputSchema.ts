import { z } from 'zod';

const outputSchema = (schema: Record<string, any>) => {
  const result: Record<string, any> = { };
  Object.entries(schema).forEach(([key, value]) => {
    result[key] = value.optional();
  });
  result.success = z.boolean().describe('调用是否成功');
  result.prompt = z.string().optional().describe('向用户解释调用结果以及下一步操作的prompt');
  return result;
};

export default outputSchema;
