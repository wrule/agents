import { z } from 'zod';
import { createTool } from '@mastra/core/tools';

export const XSea知识库查询工具 = createTool({
  id: 'query-xsea-knowledge',
  description: '当需要查询XSea使用流程，XSea相关概念，性能测试相关概念的时候，调用此工具',
  inputSchema: z.object({
    query: z.string().describe('根据当前上下文精准总结出来的XSea知识库查询语句，用于向量数据库搜索'),
  }),
  outputSchema: z.object({
    answer: z.string(),
  }),
  execute: async ({ context }) => {
    console.log('XSea知识库查询工具', context);
    return {
      answer: '请告诉用户知识库暂未接入，还在开发中',
    };
  },
});
